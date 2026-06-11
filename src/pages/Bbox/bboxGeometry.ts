/** 矩形注釈キャンバス用の幾何処理。
 *
 * - **純関数**（入力だけで決まり、引数を書き換えない）:
 *   `snapVal`, `clampBox`, `clampChildRect`, `childAbs`, `parentAbsRect`,
 *   `pointInParent`, `cursorForHandle`, `handleAt`, `hitTestChildAbs`,
 *   `findBoxById`, `getPrimarySelectedChildAbs`
 * - **インプレースで `AnnotatorGroup` / `AnnotatorBox` を更新**:
 *   `ensureParentBounds`, `clampChildInParent`, `clampChildTranslateInParent`,
 *   `clampAllChildren`, `nextChildLabel`
 */

import { MIN_BOX, HANDLE } from "./bboxConstants";
import type {
	AnnotatorBox,
	AnnotatorGroup,
	AnnotatorRect,
	HitChildResult,
	InteractionMode,
	PrimarySelectedChild,
	ResizeHandle,
} from "./bboxTypes";

const RESIZE_HANDLE_ORDER: readonly ResizeHandle[] = [
	"nw",
	"n",
	"ne",
	"e",
	"se",
	"s",
	"sw",
	"w",
] as const;

/** グリッドにスナップした座標値（切り上げ。`snapSize <= 0` のときは無加工）。 */
export function snapVal(v: number, snapSize: number): number {
	if (snapSize <= 0) return v;
	return Math.ceil(v / snapSize) * snapSize;
}

/** 画像（キャンバス）矩形内に収まるよう正規化した軸平行矩形（純関数）。 */
export function clampBox(b: AnnotatorRect, sw: number, sh: number): AnnotatorRect {
	const x = Math.max(0, Math.min(b.x, sw));
	const y = Math.max(0, Math.min(b.y, sh));
	let w = Math.max(MIN_BOX, b.w);
	let h = Math.max(MIN_BOX, b.h);
	if (x + w > sw) w = Math.max(MIN_BOX, sw - x);
	if (y + h > sh) h = Math.max(MIN_BOX, sh - y);
	return { x, y, w, h };
}

/** 破損した親矩形を全面リセットしたうえでキャンバス内に収める（`g` を更新）。 */
export function ensureParentBounds(g: AnnotatorGroup, sw: number, sh: number): void {
	if (
		typeof g.px !== "number" ||
		typeof g.py !== "number" ||
		typeof g.pw !== "number" ||
		typeof g.ph !== "number" ||
		!Number.isFinite(g.px) ||
		!Number.isFinite(g.py) ||
		!Number.isFinite(g.pw) ||
		!Number.isFinite(g.ph) ||
		g.pw < MIN_BOX ||
		g.ph < MIN_BOX
	) {
		g.px = 0;
		g.py = 0;
		g.pw = sw;
		g.ph = sh;
	}
	const c = clampBox({ x: g.px, y: g.py, w: g.pw, h: g.ph }, sw, sh);
	g.px = c.x;
	g.py = c.y;
	g.pw = c.w;
	g.ph = c.h;
}

/** 親グループ座標系で子矩形を親境界内に収めた結果（純関数）。 */
export function clampChildRect(g: AnnotatorGroup, rect: AnnotatorRect): AnnotatorRect {
	const x = Math.max(0, Math.min(rect.x, g.pw - MIN_BOX));
	const y = Math.max(0, Math.min(rect.y, g.ph - MIN_BOX));
	let w = Math.max(MIN_BOX, rect.w);
	let h = Math.max(MIN_BOX, rect.h);
	if (x + w > g.pw) w = Math.max(MIN_BOX, g.pw - x);
	if (y + h > g.ph) h = Math.max(MIN_BOX, g.ph - y);
	return { x, y, w, h };
}

/** 親内で位置だけクランプし、幅・高さは維持する（移動ドラッグ用）。親より大きい場合のみ縮小。 */
export function clampChildRectTranslateOnly(
	g: AnnotatorGroup,
	rect: AnnotatorRect,
): AnnotatorRect {
	let w = Math.max(MIN_BOX, rect.w);
	let h = Math.max(MIN_BOX, rect.h);
	if (w > g.pw) w = g.pw > 0 ? g.pw : MIN_BOX;
	if (h > g.ph) h = g.ph > 0 ? g.ph : MIN_BOX;
	let x = rect.x;
	let y = rect.y;
	x = Math.max(0, Math.min(x, g.pw - w));
	y = Math.max(0, Math.min(y, g.ph - h));
	return { x, y, w, h };
}

/** `clampChildRectTranslateOnly` の結果を `b` に書き戻す。 */
export function clampChildTranslateInParent(g: AnnotatorGroup, b: AnnotatorBox): void {
	const r = clampChildRectTranslateOnly(g, b);
	b.x = r.x;
	b.y = r.y;
	b.w = r.w;
	b.h = r.h;
}

