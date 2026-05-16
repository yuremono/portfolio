import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";

/** 5項目リスト用の素材データ。原画の右カラムをWeb向けに再構成する。 */
const siteItems = [
	{ id: "inquiry", title: "探究", en: "INQUIRY", copy: "問いからすべてを始め、観察と対話で深める。", icon: "sky" },
	{ id: "creativity", title: "創造", en: "CREATIVITY", copy: "つくることで考え、まだない選択肢を形にする。", icon: "book" },
	{ id: "collaboration", title: "協働", en: "COLLABORATION", copy: "視野を持ち寄り、ひとりでは届かない解を探す。", icon: "route" },
	{ id: "transdisciplinary", title: "越境", en: "TRANSDISCIPLINARY", copy: "分野の境界を越え、知をつないで学び直す。", icon: "orbit" },
	{ id: "impact", title: "社会実装", en: "IMPACT", copy: "学びを社会へ戻し、変化の手触りまで確かめる。", icon: "seed" },
] as const;

/** ページ内ナビゲーション。 */
const navItems = [
	{ id: "principles", label: "Principles" },
	{ id: "method", label: "Method" },
	{ id: "contact", label: "Contact" },
] as const;

/** 探究の進め方。方法論セクションの短いステップ。 */
const methodSteps = [
	{ id: "question", title: "Question", copy: "違和感を観察し、よい問いへ磨く。" },
	{ id: "explore", title: "Explore", copy: "現場・資料・人に触れて仮説を広げる。" },
	{ id: "prototype", title: "Prototype", copy: "小さく作り、反応を受け取って直す。" },
	{ id: "reflect", title: "Reflect", copy: "学びを言語化し、次の問いへ接続する。" },
] as const;

/** SVG内で使う方眼と紙質ノイズの座標。 */
const gridLines = [0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960, 1000] as const;

const noiseDots = [
	{ id: "n1", cx: 4, cy: 7, r: 1 },
	{ id: "n2", cx: 12, cy: 28, r: 1 },
	{ id: "n3", cx: 18, cy: 82, r: 1 },
	{ id: "n4", cx: 27, cy: 16, r: 1 },
	{ id: "n5", cx: 34, cy: 64, r: 1 },
	{ id: "n6", cx: 42, cy: 36, r: 1 },
	{ id: "n7", cx: 51, cy: 91, r: 1 },
	{ id: "n8", cx: 59, cy: 12, r: 1 },
	{ id: "n9", cx: 66, cy: 52, r: 1 },
	{ id: "n10", cx: 73, cy: 76, r: 1 },
	{ id: "n11", cx: 81, cy: 24, r: 1 },
	{ id: "n12", cx: 89, cy: 58, r: 1 },
	{ id: "n13", cx: 96, cy: 44, r: 1 },
] as const;

const wordmarkScuffs = [
	{ id: "s1", x1: 82, y1: 58, x2: 168, y2: 52 },
	{ id: "s2", x1: 214, y1: 86, x2: 304, y2: 78 },
	{ id: "s3", x1: 356, y1: 48, x2: 438, y2: 43 },
	{ id: "s4", x1: 510, y1: 102, x2: 610, y2: 95 },
	{ id: "s5", x1: 642, y1: 68, x2: 752, y2: 61 },
	{ id: "s6", x1: 170, y1: 122, x2: 260, y2: 116 },
	{ id: "s7", x1: 626, y1: 127, x2: 790, y2: 119 },
] as const;

// htmlで指定されているpropは上書きできないので[font-family:--Ser]等で上書きする。その他の変数は[--wid:1080px]などで上書き可能
const rootClasses = " [--wid:1080px] [font-family:--Zen] [--head:3.5rem] md:[--head:4.5rem] [--mvH:calc(100lvh_-_var(--head))]";

const mainClasses = "min-h-[100lvh] bg-BC text-TC";

type FeatureIconKind = (typeof siteItems)[number]["icon"];

interface SvgClassProps {
	className?: string;
}

interface FeatureIconProps {
	kind: FeatureIconKind;
}

interface CompassMaterialColors {
	accent: string;
	base: string;
	line: string;
	shadow: string;
	white: string;
}

interface CompassSceneProps {
	colors: CompassMaterialColors;
}

