import * as d3 from "d3";

export type MindMapRuntimeContext = {
	getIsScrolling: () => boolean;
	getLastResumeTime: () => number;
	isDisposed: () => boolean;
};

export type MindMapNode = {
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

export type MindMapContainerState = {
	sim: d3.Simulation<MindMapNode, undefined>;
	io: IntersectionObserver;
	onMouseEnter: (ev: MouseEvent) => void;
	onMouseMove: (ev: MouseEvent) => void;
	onMouseLeave: () => void;
	onResize: () => void;
	removeVideoHoverListeners: () => void;
	container: HTMLElement;
	nodes: MindMapNode[];
};

type ElWithMm = HTMLElement & {
	_mmPointerEnabled?: boolean;
	_mmCoolTimer?: ReturnType<typeof setTimeout>;
	_mmMaskTransitionTimer?: ReturnType<typeof setTimeout>;
};

type HtmlWithMm = HTMLElement & {
	_mmHtmlClassTokens?: string[];
};

type MindMapNavItem = {
	button: HTMLElement;
	target: HTMLElement;
	maskIndex: number;
	htmlClass: string | null;
};

function delay(ms: number) {
	return new Promise<void>((resolve) => setTimeout(resolve, ms));
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
		.map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()));
	if (tasks.length === 0) return;
	await Promise.race([Promise.allSettled(tasks), delay(timeoutMs)]);
}

async function waitForStableLayout(container: HTMLElement) {
	await waitForFonts();
	await waitForImages(container);
}

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

function parseCssCustomNumber(
	style: CSSStyleDeclaration,
	name: string,
): number | undefined {
	const raw = style.getPropertyValue(name).trim();
	if (!raw) return undefined;
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : undefined;
}

function parseCssTimeMs(
	style: CSSStyleDeclaration,
	name: string,
): number | undefined {
	const raw = style.getPropertyValue(name).trim();
	if (!raw) return undefined;
	if (raw.endsWith("ms")) {
		const n = parseFloat(raw);
		return Number.isFinite(n) ? n : undefined;
	}
	if (raw.endsWith("s")) {
		const n = parseFloat(raw);
		return Number.isFinite(n) ? n * 1000 : undefined;
	}
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : undefined;
}

function dataNumberAttr(el: HTMLElement, attr: string): number | undefined {
	const raw = el.getAttribute(attr);
	if (raw == null || raw === "") return undefined;
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : undefined;
}

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
		hasFreqOverride
			? {
					freqX: varFreqX ?? dFreqX ?? WOBBLE_FALLBACK_FREQ_X,
					freqY: varFreqY ?? dFreqY ?? WOBBLE_FALLBACK_FREQ_Y,
				}
			: null;

	return { ampX, ampY, freqFixed };
}

