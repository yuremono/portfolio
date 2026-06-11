/** 矩形注釈（親子 BBox）で共有する型定義。再利用時もページ名を識別子に含めない。 */

/** 親の座標系に対する子矩形（相対位置・サイズ）。 */
export interface AnnotatorBox {
	id: string;
	label: string;
	/** 出力用（JSON/Markdown）。未設定・空なら書き出しに含めない。 */
	comment?: string;
	x: number;
	y: number;
	w: number;
	h: number;
}

/** 親グループ（キャンバス上の論理矩形と子一覧）。 */
export interface AnnotatorGroup {
	id: string;
	label: string;
	/** 出力用（JSON/Markdown）。未設定・空なら書き出しに含めない。 */
	comment?: string;
	collapsed: boolean;
	px: number;
	py: number;
	pw: number;
	ph: number;
	boxes: AnnotatorBox[];
	childSeq: number;
}

/** UI の編集対象レイヤー。 */
export type InteractionMode = "parent" | "child" | "drawChild";

/** エクスポート形式。 */
export type OutputFormat = "json" | "md";

/** x,y,w,h の軸平行矩形（絶対または相対）。 */
export interface AnnotatorRect {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** 8 方向＋辺のリサイズハンドル識別子。 */
export type ResizeHandle =
	| "nw"
	| "n"
	| "ne"
	| "e"
	| "se"
	| "s"
	| "sw"
	| "w";

/** ステージ上のドラッグ種別（親移動／親リサイズ／子移動／子リサイズ）。 */
export type DragMode =
	| "groupMove"
	| "parentResize"
	| "move"
	| "resize"
	| null;

/** ドラッグ開始時のポインタ位置（共通）。 */
export interface DragStartMoveChild {
	x: number;
	y: number;
}

/** 親グループ全体のドラッグ移動開始。 */
export interface DragStartGroupMove extends DragStartMoveChild {
	px0: number;
	py0: number;
	groupId: string;
}

/** 子矩形リサイズ開始時に保持する相対矩形スナップショット。 */
export interface DragStartResizeChild extends DragStartMoveChild {
	boxRel: AnnotatorRect;
}

/** 親グループ矩形のドラッグ前スナップショット。 */
export interface DragParentSnapshot {
	px: number;
	py: number;
	pw: number;
	ph: number;
}

/** undo/redo 用に丸ごと保存する編集状態。 */
export interface AnnotatorSnapshot {
	groups: AnnotatorGroup[];
	activeGroupId: string | null;
	selectedBoxIds: string[];
	interactionMode: InteractionMode;
	parentDraftNum: number | null;
	nextGroupId: number;
	nextBoxId: number;
}

/** 子矩形ヒット時のインデックス付き結果。 */
export interface HitChildResult {
	group: AnnotatorGroup;
	box: AnnotatorBox;
	gi: number;
	bi: number;
	abs: AnnotatorRect;
}

/** 単一選択時の子矩形（絶対座標つき）。 */
export interface PrimarySelectedChild {
	group: AnnotatorGroup;
	box: AnnotatorBox;
	abs: AnnotatorRect;
}