/** Three.jsが解釈できる形式に変換する既存CSS変数の初期値。 */
const fallbackCompassColorTokens: CompassMaterialColors = {
	accent: "oklch(0.80 0.1 75)",
	base: "oklch(99% 0.005 60)",
	line: "oklch(0.49 0.14 265.73)",
	shadow: "oklch(20% 0.00 270)",
	white: "oklch(100% 0.00 60)",
};

function getCompassMaterialColors() {
	const styles = typeof document === "undefined" ? undefined : getComputedStyle(document.documentElement);
	return createCompassMaterialColors(styles);
}

function createCompassMaterialColors(styles?: CSSStyleDeclaration): CompassMaterialColors {
	return {
		accent: resolveCssVariableColor(styles?.getPropertyValue("--AC") ?? "", fallbackCompassColorTokens.accent),
		base: resolveCssVariableColor(styles?.getPropertyValue("--BC") ?? "", fallbackCompassColorTokens.base),
		line: resolveCssVariableColor(styles?.getPropertyValue("--MC") ?? "", fallbackCompassColorTokens.line),
		shadow: resolveCssVariableColor(styles?.getPropertyValue("--TC") ?? "", fallbackCompassColorTokens.shadow),
		white: resolveCssVariableColor(styles?.getPropertyValue("--WH") ?? "", fallbackCompassColorTokens.white),
	};
}

function resolveCssVariableColor(rawColor: string, fallback: string) {
	const color = rawColor.trim();
	if (!color) {
		return oklchToHex(fallback) ?? fallback;
	}

	return oklchToHex(color) ?? color;
}

function oklchToHex(color: string) {
	const match = color.match(/oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)/u);
	if (!match) {
		return null;
	}

	const lightness = parseLightness(match[1]);
	const chroma = Number(match[2]);
	const hue = Number(match[3]) * (Math.PI / 180);
	if (!Number.isFinite(lightness) || !Number.isFinite(chroma) || !Number.isFinite(hue)) {
		return null;
	}

	const a = chroma * Math.cos(hue);
	const b = chroma * Math.sin(hue);
	const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

	return `#${toHexChannel(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)}${toHexChannel(
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
	)}${toHexChannel(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)}`;
}

function parseLightness(value: string) {
	const amount = Number.parseFloat(value);
	return value.endsWith("%") ? amount / 100 : amount;
}

function toHexChannel(linearValue: number) {
	const value = Math.min(1, Math.max(0, linearValue));
	const srgb = value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
	return Math.round(Math.min(1, Math.max(0, srgb)) * 255)
		.toString(16)
		.padStart(2, "0");
}