export async function initMindMapScene(
	container: HTMLElement,
	context: MindMapRuntimeContext,
): Promise<MindMapContainerState | null> {
	await waitForStableLayout(container);
	if (context.isDisposed()) return null;

	const prefersReduced =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const isCoarsePointer =
		window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
	const desktopLayoutMedia = window.matchMedia("(min-width: 1024px)");
	let usesDesktopLayout = desktopLayoutMedia.matches;

	const containerRect = container.getBoundingClientRect();
	const stageWidth = Math.max(200, containerRect.width);
	const stageHeight = Math.max(200, containerRect.height);
	const innerPadding = 24;
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

	const elements = Array.from(container.querySelectorAll<HTMLElement>(":scope > *"));
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
		el.classList.add("MindMapNode");
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
			const dataY = parseCoord(el.getAttribute("data-mm-y"), stageHeight, halfH);
			const gridRC = getGridRC(el);
			const diag = Math.sqrt(halfW * halfW + halfH * halfH);
			const placeRadius = diag + basePadding + Math.min(24, 0.5 * diag) + initGap;
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
			const pos = centerOfCell(it.gridRC.row, it.gridRC.col, it.halfW, it.halfH);
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
		const wfx = wf ? wf.freqX : 0.00012 + Math.random() * 0.00024;
		const wfy = wf ? wf.freqY : 0.0001 + Math.random() * 0.00008;
		const wax = it.isStatic || prefersReduced ? 0 : containerWobble.ampX;
		const way = it.isStatic || prefersReduced ? 0 : containerWobble.ampY;
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
	const maskClasses = ["Mask1", "Mask2", "Mask3"] as const;
	const videoClasses = ["Video1", "Video2", "Video3"] as const;
	const maskTarget = (() => {
		const prev = container.previousElementSibling;
		if (prev instanceof HTMLElement && prev.classList.contains("MindMapMask")) {
			return prev;
		}
		return container.parentElement?.querySelector<HTMLElement>(".MindMapMask") ?? null;
	})();
	const maskVideos = maskTarget
		? Array.from(maskTarget.querySelectorAll<HTMLVideoElement>(".MindMapVideo"))
		: [];
	const maskButtons = Array.from(
		container.querySelectorAll<HTMLElement>(".MindMapBtn"),
	);
	const navItems = maskButtons
		.map<MindMapNavItem | null>((button, maskIndex) => {
			const href = button.getAttribute("href");
			if (!href?.startsWith("#")) return null;
			const targetId = decodeURIComponent(href.slice(1));
			const target = button.ownerDocument?.getElementById(targetId);
			if (!(target instanceof HTMLElement)) return null;
			return {
				button,
				target,
				maskIndex,
				htmlClass: button.getAttribute("data-html-class"),
			};
		})
		.filter((item): item is MindMapNavItem => item !== null);
	const elWithMm = container as ElWithMm;
	const htmlElement = document.documentElement as HtmlWithMm;
	const maskTransitionMs = maskTarget
		? parseCssTimeMs(getComputedStyle(maskTarget), "--mmTrans")
		: undefined;
	let maskTransitionLockUntil = 0;
	let activeNavIndex = -1;
	let isMindMapSimRunning = true;

	function applyHtmlClassOverride(rawValue: string | null) {
		const previousTokens = htmlElement._mmHtmlClassTokens ?? [];
		if (previousTokens.length > 0) {
			htmlElement.classList.remove(...previousTokens);
		}

		const nextTokens = rawValue?.trim().split(/\s+/).filter(Boolean) ?? [];
		if (nextTokens.length > 0) {
			htmlElement.classList.add(...nextTokens);
		}
		htmlElement._mmHtmlClassTokens = nextTokens;
	}

	function setMindMapMaskClass(index: number) {
		if (!maskTarget) return;

		maskTarget.classList.remove(...maskClasses);
		const maskClass = maskClasses[index];
		if (maskClass) {
			maskTarget.classList.add(maskClass);
		}
	}

	function syncMindMapVideoPlayback() {
		if (!maskTarget || maskVideos.length === 0) return;

		const nextIndex = videoClasses.findIndex((videoClass) =>
			maskTarget.classList.contains(videoClass),
		);
		const activeVideoIndex =
			nextIndex === -1 ? videoClasses.length - 1 : nextIndex;

		for (const [index, video] of maskVideos.entries()) {
			if (index === activeVideoIndex) {
				if (video.paused) {
					void video.play().catch(() => {});
				}
			} else if (!video.paused) {
				video.pause();
			}
		}
	}

	function setMindMapVideoClass(index: number | null) {
		if (!maskTarget) return;

		maskTarget.classList.remove(...videoClasses);
		if (index != null) {
			const videoClass = videoClasses[index];
			if (videoClass) {
				maskTarget.classList.add(videoClass);
			}
		}
		syncMindMapVideoPlayback();
	}

	function refreshMindMapSimulation() {
		const shouldRun =
			!context.isDisposed() &&
			isVisible &&
			activeNavIndex === -1 &&
			performance.now() >= maskTransitionLockUntil;

		if (shouldRun) {
			if (!isMindMapSimRunning) {
				isMindMapSimRunning = true;
				sim.restart();
			}
			return;
		}

		if (isMindMapSimRunning) {
			isMindMapSimRunning = false;
			sim.stop();
		}
	}

	function setActiveNav(index: number, animate = true) {
		if (index === activeNavIndex) return;

		const previousIndex = activeNavIndex;
		const previousItem = navItems[previousIndex];
		const previousNode = previousItem
			? nodes.find((node) => node.element === previousItem.button)
			: undefined;
		if (previousNode && !previousNode.static) {
			previousNode.fx = undefined;
			previousNode.fy = undefined;
		}

		activeNavIndex = index;

		for (const [currentIndex, item] of navItems.entries()) {
			if (currentIndex === index) {
				item.button.setAttribute("aria-current", "location");
			} else {
				item.button.removeAttribute("aria-current");
			}
		}

		const activeItem = navItems[index];
		if (!activeItem) {
			applyHtmlClassOverride(null);
			setMindMapMaskClass(-1);
			setMindMapVideoClass(null);
			refreshMindMapSimulation();
			return;
		}

		const activeNode = nodes.find((node) => node.element === activeItem.button);
		if (activeNode && !activeNode.static) {
			activeNode.fx = activeNode.x;
			activeNode.fy = activeNode.y;
			activeNode.vx = 0;
			activeNode.vy = 0;
		}

		applyHtmlClassOverride(activeItem.htmlClass);
		setMindMapMaskClass(activeItem.maskIndex);
		setMindMapVideoClass(activeItem.maskIndex);
		refreshMindMapSimulation();

		if (animate && previousIndex !== -1) {
			lockMindMapDuringMaskTransition();
		}
	}

	function lockMindMapDuringMaskTransition() {
		if (maskTransitionMs == null) return;

		maskTransitionLockUntil = performance.now() + maskTransitionMs;
		window.clearTimeout(elWithMm._mmMaskTransitionTimer);
		refreshMindMapSimulation();
		elWithMm._mmMaskTransitionTimer = window.setTimeout(() => {
			if (context.isDisposed()) return;
			if (performance.now() < maskTransitionLockUntil) return;
			maskTransitionLockUntil = 0;
			syncMindMapMask();
			refreshMindMapSimulation();
			elWithMm._mmMaskTransitionTimer = undefined;
		}, maskTransitionMs);
	}

	for (const button of maskButtons) {
		button.removeAttribute("aria-pressed");
		button.removeAttribute("aria-current");
	}

	const videoHoverListeners = maskButtons.map((button, index) => {
		const onMouseEnter = () => {
			setMindMapVideoClass(index);
		};
		button.addEventListener("mouseenter", onMouseEnter);
		return { button, onMouseEnter };
	});

	function removeVideoHoverListeners() {
		for (const { button, onMouseEnter } of videoHoverListeners) {
			button.removeEventListener("mouseenter", onMouseEnter);
		}
		setMindMapVideoClass(null);
	}

	function syncMindMapMask() {
		if (!maskTarget || maskButtons.length === 0) return;
		if (activeNavIndex !== -1) return;

		const targetRect = maskTarget.getBoundingClientRect();

		for (let index = 0; index < maskButtons.length; index++) {
			const button = maskButtons[index];
			const rect = button.getBoundingClientRect();
			const left = rect.left - targetRect.left;
			const top = rect.top - targetRect.top;
			const width = rect.width;
			const height = rect.height;
			const suffix = `${index + 1}`;

			maskTarget.style.setProperty(`--mindmap-mask-${suffix}-left`, `${left.toFixed(2)}px`);
			maskTarget.style.setProperty(`--mindmap-mask-${suffix}-top`, `${top.toFixed(2)}px`);
			maskTarget.style.setProperty(`--mindmap-mask-${suffix}-width`, `${width.toFixed(2)}px`);
			maskTarget.style.setProperty(`--mindmap-mask-${suffix}-height`, `${height.toFixed(2)}px`);
		}
	}

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
	// 3つのアンカー先について、現在ビューポートと交差しているものだけを保持する。
	const intersectingNavIndexes = new Set<number>();
	const mmbHideTargets = Array.from(
		document.querySelectorAll<HTMLElement>(".MMBhide"),
	);
	const intersectingMmbHideTargets = new Set<Element>();
	let isMindMapButtonStopped = false;
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.target === container) {
					isVisible = entry.isIntersecting;
					return;
				}

				if (entry.target instanceof HTMLElement && entry.target.classList.contains("MMBhide")) {
					if (entry.isIntersecting) {
						intersectingMmbHideTargets.add(entry.target);
					} else {
						intersectingMmbHideTargets.delete(entry.target);
					}
					return;
				}

				const navIndex = navItems.findIndex(
					(item) => item.target === entry.target,
				);
				if (navIndex === -1) return;
				if (entry.isIntersecting) {
					intersectingNavIndexes.add(navIndex);
				} else {
					intersectingNavIndexes.delete(navIndex);
				}
			});
			// MMBhideが中央の判定線にある間は、ボタンの描画位置だけを固定する。
			isMindMapButtonStopped = intersectingMmbHideTargets.size > 0;
			for (const button of maskButtons) {
				button.classList.toggle("IsStop", isMindMapButtonStopped);
			}
			maskTarget?.classList.toggle("IsStop", isMindMapButtonStopped);
			// ID間で2要素が同時に交差する場合は、ページ上で先にある要素を採用する。
			setActiveNav(
				intersectingNavIndexes.size > 0
					? Math.min(...intersectingNavIndexes)
					: -1,
			);
		},
		{
		root: null, // 交差判定の基準。null はブラウザのビューポート。
			rootMargin: "-50% -40% ", // 判定領域を画面中央の水平線まで縮める。
			threshold: 0, // 対象要素が中央の判定線と接触する境界で発火。
		},
	);
	io.observe(container);
	for (const item of navItems) {
		io.observe(item.target);
	}
	for (const target of mmbHideTargets) {
		io.observe(target);
	}

	if (prefersReduced) {
		for (const n of nodes) {
			n.element.style.transform = "none";
		}
	}

	syncMindMapMask();
	syncMindMapVideoPlayback();

	sim.on("tick", () => {
		if (
			context.isDisposed() ||
			context.getIsScrolling() ||
			!isVisible ||
			activeNavIndex !== -1 ||
			(performance.now() < maskTransitionLockUntil)
		)
			return;
		const now = performance.now();
		const timeSinceResume = now - context.getLastResumeTime();

		if (elWithMm._mmPointerEnabled && pointer.active && isVisible) {
			for (let i = 0; i < nodes.length; i++) {
				const n = nodes[i];
				if (n.static) continue;
				const dx = n.x - pointer.x;
				const dy = n.y - pointer.y;
				const distSq = dx * dx + dy * dy;
				if (distSq > 0 && distSq < pointerRadius * pointerRadius) {
					const dist = Math.sqrt(distSq);
					const force = ((pointerRadius - dist) / pointerRadius) * pointerStrength;
					const ux = dx / dist;
					const uy = dy / dist;
					n.vx += ux * force;
					n.vy += uy * force;
				}
			}
		}

		for (let i = 0; i < nodes.length; i++) {
			const n = nodes[i];
			if (!usesDesktopLayout && maskButtons.includes(n.element)) {
				n.element.style.transform = "";
				continue;
			}
			if (isMindMapButtonStopped && maskButtons.includes(n.element)) continue;
			const activeItem = navItems[activeNavIndex];
			if (activeItem && n.element === activeItem.button) continue;
			const staggerDelay = i * 15;
			if (timeSinceResume < staggerDelay) continue;

			n.x = clamp(n.x, innerPadding + n.halfW, stageWidth - innerPadding - n.halfW);
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

		syncMindMapMask();

	});

	let resizeTimer = 0;
	const onResize = () => {
		window.clearTimeout(resizeTimer);
		resizeTimer = window.setTimeout(() => {
			const nextUsesDesktopLayout = desktopLayoutMedia.matches;
			if (nextUsesDesktopLayout !== usesDesktopLayout) {
				usesDesktopLayout = nextUsesDesktopLayout;
				if (!usesDesktopLayout) {
					for (const button of maskButtons) {
						button.style.transform = "";
					}
				}
			}
			const r = container.getBoundingClientRect();
			const w = Math.max(200, r.width);
			const h = Math.max(200, r.height);
			syncMindMapMask();
			sim.force("center", d3.forceCenter(w / 2, h / 2));
			if (isMindMapSimRunning) {
				sim.alpha(0.5).restart();
			}
		}, 150);
	};
	window.addEventListener("resize", onResize);

	return {
		sim,
		io,
		onMouseEnter,
		onMouseMove,
		onMouseLeave,
		onResize,
		removeVideoHoverListeners,
		container,
		nodes,
	};
}
