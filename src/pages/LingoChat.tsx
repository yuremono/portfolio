// NOTE3: LingoChat LP。Tailwind ユーティリティのみ（BYOS セクション・CustomClass パターン不使用）。
// 画像は public/images/voice-match-lp/。静的パスは getAssetPath 経由。
import { useRef } from "react";
import { CaretDownIcon, StarIcon } from "@phosphor-icons/react";

import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
// 必ず使うので消さずにコメントで残す
import { getAssetPath } from "../lib/assetPath";

// PageRoot: --head 必須。コンテンツ幅・セクション間隔
const pageRootClass =
	"[--head:3.5rem] md:[--head:4.5rem] [--mvH:calc(100lvh_-_var(--head))] [--wid:100%] [--MY:3rem] md:[--MY:5rem] [--PX:clamp(1rem,4vw,1.5rem)] [--gap:1.5rem]";

const mainClass =
	"mt-[--head] min-h-[calc(100lvh_-_var(--head))] bg-background text-TC pb-[--MY] px-0";

const heroImg = getAssetPath("/images/voice-match-lp/hero-voice-match.png");
const iconMatch = getAssetPath("/images/voice-match-lp/icon-match.png");
const iconBusiness = getAssetPath("/images/voice-match-lp/icon-business.png");
const iconFlex = getAssetPath("/images/voice-match-lp/icon-flex.png");
const avatar01 = getAssetPath("/images/voice-match-lp/avatar-01.png");
const avatar02 = getAssetPath("/images/voice-match-lp/avatar-02.png");
const avatar03 = getAssetPath("/images/voice-match-lp/avatar-03.png");

