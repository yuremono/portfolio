import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Cards, CardsItem } from "../components/Cards";
import Button from "../components/btn";
// JSX 内
// import { Image } from "../components/Image";
// import { getAssetPath } from "../lib/assetPath";

import {
	Moon,
	Sun,
	// CaretUpIcon,
	// CaretDownIcon,
	// XIcon,
	ListPlusIcon,
	ArrowSquareOutIcon,
} from "@phosphor-icons/react";
import { DialogFull } from "../components/DialogFull";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { PageRoot } from "../components/PageRoot";
import { ScrollXSection } from "../components/ScrollXSection";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { usePage } from "../hooks/usePage";
import "../scss/Next.scss";

/** `activeDialogId` が指すフルスクリーンダイアログ（DOM の `id` とは別） */
const EXPERIENCE_DIALOG_KEY = "experience";

const otherWorksClasses = {
	section: "Wrap into text-center mt-0",
	heading: "mindWobble font-thin",
	cards: "mt-0 col3 [--gap:0px] bp-lg text-left [--btnW:50%] md:[--btnH:3em] leading-[1.75em] BorderT BorderL",
	item: " p-8 bg-WH text-TC BorderB BorderR",
	body: " mt-2",
	actions: "[--background:--WH] !mt-4 flex flex-wrap",
	button: "mt-[-1px]",
	buttonInline: "mt-[-1px] ml-[-1px]",
} as const;

