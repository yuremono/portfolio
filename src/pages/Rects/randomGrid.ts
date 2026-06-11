import type { Rect } from "./rects"

export type GridShapeId = "rect" | "triangle" | "star" | "plus"

export type RandomGridLine = {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}

export type GridShapeBox = {
	x: number;
	y: number;
	size: number;
}

/** セル選択の偏り（全体ランダムは従来どおり一様） */
export type GridRandomMode = "full" | "vertical" | "horizontal" | "allSides"

/** Tweakpane Grid タブの既定（ランダムの「横」） */
export const DEFAULT_GRID_RANDOM_MODE: GridRandomMode = "horizontal"

export type RandomGridOptions = {
	rows?: number;
	cols?: number;
	count?: number;
	wrapperHeightPct?: number;
	/** 省略時は `full`（従来の一様ランダム） */
	mode?: GridRandomMode;
	rng?: () => number;
}

export const DEFAULT_GRID_ROWS = 25
export const DEFAULT_GRID_COLS = 50
/** Grid タブ既定の充填率（全セル比 %） */
export const DEFAULT_GRID_CELL_FILL_PERCENT = 50
export const DEFAULT_GRID_SHAPE_ID: GridShapeId = "rect"
export const DEFAULT_GRID_SHOW_LINES = true
/** プラス図形以外でも既定値として使う（Rect 等の stroke は未使用だが Tweakpane の初期表示用） */
export const DEFAULT_GRID_STROKE_WIDTH = 5

const MAX_GRID_AXIS = 50
const MIN_GRID_COUNT = 4
const MAX_GRID_COUNT = 300

export const GRID_SHAPE_OPTIONS: readonly { text: string; value: GridShapeId }[] = [
	{ text: "Rect", value: "rect" },
	{ text: "Triangle", value: "triangle" },
	{ text: "Star", value: "star" },
	{ text: "Plus", value: "plus" },
]

function clampPositiveInt(
	value: number | undefined,
	fallback: number,
	max: number,
): number {
	const raw = Number(value)
	const normalized = Number.isFinite(raw) ? Math.floor(raw) : fallback
	return Math.min(max, Math.max(1, normalized))
}

export function clampGridRows(value: number | undefined): number {
	return clampPositiveInt(value, DEFAULT_GRID_ROWS, MAX_GRID_AXIS)
}

export function clampGridCols(value: number | undefined): number {
	return clampPositiveInt(value, DEFAULT_GRID_COLS, MAX_GRID_AXIS)
}

export function clampGridWrapperHeightPct(value: number | undefined): number {
	const raw = Number(value)
	const normalized = Number.isFinite(raw) ? raw : 50
	return Math.min(200, Math.max(1, normalized))
}

/**
 * 幅 100 の viewBox で各セルを正方形にするときの高さ。
 * （セル幅 100/cols = セル高さ H/rows ⇒ H = 100×rows/cols）
 */
export function gridViewBoxHeightForSquareCells(rows: number, cols: number): number {
	const r = clampGridRows(rows)
	const c = clampGridCols(cols)
	return (100 * r) / c
}

export function clampGridCount(
	value: number | undefined,
	rows: number,
	cols: number,
): number {
	const maxCells = clampGridRows(rows) * clampGridCols(cols)
	const maxAllowed = Math.min(MAX_GRID_COUNT, maxCells)
	const minAllowed = Math.min(MIN_GRID_COUNT, maxCells)
	const raw = Number(value)
	const normalized = Number.isFinite(raw) ? Math.floor(raw) : minAllowed
	return Math.min(maxAllowed, Math.max(minAllowed, normalized))
}

/**
 * `randomGrid` の個数用。0 個を許し、最大は全セル（旧 clampGridCount の最小 4 は付けない）。
 */
export function clampGridPlacementCount(
	value: number | undefined,
	rows: number,
	cols: number,
): number {
	const maxCells = clampGridRows(rows) * clampGridCols(cols)
	const raw = Number(value)
	const normalized = Number.isFinite(raw) ? Math.floor(raw) : 0
	return Math.min(maxCells, Math.max(0, normalized))
}

