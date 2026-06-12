import {
         CaretRightIcon, 
        ArrowSquareOutIcon
        
 } from "@phosphor-icons/react";
import { useSectionCanvas } from "./useSectionCanvas";

interface DesignSectionProps {
	className?: string;
}

export function DesignSection({ className }: DesignSectionProps) {
	const { rootRef, canvasRef } = useSectionCanvas({
		text: "Design",
		fontSize: 256,
		detailed: false,
		fillOpacity: 0.5,
	});

	return (
		<section
			ref={rootRef}
			data-l="DesignSection"
			className={className}
		>
			<div className="relative  [grid-area:1/1]  w-full mx-auto">
				<div className="sticky  top-0   grid  place-items-center ">
					<canvas
						ref={canvasRef}
						className="block  w-full "
						aria-hidden
					/>
				</div>
			</div>
			<div className="WTS [--WTS:var(--tsw)_var(--background)] relative z-10  PX [grid-area:1/1]  max-w-[48em] mx-auto">
				<div className="[--LS:0.1em]   ">
					<h2 className=" h2FZ JsRight  font-normal">
						## Design
					</h2>
					<div className="BudouxScroll mx-auto my-[3rem] md:text-xl">
						### PhotoShop デザイン抜粋
						<br />
						<br />
						実務で作成したデザインのjpg書き出しをまとめています。
						<br />
						<br />
						<div className=" flex justify-end gap flex-wrap JsChR">
							<a href="https://www.figma.com/design/mgBSXGqYv8sgr1Ttk2x6kZ/design_yano?node-id=0-1&t=6yNMgLicWGgUJ9Gk-1" className="btn " target="_blank"
							rel="noopener noreferrer">
								Extarnal Link
								<CaretRightIcon className=" align-bottom ml-1" />
							</a>
						</div>
						<br />
						<br />
						### 個人制作での取り組み
						<br />
						<br />
                                                ・FigmaMCP 、Pencil.dev の Agent SKILLS作成。
						<br />
						・DESIGN.md 、ChatGPT Image を基点としたゼロからのページ作成の検証
						<br />
						<br />
						<div className="flex justify-end gap flex-wrap JsChL">
							<a
								href="https://github.com/yuremono/portfolio"
                                                                className="inline-block md:text-xl hover:invert "
                                                                target="_blank"
							rel="noopener noreferrer"
							>
								Portfolio リポジトリにSKILLをまとめています
                                                                <ArrowSquareOutIcon className=" align-middle ml-1 mb-1" />

							</a>
						</div>
						<div className="mt-4 flex justify-end gap flex-wrap JsChL">
							<a
								href="/activity#panel-0425"
								className=" md:text-xl hover:invert "
							>
								GPT Image レポート
								<CaretRightIcon className=" align-middle ml-0 mb-1" />
							</a>
							<a
								href="/lumaport"
								className=" md:text-xl hover:invert "
							>
								GPT Image 作成ページ
								<CaretRightIcon className=" align-middle ml-0 mb-1" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