function Aozora() {
	const pageRootRef = useRef<HTMLDivElement>(null);

	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
		<PageRoot ref={pageRootRef} className={rootClasses}>
			<header className="sticky top-0 z-[1000] BorderB min-h-[--head] bg-BC/90 backdrop-blur">
				<div className="PX">
					<div className="flex min-h-[--head] items-center gapH">
						<a
							href="#top"
							className="flex items-center gapH"
							aria-label="青空インスティチュート トップ"
						>
							<LogoMark className="h-10 w-10" />
							<span className="font-[--Eng] tracking-[0.125em] text-sm uppercase">
								AOZORA
							</span>
						</a>
						<nav
							aria-label="メインナビゲーション"
							className="ml-auto"
						>
							<ul className="hidden gapH md:flex">
								{navItems.map((item) => (
									<li key={item.id}>
										<a
											href={`#${item.id}`}
											className="font-[--Eng] text-sm tracking-[0.125em]"
										>
											{item.label}
										</a>
									</li>
								))}
							</ul>
						</nav>
					</div>
				</div>
			</header>
			<main id="top" aria-labelledby="title" className={mainClasses}>
				{/* 1つ目のセクション: Lottie Creator MCPで磨き上げる想定のブラスコンパス3Dプレビュー。 */}
				<section
					aria-labelledby="brass-compass-title"
					className="relative isolate grid min-h-[--mvH] place-items-center overflow-hidden bg-BC"
				>
					<GridPattern className="absolute inset-0 h-full w-full opacity-60" />
					<div
						className="absolute inset-0 bg-gradient-to-b from-BC/0 via-BC/0 to-BC/80"
						aria-hidden="true"
					/>
					<div className="relative z-10 mx-auto grid wid max-w-full gap PX py-[--MY] lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-center">
						<div className="space-y-[--gap]">
							<p className="font-[--Eng] text-sm tracking-[0.25em] text-MC uppercase">
								Lottie Creator MCP Preview
							</p>
							<h2
								id="brass-compass-title"
								className="h2FZ leading-[--HLH]"
							>
								問いを測るための、黄銅の針。
							</h2>
							<p className="max-w-prose text-TC/75">
								参考画像を下敷きに、Lottie Creator
								MCPで磨き上げる前提のドラフティングコンパスを先行配置しました。ヒンジ・調整ネジ・脚の角度・先端ピンまで、すべてLottieのshape
								layerで構成しています。
							</p>
							<ul className="space-y-[--gapH] text-sm text-TC/70">
								<li>
									ソース:{" "}
									<code className="font-[--Eng]">
										public/lottie/brass-compass.json
									</code>
								</li>
								<li>
									生成スクリプト:{" "}
									<code className="font-[--Eng]">
										scripts/build-brass-compass-lottie.mjs
									</code>
								</li>
								<li>
									再生成:{" "}
									<code className="font-[--Eng]">
										node
										scripts/build-brass-compass-lottie.mjs
									</code>
								</li>
							</ul>
						</div>
						<figure
							className="relative mx-auto aspect-[3/4] w-full max-w-[22rem] sm:max-w-[26rem] lg:max-w-none"
							role="img"
							aria-label="ゆっくり揺れるブラス製のドラフティングコンパス"
						>
							<BrassCompassLottie className="absolute inset-0 h-full w-full" />
						</figure>
					</div>
				</section>
				{/* 元画像を使わず、DOM/SVG素材だけでメインビジュアルを構成。 */}
				<section className="relative isolate min-h-[--mvH] overflow-hidden bg-BC">
					<GridPattern className="absolute inset-0 h-full w-full opacity-95" />
					<GeometryLayer className="absolute inset-0 h-full w-full opacity-90" />
					<PaperTexture className="absolute inset-0 h-full w-full opacity-75 mix-blend-multiply" />

					<div className="relative z-10 mx-auto grid min-h-[--mvH] wid max-w-full items-center gap PX py-[--MY] lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)]">
						<div className="space-y-[--gap]">
							<div className="flex items-center gapH">
								<LogoMark className="h-14 w-14" />
								<p className="font-[--Eng] text-sm tracking-[0.25em] text-MC uppercase">
									Ask Better. Build the Future.
								</p>
							</div>
							<h1
								id="title"
								className="h1FZ leading-[--HLH] tracking-[0.125em]"
							>
								青空インスティチュート
							</h1>
							<InstituteWordmark className="w-full max-w-[42rem]" />
							<p className="max-w-prose text-TC/80">
								問いを立て、試し、語り直す。複雑な世界に意味ある解をつくるための、探究と実装のための学び場です。
							</p>
							<div className="flex flex-wrap gapH pt-[--gapH]">
								<a
									href="#method"
									className="BorderXY bg-MC px-[--PX2] py-[--gapH] font-[--Eng] text-sm tracking-[0.125em] text-WH"
								>
									Our Method
								</a>
								<a
									href="#principles"
									className="BorderXY bg-WH/70 px-[--PX2] py-[--gapH] font-[--Eng] text-sm tracking-[0.125em] text-MC"
								>
									Five Principles
								</a>
							</div>
						</div>

						<aside
							className="space-y-[--gap]"
							aria-label="補助素材"
						>
							<Compass3DObject className="mx-auto aspect-square w-full max-w-[14rem] sm:max-w-[18rem] lg:max-w-[22rem]" />
							<p className="-rotate-2 [font-family:Yomogi,cursive] text-2xl leading-[1.375] text-MC/75">
								Socratic inquiry turns a question into a
								compass.
							</p>
						</aside>
					</div>
					<div className="pointer-events-none absolute bottom-[--PX] right-[--PX] hidden text-MC lg:block">
						<InstituteSeal className="w-44" />
					</div>
				</section>

				{/* Principles: 原画の5項目リストを、余白のある下層セクションとして展開。 */}
				<section
					id="principles"
					aria-labelledby="principles-title"
					className="mx-auto wid max-w-full PX py-[--MY]"
				>
					<div className="grid gap-[--MY] lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
						<div className="space-y-[--gap]">
							<p className="font-[--Eng] text-sm tracking-[0.25em] text-MC uppercase">
								Our principles
							</p>
							<h2 id="principles-title" className="h2FZ">
								問いを社会につなぐ、5つの姿勢。
							</h2>
							<p className="max-w-prose text-TC/70">
								右側に詰め込まず、読み進めるリズムを作るために原則を下層へ移動しました。アイコンはすべてインラインSVGです。
							</p>
							<CompassRoseMotif className="h-16 w-16 opacity-75" />
						</div>
						<ul className="grid gap md:grid-cols-2">
							{siteItems.map((item) => (
								<li
									key={item.id}
									id={item.id}
									className="BorderT flex gap py-[--gap]"
								>
									<span className="grid h-12 w-12 shrink-0 place-items-center rounded-full BorderXY bg-BC text-MC">
										<FeatureIcon kind={item.icon} />
									</span>
									<span className="space-y-[--gapH]">
										<span className="block h3FZ">
											{item.title}
										</span>
										<span className="block font-[--Eng] text-sm tracking-[0.125em] text-MC">
											{item.en}
										</span>
										<span className="block text-TC/70">
											{item.copy}
										</span>
									</span>
								</li>
							))}
						</ul>
					</div>
				</section>

				{/* Method: 方眼と幾何学線を背景に、探究プロセスを循環として説明。 */}
				<section
					id="method"
					aria-labelledby="method-title"
					className="relative overflow-hidden bg-TC py-[--MY] text-BC"
				>
					<GridPattern className="absolute inset-0 h-full w-full opacity-10" />
					<GeometryLayer className="absolute inset-0 h-full w-full opacity-40" />
					<div className="relative mx-auto grid wid max-w-full gap-[--MY] PX lg:grid-cols-2">
						<div className="space-y-[--gap]">
							<p className="font-[--Eng] text-sm tracking-[0.25em] text-AC uppercase">
								Socratic inquiry
							</p>
							<h2 id="method-title" className="h2FZ">
								問い、探索し、試作し、振り返る。
							</h2>
							<p className="max-w-prose text-BC/75">
								方法論は直線ではなく循環です。小さな問いを何度も回し、理解と実装の距離を少しずつ縮めます。
							</p>
							<p className="-rotate-2 [font-family:Yomogi,cursive] text-2xl leading-[1.375] text-AC">
								What will you question today?
							</p>
						</div>
						<ol className="grid gap-[--gap]">
							{methodSteps.map((step, index) => (
								<li
									key={step.id}
									className="BorderT border-BC/25 py-[--gap]"
								>
									<div className="flex gap-[--gap]">
										<span className="font-[--Eng] text-AC">
											0{index + 1}
										</span>
										<div className="space-y-[--gapH]">
											<h3 className="h3FZ">
												{step.title}
											</h3>
											<p className="text-BC/75">
												{step.copy}
											</p>
										</div>
									</div>
								</li>
							))}
						</ol>
					</div>
				</section>

				{/* CTA: 右下ロゴを置き、最後の行動をひとつに絞る。 */}
				<section
					id="contact"
					aria-labelledby="contact-title"
					className="relative overflow-hidden bg-MC py-[--MY] text-WH"
				>
					<div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-AC/90" />
					<div className="relative mx-auto wid max-w-full PX">
						<div className="max-w-3xl space-y-[--gap]">
							<p className="font-[--Eng] text-sm tracking-[0.25em] text-WH/75 uppercase">
								Ask Better. Build the Future.
							</p>
							<h2 id="contact-title" className="h2FZ">
								未来の問いを、ここから始める。
							</h2>
							<p className="max-w-prose text-WH/80">
								見学、共同プロジェクト、探究プログラムの相談まで。まずはひとつの問いを持って話しかけてください。
							</p>
							<a
								href="mailto:hello@example.com"
								className="BorderXY bg-WH px-[--PX2] py-[--gapH] font-[--Eng] text-sm tracking-[0.125em] text-MC"
							>
								Contact
							</a>
						</div>
						<div className="mt-[--MY] flex justify-end md:absolute md:bottom-0 md:right-[--PX] md:mt-0">
							<InstituteSeal className="w-44 text-WH" />
						</div>
					</div>
				</section>
			</main>
		</PageRoot>
	);
}

