import { useState } from "react";

// import type { CSSProperties } from "react";
import { Cards, CardsItem } from "../components/Cards";
// import Button from "../components/btn";
import { RepulsionLists } from "./RepulsionLists/RepulsionLists";
import { getAssetPath } from "../lib/assetPath";

// JSX 内
// import { Image } from "../components/Image";
// import { getAssetPath } from "../lib/assetPath";

import {
	Moon,
	Sun,
	CaretUpIcon,
	// CaretDownIcon,
	// XIcon,
	ListPlusIcon,
	ArrowSquareOutIcon,
        // SpadeIcon,
} from "@phosphor-icons/react";
import { DialogFull } from "../components/DialogFull";
import HeaderCylinder from "../components/HeaderCylinder";
// import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { PageRoot } from "../components/PageRoot";
import { CodingSection } from "./Top/CodingSection";
import { DesignSection } from "./Top/DesignSection";
import { FrontEndSection } from "./Top/FrontEndSection";
import { BunmyakuTeaserSection } from "./Top/BunmyakuTeaserSection";
import { ScrollXSection } from "../components/ScrollXSection";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { usePage } from "../hooks/usePage";
import "../scss/Next.scss";
// import { SpriteAnimator } from "@react-three/drei";

/** `activeDialogId` が指すフルスクリーンダイアログ（DOM の `id` とは別） */
const EXPERIENCE_DIALOG_KEY = "experience";

// const otherWorksClasses = {
// 	item: " p-8 bg-WH text-TC BorderB BorderR",
// 	body: " mt-2",
// 	actions: "[--background:--WH] mt-4 flex flex-wrap",
// 	button: "mt-[-1px]",
// 	buttonInline: "mt-[-1px] ml-[-1px]",
// } as const;

