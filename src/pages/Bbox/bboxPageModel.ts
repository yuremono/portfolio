import { MIN_BOX } from "./bboxConstants";
import { cloneGroupsFromSnapshot } from "./bboxSnapshot";
import type {
	AnnotatorGroup,
	AnnotatorRect,
	AnnotatorSnapshot,
	DragMode,
	DragParentSnapshot,
	InteractionMode,
	OutputFormat,
	ResizeHandle,
} from "./bboxTypes";

/** ファイル入力とドロップの受け付け MIME（`accept` と揃える）。 */
export const IMAGE_INPUT_ACCEPT = "image/*";

export function isSelectableImageFile(f: File | undefined): f is File {
	return Boolean(f && f.type.startsWith("image/"));
}

export interface DragStartResize {
	x: number;
	y: number;
	boxRel: AnnotatorRect;
}

export interface DragStartGroupMove {
	x: number;
	y: number;
	px0: number;
	py0: number;
	groupId: string;
}

export type DragStart =
	| DragStartResize
	| DragStartGroupMove
	| { x: number; y: number };

/** ポインタ・履歴・ドラッグなどを含むアノテータの単一ソース（常に stateRef に保持）。 */
export interface MutableState {
	hasImage: boolean;
	naturalW: number;
	naturalH: number;
	containerW: number;
	snapSize: number;
	columns: number;
	outputFormat: OutputFormat;
	groups: AnnotatorGroup[];
	activeGroupId: string | null;
	selectedBoxIds: string[];
	interactionMode: InteractionMode;
	nextGroupId: number;
	nextBoxId: number;
	history: AnnotatorSnapshot[];
	historyIndex: number;
	historySuspended: boolean;
	drawing: boolean;
	startX: number;
	startY: number;
	currentRect: AnnotatorRect | null;
	dragMode: DragMode;
	dragHandle: ResizeHandle | null;
	dragStart: DragStart | null;
	dragBoxesSnapshot: Record<string, AnnotatorRect> | null;
	dragParent0: DragParentSnapshot | null;
	labelEditTarget: string | null;
	parentDraftNum: number | null;
}

/** 親バウンディングボックスの初期高さ（py=0 固定）。画像の幅を 16、高さを 9 とした 16:9 に相当する高さ。 */
export function initialParentHeightPx(naturalW: number, naturalH: number): number {
	if (naturalW > 0 && Number.isFinite(naturalW)) {
		return Math.max(MIN_BOX, Math.round((naturalW * 9) / 16));
	}
	if (naturalH > 0 && Number.isFinite(naturalH)) {
		return Math.max(MIN_BOX, naturalH);
	}
	return MIN_BOX;
}

export function createInitialMutableState(): MutableState {
	return {
		hasImage: false,
		naturalW: 0,
		naturalH: 0,
		containerW: 1920,
		snapSize: 4,
		columns: 0,
		outputFormat: "json",
		groups: [],
		activeGroupId: null,
		selectedBoxIds: [],
		interactionMode: "parent",
		nextGroupId: 1,
		nextBoxId: 1,
		history: [],
		historyIndex: -1,
		historySuspended: false,
		drawing: false,
		startX: 0,
		startY: 0,
		currentRect: null,
		dragMode: null,
		dragHandle: null,
		dragStart: null,
		dragBoxesSnapshot: null,
		dragParent0: null,
		labelEditTarget: null,
		parentDraftNum: null,
	};
}

/** テキスト入力中はウィンドウのショートカットで編集を奪わない（StrictMode でも同一ロジック）。 */
export function shouldIgnoreGlobalAnnotatorShortcuts(
	activeEl: Element | null,
): boolean {
	if (!activeEl || !(activeEl instanceof HTMLElement)) return false;
	const le = document.getElementById("annotator-label-editor");
	if (activeEl === le) return true;
	const sc = document.getElementById("annotator-sidebar-comment");
	if (activeEl === sc) return true;
	if (activeEl.isContentEditable) return true;
	const tag = activeEl.tagName;
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function applySnapshotToMutable(
	st: MutableState,
	snap: AnnotatorSnapshot,
) {
	const sw = st.naturalW || 800;
	const sh = st.naturalH || 600;
	st.groups = cloneGroupsFromSnapshot(snap, sw, sh);
	st.activeGroupId = snap.activeGroupId;
	st.selectedBoxIds = [...snap.selectedBoxIds];
	st.interactionMode = snap.interactionMode || "parent";
	st.parentDraftNum = snap.parentDraftNum ?? null;
	st.nextGroupId = snap.nextGroupId;
	st.nextBoxId = snap.nextBoxId;
}