/** 方眼と中心線の背景。 */
function GridPattern({ className = "" }: SvgClassProps) {
	return (
		<svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className={className} aria-hidden="true">
			<rect width="1000" height="1000" className="fill-BC" />
			<g className="stroke-MC/15 [stroke-dasharray:18_6] [stroke-width:1]">
				{gridLines.map((line) => (
					<line key={`x-${line}`} x1={line} y1="0" x2={line} y2="1000" />
				))}
				{gridLines.map((line) => (
					<line key={`y-${line}`} x1="0" y1={line} x2="1000" y2={line} />
				))}
			</g>
			<g className="stroke-MC/25 [stroke-dasharray:28_12] [stroke-width:2]">
				<line x1="500" y1="0" x2="500" y2="1000" />
				<line x1="0" y1="500" x2="1000" y2="500" />
			</g>
		</svg>
	);
}

/** 数学的な丸、線、軌道を重ねる補助線。 */
function GeometryLayer({ className = "" }: SvgClassProps) {
	return (
		<svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden="true">
			<g className="fill-none stroke-MC/30 [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:0.5]">
				<circle cx="16" cy="18" r="10" />
				<circle cx="16" cy="18" r="18" className="[stroke-dasharray:1_2]" />
				<circle cx="76" cy="28" r="12" />
				<circle cx="76" cy="28" r="22" />
				<path d="M6 74C23 50 39 78 55 56S82 45 94 28" />
				<path d="M12 22L36 42L18 64" />
				<path d="M0 28H38M16 0V48" className="[stroke-dasharray:2_2]" />
			</g>
			<g className="fill-none stroke-AC/50 [stroke-dasharray:2_3] [stroke-linecap:round] [stroke-width:0.5]">
				<path d="M61 18A28 28 0 0 1 93 43" />
				<path d="M18 83A36 36 0 0 0 70 86" />
				<path d="M66 74L82 58L95 64" />
			</g>
			<g className="fill-MC/20 stroke-MC/40 [stroke-width:0.5]">
				<circle cx="16" cy="18" r="1" />
				<circle cx="24" cy="62" r="2" />
				<circle cx="55" cy="56" r="2" />
				<circle cx="76" cy="28" r="2" />
			</g>
			<g className="[font-family:Yomogi,cursive] text-[4px] fill-MC/55">
				<text x="9" y="69" transform="rotate(-8 9 69)">field note</text>
				<text x="61" y="52" transform="rotate(7 61 52)">hypothesis</text>
			</g>
		</svg>
	);
}

