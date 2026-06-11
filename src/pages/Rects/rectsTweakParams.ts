import {
	DEFAULT_GRID_CELL_FILL_PERCENT,
	DEFAULT_GRID_COLS,
	DEFAULT_GRID_RANDOM_MODE,
	DEFAULT_GRID_ROWS,
	DEFAULT_GRID_SHAPE_ID,
	DEFAULT_GRID_SHOW_LINES,
	DEFAULT_GRID_STROKE_WIDTH,
	type GridRandomMode,
	type GridShapeId,
	clampGridCellFillPercent,
	clampGridCols,
	clampGridCount,
	clampGridRows,
	normalizeGridRandomMode,
} from "./randomGrid";
import {
	DEFAULT_RECT_BASE_WIDTH_PCT,
	DEFAULT_RECT_WIDTH_RANDOM_PCT,
	defaultAspectChecks,
} from "./rects";

export type RectsOutputMode = "html" | "svg";
export type RectsGeneratorMode = "rects" | "grid";
export type SvgMarkupVariant = "primitives" | "path";

export interface RectsOnlyParams {
	outputMode: RectsOutputMode;
	baseWidthPct: number;
	widthRandomPct: number;
	allowOverlap: boolean;
	aspectChecks: Record<string, boolean>;
}

export interface GridOnlyParams {
	rows: number;
	cols: number;
	shapeId: GridShapeId;
	showGridLines: boolean;
	/** プラス図形のストローク幅（0〜50） */
	strokeWidth: number;
	/** 図形の回転（度）。CSS `--GSR` に渡す（0〜180） */
	shapeRotationDeg: number;
	/** 配置個数は全セル数に対する割合（0〜100%）から算出 */
	cellFillPercent: number;
	/** アイテムに `rounded-[100%]`（border-radius: 100%）を付ける */
	itemRounded100Pct: boolean;
	/** セル選択の偏り（全体 / 縦・横・四辺から中央へ） */
	gridRandomMode: GridRandomMode;
}

/** Tweakpane が直接変更するパラメータ（React state と同期する） */
export interface RectsTweakParams {
	generatorMode: RectsGeneratorMode;
	svgMarkupVariant: SvgMarkupVariant;
	rects: RectsOnlyParams & {
		/** ランダム rects の枠の高さ（幅の %） */
		wrapperHeightPct: number;
		count: number;
		itemRounded100Pct: boolean;
	};
	grid: GridOnlyParams;
}

export const PARAMS_STORAGE_KEY = "rects-tweak-params";

/** ラッパー高さ（幅に対する %）。1〜200 に収める（aspect-ratio 100/X の X） */
export function clampWrapperHeightPct(n: number): number {
	const raw = Number(n);
	const v = Number.isFinite(raw) ? raw : 50;
	return Math.min(200, Math.max(1, v));
}

export function clampPct0to100(n: number, fallback: number): number {
	const raw = Number(n);
	const v = Number.isFinite(raw) ? raw : fallback;
	return Math.min(100, Math.max(0, v));
}

export function clampCount(n: number, fallback = 4): number {
	const raw = Number(n);
	const v = Number.isFinite(raw) ? Math.floor(raw) : fallback;
	return Math.max(1, Math.min(99, v || fallback));
}

export function clampGridStrokeWidth(n: number, fallback = 1): number {
	const raw = Number(n);
	const v = Number.isFinite(raw) ? raw : fallback;
	return Math.min(25, Math.max(0, v));
}

export function clampGridShapeRotationDeg(n: number, fallback = 0): number {
	const raw = Number(n);
	const v = Number.isFinite(raw) ? raw : fallback;
	return Math.min(180, Math.max(0, v));
}

export function normalizeGeneratorMode(v: unknown): RectsGeneratorMode {
	return v === "grid" ? "grid" : "rects";
}

export function normalizeOutputMode(v: unknown): RectsOutputMode {
	return v === "svg" ? "svg" : "html";
}

export function normalizeSvgMarkupVariant(v: unknown): SvgMarkupVariant {
	return v === "path" ? "path" : "primitives";
}