/** `clampChildRect` の結果を `b` に書き戻す。 */
export function clampChildInParent(g: AnnotatorGroup, b: AnnotatorBox): void {
	const r = clampChildRect(g, b);
	b.x = r.x;
	b.y = r.y;
	b.w = r.w;
	b.h = r.h;
}

/** グループ内の全子矩形を親内に収める。 */
export function clampAllChildren(g: AnnotatorGroup): void {
	g.boxes.forEach((b) => clampChildInParent(g, b));
}

/** 論理座標が親矩形内部か（境界含む）。 */
export function pointInParent(
	g: AnnotatorGroup,
	px: number,
	py: number,
): boolean {
	return (
		px >= g.px && px <= g.px + g.pw && py >= g.py && py <= g.py + g.ph
	);
}

/** 親グループの絶対配置矩形。 */
export function parentAbsRect(g: AnnotatorGroup): AnnotatorRect {
	return { x: g.px, y: g.py, w: g.pw, h: g.ph };
}

/** ハンドル方向に応じた CSS `cursor` 値。 */
export function cursorForHandle(h: ResizeHandle | null): string | null {
	if (!h) return null;
	if (h === "nw" || h === "se") return "nwse-resize";
	if (h === "ne" || h === "sw") return "nesw-resize";
	if (h === "n" || h === "s") return "ns-resize";
	if (h === "e" || h === "w") return "ew-resize";
	return null;
}

/** 次の子ラベル文字列を返し、`childSeq` を進める（`g` を更新）。 */
export function nextChildLabel(g: AnnotatorGroup): string {
	if (typeof g.childSeq !== "number" || g.childSeq < 1) g.childSeq = 1;
	const lab = `Child ${g.childSeq}`;
	g.childSeq++;
	return lab;
}

/** 親の絶対座標での子矩形。 */
export function childAbs(g: AnnotatorGroup, b: AnnotatorBox): AnnotatorRect {
	return { x: g.px + b.x, y: g.py + b.y, w: b.w, h: b.h };
}

/** 最前面から子矩形への当たり判定（論理座標）。`onlyGroupId` でグループを限定可。 */
export function hitTestChildAbs(
	groups: AnnotatorGroup[],
	px: number,
	py: number,
	onlyGroupId: string | null,
): HitChildResult | null {
	const list: HitChildResult[] = [];
	groups.forEach((g, gi) => {
		if (onlyGroupId && g.id !== onlyGroupId) return;
		g.boxes.forEach((b, bi) => {
			const a = childAbs(g, b);
			list.push({ group: g, box: b, gi, bi, abs: a });
		});
	});
	for (let i = list.length - 1; i >= 0; i--) {
		const { abs } = list[i];
		if (
			px >= abs.x &&
			px <= abs.x + abs.w &&
			py >= abs.y &&
			py <= abs.y + abs.h
		)
			return list[i];
	}
	return null;
}

/** 全グループから ID で子矩形を検索。 */
export function findBoxById(
	groups: AnnotatorGroup[],
	id: string,
): { group: AnnotatorGroup; box: AnnotatorBox } | null {
	for (const g of groups) {
		const b = g.boxes.find((x) => x.id === id);
		if (b) return { group: g, box: b };
	}
	return null;
}

/** 論理座標が当たったリサイズハンドルキー（角・辺）。 */
export function handleAt(
	px: number,
	py: number,
	box: AnnotatorRect | null,
): ResizeHandle | null {
	if (!box || box.w < MIN_BOX || box.h < MIN_BOX) return null;
	const x0 = box.x;
	const y0 = box.y;
	const x1 = box.x + box.w;
	const y1 = box.y + box.h;
	const mx = (x0 + x1) / 2;
	const my = (y0 + y1) / 2;
	const pts: Record<ResizeHandle, [number, number]> = {
		nw: [x0, y0],
		n: [mx, y0],
		ne: [x1, y0],
		e: [x1, my],
		se: [x1, y1],
		s: [mx, y1],
		sw: [x0, y1],
		w: [x0, my],
	};
	for (const k of RESIZE_HANDLE_ORDER) {
		const [hx, hy] = pts[k];
		if (Math.abs(px - hx) <= HANDLE && Math.abs(py - hy) <= HANDLE)
			return k;
	}
	return null;
}

/** `child` モードでちょうど 1 つ選択されている子の絶対矩形。 */
export function getPrimarySelectedChildAbs(
	groups: AnnotatorGroup[],
	interactionMode: InteractionMode,
	selectedBoxIds: string[],
): PrimarySelectedChild | null {
	if (interactionMode !== "child" || selectedBoxIds.length !== 1)
		return null;
	const f = findBoxById(groups, selectedBoxIds[0]);
	if (!f) return null;
	return { group: f.group, box: f.box, abs: childAbs(f.group, f.box) };
}