/** 紙質風の粒子と繊維線。 */
function PaperTexture({ className = "" }: SvgClassProps) {
	return (
		<svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden="true">
			<g className="fill-MC/10">
				{noiseDots.map((dot) => (
					<circle key={dot.id} cx={dot.cx} cy={dot.cy} r={dot.r} />
				))}
			</g>
			<g className="fill-none stroke-MC/10 [stroke-linecap:round] [stroke-width:0.5]">
				<path d="M0 18C18 16 26 20 42 18S70 14 100 18" />
				<path d="M0 49C20 52 34 46 54 49S78 55 100 50" />
				<path d="M0 86C18 82 31 88 48 85S78 80 100 84" />
			</g>
			<g className="fill-none stroke-WH/45 [stroke-dasharray:1_5] [stroke-width:1]">
				<path d="M4 11H32M48 15H83" />
				<path d="M8 38H27M39 41H68M74 39H96" />
				<path d="M12 73H44M58 77H91" />
			</g>
		</svg>
	);
}

/** 青空インスティチュートの大きな英字SVGワードマーク。 */
function InstituteWordmark({ className = "" }: SvgClassProps) {
	return (
		<svg viewBox="0 0 900 230" className={className} role="img" aria-label="AOZORA INSTITUTE">
			<title>AOZORA INSTITUTE</title>
			<defs>
				<filter id="wordmark-roughen" x="-4%" y="-8%" width="108%" height="116%">
					<feTurbulence type="fractalNoise" baseFrequency="0.125" numOctaves="2" seed="8" result="noise" />
					<feDisplacementMap in="SourceGraphic" in2="noise" scale="0.5" />
				</filter>
			</defs>
			<g filter="url(#wordmark-roughen)">
				<text
					x="450"
					y="106"
					textAnchor="middle"
					className="fill-MC/15 stroke-MC/25 text-[116px] font-black tracking-[0.0625em] [stroke-linejoin:round] [stroke-width:8]"
				>
					AOZORA
				</text>
				<text
					x="448"
					y="102"
					textAnchor="middle"
					className="fill-BC/50 stroke-MC/45 text-[116px] font-black tracking-[0.0625em] [stroke-dasharray:4_5] [stroke-linejoin:round] [stroke-width:2]"
				>
					AOZORA
				</text>
				<text
					x="450"
					y="105"
					textAnchor="middle"
					className="fill-MC/85 stroke-TC/45 text-[116px] font-black tracking-[0.0625em] [stroke-linejoin:round] [stroke-width:1]"
				>
					AOZORA
				</text>
				<g className="stroke-BC/75 [stroke-linecap:round] [stroke-width:4]">
					{wordmarkScuffs.map((line) => (
						<line key={line.id} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
					))}
				</g>
			</g>
			<path d="M82 140C210 132 324 146 450 139S675 130 818 142" className="fill-none stroke-AC/70 [stroke-linecap:round] [stroke-width:4]" />
			<path d="M94 152C236 147 356 158 506 151S706 146 806 154" className="fill-none stroke-MC/35 [stroke-dasharray:8_8] [stroke-linecap:round] [stroke-width:2]" />
			<text
				x="450"
				y="190"
				textAnchor="middle"
				className="fill-TC/75 text-[30px] font-bold tracking-[0.375em]"
			>
				INSTITUTE
			</text>
			<text x="450" y="218" textAnchor="middle" className="[font-family:Yomogi,cursive] fill-MC/65 text-[18px] tracking-[0.125em]">
				Socratic inquiry school
			</text>
		</svg>
	);
}

