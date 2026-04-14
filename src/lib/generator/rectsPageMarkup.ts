import type { CSSProperties } from "react";

import {
	type GridShapeId,
	buildRandomGridLines,
	gridCountFromCellFillPercent,
	gridPlusLinesSvg,
	gridShapePathD,
	gridShapeUsesPath,
	gridShapeUsesPlusLines,
	gridViewBoxHeightForSquareCells,
	randomGrid,
} from "./randomGrid";
import {
	DEFAULT_RECT_BASE_WIDTH_PCT,
	DEFAULT_RECT_WIDTH_RANDOM_PCT,
	itemAspectPoolFromChecks,
	rects,
	type Rect,
} from "./rects";
import {
	clampGridShapeRotationDeg,
	clampPct0to100,
	clampWrapperHeightPct,
	type RectsOutputMode,
	type RectsTweakParams,
	type SvgMarkupVariant,
} from "./rectsTweakParams";

/** プレビュー枠とコピー用 HTML の共通クラス（コピー側には aspect は含めない） */
export const RANDOM_RECTS_WRAP_CLASS = "RandomRects relative bg-white";

/** SVG 出力・プレビュー用（`.RandomRects .item` の translate が掛からない） */
export const SVG_RANDOM_RECTS_WRAP_CLASS = "SvgRandomRects relative bg-white";

/** `border-radius: 100%` に相当する Tailwind v3 arbitrary */
export const RECT_ITEM_ROUNDED_100_CLASS = "rounded-[100%]";

/** Grid viewBox の幅（ユーザーデータ座標の基準） */
export const GRID_VIEWBOX_WIDTH = 100;

/** Grid 線は固定幅にして、プラス図形の太さとは切り離す */
export const GRID_LINE_STROKE_WIDTH = 1;

export function rectsOptsFromState(args: {
	count: number;
	baseWidthPct: number;
	widthRandomPct: number;
	wrapperHeightPct: number;
	aspectChecks: Record<string, boolean>;
	allowOverlap: boolean;
}) {
	const n = Math.max(1, Math.min(99, Math.floor(Number(args.count)) || 4));
	const baseW = clampPct0to100(
		args.baseWidthPct,
		DEFAULT_RECT_BASE_WIDTH_PCT,
	);
	const randomW = clampPct0to100(
		args.widthRandomPct,
		DEFAULT_RECT_WIDTH_RANDOM_PCT,
	);
	const h = clampWrapperHeightPct(args.wrapperHeightPct);
	const pool = itemAspectPoolFromChecks(args.aspectChecks);
	return {
		parentAspect: [100, h] as const,
		n,
		baseWidthPct: baseW,
		widthRandomPct: randomW,
		allowOverlap: args.allowOverlap,
		...(pool.length > 0 ? { itemAspectPool: pool } : {}),
	};
}

/** % 用の文字列（Tailwind arbitrary に埋め込み） */
export function fmtPct(n: number): string {
	const s = n.toFixed(4).replace(/\.?0+$/, "");
	return s === "" ? "0" : s;
}

/** 変数・style なしの Tailwind のみ（プレビューとコピペで共通） */
function rectItemClassList(r: Rect, itemRounded100Pct: boolean): string {
	const [aw, ah] = r.aspectRatio;
	const parts = [
		"item",
		"bg-[--GR]",
		`left-[${fmtPct(r.left)}%]`,
		`top-[${fmtPct(r.top)}%]`,
		`w-[${fmtPct(r.width)}%]`,
		`aspect-[${aw}/${ah}]`,
	];
	if (itemRounded100Pct) {
		parts.push(RECT_ITEM_ROUNDED_100_CLASS);
	}
	return parts.join(" ");
}

function rectToMarkup(r: Rect, itemRounded100Pct: boolean): string {
	return `<div class="${rectItemClassList(r, itemRounded100Pct)}"></div>`;
}

/** ラッパー＋各矩形（アスペクト比はプレビュー用 style のみ。マークアップ文字列には含めない） */
function randomRectsMarkup(list: Rect[], itemRounded100Pct: boolean): string {
	const inner = list
		.map((r) => rectToMarkup(r, itemRounded100Pct))
		.join("\n");
	return `<div class="${RANDOM_RECTS_WRAP_CLASS}">\n${inner}\n</div>`;
}

