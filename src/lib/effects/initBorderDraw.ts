/**
 * .BorderDraw に SVG 線を挿入し、スクロールで stroke-dash 描画。
 * 横: 既定。縦（上→下）: 修飾クラス IsDown。
 * 横: computeBorderDrawProgress01。IsDown: computeBorderDrawIsDownProgress01。
 * スタイルはページ側（例: test2.tsx の <style>）に記述する。
 */

import {
	computeBorderDrawIsDownProgress01,
	computeBorderDrawProgress01,
} from "./pathDrawMath";

const ATTR = "data-border-draw";
const SVG_ATTR = "data-border-draw-svg";
const SELECTOR = ".BorderDraw";

const SVG_NS = "http://www.w3.org/2000/svg";

/** viewBox 内の水平・垂直いずれも長さ 100 の直線。PathDraw と同じ dash 式。 */
const BORDER_DRAW_PATH_LEN = 100;

/** ホストごとの SVG / path を毎フレーム query しない */
const borderDrawPathCache = new WeakMap<
	HTMLElement,
	{ svgs: SVGSVGElement[]; paths: SVGPathElement[] }
>();

export type RuntimeDisconnect = { disconnect: () => void };

/**
 * PathDraw の `frameStride` と同じ意味。
 * 1 = スクロールで dirty のあと毎 RAF で stroke 更新（最も滑らか・負荷高め）。
 * 2 以上 = その N フレームに 1 回だけ stroke 更新（負荷は下がるが間引きに見える）。
 */
export type InitBorderDrawOptions = {
	frameStride?: number;
};

function createBorderDrawSvgs(isDown: boolean): SVGSVGElement[] {
	if (isDown) {// 左右2つのSVGを生成
		const svgLeft = document.createElementNS(SVG_NS, "svg");
		svgLeft.setAttribute("aria-hidden", "true");
		svgLeft.setAttribute(SVG_ATTR, "1");
		svgLeft.setAttribute("class", "BorderDrawSvg Left");
		svgLeft.setAttribute("preserveAspectRatio", "none");
		svgLeft.setAttribute("viewBox", "0 0 1 100");

		const pathLeft = document.createElementNS(SVG_NS, "path");
		pathLeft.setAttribute("fill", "none");
		pathLeft.setAttribute("d", "M0.5,0 L0.5,100");
		svgLeft.appendChild(pathLeft);

		const svgRight = document.createElementNS(SVG_NS, "svg");
		svgRight.setAttribute("aria-hidden", "true");
		svgRight.setAttribute(SVG_ATTR, "1");
		svgRight.setAttribute("class", "BorderDrawSvg Right");
		svgRight.setAttribute("preserveAspectRatio", "none");
		svgRight.setAttribute("viewBox", "0 0 1 100");

		const pathRight = document.createElementNS(SVG_NS, "path");
		pathRight.setAttribute("fill", "none");
		pathRight.setAttribute("d", "M0.5,0 L0.5,100");
		svgRight.appendChild(pathRight);

		return [svgLeft, svgRight];
	} else {// 水平1本
		const svg = document.createElementNS(SVG_NS, "svg");
		svg.setAttribute("aria-hidden", "true");
		svg.setAttribute(SVG_ATTR, "1");
		svg.setAttribute("class", "BorderDrawSvg");
		svg.setAttribute("preserveAspectRatio", "none");
		svg.setAttribute("viewBox", "0 0 100 1");

		const path = document.createElementNS(SVG_NS, "path");
		path.setAttribute("fill", "none");
		path.setAttribute("d", "M0,0.5 L100,0.5");
		svg.appendChild(path);

		return [svg];
	}
}

