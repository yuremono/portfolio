import { useRef } from "react";
import { PageRoot } from "../components/PageRoot";
import { getAssetPath } from "../lib/assetPath";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";

/**  専用の画像パス*/
const asset = (name: string) => getAssetPath(`/images/common/test7/${name}`);

/** 下部の証明アイコン帯（有機栽培 / 露地栽培 / 無添加）。兄弟の位置違いはデータ配列でループ。 */
const certItems = [
	{ id: "organic", jp: "有機栽培", en: "ORGANIC", icon: "leaf" },
	{ id: "openfield", jp: "露地栽培", en: "OPEN FIELD", icon: "sun" },
	{ id: "additive", jp: "無添加", en: "ADDITIVE FREE", icon: "no" },
] as const;

/**
 *  変数は `main`（または `html`）の className へ `[--名:値]` の Tailwind arbitrary で定義。
 * 値内のスペースは下線 `_` に置く（`EB_Garamond` → "EB Garamond" など）。
 */
const test7MainVarClasses =
	" [--wid:100%] [font-family:var(--Ship)]  [--TS:0_0.08em_0.22em_color-mix(in_oklch,var(--BK)_88%,transparent)] [--TSsoft:0_0.04em_0.12em_color-mix(in_oklch,var(--BK)_70%,transparent)] [--heroColLeft:clamp(1.4rem,3vw,3rem)] [--heroColTop:clamp(1.2rem,2.6vw,2.6rem)] [--heroColBottom:clamp(6rem,11vh,8rem)] [--heroLabelRight:clamp(1.2rem,2.6vw,2.8rem)] [--heroLabelTop:clamp(1.2rem,2.4vw,2.4rem)] [--heroSideCopyRight:clamp(0.9rem,1.6vw,1.6rem)] [--heroSideCopyBottom:clamp(8rem,18vh,14rem)] [--heroPaperW:clamp(11rem,18vw,20rem)] [--heroCertBottom:clamp(1rem,2.4vh,1.8rem)] [--FZ:clamp(0.78rem,1.05vw,1.05rem)] [--h1:clamp(3.2rem,5.6vw,5.6rem)] [--h2:clamp(1.25rem,2vw,2.35rem)] [--h3:clamp(0.75rem,1vw,0.95rem)] [--lhFZ:1.7] [--lh1:0.95] [--lh2:0.98] [--lh3:1.75] [--lsFZ:0.18em] [--ls1:0.06em] [--ls2:0.02em] [--t7CopyMax:clamp(14rem,22vw,22rem)] [--t7BodyMax:14rem] [--t7EnBodyMt:clamp(0.8rem,1.2vw,1.1rem)] [--t7LogoMt:clamp(1.1rem,1.8vw,1.6rem)] [--t7LogoW:clamp(8.5rem,12vw,12rem)] [--t7StampW:clamp(3.6rem,5.4vw,5.6rem)] [--t7LabelW:clamp(10rem,15vw,16rem)] [--t7TagW:clamp(5.5rem,8vw,8.5rem)] [--t7TitleGap:clamp(0.7rem,1.4vw,1.3rem)] [--t7CertIconW:clamp(2.2rem,2.8vw,2.8rem)] [--t7CertGap:clamp(1rem,2vw,2rem)] [--BGgrad:linear-gradient(90deg,color-mix(in_oklch,var(--BK)_90%,transparent)_0%,color-mix(in_oklch,var(--BK)_58%,transparent)_32%,color-mix(in_oklch,var(--BK)_18%,transparent)_60%,transparent_82%)] [--BGgrad2:linear-gradient(180deg,color-mix(in_oklch,var(--BK)_55%,transparent)_0%,transparent_24%,transparent_56%,color-mix(in_oklch,var(--BK)_82%,transparent)_100%)] [--BGgrad3:radial-gradient(ellipse_at_78%_24%,color-mix(in_oklch,var(--WH)_10%,transparent)_0%,transparent_38%)]";