/**
 * `Rect` を SVG `<rect>` 用の幾何に変換する。
 *
 * viewBox は `0 0 100 wrapperHeightPct`（= コンテナのアスペクト比に合わせた矩形）として
 * `preserveAspectRatio="none"` と組み合わせる。この座標系では
 * 1 単位 = コンテナ幅の 1% = コンテナ高さの 1% × (100 / wrapperHeightPct) となり、
 * CSS の left/width（幅 %）と top（高さ %）の混在を吸収できる。
 *
 * - x/width: r.left / r.width はそのまま（幅 % = viewBox x 単位）
 * - y:       r.top は「高さ %（0-100）」なので viewBox y 単位（幅 % と同スケール）に変換
 */
export function rectToSvgGeometry(r: Rect, wrapperHeightPct: number) {
	const [aw, ah] = r.aspectRatio;
	const w = r.width;
	const h = w * (ah / aw);
	const cy = r.top * (wrapperHeightPct / 100);
	return {
		x: r.left - w / 2,
		y: cy - h / 2,
		width: w,
		height: h,
		/** 楕円・サークル用の中心座標 */
		cx: r.left,
		cy,
		rx: w / 2,
		ry: h / 2,
	};
}

function rectToSvgRectMarkup(
	r: Rect,
	itemRounded100Pct: boolean,
	wrapperHeightPct: number,
): string {
	const g = rectToSvgGeometry(r, wrapperHeightPct);
	if (itemRounded100Pct) {
		const cx = fmtPct(g.cx);
		const cy = fmtPct(g.cy);
		if (r.aspectRatio[0] === r.aspectRatio[1]) {
			return `<circle cx="${cx}" cy="${cy}" r="${fmtPct(g.rx)}" />`;
		}
		return `<ellipse cx="${cx}" cy="${cy}" rx="${fmtPct(g.rx)}" ry="${fmtPct(g.ry)}" />`;
	}
	return `<rect x="${fmtPct(g.x)}" y="${fmtPct(g.y)}" width="${fmtPct(g.width)}" height="${fmtPct(g.height)}" />`;
}

export function rectToSvgPathD(
	r: Rect,
	itemRounded100Pct: boolean,
	wrapperHeightPct: number,
): string {
	const g = rectToSvgGeometry(r, wrapperHeightPct);
	if (itemRounded100Pct) {
		const left = fmtPct(g.cx - g.rx);
		const right = fmtPct(g.cx + g.rx);
		const cy = fmtPct(g.cy);
		const rx = fmtPct(g.rx);
		const ry = fmtPct(g.ry);
		/** 楕円は 180 度の弧を 2 本つないで閉じる。 */
		return `M ${left} ${cy} A ${rx} ${ry} 0 1 0 ${right} ${cy} A ${rx} ${ry} 0 1 0 ${left} ${cy} Z`;
	}
	const x1 = fmtPct(g.x);
	const y1 = fmtPct(g.y);
	const x2 = fmtPct(g.x + g.width);
	const y2 = fmtPct(g.y + g.height);
	return `M ${x1} ${y1} H ${x2} V ${y2} H ${x1} Z`;
}

function rectToSvgPathMarkup(
	r: Rect,
	itemRounded100Pct: boolean,
	wrapperHeightPct: number,
): string {
	return `<path d="${rectToSvgPathD(r, itemRounded100Pct, wrapperHeightPct)}" />`;
}

function randomRectsSvgMarkup(
	list: Rect[],
	itemRounded100Pct: boolean,
	wrapperHeightPct: number,
): string {
	const h = clampWrapperHeightPct(wrapperHeightPct);
	const inner = list
		.map((r) => rectToSvgRectMarkup(r, itemRounded100Pct, h))
		.join("\n");
	return `<svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" fill="var(--GR50)">\n${inner}\n</svg>`;
}

function randomRectsSvgPathMarkup(
	list: Rect[],
	itemRounded100Pct: boolean,
	wrapperHeightPct: number,
): string {
	const h = clampWrapperHeightPct(wrapperHeightPct);
	const inner = list
		.map((r) => rectToSvgPathMarkup(r, itemRounded100Pct, h))
		.join("\n");
	return `<svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" fill="var(--GR50)">\n${inner}\n</svg>`;
}

