import { describe, expect, it } from "vitest"

import {
	buildRandomGridLines,
	clampGridCellFillPercent,
	collectContiguousFrontier,
	gridCountFromCellFillPercent,
	gridPlusLinesSvg,
	gridRandomCellWeight,
	gridShapePathD,
	gridViewBoxHeightForSquareCells,
	normalizeGridRandomMode,
	randomGrid,
} from "./randomGrid.ts"

function cellIndexFromRect(
	item: { left: number; top: number },
	rows: number,
	cols: number,
): number {
	const col = Math.round((item.left * cols) / 100 - 0.5)
	const row = Math.round((item.top * rows) / 100 - 0.5)
	return row * cols + col
}

function assertContiguousPlacementOrder(
	list: { left: number; top: number }[],
	rows: number,
	cols: number,
	mode: "vertical" | "horizontal" | "allSides",
): void {
	const placed = new Array<boolean>(rows * cols).fill(false)
	for (const item of list) {
		const idx = cellIndexFromRect(item, rows, cols)
		const frontier = collectContiguousFrontier(mode, placed, rows, cols)
		expect(frontier.includes(idx)).toBe(true)
		placed[idx] = true
	}
}

describe("gridCountFromCellFillPercent", () => {
	it("0% は 0 個、100% は全セル（大きいグリッドも MAX に切らない）", () => {
		expect(gridCountFromCellFillPercent(4, 4, 0)).toBe(0)
		expect(gridCountFromCellFillPercent(4, 4, 100)).toBe(16)
		expect(gridCountFromCellFillPercent(4, 4, 25)).toBe(4)
		expect(gridCountFromCellFillPercent(20, 20, 100)).toBe(400)
	})

	it("clampGridCellFillPercent は 0〜100 に収める", () => {
		expect(clampGridCellFillPercent(-5)).toBe(0)
		expect(clampGridCellFillPercent(150)).toBe(100)
	})
})

describe("normalizeGridRandomMode", () => {
	it("未知の値は full にフォールバックする", () => {
		expect(normalizeGridRandomMode(undefined)).toBe("full")
		expect(normalizeGridRandomMode("")).toBe("full")
		expect(normalizeGridRandomMode("vertical")).toBe("vertical")
		expect(normalizeGridRandomMode("horizontal")).toBe("horizontal")
		expect(normalizeGridRandomMode("allSides")).toBe("allSides")
	})
})

describe("gridRandomCellWeight", () => {
	it("縦方向は上下端に近い行ほど重みが大きい", () => {
		const wTop = gridRandomCellWeight("vertical", 0, 1, 5, 3)
		const wMid = gridRandomCellWeight("vertical", 2, 1, 5, 3)
		expect(wTop).toBeGreaterThan(wMid)
	})

	it("横方向は左右端に近い列ほど重みが大きい", () => {
		const wLeft = gridRandomCellWeight("horizontal", 2, 0, 3, 5)
		const wMid = gridRandomCellWeight("horizontal", 2, 2, 3, 5)
		expect(wLeft).toBeGreaterThan(wMid)
	})

	it("四辺モードは角・外周ほど重みが大きい", () => {
		const wCorner = gridRandomCellWeight("allSides", 0, 0, 5, 5)
		const wCenter = gridRandomCellWeight("allSides", 2, 2, 5, 5)
		expect(wCorner).toBeGreaterThan(wCenter)
	})
})