export function normalizeGridShapeId(v: unknown): GridShapeId {
	return v === "triangle" || v === "star" || v === "plus" || v === "rect"
		? v
		: DEFAULT_GRID_SHAPE_ID;
}

export function mergeAspectChecks(
	value: unknown,
	fallback = defaultAspectChecks(),
): Record<string, boolean> {
	if (!value || typeof value !== "object") {
		return fallback;
	}
	return {
		...fallback,
		...(value as Record<string, boolean>),
	};
}

export function normalizeTweakParamsInPlace(p: RectsTweakParams): void {
	p.generatorMode = normalizeGeneratorMode(p.generatorMode);
	p.svgMarkupVariant = normalizeSvgMarkupVariant(p.svgMarkupVariant);
	p.rects.wrapperHeightPct = clampWrapperHeightPct(p.rects.wrapperHeightPct);
	p.rects.count = clampCount(p.rects.count);
	p.rects.itemRounded100Pct = Boolean(p.rects.itemRounded100Pct);
	p.rects.outputMode = normalizeOutputMode(p.rects.outputMode);
	p.rects.baseWidthPct = clampPct0to100(
		p.rects.baseWidthPct,
		DEFAULT_RECT_BASE_WIDTH_PCT,
	);
	p.rects.widthRandomPct = clampPct0to100(
		p.rects.widthRandomPct,
		DEFAULT_RECT_WIDTH_RANDOM_PCT,
	);
	p.rects.allowOverlap = Boolean(p.rects.allowOverlap);
	const mergedAspectChecks = mergeAspectChecks(p.rects.aspectChecks);
	for (const [key, value] of Object.entries(mergedAspectChecks)) {
		p.rects.aspectChecks[key] = value;
	}
	p.grid.rows = clampGridRows(p.grid.rows);
	p.grid.cols = clampGridCols(p.grid.cols);
	p.grid.cellFillPercent = clampGridCellFillPercent(p.grid.cellFillPercent);
	p.grid.itemRounded100Pct = Boolean(p.grid.itemRounded100Pct);
	p.grid.shapeId = normalizeGridShapeId(p.grid.shapeId);
	p.grid.showGridLines =
		typeof p.grid.showGridLines === "boolean"
			? p.grid.showGridLines
			: DEFAULT_GRID_SHOW_LINES;
	p.grid.strokeWidth = clampGridStrokeWidth(p.grid.strokeWidth);
	p.grid.shapeRotationDeg = clampGridShapeRotationDeg(
		p.grid.shapeRotationDeg,
		0,
	);
	p.grid.gridRandomMode = normalizeGridRandomMode(p.grid.gridRandomMode);
}

export function defaultTweakParamValues(): RectsTweakParams {
	return {
		generatorMode: "grid",
		svgMarkupVariant: "primitives",
		rects: {
			outputMode: "html",
			baseWidthPct: DEFAULT_RECT_BASE_WIDTH_PCT,
			widthRandomPct: DEFAULT_RECT_WIDTH_RANDOM_PCT,
			allowOverlap: false,
			aspectChecks: defaultAspectChecks(),
			wrapperHeightPct: 50,
			count: 4,
			itemRounded100Pct: false,
		},
		grid: {
			rows: DEFAULT_GRID_ROWS,
			cols: DEFAULT_GRID_COLS,
			shapeId: DEFAULT_GRID_SHAPE_ID,
			showGridLines: DEFAULT_GRID_SHOW_LINES,
			strokeWidth: DEFAULT_GRID_STROKE_WIDTH,
			shapeRotationDeg: 0,
			cellFillPercent: DEFAULT_GRID_CELL_FILL_PERCENT,
			itemRounded100Pct: false,
			gridRandomMode: DEFAULT_GRID_RANDOM_MODE,
		},
	};
}

