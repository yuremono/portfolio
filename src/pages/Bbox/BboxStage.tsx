import {
	type KeyboardEvent as ReactKeyboardEvent,
	type MouseEvent as ReactMouseEvent,
	type RefObject,
	type Dispatch,
	type SetStateAction,
} from "react";
import { findBoxById, hitTestChildAbs, snapVal } from "./bboxGeometry";
import type { MutableState } from "./bboxPageModel";
import { bboxScrollOverflowThumbClass } from "./bboxRootClasses";

export interface BboxStageProps {
	readonly stageRef: RefObject<HTMLDivElement | null>;
	readonly imgRef: RefObject<HTMLImageElement | null>;
	readonly canvasRef: RefObject<HTMLCanvasElement | null>;
	readonly labelBlurTimeoutRef: RefObject<ReturnType<typeof setTimeout> | null>;
	readonly st: MutableState;
	readonly stateRef: RefObject<MutableState>;
	readonly bump: () => void;
	readonly redraw: () => void;
	readonly imgUrl: string | null;
	readonly labelDraft: string;
	readonly setLabelDraft: Dispatch<SetStateAction<string>>;
	readonly getPos: (clientX: number, clientY: number) => { x: number; y: number };
	readonly handleCanvasSectionDragOver: (
		e: React.DragEvent<HTMLElement>,
	) => void;
	readonly handleCanvasSectionDrop: (e: React.DragEvent<HTMLElement>) => void;
	readonly onCanvasPointerDown: (e: ReactMouseEvent<HTMLElement>) => void;
	readonly onImageLoad: () => void;
	readonly showLabelEditorForEdit: (boxId: string) => void;
	readonly hideLabelEditor: () => void;
	readonly commitAction: () => void;
}

/** 左カラム: ドロップ・ステージ・画像・キャンバス・ラベル編集入力 */
export default function BboxStage({
	stageRef,
	imgRef,
	canvasRef,
	labelBlurTimeoutRef,
	st,
	stateRef,
	bump,
	redraw,
	imgUrl,
	labelDraft,
	setLabelDraft,
	getPos,
	handleCanvasSectionDragOver,
	handleCanvasSectionDrop,
	onCanvasPointerDown,
	onImageLoad,
	showLabelEditorForEdit,
	hideLabelEditor,
	commitAction,
}: BboxStageProps) {
	return (
		<section
			data-l="StageCanvas"
			aria-label="画像編集キャンバス"
			className={`relative flex min-w-0 shrink-0 justify-center overflow-auto bg-stage PX py-6 md:min-h-0 md:flex-1 ${bboxScrollOverflowThumbClass}`}
			onDragOver={handleCanvasSectionDragOver}
			onDrop={handleCanvasSectionDrop}
			onMouseDown={(e) => {
				if (!st.hasImage) return;
				onCanvasPointerDown(e);
			}}
		>
			<div
				id="annotator-size-badge"
				className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-wide text-GR"
			>
				{st.hasImage && st.naturalW
					? `${st.naturalW} × ${st.naturalH} px（表示） / 出力基準 W ${st.containerW}px`
					: ""}
			</div>
			<div
				ref={stageRef}
				className={`relative shrink-0 bg-rail ${
					st.hasImage ? "BorderXY BS" : ""
				}`}
				style={
					st.hasImage && st.naturalW
						? { width: st.naturalW, height: st.naturalH }
						: undefined
				}
				onMouseLeave={() => {
					if (stageRef.current)
						stageRef.current.style.cursor = "default";
				}}
				onDoubleClick={(e) => {
					const x = stateRef.current;
					if (!x.hasImage || x.interactionMode !== "child") return;
					const p = getPos(e.clientX, e.clientY);
					const hit = hitTestChildAbs(
						x.groups,
						snapVal(p.x, x.snapSize),
						snapVal(p.y, x.snapSize),
						null,
					);
					if (hit) {
						e.preventDefault();
						x.selectedBoxIds = [hit.box.id];
						bump();
						redraw();
						showLabelEditorForEdit(hit.box.id);
					}
				}}
			>
				{!st.hasImage && (
					<div className="flex h-[300px] w-[600px] max-w-full flex-col items-center justify-center gap-3 rounded BorderXY border-dashed text-[13px] tracking-wide text-GR">
						<span className="text-[32px] opacity-40" aria-hidden="true">
							⊞
						</span>
						<div className="text-center">
							画像をここにドロップ
							<br />
							または「+ 画像を開く」
						</div>
					</div>
				)}
				{imgUrl && (
					<img
						ref={imgRef}
						src={imgUrl}
						alt=""
						draggable={false}
						className={
							st.hasImage
								? "pointer-events-none block max-w-none select-none align-top"
								: "hidden"
						}
						onLoad={onImageLoad}
					/>
				)}
				<canvas
					ref={canvasRef}
					className="absolute left-0 top-0"
				/>
				<input
					id="annotator-label-editor"
					type="text"
					maxLength={120}
					autoComplete="off"
					value={labelDraft}
					onChange={(e) => setLabelDraft(e.target.value)}
					className={`absolute z-[5] min-w-[160px] rounded BorderXY border-2 border-accent bg-stage/95 px-4 py-2.5 text-center text-[15px] text-TC BS ${st.labelEditTarget ? "block" : "hidden"}`}
					onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
						if (e.key === "Escape") {
							e.preventDefault();
							hideLabelEditor();
						}
						if (e.key === "Enter") {
							e.preventDefault();
							const text = labelDraft.trim();
							const tid = stateRef.current.labelEditTarget;
							if (!tid) return;
							if (!text) return;
							const found = findBoxById(stateRef.current.groups, tid);
							if (found && found.box.label !== text) {
								found.box.label = text;
								hideLabelEditor();
								commitAction();
							} else hideLabelEditor();
						}
					}}
					onBlur={() => {
						if (labelBlurTimeoutRef.current != null) {
							clearTimeout(labelBlurTimeoutRef.current);
						}
						labelBlurTimeoutRef.current = window.setTimeout(() => {
							labelBlurTimeoutRef.current = null;
							const x = stateRef.current;
							if (document.activeElement?.id === "annotator-label-editor")
								return;
							if (!x.labelEditTarget) return;
							const text = labelDraft.trim();
							const found = findBoxById(x.groups, x.labelEditTarget);
							if (found && text && found.box.label !== text) {
								found.box.label = text;
								commitAction();
							}
							hideLabelEditor();
						}, 100);
					}}
				/>
			</div>
		</section>
	);
}
