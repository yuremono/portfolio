import { 
        // CaretRightIcon, 
        ArrowSquareOutIcon } from "@phosphor-icons/react";
import { useSectionCanvas } from "./useSectionCanvas";

interface CodingSectionProps {
	className?: string;
}

export function CodingSection({ className }: CodingSectionProps) {
	const { rootRef, canvasRef } = useSectionCanvas({
		text: "Coding",
		fontSize: 256,
		detailed: false,
		fillOpacity: 0.5,
	});

	return (
		<section
			ref={rootRef}
			data-l="CodingSection"
			className={` ${className ?? ""}`}
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
						## Coding - Web Development
					</h2>
					<div className="BudouxScroll mx-auto my-[3rem] md:text-xl">
						### WordPress
						<br />
						<br />
						実務で触れる機会のなかったWordPressの経験を積む為、静的htmlサイトからWordPressテーマ作成を行なっています。
						<br />
						<br />
						・Local / Xserver / 独自ドメイン で実務を想定する
						<br />
						・WordPress / PHP の作法を学ぶ
						<br />
						・ACF / CPTの使用、技術選定
						<br />
						・AI駆動管理画面編集、デプロイ、学習用ドキュメント作成
						<br />
						<br />
						CMS利用経験、CMS制作経験、AI駆動開発経験により比較的早く環境に合わせた構築ができると考えます。
						<div className="my-8 flex justify-end gap flex-wrap JsChR">
							<a
								href="https://yuremono.com/izakaya/"
								className="btn "
								target="_blank"
								rel="noopener noreferrer"
							>
								Izakaya Theme
								<ArrowSquareOutIcon />
							</a>
							<a
								href="https://github.com/yuremono/wp-izakaya"
								className="btn "
								target="_blank"
								rel="noopener noreferrer"
							>
								Repository
								<ArrowSquareOutIcon />
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