/** Lottie Creator MCPで磨き上げ前提のブラスコンパスプレビュー。 */
function BrassCompassLottie({ className = "" }: SvgClassProps) {
	return (
		<DotLottieReact
			className={className}
			src={getAssetPath("/lottie/brass-compass.json")}
			autoplay
			loop
			aria-hidden="true"
		/>
	);
}

/** React Three Fiberで構成する金属コンパス風3Dオブジェクト。 */
function Compass3DObject({ className = "" }: SvgClassProps) {
	const colors = getCompassMaterialColors();

	return (
		<figure className={`relative isolate ${className}`} role="img" aria-labelledby="compass-title">
			<span id="compass-title" className="sr-only">
				中心軸、2本脚、ヒンジ、針、リングを持つ金色の3Dコンパス
			</span>
			<Canvas
				aria-hidden="true"
				className="h-full w-full"
				camera={{ position: [0, 0, 5.5], fov: 34 }}
				dpr={[1, 1.5]}
				gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
			>
				<ambientLight intensity={0.625} />
				<directionalLight position={[2.5, 3.5, 4]} intensity={1.25} />
				<pointLight position={[-2, 1.5, 2]} intensity={0.875} />
				<CompassScene colors={colors} />
			</Canvas>
		</figure>
	);
}

/** 低ポリゴンmeshで組むコンパス本体。 */
function CompassScene({ colors }: CompassSceneProps) {
	const compassRef = useRef<Group>(null);

	useFrame(({ clock }) => {
		if (!compassRef.current) {
			return;
		}

		const time = clock.elapsedTime;
		compassRef.current.rotation.y = -Math.PI / 10 + Math.sin(time * 0.375) * 0.05;
		compassRef.current.rotation.z = -Math.PI / 20 + Math.sin(time * 0.25) * 0.04;
	});

	return (
		<group ref={compassRef} position={[0, -0.125, 0]} rotation={[Math.PI / 8, 0, -Math.PI / 20]}>
			<mesh position={[0.125, -1.625, -0.75]} scale={[1.375, 0.25, 1]}>
				<circleGeometry args={[1.25, 32]} />
				<meshBasicMaterial color={colors.shadow} transparent opacity={0.125} />
			</mesh>

			<mesh position={[0, 1.625, 0.125]}>
				<torusGeometry args={[0.375, 0.0625, 12, 36]} />
				<meshStandardMaterial color={colors.accent} metalness={0.95} roughness={0.175} />
			</mesh>
			<mesh position={[0, 1.125, 0.125]}>
				<cylinderGeometry args={[0.0875, 0.0875, 0.75, 16]} />
				<meshStandardMaterial color={colors.accent} metalness={0.9} roughness={0.2} />
			</mesh>
			<mesh position={[0, 0.875, 0.125]}>
				<boxGeometry args={[0.625, 0.25, 0.25]} />
				<meshStandardMaterial color={colors.accent} metalness={0.875} roughness={0.225} />
			</mesh>

			<mesh position={[0, 0.625, 0.125]}>
				<sphereGeometry args={[0.3125, 32, 16]} />
				<meshStandardMaterial color={colors.accent} metalness={0.925} roughness={0.18} />
			</mesh>
			<mesh position={[0, 0.625, 0.4375]} rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry args={[0.2, 0.2, 0.125, 32]} />
				<meshStandardMaterial color={colors.white} metalness={0.45} roughness={0.125} />
			</mesh>
			<mesh position={[0, 0.625, 0.5125]} rotation={[Math.PI / 2, 0, 0]}>
				<torusGeometry args={[0.2, 0.025, 8, 32]} />
				<meshStandardMaterial color={colors.line} metalness={0.75} roughness={0.25} />
			</mesh>

			<mesh position={[-0.4375, -0.375, 0]} rotation={[0, 0, -Math.PI / 9]}>
				<cylinderGeometry args={[0.0875, 0.1125, 2.25, 16]} />
				<meshStandardMaterial color={colors.accent} metalness={0.925} roughness={0.2} />
			</mesh>
			<mesh position={[-0.25, -0.375, 0.1875]} rotation={[0, 0, -Math.PI / 9]}>
				<boxGeometry args={[0.075, 1.75, 0.0625]} />
				<meshStandardMaterial color={colors.white} metalness={0.5} roughness={0.125} />
			</mesh>
			<mesh position={[-0.8125, -1.5, 0]} rotation={[0, 0, Math.PI - Math.PI / 9]}>
				<coneGeometry args={[0.125, 0.375, 20]} />
				<meshStandardMaterial color={colors.line} metalness={0.75} roughness={0.275} />
			</mesh>

			<mesh position={[0.5, -0.375, 0]} rotation={[0, 0, Math.PI / 8]}>
				<cylinderGeometry args={[0.1, 0.125, 2.375, 16]} />
				<meshStandardMaterial color={colors.accent} metalness={0.925} roughness={0.2} />
			</mesh>
			<mesh position={[0.25, -0.375, 0.1875]} rotation={[0, 0, Math.PI / 8]}>
				<boxGeometry args={[0.075, 1.875, 0.0625]} />
				<meshStandardMaterial color={colors.white} metalness={0.5} roughness={0.125} />
			</mesh>
			<mesh position={[0.9375, -1.625, 0]} rotation={[0, 0, Math.PI + Math.PI / 8]}>
				<coneGeometry args={[0.15, 0.4375, 20]} />
				<meshStandardMaterial color={colors.accent} metalness={0.875} roughness={0.225} />
			</mesh>
			<mesh position={[0.9375, -1.875, 0]} rotation={[0, 0, Math.PI + Math.PI / 8]}>
				<coneGeometry args={[0.0875, 0.25, 16]} />
				<meshStandardMaterial color={colors.shadow} metalness={0.35} roughness={0.375} />
			</mesh>

			<mesh position={[0, -0.125, -0.125]} rotation={[0, 0, Math.PI * 1.125]}>
				<torusGeometry args={[0.9375, 0.025, 8, 48, Math.PI * 0.75]} />
				<meshStandardMaterial color={colors.accent} metalness={0.85} roughness={0.25} />
			</mesh>
			<mesh position={[-0.5, 0.125, 0.125]}>
				<sphereGeometry args={[0.0875, 16, 8]} />
				<meshStandardMaterial color={colors.base} metalness={0.65} roughness={0.175} />
			</mesh>
			<mesh position={[0.5, 0.125, 0.125]}>
				<sphereGeometry args={[0.0875, 16, 8]} />
				<meshStandardMaterial color={colors.base} metalness={0.65} roughness={0.175} />
			</mesh>
		</group>
	);
}