function mountHosts(base: Document | Element): HTMLElement[] {
	const mounted: HTMLElement[] = [];
	base.querySelectorAll(SELECTOR).forEach((node) => {
		if (!(node instanceof HTMLElement)) return;

		borderDrawPathCache.delete(node);

		/* 直下の SVG のみ対象（親が BorderDraw のとき、子 .item の BorderDrawSvg を触らない） */
		node
			.querySelectorAll(`:scope > svg[${SVG_ATTR}]`)
			.forEach((s) => s.remove());
		node.removeAttribute(ATTR);

		const isDown = node.classList.contains("IsDown");
		const svgs = createBorderDrawSvgs(isDown);
		const paths: SVGPathElement[] = [];
		svgs.forEach((svg) => {
			node.appendChild(svg);
			const pathEl = svg.querySelector("path");
			if (pathEl instanceof SVGPathElement) {
				paths.push(pathEl);
			}
		});
		if (paths.length > 0) {
			borderDrawPathCache.set(node, { svgs, paths });
		}
		node.setAttribute(ATTR, "1");
		mounted.push(node);
	});
	return mounted;
}

export function initBorderDraw(
	root: Document | Element = document,
	options: InitBorderDrawOptions = {},
): RuntimeDisconnect {
	const base = root;

	const hosts = new Set<HTMLElement>();
	mountHosts(base).forEach((h) => hosts.add(h));

	let rafId: number | null = null;
	let strideCounter = 0;
	let dirty = false;
	const frameStride = Math.max(1, Math.floor(options.frameStride ?? 2));

	const cancelScheduledRaf = () => {
		if (rafId != null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	};

	const updateHost = (el: HTMLElement) => {
		let cached = borderDrawPathCache.get(el);
		if (!cached) {
			const svgEls = el.querySelectorAll<SVGSVGElement>(
				`:scope > svg[${SVG_ATTR}]`,
			);
			if (svgEls.length === 0) return;
			const svgs = Array.from(svgEls);
			const paths: SVGPathElement[] = [];
			svgs.forEach((svg) => {
				const pathEl = svg.querySelector<SVGPathElement>("path");
				if (pathEl) paths.push(pathEl);
			});
			if (paths.length === 0) return;
			cached = { svgs, paths };
			borderDrawPathCache.set(el, cached);
		}
		const { svgs, paths } = cached;
		const isDown = el.classList.contains("IsDown");
		const p = isDown
			? computeBorderDrawIsDownProgress01(el, svgs[0])
			: computeBorderDrawProgress01(el);
		const len = BORDER_DRAW_PATH_LEN;
		/* PathDraw 描画フェーズと同じ: dasharray は path 長 1 本（横=左→右、IsDown=上→下） */
		paths.forEach((path) => {
			path.style.strokeDasharray = `${len}`;
			path.style.strokeDashoffset = `${len * (1 - p)}`;
		});
	};

	const updateAll = () => {
		hosts.forEach((h) => updateHost(h));
	};

	const scheduleLoop = () => {
		if (rafId != null) return;
		rafId = requestAnimationFrame(loop);
	};

	const loop = () => {
		rafId = null;
		if (!dirty) return;

		const stride = Math.max(1, Math.floor(frameStride));
		if (stride > 1) {
			strideCounter += 1;
			if (strideCounter < stride) {
				rafId = requestAnimationFrame(loop);
				return;
			}
			strideCounter = 0;
		}

		updateAll();
		dirty = false;
	};

	const onScroll = () => {
		dirty = true;
		scheduleLoop();
	};

	const onResize = () => {
		cancelScheduledRaf();
		strideCounter = 0;
		dirty = false;
		updateAll();
	};

	const flushNow = () => {
		cancelScheduledRaf();
		strideCounter = 0;
		dirty = false;
		updateAll();
	};

	const supportsScrollEnd =
		typeof window !== "undefined" && "onscrollend" in window;

	updateAll();
	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("resize", onResize);
	if (supportsScrollEnd) {
		window.addEventListener("scrollend", flushNow, { passive: true });
	}

	return {
		disconnect: () => {
			cancelScheduledRaf();
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			if (supportsScrollEnd) {
				window.removeEventListener("scrollend", flushNow);
			}

			base.querySelectorAll(`[${ATTR}]`).forEach((node) => {
				if (!(node instanceof HTMLElement)) return;
				borderDrawPathCache.delete(node);
				node.querySelectorAll(`:scope > svg[${SVG_ATTR}]`).forEach(
					(s) => s.remove(),
				);
				node.removeAttribute(ATTR);
			});
			hosts.clear();
		},
	};
}
