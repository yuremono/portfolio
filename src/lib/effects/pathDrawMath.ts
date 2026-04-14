/**
 * PathDraw / BorderDraw 共通のスクロール進行度・stroke 計算。
 * CSS 変数名は PathDraw（--PDS / --PES / --PVM）と同一。
 */

export function clamp01(t: number): number {
	return Math.max(0, Math.min(1, t));
}

export function readVar(el: Element, name: string, fallback: number): number {
	const raw = getComputedStyle(el).getPropertyValue(name).trim();
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : fallback;
}

const pathLengthCache = new WeakMap<SVGPathElement, number>();

export function getSvgPathLength(path: SVGPathElement): number {
	const cached = pathLengthCache.get(path);
	if (cached !== undefined) return cached;
	const len = path.getTotalLength();
	pathLengthCache.set(path, len);
	return len;
}

/**
 * BorderDraw（横）専用：消去なし。
 * `--PVM` … ビューポート高さに対する「中央」Y 比。
 * `--PDS` … 要素中心が **vMid+band から vMid へ**近づく区間（vh 比）で、線が左→右に引き切れる。
 * elCY > vMid+band → ほぼ見えない、elCY = vMid → 完了、elCY < vMid → 完了のまま。
 * PathDraw の描画式とは別物（変数名のみ共有）。
 */
export function computeBorderDrawProgress01(el: HTMLElement): number {
	const vh = window.innerHeight;
	const bandMul = readVar(el, "--PDS", 0.18);
	const vMidRatio = readVar(el, "--PVM", 0.5);
	const rect = el.getBoundingClientRect();
	const elCY = rect.top + rect.height / 2;
	const vMid = vh * vMidRatio;
	const band = Math.max(vh * bandMul, 1e-6);
	const yStart = vMid + band;
	const p = (yStart - elCY) / band;
	return clamp01(p);
}

/**
 * BorderDraw IsDown（縦）: パス上端＝要素上端とみなし、伸びの先端がビューポートの `--PVM` ライン上に来るように p を決める。
 * p ≈ (vMid − rect.top) / rect.height … スクロールで rect.top が動くほど p が変わる。
 * `--PDS` / `--PES` は使わない。`--PVM` はビューポート高さに対する基準線の Y 比（0.5＝画面の縦中央）。
 * 変数はホスト `.BorderDraw.IsDown` に置くか、直下 SVG に置く（SVG を優先して読む）。
 */
export function computeBorderDrawIsDownProgress01(
	el: HTMLElement,
	svgHint?: SVGSVGElement | null,
): number {
	const vh = window.innerHeight;
	const svg =
		svgHint ??
		(el.querySelector(
			":scope > svg[data-border-draw-svg]",
		) as SVGSVGElement | null);
	const varEl: Element = svg ?? el;
	const vMidRatio = readVar(varEl, "--PVM", readVar(el, "--PVM", 0.5));
	const vMid = vh * vMidRatio;
	const rect = el.getBoundingClientRect();
	const h = Math.max(rect.height, 1e-6);
	const p = (vMid - rect.top) / h;
	return clamp01(p);
}

export interface PathDrawStrokeStyle {
	strokeDasharray: string;
	strokeDashoffset: string;
}

/** PathDraw 用：root 1 要素につき 1 回だけ取得（複数 path があるときの getComputedStyle / rect の重複を削る） */
export interface PathDrawLayoutState {
	vh: number;
	elCY: number;
	vMid: number;
	drawSpan: number;
	eraseSpan: number;
}

export function readPathDrawLayoutState(root: HTMLElement): PathDrawLayoutState {
	const vh = window.innerHeight;
	const drawSpanMul = readVar(root, "--PDS", 0.3);
	const eraseSpanMul = readVar(root, "--PES", 0.7);
	const vMidRatio = readVar(root, "--PVM", 0.5);
	const rect = root.getBoundingClientRect();
	const elCY = rect.top + rect.height / 2;
	return {
		vh,
		elCY,
		vMid: vh * vMidRatio,
		drawSpan: vh * drawSpanMul,
		eraseSpan: vh * eraseSpanMul,
	};
}

/**
 * PathDraw 用：描画フェーズと消去フェーズの stroke-dash を返す。
 * `readPathDrawLayoutState` の結果を複数 path で共有すること。
 */
export function computePathDrawStrokeStyleFromLayout(
	state: PathDrawLayoutState,
	pathLength: number,
): PathDrawStrokeStyle {
	const { vh, elCY, vMid, drawSpan, eraseSpan } = state;
	const pDraw = clamp01((vh - elCY) / drawSpan);
	const len = pathLength;

	if (elCY > vMid) {
		return {
			strokeDasharray: `${len}`,
			strokeDashoffset: `${len * (1 - pDraw)}`,
		};
	}

	const pErase = clamp01((vMid - elCY) / eraseSpan);
	const a = pErase;
	return {
		strokeDasharray: `${(1 - a) * len} ${len}`,
		strokeDashoffset: `${-a * len}`,
	};
}

/**
 * PathDraw 用：root 1 要素だけのときの単発 API（内部で layout + stroke をまとめて実行）。
 */
export function computePathDrawStrokeStyle(
	root: HTMLElement,
	pathLength: number,
): PathDrawStrokeStyle {
	return computePathDrawStrokeStyleFromLayout(
		readPathDrawLayoutState(root),
		pathLength,
	);
}
