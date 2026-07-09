import {
	// CaretRightIcon,
	ArrowSquareOutIcon,
} from "@phosphor-icons/react";
import { useSectionCanvas } from "./useSectionCanvas";
import { NodeStack } from "../../components/NodeStack";
import { Image } from "../../components/Image";
import { getAssetPath } from "../../lib/assetPath";

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
					{/* <div className="BudouxScroll mx-auto my-[3rem] md:text-xl"> */}
					<div className=" mx-auto my-[3rem] md:text-xl">
						### WordPress
						<br />
						<br />
						実務で触れる機会のなかったWordPressの経験を積む為、静的htmlサイトからWordPressテーマ作成を行なっています。
						<br />
						<NodeStack className="MY">
							<div className=" Cards bp-none justify-between [--gap:0px]  text-center">
								<div className="JsSheer  item PX2 PY OutlineXY outline-WH aspect-[4/1] content-center min-w-[70%]">
									<span className="[font-size:0.75em]">旧ポートフォリオ / 過去案件 / ClaudeDisign</span><br/>HTML作成
								</div>
								<div className="JsSheer  item PX2 PY OutlineXY outline-WH aspect-[4/1] content-center min-w-[70%] ml-auto">
                                                                <span className="[font-size:0.75em]">Local 開発 / Xserver WPインストール</span><br/>テーマ構築
								</div>
								<div className="JsSheer  item PX2 PY OutlineXY outline-WH aspect-[4/1] content-center min-w-[70%]">
                                                                <span className="[font-size:0.75em]">ACF / CPT / SCF / SimpleCustomPostOrder</span><br/>管理画面設計
									
								</div>
								<div className="JsSheer  item PX2 PY OutlineXY outline-WH aspect-[4/1] content-center min-w-[70%] ml-auto">
                                                                <span className="[font-size:0.75em]">html-to-wp / wp-admin / wp-deplay</span><br/>スキル作成
								</div>
							</div>
						</NodeStack>
						{/* ・Local / Xserver / 独自ドメイン で実務を想定する
						<br />
						・WordPress / PHP の作法を学ぶ
						<br />
						・ACF / CPTの使用、技術選定
						<br />
						・AI駆動管理画面編集、デプロイ、学習用ドキュメント作成
						<br />
						<br />
						CMS利用経験、CMS制作経験、AI駆動開発経験により比較的早く環境に合わせた構築ができると考えます。 */}
						<NodeStack className="MY [-webkit-text-stroke-color:--TR]">
							<div className=" Cards bp-none IsLayer justify-between [--gap:0px]  text-center space-y-10">
								<div className="JsSheer  item OutlineXY outline-WH  content-center w-[50%] ">
									<Image
										image={getAssetPath(
											"/images/common/previous.jpg",
										)}
										alt="Sansuien Theme"
										imgClassName="object-contain"
									/>
									
									<a
										href="https://yuremono.com/"
										className="origin-top-right mb-auto ml-auto "
										target="_blank"
										rel="noopener noreferrer"
									>
										Page&nbsp;
										<ArrowSquareOutIcon className="DS" />
									</a>
									<span
										className=" text-4xl mt-auto ml-auto py-2 px-4 DS2"
									>
										Previous
									</span>
								</div>
								<div className="JsSheer item OutlineXY outline-WH  content-center w-[75%]">
									<Image
										image={getAssetPath(
											"/images/common/izakaya2.jpg",
										)}
										alt="Izakaya Theme"
										imgClassName="object-contain"
									/>
									<Image
										image={getAssetPath(
											"/images/common/izakayaLogo.png",
										)}
										alt=""
										figureClassName="h-auto w-1/2 my-auto ml-auto"
										imgClassName=""
									/>
									<a
										href="https://yuremono.com/izakaya/"
										className="origin-top-left mb-auto mr-auto "
										target="_blank"
										rel="noopener noreferrer"
									>
										Page&nbsp;
										<ArrowSquareOutIcon className="" />
									</a>
									<a
										href="https://github.com/yuremono/wp-izakaya"
										className="origin-bottom-left mt-auto mr-auto "
										target="_blank"
										rel="noopener noreferrer"
									>
										Repo&nbsp;
										<ArrowSquareOutIcon className="" />
									</a>
								</div>
								<div className="JsSheer item OutlineXY outline-WH  content-center w-[75%] ">
									<Image
										image={getAssetPath(
											"/images/common/sansuien2.jpg",
										)}
										alt="Sansuien Theme"
										imgClassName="object-contain"
									/>
									<Image
										image={getAssetPath(
											"/images/common/sansuienLogo.png",
										)}
										alt=""
										figureClassName="h-auto w-1/2 my-auto "
										imgClassName=""
									/>
									<a
										href="https://yuremono.com/sansuien/"
										className="origin-top-right mb-auto ml-auto "
										target="_blank"
										rel="noopener noreferrer"
									>
										Page&nbsp;
										<ArrowSquareOutIcon className="DS" />
									</a>
									<a
										href="https://github.com/yuremono/wp-sansuien"
										className="origin-bottom-right mt-auto ml-auto "
										target="_blank"
										rel="noopener noreferrer"
									>
										Repo&nbsp;
										<ArrowSquareOutIcon className="" />
									</a>
								</div>
							</div>
						</NodeStack>
						{/* <div className="my-8 flex justify-end gap flex-wrap JsChR">
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
						</div> */}
						
					</div>
				</div>
			</div>
		</section>
	);
}