// Test7 は原ポスターを忠実に再現した縦長メインビジュアル。写真を背景、テキスト群を重ね合わせる。
function Test7() {
	const pageRootRef = useRef<HTMLDivElement>(null);

	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
		<PageRoot ref={pageRootRef} className="bg-[--BK] text-[--WH]">
			<main
				aria-label="八ヶ岳自然農園 メインビジュアル"
				className={`mx-auto w-full ${test7MainVarClasses}`}
			>
				<section
					aria-labelledby="test7-hero-title"
					className="relative w-full min-h-[100lvh] overflow-hidden bg-[--BK]"
				>
					{/* 背景：瓶のライフスタイル写真を全面カバー、瓶中心を右寄りに保つ */}
					<img
						src={asset("MVjar-lifestyle.png")}
						alt=""
						aria-hidden="true"
						decoding="async"
						loading="eager"
						className="absolute inset-0 h-full w-full object-cover "
					/>
					{/* 暗部グラデーション：左から暗く、上下にもビネットをかけてテキストの可読性を確保 */}
					<div className="absolute inset-0 bg-[image:var(--BGgrad)]" />
					<div className="absolute inset-0 bg-[image:var(--BGgrad2)]" />
					<div className="absolute inset-0 bg-[image:var(--BGgrad3)] mix-blend-screen" />

					{/* 左カラム全体：縦書き見出し → 英語コピー → ブランドロゴを縦方向に重ならないよう配置 */}
					<div className="absolute left-[var(--heroColLeft)] top-[var(--heroColTop)] bottom-[var(--heroColBottom)] flex flex-col flex-wrap gap-[--gap] max-h-[100lvh]">
						<div className="flex items-start gap-[var(--t7TitleGap)]">
							<p className="[font-size:var(--FZ)] leading-[var(--lhFZ)] tracking-[var(--lsFZ)] text-[--WH]/85 text-shadow-[var(--TSsoft)] [writing-mode:vertical-rl] [text-orientation:upright]">
								<span className="block">信州・八ヶ岳山麓の有機農園</span>
								<span className="block">旬の野菜を、手間ひまかけて。</span>
							</p>
							<h1
								id="test7-hero-title"
								className="[font-size:var(--h1)] leading-[var(--lh1)] tracking-[var(--ls1)] text-[--WH] text-shadow-[var(--TS)] [writing-mode:vertical-rl] [text-orientation:upright]"
							>
								<span className="block">山の恵み、</span>
								<span className="block">土のちから。</span>
							</h1>
						</div>

							<div className=" flex items-center gap-[var(--t7TitleGap)]">
								<img
									src={asset("logo-mark.png")}
									alt="八ヶ岳自然農園 YATSUGATAKE NATURAL FARM"
									decoding="async"
									className="w-[var(--t7LogoW)]"
								/>
								<img
									src={asset("stamp-organic.png")}
									alt=""
									aria-hidden="true"
									decoding="async"
									className="w-[var(--t7StampW)]  drop-shadow-[var(--TS)]"
								/>
							</div>
						<div>
							<p className="font-[var(--Eng)] text-xl leading-[var(--lh2)] tracking-[var(--ls2)] text-[--WH] text-shadow-[var(--TSsoft)]">
								Rooted in Soil.
								<br />
								Nourished by the Seasons.
							</p>
							<p className="mt-[var(--t7EnBodyMt)]  font-[var(--Eng)] leading-[var(--lh3)] text-[--WH]/78">
								Organic vegetables,
								<br />
								traditionally grown.
								<br />
								Preserved with care,
								<br />
								for a wholesome life.
							</p>
						</div>
					</div>

					{/* 右上：商品ラベル＋緑のネームタグを一組で配置 */}
					<div className="absolute right-[var(--heroLabelRight)] top-[var(--heroLabelTop)] flex items-start gap-[var(--t7TitleGap)]">
						<img
							src={asset("label-card.png")}
							alt="山里の彩り ラベル"
							decoding="async"
							className="w-[var(--t7LabelW)]  drop-shadow-[var(--TS)]"
						/>
						<img
							src={asset("tag-green.png")}
							alt=""
							aria-hidden="true"
							decoding="async"
							className="mt-[clamp(1rem,3vw,2.5rem)] w-[var(--t7TagW)]  drop-shadow-[var(--TS)]"
						/>
					</div>

					{/* 右側：縦書きの締めコピー（label と 認証帯に被らない位置） */}
					<p
						className="absolute right-[var(--heroSideCopyRight)] bottom-[var(--heroSideCopyBottom)] [font-size:var(--FZ)] leading-[var(--lhFZ)] tracking-[var(--lsFZ)] text-[--WH]/82 text-shadow-[var(--TSsoft)] [writing-mode:vertical-rl] [text-orientation:upright]"
					>
						<span className="block">土を耕し、種をまき、</span>
						<span className="block">いのちをつなぐ。</span>
						<span className="block">昔も、いまも、これからも。</span>
					</p>

					{/* 下辺：紙の山（地平線）— 左外に一部はみ出させて主役テキストを避ける */}
					<img
						src={asset("torn-mountain.png")}
						alt=""
						aria-hidden="true"
						decoding="async"
						className="absolute bottom-0 right-0 scale-x-[-1] w-[var(--heroPaperW)] opacity-85 pointer-events-none"
					/>

					{/* 下部中央：認証アイコン帯（有機栽培 / 露地栽培 / 無添加） */}
					<ul className="absolute bottom-[var(--heroCertBottom)] left-1/2 -translate-x-1/2 flex items-end gap-[var(--t7CertGap)]">
						{certItems.map((it) => (
							<li key={it.id} className="flex flex-col items-center">
								<span className="w-[var(--t7CertIconW)] aspect-square rounded-full border border-[--WH]/60 bg-[--BK]/40 grid place-items-center">
									<CertIcon kind={it.icon} />
								</span>
								<span className="mt-[0.45rem] [font-size:var(--h3)] tracking-[var(--ls1)] text-[--WH]/90 text-shadow-[var(--TSsoft)]">
									{it.jp}
								</span>
								<span className="font-[var(--Eng)] text-[0.64rem] tracking-[var(--lsFZ)] text-[--WH]/70">
									{it.en}
								</span>
							</li>
						))}
					</ul>
				</section>
			</main>
		</PageRoot>
	);
}

/** 認証アイコン：葉・太陽・禁マークをインラインSVGで描画。サイズは変数基準。 */
function CertIcon({ kind }: { kind: "leaf" | "sun" | "no" }) {
	const common =
		"h-[55%] w-[55%] fill-none stroke-[--WH]/90 [stroke-width:1.25]";
	if (kind === "leaf") {
		return (
			<svg viewBox="0 0 24 24" className={common} aria-hidden="true">
				<path d="M4 20C4 11 11 4 20 4c0 9-7 16-16 16z" strokeLinejoin="round" />
				<path d="M4 20L14 10" strokeLinecap="round" />
			</svg>
		);
	}
	if (kind === "sun") {
		return (
			<svg viewBox="0 0 24 24" className={common} aria-hidden="true">
				<circle cx="12" cy="14" r="4" />
				<path d="M4 20h16" strokeLinecap="round" />
				<path d="M6 10l3-4M18 10l-3-4M12 4v2" strokeLinecap="round" />
			</svg>
		);
	}
	return (
		<svg viewBox="0 0 24 24" className={common} aria-hidden="true">
			<circle cx="12" cy="12" r="8" />
			<path d="M6 6l12 12" strokeLinecap="round" />
		</svg>
	);
}

export default Test7;
