import { type CSSProperties, type RefObject, useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { CameraIcon, ChatCircleTextIcon } from "@phosphor-icons/react";
import { findBoxById } from "./bboxGeometry";
import type { AnnotatorGroup } from "./bboxTypes";
import type { MutableState } from "./bboxPageModel";
import { setPendingParentDraftStorage } from "./bboxPendingParentDraft";
import { bboxScrollOverflowThumbClass } from "./bboxRootClasses";

const DND_MIME = "application/x-bbox-child-dnd";

function AnnotCommentTextarea({
	initialValue,
	onCommit,
}: {
	readonly initialValue: string;
	readonly onCommit: (value: string) => void;
}) {
	const [val, setVal] = useState(initialValue);
	return (
		<textarea
			id="annotator-sidebar-comment"
			rows={2}
			className="w-full resize-y rounded BorderXY border-accent/60 bg-BK/30 px-2 py-1 text-[10px] text-TC outline-none placeholder:text-GR/70"
			placeholder="出力に含めるコメント（空ならJSON/Markdownに出しません）"
			value={val}
			onChange={(e) => setVal(e.target.value)}
			onClick={(e) => e.stopPropagation()}
			onBlur={() => {
				onCommit(val);
			}}
		/>
	);
}

export interface BboxSidebarProps {
	readonly sidebarWidthPx: number;
	readonly groupTreeRef: RefObject<HTMLDivElement | null>;
	readonly st: MutableState;
	readonly stateRef: RefObject<MutableState>;
	readonly bump: () => void;
	readonly redraw: () => void;
	readonly commitAction: () => void;
	readonly hideLabelEditor: () => void;
	readonly editingGroupId: string | null;
	readonly setEditingGroupId: Dispatch<SetStateAction<string | null>>;
	readonly outputBody: string;
	readonly copyFlash: boolean;
	readonly handleCopyOutput: () => void;
	/** 親BBoxの表示範囲を画像で保存（ステージ上の画像＋注釈を合成） */
	readonly onParentRegionScreenshot: (groupId: string) => void;
}

function reorderBoxesAtIndex(
	group: AnnotatorGroup,
	from: number,
	to: number,
): void {
	if (from === to || from < 0 || to < 0) return;
	const arr = [...group.boxes];
	const [x] = arr.splice(from, 1);
	arr.splice(to, 0, x);
	group.boxes = arr;
}

/** 右カラム: グループツリーと JSON/Markdown 書き出し */
export default function BboxSidebar({
	sidebarWidthPx,
	groupTreeRef,
	st,
	stateRef,
	bump,
	redraw,
	commitAction,
	hideLabelEditor,
	editingGroupId,
	setEditingGroupId,
	outputBody,
	copyFlash,
	handleCopyOutput,
	onParentRegionScreenshot,
}: BboxSidebarProps) {
	const [commentKey, setCommentKey] = useState<string | null>(null);
	const [editingChildId, setEditingChildId] = useState<string | null>(null);
	const [dragOverSlot, setDragOverSlot] = useState<{
		groupId: string;
		insertBefore: number;
	} | null>(null);

	const persistParentComment = useCallback(
		(groupId: string, raw: string) => {
			const t = raw.trim();
			const x = stateRef.current;
			const g = x.groups.find((z) => z.id === groupId);
			if (!g) return;
			if (t) g.comment = t;
			else delete g.comment;
			commitAction();
		},
		[stateRef, commitAction],
	);

	const persistChildComment = useCallback(
		(groupId: string, boxId: string, raw: string) => {
			const t = raw.trim();
			const x = stateRef.current;
			const g = x.groups.find((z) => z.id === groupId);
			const b = g?.boxes.find((z) => z.id === boxId);
			if (!b) return;
			if (t) b.comment = t;
			else delete b.comment;
			commitAction();
		},
		[stateRef, commitAction],
	);

	const toggleCommentKey = useCallback((next: string) => {
		setCommentKey((prev) => (prev === next ? null : next));
	}, []);

	const onGroupTreeDragStart = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			const t = e.target as HTMLElement;
			if (t.closest("[data-child-dnd]")) return;
			e.preventDefault();
		},
		[],
	);

	const onChildDragStart = useCallback(
		(e: React.DragEvent<HTMLDivElement>, groupId: string, boxId: string) => {
			e.stopPropagation();
			const payload = JSON.stringify({ groupId, boxId });
			e.dataTransfer.setData(DND_MIME, payload);
			e.dataTransfer.setData("text/plain", payload);
			e.dataTransfer.effectAllowed = "move";
		},
		[],
	);

	const onChildDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>, groupId: string, insertBefore: number) => {
			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = "move";
			setDragOverSlot({ groupId, insertBefore });
		},
		[],
	);

	const clearDnDVisual = useCallback(() => {
		setDragOverSlot(null);
	}, []);

	const onGroupTreeDragOver = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			const types = [...e.dataTransfer.types];
			if (types.includes(DND_MIME) || types.includes("text/plain")) {
				e.preventDefault();
				e.dataTransfer.dropEffect = "move";
			}
		},
		[],
	);

	const onChildDragLeave = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			const rel = e.relatedTarget;
			if (rel instanceof Node && e.currentTarget.contains(rel)) return;
			setDragOverSlot(null);
		},
		[],
	);

	const onChildDrop = useCallback(
		(
			e: React.DragEvent<HTMLDivElement>,
			group: AnnotatorGroup,
			insertBefore: number,
		) => {
			e.preventDefault();
			e.stopPropagation();
			setDragOverSlot(null);
			const raw =
				e.dataTransfer.getData(DND_MIME) ||
				e.dataTransfer.getData("text/plain");
			if (!raw) return;
			let payload: { groupId: string; boxId: string };
			try {
				payload = JSON.parse(raw) as { groupId: string; boxId: string };
			} catch {
				return;
			}
			if (payload.groupId !== group.id) return;
			const from = group.boxes.findIndex((b) => b.id === payload.boxId);
			if (from < 0) return;
			if (from === insertBefore) return;
			let insertAt = insertBefore;
			if (from < insertBefore) insertAt = insertBefore - 1;
			reorderBoxesAtIndex(group, from, insertAt);
			commitAction();
		},
		[commitAction],
	);

	return (
		<aside
			data-l="SidebarPanel"
			aria-label="グループ一覧と出力"
			lang="ja"
			className="flex min-h-[18rem] w-full shrink-0 flex-col overflow-hidden BorderL bg-background/80 BS mt-0 md:min-h-0 md:w-[--bboxSidebarWidth]"
			style={
				{
					"--bboxSidebarWidth": `${sidebarWidthPx}px`,
					flexShrink: 0,
				} as CSSProperties
			}
		>
			<div
				data-l="GroupsTitle"
				className="shrink-0 BorderB PX py-2 text-[10px] font-normal uppercase tracking-[0.15em] text-GR"
			>
				Groups
			</div>
			<div
				data-l="GroupsScroller"
				className="max-h-[42vh] shrink-0 overflow-y-auto BorderB PX py-2"
			>
				<button
					type="button"
					className="mb-2.5 w-full rounded BorderXY border-dashed py-1.5 text-[11px] text-accent transition-colors hover:border-accent hover:bg-accent/5"
					onClick={() => {
						const x = stateRef.current;
						setPendingParentDraftStorage();
						if (x.hasImage) {
							x.parentDraftNum = x.nextGroupId;
							x.drawing = false;
							x.currentRect = null;
							hideLabelEditor();
						}
						bump();
						redraw();
					}}
				>
					+ グループ追加
				</button>
				<div
					data-l="GroupTree"
					ref={groupTreeRef}
					onDragStart={onGroupTreeDragStart}
					onDragOver={onGroupTreeDragOver}
				>
					{st.groups.length === 0 ? (
						<p className="px-0 py-1 text-[10px] text-GR">
							画像を開き「+ グループ追加」でキャンバス上に親 Parent
							の範囲をドラッグしてください
						</p>
					) : (
						st.groups.map((g, gi) => {
							const active = g.id === st.activeGroupId;
							let pillText = "";
							let pillTitle = "";
							if (active) {
								if (st.interactionMode === "drawChild") {
									pillText = "子追加";
									pillTitle = "子BBoxを矩形で追加中";
								} else if (st.interactionMode === "child") {
									pillText = "子編集";
									pillTitle = "ツリーで選んだ子のみ操作中";
								} else {
									pillText = "親";
									pillTitle =
										"親BBoxの移動・リサイズ（子の上ドラッグでグループ全体移動）";
								}
							}
							const pCommentOpen = commentKey === `p:${g.id}`;
							return (
								<div
									data-l={`GroupCard${gi + 1}`}
									key={g.id}
									className={`mb-1.5 overflow-hidden rounded BorderXY bg-BK/20 ${
										active
											? "BS border-accent bg-accent/10"
											: ""
									}`}
								>
									<div
										className="flex cursor-pointer items-center gap-1.5 px-2 py-1.5 text-[11px] hover:bg-background/5"
										onClick={(e) => {
											if ((e.target as HTMLElement).closest("[data-del]"))
												return;
											if ((e.target as HTMLElement).closest("[data-note]"))
												return;
											if ((e.target as HTMLElement).closest("[data-shot]"))
												return;
											if (
												(e.target as HTMLElement).closest("input") ||
												editingGroupId === g.id
											)
												return;
											if (
												(e.target as HTMLElement).closest("[data-chev]") &&
												g.boxes.length > 0
											) {
												g.collapsed = !g.collapsed;
												bump();
												return;
											}
											const x = stateRef.current;
											x.activeGroupId = g.id;
											x.interactionMode = "parent";
											x.selectedBoxIds = [];
											bump();
											redraw();
										}}
									>
										<span
											data-chev
											className={`w-3.5 shrink-0 select-none text-center text-GR ${g.boxes.length ? "" : "invisible"}`}
										>
											{g.collapsed ? "▶" : "▼"}
										</span>
										{active && (
											<span
												title={pillTitle}
												className="shrink-0 rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-BK"
											>
												{pillText}
											</span>
										)}
										{editingGroupId === g.id ? (
											<input
												className="min-w-0 flex-1 rounded BorderXY border-accent bg-BK/40 px-1 text-[11px] text-TC outline-none"
												autoComplete="off"
												defaultValue={g.label}
												onClick={(e) => e.stopPropagation()}
												onBlur={(e) => {
													const t = e.target.value.trim();
													if (t) g.label = t;
													setEditingGroupId(null);
													commitAction();
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														e.preventDefault();
														(e.target as HTMLInputElement).blur();
													}
												}}
												autoFocus
											/>
										) : (
											<span
												className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
												onDoubleClick={(e) => {
													e.stopPropagation();
													setEditingGroupId(g.id);
												}}
											>
												{g.label || "(無名)"}
											</span>
										)}
										<button
											type="button"
											data-shot
											disabled={!st.hasImage}
											title={
												st.hasImage
													? "親BBox範囲をPNG画像で保存"
													: "画像を開いてから保存できます"
											}
											aria-label="親BBox範囲をPNG画像で保存"
											className="shrink-0 rounded   p-0.5 text-TC opacity-80 hover:text-AC hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
											onClick={(e) => {
												e.stopPropagation();
												onParentRegionScreenshot(g.id);
											}}
										>
											<CameraIcon size={20} className="block" aria-hidden />
										</button>
										<button
											type="button"
											data-note
											title="出力用コメント"
											aria-label="出力用コメント"
											className="shrink-0 rounded   p-0.5 text-TC opacity-80 hover:text-AC hover:opacity-100"
											onClick={(e) => {
												e.stopPropagation();
												toggleCommentKey(`p:${g.id}`);
											}}
										>
											<ChatCircleTextIcon size={20} className="block" aria-hidden />
										</button>
										<button
											type="button"
											data-del
											title="グループ削除"
											className="shrink-0 px-1 text-sm leading-none text-GR hover:text-fourth"
											onClick={(e) => {
												e.stopPropagation();
												const x = stateRef.current;
												x.groups = x.groups.filter((z) => z.id !== g.id);
												if (x.activeGroupId === g.id)
													x.activeGroupId = x.groups[0]?.id ?? null;
												x.selectedBoxIds = x.selectedBoxIds.filter((id) =>
													Boolean(findBoxById(x.groups, id)),
												);
												setCommentKey((k) =>
													k?.startsWith(`p:${g.id}`) ||
													k?.includes(`:${g.id}:`)
														? null
														: k,
												);
												commitAction();
											}}
										>
											×
										</button>
									</div>
									{pCommentOpen && (
										<div className="px-2 pb-1.5 pl-7">
											<label className="sr-only" htmlFor="annotator-sidebar-comment">
												親グループの出力コメント
											</label>
											<AnnotCommentTextarea
												key={`p:${g.id}`}
												initialValue={g.comment ?? ""}
												onCommit={(v) => persistParentComment(g.id, v)}
											/>
										</div>
									)}
									<div className="px-2 pb-1.5 pl-7 text-[9px] text-GR opacity-85">
										親 {Math.round(g.pw)}×{Math.round(g.ph)} · 子{" "}
										{g.boxes.length}件
									</div>
									<div
										role="group"
										aria-label={
											g.label
												? `「${g.label}」の子BBox`
												: "子BBox"
										}
										className={`border-t border-GR/30 px-2 py-1 pb-1.5 pl-7 text-[10px] text-GR ${g.collapsed ? "hidden" : ""}`}
									>
										{g.boxes.map((b, bi) => {
											const childSelected =
												st.selectedBoxIds.includes(b.id) &&
												st.interactionMode === "child";
											const cKey = `c:${g.id}:${b.id}`;
											const cOpen = commentKey === cKey;
											const showDropBefore =
												dragOverSlot?.groupId === g.id &&
												dragOverSlot.insertBefore === bi;
											return (
												<div key={b.id}>
													{showDropBefore ? (
														<div className="my-0.5 h-0.5 rounded bg-accent/70" />
													) : null}
													<div
														data-child-dnd
														draggable
														role="treeitem"
														tabIndex={0}
														aria-selected={childSelected}
														className={`cursor-grab overflow-hidden rounded py-0.5 hover:bg-background/5 active:cursor-grabbing ${
															childSelected
																? "border-l-2 border-accent bg-accent/10 pl-1.5 text-accent"
																: ""
														}`}
														onDragStart={(e) =>
															onChildDragStart(e, g.id, b.id)
														}
														onDragOver={(e) =>
															onChildDragOver(e, g.id, bi)
														}
														onDragLeave={onChildDragLeave}
														onDrop={(e) => onChildDrop(e, g, bi)}
														onDragEnd={clearDnDVisual}
														onClick={(e) => {
															if (
																(e.target as HTMLElement).closest(
																	"[data-note]",
																)
															)
																return;
															e.stopPropagation();
															const x = stateRef.current;
															x.activeGroupId = g.id;
															x.interactionMode = "child";
															x.selectedBoxIds = [b.id];
															bump();
															redraw();
														}}
														onKeyDown={(e) => {
															if (
																e.key === "Enter" ||
																e.key === " "
															) {
																e.preventDefault();
																e.currentTarget.click();
															}
														}}
													>
														<div className="flex items-center gap-1">
															<span className="shrink-0 text-GR">·</span>
															{editingChildId === b.id ? (
																<input
																	className="min-w-0 flex-1 rounded BorderXY border-accent bg-BK/40 px-1 text-[11px] text-TC outline-none"
																	autoComplete="off"
																	draggable={false}
																	defaultValue={b.label}
																	onClick={(e) => e.stopPropagation()}
																	onBlur={(e) => {
																		const t = e.target.value.trim();
																		if (t) b.label = t;
																		setEditingChildId(null);
																		commitAction();
																	}}
																	onKeyDown={(e) => {
																		if (e.key === "Enter") {
																			e.preventDefault();
																			(
																				e.target as HTMLInputElement
																			).blur();
																		}
																	}}
																	autoFocus
																/>
															) : (
																<span
																	className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-TC"
																	onDoubleClick={(e) => {
																		e.stopPropagation();
																		setEditingChildId(b.id);
																	}}
																>
																	{b.label || b.id}
																</span>
															)}
															<button
																type="button"
																data-note
																draggable={false}
																title="出力用コメント"
																aria-label="出力用コメント"
																className="shrink-0 rounded   p-0.5 text-TC opacity-80 hover:text-AC hover:opacity-100"
																onClick={(e) => {
																	e.stopPropagation();
																	toggleCommentKey(cKey);
																}}
															>
																<ChatCircleTextIcon
																	size={20}
																	className="block"
																	aria-hidden
																/>
															</button>
														</div>
													</div>
													{cOpen ? (
														<div className="mt-0.5 pl-4">
															<label
																className="sr-only"
																htmlFor="annotator-sidebar-comment"
															>
																子「{b.label}」の出力コメント
															</label>
															<AnnotCommentTextarea
																key={cKey}
																initialValue={b.comment ?? ""}
																onCommit={(v) =>
																	persistChildComment(g.id, b.id, v)
																}
															/>
														</div>
													) : null}
												</div>
											);
										})}
										{g.boxes.length > 0 ? (
											<div
												className="min-h-2 rounded py-0.5 hover:bg-background/5"
												onDragOver={(e) =>
													onChildDragOver(e, g.id, g.boxes.length)
												}
												onDragLeave={onChildDragLeave}
												onDrop={(e) => onChildDrop(e, g, g.boxes.length)}
												onDragEnd={clearDnDVisual}
											/>
										) : null}
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
			<section
				data-l="OutputSection"
				aria-label="書き出し"
				className="flex min-h-0 min-w-0 flex-1 flex-col"
			>
				<span className="sr-only" aria-live="polite">
					{copyFlash ? "クリップボードにコピーしました" : ""}
				</span>
				<div className="shrink-0 BorderB PX py-2 text-[10px] font-normal uppercase tracking-[0.15em] text-GR">
					Output
				</div>
				<div className="flex shrink-0 gapH PX pt-2">
					{(["json", "md"] as const).map((fmt) => (
						<button
							key={fmt}
							type="button"
							aria-pressed={st.outputFormat === fmt}
							aria-label={
								fmt === "json"
									? "JSON形式で出力"
									: "Markdown形式で出力"
							}
							className={`flex-1 cursor-pointer rounded BorderXY py-1.5 text-[10px] font-normal uppercase tracking-[0.08em] transition-colors hover:border-accent hover:text-accent ${
								st.outputFormat === fmt
									? "border-accent bg-accent/10 text-accent"
									: "text-GR"
							}`}
							onClick={() => {
								stateRef.current.outputFormat = fmt;
								bump();
							}}
						>
							{fmt === "json" ? "JSON" : "Markdown"}
						</button>
					))}
				</div>
				<pre
					className={`min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words PX py-3 text-[11px] leading-relaxed text-third ${bboxScrollOverflowThumbClass}`}
					tabIndex={0}
				>
					{st.groups.length === 0 ? (
						<span className="italic text-GR">
							グループを追加し、画像を開いてください
						</span>
					) : (
						outputBody
					)}
				</pre>
				<button
					type="button"
					disabled={!st.groups.length}
					aria-label={
						st.groups.length
							? copyFlash
								? "コピー済み"
								: "出力テキストをクリップボードにコピー"
							: "グループがないためコピーできません"
					}
					className="m-4 mt-0 shrink-0 rounded BorderXY py-2 text-[11px] uppercase tracking-wide text-accent transition-colors hover:border-accent hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-[0.35]"
					onClick={handleCopyOutput}
				>
					{copyFlash ? "Copied" : "Copy to Clipboard"}
				</button>
			</section>
		</aside>
	);
}