export function loadTweakParams(): RectsTweakParams {
	try {
		const raw = localStorage.getItem(PARAMS_STORAGE_KEY);
		if (!raw) return defaultTweakParamValues();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const s = JSON.parse(raw) as any;
		const d = defaultTweakParamValues();
		const gridRows = clampGridRows(
			s.grid?.rows ?? s.gridRows ?? d.grid.rows,
		);
		const gridCols = clampGridCols(
			s.grid?.cols ?? s.gridCols ?? d.grid.cols,
		);
		const legacyCount =
			s.count != null
				? clampCount(s.count, d.rects.count)
				: d.rects.count;
		const next: RectsTweakParams = {
			// generatorMode は保存データからは復元せず、初期値を常に使う
			generatorMode: d.generatorMode,
			svgMarkupVariant: normalizeSvgMarkupVariant(s.svgMarkupVariant),
			rects: {
				outputMode: normalizeOutputMode(
					s.rects?.outputMode ?? s.outputMode,
				),
				baseWidthPct: clampPct0to100(
					s.rects?.baseWidthPct ??
						s.baseWidthPct ??
						d.rects.baseWidthPct,
					d.rects.baseWidthPct,
				),
				widthRandomPct: clampPct0to100(
					s.rects?.widthRandomPct ??
						s.widthRandomPct ??
						d.rects.widthRandomPct,
					d.rects.widthRandomPct,
				),
				allowOverlap: Boolean(s.rects?.allowOverlap ?? s.allowOverlap),
				aspectChecks: mergeAspectChecks(
					s.rects?.aspectChecks ?? s.aspectChecks,
					d.rects.aspectChecks,
				),
				wrapperHeightPct: clampWrapperHeightPct(
					s.rects?.wrapperHeightPct ??
						s.wrapperHeightPct ??
						d.rects.wrapperHeightPct,
				),
				count: clampCount(
					s.rects?.count ?? s.count ?? d.rects.count,
					d.rects.count,
				),
				itemRounded100Pct: Boolean(
					s.rects?.itemRounded100Pct ??
						s.itemRounded100Pct ??
						d.rects.itemRounded100Pct,
				),
			},
			grid: {
				rows: gridRows,
				cols: gridCols,
				shapeId: normalizeGridShapeId(
					s.grid?.shapeId ?? s.gridShapeId ?? d.grid.shapeId,
				),
				showGridLines:
					typeof (s.grid?.showGridLines ?? s.showGridLines) ===
					"boolean"
						? Boolean(s.grid?.showGridLines ?? s.showGridLines)
						: d.grid.showGridLines,
				strokeWidth: clampGridStrokeWidth(
					s.grid?.strokeWidth ?? d.grid.strokeWidth,
				),
				shapeRotationDeg: clampGridShapeRotationDeg(
					s.grid?.shapeRotationDeg ?? d.grid.shapeRotationDeg,
					0,
				),
				cellFillPercent: (() => {
					if (s.grid?.cellFillPercent != null) {
						return clampGridCellFillPercent(s.grid.cellFillPercent);
					}
					const totalCells = gridRows * gridCols;
					const legacyGridCount =
						s.grid?.count != null
							? clampGridCount(s.grid.count, gridRows, gridCols)
							: clampGridCount(legacyCount, gridRows, gridCols);
					if (totalCells <= 0) {
						return DEFAULT_GRID_CELL_FILL_PERCENT;
					}
					return clampGridCellFillPercent(
						Math.round((legacyGridCount / totalCells) * 100),
					);
				})(),
				itemRounded100Pct: Boolean(
					s.grid?.itemRounded100Pct ??
						s.itemRounded100Pct ??
						d.grid.itemRounded100Pct,
				),
				gridRandomMode: normalizeGridRandomMode(
					s.grid?.gridRandomMode ?? d.grid.gridRandomMode,
				),
			},
		};
		normalizeTweakParamsInPlace(next);
		return next;
	} catch {
		return defaultTweakParamValues();
	}
}

export function saveTweakParams(p: RectsTweakParams): void {
	try {
		localStorage.setItem(
			PARAMS_STORAGE_KEY,
			JSON.stringify({
				...p,
				generatorMode: "grid",
			}),
		);
	} catch {
		// QuotaExceededError 等は無視
	}
}
