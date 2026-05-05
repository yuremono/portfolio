/**
 * legacy custom.js 第2 IIFE の TypeScript 移植（mind map + mind wobble + d3）
 */

import * as d3 from "d3";

const MINDMAP_CONTAINER_SELECTOR = ` .mindMap`;
const STYLE_MINDMAP_ID = "mindmap-inline-style";
const STYLE_WOBBLE_ID = "mindwobble-inline-style";
const SVG_FILTERS_ID = "mm-svg-filters";
const FILTER_ID = "mm-warp";

/** 最後の scroll からこの ms 経過したらスクロール終了とみなし、シミュ／wobble を再開する */
const SCROLL_SETTLE_MS = 100;

type MindMapNode = {
	element: HTMLElement;
	width: number;
	height: number;
	halfW: number;
	halfH: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	static: boolean;
	pin?: boolean;
	dispX: number;
	dispY: number;
	wobblePhaseX: number;
	wobblePhaseY: number;
	wobbleFreqX: number;
	wobbleFreqY: number;
	wobbleAmpX: number;
	wobbleAmpY: number;
	fx?: number;
	fy?: number;
	homeX: number;
	homeY: number;
	isGrid: boolean;
};

type ElWithMm = HTMLElement & {
	_mmPointerEnabled?: boolean;
	_mmCoolTimer?: ReturnType<typeof setTimeout>;
};

type MindMapContainerState = {
	sim: d3.Simulation<MindMapNode, undefined>;
	io: IntersectionObserver;
	onMouseEnter: (ev: MouseEvent) => void;
	onMouseMove: (ev: MouseEvent) => void;
	onMouseLeave: () => void;
	onMouseOver: (ev: MouseEvent) => void;
	onMouseOut: (ev: MouseEvent) => void;
	onResize: () => void;
	container: HTMLElement;
	nodes: MindMapNode[];
	setPositionRelative: boolean;
};

function getQueryRoot(root: Document | HTMLElement): ParentNode {
	return root instanceof Document ? root : root;
}