describe("randomGrid", () => {
	it("同じセルに重複せず count 分だけ正方形を配置する", () => {
		const list = randomGrid({
			rows: 2,
			cols: 3,
			count: 4,
			wrapperHeightPct: 60,
			rng: () => 0,
		})

		expect(list).toHaveLength(4)
		expect(new Set(list.map((item: { left: number; top: number }) => `${item.left}-${item.top}`)).size).toBe(4)
		expect(list.every((item: { aspectRatio: readonly [number, number] }) => item.aspectRatio[0] === 1 && item.aspectRatio[1] === 1)).toBe(true)
	})

	it("count がセル数を超えると rows*cols にクランプする", () => {
		const list = randomGrid({
			rows: 2,
			cols: 2,
			count: 99,
			wrapperHeightPct: 50,
			rng: () => 0,
		})

		expect(list).toHaveLength(4)
	})

	it("count が 0 のときは 1 個も配置しない", () => {
		expect(randomGrid({ rows: 4, cols: 4, count: 0, rng: () => 0 })).toEqual([])
	})

	it("wrapperHeightPct 省略時は行・列から viewBox 高さが決まり、セルが正方形になる", () => {
		const [item] = randomGrid({
			rows: 1,
			cols: 1,
			count: 1,
			rng: () => 0,
		})

		expect(gridViewBoxHeightForSquareCells(1, 1)).toBe(100)
		expect(item).toEqual({
			left: 50,
			top: 50,
			width: 100,
			aspectRatio: [1, 1],
		})
	})

	it("horizontal モードは常にフロンティア上にのみ配置し、縁から隙間なく広がる", () => {
		const rows = 4
		const cols = 5
		const list = randomGrid({
			rows,
			cols,
			count: 12,
			mode: "horizontal",
			rng: () => 0,
		})
		expect(list).toHaveLength(12)
		assertContiguousPlacementOrder(list, rows, cols, "horizontal")
	})

	it("vertical / allSides も連続拡張の順序を満たす", () => {
		const v = randomGrid({
			rows: 5,
			cols: 4,
			count: 10,
			mode: "vertical",
			rng: () => 0,
		})
		assertContiguousPlacementOrder(v, 5, 4, "vertical")
		const a = randomGrid({
			rows: 4,
			cols: 4,
			count: 12,
			mode: "allSides",
			rng: () => 0,
		})
		assertContiguousPlacementOrder(a, 4, 4, "allSides")
	})
})

describe("gridViewBoxHeightForSquareCells", () => {
	it("幅 100 に対し H = 100×rows/cols でセルが正方形になる", () => {
		expect(gridViewBoxHeightForSquareCells(3, 4)).toBe(75)
		expect(gridViewBoxHeightForSquareCells(4, 4)).toBe(100)
	})
})

describe("buildRandomGridLines", () => {
	it("内側の縦線と横線だけを返す（viewBox 高さ省略時はセル正方形用の H）", () => {
		const h = gridViewBoxHeightForSquareCells(3, 4)
		const lines = buildRandomGridLines({
			rows: 3,
			cols: 4,
		})

		expect(h).toBe(75)
		expect(lines).toHaveLength(5)
		expect(lines[0]).toEqual({ x1: 25, y1: 0, x2: 25, y2: h })
		expect(lines.at(-1)).toEqual({
			x1: 0,
			y1: (2 * h) / 3,
			x2: 100,
			y2: (2 * h) / 3,
		})
	})
})

describe("gridShapePathD", () => {
	it("triangle を path 要素向けの閉じたパスで返す", () => {
		const d = gridShapePathD("triangle", { x: 10, y: 20, size: 30 }, false)

		expect(d.startsWith("M ")).toBe(true)
		expect(d.endsWith(" Z")).toBe(true)
	})

	it("star を path 要素向けの閉じたパスで返す", () => {
		const d = gridShapePathD("star", { x: 10, y: 20, size: 30 }, false)

		expect(d.startsWith("M ")).toBe(true)
		expect(d.endsWith(" Z")).toBe(true)
	})

	it("plus は path の d を使わず line 2 本で表す", () => {
		expect(gridShapePathD("plus", { x: 10, y: 20, size: 30 }, false)).toBe("")
		const svg = gridPlusLinesSvg({ x: 10, y: 20, size: 30 })
		expect(svg).toContain("<line ")
		expect(svg).toContain('vector-effect="non-scaling-stroke"')
		expect(svg.split("<line ").length - 1).toBe(2)
	})

	it("rect で角丸100%が有効なときは円弧コマンドを使う", () => {
		const d = gridShapePathD("rect", { x: 10, y: 20, size: 30 }, true)

		expect(d).toContain(" A ")
	})
})