/** 下層セクションで使う小型コンパスローズ。 */
function CompassRoseMotif({ className = "" }: SvgClassProps) {
	return (
		<svg viewBox="0 0 80 80" className={className} aria-hidden="true">
			<circle cx="40" cy="40" r="34" className="fill-AC/10 stroke-AC/60 [stroke-width:2]" />
			<path d="M40 6L48 40L40 74L32 40Z" className="fill-AC/40 stroke-AC [stroke-linejoin:round] [stroke-width:2]" />
			<path d="M6 40L40 32L74 40L40 48Z" className="fill-WH/55 stroke-MC/50 [stroke-linejoin:round] [stroke-width:2]" />
			<circle cx="40" cy="40" r="6" className="fill-BC stroke-AC [stroke-width:2]" />
		</svg>
	);
}

/** 左上・右下で使う抽象ロゴマーク。 */
function LogoMark({ className = "" }: SvgClassProps) {
	return (
		<svg viewBox="0 0 64 64" className={className} aria-hidden="true">
			<circle cx="32" cy="32" r="29" className="fill-WH/70 stroke-MC [stroke-width:2]" />
			<path d="M14 38C23 23 39 23 50 38" className="fill-none stroke-MC [stroke-width:4]" />
			<path d="M18 43H46" className="stroke-AC [stroke-linecap:round] [stroke-width:4]" />
			<circle cx="32" cy="27" r="5" className="fill-AC" />
		</svg>
	);
}