export function initMindMapRuntime(
	rootDocument: Document | HTMLElement,
): () => void {
	let isScrolling = false;
	/** 同一スクロール操作内で sim.stop() を一度だけにする（連続 scroll イベント対策） */
	let simsPausedForScroll = false;
	let scrollTimer: ReturnType<typeof setTimeout> | null = null;
	let lastResumeTime = 0;
	const mindMapStates: MindMapContainerState[] = [];
	let wobbleScrollResume: (() => void) | null = null;

	/**
	 * スクロール中は d3 シミュと mind wobble の負荷を抑える（メインスレッド・合成スクロールとの競合軽減）。
	 *
	 * 検知は scroll のみ（wheel はスクロール無しでも発火し得るため使わない）。
	 * レイヤーが重なりポインタが背後に届かない問題は、ダイアログ等の pointer-events 側で直すのが主。
	 */
	function pauseMindMapSimsOnce() {
		if (simsPausedForScroll) return;
		simsPausedForScroll = true;
		for (const st of mindMapStates) {
			st.sim.stop();
		}
	}

	function resumeScrollEffects() {
		scrollTimer = null;
		isScrolling = false;
		simsPausedForScroll = false;
		lastResumeTime = performance.now();
		for (const st of mindMapStates) {
			st.sim.restart();
		}
		wobbleScrollResume?.();
	}

	const onScrollActivity = () => {
		isScrolling = true;
		pauseMindMapSimsOnce();
		if (scrollTimer !== null) clearTimeout(scrollTimer);
		scrollTimer = setTimeout(resumeScrollEffects, SCROLL_SETTLE_MS);
	};

	window.addEventListener("scroll", onScrollActivity, { passive: true });
	// scroll はバブルしない。capture でネスト overflow のスクロールも拾う
	document.addEventListener("scroll", onScrollActivity, {
		passive: true,
		capture: true,
	});

	let mmDisplacement: SVGElement | null = null;
	let mmAnimId = 0;
	let mmCurrentScale = 0;
	let mmTargetScale = 0;

	function ensureStyles(nonCoarsePointer: boolean) {
		if (document.getElementById(STYLE_MINDMAP_ID)) return;
		const style = document.createElement("style");
		style.id = STYLE_MINDMAP_ID;
		style.textContent = `
      ${MINDMAP_CONTAINER_SELECTOR} { position: relative; transition: opacity 600ms ease; }
      ${MINDMAP_CONTAINER_SELECTOR} > * { margin: 0; }
      ${MINDMAP_CONTAINER_SELECTOR} .mindMapNode {
        position: absolute;
        will-change: transform;
        /* touch-action:none は縦スクロール等を阻害し得る */
        touch-action: pan-x pan-y;
      }
      @media (prefers-reduced-motion: reduce) {
        ${MINDMAP_CONTAINER_SELECTOR} .mindMapNode { transition: none !important; }
      }
      ${
				nonCoarsePointer
					? `${MINDMAP_CONTAINER_SELECTOR} .mindMapNode:not(.mmStatic):hover { filter: url(#${FILTER_ID}); }`
					: ""
			}
      `;
		document.head.appendChild(style);
	}

	function ensureSvgFilterForHover(nonCoarsePointer: boolean) {
		if (!nonCoarsePointer) return;
		if (document.getElementById(SVG_FILTERS_ID)) return;
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("id", SVG_FILTERS_ID);
		svg.setAttribute("width", "0");
		svg.setAttribute("height", "0");
		svg.style.position = "absolute";
		svg.style.width = "0";
		svg.style.height = "0";
		const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
		const filter = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"filter",
		);
		filter.setAttribute("id", FILTER_ID);
		filter.setAttribute("x", "-10%");
		filter.setAttribute("y", "-10%");
		filter.setAttribute("width", "120%");
		filter.setAttribute("height", "120%");

		const turbulence = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"feTurbulence",
		);
		turbulence.setAttribute("type", "fractalNoise");
		turbulence.setAttribute("baseFrequency", "0.1");
		turbulence.setAttribute("numOctaves", "2");
		turbulence.setAttribute("seed", String(Math.floor(Math.random() * 1000)));
		turbulence.setAttribute("result", "noise");

		const displacement = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"feDisplacementMap",
		);
		displacement.setAttribute("in", "SourceGraphic");
		displacement.setAttribute("in2", "noise");
		displacement.setAttribute("scale", "0");
		displacement.setAttribute("xChannelSelector", "R");
		displacement.setAttribute("yChannelSelector", "G");

		filter.appendChild(turbulence);
		filter.appendChild(displacement);
		defs.appendChild(filter);
		svg.appendChild(defs);
		document.body.appendChild(svg);
		mmDisplacement = displacement;
	}

	function ensureWobbleStyles() {
		if (document.getElementById(STYLE_WOBBLE_ID)) return;
		const style = document.createElement("style");
		style.id = STYLE_WOBBLE_ID;
		style.textContent = `
       .mindWobble { display: inline-block; will-change: transform; }
      @media (prefers-reduced-motion: reduce) {
         .mindWobble { transform: none !important; }
      }
    `;
		document.head.appendChild(style);
	}

	function delay(ms: number) {
		return new Promise<void>((res) => setTimeout(res, ms));
	}

	async function waitForFonts() {
		try {
			if (document.fonts && document.fonts.status !== "loaded") {
				await document.fonts.ready;
			}
		} catch {
			/* ignore */
		}
	}

	async function waitForImages(container: HTMLElement, timeoutMs = 1200) {
		const imgs = Array.from(container.querySelectorAll("img"));
		if (imgs.length === 0) return;
		const tasks = imgs
			.filter((img) => !(img.complete && img.naturalWidth > 0))
			.map((img) =>
				img.decode ? img.decode().catch(() => {}) : Promise.resolve(),
			);
		if (tasks.length === 0) return;
		await Promise.race([Promise.allSettled(tasks), delay(timeoutMs)]);
	}

	function snapshotChildRects(container: HTMLElement) {
		const els = Array.from(container.querySelectorAll(":scope > *"));
		return els
			.map((el) => {
				const r = el.getBoundingClientRect();
				return `${Math.round(r.width)}x${Math.round(r.height)}`;
			})
			.join("|");
	}

	async function waitForStableLayout(
		container: HTMLElement,
		maxWaitMs = 1800,
		pollMs = 80,
		stableFrames = 3,
	) {
		await waitForFonts();
		await waitForImages(container);
		let last = snapshotChildRects(container);
		let stable = 0;
		const start = performance.now();
		while (performance.now() - start < maxWaitMs) {
			await delay(pollMs);
			const cur = snapshotChildRects(container);
			if (cur === last) {
				stable++;
				if (stable >= stableFrames) return;
			} else {
				stable = 0;
				last = cur;
			}
		}
	}

	function clamp(value: number, min: number, max: number) {
		return Math.max(min, Math.min(max, value));
	}

	/** 未設定・非数は undefined（0 は有効） */
	function parseCssCustomNumber(
		style: CSSStyleDeclaration,
		name: string,
	): number | undefined {
		const raw = style.getPropertyValue(name).trim();
		if (!raw) return undefined;
		const n = parseFloat(raw);
		return Number.isFinite(n) ? n : undefined;
	}

	function dataNumberAttr(el: HTMLElement, attr: string): number | undefined {
		const raw = el.getAttribute(attr);
		if (raw == null || raw === "") return undefined;
		const n = parseFloat(raw);
		return Number.isFinite(n) ? n : undefined;
	}

	/** `.mindMap` に mindWobble と同名の CSS 変数（と data-wobble-*）で揺れを一括指定 */
	function resolveMindMapContainerWobble(container: HTMLElement): {
		ampX: number;
		ampY: number;
		freqFixed: { freqX: number; freqY: number } | null;
	} {
		const MM_AMP_LEGACY = 32;
		const WOBBLE_FALLBACK_FREQ_X = 0.0008;
		const WOBBLE_FALLBACK_FREQ_Y = 0.0006;

		const cs = getComputedStyle(container);
		const varAmp = parseCssCustomNumber(cs, "--mmWobbleAmp");
		const varAmpX = parseCssCustomNumber(cs, "--mmWobbleAmpX");
		const varAmpY = parseCssCustomNumber(cs, "--mmWobbleAmpY");
		const varFreqX = parseCssCustomNumber(cs, "--mmWobbleFreqX");
		const varFreqY = parseCssCustomNumber(cs, "--mmWobbleFreqY");

		const dAmp = dataNumberAttr(container, "data-wobble-amp");
		const dAmpX = dataNumberAttr(container, "data-wobble-amp-x");
		const dAmpY = dataNumberAttr(container, "data-wobble-amp-y");
		const dFreqX = dataNumberAttr(container, "data-wobble-freq-x");
		const dFreqY = dataNumberAttr(container, "data-wobble-freq-y");

		const hasAmpOverride =
			varAmp !== undefined ||
			varAmpX !== undefined ||
			varAmpY !== undefined ||
			dAmp !== undefined ||
			dAmpX !== undefined ||
			dAmpY !== undefined;

		let ampX: number;
		let ampY: number;
		if (!hasAmpOverride) {
			ampX = MM_AMP_LEGACY;
			ampY = MM_AMP_LEGACY;
		} else {
			const amp = varAmp ?? dAmp ?? MM_AMP_LEGACY;
			ampX = varAmpX ?? dAmpX ?? amp;
			ampY = varAmpY ?? dAmpY ?? Math.max(6, amp * 0.6);
		}

		const hasFreqOverride =
			varFreqX !== undefined ||
			varFreqY !== undefined ||
			dFreqX !== undefined ||
			dFreqY !== undefined;

		const freqFixed =
			hasFreqOverride ?
				{
					freqX: varFreqX ?? dFreqX ?? WOBBLE_FALLBACK_FREQ_X,
					freqY: varFreqY ?? dFreqY ?? WOBBLE_FALLBACK_FREQ_Y,
				}
			:	null;

		return { ampX, ampY, freqFixed };
	}

	function animateFilterScale(to: number, durationMs: number) {
		const disp = mmDisplacement;
		if (!disp) return;
		mmTargetScale = to;
		const from = mmCurrentScale;
		const start = performance.now();
		if (mmAnimId) cancelAnimationFrame(mmAnimId);
		const ease = (t: number) => 1 - (1 - t) ** 3;
		const step = (now: number) => {
			const elapsed = now - start;
			const t = clamp(elapsed / durationMs, 0, 1);
			const v = from + (mmTargetScale - from) * ease(t);
			mmCurrentScale = v;
			disp.setAttribute("scale", v.toFixed(2));
			if (t < 1) {
				mmAnimId = requestAnimationFrame(step);
			}
		};
		mmAnimId = requestAnimationFrame(step);
	}

	function initMindMapFor(
		container: HTMLElement,
	): MindMapContainerState | null {
		const prefersReduced =
			window.matchMedia &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const isCoarsePointer =
			window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

		ensureStyles(!isCoarsePointer);
		ensureSvgFilterForHover(!isCoarsePointer);

		const containerRect = container.getBoundingClientRect();
		const stageWidth = Math.max(200, containerRect.width);
		const stageHeight = Math.max(200, containerRect.height);
		const innerPadding = 24;
		let setPositionRelative = false;
		if (getComputedStyle(container).position === "static") {
			container.style.position = "relative";
			setPositionRelative = true;
		}

		const containerWobble = resolveMindMapContainerWobble(container);

		const gridRows = 10;
		const gridCols = 10;
		const innerW = stageWidth - innerPadding * 2;
		const innerH = stageHeight - innerPadding * 2;
		const cellW = innerW / gridCols;
		const cellH = innerH / gridRows;

		function centerOfCell(
			row: number,
			col: number,
			halfW: number,
			halfH: number,
		) {
			const r = Math.round(clamp(row, 1, gridRows));
			const c = Math.round(clamp(col, 1, gridCols));
			const cx = innerPadding + (c - 0.5) * cellW;
			const cy = innerPadding + (r - 0.5) * cellH;
			return {
				x: clamp(cx, innerPadding + halfW, stageWidth - innerPadding - halfW),
				y: clamp(cy, innerPadding + halfH, stageHeight - innerPadding - halfH),
			};
		}

		function getGridRC(el: Element): { row: number; col: number } | null {
			for (const cls of el.classList) {
				const m = /^mm(\d+)-(\d+)$/.exec(cls);
				if (m) {
					return { row: parseInt(m[1], 10), col: parseInt(m[2], 10) };
				}
			}
			return null;
		}

		const elements = Array.from(
			container.querySelectorAll<HTMLElement>(":scope > *"),
		);
		if (elements.length === 0) return null;

		const elementToMeasurement = new Map<
			HTMLElement,
			{ width: number; height: number }
		>();
		for (const el of elements) {
			const rect = el.getBoundingClientRect();
			elementToMeasurement.set(el, {
				width: rect.width || 80,
				height: rect.height || 24,
			});
		}

		const PIN_CLASS = "mmPin";
		const pins = elements.filter((el) => el.classList.contains(PIN_CLASS));
		const others = elements.filter((el) => !el.classList.contains(PIN_CLASS));

		others.forEach((el) => {
			el.classList.add("mindMapNode");
			el.style.left = "0px";
			el.style.top = "0px";
			const m = elementToMeasurement.get(el) || { width: 80 };
			el.style.minWidth = `${Math.ceil(m.width * 1.15)}px`;
		});

		const STATIC_CLASS = "mmStatic";

		function parseCoord(
			value: string | null,
			containerSize: number,
			halfSize: number,
		): number | null {
			if (!value) return null;
			const v = String(value).trim();
			if (v.endsWith("%")) {
				const pct = parseFloat(v);
				if (Number.isFinite(pct)) {
					return clamp(
						(pct / 100) * containerSize,
						innerPadding + halfSize,
						containerSize - innerPadding - halfSize,
					);
				}
				return null;
			}
			const px = parseFloat(v);
			if (Number.isFinite(px)) {
				return clamp(
					px,
					innerPadding + halfSize,
					containerSize - innerPadding - halfSize,
				);
			}
			return null;
		}

		const basePadding = 6;
		const initGap = 48;

		const items = others
			.map((el) => {
				const m = elementToMeasurement.get(el) || { width: 80, height: 24 };
				const w = Math.max(10, m.width);
				const h = Math.max(10, m.height);
				const halfW = w / 2;
				const halfH = h / 2;
				const isStatic = el.classList.contains(STATIC_CLASS);
				const dataX = parseCoord(el.getAttribute("data-mm-x"), stageWidth, halfW);
				const dataY = parseCoord(
					el.getAttribute("data-mm-y"),
					stageHeight,
					halfH,
				);
				const gridRC = getGridRC(el);
				const diag = Math.sqrt(halfW * halfW + halfH * halfH);
				const placeRadius =
					diag + basePadding + Math.min(24, 0.5 * diag) + initGap;
				return {
					el,
					w,
					h,
					halfW,
					halfH,
					isStatic,
					dataX,
					dataY,
					gridRC,
					placeRadius,
				};
			})
			.sort((a, b) => b.placeRadius - a.placeRadius);

		const placed: Array<{
			x: number;
			y: number;
			halfW: number;
			halfH: number;
		}> = [];
		const nodes: MindMapNode[] = [];

		for (const el of pins) {
			el.classList.add(STATIC_CLASS);
			const r = el.getBoundingClientRect();
			const cx = r.left - containerRect.left + r.width / 2;
			const cy = r.top - containerRect.top + r.height / 2;
			const halfW = Math.max(5, r.width / 2);
			const halfH = Math.max(5, r.height / 2);
			placed.push({ x: cx, y: cy, halfW, halfH });
			nodes.push({
				element: el,
				width: r.width,
				height: r.height,
				halfW,
				halfH,
				x: cx,
				y: cy,
				vx: 0,
				vy: 0,
				static: true,
				pin: true,
				dispX: cx,
				dispY: cy,
				wobblePhaseX: 0,
				wobblePhaseY: 0,
				wobbleFreqX: 0,
				wobbleFreqY: 0,
				wobbleAmpX: 0,
				wobbleAmpY: 0,
				fx: cx,
				fy: cy,
				homeX: cx,
				homeY: cy,
				isGrid: false,
			});
			el.style.transform = "none";
		}

		function randInside(w: number, h: number, halfW: number, halfH: number) {
			const x =
				Math.random() * (stageWidth - innerPadding * 2 - w) +
				(innerPadding + halfW);
			const y =
				Math.random() * (stageHeight - innerPadding * 2 - h) +
				(innerPadding + halfH);
			return { x, y };
		}

		function collides(x: number, y: number, halfW: number, halfH: number) {
			for (let i = 0; i < placed.length; i++) {
				const p = placed[i];
				const dx = Math.abs(x - p.x);
				const dy = Math.abs(y - p.y);
				const overlapX = dx < halfW + p.halfW + initGap;
				const overlapY = dy < halfH + p.halfH + initGap;
				if (overlapX && overlapY) return true;
			}
			return false;
		}

		for (const it of items) {
			let x: number;
			let y: number;
			if (it.gridRC) {
				const pos = centerOfCell(
					it.gridRC.row,
					it.gridRC.col,
					it.halfW,
					it.halfH,
				);
				x = pos.x;
				y = pos.y;
			} else if (it.dataX != null && it.dataY != null) {
				x = it.dataX;
				y = it.dataY;
			} else {
				let tries = 0;
				let pos: { x: number; y: number };
				do {
					pos = randInside(it.w, it.h, it.halfW, it.halfH);
					x = pos.x;
					y = pos.y;
					tries++;
					if (tries > 200) break;
				} while (collides(x, y, it.halfW, it.halfH));
			}

			const wf = containerWobble.freqFixed;
			const wfx =
				wf ?
					wf.freqX
				:	0.00012 + Math.random() * 0.00024;
			const wfy =
				wf ?
					wf.freqY
				:	0.0001 + Math.random() * 0.00008;
			const wax =
				it.isStatic || prefersReduced ? 0 : containerWobble.ampX;
			const way =
				it.isStatic || prefersReduced ? 0 : containerWobble.ampY;
			nodes.push({
				element: it.el,
				width: it.w,
				height: it.h,
				halfW: it.halfW,
				halfH: it.halfH,
				x,
				y,
				vx: 0,
				vy: 0,
				static: it.isStatic,
				dispX: x,
				dispY: y,
				wobblePhaseX: Math.random() * Math.PI * 2,
				wobblePhaseY: Math.random() * Math.PI * 2,
				wobbleFreqX: wfx,
				wobbleFreqY: wfy,
				wobbleAmpX: wax,
				wobbleAmpY: way,
				homeX: x,
				homeY: y,
				isGrid: Boolean(it.gridRC),
			});
			placed.push({ x, y, halfW: it.halfW, halfH: it.halfH });
		}

		nodes.forEach((n) => {
			if (n.static) {
				n.fx = n.x;
				n.fy = n.y;
			}
		});

		const rectPadding = 12;
		const rectIterations = prefersReduced ? 1 : 2;

		function rectCollisionForce(padding = 8, iterations = 1) {
			let simNodes: MindMapNode[] = [];
			function force(alpha: number) {
				for (let k = 0; k < iterations; k++) {
					for (let i = 0; i < simNodes.length; i++) {
						const a = simNodes[i];
						if (a.static) continue;
						for (let j = i + 1; j < simNodes.length; j++) {
							const b = simNodes[j];
							if (b.static) continue;
							const dx = a.x - b.x;
							const dy = a.y - b.y;
							const overlapX = a.halfW + b.halfW + padding - Math.abs(dx);
							const overlapY = a.halfH + b.halfH + padding - Math.abs(dy);
							if (overlapX > 0 && overlapY > 0) {
								if (overlapX < overlapY) {
									const sign = dx < 0 ? -1 : 1;
									const move = (overlapX / 2) * alpha;
									a.x += -sign * move;
									b.x += sign * move;
								} else {
									const sign = dy < 0 ? -1 : 1;
									const move = (overlapY / 2) * alpha;
									a.y += -sign * move;
									b.y += sign * move;
								}
							}
						}
					}
				}
			}
			force.initialize = (initNodes: MindMapNode[]) => {
				simNodes = initNodes;
			};
			return force;
		}

		const sim = d3
			.forceSimulation(nodes)
			.alpha(1)
			.alphaDecay(prefersReduced ? 0.12 : 0.03)
			.force(
				"charge",
				d3.forceManyBody<MindMapNode>().strength((d) => (d.isGrid ? -5 : -15)),
			)
			.force(
				"homeX",
				d3.forceX<MindMapNode>((d) => d.homeX).strength((d) => (d.isGrid ? 1.0 : 0.25)),
			)
			.force(
				"homeY",
				d3.forceY<MindMapNode>((d) => d.homeY).strength((d) => (d.isGrid ? 1.0 : 0.25)),
			)
			.force(
				"rectCollide",
				rectCollisionForce(rectPadding, rectIterations) as d3.Force<
					MindMapNode,
					undefined
				>,
			)
			.alphaTarget(prefersReduced ? 0 : 0.01);

		const pointer = { x: 0, y: 0, active: false };
		const pointerAttr = container.getAttribute("data-mm-pointer");
		const elWithMm = container as ElWithMm;
		elWithMm._mmPointerEnabled =
			pointerAttr === "on" || pointerAttr === "true" || pointerAttr === "1";

		const onMouseEnter = (ev: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			pointer.x = ev.clientX - rect.left;
			pointer.y = ev.clientY - rect.top;
			pointer.active = true;
			if (elWithMm._mmPointerEnabled) {
				sim.alphaTarget(0.035).restart();
			}
		};
		const onMouseMove = (ev: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			pointer.x = ev.clientX - rect.left;
			pointer.y = ev.clientY - rect.top;
			if (elWithMm._mmPointerEnabled) {
				sim.alphaTarget(0.03).restart();
				window.clearTimeout(elWithMm._mmCoolTimer);
				elWithMm._mmCoolTimer = window.setTimeout(() => {
					sim.alphaTarget(0.02);
				}, 240);
			}
		};
		const onMouseLeave = () => {
			pointer.active = false;
			if (elWithMm._mmPointerEnabled) {
				sim.alphaTarget(0.02);
			}
		};

		if (!isCoarsePointer) {
			container.addEventListener("mouseenter", onMouseEnter);
			container.addEventListener("mousemove", onMouseMove);
			container.addEventListener("mouseleave", onMouseLeave);
		}

		const pointerRadius = isCoarsePointer ? 0 : 120;
		const pointerStrength = 0.45;

		let isVisible = true;
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					isVisible = entry.isIntersecting;
					if (!isVisible) {
						animateFilterScale(0, 200);
						sim.stop();
					} else {
						sim.restart();
					}
				});
			},
			{ root: null, threshold: 0 },
		);
		io.observe(container);

		const onMouseOver = (e: MouseEvent) => {
			if (!isVisible) return;
			const t = e.target;
			if (
				t &&
				t instanceof HTMLElement &&
				t.classList.contains("mindMapNode") &&
				!t.classList.contains("mmStatic")
			) {
				animateFilterScale(8, 240);
			}
		};
		const onMouseOut = (e: MouseEvent) => {
			const t = e.target;
			if (
				t &&
				t instanceof HTMLElement &&
				t.classList.contains("mindMapNode") &&
				!t.classList.contains("mmStatic")
			) {
				animateFilterScale(0, 340);
			}
		};

		if (!isCoarsePointer) {
			container.addEventListener("mouseover", onMouseOver);
			container.addEventListener("mouseout", onMouseOut);
		}

		sim.on("tick", () => {
			// isVisible: 非表示。isScrolling: sim.stop とのレースで 1 フレーム残る場合の防御
			if (isScrolling || !isVisible) return;
			const now = performance.now();
			const timeSinceResume = now - lastResumeTime;

			if (elWithMm._mmPointerEnabled && pointer.active && isVisible) {
				for (let i = 0; i < nodes.length; i++) {
					const n = nodes[i];
					if (n.static) continue;
					const dx = n.x - pointer.x;
					const dy = n.y - pointer.y;
					const distSq = dx * dx + dy * dy;
					if (distSq > 0 && distSq < pointerRadius * pointerRadius) {
						const dist = Math.sqrt(distSq);
						const force =
							((pointerRadius - dist) / pointerRadius) * pointerStrength;
						const ux = dx / dist;
						const uy = dy / dist;
						n.vx += ux * force;
						n.vy += uy * force;
					}
				}
			}

			for (let i = 0; i < nodes.length; i++) {
				const n = nodes[i];
				const staggerDelay = i * 15;
				if (timeSinceResume < staggerDelay) continue;

				n.x = clamp(
					n.x,
					innerPadding + n.halfW,
					stageWidth - innerPadding - n.halfW,
				);
				n.y = clamp(
					n.y,
					innerPadding + n.halfH,
					stageHeight - innerPadding - n.halfH,
				);

				if (!n.static) {
					n.wobblePhaseX += n.wobbleFreqX * 16.6;
					n.wobblePhaseY += n.wobbleFreqY * 16.6;
				}

				const sinX = n.static ? 0 : Math.sin(n.wobblePhaseX) * n.wobbleAmpX;
				const sinY = n.static ? 0 : Math.sin(n.wobblePhaseY) * n.wobbleAmpY;

				const targetX = clamp(
					n.x + sinX,
					innerPadding + n.halfW,
					stageWidth - innerPadding - n.halfW,
				);
				const targetY = clamp(
					n.y + sinY,
					innerPadding + n.halfH,
					stageHeight - innerPadding - n.halfH,
				);

				const isJustResumedForNode = timeSinceResume < staggerDelay + 300;
				const smooth = prefersReduced ? 1 : isJustResumedForNode ? 0.02 : 0.06;

				if (n.static) {
					n.dispX = targetX;
					n.dispY = targetY;
				} else {
					n.dispX += (targetX - n.dispX) * smooth;
					n.dispY += (targetY - n.dispY) * smooth;
				}

				if (n.pin) {
					n.element.style.transform = "none";
				} else {
					n.element.style.transform = `translate3d(${(n.dispX - n.halfW).toFixed(2)}px, ${(n.dispY - n.halfH).toFixed(2)}px, 0)`;
				}
			}
		});

		let resizeTimer = 0;
		const onResize = () => {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				const r = container.getBoundingClientRect();
				const w = Math.max(200, r.width);
				const h = Math.max(200, r.height);
				sim.force("center", d3.forceCenter(w / 2, h / 2));
				sim.alpha(0.5).restart();
			}, 150);
		};
		window.addEventListener("resize", onResize);

		return {
			sim,
			io,
			onMouseEnter,
			onMouseMove,
			onMouseLeave,
			onMouseOver,
			onMouseOut,
			onResize,
			container,
			nodes,
			setPositionRelative,
		};
	}

	function initMindWobble(queryRoot: ParentNode): (() => void) | undefined {
		const prefersReduced =
			window.matchMedia &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		const all = Array.from(
			queryRoot.querySelectorAll<HTMLElement>(".mindWobble"),
		);
		if (all.length === 0) return undefined;

		const els = all.filter((el) => !el.closest(".mindMap"));
		if (!els.length) return undefined;

		ensureWobbleStyles();

		const isVisible = new WeakMap<Element, boolean>();
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => isVisible.set(e.target, e.isIntersecting));
			},
			{ root: null, threshold: 0 },
		);

		const items = els.map((el) => {
			io.observe(el);
			const cs = getComputedStyle(el);
			const varAmp = parseFloat(cs.getPropertyValue("--mmWobbleAmp")) || undefined;
			const varAmpX =
				parseFloat(cs.getPropertyValue("--mmWobbleAmpX")) || undefined;
			const varAmpY =
				parseFloat(cs.getPropertyValue("--mmWobbleAmpY")) || undefined;
			const varFreqX =
				parseFloat(cs.getPropertyValue("--mmWobbleFreqX")) || undefined;
			const varFreqY =
				parseFloat(cs.getPropertyValue("--mmWobbleFreqY")) || undefined;

			const dataAmp =
				parseFloat(el.getAttribute("data-wobble-amp") || "") || undefined;
			const dataAmpX =
				parseFloat(el.getAttribute("data-wobble-amp-x") || "") || undefined;
			const dataAmpY =
				parseFloat(el.getAttribute("data-wobble-amp-y") || "") || undefined;
			const dataFreqX =
				parseFloat(el.getAttribute("data-wobble-freq-x") || "") || undefined;
			const dataFreqY =
				parseFloat(el.getAttribute("data-wobble-freq-y") || "") || undefined;

			const amp = varAmp ?? dataAmp ?? 16;
			const ampX = varAmpX ?? dataAmpX ?? amp;
			const ampY = varAmpY ?? dataAmpY ?? Math.max(6, amp * 0.6);
			const freqX = varFreqX ?? dataFreqX ?? 0.0008;
			const freqY = varFreqY ?? dataFreqY ?? 0.0006;

			return {
				el,
				phaseX: Math.random() * Math.PI * 2,
				phaseY: Math.random() * Math.PI * 2,
				ampX,
				ampY,
				freqX,
				freqY,
				dispX: 0,
				dispY: 0,
			};
		});

		if (prefersReduced) {
			for (const it of items) it.el.style.transform = "none";
			return () => io.disconnect();
		}

		let rafId = 0;
		let stopped = false;

		const resumeWobble = () => {
			if (stopped || rafId !== 0) return;
			rafId = requestAnimationFrame(tick);
		};
		wobbleScrollResume = resumeWobble;

		const tick = (now: number) => {
			if (stopped) return;
			// スクロール中は RAF を張らない（sim.stop と併用。レース時の防御にもなる）
			if (isScrolling) {
				rafId = 0;
				return;
			}

			const timeSinceResume = now - lastResumeTime;

			for (let i = 0; i < items.length; i++) {
				const it = items[i];
				const vis = isVisible.get(it.el) !== false;
				if (!vis) continue;

				const staggerDelay = i * 10;
				if (timeSinceResume < staggerDelay) continue;

				it.phaseX += it.freqX * 16.6;
				it.phaseY += it.freqY * 16.6;

				const targetX = Math.sin(it.phaseX) * it.ampX;
				const targetY = Math.sin(it.phaseY) * it.ampY;

				const isJustResumedForNode = timeSinceResume < staggerDelay + 300;
				const smooth = isJustResumedForNode ? 0.02 : 0.08;

				it.dispX += (targetX - it.dispX) * smooth;
				it.dispY += (targetY - it.dispY) * smooth;

				it.el.style.transform = `translate3d(${it.dispX.toFixed(2)}px, ${it.dispY.toFixed(2)}px, 0)`;
			}
			rafId = requestAnimationFrame(tick);
		};
		rafId = requestAnimationFrame(tick);

		return () => {
			stopped = true;
			wobbleScrollResume = null;
			cancelAnimationFrame(rafId);
			io.disconnect();
			for (const it of items) {
				it.el.style.transform = "none";
			}
		};
	}

	const queryRoot = getQueryRoot(rootDocument);
	let wobbleCleanup: (() => void) | undefined;
	let disposed = false;

	void (async () => {
		wobbleCleanup = initMindWobble(queryRoot);

		queryRoot.querySelectorAll(".mindMap > br").forEach((br) => {
			br.remove();
		});

		const containers = Array.from(
			queryRoot.querySelectorAll<HTMLElement>(".mindMap"),
		);
		if (!containers.length) return;

		containers.forEach((c) => {
			c.style.opacity = "0";
		});

		for (const c of containers) {
			if (disposed) break;
			try {
				await waitForStableLayout(c);
				if (disposed) break;
				const state = initMindMapFor(c);
				if (disposed || !state) continue;
				mindMapStates.push(state);
				if (isScrolling) {
					state.sim.stop();
				}
				requestAnimationFrame(() => {
					c.style.opacity = "1";
				});
			} catch {
				c.style.opacity = "1";
			}
		}
	})();

	return () => {
		if (disposed) return;
		disposed = true;

		if (mmAnimId) cancelAnimationFrame(mmAnimId);
		mmAnimId = 0;

		window.removeEventListener("scroll", onScrollActivity);
		document.removeEventListener("scroll", onScrollActivity, { capture: true });
		if (scrollTimer !== null) clearTimeout(scrollTimer);
		wobbleScrollResume = null;

		wobbleCleanup?.();

		const states = [...mindMapStates];
		mindMapStates.length = 0;

		for (const st of states) {
			st.sim.on("tick", null);
			st.sim.stop();
			st.io.disconnect();
			st.container.removeEventListener("mouseenter", st.onMouseEnter);
			st.container.removeEventListener("mousemove", st.onMouseMove);
			st.container.removeEventListener("mouseleave", st.onMouseLeave);
			st.container.removeEventListener("mouseover", st.onMouseOver);
			st.container.removeEventListener("mouseout", st.onMouseOut);
			window.removeEventListener("resize", st.onResize);
			for (const n of st.nodes) {
				n.element.style.transform = "";
				n.element.style.left = "";
				n.element.style.top = "";
				n.element.style.minWidth = "";
				n.element.classList.remove("mindMapNode");
				if (n.pin) n.element.classList.remove("mmStatic");
			}
			const elWithMm = st.container as ElWithMm;
			window.clearTimeout(elWithMm._mmCoolTimer);
			delete elWithMm._mmPointerEnabled;
			delete elWithMm._mmCoolTimer;
			st.container.style.opacity = "";
			if (st.setPositionRelative) {
				st.container.style.position = "";
			}
		}

		mmDisplacement = null;
		document.getElementById(STYLE_MINDMAP_ID)?.remove();
		document.getElementById(STYLE_WOBBLE_ID)?.remove();
		document.getElementById(SVG_FILTERS_ID)?.remove();
	};
}