/** Grid タブの「全セルに対する割合」0〜100 */
export function clampGridCellFillPercent(value: number | undefined): number {
	const raw = Number(value)
	const v = Number.isFinite(raw) ? raw : 0
	return Math.min(100, Math.max(0, v))
}

/**
 * 充填率から配置個数を求める（0% は 0 個、100% は全セル数）。
 */
export function gridCountFromCellFillPercent(
	rows: number,
	cols: number,
	cellFillPercent: number,
): number {
	const r = clampGridRows(rows)
	const c = clampGridCols(cols)
	const total = r * c
	const pct = clampGridCellFillPercent(cellFillPercent)
	const raw = Math.round((total * pct) / 100)
	return Math.min(total, Math.max(0, raw))
}

export function gridSquareWidthPct(
	rows: number,
	cols: number,
	viewBoxHeight: number,
): number {
	const normalizedRows = clampGridRows(rows)
	const normalizedCols = clampGridCols(cols)
	const h =
		Number.isFinite(viewBoxHeight) && viewBoxHeight > 0
			? viewBoxHeight
			: gridViewBoxHeightForSquareCells(normalizedRows, normalizedCols)
	return Math.min(100 / normalizedCols, h / normalizedRows)
}

/**
 * 縦・横・四辺モード用: そのモードの「縁」上のセル（配置の起点）。
 * `full` では使わない。
 */
export function isSeedCellForGridMode(
	mode: GridRandomMode,
	row: number,
	col: number,
	rows: number,
	cols: number,
): boolean {
	if (mode === "full") {
		return false
	}
	const r = clampGridRows(rows)
	const c = clampGridCols(cols)
	if (mode === "horizontal") {
		return col === 0 || col === c - 1
	}
	if (mode === "vertical") {
		return row === 0 || row === r - 1
	}
	return row === 0 || row === r - 1 || col === 0 || col === c - 1
}

function hasOrthogonalPlacedNeighbor(
	cellIndex: number,
	placed: readonly boolean[],
	rows: number,
	cols: number,
): boolean {
	const row = Math.floor(cellIndex / cols)
	const col = cellIndex % cols
	if (row > 0 && placed[cellIndex - cols]) {
		return true
	}
	if (row < rows - 1 && placed[cellIndex + cols]) {
		return true
	}
	if (col > 0 && placed[cellIndex - 1]) {
		return true
	}
	if (col < cols - 1 && placed[cellIndex + 1]) {
		return true
	}
	return false
}

/**
 * 縦・横・四辺: 縁から内側へ隙間なく広がるよう、未配置かつ
 * （縁上 or 既配置に4近傍で接する）セルだけを候補にする。
 */
export function collectContiguousFrontier(
	mode: GridRandomMode,
	placed: readonly boolean[],
	rows: number,
	cols: number,
): number[] {
	const r = clampGridRows(rows)
	const c = clampGridCols(cols)
	const out: number[] = []
	for (let idx = 0; idx < r * c; idx++) {
		if (placed[idx]) {
			continue
		}
		const row = Math.floor(idx / c)
		const col = idx % c
		if (
			isSeedCellForGridMode(mode, row, col, r, c) ||
			hasOrthogonalPlacedNeighbor(idx, placed, r, c)
		) {
			out.push(idx)
		}
	}
	return out
}

/**
 * 端からの距離に応じた重み（補助用）。実際の配置は `collectContiguousFrontier` による連続拡張。
 */
