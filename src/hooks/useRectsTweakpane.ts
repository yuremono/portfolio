import {
	type MutableRefObject,
	type RefObject,
	useEffect,
	useRef,
} from "react";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { Pane, type ButtonApi } from "tweakpane";

import {
	GRID_SHAPE_OPTIONS,
	type GridRandomMode,
	type GridShapeId,
} from "../lib/generator/randomGrid";
import { ITEM_ASPECT_OPTIONS } from "../lib/generator/rects";
import type {
	RectsGeneratorMode,
	RectsOutputMode,
	RectsTweakParams,
} from "../lib/generator/rectsTweakParams";

export type {
	GridOnlyParams,
	RectsGeneratorMode,
	RectsOnlyParams,
	RectsOutputMode,
	RectsTweakParams,
	SvgMarkupVariant,
} from "../lib/generator/rectsTweakParams";

export function useRectsTweakpane(
	containerRef: RefObject<HTMLDivElement | null>,
	paramsRef: MutableRefObject<RectsTweakParams>,
	onChange: () => void,
	onRegenerate: () => void,
): void {
	const onChangeRef = useRef(onChange);
	const onRegenerateRef = useRef(onRegenerate);
	onChangeRef.current = onChange;
	onRegenerateRef.current = onRegenerate;

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const p = paramsRef.current;
		const pane = new Pane({
			container: el,
			title: "Random Generator",
		});
		pane.registerPlugin(EssentialsPlugin);

		const tab = pane.addTab({
			pages: [{ title: "Rects" }, { title: "Grid" }],
		});
		const rectsPage = tab.pages[0]!;
		const gridPage = tab.pages[1]!;
		const initialPage = p.generatorMode === "grid" ? gridPage : rectsPage;

		rectsPage.addBinding(p.rects, "wrapperHeightPct", {
			label: "枠の高さ（幅の%）",
			min: 1,
			max: 200,
			step: 10,
		});
		rectsPage.addBinding(p.rects, "count", {
			label: "個数",
			min: 1,
			max: 99,
			step: 1,
		});
		rectsPage.addBinding(p.rects, "itemRounded100Pct", {
			label: "角丸 100%",
		});

		const outputModeCells: readonly { title: string; value: RectsOutputMode }[] = [
			{ title: "HTML", value: "html" },
			{ title: "SVG", value: "svg" },
		];
		rectsPage.addBinding(p.rects, "outputMode", {
			view: "radiogrid",
			groupName: "rectsOutputMode",
			size: [2, 1],
			cells: (x: number, y: number) => {
				const idx = y * 2 + x;
				return outputModeCells[idx]!;
			},
			label: "出力形式",
		});
		rectsPage.addBinding(p.rects, "baseWidthPct", {
			label: "基準幅 %",
			min: 0,
			max: 100,
			step: 5,
		});
		rectsPage.addBinding(p.rects, "widthRandomPct", {
			label: "幅乱数 %",
			min: 0,
			max: 100,
			step: 5,
		});
		rectsPage.addBinding(p.rects, "allowOverlap", {
			label: "重なりを許可",
		});
		const aspectFolder = rectsPage.addFolder({
			title: "チェックした比率でランダムに生成",
			expanded: false,
		});
		for (const option of ITEM_ASPECT_OPTIONS) {
			if (!option.aspect) continue;
			aspectFolder.addBinding(p.rects.aspectChecks, option.id, {
				label: option.label,
			});
		}

		gridPage.addBinding(p.grid, "cellFillPercent", {
			label: "セル数（全セル比 %）",
			min: 0,
			max: 100,
			step: 1,
		});
		const gridRandomModeCells: readonly {
			title: string;
			value: GridRandomMode;
		}[] = [
			{ title: "全体", value: "full" },
			{ title: "縦", value: "vertical" },
			{ title: "横", value: "horizontal" },
			{ title: "四辺", value: "allSides" },
		];
		gridPage.addBinding(p.grid, "gridRandomMode", {
			view: "radiogrid",
			groupName: "gridRandomMode",
			size: [2, 2],
			cells: (x: number, y: number) => {
				const idx = y * 2 + x;
				return gridRandomModeCells[idx]!;
			},
			label: "ランダム",
		});
		gridPage.addBinding(p.grid, "itemRounded100Pct", {
			label: "角丸 100%",
		});
		gridPage.addBinding(p.grid, "rows", {
			label: "行数",
			min: 1,
			max: 50,
			step: 1,
		});
		gridPage.addBinding(p.grid, "cols", {
			label: "列数",
			min: 1,
			max: 50,
			step: 1,
		});
		gridPage.addBinding(p.grid, "shapeId", {
			label: "図形",
			options: Object.fromEntries(
				GRID_SHAPE_OPTIONS.map((option) => [option.text, option.value]),
			) as Record<string, GridShapeId>,
		});
		gridPage.addBinding(p.grid, "showGridLines", {
			label: "Grid線",
		});
		gridPage.addBinding(p.grid, "strokeWidth", {
			label: "プラス線の太さ",
			min: 0,
			max: 25,
			step: 1,
		});
		gridPage.addBinding(p.grid, "shapeRotationDeg", {
			label: "回転（度）",
			min: 0,
			max: 180,
			step: 1,
		});

		const primaryBtn = pane.addButton({
			title: "再生成",
		}) as ButtonApi;

		let bootstrapLocked = true;
		queueMicrotask(() => {
			bootstrapLocked = false;
		});

		// 初期選択を反映する前に listener を張り、bootstrap 時の select を取りこぼさない。
		tab.on("select", (ev) => {
			const nextMode: RectsGeneratorMode =
				ev.index === 1 ? "grid" : "rects";
			if (bootstrapLocked) {
				return;
			}
			if (p.generatorMode === nextMode) return;
			p.generatorMode = nextMode;
			onChangeRef.current();
		});

		initialPage.selected = true;

		primaryBtn.on("click", () => {
			onRegenerateRef.current();
		});

		pane.on("change", () => {
			onChangeRef.current();
			pane.refresh();
		});

		return () => {
			pane.dispose();
		};
		// マウント時に 1 回だけ生成（コールバックは ref 経由で最新を参照）
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
}