/** 右下で使う学校名入りロゴ。 */
function InstituteSeal({ className = "" }: SvgClassProps) {
	return (
		<svg viewBox="0 0 160 120" className={className} role="img" aria-label="青空インスティチュート ロゴ">
			<path d="M36 22L12 68H32L42 48L54 68H76Z" className="fill-current" />
			<path d="M76 22V68H118L98 46L120 22Z" className="fill-current opacity-60" />
			<circle cx="130" cy="27" r="6" className="fill-AC" />
			<path d="M42 67L58 39L76 67" className="fill-none stroke-WH/80 [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:5]" />
			<text x="12" y="92" className="fill-current text-[20px] font-bold tracking-[0.125em]">
				AOZORA
			</text>
			<text x="12" y="112" className="fill-TC  text-[14px] font-bold tracking-[0.125em]">
				INSTITUTE
			</text>
		</svg>
	);
}

/** 右リスト用の5種アイコン。 */
function FeatureIcon({ kind }: FeatureIconProps) {
	const iconClasses = "h-7 w-7 fill-none stroke-TC [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]";

	if (kind === "sky") {
		return (
			<svg viewBox="0 0 24 24" className={iconClasses} aria-hidden="true">
				<path d="M4 16C6 12 10 12 12 15C14 10 21 11 21 17H4Z" />
				<path d="M7 8H7M12 6V4M17 8H17" />
			</svg>
		);
	}
	if (kind === "book") {
		return (
			<svg viewBox="0 0 24 24" className={iconClasses} aria-hidden="true">
				<path d="M5 5H11C13 5 14 6 14 8V20C13 19 12 18 10 18H5Z" />
				<path d="M14 8C14 6 15 5 17 5H19V18H17C15 18 14 19 14 20Z" />
			</svg>
		);
	}
	if (kind === "route") {
		return (
			<svg viewBox="0 0 24 24" className={iconClasses} aria-hidden="true">
				<path d="M5 18C8 12 16 12 19 6" />
				<circle cx="5" cy="18" r="2" />
				<circle cx="19" cy="6" r="2" />
			</svg>
		);
	}
	if (kind === "orbit") {
		return (
			<svg viewBox="0 0 24 24" className={iconClasses} aria-hidden="true">
				<circle cx="12" cy="12" r="3" />
				<path d="M3 12C6 5 18 5 21 12C18 19 6 19 3 12Z" />
				<path d="M12 3C19 6 19 18 12 21C5 18 5 6 12 3Z" />
			</svg>
		);
	}
	return (
		<svg viewBox="0 0 24 24" className={iconClasses} aria-hidden="true">
			<path d="M12 20V10" />
			<path d="M12 10C8 9 6 6 6 3C10 4 12 6 12 10Z" />
			<path d="M12 12C16 11 18 8 18 5C14 6 12 8 12 12Z" />
		</svg>
	);
}

export default Aozora;