function Next() {
	const { ref, dark, toggleTheme } = usePage();
	useClientRuntime({ rootRef: ref });
	useHtmlRootClass("[--MC:--GR]");
	const [formMessage, setFormMessage] = useState<string | null>(null);
	const [activeDialogId, setActiveDialogId] = useState<string | null>(null);
	const experienceDialogOpen = activeDialogId === EXPERIENCE_DIALOG_KEY;

	const onContactSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormMessage(
			"デモ表示のため送信処理は行っていません。実際のお問い合わせは別途メール等でご連絡ください。",
		);
	};

	return (
		<PageRoot
			ref={ref}
			className=" [--innerPX:--PX] [--Eng:--Jost] [--San:--Zen] [--h3FZ:1.5rem] [--dropBG:--WH] [--dropC:--TC]"
		>
			<Header className="NoLogo TopHidden mix-blend-difference text-WH" />

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

			<main className=" min-h-screen ">
				<section className="out mindMap   text-center   font-thin">
					<p
						className="mmPin about_p lg:w-[calc(var(--wid)/2)] text-[--GR] font-light text-center p-4 px-6 bg-background/80 right-1/2 top-1/2 lg:translateYH static lg:absolute"
						style={{ fontSize: "3em" }}
					>
						yuremono
						<br />
						works
					</p>
					<h1 className="text-lg font-normal budoux mmPin about_tx static lg:absolute lg:translateYH leading-[2em] left-1/2 top-1/2 z-10 text-left p-4 bg-background/80 ">
						web制作会社で3.5年デザインとコーディングに従事
						<br />
						2025/05からAI駆動開発を開始
						<br />
						ヴィジュアル表現をブーストし
						<br />
						コンテキストエンジニアリングに注力しています
					</h1>
					<p className="mm2-2" style={{ fontSize: "4em" }}>
						Context
					</p>
					<p
						className="hidden lg:inline-block mm3-9"
						style={{ fontSize: "5em" }}
					>
						Web
					</p>
					<p className="mm9-6" style={{ fontSize: "4em" }}>
						Development
					</p>
				</section>

				<ScrollXSection className="relative mt-0">
					<div className="DialogWrapper">
						<div className=" mindMap  text-center experience   font-thin ">
							<h2
								className="mm1-3 text-[--GR] font-light text-left tracking-[-0.025em]"
								style={{ fontSize: "3em" }}
							>
								Experience and
								<br />
								Dependencies
							</h2>
							<div className="text-base mmPin mmStatic max-w-[calc(var(--wid)/2)]  experience_tx text-left San font-light   leading-[2em] static lg:absolute left-1/2 top-[--MY] z-10 p-4 bg-background/80">
								Cursor / Claude Code / Codex を使用
								<br />
								↓ツール使用経験をまとめています。
								<br />
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
									<h3 className="text-GR mt-10 mb-4">
										This Site
									</h3>
									<span className="budoux">
										実務外で制作したページや自作ツールをまとめています。
										<br />
										このページはオリジナルCMSのトップページを移植しました。
										以前の状態ですが、管理画面はこちらからご覧いただけます。
									</span>
									<br />
									<span className="mt-2 mr-6 font-medium">
										閲覧pass: view
									</span>
									<Button
										className="mt-4 align-top  [--btnW:50%]"
										href="https://cms0505.vercel.app/editor"
										external
									>
										CMS Editor&nbsp;
										<ArrowSquareOutIcon />
									</Button>
								</div>
							</div>

							<p style={{ fontSize: "2em" }}>Cursor</p>
							<p style={{ fontSize: "2em" }}>Claude Code</p>
							<p
								className="hidden lg:inline-block"
								style={{ fontSize: "1em" }}
							>
								context/harness
								<br />
								engineering
							</p>
							<p style={{ fontSize: "1.5em" }}>TailwindCSS</p>
							<p
								className="hidden lg:inline-block"
								style={{ fontSize: "1.5em" }}
							>
								canvasAPI
							</p>
							<p style={{ fontSize: "1.5em" }}>Codex</p>
							<p
								className="hidden lg:inline-block"
								style={{ fontSize: "1.5em" }}
							>
								Pencil.dev
							</p>
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
							<header className="flex items-start justify-between gap-[--gap] BorderB pb-4">
								<div>
									<p className=" text-sm  font-bold text-AC">
										Details
									</p>
									<h2 className="font-medium text-GR">
										Experience and Dependencies
									</h2>
									<p className="mt-2 leading-[--LH]">
										経験とAI依存の詳細。
										<span className="leading-[1.5] px-[1em] bg-AC/30">
											&nbsp;&nbsp;
										</span>{" "}
										は特に注力しているもの。
									</p>
								</div>
							</header>
							<section
								className="mt-8"
								aria-label="Experience and Dependencies "
							>
								<Cards className="col3 [--gap:1rem] ">
									<CardsItem className="space-y-4">
										<article className="BorderXY  px-4 py-5 text-xs bg-WH/70">
											<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
												エージェント / web
												<span className="text-GR   tracking-[0.1em] ">
													4 lists
												</span>
											</h3>
											<div className="DescList  [--dtW:50%] [--PY:0.25em] [--PX:0.25em]  mt-4 IsDdright">
												<dl className="items-center">
													<dt className="">Cursor</dt>
													<dd>
														<span className="px-2 bg-AC/30 font-medium">
															1 Year
														</span>
													</dd>
													<dt className="">
														Claude Code / web
													</dt>
													<dd>
														<span className="">
															4 Month / 1 Year
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
													<dd>1 Year / 6 Month</dd>
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
														WEB SCSS+JavaScript+HTML
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
													<dt>React/Next.Js/Vite</dt>
													<dd>
														<span className="px-2 bg-AC/30 font-medium">
															AI 1 Year
														</span>
													</dd>
													<dt>vue/astro/svelte</dt>
													<dd>AI 4 Month</dd>
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
													<dt className="">Vercel</dt>
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
													<dt className="">Github</dt>
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
									<CardsItem className="space-y-4">
										<article className="BorderXY  px-4 py-5 text-xs bg-WH/70">
											<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
												デザインツール
												<span className="text-GR   tracking-[0.1em] ">
													5 lists
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
													<dt className="">Figma</dt>
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
													<dt className="">Stitch</dt>
													<dd>
														<span className="">
															数回
														</span>
													</dd>
													<dt className="">
														GPT Image-2.0
													</dt>
													<dd>
														<span className="px-2 bg-AC/30 font-medium">
															LPデザイン作成
														</span>
													</dd>
													<dt className="">
														Claude Design
													</dt>
													<dd>
														<span className="">
															まだ未使用
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
													<dt className="">MacOS</dt>
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
													<dt className="">
														情報収集
													</dt>
													<dd>
														<span className="px-2 bg-AC/30 font-medium">
															主にX,Zenn,+webAI
															<br />
															ディスカバー
														</span>
													</dd>
													<dt className="">
														制作環境
													</dt>
													<dd>
														<span className="px-2 bg-AC/30 font-medium">
															自作のtask/memory/実行
															<br />
															スキル作成
														</span>
													</dd>
												</dl>
											</div>
										</article>
									</CardsItem>
									<CardsItem>
										<article className="BorderXY  px-4 py-5 text-xs bg-WH/70">
											<h3 className="text-[1rem] BorderB pb-4 flex items-baseline justify-between gap-4 ">
												その他
												<span className="text-GR   tracking-[0.1em] ">
													11 lists
												</span>
											</h3>
											<div className="DescList  [--dtW:50%] [--PY:0.25em] [--PX:0.25em]  mt-4 IsDdright">
												<dl className="items-center">
													<dt className="">
														Tailwind CSS
													</dt>
													<dd>
														<span className="px-2 bg-AC/30 font-medium">
															6 M,AI 1 Y
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
													<dd>
														<span className="">
															AI 1 Year
														</span>
													</dd>
													<dt className="">D3.js</dt>
													<dd>AI 6 Month</dd>
													<dt className="">GSAP</dt>
													<dd>
														<span className="">
															3.5 Year
														</span>
													</dd>
													<dt className="">
														VScode/Chrome Extentions
													</dt>
													<dd>
														<span className="">
															1~2回作成
														</span>
													</dd>
													<dt className="">
														NanoBanana SKILL
													</dt>
													<dd>
														<span className="">
															エディターで即時利用
														</span>
													</dd>
													<dt className="">
														Quiver.ai/arrow-1
													</dt>
													<dd>
														<span className="">
															BYOS
															demoのsvgドローで使用
														</span>
													</dd>
													<dt className="">
														LottieAnimation
													</dt>
													<dd>
														<span className="">
															webツール試用
														</span>
													</dd>
													<dt className="">
														memsearch
													</dt>
													<dd>
														<span className="">
															claude/codex自動記憶
														</span>
													</dd>
													<dt className="[--dtW:100%]">
														superpowers/oh-my-claudecode
													</dt>
													<dd className="[--ddW:100%]">
														<span>試用</span>
													</dd>
													<dt className="[--dtW:100%]">
														tweekpane
													</dt>
													<dd className="[--ddW:100%]">
														`/Generator`で使用
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
					<section className="Cards col2 relative items-center into">
						<div className="item">
							<div className="text-center">
								<h2 className="mindWobble font-thin text-left leading-[0.875em] tracking-[0.0em]">
									<span style={{ fontSize: "1.125em" }}>
										Burn
										<br />
										&nbsp;&nbsp;Your
										<br />
										&nbsp;Own
										<br />
										&nbsp;&nbsp;&nbsp;Style
									</span>
								</h2>
							</div>
						</div>
						<div className="item content-center">
							<div className=" leading-[2]">
								<h3>AI Native Development</h3>
								<br />
								個人のスタイルシステム（クラス、変数、スタイリングの癖）を元に、Claude
								Code・Cursor等エージェント向けドキュメントを充実させることで、Web
								制作の全工程をAI前提で進める為のプロジェクト。
								<br />
								<div className="flex flex-wrap">
									<Button
										className="mt-[2.5em] [--btnW:50%] mr-[50%]"
										href="https://github.com/yuremono/BurnYourOwnStyle/tree/react"
										external
									>
										Repository&nbsp;
										<ArrowSquareOutIcon />
									</Button>
									<br />
									<Button
										className="ml-[50%] [--btnW:50%]"
										href="/preview"
									>
										Preview
									</Button>
									<br />
									<details className="Toggle IsSmall font-normal ">
										<summary className="Eng">
											Thinking...
										</summary>
										<div>
											- LLM
											の学習データに基づくwebデザイン・コーディングは平均的で、振れ幅の大きい、標準ではないものであり、個人のマークアップ、スタイリングとかけ離れたものになる。
											<br />-
											事務作業のように決められた手順を実行させることで、vibeコーディングツールでは創造できないプロダクトを効率的に実装できる。
										</div>
									</details>
								</div>
							</div>
						</div>
						<p className="bg-GR/70 text-xs md:text-xl absolute z-10  font-thin Eng text-[--WH] min-h-[2.5rem] content-center left-0 bottom-0 w-full text-align-last-justify px-2 md:px-16">
							Typescript PhotoShop Figma Three.js Supabase GSAP
						</p>
					</section>
				</ScrollXSection>

				{/* OtherWorks */}
				<section className={otherWorksClasses.section}>
					<h2 className={otherWorksClasses.heading}>Other Works</h2>
					<Cards className={otherWorksClasses.cards}>
						<CardsItem
							className={`${otherWorksClasses.item} w-2/3`}
						>
							<h3>Agent Driven CMS</h3>
							<p
								className={`${otherWorksClasses.body} min-h-[5.5em]`}
							>
								Codex または Claude Code を Next.js Node
								runtimeで中継。
								ローカルブラウザからエージェントに直接ソースコードを編集させるCMS
							</p>
							<div className={`${otherWorksClasses.actions}`}>
								<Button
									className={otherWorksClasses.button}
									href="https://github.com/yuremono/agent-driven-CMS"
									external
								>
									Repository&nbsp;
									<ArrowSquareOutIcon />
								</Button>
								<Button
									className={otherWorksClasses.buttonInline}
									href="/agent"
								>
									Preview
								</Button>
								<div className="mt-auto">
									<details className="Toggle IsSmall font-normal mt-4">
										<summary className="Eng">
											Detail...
										</summary>
										<div>
											動機：AI時代にクライアントが求めるのは
											「チャットで編集できるwebサイト」でありCMS自体がボトルネック
											<br />
											手段：パブリックでなくローカル完結ならモデル性能依存を解消できる
											<br />
											成果：フロントエンド以外は全て仕様駆動で実現。エンタメ性もある
											<br />
											考察：
											リテラシーの高いクライアント＆十分な初期サポートという条件は必須と考えていたし、体験としては有意義であるが、
											エンジニアが負うべきエージェントの行動への責任は「サポート」ではカバーできなそうなので、ここまでやるならCursor、Codex
											app、Claude
											Desctop等の使い方自体をサポートした方が無難。などと考えました。
										</div>
									</details>
								</div>
							</div>
						</CardsItem>
						<CardsItem
							className={`${otherWorksClasses.item} space-y-2`}
						>
							<h3>Random Generator</h3>
							<p className={otherWorksClasses.body}>
								コントローラー付きのランダム図形配置ジェネレーター
							</p>
							<details className="Toggle IsSmall font-normal mt-[--btnH]">
								<summary className="Eng">SVG...</summary>
								<div>
									セル数、コンテナを埋める方向性、図形の種類(正方形、三角形、星、十字)、角度などを調整。rect,circle等SVGタグのスニペットをコピペできる。
								</div>
							</details>
							<details className="Toggle IsSmall font-normal mt-[--btnH]">
								<summary className="Eng">Rects...</summary>
								<div>
									divタグの大きさ、個数、角丸、重なり可否などを指定。いいバランスの時にコピーして画像配置などでそのまま使う想定。SVG出力も可。
								</div>
							</details>
							<div className={`${otherWorksClasses.actions}  `}>
								<Button
									className={`${otherWorksClasses.button} ml-[50%]`}
									href="/rects"
								>
									Generator
								</Button>
							</div>
						</CardsItem>
						<CardsItem className={`${otherWorksClasses.item}  lg:w-2/5`}>
							<h3>Activity</h3>
							<p className={otherWorksClasses.body}>
								職務要約と活動記録を書いています。
							</p>
							<div className={otherWorksClasses.actions}>
								<Button
									className={`ml-auto  ${otherWorksClasses.button}`}
									href="/activity"
								>
									Activity
								</Button>
							</div>
							<h3 className="mt-6 pt-6 BorderT">BoundingBoxOnDesign</h3>
							<p className={otherWorksClasses.body}>
                                                        AI生成のLPデザインにバウンディングボックスを配置し、画像+構造化データをエージェントに渡すツールです。
							</p>
							<div className={otherWorksClasses.actions}>
								<Button
									className={`ml-auto  ${otherWorksClasses.button}`}
									href="/bbox"
								>
									BBox
								</Button>
							</div>
							<h3 className="mt-6 pt-6 BorderT">GridCarousel</h3>
							<p className={otherWorksClasses.body}>
								グリッドカルーセルです
							</p>
							<div className={otherWorksClasses.actions}>
								<Button
									className={`ml-auto  ${otherWorksClasses.button}`}
									href="/grid-carousel"
								>
									GridCarousel
								</Button>
							</div>
						</CardsItem>
						<CardsItem
							className={`${otherWorksClasses.item}  lg:w-3/5`}
						>
							<h3>Pages</h3>
							<p className={otherWorksClasses.body}>
								実務で制作した派手なコンテンツの再現デモ集
							</p>
							<div className={otherWorksClasses.actions}>
								<Button
									className={otherWorksClasses.button}
									href="/glitch"
								>
									BG trigger + Glitch effect
								</Button>
								<Button
									className={otherWorksClasses.buttonInline}
									href="/shuffle-divide"
								>
									Shuffle Texts + Divided Images
								</Button>
								<Button
									className={`${otherWorksClasses.button} ml-[calc(50%-1px)]`}
									href="https://github.com/yuremono/creative-demos"
									external
								>
									Repository&nbsp;
									<ArrowSquareOutIcon />
								</Button>
							</div>
							<h3 className="mt-6 pt-6 BorderT">Chat Canban</h3>
							<p className={otherWorksClasses.body}>
								ローカル環境の特定ブラウザ(Chromium系)に拡張機能をインストールし、
								ChatGPTやGeminiにチャット履歴を送信するためのUIを設置。
								特定のurlでまとめて閲覧。
								ムーバブルサイドバー機能付き。
							</p>
							<div className={otherWorksClasses.actions}>
								<Button
									className={`${otherWorksClasses.button} `}
									href="https://github.com/yuremono/chatKanban"
									external
								>
									Repository&nbsp;
									<ArrowSquareOutIcon />
								</Button>
								<Button
									className={otherWorksClasses.buttonInline}
									href="https://chat-kanban.vercel.app/"
									external
								>
									Preview&nbsp;
									<ArrowSquareOutIcon />
								</Button>
							</div>
						</CardsItem>
					</Cards>
				</section>

				{/* ADCMS */}
				{/* <section className="Cards col2  items-center">
					<div className="item">
						Codex app-serverまたはClaude CodeをNext.jsの Node
						runtime経由で中継し、ブラウザから自然言語でサイト編集を行うローカルCMS
						<div>
							<Button
								className="mt-[--btnH] [--btnW:50%]"
								href="https://github.com/yuremono/agent-driven-CMS"
								external
							>
								Repository&nbsp;
								<ArrowSquareOutIcon />
							</Button>
							<br />
							<Button
								className="mt-4  [--btnW:50%]"
								href="/agent"
							>
								Preview
							</Button>
							<br />
							<details className="Toggle IsSmall font-normal mt-[--btnH]">
								<summary className="Eng">Detail...</summary>
								<div>
									動機：AI時代にクライアントが求めるのは
									<br />
									「チャットで編集できるwebサイト」でありCMS自体がボトルネック
									<br />
									手段：パブリックでなくローカル完結ならモデル性能依存を解消できる
									<br />
									成果：フロントエンド以外は全て仕様駆動で実現。エンタメ性もある
									<br />
									考察：
									リテラシーの高いクライアント＆十分な初期サポートという条件は必須と考えていたし、体験としては有意義であるが、
									<br />
									ここまでやるならCursorエディタを使ってもらった方がいい。という結論です。
								</div>
							</details>
						</div>
						<div className="text-center" />
					</div>
					<div className="item content-center">
						<div className="">
							<h2 className="mindWobble font-thin text-center leading-[0.6em]">
								<span style={{ fontSize: "0.625em" }}>
									Agent Driven
									<br />
									CMS
								</span>
							</h2>
							<div
								className="relative w-full mt-4"
								style={{
									aspectRatio: "80/39",
									minHeight: "auto",
								}}
							>
								<video
									className="absolute inset-0 h-full w-full object-cover border-[--BK10] border border-t-0"
									src={getAssetPath("/video/demo.mp4")}
									muted
									loop
									playsInline
									controls
									aria-label="Card 1"
								/>
							</div>
						</div>
					</div>
				</section> */}

				{/* CreativeDemos */}
				{/* <section className=" out text-center creative font-thin">
					<div id="Demos" />
					<h2 className="mindWobble font-thin ">
						<span style={{ fontSize: "0.75em" }}>
							Creative Demos
						</span>
					</h2>
					<a
						className="block"
						href="https://github.com/yuremono/creative-demos"
						target="_blank"
						rel="noopener noreferrer"
					>
						<div className="  bg-[--GR] text-[--WH] min-h-[2.5rem] content-center left-0 bottom-0 w-full text-center PX">
							<span>
								実務で制作したクリエイティブコンテンツの再現デモ集
							</span>
							<ArrowSquareOut
								className=" shrink-0"
								aria-hidden
								weight="regular"
							/>
						</div>
					</a>
				</section> */}

				{/* ChatKanban */}
				{/* <section className="Cards col2">
					<div className="item">
						<div className="text-center">
							<h2 className="mindWobble font-thin">
								Chat
								<br />
								Kanban
							</h2>
						</div>
					</div>
					<div className="item content-center">
						<div className="budoux">
							<div>
								<h3>Web AI 履歴管理・共有アプリdemo</h3>
								<br />
								ローカル環境の特定ブラウザ(Chromium系)に拡張機能をインストールし
								<br />
								ChatGPTやGeminiにチャット履歴を送信するためのUIを設置
								<br />
								特定のurlでまとめて閲覧
								<br />
								ムーバブルサイドバー機能付き
								<br />
								<div>
									<details className="Toggle IsSmall font-normal mt-4">
										<summary className="Eng">
											Thinking...
										</summary>
										<div>
											大手3社(OpenAI,Google,Anthropic)の公式webアプリでなんでもできちゃうけど使い分けると管理が大変なことの解決策及びNano
											Bananaが話題になりマルチプラットフォーム共有に価値があると考えたがCORSが厳しく一定期間で閲覧不可に...(画像を保存することの自動化が制限されているため手動保存が必要)
										</div>
									</details>
								</div>
								<a
									className="Eng inline-block ltr text-right px-1"
									href="https://chat-kanban.vercel.app/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span style={{ fontSize: "1.25em" }}>
										//
									</span>
									ChatKanban
								</a>
							</div>
						</div>
					</div>
				</section> */}
				{/* <section className="Cards col2 rtl hidden">
					<div className="item">
						<div className="text-center">
							<h2 className="mindWobble font-thin">
								Chat
								<br />
								Kanban
							</h2>
						</div>
					</div>
					<div className="item content-center">
						<div className="budoux">
							<div>
								<h3>Web AI 履歴管理・共有アプリdemo</h3>
								<br />
								ローカル環境の特定ブラウザ(Chromium系)に拡張機能をインストールし
								<br />
								ChatGPTやGeminiにチャット履歴を送信するためのUIを設置
								<br />
								特定のurlでまとめて閲覧
								<br />
								ムーバブルサイドバー機能付き
								<br />
								<div className="ltr text-right">
									<details className="Toggle IsSmall font-normal mt-4">
										<summary className="Eng">
											Thinking...
										</summary>
										<div>
											大手3社(OpenAI,Google,Anthropic)の公式webアプリでなんでもできちゃうけど使い分けると管理が大変なことの解決策及びNano
											Bananaが話題になりマルチプラットフォーム共有に価値があると考えたがCORSが厳しく一定期間で閲覧不可に...(画像を保存することの自動化が制限されているため手動保存が必要)
										</div>
									</details>
								</div>
								<a
									className="Eng inline-block ltr text-right px-1"
									href="https://chat-kanban.vercel.app/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span style={{ fontSize: "1.25em" }}>
										//
									</span>
									ChatKanban
								</a>
							</div>
						</div>
					</div>
				</section> */}
				{/* <section className="Cards col2  rtl hidden">
					<div className="item content-center">
						<div className="budoux text-center">
							<h2 className="mindWobble font-thin text-left">
								<span style={{ fontSize: "0.75em" }}>
									CSS Talk
								</span>
							</h2>
							<br />
							<br />
							<div className="ltr text-left">
								WindowsOS,MacOS,iphoneなど標準の音声入力で変換される正確ではないテキストを
								CSS プロパティに変換する VS Code 拡張。
								<br />
								<br />- OpenAi
								APIキー必須、システムプロンプト編集
								<br />- 登録モードで CSS クラスや変数を辞書登録
								<br />
								<br />
								<a
									className="Eng px-1"
									href="https://marketplace.visualstudio.com/items?itemName=yuremono.css-talk"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span style={{ fontSize: "1.25em" }}>
										//
									</span>
									CSS Talk
								</a>
							</div>
						</div>
					</div>
					<div className="item text-center">
						<div
							className="relative w-full"
							style={{
								aspectRatio: "16/9",
								minHeight: "auto",
							}}
						>
							<video
								className="absolute inset-0 h-full w-full object-cover"
								src="video/demo.mp4"
								muted
								loop
								playsInline
								autoPlay
								aria-label="Card 2"
							/>
						</div>
						<div />
					</div>
				</section> */}

				<div className="ImgText  grid-cols-1 items-center gap-8 md:grid-cols-2 ImgText hidden">
					{/* //画像コンポーネント有り */}
					<div>
						<div className="h-full">
							<p>ここにテキストを入力します</p>
						</div>
					</div>
				</div>

				<section
					className="Form Form hidden"
					style={{ "--base": "1200px" } as CSSProperties}
				>
					<div className="mb-8">
						<h2>お問い合わせ</h2>
						<p>以下のフォームよりおください。</p>
					</div>
					<form
						className="mx-auto max-w-2xl"
						onSubmit={onContactSubmit}
					>
						<div className="mb-4">
							<label
								htmlFor="nc-name"
								className="mb-2 block font-medium"
							>
								お名前
							</label>
							<input
								type="text"
								id="nc-name"
								className="w-full rounded border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
								required
								name="name"
							/>
						</div>
						<div className="mb-4">
							<label
								htmlFor="nc-email"
								className="mb-2 block font-medium"
							>
								メールアドレス
							</label>
							<input
								type="email"
								id="nc-email"
								className="w-full rounded border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
								required
								name="email"
							/>
						</div>
						<div className="mb-4">
							<label
								htmlFor="nc-message"
								className="mb-2 block font-medium"
							>
								メッセージ
							</label>
							<textarea
								id="nc-message"
								name="message"
								rows={4}
								className="w-full rounded border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--foreground)]"
								required
							/>
						</div>
						<div className="mb-4">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									className="mr-0"
									required
									name="privacy"
								/>
								<span>プライバシーポリシーに同意する</span>
							</label>
						</div>
						<button
							type="submit"
							className="rounded bg-slate-700 px-4 py-2 font-medium text-white"
						>
							送信
						</button>
						{formMessage ? (
							<p className="ncFormMessage" role="status">
								{formMessage}
							</p>
						) : null}
					</form>
				</section>
			</main>
			<Footer />
		</PageRoot>
	);
}

export default Next;
