import { Check, CopySimple, DownloadSimple } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ActionBarProps } from "./data";

export function ActionBar({ state, className }: ActionBarProps) {
	const [copyDone, setCopyDone] = useState(false);
	const copyDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (copyDoneTimerRef.current != null) {
				clearTimeout(copyDoneTimerRef.current);
			}
		};
	}, []);

	const handleCopyMarkdown = useCallback(async () => {
		await state.copyMarkdown();
		setCopyDone(true);

		if (copyDoneTimerRef.current != null) {
			clearTimeout(copyDoneTimerRef.current);
		}

		copyDoneTimerRef.current = window.setTimeout(() => {
			setCopyDone(false);
			copyDoneTimerRef.current = null;
		}, 1800);
	}, [state]);

	return (
		<div
			data-l="ActionBar"
			className={[
				"BorderT mt-0 shrink-0 bg-MC px-[--PX] py-2",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{/* 固定操作: Markdownプロンプトのコピーとダウンロード */}
			<div data-l="ActionGroup" className="grid  grid-cols-2 gap-[--gap]">
				<button
					type="button"
					onClick={handleCopyMarkdown}
					className={[
						"BorderXY inline-flex items-center justify-center gap-2 BabelRightDown px-4 py-3 text-xs font-bold transition-colors focus-visible:bg-WH/80",
						copyDone
							? "border-AC bg-TC text-AC  "
							: "bg-SC/70  hover:bg-AC/70",
					].join(" ")}
				>
					{copyDone ? (
						<Check aria-hidden="true" className="size-4" weight="bold" />
					) : (
						<CopySimple aria-hidden="true" className="size-4" weight="bold" />
					)}
					{copyDone ? "Copied Markdown" : "Copy Markdown"}
				</button>
				<button
					type="button"
					onClick={state.downloadMarkdown}
					className="leading-none BorderXY inline-flex items-center justify-center gap-2 BabelRightDown bg-SC/70 hover:bg-AC/70 px-4 py-3 text-xs font-bold text-TC   focus-visible:bg-WH"
				>
					<DownloadSimple aria-hidden="true" className="size-4" weight="bold" />
					Download Markdown
				</button>
			</div>
		</div>
	);
}
