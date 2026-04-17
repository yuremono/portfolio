// import type { CSSProperties } from "react";
import { useRef } from "react";
import { Panel, PanelItem } from "../components/Panel";
import { Toggle, ToggleSummary, ToggleBody } from "../components/Toggle";
import { Image } from "../components/Image";
import { PathDraw } from "../components/PathDraw";
import { LottieScroll } from "../components/LottieScroll";

import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { Footer } from "../components/Footer";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";

function Preview() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
		<PageRoot ref={pageRootRef} className="[--Eng:--Via]">
			<Header className="LinkShadow UpInit" />

			<main id="" className=" min-h-screen  mt-[--head] pb-[--MY]">
				{/*Stick Lottie*/}
				<section className="out Stick IsColumn mt-[--Nhead]">
					<LottieScroll
						src={getAssetPath("/lottie/untitled.lottie")}
						segmentStartRatio={0}
						segmentEndRatio={1}
						autoplayStopRatio={0.61}
						className="StickItem IsDemo"
						layout={{ fit: "cover", align: [0.5, 0.5] }}
						renderConfig={{ autoResize: true }}
					/>
					<p className="StickyStep StickScr [--step:5em] h2FZ Eng ">
						<span>This</span>
						<span>Is</span>
						<span>Lottie</span>
						<span>Free</span>
						<span>Animation</span>
					</p>
				</section>
				{/* Stick Title */}
				<section className="Stick IsRev out mt-0 into pb-[--2MY] items-start img1-1 [--scr:50%] [--shift:0%]  bg-[--TC] text-[--WH]">
					<h1 className=" StickItem  md:min-h-[100lvh] content-center Eng font-medium  pt-6 md:pt-0">
						<span className="sub block ">Not Vibe Design</span>
						Class Based
						<br />
						<span className="RgbShift IsBeat [--shift:0.125em]">
							AI Native
						</span>
						<br />
						Development
					</h1>
					<Panel className="StickScr  img30  text-sm BorderDraw IsDown [--MY:0px]">
						<PanelItem className="items-center BorderDraw">
							{/* <Image image={getAssetPath("/images/picsum/010.jpg")} /> */}
							<div>
								<h2 className=" mb-8 mt-[15%] Eng [--h2FZ:2.5rem] font-medium text-center">
									{/* <span className="sub block ">Instant</span> */}
									Import and Update Examples
								</h2>
							</div>
						</PanelItem>
						<PanelItem className=" items-center BorderDraw">
							<Image
								image={getAssetPath("/images/picsum/011.jpg")}
							/>
							<div>
								<h3 className=" mb-4 ">
									<span className="sub block ">
										StickItem and StickScr
									</span>
								</h3>
								<p className="">
									Stick直下にStickItemとStickScrクラスをつけます。[--scr:XX%][--shift:XX%]のTailwind
									arbitary
									クラスで変数を上書きし、固定表示の幅、スクロール側の幅、重なる幅を調整します。
								</p>
							</div>
						</PanelItem>
						<PanelItem className=" items-center BorderDraw">
							<Image
								image={getAssetPath("/images/picsum/012.jpg")}
							/>
							<div>
								<h3 className=" mb-4 ">
									<span className="sub block ">
										RgbShift IsBeat
									</span>
								</h3>
								<p className="">
									子要素をR,G,Bの三つのレイヤーに分けます。静的にずらすサイズを調整、または
									IsBeat クラスでアニメーションをつけます。
								</p>
							</div>
						</PanelItem>
						<PanelItem className=" items-center BorderDraw">
							<Image
								image={getAssetPath("/images/picsum/013.jpg")}
							/>
							<div>
								<h3 className=" mb-4 ">
									<span className="sub block ">
										BorderDraw and PathDraw
									</span>
								</h3>
								<p className="budoux">
									画面のスクロール量と要素の座標を元に Request
									Animation Frame で svg path
									の長さを変更します。 IsDown
									で左右のボーダーになります。
									PathDrawはpathのみで作られたSVG画像ファイル、インラインSVGを描画できます。
								</p>
							</div>
						</PanelItem>
					</Panel>
				</section>

				{/*Stick 、simulate Gsap RgbBeat*/}
				<section className="">
					<div className="Stick   items-start [--shift:20%]">
						<PathDraw className="StickItem sticky min-h-[100lvh] content-center ">
							{/* <svg
								className="scale-x-[-1]"
								viewBox="0 0 2440 2850"
								preserveAspectRatio="xMidYMid meet"
								role="img"
								aria-label="p-1.svg 編集"
							> */}
							<svg
								className=""
								viewBox="-52 300 911 500"
								preserveAspectRatio="none"
								role="img"
							>
								{/* 統合SVG: npm run build:preview-svg で再生成 (scripts/build-preview-pathdraw-svg.mjs) */}
								<g className="  [--stc:--MC50]">
									<path d="M21.04,388.72l19.64,-28.72h83.36l19.28,20.96v33.28l-13,17.2l18.2,17.16v67l-21.64,20.24h-75.64v-124.92l24.16,-22.2z" />
									<path d="M83.76,388.72v50.16l25.48,-25.6v-18.76l-4.2,-5.8z" />
									<path d="M86,449.6v54.72h29l3.56,-3.52v-44.72l-5.48,-6.48z" />
									<path d="M148.04,432.4l14.24,-24.68h31.2v92.88l5.16,5.52h12.28v-98.4h29v128.12h-29v-10.2l-14.04,10.2h-14l-21.96,-19.68v-75.84h-12.88z" />
									<path d="M253,407.6v128.12h30v-94.88l6.12,-8.36h20.36l16.24,-24.88h-29.96l-10.88,13.04v-13.04z" />
									<path d="M320,415.2v120.64h30v-101.04h15.72l4.8,6.48v94.56h28.48v-105.2l-19.64,-22.92h-16.04l-12.4,14.96v-14.96h-22.2z" />
								</g>
								<g className=" [--stc:--MC30]">
									<path d="M399.04,386.8l23.88,-26.8h20.12l14.68,15.84v75.84l3.52,7.12h22.92v-98.8h33.64v151.88l-20.68,23.96h-91.36l25.16,-30.8h46.48l6.76,-8.48v-20l-8.68,6.48h-32.12l-20.28,-20.96v-75.28z" />
									<path d="M546.8,407.6l-18.16,22.12v85.76l20.72,20.24h38.52l17.56,-18v-86.4l-16.28,-23.72z" />
									<path d="M558.8,434v72.4l4.16,2.88h12.76l3.84,-4.64v-66.44l-5.12,-4.2z" />
									<path d="M615.2,407.6v104.84l20.68,23.28h22.6l9.76,-11.48v11.48h27.68v-128.12h-28.48v99.52l-4.8,3.84h-11.24l-5.16,-6.48v-96.88z" />
									<path d="M709.2,407.6v128.12h30.48v-94.56l5.16,-6.8h21l20.68,-27.4h-33.44l-10.2,15.6v-14.96z" />
								</g>
								<g className=" [--stc:--MC30]">
									<path d="M59.28,548.4l-23.04,23.4v126.84l23.84,22.92h51.24l25.12,-24.2v-125.56l-23.52,-23.4z" />
									<path d="M67.88,576.4v106.8l8.96,9.36h25.48v-106.76l-7.72,-9.4z" />
									<path d="M149,594v103.52l20.68,24.04h24.8l8.96,-14.56l11.2,14.56h26.44l21.92,-21.8v-105.76h-32.48v98.4l-3.84,3.52h-11.72v-93.08h-21.92l-3.2,3.52v85.76l-4.16,3.8h-6.76l-5.44,-5.44v-96.48z" />
									<path d="M273.32,594v127.56h30.6v-93.92l4.16,-5.52h12.36v99.44h30v-104.08l-19.32,-23.48h-16.28l-10.12,12.52v-12.52z" />
								</g>
								<g className=" [--stc:--MC50]">
									<path d="M384.48,574.4v54l28.44,27.2l37.32,-10.8v46.12h-56.04l-22.64,30.44h86.8l25.44,-26.28v-59.56l-28.16,-29.04l-36.36,11.12v-39.68h54.36l22.2,-29.72h-85.76z" />
									<path d="M485.6,596.8v22.2h17.88v81.44l16.68,19.16h24.16l16.68,-25.52l-28.48,-0.96l-2.56,-4.64v-65.88h25.76l10.24,-25.8h-36v-30.32h-26.48v30.32z" />
									<path d="M572,595.2v102.24l17.24,19.68h15.32l10.2,-11.48v25.36h-35.4l-19.32,28.68h62.76l21.32,-21.8v-142.68h-31.6v95.2l-3.2,3.52h-11l-5.72,-6.48v-92.24z" />
									<path d="M655.2,548.4v173.16h31.52v-173.16z" />
									<path d="M715.2,594l-19.64,21.72v83.24l20.28,22.6h44.32l18.88,-27.4h-47.08l-3.84,-4.32v-17.56h16.28l29.8,-27.36v-30.16l-16.6,-20.76z" />
									<path d="M726.4,620.8v41.04l18.2,-18.52v-19.12l-2.56,-3.4z" />
								</g>
								<g className="[--stc:--MC80] translate-x-[-6%] translate-y-[-8%]">
									<path d="M585.25545,611.69473c3.60055,-17.57743 11.95929,-32.10147 11.95929,-44.97473c0,-10.98667 -8.88,-14.24 -14.90667,-14.24c-14.42667,0 -30.16,13.57333 -43.65333,26.77333c1.68,-4.98667 2.82667,-8 3.44,-9.22667c1.78667,-3.92 1.62667,-5.28 -0.45333,-7.57333c-1.68,-1.86667 -1.68,-2.69333 -0.16,-7.33333c1.65333,-5.25333 3.46667,-9.44 6.21333,-12.32c3.54667,-3.76 1.70667,-7.81333 -3.97333,-11.04c-5.14667,-2.88 -9.28,-2.58667 -13.2,-1.65333c-2.16,0.53333 -2.61333,1.06667 -2.61333,2.90667c0,0.90667 1.06667,0.98667 2.90667,1.28c5.36,0.90667 6.26667,4.96 4.29333,11.30667c-1.52,5.12 -3.01333,10.13333 -4.37333,14.90667c-7.44,3.33333 -15.25333,6.82667 -20.4,7.2c-3.68,0.29333 -6.18667,-0.82667 -8.18667,-4.88c-2,-0.29333 -4.58667,1.57333 -4.29333,4.72c0.29333,3.01333 1.33333,6.02667 3.36,8.48c-9.33333,13.81333 -19.2,26.05333 -32.21333,33.65333c6.64,-8.05333 7.68,-18.88 7.68,-27.38667c0,-19.46667 -15.28,-29.36 -32.85333,-28.88c-0.29333,-15.06667 -4.21333,-21.25333 -13.94667,-21.25333c-15.97333,0 -25.36,21.70667 -30.56,40.61333c-12.21333,7.46667 -23.44,22.90667 -28.45333,33.49333c-1.86667,-12.10667 5.09333,-28.96 13.97333,-43.36c4.90667,-8.45333 0.16,-17.89333 -10.4,-21.54667c-2.34667,-0.82667 -3.86667,0.53333 -2.34667,2.88c2.58667,4.24 1.06667,10.66667 -3.84,22.56c-5.70667,14.56 -8.37333,24.61333 -7.84,39.01333c0.37663,9.86781 2.16293,17.19557 5.87543,20.64968" />
									<path d="M366.29017,626.46301c1.54459,1.43709 3.4226,2.20365 5.67124,2.20365c3.92,0 5.41333,-3.12 5.28,-7.65333c-0.53333,-13.28 9.33333,-31.94667 20.08,-42.96c-0.45333,3.25333 -2.26667,12.90667 -0.08,21.92c2.37333,9.70667 7.49333,18.50667 18.10667,22.69333c-8.50667,12.26667 -17.94667,19.62667 -30.26667,24.10667l0.74667,2.58667c17.25333,-3.54667 30.58667,-12.34667 39.38667,-23.81333c23.92,1.78667 46.74667,-9.06667 64.90667,-29.62667c5.76,-6.53333 10.42667,-12.50667 13.78667,-17.04c2.34667,1.81333 5.17333,2.8 7.65333,2.26667c4.05333,-0.98667 10.77333,-5.36 16.96,-8.61333l-2.16,7.92c-10.88,15.89333 -23.94667,31.25333 -32.61333,38.88c-6.74667,6.21333 -7.36,14 -2.74667,14.61333c4.88,0.69333 9.54667,-3.57333 13.81333,-13.46667c7.36,5.12 9.36,12.93333 9.49333,21.28c0.16,5.68 2.16,6.72 4.77333,6.42667c5.86667,-0.74667 8.88,-7.97333 9.65333,-18.4c0.77333,-11.49333 2.08,-23.6 5.46667,-41.01333c16.58667,-16.69333 32.10667,-29.17333 44.90667,-29.17333c6.18667,0 8.50667,3.89333 7.28,12.4c-1.65333,11.28 -12.16,36.4 -13.30667,48.48c-1.06667,11.28 4.53333,17.14667 14,16.85333c6.55554,-0.1824 13.05928,-3.50745 19.47301,-8.97995" />
									<path d="M606.55442,628.35338c9.52713,-8.129 18.85565,-20.99633 27.86032,-35.34005c1.68,7.2 7.70667,12.21333 15.97333,15.22667c-2.16,7.38667 -3.2,14.13333 -2.45333,20.56c1.52,12.74667 12.08,19.84 29.49333,19.84c26.88,0 43.33333,-21.14667 66.88,-56.4c-1.04,5.38667 -1.2,9.92 -0.66667,16.24c1.52,16.24 8,21.92 15.36,21.92c18.93333,0 41.25333,-36.77333 49.68,-61.41333c3.49333,-10.82667 1.09333,-17.36 -2.8,-21.28l0.37333,-1.49333c24.48,-1.36 39.41333,10.64 39.94667,33.04c0.53333,26.56 -19.76,53.78667 -55.36,59.65333l-0.45333,3.62667c39.2,-2.48 68.42667,-25.89333 68.90667,-57.76c0.53333,-27.22667 -19.25333,-42.48 -46.88,-42.48c-28.69333,0 -48,16.24 -59.6,34.77333c-11.22667,17.78667 -23.01333,38.56 -37.17333,50.56c3.94667,-7.68 5.06667,-15.46667 2.48,-23.92c-3.54667,-11.70667 -14.05333,-20.58667 -21.86667,-23.17333l-1.22667,1.57333c7.84,7.36 14.21333,15.81333 11.70667,30.82667c-2.8,16.24 -15.12,25.76 -30.88,25.76c-14.10667,0 -19.22667,-6.69333 -19.22667,-14.90667c0,-4.37333 1.04,-8.98667 2.4,-14.10667c5.38667,0.88 10.24,1.36 14.08,1.36c7.68,0 11.38667,-2.69333 11.38667,-6.88c0,-3.6 -3.22667,-6.32 -9.06667,-5.62667c-3.92,0.50667 -7.25333,1.73333 -13.28,0.90667c3.01333,-9.33333 6.74667,-19.14667 9.89333,-26.37333c2,-0.29333 4.18667,-0.42667 6.53333,-0.42667c7.22667,0 10.58667,-2 10.58667,-5.46667c0,-3.76 -3.92,-5.84 -11.12,-5.76c2.93333,-7.09333 7.41333,-14 11.76,-18.98667c3.36,-3.92 0.77333,-7.97333 -4.13333,-11.04c-5.52,-3.33333 -10.24,-2.72 -14.74667,-1.89333c-2.32,0.45333 -3.30667,1.68 -3.14667,2.88c0.13333,1.22667 1.44,1.09333 4.02667,1.54667c4.05333,0.82667 5.09333,4.42667 3.54667,10.77333c-1.30667,5.25333 -3.97333,11.25333 -6.90667,17.76c-12.53333,-0.82667 -19.46667,-3.30667 -24.32,-11.73333c-2.08,-0.85333 -3.30667,0.37333 -3.14667,2.82667c0.77333,10.02667 7.25333,13.92 18.13333,17.25333c-10.42667,3.01333 -18.34667,8.16 -24.69333,18.74667c-12.10667,19.92 -24.61333,35.22667 -39.97333,36.13333c-8.58667,0.53333 -11.36,-3.01333 -9.28,-13.52c0.03097,-0.15533 0.06232,-0.31042 0.09404,-0.46527" />
								</g>
							</svg>
						</PathDraw>
						<Panel className="StickScr min-h-[100lvh] content-center  img40  img1-1 bg-[--WH70] [--gap:0.5rem]">
							<PanelItem className="items-center ">
								<div>
									<h2 className=" mb-4  ">
										<span className="sub block text-right  text-3xl text-center">
											play on "Bring Your Own Key"
										</span>
									</h2>
								</div>
							</PanelItem>
							<PanelItem className="IsRev items-end py-0">
								<Image
									className=" RgbShift IsBeat [--delay:500ms]"
									image={getAssetPath(
										"/images/picsum/015.jpg",
									)}
								/>
								<div>
									<h3 className=" mb-4 ">
										<span className="sub block ">
											CustomClass and Tailwind
										</span>
									</h3>
									<p className="">
										個人の使い慣れたCustomClassで構造を作らせることを強制し、Tailwindは装飾のみで使用させることでエージェントとスムーズに意思疎通を図ります。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="items-end py-0">
								{/* <Image
                                                                        className=" RgbShift IsBeatY "
									image={getAssetPath(
										"/images/picsum/016.jpg",
									)}
								/> */}
								<div>
									<p className="">
										当初はclass,component,skillをまとめた"Unit"という単位を少数用意する運用をしていました。
										classだけで十分なラッパーやエフェクトクラスを追加するとかえってややこしくなるためclassベースの運用に切り替えました。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="IsRev items-end py-0 [--MY:2em]">
								<Image
									className=" RgbShift IsBeatY  [--delay:1000ms]"
									image={getAssetPath(
										"/images/picsum/017.jpg",
									)}
								/>
								<div>
									<h3 className=" mb-4 ">
										<span className="sub block ">
											Scalability
										</span>
									</h3>
									<p className="">
										チームや個人用の環境を整えるのに時間がかかるため、
										将来的にはCSSファイルとQuestionツールによる回答を元にドキュメント作成と環境構築を行うスキルを作ることを検討しています。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="items-end py-0">
								{/* <Image
                                                                        className=" RgbShift IsBeatY "
									image={getAssetPath(
										"/images/picsum/016.jpg",
									)}
								/> */}
								<div>
									<p className="">
										"メイン直下にスティッククラス月のセクションを配置してその中にあのSVG画像を配置してスティックアイテムクラスを付けるその隣にカーズクラスを置いてCore2モディファイヤーを付けるアイテムは4つセクションはここまで"
										<br />
										音声入力で人間に伝えるのと同じ感覚でチャットを送るだけで、ハンドコーディングと同じコードを書けるようにドキュメントを整備しています。
									</p>
								</div>
							</PanelItem>
						</Panel>
					</div>
				</section>

				{/* FAQ - Toggle IsQa */}
				<section className="Stick out [--scr:100%] [--shift:100%] ">
					<div className="StickItem Cards col2 xl:[--gap:50%] top-[--head]">
						<Image
							className="item md:pl-[--PX]"
							image={getAssetPath("/images/picsum/018.jpg")}
						/>
						<Image
							className="item md:pr-[--PX]"
							image={getAssetPath("/images/picsum/019.jpg")}
						/>
					</div>
					<div className="StickScr  [--h3FZ:1.25em]">
						<div className="bg-[--WH50] w-[--wid] md:[--wid:50%] mx-auto p-4 xl:p-0">
							<h2 className="text-center   pb-12 ">
								<span className="sub block mr-0">Toggle</span>
								Accordion Contents
							</h2>
							<Toggle className="">
								<ToggleSummary>
									details/summaryタグの開閉コンテンツ用スタイルセット
								</ToggleSummary>
								<ToggleBody>
                                                                        transitionを有効化するため`interpolate-size: allow-keywords`等を使用
								</ToggleBody>
							</Toggle>
							<Toggle className="IsQa">
								<ToggleSummary>
									(エージェント向け)
									IsQaは`Q`と`A`の装飾を付与するので
								</ToggleSummary>
								<ToggleBody>
									質問2：回答2：のような書き方はしないでください
								</ToggleBody>
							</Toggle>
							<Toggle className="">
								<ToggleSummary>
									pencil.dev
									を使ったデザイン再現、デザイン作成について
								</ToggleSummary>
								<ToggleBody>
									DesignToCode、CodeToDesignどちらも"注意事項"次第でほぼ意図通りに生成できる印象です。
                                                                        「構造化データ」を作るという意味でプロトタイピングをすることと変わらないので本番用コンポーネントを作る方が早いと考えます。
                                                                        現状はローカル専用ツールなので.penファイルからFigmaにコピペすることで共有できるはずです。
								</ToggleBody>
							</Toggle>
							<Toggle className="">
								<ToggleSummary>
									vibe design について
								</ToggleSummary>
								<ToggleBody>
									OpenAI,Claude
									共にAI駆動開発におけるフロントエンド品質向上のベストプラクティスを発信しています。
									"https://www.anthropic.com/engineering/harness-design-long-running-apps"
									ではハーネス設計と時間をかけることにより一定水準を超えた創造を実現したと解釈しました。
									参考サイトを無数に用意してもその中から人間の感覚を模倣して選択することは現時点では難しく、特定サイトをトレースするライブラリを使用した方が合理的だと考えます。
									本プロジェクトでは仕様に基づいたテキストと画像を用意することがボトルネックになるため、
									vibe
									designツールとどのように連携させるかが課題です。
									<a
										href="https://zenn.dev/yuremono/articles/stitch-vibe-design-thinking"
										className="hover:text-[--SC] transition-colors underline font-bold"
										target="_blank"
										rel="noopener noreferrer"
									>
										Stitch体験レポート
									</a>
								</ToggleBody>
							</Toggle>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</PageRoot>
	);
}

export default Preview;
