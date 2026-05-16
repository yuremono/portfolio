import { ActionBar } from "./ActionBar";
import type { OutputPanelProps } from "./data";

const promptTypes = new Set(["PROMPT", "PROMPT_FOR_SKILL"]);

export function OutputPanel({ state, className }: OutputPanelProps) {
	const isPrompt = promptTypes.has(state.outputType);

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
					<pre className="BorderXY min-h-full overflow-x-auto whitespace-pre-wrap rounded-[--rad] p-[--PX] text-xs leading-[--LH] text-WH/80">
						{state.generatedMarkdown}
					</pre>
				</div>
			</section>
			<ActionBar state={state} />
		</aside>
	);
}
