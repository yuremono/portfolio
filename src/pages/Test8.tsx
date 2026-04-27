import { lazy, Suspense, useRef } from "react";
import { PageRoot } from "../components/PageRoot";
import { getAssetPath } from "../lib/assetPath";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";

// drei の Environment が HDRI をダウンロードするため、初期描画を重くしないよう遅延読み込みする。
const BrassCompass = lazy(() => import("../components/three/BrassCompass"));

/** 画像パスをまとめる。/images の直書きを避ける。 */
const asset = (name: string) => getAssetPath(`/images/${name}`);

/** 最低限必要な導線。 */
const siteItems = [
	{ id: "about", title: "About", copy: "概要を短く伝える。" },
	{ id: "works", title: "Works", copy: "内容を整理して見せる。" },
	{ id: "contact", title: "Contact", copy: "次の行動に進める。" },
] as const;

// htmlで指定されているpropは上書きできないので[font-family:--Ser]等で上書きする。その他の変数は[--wid:1080px]などで上書き可能
const rootClasses = " [--wid:1080px]  [font-family:--Ser] [--head:3.5rem] md:[--head:4.5rem] [--mvH:calc(100lvh-var(--head))]";

const mainClasses = " min-h-[100lvh] ";

function Test8() {
	const pageRootRef = useRef<HTMLDivElement>(null);

	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
		<PageRoot ref={pageRootRef} className={rootClasses}>
			<header className="sticky top-0 z-[1000] BorderB bg-background min-h-[--head]">
				<div className="PX ">
					<div className="flex flex-wrap items-center  gap-x-[--gap] min-h-[--head]">
						<a href="#top" className="Ser text-lg  ">
							logo
						</a>
						<nav aria-label="main navigation " className="ml-auto">
							<ul className="flex flex-wrap gapH ">
								{siteItems.map((item) => (
									<li key={item.id}>
										<a href={`#${item.id}`} className="">
											{item.title}
										</a>
									</li>
								))}
							</ul>
						</nav>
					</div>
				</div>
			</header>
			<main id="top" aria-labelledby="title" className={mainClasses}>
				{/* 1つ目のセクション: 画面幅いっぱいのメインビジュアル。 */}
				<section className="relative overflow-hidden">
					<figure className="overflow-hidden  ">
						<img
							src={asset("/placeholder/960x960.png")}
							alt=""
							aria-hidden="true"
							decoding="async"
							loading="eager"
							className=" h-[--mvH] w-full object-cover"
						/>
					</figure>
					<div className="absolute inset-0 PX py-[--MY] space-y-[--gap]">
						<p className="h3FZ  ">subtitle</p>
						<div className="space-y-4">
							<h1 id="title" className="h1FZ ">
								タイトルタイトル
							</h1>
							<p className="">
								テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト
							</p>
						</div>
						<div className="flex flex-wrap gapH text-TC">
							<a
								href="#about"
								className="BorderXY bg-WH/80 PX2 py-[--gapH]  BS"
							>
								About
							</a>
							<a
								href="#works"
								className="BorderXY bg-WH/80 PX2 py-[--gapH]  BS"
							>
								Works
							</a>
						</div>
					</div>
				</section>
				{/* コンパス 3D プレビュー: React Three Fiber + drei による真鍮製コンパスの立体表示。 */}
				<section
					id="compass-preview"
					aria-labelledby="compass-preview-title"
					className="relative overflow-hidden bg-BC/60"
				>
					<div className="mx-auto wid max-w-full PX py-[--MY] grid gap items-center md:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)]">
						<div className="space-y-4">
							<p className="h3FZ">3D Preview</p>
							<h2 id="compass-preview-title" className="h2FZ">
								真鍮コンパスの 3D オブジェクト
							</h2>
							<p className="max-w-prose">
								画像を参考に、<code>@react-three/fiber</code> と
								<code>@react-three/drei</code>{" "}
								の基本ジオメトリだけで組み上げた真鍮製コンパスです。マウスで掴むと向きを変えられます。
							</p>
							<ul className="space-y-[--gapH] text-sm leading-relaxed">
								<li>・外部モデルを読まず、three.js 標準のプリミティブのみで構成。</li>
								<li>・HDRI 環境マップ（Environment preset=&quot;studio&quot;）で金属反射を表現。</li>
								<li>・PresentationControls でドラッグ回転、ContactShadows で接地影を付与。</li>
							</ul>
						</div>
						<div className="relative mx-auto h-[min(82lvh,640px)] min-h-[28rem] w-full max-w-[28rem]">
							<Suspense
								fallback={
									<div className="grid h-full w-full place-items-center text-sm opacity-70">
										3D モデルを読み込み中...
									</div>
								}
							>
								<BrassCompass className="h-full w-full" />
							</Suspense>
						</div>
					</div>
				</section>
				{/* 2つ目のセクション: 一般的な情報ブロック。 */}
				<section className="mx-auto wid max-w-full PX py-[--MY] space-y-4">
					<div className="space-y-4">
						<p className="h3FZ  ">Overview</p>
						<h2 className="h2FZ ">タイトルタイトルタイトル</h2>
						<p className="max-w-prose ">
							テキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキストテキスト
						</p>
					</div>
					<ul className="grid gap sm:grid-cols-3">
						{siteItems.map((item) => (
							<li
								key={item.id}
								id={item.id}
								className="BorderXY bg-WH/80 p-[--PX] BS"
							>
								<p className="h3FZ font-medium  ">
									{item.title}
								</p>
								<p className="mt-[--gapH] ">{item.copy}</p>
							</li>
						))}
					</ul>
				</section>
			</main>
		</PageRoot>
	);
}

export default Test8;
