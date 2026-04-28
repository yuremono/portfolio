/** Canvas 2D への注釈描画とキャンバス寸法同期。色は PageRoot の [--ann*] を getComputedStyle で解決する。 */

import {
	ANNOTATOR_PALETTE_VAR_NAMES,
	VAR_ANN_DRAFT_FILL,
	VAR_ANN_DRAFT_STROKE,
	VAR_ANN_GUIDE,
	VAR_ANN_HANDLE_FILL,
} from "./annotatorConstants";
import {
	childAbs,
	getPrimarySelectedChildAbs,
	parentAbsRect,
} from "./annotatorGeometry";
import type {
	AnnotatorGroup,
	AnnotatorRect,
	InteractionMode,
} from "./annotatorTypes";

/** getComputedStyle で解決したキャンバス用色（値は CSS 変数由来）。 */
export interface AnnotatorCanvasColors {
	palette: string[];
	guideStroke: string;
	draftStroke: string;
	draftFill: string;
	handleFill: string;
}

/** PageRoot 等に宣言した [--ann*] を取得する。 */
export function resolveAnnotatorCanvasColors(
	root: Element,
): AnnotatorCanvasColors {
	const cs = getComputedStyle(root);
	const palette = ANNOTATOR_PALETTE_VAR_NAMES.map((name) =>
		cs.getPropertyValue(name).trim(),
	);
	return {
		palette,
		guideStroke: cs.getPropertyValue(VAR_ANN_GUIDE).trim(),
		draftStroke: cs.getPropertyValue(VAR_ANN_DRAFT_STROKE).trim(),
		draftFill: cs.getPropertyValue(VAR_ANN_DRAFT_FILL).trim(),
		handleFill: cs.getPropertyValue(VAR_ANN_HANDLE_FILL).trim(),
	};
}

/** Bbox.html の syncStageLayout に相当するキャンバス寸法同期。 */
export function syncAnnotatorCanvasLayout(p: {
	canvas: HTMLCanvasElement;
	hasImage: boolean;
	naturalW: number;
	naturalH: number;
}): void {
	const { canvas, hasImage, naturalW, naturalH } = p;
	if (!hasImage || !naturalW) {
		canvas.width = 0;
		canvas.height = 0;
		canvas.style.width = "0";
		canvas.style.height = "0";
		return;
	}
	canvas.width = naturalW;
	canvas.height = naturalH;
	canvas.style.width = `${naturalW}px`;
	canvas.style.height = `${naturalH}px`;
}

function drawColumnGuides(
	ctx: CanvasRenderingContext2D,
	columns: number,
	cw: number,
	ch: number,
	guideStroke: string,
): void {
	if (!columns || columns < 2) return;
	const step = cw / columns;
	ctx.strokeStyle = guideStroke;
	ctx.lineWidth = 1;
	for (let i = 1; i < columns; i++) {
		const x = i * step;
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, ch);
		ctx.stroke();
	}
}

function drawCanvasLabel(
	ctx: CanvasRenderingContext2D,
	text: string,
	left: number,
	top: number,
	color: string,
): void {
	const t = String(text || "");
	const padX = 6;
	const padY = 3;
	ctx.font = "bold 12px ui-monospace, monospace";
	const tw = ctx.measureText(t).width;
	const lineH = 14;
	const x0 = left;
	const yBase = top + padY + lineH;
	const w = tw + padX * 2;
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x0, yBase + 1);
	ctx.lineTo(x0 + w, yBase + 1);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(x0 + w, top + padY);
	ctx.lineTo(x0 + w, yBase + 1);
	ctx.stroke();
	ctx.fillStyle = color;
	ctx.fillText(t, x0 + padX, yBase);
}

