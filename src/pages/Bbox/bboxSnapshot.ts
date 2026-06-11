/** アノテータ状態のスナップショット取得と復元（undo/redo 用の履歴要素）。 */
import { ensureParentBounds } from "./bboxGeometry";
import type {
	AnnotatorGroup,
	AnnotatorSnapshot,
	InteractionMode,
} from "./bboxTypes";

/** 現在の groups と UI 関連をスナップショット化（ID カウンタ含む）。 */
export function takeAnnotatorSnapshot(
	groups: AnnotatorGroup[],
	activeGroupId: string | null,
	selectedBoxIds: string[],
	interactionMode: InteractionMode,
	parentDraftNum: number | null,
	nextGroupId: number,
	nextBoxId: number,
): AnnotatorSnapshot {
	return {
		groups: groups.map((g) => ({
			id: g.id,
			label: g.label,
			comment: g.comment,
			collapsed: !!g.collapsed,
			px: g.px,
			py: g.py,
			pw: g.pw,
			ph: g.ph,
			boxes: g.boxes.map((b) => ({ ...b })),
			childSeq: typeof g.childSeq === "number" ? g.childSeq : 1,
		})),
		activeGroupId,
		selectedBoxIds: [...selectedBoxIds],
		interactionMode,
		parentDraftNum: parentDraftNum ?? null,
		nextGroupId,
		nextBoxId,
	};
}

/** スナップショットから groups を復元し、キャンバス内にクランプする。 */
export function cloneGroupsFromSnapshot(
	snap: AnnotatorSnapshot,
	canvasW: number,
	canvasH: number,
): AnnotatorGroup[] {
	const groups = snap.groups.map((g) => ({
		id: g.id,
		label: g.label,
		comment: g.comment,
		collapsed: !!g.collapsed,
		px: g.px,
		py: g.py,
		pw: g.pw,
		ph: g.ph,
		childSeq: typeof g.childSeq === "number" ? g.childSeq : 1,
		boxes: g.boxes.map((b) => ({ ...b })),
	}));
	const sw = canvasW || 800;
	const sh = canvasH || 600;
	groups.forEach((g) => ensureParentBounds(g, sw, sh));
	return groups;
}