export function gridRandomCellWeight(
	mode: GridRandomMode,
	row: number,
	col: number,
	rows: number,
	cols: number,
): number {
	if (mode === "full") {
		return 1
	}
	const r = clampGridRows(rows)
	const c = clampGridCols(cols)
	const rowD = Math.min(row, r - 1 - row)
	const colD = Math.min(col, c - 1 - col)
	let d: number
	let maxD: number
	if (mode === "vertical") {
		d = rowD
		maxD = Math.max(0, Math.floor((r - 1) / 2))
	} else if (mode === "horizontal") {
		d = colD
		maxD = Math.max(0, Math.floor((c - 1) / 2))
	} else {
		d = Math.min(rowD, colD)
		maxD = Math.max(
			0,
			Math.min(Math.floor((r - 1) / 2), Math.floor((c - 1) / 2)),
		)
	}
	return (maxD - d + 1) ** 2
}

export function normalizeGridRandomMode(value: unknown): GridRandomMode {
	if (
		value === "full" ||
		value === "vertical" ||
		value === "horizontal" ||
		value === "allSides"
	) {
		return value
	}
	/** 不正・省略時は一様ランダム（UI 既定の horizontal とは別） */
	return "full"
}

export function randomGrid(options: RandomGridOptions): Rect[] {
	const rows = clampGridRows(options.rows)
	const cols = clampGridCols(options.cols)
	const viewBoxHeight =
		options.wrapperHeightPct != null
			? clampGridWrapperHeightPct(options.wrapperHeightPct)
			: gridViewBoxHeightForSquareCells(rows, cols)
	const count = clampGridPlacementCount(options.count, rows, cols)
	const width = gridSquareWidthPct(rows, cols, viewBoxHeight)
	const rng = options.rng ?? Math.random
	const mode: GridRandomMode = options.mode ?? DEFAULT_GRID_RANDOM_MODE
	const out: Rect[] = []

	if (mode === "full") {
		const cellPool = Array.from({ length: rows * cols }, (_, index) => index)
		for (let i = 0; i < count; i++) {
			const pickIndex = Math.floor(rng() * cellPool.length)
			const cellIndex = cellPool.splice(pickIndex, 1)[0]
			if (cellIndex == null) break
			const row = Math.floor(cellIndex / cols)
			const col = cellIndex % cols
			out.push({
				left: ((col + 0.5) * 100) / cols,
				top: ((row + 0.5) * 100) / rows,
				width,
				aspectRatio: [1, 1],
			})
		}
		return out
	}

	const placed = new Array<boolean>(rows * cols).fill(false)
	for (let i = 0; i < count; i++) {
		const frontier = collectContiguousFrontier(mode, placed, rows, cols)
		if (frontier.length === 0) break
		const pick = frontier[Math.floor(rng() * frontier.length)]!
		placed[pick] = true
		const row = Math.floor(pick / cols)
		const col = pick % cols
		out.push({
			left: ((col + 0.5) * 100) / cols,
			top: ((row + 0.5) * 100) / rows,
			width,
			aspectRatio: [1, 1],
		})
	}

	return out
}

export function buildRandomGridLines(args: {
	rows: number;
	cols: number;
	/** viewBox の高さ（幅 100 と組み合わせてセル正方形にする値。省略時は行・列から算出） */
	viewBoxHeight?: number;
}): RandomGridLine[] {
	const rows = clampGridRows(args.rows)
	const cols = clampGridCols(args.cols)
	const h =
		args.viewBoxHeight != null
			? args.viewBoxHeight
			: gridViewBoxHeightForSquareCells(rows, cols)
	const lines: RandomGridLine[] = []

	for (let col = 1; col < cols; col++) {
		const x = (col * 100) / cols
		lines.push({ x1: x, y1: 0, x2: x, y2: h })
	}
	for (let row = 1; row < rows; row++) {
		const y = (row * h) / rows
		lines.push({ x1: 0, y1: y, x2: 100, y2: y })
	}

	return lines
}

export function gridShapeUsesPath(shapeId: GridShapeId): boolean {
	return shapeId === "triangle" || shapeId === "star"
}

export function gridShapeUsesPlusLines(shapeId: GridShapeId): boolean {
	return shapeId === "plus"
}

function fmt(n: number): string {
	const s = n.toFixed(4).replace(/\.?0+$/, "")
	return s === "" ? "0" : s
}