function drawHandles(
	ctx: CanvasRenderingContext2D,
	box: AnnotatorRect,
	strokeColor: string,
	fillColor: string,
): void {
	const x0 = box.x;
	const y0 = box.y;
	const x1 = box.x + box.w;
	const y1 = box.y + box.h;
	const mx = (x0 + x1) / 2;
	const my = (y0 + y1) / 2;
	const pts: [number, number][] = [
		[x0, y0],
		[mx, y0],
		[x1, y0],
		[x1, my],
		[x1, y1],
		[mx, y1],
		[x0, y1],
		[x0, my],
	];
	ctx.fillStyle = fillColor;
	ctx.strokeStyle = strokeColor;
	for (const [hx, hy] of pts) {
		ctx.fillRect(hx - 3, hy - 3, 6, 6);
		ctx.strokeRect(hx - 3, hy - 3, 6, 6);
	}
}

export interface RedrawParams {
	ctx: CanvasRenderingContext2D;
	canvasW: number;
	canvasH: number;
	groups: AnnotatorGroup[];
	activeGroupId: string | null;
	selectedBoxIds: string[];
	interactionMode: InteractionMode;
	columns: number;
	currentRect: AnnotatorRect | null;
	colors: AnnotatorCanvasColors;
}

function pickPaletteColor(colors: AnnotatorCanvasColors, index: number): string {
	const n = colors.palette.length;
	if (!n) return "";
	return colors.palette[index % n] ?? "";
}

export function redrawAnnotatorCanvas(p: RedrawParams): void {
	const {
		ctx,
		canvasW,
		canvasH,
		groups,
		activeGroupId,
		selectedBoxIds,
		interactionMode,
		columns,
		currentRect,
		colors,
	} = p;

	if (!canvasW || !canvasH) {
		return;
	}

	ctx.clearRect(0, 0, canvasW, canvasH);
	drawColumnGuides(ctx, columns, canvasW, canvasH, colors.guideStroke);

	groups.forEach((g, gi) => {
		const col = pickPaletteColor(colors, gi);
		const isAct = g.id === activeGroupId;
		const pr = parentAbsRect(g);
		ctx.fillStyle = col;
		ctx.globalAlpha = isAct && interactionMode === "parent" ? 0.08 : 0.04;
		ctx.fillRect(pr.x, pr.y, pr.w, pr.h);
		ctx.globalAlpha = 1;
		ctx.strokeStyle = col;
		ctx.globalAlpha = isAct && interactionMode === "parent" ? 1 : 0.65;
		ctx.lineWidth = isAct && interactionMode === "parent" ? 2.5 : 1.5;
		ctx.setLineDash([]);
		ctx.strokeRect(pr.x, pr.y, pr.w, pr.h);
		ctx.globalAlpha = 1;
		drawCanvasLabel(ctx, g.label || "Parent", pr.x, pr.y, col);
	});

	groups.forEach((g, gi) => {
		const col = pickPaletteColor(colors, gi);
		g.boxes.forEach((b) => {
			const a = childAbs(g, b);
			const sel =
				interactionMode === "child" && selectedBoxIds.includes(b.id);
			ctx.strokeStyle = col;
			ctx.lineWidth = sel ? 2.2 : 1.5;
			ctx.strokeRect(a.x, a.y, a.w, a.h);
			ctx.fillStyle = col;
			ctx.globalAlpha = 0.125;
			ctx.fillRect(a.x, a.y, a.w, a.h);
			ctx.globalAlpha = 1;
			drawCanvasLabel(ctx, b.label || "Child", a.x, a.y, col);
		});
	});

	if (interactionMode === "parent" && activeGroupId) {
		const g = groups.find((x) => x.id === activeGroupId);
		if (g)
			drawHandles(
				ctx,
				parentAbsRect(g),
				pickPaletteColor(colors, groups.indexOf(g)),
				colors.handleFill,
			);
	}

	const primChild = getPrimarySelectedChildAbs(
		groups,
		interactionMode,
		selectedBoxIds,
	);
	if (primChild)
		drawHandles(
			ctx,
			primChild.abs,
			pickPaletteColor(colors, groups.indexOf(primChild.group)),
			colors.handleFill,
		);

	if (currentRect) {
		ctx.strokeStyle = colors.draftStroke;
		ctx.lineWidth = 1;
		ctx.setLineDash([4, 3]);
		ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
		ctx.setLineDash([]);
		ctx.fillStyle = colors.draftFill;
		ctx.fillRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h);
	}
}
