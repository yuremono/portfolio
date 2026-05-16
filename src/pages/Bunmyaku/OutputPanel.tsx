import { Check, CopySimple, DownloadSimple, ArrowsOutSimple } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DialogBase } from "../../components/DialogBase";
import { ActionBar } from "./ActionBar";
import type { OutputPanelProps } from "./data";

const promptTypes = new Set(["PROMPT", "PROMPT_FOR_SKILL"]);

const downloadText = (fileName: string, text: string) => {
	const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
	anchor.style.display = "none";
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
};

export function OutputPanel({ state, className }: OutputPanelProps) {
	const isPrompt = promptTypes.has(state.outputType);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editedMarkdown, setEditedMarkdown] = useState(state.generatedMarkdown);
	const [dialogCopyDone, setDialogCopyDone] = useState(false);
	const dialogCopyDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (dialogCopyDoneTimerRef.current != null) {
				clearTimeout(dialogCopyDoneTimerRef.current);
			}
		};
	}, []);

	const openPreviewDialog = useCallback(() => {
		setEditedMarkdown(state.generatedMarkdown);
		setDialogCopyDone(false);
		setDialogOpen(true);
	}, [state.generatedMarkdown]);

	const handleDialogCopyMarkdown = useCallback(async () => {
		await navigator.clipboard.writeText(editedMarkdown);
		setDialogCopyDone(true);

		if (dialogCopyDoneTimerRef.current != null) {
			clearTimeout(dialogCopyDoneTimerRef.current);
		}

		dialogCopyDoneTimerRef.current = window.setTimeout(() => {
			setDialogCopyDone(false);
			dialogCopyDoneTimerRef.current = null;
		}, 1800);
	}, [editedMarkdown]);

	const handleDialogDownloadMarkdown = useCallback(() => {
		downloadText(state.currentOutput.fileName, editedMarkdown);
	}, [editedMarkdown, state.currentOutput.fileName]);

	return (
		<aside
			data-l="OutputPanel"
			className={[
				"BorderT mt-0 flex min-h-[70lvh] w-full flex-col lg:BorderL lg:min-h-[100lvh] lg:w-full lg:border-t-0",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{/* 右カラム: 生成されるMarkdown本文またはAI指示文のプレビュー */}
			<section data-l="PreviewSection" className="flex min-h-0 flex-1 flex-col">
				<header className="BorderB  px-[--PX] py-4">
					<p className="text-xs font-semibold text-AC">Preview</p>
					<div className="mt-2 flex items-start justify-between gap-[--gap]">
						<div>
							<h2 className=" leading-[--HLH] tracking-[--HLS] text-WH">
								{state.currentOutput.label}
							</h2>
							{isPrompt ? (
								<p className="BorderXY mt-2 inline-flex rounded-[--rad] bg-SC/20 px-3 py-1 text-xs font-semibold text-WH/80">
									AI Instruction
								</p>
							) : null}
						</div>
					</div>
				</header>

				<div className="min-h-0 flex-1 overflow-y-auto px-[--PX] py-[--PX]">
					<div className="relative min-h-full">
						<button
							type="button"
							className="BorderXY absolute right-0 top-0 z-10 grid size-9 place-items-center BabelRightDown bg-MC/90 text-WH transition hover:bg-AC/70 focus-visible:bg-AC/70"
							onClick={openPreviewDialog}
							aria-label="出力結果をダイアログで編集"
						>
							<ArrowsOutSimple aria-hidden="true" className="size-4" weight="bold" />
						</button>
						<pre className="BorderXY min-h-full overflow-x-auto whitespace-pre-wrap rounded-[--rad] p-[--PX] text-xs leading-[--LH] text-WH/80">
							{state.generatedMarkdown}
						</pre>
					</div>
				</div>
			</section>
			<ActionBar state={state} />
			<DialogBase
				id="bunmyaku-output-preview-dialog"
				open={dialogOpen}
				dialogAriaLabel="出力結果編集"
				closeAriaLabel="出力結果編集ダイアログを閉じる"
				onOpenChange={setDialogOpen}
                        >
                                
				<section
					data-l="PreviewSectionDialog"
					className="w-[1240px] mx-auto  flex h-[calc(100lvh_-_var(--PX2)*2)]  flex-col overflow-hidden text-WH"
				>
					<header className="BorderB shrink-0 px-[--PX] py-4">
						<p className="text-xs font-semibold text-AC">Preview</p>
						<div className="mt-2 flex items-start justify-between gap-[--gap]">
							<div>
								<h2 className=" leading-[--HLH] tracking-[--HLS] text-WH">
									{state.currentOutput.label}
								</h2>
								{isPrompt ? (
									<p className="BorderXY mt-2 inline-flex rounded-[--rad] bg-SC/20 px-3 py-1 text-xs font-semibold text-WH/80">
										AI Instruction
									</p>
								) : null}
							</div>
						</div>
					</header>

					<div className=" flex-1 overflow-hidden px-[--PX] py-[--PX]">
						<textarea
							className="BorderXY h-full  w-full resize-none overflow-auto whitespace-pre-wrap rounded-[--rad] bg-MC p-[--PX] text-xs leading-[--LH] text-WH/80 outline-none focus:border-WH/80"
							value={editedMarkdown}
							onChange={(event) => setEditedMarkdown(event.target.value)}
							aria-label="出力結果の編集"
						/>
					</div>

					<div data-l="ActionBar" className="BorderT mt-0 shrink-0 bg-MC px-[--PX] py-2">
						<div data-l="ActionGroup" className="grid  grid-cols-2 gap-[--gap]">
							<button
								type="button"
								onClick={handleDialogCopyMarkdown}
								className={[
									"BorderXY inline-flex items-center justify-center gap-2 BabelRightDown px-4 py-3 text-xs font-bold transition-colors focus-visible:bg-WH/80",
									dialogCopyDone
										? "border-AC bg-TC text-AC  "
										: "bg-SC/70  hover:bg-AC/70",
								].join(" ")}
							>
								{dialogCopyDone ? (
									<Check aria-hidden="true" className="size-4" weight="bold" />
								) : (
									<CopySimple aria-hidden="true" className="size-4" weight="bold" />
								)}
								{dialogCopyDone ? "Copied Markdown" : "Copy Markdown"}
							</button>
							<button
								type="button"
								onClick={handleDialogDownloadMarkdown}
								className="leading-none BorderXY inline-flex items-center justify-center gap-2 BabelRightDown bg-SC/70 hover:bg-AC/70 px-4 py-3 text-xs font-bold text-TC   focus-visible:bg-WH"
							>
								<DownloadSimple aria-hidden="true" className="size-4" weight="bold" />
								Download Markdown
							</button>
						</div>
					</div>
				</section>
			</DialogBase>
		</aside>
	);
}