function Top() {
	const { ref, dark, toggleTheme } = usePage();
	useClientRuntime({ rootRef: ref });
	useHtmlRootClass("[--MC:--GR] ");
	const [activeDialogId, setActiveDialogId] = useState<string | null>(null);
	const experienceDialogOpen = activeDialogId === EXPERIENCE_DIALOG_KEY;

	return (
		<PageRoot
			ref={ref}
			className="[--innerPX:--PX] [--Eng:--Jost] [--San:--Zen] [--h3FZ:1.5em] [--dropBG:--WH] [--dropC:--TC] [--WTS:var(--tsw)_var(--TC30)] "
		>
			<HeaderCylinder className=" " />
			{/* <Header className="NoLogo TopHidden mix-blend-difference text-WH" /> */}
			<div className="HeaderPagetop mix-blend-difference text-WH  ">
				<a href="#">
					<CaretUpIcon className="" />
				</a>
			</div>
			<button
				type="button"
				className="ThemeToggle mix-blend-difference text-WH"
				aria-label="Toggle dark mode"
				onClick={toggleTheme}
			>
				{dark ? (
					<Sun className="" weight="regular" aria-hidden />
				) : (
					<Moon className="" weight="regular" aria-hidden />
				)}
			</button>

			<main className=" min-h-[100lvh] ">
				<div className="MindMapMask out fixed   mt-0 top-0 left-0 h-[100lvh] w-full contrast-75">
					<video
						className="MindMapVideo h-full w-full object-cover Video1"
						src={getAssetPath("/video/coding.mp4")}
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
						aria-hidden="true"
					/>
					<video
						className="MindMapVideo h-full w-full object-cover Video2 contrast-75"
						src={getAssetPath("/video/design.mp4")}
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
						aria-hidden="true"
					/>
					<video
						className="MindMapVideo h-full w-full object-cover Video3 contrast-100"
						src={getAssetPath("/video/frontend.mp4")}
						autoPlay
						loop
						muted
						playsInline
						preload="metadata"
						aria-hidden="true"
					/>
				</div>
				<div className="mt-0 out MindMap IsLayer  text-center  font-thin z-[0] text-WH">
					<a
						href="#coding"
						className="mm1-3 MindMapBtn  MMBtn1 [--WTSC:--wine]"
						style={{ fontSize: "4em" }}
						data-html-class="[--background:--wine] [--hoverC:--WH]"
					>
						<span className="bg-wine/50"></span>
						Coding
					</a>
					<a
						href="#design"
						className="mm9-6 MindMapBtn  MMBtn2"
						style={{ fontSize: "4em" }}
						data-html-class="[--background:--brown] [--hoverC:--WH]"
					>
						<span className="bg-brown/50"></span>
						Design
					</a>
					<a
						href="#frontend"
						className=" mm3-8 MindMapBtn  MMBtn3"
						style={{ fontSize: "4em" }}
						data-html-class="[--background:--forest] [--hoverC:--WH]"
					>
						<span className="bg-forest/50"></span>
						Frontend
					</a>
				</div>

				<div className="SwapTarget out mt-0 relative isolate ">
					<section className=" MindMap   text-center   font-thin     ">
						{/* InitialLoadingOverlay の INITIAL_LOADING_LABEL_TEXT と文言を同期 */}
						<p
							className="hidden mmPin about_p lg:w-[calc(var(--wid)/2)] text-[--GR] font-light text-center p-4 px-6  right-1/2 top-1/2 lg:translateYH static lg:absolute"
							style={{ fontSize: "3em" }}
						>
							yuremono
							<br />
							works
						</p>
						{/* <h1 className="JsLetter IsDeco text-lg font-normal budoux mmPin  static  lg:absolute lg:translateYH leading-[2em] left-1/2 top-1/2 z-10 text-left px-[--PX2] md:p-4 bg-background/50 "> */}
						<h1 className="JsLetter IsDeco text-xl font-normal budoux mmPin  static   leading-[2em] left-1/2 top-1/2 z-10 text-left px-[--PX2] md:p-4 bg-background/50 ">
							<strong>Web</strong>デザイナー兼コーダー歴 <b>3.5年</b>
							<br />
							<b>2025/05</b>から<strong>AI駆動開発</strong>を開始
							<br />
							<span>ゆれもの=</span><b className="lsMinus">モジュレーション</b><span>エフェクター</span>
						</h1>
					</section>
					<ScrollXSection className=" relative mt-0 bg-background/70 ">
						<div className="DialogWrapper">
							<div className=" MindMap  text-center experience   font-thin ">
								<h2
									className="mm1-3 text-[--GR] font-light text-left tracking-[-0.025em]"
									style={{ fontSize: "3em" }}
								>
									Experience and
									<br />
									Dependencies
								</h2>
								<div className="text-base mmPin mmStatic max-w-[calc(var(--wid)/2)]  experience_tx text-left San font-light   leading-[2em] static lg:absolute left-1/2 top-[--MY] z-10 p-4 bg-background/50">
									<h3 className="text-GR text-[1.25em] inline-block mr-4">
										経験と依存性
									</h3>
									<button
										type="button"
										className="textlink  mt-6"
										aria-haspopup="dialog"
										aria-controls="experience-dialog"
										aria-expanded={experienceDialogOpen}
										onClick={() => {
											setActiveDialogId(
												EXPERIENCE_DIALOG_KEY,
											);
										}}
									>
										Details
										<ListPlusIcon
											className="[--btnIFZ:1.5em] align-text-bottom"
											aria-hidden
										/>
									</button>
									<br />
									<div className="text-left">
										<h3 className="text-GR mt-10 mb-2">
											About This Site
										</h3>
										<span className="budoux">
											個人制作ページ、ツールをまとめています。
											<br />
											これまではNextJS
											CMS、AIチャット共有拡張機能、
											<br />
											AI前提のweb開発を行なってきました。
										</span>
									</div>
								</div>
								<p
									className="hidden lg:inline-block"
									style={{ fontSize: "2.5em" }}
								>
									Cursor
								</p>
								<p
									className="hidden lg:inline-block"
									style={{ fontSize: "2em" }}
								>
									Claude Code
								</p>
								<p
									className="hidden lg:inline-block"
									style={{ fontSize: "2.5em" }}
								>
									TailwindCSS
								</p>
								<p
									className="hidden lg:inline-block"
									style={{ fontSize: "2.5em" }}
								>
									WebGL
								</p>
								<p
									className="hidden lg:inline-block"
									style={{ fontSize: "2.5em" }}
								>
									Codex
								</p>
								{/* <p
									className="hidden lg:inline-block"
									style={{ fontSize: "2em" }}
								>
									Pencil.dev
								</p> */}
								<p className=" mmPin bg-GR/70 text-xs md:text-xl  absolute z-10  text-[--WH] min-h-[2.5rem] content-center left-0 bottom-0 w-full text-align-last-justify px-2 md:px-16">
									Typescript PhotoShop Figma Three.js Supabase
									GSAP
								</p>
							</div>
							<DialogFull
								id="experience-dialog"
								open={experienceDialogOpen}
								dialogAriaLabel="Experience and Dependencies"
								closeAriaLabel="Experience and Dependenciesを閉じる"
								onOpenChange={(open) => {
									setActiveDialogId(
										open ? EXPERIENCE_DIALOG_KEY : null,
									);
								}}
							>
								<header className="flex items-start justify-between gap BorderB pb-4">
									<div>
										<p className=" text-sm  font-bold text-AC">
											Details
										</p>
										<h2 className="font-medium text-GR">
											Experience and Dependencies
										</h2>
										<p className="mt-2 leading-[--LH]">
											経験とAI依存の詳細。
										</p>
									</div>
								</header>
								<section
									className="mt-8"
									aria-label="Experience and Dependencies "
								>
									<Cards className="col3 [--gap:1rem] ">
										<CardsItem className="space-y-4">
											<article className="BorderXY  px-4 py-5 text-xs bg-AC/10">
												<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
													職種・スキル概要
													<span className="text-GR   tracking-[0.1em] ">
														4 lists
													</span>
												</h3>
												<div className="DescList  [--dtW:50%] [--PY:0.25em] [--PX:0.25em]  mt-4 IsDdright ">
													<dl className="items-center">
														<dt className="">
															Web デザイナー
														</dt>
														<dd>
															<span className="px-2 bg-WH font-medium">
																3.5 Year
															</span>
														</dd>
														<dt className="">
															Web コーダー
														</dt>
														<dd>
															<span className="px-2 bg-WH font-medium">
																3.5 Year
															</span>
														</dd>
														<dt className="">
															フロントエンドエンジニア
														</dt>
														<dd>
															<span className="px-2 bg-WH font-medium">
																実務未経験
															</span>
														</dd>
														<dt className="">
															AI駆動開発
														</dt>
														<dd>
															<span className="px-2 bg-WH font-medium">
																1 Year
															</span>
														</dd>
													</dl>
												</div>
											</article>
											<article className="BorderXY  px-4 py-5 text-xs bg-WH/70">
												<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
													エージェント / web
													<span className="text-GR   tracking-[0.1em] ">
														4 lists
													</span>
												</h3>
												<div className="DescList  [--dtW:50%] [--PY:0.25em] [--PX:0.25em]  mt-4 IsDdright">
													<dl className="items-center">
														<dt className="">
															Cursor
														</dt>
														<dd>
															<span className="px-2 bg-AC/30 font-medium">
																1 Year
															</span>
														</dd>
														<dt className="">
															Claude Code (GLM,
															OpenRouter)
														</dt>
														<dd>
															<span className="">
																4 Month
															</span>
														</dd>
														<dt className="">
															Codex / web
														</dt>
														<dd>
															<span className="px-2 bg-AC/30 font-medium">
																1 Month / 1 Year
															</span>
														</dd>
														<dt className="">
															Gemini / NanoBanana
														</dt>
														<dd>
															1 Year / 6 Month
														</dd>
													</dl>
												</div>
											</article>
											<article className="BorderXY  px-4 py-5 text-xs bg-WH/70">
												<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
													言語 + ライブラリ
													<span className="text-GR   tracking-[0.1em] ">
														5 lists
													</span>
												</h3>
												<div className="DescList  [--dtW:50%] [--PY:0.25em] [--PX:0.25em]  mt-4 IsDdright">
													<dl className="items-center">
														<dt>
															WEB
															SCSS+JavaScript+HTML
														</dt>
														<dd>
															<span className="px-2 bg-AC/30 font-medium">
																4 Years
															</span>
														</dd>
														<dt>TypeScript</dt>
														<dd>
															<span className="px-2 bg-AC/30 font-medium">
																AI 1 Year
															</span>
														</dd>
														<dt>Python</dt>
														<dd>AI 6 Month</dd>
														<dt>
															React/Next.Js/Vite
														</dt>
														<dd>
															<span className="px-2 bg-AC/30 font-medium">
																AI 1 Year
															</span>
														</dd>
														<dt>
															vue/astro/svelte
														</dt>
														<dd>AI 4 Month</dd>
														<dt>WordPress</dt>
														<dd className="[--ddW:100%]">
															<a
																href="https://github.com/yuremono/portfolio-wp"
																className=" align-top leading-[1.8]"
																target="_blank"
																rel="noopener noreferrer"
															>
																portfolio-wp
																<ArrowSquareOutIcon
																	size={16}
																/>
															</a>
														</dd>
													</dl>
												</div>
											</article>
										</CardsItem>
										<CardsItem className="space-y-4">
											<article className="BorderXY  px-4 py-5 text-xs bg-WH/70">
												<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
													デザインツール
													<span className="text-GR   tracking-[0.1em] ">
														7 lists
													</span>
												</h3>
												<div className="DescList  [--dtW:50%] [--PY:0.25em] [--PX:0.25em]  mt-4 IsDdright">
													<dl className="items-center">
														<dt className="">
															PhotoShop
														</dt>
														<dd>
															<span className="">
																4 Year
															</span>
														</dd>
														<dt className="">
															Illustrator
														</dt>
														<dd>
															<span className="">
																4 Year
															</span>
														</dd>
														<dt className="">
															Figma
														</dt>
														<dd>
															HtmlToFigmaなど補助利用
														</dd>
														<dt className="">
															Pencil.dev
														</dt>
														<dd>
															<span className="">
																数回
															</span>
														</dd>
														<dt className="">
															Stitch
														</dt>
														<dd>
															<span className="">
																数回
															</span>
														</dd>
														<dt className="[--dtW:100%] ">
															GPT Image-2.0
														</dt>
														<dd className="[--ddW:100%]">
															<span className="px-2 bg-AC/30 font-medium">
																LPデザイン・アセット作成の実運用を研究
															</span>
														</dd>

														<dt className="">
															Claude Design
														</dt>
														<dd>
															<span className="">
																情報収集
															</span>
														</dd>
													</dl>
												</div>
											</article>
											<article className="BorderXY  px-4 py-5 text-xs bg-WH/70">
												<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
													環境
													<span className="text-GR   tracking-[0.1em] ">
														4 lists
													</span>
												</h3>
												<div className="DescList  [--dtW:40%] [--PY:0.25em] [--PX:0.25em]  mt-4 IsDdright">
													<dl className="items-center">
														<dt className="">
															MacOS
														</dt>
														<dd>
															<span className="px-2 bg-AC/30 font-medium">
																4 年
															</span>
														</dd>
														<dt className="">
															Windows
														</dt>
														<dd>
															<span className="">
																社内利用 3.5 年
															</span>
														</dd>
														<dt className="[--dtW:100%] ">
															情報収集
														</dt>
														<dd className="[--ddW:100%]">
															<span className="px-2 bg-AC/30 font-medium">
																主にX,Zenn,+webAI
																ディスカバー
															</span>
														</dd>
														<dt className="[--dtW:100%] ">
															制作環境
														</dt>
														<dd className="[--ddW:100%]">
															<span className="px-2 bg-AC/30 font-medium">
																自作のtask系,memory系,実装系スキルを使用
															</span>
														</dd>
													</dl>
												</div>
											</article>
											<article className="BorderXY  px-4 py-5 text-xs bg-WH/70">
												<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
													インフラ / データベース
													<span className="text-GR   tracking-[0.1em] ">
														4 lists
													</span>
												</h3>
												<div className="DescList  [--dtW:50%] [--PY:0.25em] [--PX:0.25em]  mt-4 IsDdright">
													<dl className="items-center">
														<dt className="">
															Vercel
														</dt>
														<dd>
															<span className="px-2 bg-AC/30 font-medium">
																AI 1 Year
															</span>
														</dd>
														<dt className="">
															Supabase
														</dt>
														<dd>
															<span className="">
																AI 1 Year
															</span>
														</dd>
														<dt className="">
															Github
														</dt>
														<dd>AI 1 Year</dd>
														<dt className="">
															Xserver+MySQL
														</dt>
														<dd>
															<span className="">
																実務 4 Year
															</span>
														</dd>
													</dl>
												</div>
											</article>
										</CardsItem>
										<CardsItem>
											<article className="BorderXY  px-4 py-5 text-xs bg-WH/70">
												<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
													その他利用履歴
												</h3>
												<div className="DescList  [--dtW:50%] [--PY:0.25em] [--PX:0.25em]  mt-4 IsDdright">
													<dl className="items-center">
														<dt className="">
															Tailwind CSS
														</dt>
														<dd>
															<span className="px-2 bg-AC/30 font-medium">
																6 Month,AI 1
																Year
															</span>
														</dd>
														<dt className="">
															canvas API
														</dt>
														<dd>
															<span className="px-2 bg-AC/30 font-medium">
																AI 1 Year
															</span>
														</dd>
														<dt className="">
															Three.js
														</dt>
														<dd>AI 1 Year</dd>
														<dt className="">
															D3.js
														</dt>
														<dd>AI 6 Month</dd>
														<dt className="">
															GSAP
														</dt>
														<dd>3.5 Year</dd>
														<dt className="">
															VScode/Chrome
															Extentions
														</dt>
														<dd>1~2回作成</dd>
														<dt className="">
															NanoBanana{" "}
														</dt>
														<dd>
															スキルで頻繁に利用
														</dd>
														<dt className="">
															Quiver.ai/arrow-1
														</dt>
														<dd className="[--ddW:100%]">
															BYOS
															demoのsvg生成で使用
														</dd>
														<dt className="[--dtW:100%] ">
															Recraft
														</dt>
														<dd className="[--ddW:100%]">
															<span className="">
																高度な画像生成、SVG作成
															</span>
														</dd>
														<dt className="">
															LottieAnimation
														</dt>
														<dd>webツール試用</dd>
														<dt className="">
															memsearch
														</dt>
														<dd>
															claude/codexで常用
														</dd>
														<dt className="">
															superpowers/oh-my-claudecode
														</dt>
														<dd className="">
															<span>試用</span>
														</dd>
														<dt className="">
															tweekpane
														</dt>
														<dd className="">
															`/Generator`で使用
														</dd>
														<dt className="">
															Z.ai Coding Plan
														</dt>
														<dd className="">
															Claude Codeで使用
														</dd>
														<dt className="">
															Open Router
														</dt>
														<dd className="">
															モデル比較
														</dd>
														<dt className="">
															Fal AI
														</dt>
														<dd className="">
															動画生成で使用
														</dd>
														<dt className="">
															OpenClaw
														</dt>
														<dd className="">
															試用
														</dd>
														<dt className="">
															tailscale
														</dt>
														<dd className="">
															スマホターミナル操作試用
														</dd>
													</dl>
												</div>
											</article>
										</CardsItem>
										<CardsItem></CardsItem>
									</Cards>
								</section>
							</DialogFull>
						</div>
						<section className="MMBhide Cards col2 relative items-center into [--gap:0px]">
							<div className="item PX">
								<div className="text-center ">
									<div className=" ">
										<h2 className="font-thin grid content-center md:h-[100lvh]">
											<span
												className="MindWobble text-left leading-[0.7em] tracking-[-0.0em]"
												style={{ fontSize: "2.5em" }}
											>
												Vibe
												<br />
												&nbsp;&nbsp;Design
											</span>
											<span
												className="MindWobble text-center leading-[1em] mt-[-0.25em] tracking-[-0.0em] font-normal text-GR/10 "
												style={{ fontSize: "6em" }}
											>
												or
											</span>
											<span
												className="MindWobble text-right leading-[0.57em] tracking-[0.08em] "
												style={{ fontSize: "2.5em" }}
											>
												Vault&nbsp;
												<br />
												Driven
											</span>
										</h2>
									</div>
									{/* <h2 className="MindWobble font-thin text-left leading-[0.875em] tracking-[0.0em]">
									<span style={{ fontSize: "1.125em" }}>
										Burn
										<br />
										&nbsp;&nbsp;Your
										<br />
										&nbsp;Own
										<br />
										&nbsp;&nbsp;&nbsp;Style
									</span>
								</h2> */}
								</div>
							</div>
							<div className="item content-center bg-background/50 p-4">
								<div className=" leading-[2]">
									<h3 className="text-GR mb-2">AI Ready</h3>
									<b>DESIGN.md</b> , <b>画像生成デザイン</b>
									を基点としたゼロからのページ作成の検証と、
									<b>自然言語でUIパーツを再利用</b>
									する為の環境構築を行っています。
									<h3 className="text-GR mt-10">
										Burn Your Own Style
									</h3>
									<details className="Toggle IsSmall font-normal mt-2">
										<summary className="Eng">
											Thinking...
										</summary>
										<div>
											-
											モデルの学習データに基づくwebデザイン・コーディングは平均的で、振れ幅が大きく、個人の理想とするマークアップ、スタイリングとかけ離れたものになる。
											<br />-
											構造=既存クラス、装飾=Tailwindで手直ししやすい状態になるが、無駄な記述が多い。
											<br />
											考察：モデルのファインチューニングが民主化するまでは「完成品の再利用」を効率化する方が良い
										</div>
									</details>
									{/* 個人のスタイルシステム（クラス、変数、jsモジュール）を元に開発する環境を整え、このサイトのベースに使用しています。 */}
									<div className="flex flex-wrap mt-4 gap-2">
										<a
											className="btn [--btnW:45%]"
											href="https://github.com/yuremono/BurnYourOwnStyle/tree/react"
										>
											Repository&nbsp;
											<ArrowSquareOutIcon />
										</a>
										<br />
										<a
											className="btn  [--btnW:45%]"
											href="/preview"
										>
											DemoPage
										</a>
										{/* <Button
											className="mt-[-1px] ml-[-1px] [--btnW:50%]"
											href="/preview"
										>
											Preview
										</Button> */}
										<br />
									</div>
								</div>
							</div>
							<p className="bg-GR/70 text-xs md:text-xl absolute z-10  font-thin Eng text-[--WH] min-h-[2.5rem] content-center left-0 bottom-0 w-full text-align-last-justify px-2 md:px-16">
								Typescript PhotoShop Figma Three.js Supabase
								GSAP
							</p>
						</section>
					</ScrollXSection>

					<BunmyakuTeaserSection className="MMBhide out relative mt-0    grid" />

					<div className="MMBhide repulsion-lists-module  mt-[-25lvh] z-10">
						<RepulsionLists className="out px-[calc(var(--into)/3*2)] mt-[--MY] Eng font-light " />
					</div>
				</div>
				<section
					id="coding"
					className="AnchorTarget out mt-0 relative isolate  text-WH  [--deco:--wine]"
				>
					<div className=" MindMap   text-center   font-thin    ">
						<h2 className="JsLetter IsDeco2 text-xl font-normal budoux mmPin  static   leading-[2em] left-1/2 top-1/2 z-10 text-left px-[--PX2] md:p-4 ">
							累計 <strong>300案件</strong>を担当<span className="italic text-WH/50">（自社CMSでのマークアップ）</span>
							<br />
							<b>SCSS</b> <strong>JavaScript</strong> <b className="italic text-base md:text-lg "> jQuery </b>のコーディング
							<br />
                                                        <b>効率</b>と <b>品質</b>の両立、AIの書く<strong className="lsMinus">構造とスタイル</strong><span>の制御に取り組んでいます。</span>
						</h2>
					</div>
					<CodingSection className="out relative mt-0    grid " />
				</section>
				<section
					id="design"
					className="AnchorTarget  out mt-0 relative isolate  text-WH  [--deco:--brown]"
				>
					<div className=" MindMap   text-center   font-thin     ">
                                                <h2 className="JsLetter IsDeco2 text-xl font-normal budoux mmPin  static   leading-[2em] left-1/2 top-1/2 z-10 text-left px-[--PX2] md:p-4 ">
							<strong>Photoshop</strong>で約 <b>250案件</b>を担当
							<br />
							<b>Illustrator</b> <strong>Figma</strong> を補助利用<span className="italic text-WH/50">（html to design など）</span>
                                                        <br />
                                                        <strong>アニメーション</strong>を求められる案件を多く担当してきました。
                                                        {/* <span className="my-2">個人制作では、PSDからのFigmaデータ再構築、</span>
							<br />
                                                        FigmaMCP 、Pencil.dev の <b>Agent SKILLS</b>作成等を行なっています。 */}
						</h2>
					</div>
					<DesignSection className="out relative mt-0    grid " />
				</section>
				<section
					id="frontend"
					className="AnchorTarget out mt-0 relative isolate  text-WH  [--deco:--forest]"
				>
					<div className=" MindMap   text-center   font-thin     ">
                                                <h2 className="JsLetter IsDeco2 text-xl font-normal budoux mmPin  static   leading-[2em] left-1/2 top-1/2 z-10 text-left px-[--PX2] md:p-4 ">
							個人制作で <strong>React</strong> <b>TypeScript</b>を主に使用し
                                                        <br />
                                                        様々な観点から <strong className="!mr-0">Web制作</strong><b >効率化ツール</b>を試作しています。
						</h2>
					</div>
					<FrontEndSection className="out relative mt-0    grid pointer-events-auto" />
				</section>
			</main>
			<Footer />
		</PageRoot>
	);
}

export default Top;
