import { useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import {
	ArrowSquareOut,
	Moon,
	Sun,
} from "@phosphor-icons/react";
import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { usePage } from "../hooks/usePage";
import "../scss/Next.scss";

const EDITOR_URL = "https://cms0505.vercel.app/editor";

function Next() {
	const { ref, dark, toggleTheme } = usePage();
	useClientRuntime({ rootRef: ref });
	useHtmlRootClass();
	const [formMessage, setFormMessage] = useState<string | null>(null);

	const onContactSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setFormMessage(
			"デモ表示のため送信処理は行っていません。実際のお問い合わせは別途メール等でご連絡ください。",
		);
	};

	return (
		<PageRoot ref={ref} className=" [--innerPX:--PX] [--Eng:--Jost] [--h3FZ:1.325em]">
			<Header className="NoLogo TopHidden" />

			<button
				type="button"
				className="ThemeToggle"
				aria-label="Toggle dark mode"
				onClick={toggleTheme}
			>
				{dark ? (
					<Sun
						className="text-amber-400"
						weight="regular"
						aria-hidden
					/>
				) : (
					<Moon
						className="text-zinc-700"
						weight="regular"
						aria-hidden
					/>
				)}
			</button>

			<main className=" min-h-screen ">
				<section className="HtmlContent mindMap out text-center about fontJost font-thin">
					<p
						className="mmPin about_p text-[--GR] fw300 text-center"
						style={{ fontSize: "3em" }}
					>
						yuremono
						<br />
						works
					</p>
					<h1 className="mmPin about_tx text-left fontZen text-lg">
						web制作会社で3.5年デザインとコーディングに従事
						<br />
						AI関連の学習とフロントエンド効率化に取り組んでいます
					</h1>
					<p className="mm1-2" style={{ fontSize: "4em" }}>
						Generate
					</p>
					<p
						className="hidden lg:inline-block mm2-9"
						style={{ fontSize: "5em" }}
					>
						Web
					</p>
					<p className="mm10-6" style={{ fontSize: "4em" }}>
						Creation
					</p>
				</section>

				<div className="HtmlContent mt-0">
					<div id="Overview" />
				</div>

				<section className="HtmlContent mindMap out text-center knowledge fontJost font-thin mt-0">
					<h2
						className="mm1-3 text-[--GR] fw300 text-left"
						style={{ fontSize: "3em" }}
					>
						Knowledge
						<br />
						and
						<br />
						Interest
					</h2>
					<span className="mmPin knowledge_tx text-left fontZen mmStatic">
						このページはオリジナルCMSのトップページです。
						<br />
						<br />
						アプリ開発、UX設計を経験するために作成しました。
						<br />
						公開サイトの editor で全コンテンツを編集しています。
						<br />
						<span className="text-xs leading-none">
							閲覧pass/view
						</span>
						<br />
						主要技術： Next.js TypeScript Tailwind CSS supabase
						<br />
						<a
							className="fontJost px-1 font-normal"
							href={EDITOR_URL}
							target="_blank"
							rel="noopener noreferrer"
						>
							<span style={{ fontSize: "1.25em" }}>/ </span>
							editor
						</a>
					</span>

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
					<p className="mmPin knowledge_bottom text-[--BK]">
						Typescript PhotoShop Figma Three.js Supabase GSAP
					</p>
				</section>

				<section className="Cards col2 ">
					<div className="item">
						<div className="text-center">
							<div id="Achieves" />
							<h2 className="mindWobble fw100 text-left leading-[0.68em] tracking-[0.0em]">
								<span style={{ fontSize: "0.875em" }}>
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
						<div className="budoux leading-[2]">
							<h3>AI Native Development</h3>
							<br />
							個人のスタイルシステム（クラス、変数、スタイリングの癖）を元に、Claude
							Code・Cursor
							等エージェント向けドキュメントを充実させることで、Web
							制作の全工程をAI前提で進める為のプロジェクト。
							<br />
							<details className="Toggle IsSmall mt-4">
								<summary className="fontJost">
									Thinking...
								</summary>
								<div>
									- LLM
									の学習データに基づくwebデザイン・コーディングは平均的で、振れ幅の大きい、標準ではないものであり、個人のマークアップ、スタイリングとかけ離れたものになる。
									<br />-
									事務作業のように決められた手順を実行させることで、vibeコーディングツールでは創造できないプロダクトを効率的に実装できる。
								</div>
							</details>
							<a
								className="fontJost px-1"
								href="https://github.com/yuremono/BurnYourOwnStyle/tree/react"
								target="_blank"
								rel="noopener noreferrer"
							>
								<span style={{ fontSize: "1.25em" }}>// </span>
								BYOS
							</a>
						</div>
					</div>
				</section>

				<section className="Cards col2  items-center">
					<div className="item">
						<div
							className="relative w-full ADCMS"
							style={{
								aspectRatio: "80/39",
								minHeight: "auto",
							}}
						>
							<video
								className="absolute inset-0 h-full w-full object-cover border-[--BK10] border border-t-0"
								src=""
								muted
								loop
								playsInline
								controls
								aria-label="Card 1"
							/>
						</div>
						<div className="text-center" />
					</div>
					<div className="item content-center">
						<div className="budoux">
							<h2 className="mindWobble fw100 text-center leading-[0.6em]">
								<span style={{ fontSize: "0.625em" }}>
									Agent Driven
									<br />
									CMS
								</span>
							</h2>
							<br />
							<br />
							Codex app-serverまたはClaude CodeをNext.jsの Node runtime経由で中継し、ブラウザから自然言語でサイト編集を行うローカルCMS
							<br />
							<div>
								<details className="Toggle IsSmall mt-4">
									<summary className="fontJost">
										Detail...
									</summary>
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
							<a
								className="fontJost inline-block ltr text-right px-1"
								href="https://github.com/yuremono/agent-driven-CMS"
								target="_blank"
								rel="noopener noreferrer"
							>
								<span style={{ fontSize: "1.25em" }}>// </span>
								ADCMS
							</a>
						</div>
					</div>
				</section>

				<section className="HtmlContent out text-center creative font-thin">
					<div id="Demos" />
					<h2 className="mindWobble fw100 ">
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
						<div className="creative_bottom flex flex-wrap items-center justify-center gap-1">
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
				</section>

				<section className="Cards col2">
					<div className="item">
						<div className="text-center">
							<h2 className="mindWobble fw100">
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
									<details className="Toggle IsSmall mt-4">
										<summary className="fontJost">
											Thinking...
										</summary>
										<div>
											大手3社(OpenAI,Google,Anthropic)の公式webアプリでなんでもできちゃうけど使い分けると管理が大変なことの解決策及びNano
											Bananaが話題になりマルチプラットフォーム共有に価値があると考えたがCORSが厳しく一定期間で閲覧不可に...(画像を保存することの自動化が制限されているため手動保存が必要)
										</div>
									</details>
								</div>
								<a
									className="fontJost inline-block ltr text-right px-1"
									href="https://chat-kanban.vercel.app/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span style={{ fontSize: "1.25em" }}>
										//{" "}
									</span>
									ChatKanban
								</a>
							</div>
						</div>
					</div>
				</section>

				<section className="Cards col2 rtl hidden">
					<div className="item">
						<div className="text-center">
							<h2 className="mindWobble fw100">
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
									<details className="Toggle IsSmall mt-4">
										<summary className="fontJost">
											Thinking...
										</summary>
										<div>
											大手3社(OpenAI,Google,Anthropic)の公式webアプリでなんでもできちゃうけど使い分けると管理が大変なことの解決策及びNano
											Bananaが話題になりマルチプラットフォーム共有に価値があると考えたがCORSが厳しく一定期間で閲覧不可に...(画像を保存することの自動化が制限されているため手動保存が必要)
										</div>
									</details>
								</div>
								<a
									className="fontJost inline-block ltr text-right px-1"
									href="https://chat-kanban.vercel.app/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span style={{ fontSize: "1.25em" }}>
										//{" "}
									</span>
									ChatKanban
								</a>
							</div>
						</div>
					</div>
				</section>

				<section className="Cards col2  rtl hidden">
					<div className="item content-center">
						<div className="budoux text-center">
							<h2 className="mindWobble fw100 text-left">
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
									className="fontJost px-1"
									href="https://marketplace.visualstudio.com/items?itemName=yuremono.css-talk"
									target="_blank"
									rel="noopener noreferrer"
								>
									<span style={{ fontSize: "1.25em" }}>
										//{" "}
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
				</section>

				<div className="HtmlContent mt-0">
					<div id="Outro" />
				</div>

				<div
					className="DescList  IsCenter  out into Wrap bg-[--foreground] text-[--background] bg-no-repeat bg-contain bg-left-bottom"
					style={{
						backgroundImage: `url(images/fff2.svg)`,
					}}
				>
					<div>
						<dl >
							<dt>Name</dt>
							<dd>Yano Seiji</dd>
							<dt>Hobby</dt>
							<dd>
								Manga I love
								<br />
								Anime I love
								<br />
								Light Novel I love
								<br />
								Music I love
							</dd>
							<dt>Specialty</dt>
							<dd>
								CSS Styling
								<br />
								Context Engineering
							</dd>
						</dl>
					</div>
				</div>

				<div className="ImgText  grid-cols-1 items-center gap-8 md:grid-cols-2 ImgText hidden">
					{/* //画像コンポーネント有り */}
					<div>
						<div className="h-full">
							<p>ここにテキストを入力します</p>
						</div>
					</div>
				</div>

				<div
					className="hidden"
					style={{ "--gap": "40px" } as CSSProperties}
				/>

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
		</PageRoot>
	);
}

export default Next;