function circlePathD(box: GridShapeBox): string {
	const cx = box.x + box.size / 2
	const cy = box.y + box.size / 2
	const r = box.size / 2
	const left = fmt(cx - r)
	const right = fmt(cx + r)
	const centerY = fmt(cy)
	const radius = fmt(r)
	return `M ${left} ${centerY} A ${radius} ${radius} 0 1 0 ${right} ${centerY} A ${radius} ${radius} 0 1 0 ${left} ${centerY} Z`
}

function rectPathD(box: GridShapeBox): string {
	const x1 = fmt(box.x)
	const y1 = fmt(box.y)
	const x2 = fmt(box.x + box.size)
	const y2 = fmt(box.y + box.size)
	return `M ${x1} ${y1} H ${x2} V ${y2} H ${x1} Z`
}

/** 辺長 `size` の正三角形（外接矩形の中心がセル正方形の中心） */
function trianglePathD(box: GridShapeBox): string {
	const a = box.size
	const cx = box.x + a / 2
	const cy = box.y + a / 2
	const height = (a * Math.sqrt(3)) / 2
	const yTop = cy - height / 2
	const yBase = cy + height / 2
	const xL = cx - a / 2
	const xR = cx + a / 2
	return `M ${fmt(cx)} ${fmt(yTop)} L ${fmt(xR)} ${fmt(yBase)} L ${fmt(xL)} ${fmt(yBase)} Z`
}

/** 5 芒星。外周のバウンディングボックス中心をセル中心に合わせる */
function starPathD(box: GridShapeBox): string {
	const cx0 = box.x + box.size / 2
	const cy0 = box.y + box.size / 2
	const outer = box.size / 2
	const inner = outer * 0.45
	const pts: { x: number; y: number }[] = []

	for (let i = 0; i < 10; i++) {
		const radius = i % 2 === 0 ? outer : inner
		const angle = -Math.PI / 2 + (Math.PI / 5) * i
		pts.push({
			x: cx0 + Math.cos(angle) * radius,
			y: cy0 + Math.sin(angle) * radius,
		})
	}

	const xs = pts.map((p) => p.x)
	const ys = pts.map((p) => p.y)
	const midX = (Math.min(...xs) + Math.max(...xs)) / 2
	const midY = (Math.min(...ys) + Math.max(...ys)) / 2
	const targetX = box.x + box.size / 2
	const targetY = box.y + box.size / 2
	const dx = targetX - midX
	const dy = targetY - midY
	const shifted = pts.map((p) => ({ x: p.x + dx, y: p.y + dy }))

	return `M ${fmt(shifted[0]!.x)} ${fmt(shifted[0]!.y)} L ${shifted.slice(1).map((p) => `${fmt(p.x)} ${fmt(p.y)}`).join(" L ")} Z`
}

/**
 * プラス（縦横 2 本の線）。stroke で描く。
 */
export function gridPlusLinesSvg(box: GridShapeBox): string {
	const cx = box.x + box.size / 2
	const cy = box.y + box.size / 2
	const half = box.size * 0.42
	return (
		`<line x1="${fmt(cx)}" y1="${fmt(cy - half)}" x2="${fmt(cx)}" y2="${fmt(cy + half)}" vector-effect="non-scaling-stroke" />` +
		`<line x1="${fmt(cx - half)}" y1="${fmt(cy)}" x2="${fmt(cx + half)}" y2="${fmt(cy)}" vector-effect="non-scaling-stroke" />`
	)
}

export function gridShapePathD(
	shapeId: GridShapeId,
	box: GridShapeBox,
	itemRounded100Pct: boolean,
): string {
	if (shapeId === "rect") {
		return itemRounded100Pct ? circlePathD(box) : rectPathD(box)
	}
	if (shapeId === "triangle") {
		return trianglePathD(box)
	}
	if (shapeId === "star") {
		return starPathD(box)
	}
	return ""
}
