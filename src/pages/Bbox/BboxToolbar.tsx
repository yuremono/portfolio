import type { ChangeEvent, RefObject } from "react";
import BboxManualDialog from "./BboxManualDialog";
import type { MutableState } from "./bboxPageModel";
import { Link } from "react-router-dom";
import { useSessionInitialOpen } from "../../hooks/useSessionInitialOpen";


export interface BboxToolbarProps {
	readonly fileInputRef: RefObject<HTMLInputElement | null>;
	readonly st: MutableState;
	readonly stateRef: RefObject<MutableState>;
	readonly bump: () => void;
	readonly redraw: () => void;
	readonly undo: () => void;
	readonly redo: () => void;
	readonly undoDisabled: boolean;
	readonly redoDisabled: boolean;
	readonly handleToolbarImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
	readonly IMAGE_INPUT_ACCEPT: string;
	/** 開発サーバーでのみ実行（本番は UI のみ・ハンドラ先頭で終了）。 */
	readonly onLocalBatchExport: () => void | Promise<void>;
	readonly localBatchExportActive: boolean;
}

/** 画面上部: 画像読込・幅プリセット・スナップ・列ガイド・Undo/Redo・モード・全消去 */
export default function BboxToolbar({
	fileInputRef,
	st,
	stateRef,
	bump,
	redraw,
	undo,
	redo,
	undoDisabled,
	redoDisabled,
	handleToolbarImageChange,
	IMAGE_INPUT_ACCEPT,
	onLocalBatchExport,
	localBatchExportActive,
}: BboxToolbarProps) {
	const manualInitialOpen = useSessionInitialOpen("bbox_manual_auto_open");

	return (
		<header
			data-l="EditorToolbar"
			className="flex shrink-0 flex-wrap items-center gapH PX  BorderB bg-background/80 BS min-h-[--head]"
			aria-label="編集ツールバー"
		>
			<li className="NavLi">
				<Link to="/">HOME</Link>
			</li>
			<span className="h-5 w-px shrink-0 bg-GR/50" aria-hidden="true" />
			<label className="cursor-pointer whitespace-nowrap rounded BorderXY px-3 py-[5px] text-[13px] transition-colors hover:border-accent hover:text-accent">
				+ 画像を開く
				<input
					ref={fileInputRef}
					type="file"
					accept={IMAGE_INPUT_ACCEPT}
					className="hidden"
					onChange={handleToolbarImageChange}
				/>
			</label>
			<span className="h-5 w-px shrink-0 bg-GR/50" aria-hidden="true" />
			<div
				data-l="WidthPresets"
				className="flex flex-wrap items-center gap-1"
			>
				<span className="mr-0.5 whitespace-nowrap text-[11px] text-GR">
					W:
				</span>
				{[1920, 1440, 768, 420].map((w) => (
					<button
						key={w}
						type="button"
						aria-pressed={st.containerW === w}
						aria-label={`表示幅 ${w} ピクセル`}
						className={`whitespace-nowrap rounded BorderXY px-[10px] py-1 text-[11px] transition-colors  hover:border-accent hover:text-accent ${
							st.containerW === w
								? "border-accent bg-accent/10 text-accent"
								: "text-GR"
						}`}
						onClick={() => {
							stateRef.current.containerW = w;
							bump();
						}}
					>
						{w}
					</button>
				))}
			</div>
			<span className="h-5 w-px shrink-0 bg-GR/50" aria-hidden="true" />
			<div
				data-l="SnapPresets"
				className="flex flex-wrap items-center gap-1"
			>
				<span className="mr-0.5 whitespace-nowrap text-[11px] text-GR">
					Snap:
				</span>
				{[
					{ v: 0, lab: "OFF" },
					{ v: 4, lab: "4px" },
					{ v: 8, lab: "8px" },
					{ v: 16, lab: "16px" },
					{ v: 20, lab: "20px" },
				].map(({ v, lab }) => (
					<button
						key={v}
						type="button"
						aria-pressed={st.snapSize === v}
						aria-label={`スナップ ${lab}`}
						className={`whitespace-nowrap rounded BorderXY px-[10px] py-1 text-[11px] transition-colors hover:border-accent hover:text-accent ${
							st.snapSize === v
								? "border-accent bg-accent/10 text-accent"
								: "text-GR"
						}`}
						onClick={() => {
							stateRef.current.snapSize = v;
							bump();
						}}
					>
						{lab}
					</button>
				))}
			</div>
			<span className="h-5 w-px shrink-0 bg-GR/50" aria-hidden="true" />
			<div
				data-l="GuidePresets"
				className="flex flex-wrap items-center gap-1"
			>
				<span className="mr-0.5 whitespace-nowrap text-[11px] text-GR">
					Guide:
				</span>
				{[0, 4, 8, 12, 16, 20].map((c) => (
					<button
						key={c}
						type="button"
						aria-pressed={st.columns === c}
						aria-label={c === 0 ? "ガイドをオフ" : `ガイド ${c}`}
						className={`whitespace-nowrap rounded BorderXY px-[10px] py-1 text-[11px] transition-colors hover:border-accent hover:text-accent ${
							st.columns === c
								? "border-accent bg-accent/10 text-accent"
								: "text-GR"
						}`}
						onClick={() => {
							stateRef.current.columns = c;
							bump();
							requestAnimationFrame(() => redraw());
						}}
					>
						{c === 0 ? "OFF" : c}
					</button>
				))}
			</div>
			<span className="h-5 w-px shrink-0 bg-GR/50" aria-hidden="true" />
			<div
				data-l="HistoryGroup"
				className="flex flex-wrap items-center gap-1"
				role="group"
				aria-label="履歴操作"
			>
				<button
					type="button"
					title="Cmd+Z"
					aria-label="元に戻す（⌘Z）"
					disabled={undoDisabled}
					className="whitespace-nowrap rounded BorderXY px-[10px] py-1 text-[11px] text-GR transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-[0.35]"
					onClick={undo}
				>
					Undo
				</button>
				<button
					type="button"
					title="Cmd+Shift+Z"
					aria-label="やり直し（⇧⌘Z）"
					disabled={redoDisabled}
					className="whitespace-nowrap rounded BorderXY px-[10px] py-1 text-[11px] text-GR transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-[0.35]"
					onClick={redo}
				>
					Redo
				</button>
			</div>
			<span className="h-5 w-px shrink-0 bg-GR/50" aria-hidden="true" />
			<div
				data-l="ModeBar"
				className={`flex flex-wrap items-center gap-1 ${st.activeGroupId && st.hasImage ? "flex" : "hidden"}`}
				aria-hidden={!(st.activeGroupId && st.hasImage)}
			>
				<span className="mr-0.5 whitespace-nowrap text-[11px] text-GR">
					モード:
				</span>
				<button
					type="button"
					title="親BBoxの移動・リサイズ"
					aria-pressed={st.interactionMode === "parent"}
					aria-label="親グループ編集モード"
					className={`whitespace-nowrap rounded BorderXY px-[10px] py-1 text-[11px] transition-colors hover:border-accent hover:text-accent ${
						st.interactionMode === "parent"
							? "border-accent bg-accent/10 text-accent"
							: "text-GR"
					}`}
					onClick={() => {
						const x = stateRef.current;
						if (!x.activeGroupId) return;
						x.interactionMode = "parent";
						x.selectedBoxIds = [];
						bump();
						redraw();
					}}
				>
					親グループ
				</button>
				<button
					type="button"
					title="親の内側に子BBoxを追加"
					aria-pressed={st.interactionMode === "drawChild"}
					aria-label="子ボックス追加描画モード"
					className={`whitespace-nowrap rounded BorderXY px-[10px] py-1 text-[11px] transition-colors hover:border-accent hover:text-accent ${
						st.interactionMode === "drawChild"
							? "border-accent bg-accent/10 text-accent"
							: "text-GR"
					}`}
					onClick={() => {
						const x = stateRef.current;
						if (!x.activeGroupId) return;
						x.interactionMode = "drawChild";
						x.selectedBoxIds = [];
						bump();
						redraw();
					}}
				>
					子を追加描画
				</button>
			</div>
			<span
				className={`text-[11px] leading-snug text-accent ${st.parentDraftNum != null ? "inline max-w-[280px]" : "hidden"}`}
			>
				キャンバスで親 Parent {st.parentDraftNum} の範囲をドラッグ（Esc
				でキャンセル）
			</span>
			<div
				data-l="ToolbarEnd"
				className="ml-auto flex flex-wrap items-center gap-1"
			>
				<BboxManualDialog initialOpen={manualInitialOpen} />
				<button
					type="button"
					title={
						localBatchExportActive
							? "Copy to Clipboard 相当を clipboard.md に書き、各親BBoxの合成PNGを src/pages/Bbox/(日本時間12桁ディレクトリ)/ に保存（開発サーバー専用）"
							: "静的デプロイでは保存されません。npm run dev で利用できます"
					}
					aria-label="一括生成（ローカル限定）"
					className="whitespace-nowrap rounded BorderXY px-2 py-[5px] text-[11px] text-GR transition-colors hover:border-accent hover:text-accent"
					onClick={() => {
						void onLocalBatchExport();
					}}
				>
					一括生成（ローカル限定）
				</button>
				{/*
				Clear All 復元時は BboxToolbar に initHistory を Props 経由で戻すこと。
				<button
					type="button"
					aria-label="すべてのグループと注釈を削除"
					className="rounded BorderXY border-fourth px-3 py-[5px] text-xs text-fourth transition-colors hover:bg-fourth/10"
					onClick={() => {
						const x = stateRef.current;
						x.groups = [];
						x.activeGroupId = null;
						x.selectedBoxIds = [];
						x.interactionMode = "parent";
						x.nextGroupId = 1;
						x.nextBoxId = 1;
						x.drawing = false;
						x.currentRect = null;
						x.dragMode = null;
						x.dragParent0 = null;
						x.parentDraftNum = null;
						x.labelEditTarget = null;
						x.historySuspended = true;
						initHistory();
						x.historySuspended = false;
						bump();
						redraw();
					}}
				>
					Clear All
				</button>
					*/}
			</div>
		</header>
	);
}