export function buildRandomRectsMarkup(
	mode: RectsOutputMode,
	svgMarkupVariant: SvgMarkupVariant,
	list: Rect[],
	itemRounded100Pct: boolean,
	wrapperHeightPct: number,
): string {
	return mode === "svg"
		? svgMarkupVariant === "path"
			? randomRectsSvgPathMarkup(
					list,
					itemRounded100Pct,
					wrapperHeightPct,
				)
			: randomRectsSvgMarkup(list, itemRounded100Pct, wrapperHeightPct)
		: randomRectsMarkup(list, itemRounded100Pct);
}

export function rectToGridBox(r: Rect, wrapperHeightPct: number) {
	const g = rectToSvgGeometry(r, wrapperHeightPct);
	const size = Math.min(g.width, g.height);
	return {
		x: g.cx - size / 2,
		y: g.cy - size / 2,
		size,
		cx: g.cx,
		cy: g.cy,
		r: size / 2,
	};
}

function gridItemToSvgMarkup(
	r: Rect,
	shapeId: GridShapeId,
	itemRounded100Pct: boolean,
	wrapperHeightPct: number,
): string {
	const box = rectToGridBox(r, wrapperHeightPct);
	if (gridShapeUsesPlusLines(shapeId)) {
		return gridPlusLinesSvg(box);
	}
	if (!gridShapeUsesPath(shapeId)) {
		if (itemRounded100Pct) {
			return `<circle cx="${fmtPct(box.cx)}" cy="${fmtPct(box.cy)}" r="${fmtPct(box.r)}" />`;
		}
		return `<rect x="${fmtPct(box.x)}" y="${fmtPct(box.y)}" width="${fmtPct(box.size)}" height="${fmtPct(box.size)}" />`;
	}
	return `<path d="${gridShapePathD(shapeId, box, itemRounded100Pct)}" />`;
}

/** コピー用：図形のみ（Grid線は含めない） */
export function buildRandomGridCopyMarkup(args: {
	list: Rect[];
	rows: number;
	cols: number;
	shapeId: GridShapeId;
	itemRounded100Pct: boolean;
	strokeWidth: number;
	shapeRotationDeg: number;
}): string {
	const h = gridViewBoxHeightForSquareCells(args.rows, args.cols);
	const rot = clampGridShapeRotationDeg(args.shapeRotationDeg, 0);
	const gsr = `--GSR: ${rot}deg`;
	const items = args.list
		.map((r) =>
			gridItemToSvgMarkup(r, args.shapeId, args.itemRounded100Pct, h),
		)
		.join("\n");
	if (args.shapeId === "plus") {
		return `<svg class="GeneratedShapes" style="${gsr}" viewBox="0 0 ${GRID_VIEWBOX_WIDTH} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="var(--TC)" stroke-width="${fmtPct(args.strokeWidth)}" stroke-linecap="round">\n${items}\n</svg>`;
	}
	return `<svg class="GeneratedShapes" style="${gsr}" viewBox="0 0 ${GRID_VIEWBOX_WIDTH} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" fill="var(--GR50)">\n${items}\n</svg>`;
}

export function buildListFromParams(params: RectsTweakParams): Rect[] {
	return params.generatorMode === "grid"
		? randomGrid({
				rows: params.grid.rows,
				cols: params.grid.cols,
				count: gridCountFromCellFillPercent(
					params.grid.rows,
					params.grid.cols,
					params.grid.cellFillPercent,
				),
				mode: params.grid.gridRandomMode,
			})
		: rects(
				rectsOptsFromState({
					count: params.rects.count,
					baseWidthPct: params.rects.baseWidthPct,
					widthRandomPct: params.rects.widthRandomPct,
					wrapperHeightPct: params.rects.wrapperHeightPct,
					aspectChecks: params.rects.aspectChecks,
					allowOverlap: params.rects.allowOverlap,
				}),
			);
}

/** プレビュー用（動的 % は JIT に乗らないことがあるため style で指定） */
export function rectPreviewStyle(r: Rect): CSSProperties {
	return {
		left: `${r.left}%`,
		top: `${r.top}%`,
		width: `${r.width}%`,
		aspectRatio: `${r.aspectRatio[0]} / ${r.aspectRatio[1]}`,
	};
}

export { buildRandomGridLines };