function LingoChat() {
	const pageRootRef = useRef<HTMLDivElement>(null);

	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
		<PageRoot ref={pageRootRef} className={pageRootClass}>
			<Header className="LinkShadow UpInit " />
			<main id="main-content" className={mainClass}>
				{/* ヒーロー: キャッチ・サブ・CTA・ビジュアル */}
				<section
					className="relative overflow-hidden px-[--PX] pt-[--MY] pb-[--MY]"
					aria-labelledby="hero-heading"
				>
					<div
						className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/45 via-transparent to-accent/55"
						aria-hidden="true"
					/>
					<div
						className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
						aria-hidden="true"
					/>
					<div className="relative mx-auto flex w-full max-w-[--wid] flex-col gap-[calc(var(--gap)*1.33)] lg:flex-row lg:items-center">
						<div className="flex-1 space-y-6 lg:py-8">
							<p className="largeFZ mb-[-0.75rem] font-medium tracking-wide text-primary">
								LingoChat
							</p>
							<p className="inline-flex rounded-full bg-primary px-5 py-1.5 font-medium text-xs text-WH md:text-sm">
								月額 2,980 円から始められる
							</p>
							<h1
								id="hero-heading"
								className="h1FZ max-w-xl font-semibold leading-tight text-foreground"
							>
								目的でつながる、
								<span className="text-primary">
									オンライン英会話
								</span>
							</h1>
							<p className="max-w-xl text-muted leading-relaxed">
								ビジネス英語・TOEIC・日常会話など、学習目的に合わせてネイティブ講師とマッチング。
								仕事の合間に続けやすい料金から始められます。
							</p>
							<div className="flex flex-wrap items-center gap-3 text-muted">
								<span
									className="flex items-center gap-0.5 text-accent"
									aria-hidden="true"
								>
									{[0, 1, 2, 3, 4].map((i) => (
										<StarIcon
											key={`star-${String(i)}`}
											weight="fill"
											className="h-6 w-6"
										/>
									))}
								</span>
								<span className="text-sm">
									学習者アンケート集計イメージ・評価 4.8 / 5
								</span>
							</div>
							<div className="flex flex-wrap gap-4">
								<a
									href="#pricing"
									className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3.5 font-medium text-WH shadow-md shadow-primary/50 no-underline transition hover:opacity-95 hover:shadow-lg hover:shadow-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								>
									料金を見る
								</a>
								<a
									href="#how-it-works"
									className="inline-flex items-center justify-center rounded-md border-2 border-primary bg-background/80 px-8 py-3.5 font-medium text-primary shadow-sm backdrop-blur-sm no-underline transition hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								>
									使い方を見る
								</a>
							</div>
						</div>
						<div className="flex-1 lg:pl-4">
							<div className="relative">
								<div
									className="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-primary/45 to-accent/35 opacity-80 blur-2xl"
									aria-hidden="true"
								/>
								<img
									src={heroImg}
									width={1536}
									height={1024}
									alt="ビジネスパーソン向けのオンライン英会話・マッチングをイメージしたイラスト"
									className="relative w-full rounded-2xl object-cover ring-2 ring-primary/40 ring-offset-4 ring-offset-background"
									loading="eager"
									decoding="async"
								/>
							</div>
						</div>
					</div>
				</section>

				{/* 3 つのベネフィット */}
				<section
					className="border-t border-border/30 bg-gradient-to-b from-WH/50 to-third/55 px-[--PX] py-[--MY]"
					aria-labelledby="benefits-heading"
				>
					<div className="mx-auto w-full max-w-[--wid]">
						<p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
							Why LingoChat
						</p>
						<h2
							id="benefits-heading"
							className="h2FZ mb-[--gap] max-w-xl font-semibold text-foreground"
						>
							選ばれる理由
						</h2>
						<ul className="grid list-none gap p-0 lg:grid-cols-3">
							<li className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-background p-8 shadow-lg shadow-BK/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25">
								<div className="flex h-[4.75rem] w-[4.75rem] shrink-0 items-center justify-center rounded-2xl bg-third/85 p-3 ring ring-primary/10">
									<img
										src={iconMatch}
										width={96}
										height={96}
										alt=""
										className="h-16 w-16 object-contain"
									/>
								</div>
								<h3 className="h3FZ font-semibold text-foreground">
									目的別マッチング
								</h3>
								<p className="leading-relaxed text-muted">
									ビジネス・試験対策・カジュアルまで、目標に合う講師を自動で提案します。
								</p>
							</li>
							<li className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-background p-8 shadow-lg shadow-BK/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25">
								<div className="flex h-[4.75rem] w-[4.75rem] shrink-0 items-center justify-center rounded-2xl bg-third/85 p-3 ring ring-primary/10">
									<img
										src={iconBusiness}
										width={96}
										height={96}
										alt=""
										className="h-16 w-16 object-contain"
									/>
								</div>
								<h3 className="h3FZ font-semibold text-foreground">
									ビジネスに直結
								</h3>
								<p className="leading-relaxed text-muted">
									会議・メール・プレゼン想定のロールプレイで、そのまま職場で使える表現が身につきます。
								</p>
							</li>
							<li className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-background p-8 shadow-lg shadow-BK/5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25">
								<div className="flex h-[4.75rem] w-[4.75rem] shrink-0 items-center justify-center rounded-2xl bg-third/85 p-3 ring ring-primary/10">
									<img
										src={iconFlex}
										width={96}
										height={96}
										alt=""
										className="h-16 w-16 object-contain"
									/>
								</div>
								<h3 className="h3FZ font-semibold text-foreground">
									柔軟なスケジュール
								</h3>
								<p className="leading-relaxed text-muted">
									早朝・昼休み・夜。予約はアプリからいつでも。キャンセルルールもわかりやすく設計しています。
								</p>
							</li>
						</ul>
					</div>
				</section>

				{/* 使い方 3 ステップ */}
				<section
					id="how-it-works"
					className="scroll-mt-[calc(var(--head)+0.75rem)] px-[--PX] py-[--MY]"
					aria-labelledby="steps-heading"
				>
					<div className="mx-auto w-full max-w-[--wid]">
						<p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
							How it works
						</p>
						<h2
							id="steps-heading"
							className="h2FZ mb-[--gap] max-w-xl font-semibold text-foreground"
						>
							使い方はシンプル 3 ステップ
						</h2>
						<ol className="grid list-none gap p-0 lg:grid-cols-3 lg:gap-8">
							<li className="relative rounded-2xl border border-primary/40 bg-fourth/50 p-6 pl-[calc(var(--PX)+2.75rem)] shadow-md backdrop-blur-sm">
								<span
									className="absolute left-5 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-WH shadow-md ring-4 ring-primary/25"
									aria-hidden="true"
								>
									1
								</span>
								<h3 className="h3FZ mb-2 font-semibold text-foreground">
									プロフィールと目的を登録
								</h3>
								<p className="leading-relaxed text-muted">
									英語レベルや週の目標時間、重点分野を入力。講師マッチの精度に反映されます。
								</p>
							</li>
							<li className="relative rounded-2xl border border-primary/40 bg-fourth/50 p-6 pl-[calc(var(--PX)+2.75rem)] shadow-md backdrop-blur-sm">
								<span
									className="absolute left-5 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-WH shadow-md ring-4 ring-primary/25"
									aria-hidden="true"
								>
									2
								</span>
								<h3 className="h3FZ mb-2 font-semibold text-foreground">
									講師を選んで予約
								</h3>
								<p className="leading-relaxed text-muted">
									おすすめ一覧からプロフィールを比較し、都合のよい枠をワンタップで予約。
								</p>
							</li>
							<li className="relative rounded-2xl border border-primary/40 bg-fourth/50 p-6 pl-[calc(var(--PX)+2.75rem)] shadow-md backdrop-blur-sm">
								<span
									className="absolute left-5 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-WH shadow-md ring-4 ring-primary/25"
									aria-hidden="true"
								>
									3
								</span>
								<h3 className="h3FZ mb-2 font-semibold text-foreground">
									レッスン後に復習メモ
								</h3>
								<p className="leading-relaxed text-muted">
									指摘フレーズと次回のフォーカスが要約されます。忙しい平日でも振り返りが続けやすいです。
								</p>
							</li>
						</ol>
					</div>
				</section>

				{/* お客様の声 */}
				<section
					className="border-t border-border/30 bg-gradient-to-b from-fourth/45 to-background px-[--PX] py-[--MY]"
					aria-labelledby="voices-heading"
				>
					<div className="mx-auto w-full max-w-[--wid]">
						<p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
							Testimonials
						</p>
						<h2
							id="voices-heading"
							className="h2FZ mb-[--gap] max-w-xl font-semibold text-foreground"
						>
							お客様の声
						</h2>
						<ul className="grid list-none gap p-0 lg:grid-cols-3">
							<li className="flex flex-col gap-5 rounded-2xl border border-border/40 bg-background p-8 shadow-lg shadow-primary/15">
								<div className="flex items-start gap-3">
									<img
										src={avatar01}
										width={64}
										height={64}
										alt=""
										className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-primary/25 ring-offset-2 ring-offset-background"
									/>
									<div className="min-w-0">
										<span
											className="mb-3 flex gap-1 text-accent"
											aria-hidden="true"
										>
											{[0, 1, 2, 3].map((i) => (
												<StarIcon
													key={`voice1-${String(i)}`}
													weight="fill"
													size={22}
												/>
											))}
										</span>
										<p className="truncate font-semibold text-foreground">
											田中 誠（仮名）
										</p>
										<p className="text-xs text-muted">
											IT 企業・営業
										</p>
									</div>
								</div>
								<blockquote className="m-0 rounded-xl border-l-[5px] border-accent bg-accent/35 py-6 pl-4 pr-2 leading-relaxed text-foreground/75">
									海外との定例が増え、Listening は伸びましたが
									Speaking が課題でした。週 2
									回のビジネス枠で自信がつき、商談での質問が自然に言えるようになりました。
								</blockquote>
							</li>
							<li className="flex flex-col gap-5 rounded-2xl border border-border/40 bg-background p-8 shadow-lg shadow-primary/15">
								<div className="flex items-start gap-3">
									<img
										src={avatar02}
										width={64}
										height={64}
										alt=""
										className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-primary/25 ring-offset-2 ring-offset-background"
									/>
									<div className="min-w-0">
										<span
											className="mb-3 flex gap-1 text-accent"
											aria-hidden="true"
										>
											{[0, 1, 2, 3, 4].map((i) => (
												<StarIcon
													key={`voice2-${String(i)}`}
													weight="fill"
													size={22}
												/>
											))}
										</span>
										<p className="truncate font-semibold text-foreground">
											佐藤 奈々（仮名）
										</p>
										<p className="text-xs text-muted">
											メーカー・人事
										</p>
									</div>
								</div>
								<blockquote className="m-0 rounded-xl border-l-[5px] border-accent bg-accent/35 py-6 pl-4 pr-2 leading-relaxed text-foreground/75">
									TOEIC
									対策だけでなく、面接ロールプレイまでお願いできたのが良かったです。講師が丁寧にフィードバックしてくれるので、復習の軸がブレません。
								</blockquote>
							</li>
							<li className="flex flex-col gap-5 rounded-2xl border border-border/40 bg-background p-8 shadow-lg shadow-primary/15">
								<div className="flex items-start gap-3">
									<img
										src={avatar03}
										width={64}
										height={64}
										alt=""
										className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-primary/25 ring-offset-2 ring-offset-background"
									/>
									<div className="min-w-0">
										<span
											className="mb-3 flex gap-1 text-accent"
											aria-hidden="true"
										>
											{[0, 1, 2, 3].map((i) => (
												<StarIcon
													key={`voice3-${String(i)}`}
													weight="fill"
													size={22}
												/>
											))}
										</span>
										<p className="truncate font-semibold text-foreground">
											山本 大輔（仮名）
										</p>
										<p className="text-xs text-muted">
											コンサル・マネージャー
										</p>
									</div>
								</div>
								<blockquote className="m-0 rounded-xl border-l-[5px] border-accent bg-accent/35 py-6 pl-4 pr-2 leading-relaxed text-foreground/75">
									出張と育児で時間が細切れでも、朝 30
									分を活用できました。マッチングが目的ベースなので、雑談ばかりにならず効率よく感じます。
								</blockquote>
							</li>
						</ul>
					</div>
				</section>

				{/* 料金プラン */}
				<section
					id="pricing"
					className="scroll-mt-[calc(var(--head)+0.75rem)] bg-gradient-to-b from-background via-WH/30 to-fourth/45 px-[--PX] py-[--MY]"
					aria-labelledby="pricing-heading"
				>
					<div className="mx-auto w-full max-w-[--wid]">
						<p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
							Pricing
						</p>
						<h2
							id="pricing-heading"
							className="h2FZ mb-2 font-semibold text-foreground"
						>
							料金プラン
						</h2>
						<p className="mb-[--gap] max-w-3xl leading-relaxed text-muted">
							ベーシックは月額 2,980
							円から。学習量に合わせてプランをお選びください（税込イメージ）。
						</p>
						<div className="grid gap lg:grid-cols-3">
							<div className="flex flex-col rounded-2xl border border-border bg-background p-8 shadow-md transition hover:border-primary/25 hover:shadow-lg">
								<h3 className="h3FZ font-semibold text-foreground">
									ベーシック
								</h3>
								<p className="mt-2 text-sm text-muted">
									週 1 回から試したい方
								</p>
								<p className="mt-8 h2FZ font-bold text-primary md:mt-10">
									¥2,980
									<span className="align-top text-xs font-normal text-muted">
										{" "}
										/ 月
									</span>
								</p>
								<ul className="mt-6 flex-1 list-none space-y-3 text-muted">
									<li className="flex gap-2 text-sm leading-snug">
										<span
											className="font-bold text-primary"
											aria-hidden="true"
										>
											✓
										</span>
										月 4 コマまで予約可能
									</li>
									<li className="flex gap-2 text-sm leading-snug">
										<span
											className="font-bold text-primary"
											aria-hidden="true"
										>
											✓
										</span>
										目的別マッチング
									</li>
									<li className="flex gap-2 text-sm leading-snug">
										<span
											className="font-bold text-primary"
											aria-hidden="true"
										>
											✓
										</span>
										レッスン要約メモ
									</li>
								</ul>
								<a
									href="#final-cta"
									className="mt-8 inline-flex justify-center rounded-xl border-2 border-primary px-8 py-3.5 text-center font-medium text-primary no-underline transition hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								>
									このプランで始める
								</a>
							</div>
							<div className="relative flex scale-[1] flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-third/75 to-fourth p-px shadow-xl shadow-primary/60 lg:z-10 lg:-translate-y-2 lg:scale-[1.03] lg:shadow-2xl">
								<div className="relative flex h-full flex-col rounded-[0.975rem] bg-background p-8">
									<p className="absolute right-4 top-4 rounded-full bg-primary px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-WH lg:right-8">
										おすすめ
									</p>
									<h3 className="h3FZ font-semibold text-foreground">
										スタンダード
									</h3>
									<p className="mt-2 text-sm text-muted">
										継続学習に最適
									</p>
									<p className="mt-8 h2FZ font-bold text-primary md:mt-10">
										¥5,480
										<span className="align-top text-xs font-normal text-muted">
											{" "}
											/ 月
										</span>
									</p>
									<ul className="mt-6 flex-1 list-none space-y-3 text-muted">
										<li className="flex gap-2 text-sm leading-snug">
											<span
												className="font-bold text-primary"
												aria-hidden="true"
											>
												✓
											</span>
											月 8 コマまで予約可能
										</li>
										<li className="flex gap-2 text-sm leading-snug">
											<span
												className="font-bold text-primary"
												aria-hidden="true"
											>
												✓
											</span>
											優先マッチング
										</li>
										<li className="flex gap-2 text-sm leading-snug">
											<span
												className="font-bold text-primary"
												aria-hidden="true"
											>
												✓
											</span>
											ビジネストピック集中モード
										</li>
									</ul>
									<a
										href="#final-cta"
										className="mt-8 inline-flex justify-center rounded-xl bg-primary px-8 py-3.5 text-center font-medium text-WH shadow-md shadow-primary/50 no-underline transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
									>
										このプランで始める
									</a>
								</div>
							</div>
							<div className="flex flex-col rounded-2xl border border-border bg-background p-8 shadow-md transition hover:border-primary/25 hover:shadow-lg">
								<h3 className="h3FZ font-semibold text-foreground">
									プレミアム
								</h3>
								<p className="mt-2 text-sm text-muted">
									短期集中・複数目標
								</p>
								<p className="mt-8 h2FZ font-bold text-primary md:mt-10">
									¥8,980
									<span className="align-top text-xs font-normal text-muted">
										{" "}
										/ 月
									</span>
								</p>
								<ul className="mt-6 flex-1 list-none space-y-3 text-muted">
									<li className="flex gap-2 text-sm leading-snug">
										<span
											className="font-bold text-primary"
											aria-hidden="true"
										>
											✓
										</span>
										月 16 コマまで予約可能
									</li>
									<li className="flex gap-2 text-sm leading-snug">
										<span
											className="font-bold text-primary"
											aria-hidden="true"
										>
											✓
										</span>
										複数目的プロフィール
									</li>
									<li className="flex gap-2 text-sm leading-snug">
										<span
											className="font-bold text-primary"
											aria-hidden="true"
										>
											✓
										</span>
										講師固定リクエスト
									</li>
								</ul>
								<a
									href="#final-cta"
									className="mt-8 inline-flex justify-center rounded-xl border-2 border-primary px-8 py-3.5 text-center font-medium text-primary no-underline transition hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
								>
									相談して選ぶ
								</a>
							</div>
						</div>
					</div>
				</section>

				{/* FAQ */}
				<section
					className="border-t border-border/30 bg-background px-[--PX] py-[--MY]"
					aria-labelledby="faq-heading"
				>
					<div className="mx-auto w-full max-w-[--wid]">
						<p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
							FAQ
						</p>
						<h2
							id="faq-heading"
							className="h2FZ mb-[--gap] font-semibold text-foreground"
						>
							よくある質問
						</h2>
						<div className="overflow-hidden rounded-2xl border border-border shadow-md">
							<details className="group border-b border-border/80 bg-fourth/30 px-8 py-1 last:border-b-0 open:bg-fourth/50">
								<summary className="flex cursor-pointer items-center gap-4 py-4 font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
									<span className="grow">
										初心者やリスニング特化でも始められますか？
									</span>
									<CaretDownIcon
										className="h-7 w-7 shrink-0 text-primary transition group-open:-rotate-180"
										weight="regular"
										aria-hidden={true}
									/>
								</summary>
								<p className="max-w-none pb-6 pr-28 leading-relaxed text-muted lg:pr-[30%]">
									はい。レベル診断と目標ヒアリングのあと、講師側に共有されるため初回からペースが合いやすくなります。
								</p>
							</details>
							<details className="group border-b border-border/80 bg-fourth/30 px-8 py-1 last:border-b-0 open:bg-fourth/50">
								<summary className="flex cursor-pointer items-center gap-4 py-4 font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
									<span className="grow">
										マッチングはどのように決まりますか？
									</span>
									<CaretDownIcon
										className="h-7 w-7 shrink-0 text-primary transition group-open:-rotate-180"
										weight="regular"
										aria-hidden={true}
									/>
								</summary>
								<p className="max-w-none pb-6 pr-28 leading-relaxed text-muted lg:pr-[30%]">
									目的・業種・希望トーン・スケジュールの重なりからスコアリングし、上位候補を提示します。手動での検索・フィルタも可能です。
								</p>
							</details>
							<details className="group border-b border-border/80 bg-fourth/30 px-8 py-1 last:border-b-0 open:bg-fourth/50">
								<summary className="flex cursor-pointer items-center gap-4 py-4 font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
									<span className="grow">
										予約の変更・キャンセルはできますか？
									</span>
									<CaretDownIcon
										className="h-7 w-7 shrink-0 text-primary transition group-open:-rotate-180"
										weight="regular"
										aria-hidden={true}
									/>
								</summary>
								<p className="max-w-none pb-6 pr-28 leading-relaxed text-muted lg:pr-[30%]">
									レッスン開始の 24
									時間前までアプリから変更可能です（プランにより回数制限あり）。直前は講師・会員双方の公平性のため所定の消化となる場合があります。
								</p>
							</details>
							<details className="group border-b border-border/80 bg-fourth/30 px-8 py-1 last:border-b-0 open:bg-fourth/50">
								<summary className="flex cursor-pointer items-center gap-4 py-4 font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
									<span className="grow">
										無料トライアルはありますか？
									</span>
									<CaretDownIcon
										className="h-7 w-7 shrink-0 text-primary transition group-open:-rotate-180"
										weight="regular"
										aria-hidden={true}
									/>
								</summary>
								<p className="max-w-none pb-6 pr-28 leading-relaxed text-muted lg:pr-[30%]">
									新規登録後 7
									日間、ベーシック相当の枠をお試しいただけます（お一人様
									1
									回・クレジット登録が必要な場合があります）。
								</p>
							</details>
							<details className="group border-b border-border/80 bg-fourth/30 px-8 py-1 last:border-b-0 open:bg-fourth/50">
								<summary className="flex cursor-pointer items-center gap-4 py-4 font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
									<span className="grow">
										法人・チーム契約は対応していますか？
									</span>
									<CaretDownIcon
										className="h-7 w-7 shrink-0 text-primary transition group-open:-rotate-180"
										weight="regular"
										aria-hidden={true}
									/>
								</summary>
								<p className="max-w-none pb-6 pr-28 leading-relaxed text-muted lg:pr-[30%]">
									5
									名以上からまとめて割引と管理者ダッシュボードをご用意しています。詳細はお問い合わせフォームからご連絡ください。
								</p>
							</details>
						</div>
					</div>
				</section>

				{/* フッターストリップ + 最終 CTA */}
				<section
					id="final-cta"
					className="scroll-mt-[calc(var(--head)+0.75rem)] border-t border-border bg-gradient-to-r from-primary via-primary to-accent px-[--PX] py-20 text-WH"
					aria-labelledby="footer-cta-heading"
				>
					<div className="mx-auto flex w-full max-w-[--wid] flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
						<div>
							<h2
								id="footer-cta-heading"
								className="h2FZ font-semibold"
							>
								今すぐ目的別マッチングを体験
							</h2>
							<p className="mt-2 max-w-xl text-sm text-WH/80">
								30〜40 代のビジネス英語学習者向けに設計。月額
								2,980 円から。
							</p>
						</div>
						<a
							href="#pricing"
							className="inline-flex shrink-0 items-center justify-center rounded-full bg-WH px-8 py-5 text-base font-semibold text-primary shadow-lg shadow-BK/55 no-underline transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-WH"
						>
							プランを選ぶ
						</a>
					</div>
					<p className="mx-auto mt-8 w-full max-w-[--wid] border-t border-WH/25 pt-6 text-center text-xs text-WH/70">
						© サービス説明用の虚構 LP。会社名・商標は実在しません。
					</p>
				</section>
			</main>
		</PageRoot>
	);
}

export default LingoChat;
