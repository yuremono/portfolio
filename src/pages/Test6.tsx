import { type CSSProperties, useEffect, useRef } from "react";
import { Cards, CardsItem } from "../components/Cards";
import { PageRoot } from "../components/PageRoot";
import { Panel, PanelItem } from "../components/Panel";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";

const asset = (name: string) => getAssetPath(`/images/common/test6/${name}`);

const heroStats = [
	{ label: "drift", value: "07" },
	{ label: "frames", value: "128" },
	{ label: "pulse", value: "A-12" },
];

const protocolPanels = [
	{
		image: asset("extract-f3410591-eye-panel.png"),
		alt: "視線を捉えるアイパネル",
		step: "phase 01",
		title: "視点を変換せよ",
		copy:
			"観測点をずらし、都市の輪郭とキャラクターの熱量を同じ画面に同居させる。ポスターの断片感はそのまま、情報は読む順序を与える。",
	},
	{
		image: asset("extract-f3410591-target-panel.png"),
		alt: "ターゲットパネル",
		step: "phase 02",
		title: "build / convert / transmit",
		copy:
			"アイデアを動きにし、感情を動力に変え、画面の奥行きへ送り出す。黄色い導線は視線、白い紙地は余白、赤いパルスは意思決定。",
	},
	{
		image: asset("extract-f3410591-starburst-panel.png"),
		alt: "星形のアクセントパネル",
		step: "phase 03",
		title: "afterimage system",
		copy:
			"サイト下層では情報密度を少し解き、ポスターでは読めなかった補助説明を追加する。密度は落とさず、解像度だけを上げる。",
	},
];

const archiveCards = [
	{
		eyebrow: "city frame",
		title: "Afterimage City",
		copy:
			"ビルの稜線、赤い太陽、黒猫のシルエット。ポスターの右半分に集約されていた都市断片を、読み物として再編集したレイヤー。",
		image: asset("extract-c62d9f49-city-icons.png"),
		alt: "都市のシルエットと赤い太陽",
	},
	{
		eyebrow: "motion core",
		title: "Parallel Motion",
		copy:
			"軌道体と人物を分離して見せることで、変換前後の状態差をインターフェースとして把握できる。静止画なのに速度を感じる領域。",
		image: asset("extract-e8c2ebcc-gyroscope.png"),
		alt: "軌道体と人物のモーションコア",
	},
	{
		eyebrow: "signal line",
		title: "Create in Parallel",
		copy:
			"最下段の波形や計器をカード化し、ポスターの端にあった小さな記号群をウェブのナビゲーションとして機能させる。",
		image: asset("extract-55d1948b-waveform.png"),
		alt: "波形と信号ライン",
	},
];

function useTest6Fonts() {
	useEffect(() => {
		const id = "test6-google-fonts";
		if (document.getElementById(id)) return;

		const preconnectGoogle = document.createElement("link");
		preconnectGoogle.rel = "preconnect";
		preconnectGoogle.href = "https://fonts.googleapis.com";

		const preconnectStatic = document.createElement("link");
		preconnectStatic.rel = "preconnect";
		preconnectStatic.href = "https://fonts.gstatic.com";
		preconnectStatic.crossOrigin = "";

		const sheet = document.createElement("link");
		sheet.id = id;
		sheet.rel = "stylesheet";
		sheet.href =
			"https://fonts.googleapis.com/css2?" +
			"family=IBM+Plex+Mono:wght@400;500;600&" +
			"family=Michroma&" +
			"family=Orbitron:wght@500;700;800;900&" +
			"family=Oxanium:wght@500;700;800&" +
			"family=Zen+Kaku+Gothic+New:wght@500;700;900&" +
			"display=swap";

		document.head.append(preconnectGoogle, preconnectStatic, sheet);

		return () => {
			sheet.remove();
			preconnectGoogle.remove();
			preconnectStatic.remove();
		};
	}, []);
}

function CrosshairMark({
	className = "",
	color,
}: {
	className?: string;
	color: string;
}) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 64 64"
			className={` ${className ?? ""}`}
			fill="none"
			style={{ color }}
		>
			<circle
				cx="32"
				cy="32"
				r="13"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<circle cx="32" cy="32" r="4.5" fill="currentColor" />
			<path
				d="M32 6v12M32 46v12M6 32h12M46 32h12"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

function OrbitalMark({
	className = "",
	color,
}: {
	className?: string;
	color: string;
}) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 120 120"
			className={` ${className ?? ""}`}
			fill="none"
			style={{ color }}
		>
			<circle
				cx="60"
				cy="60"
				r="18"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<ellipse
				cx="60"
				cy="60"
				rx="42"
				ry="14"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<ellipse
				cx="60"
				cy="60"
				rx="42"
				ry="14"
				stroke="currentColor"
				strokeWidth="2"
				transform="rotate(60 60 60)"
			/>
			<ellipse
				cx="60"
				cy="60"
				rx="42"
				ry="14"
				stroke="currentColor"
				strokeWidth="2"
				transform="rotate(-60 60 60)"
			/>
		</svg>
	);
}

function MetricChip({
	label,
	value,
	lineColor,
	font,
}: {
	label: string;
	value: string;
	lineColor: string;
	font: CSSProperties;
}) {
	return (
		<div
			className="grid min-w-[5.5rem] gap-2 rounded-[1.4rem] border px-4 py-3 text-center"
			style={{
				borderColor: "color-mix(in srgb, var(--WH) 14%, transparent)",
				background: "color-mix(in srgb, var(--BK) 86%, var(--WH) 14%)",
				boxShadow: `0 0 0 1px ${lineColor} inset`,
			}}
		>
			<span className="text-[0.65rem] uppercase tracking-[0.34em]" style={font}>
				{label}
			</span>
			<strong
				className="text-[1.55rem] leading-none"
				style={{ ...font, color: lineColor }}
			>
				{value}
			</strong>
		</div>
	);
}

function Test6() {
	const pageRootRef = useRef<HTMLDivElement>(null);

	useTest6Fonts();
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	const displayFont: CSSProperties = {
		fontFamily: '"Orbitron", "Oxanium", var(--Eng), sans-serif',
	};
	const labelFont: CSSProperties = {
		fontFamily: '"Michroma", var(--Eng), sans-serif',
	};
	const monoFont: CSSProperties = {
		fontFamily: '"IBM Plex Mono", var(--Eng), monospace',
	};
	const jpFont: CSSProperties = {
		fontFamily: '"Zen Kaku Gothic New", var(--FF), sans-serif',
	};

	const paper = "color-mix(in srgb, var(--BC) 92%, var(--WH) 8%)";
	const line = "color-mix(in srgb, var(--WH) 16%, transparent)";
	const lineStrong = "color-mix(in srgb, var(--WH) 28%, transparent)";
	const signalYellow = "oklch(from var(--AC) calc(l + 0.03) calc(c * 1.2) h)";
	const signalRed = "oklch(from var(--AC) 0.68 calc(c * 1.65) calc(h - 42))";
	const signalCyan = "oklch(from var(--third) 0.72 calc(c * 1.45) calc(h + 34))";

	return (
		<PageRoot
			ref={pageRootRef}
			className="min-h-screen overflow-x-hidden bg-[--BK] text-[--WH]"
		>
			<main
				className="bg-[--BK] text-[--WH] [--wid:100%]"
				style={{
					backgroundImage:
						"radial-gradient(circle at 50% -10%, color-mix(in srgb, var(--AC) 14%, transparent) 0%, transparent 36%), radial-gradient(circle at 110% 20%, color-mix(in srgb, var(--third) 12%, transparent) 0%, transparent 24%)",
				}}
			>
				<section
					className="relative isolate overflow-hidden border-b"
					style={{ borderColor: line }}
				>
					<div className="pointer-events-none absolute inset-0">
						<div
							className="absolute left-[-12vw] top-[-18vw] h-[56vw] w-[56vw] rounded-full border"
							style={{ borderColor: signalYellow, opacity: 0.75 }}
						/>
						<div
							className="absolute left-[16vw] top-[-9vw] h-[38vw] w-[38vw] rounded-full border"
							style={{ borderColor: signalYellow, opacity: 0.35 }}
						/>
						<div
							className="absolute right-[-20vw] top-[-16vw] h-[40vw] w-[72vw] rotate-[14deg]"
							style={{
								background:
									"radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--WH) 18%, transparent) 0, color-mix(in srgb, var(--WH) 18%, transparent) 9%, transparent 10%)",
								maskImage:
									"linear-gradient(90deg, transparent 0%, black 24%, black 82%, transparent 100%)",
								opacity: 0.65,
							}}
						/>
						<div
							className="absolute inset-x-0 bottom-0 h-[14rem]"
							style={{
								background:
									"linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--BK) 18%, black) 100%)",
							}}
						/>
					</div>

					<div className="relative mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-[clamp(1rem,2.4vw,2rem)] pb-[clamp(1.2rem,2vw,1.8rem)] pt-[clamp(1rem,2vw,1.4rem)]">
						<div
							className="flex items-start justify-between gap-6 border-b pb-4"
							style={{ borderColor: line }}
						>
							<div className="flex items-start gap-4">
								<img
									src={asset("extract-03febaf7-globe.png")}
									alt=""
									aria-hidden="true"
									className="w-[clamp(5rem,10vw,8.5rem)] object-contain"
								/>
								<div className="space-y-2 pt-1">
									<p
										className="text-[0.7rem] uppercase tracking-[0.38em]"
										style={{ ...labelFont, color: signalYellow }}
									>
										signal archive
									</p>
									<p
										className="max-w-[11rem] text-[clamp(1.15rem,1.8vw,2rem)] leading-[1.15]"
										style={{ ...jpFont, color: paper, fontWeight: 700 }}
									>
										studio
										<br />
										for animated
										<br />
										motion & design
									</p>
								</div>
							</div>

							<div className="hidden items-start gap-6 lg:flex">
								<nav
									aria-label="Test6 section navigation"
									className="flex items-center gap-5 pt-2 text-[0.72rem] uppercase tracking-[0.34em]"
									style={monoFont}
								>
									<a href="#protocol" className="transition-opacity hover:opacity-70">
										protocol
									</a>
									<a href="#archive" className="transition-opacity hover:opacity-70">
										archive
									</a>
									<a href="#parallel" className="transition-opacity hover:opacity-70">
										parallel
									</a>
								</nav>
								<div
									className="text-right text-[0.72rem] uppercase tracking-[0.34em]"
									style={monoFont}
								>
									<p style={{ color: signalYellow }}>convert your perspective</p>
									<p className="mt-2" style={{ color: paper }}>
										all systems drifting
									</p>
								</div>
							</div>
						</div>

						<div className="relative flex-1">
							<div className="grid min-h-[calc(100vh-9rem)] grid-cols-1 gap-8 pt-[clamp(1.5rem,3.6vw,3rem)] xl:grid-cols-[0.18fr_0.52fr_0.3fr]">
								<div className="relative hidden xl:block">
									<div
										className="absolute left-0 top-0 text-[clamp(2.8rem,5vw,5rem)] leading-[0.86]"
										style={{
											...jpFont,
											color: paper,
											fontWeight: 900,
											writingMode: "vertical-rl",
											textOrientation: "upright",
										}}
									>
										変換する
										<span style={{ color: signalRed, marginInline: "0.1em" }}>
											×
										</span>
										創造はする
									</div>

									<div className="absolute bottom-[14rem] left-0 max-w-[15rem] space-y-5">
										<div className="flex items-center gap-4">
											<CrosshairMark
												className="h-10 w-10"
												color={signalRed}
											/>
											<div
												className="h-px flex-1"
												style={{ backgroundColor: lineStrong }}
											/>
										</div>
										<div
											className="space-y-3 text-[0.92rem] leading-[1.9]"
											style={{ ...jpFont, color: paper }}
										>
											<p>
												わたしたちは、アニメーションを変換装置にする。
												アイデアを形にし、感情を動きに変え、世界を少しずつアップデートしていく。
											</p>
											<p
												className="text-[0.8rem] uppercase tracking-[0.2em]"
												style={{ ...monoFont, color: "color-mix(in srgb, var(--WH) 74%, transparent)" }}
											>
												we convert ideas into motion.
												<br />
												we animate emotion.
												<br />
												we update the world.
											</p>
										</div>
									</div>
								</div>

								<div className="relative min-h-[32rem]">
									<div className="pointer-events-none absolute inset-0">
										<img
											src={asset("edit-f180f819-anime-inpaint-black-to-alpha.png")}
											alt=""
											aria-hidden="true"
											className="absolute left-[2%] top-[13%] w-[78%] max-w-[58rem] object-contain"
										/>
										<img
											src={asset("extract-a149f223-eye.png")}
											alt=""
											aria-hidden="true"
											className="absolute right-[10%] top-0 w-[34%] min-w-[12rem] object-contain"
										/>
										<img
											src={asset("extract-4293af18-planet.png")}
											alt=""
											aria-hidden="true"
											className="absolute right-[15%] top-[8%] w-[14%] min-w-[6rem] object-contain"
										/>
										<img
											src={asset("extract-44f271c5-signal-drift.png")}
											alt=""
											aria-hidden="true"
											className="absolute left-[14%] top-[18%] w-[20%] min-w-[7rem] -rotate-[8deg] object-contain"
										/>
										<img
											src={asset("extract-66ffd911-crosshair.png")}
											alt=""
											aria-hidden="true"
											className="absolute left-[6%] top-[50%] w-[8%] min-w-[3.25rem] object-contain"
										/>
										<div
											className="absolute left-[12%] top-[7%] h-[68%] w-[68%] rounded-full border"
											style={{ borderColor: signalYellow, opacity: 0.24 }}
										/>
										<div
											className="absolute left-[18%] top-[15%] h-[50%] w-[50%] rounded-full border"
											style={{ borderColor: signalCyan, opacity: 0.42 }}
										/>
										<div
											className="absolute left-[3%] top-[26%] h-[1px] w-[62%]"
											style={{ backgroundColor: lineStrong }}
										/>
										<div
											className="absolute left-[35%] top-[2%] h-[60%] w-px"
											style={{ backgroundColor: line }}
										/>
										<div
											className="absolute right-[21%] top-[13%] h-[1px] w-[26%]"
											style={{ backgroundColor: lineStrong }}
										/>
									</div>

									<div className="relative z-10 flex h-full items-end">
										<div className="w-full">
											<div className="mb-10 flex flex-wrap items-start justify-between gap-6 xl:hidden">
												<div className="max-w-[22rem] space-y-3">
													<p
														className="text-[0.7rem] uppercase tracking-[0.38em]"
														style={{ ...labelFont, color: signalYellow }}
													>
														conversion inc.
													</p>
													<h1
														className="text-[clamp(2rem,8vw,3.8rem)] leading-[0.95]"
														style={{ ...jpFont, color: paper, fontWeight: 900 }}
													>
														視点をずらし、
														<br />
														情報を再配置する。
													</h1>
												</div>
												<div className="flex flex-wrap gap-3">
													{heroStats.map((item) => (
														<MetricChip
															key={item.label}
															label={item.label}
															value={item.value}
															lineColor={item.label === "pulse" ? signalRed : signalYellow}
															font={monoFont}
														/>
													))}
												</div>
											</div>

											<div className="pointer-events-none relative mx-auto w-[94%] xl:w-full">
												<div className="hidden xl:flex xl:justify-end">
													<div className="flex gap-3">
														{heroStats.map((item) => (
															<MetricChip
																key={item.label}
																label={item.label}
																value={item.value}
																lineColor={item.label === "pulse" ? signalRed : signalYellow}
																font={monoFont}
															/>
														))}
													</div>
												</div>

												<div className="mt-[17rem] sm:mt-[21rem] xl:mt-[26rem]">
													<p
														className="mb-3 text-center text-[0.82rem] uppercase tracking-[0.42em] sm:text-left"
														style={{ ...monoFont, color: signalYellow }}
													>
														株式会社コンバージョン
													</p>
													<div className="flex items-end justify-between gap-3">
														<h2
															className="max-w-full text-[clamp(2.5rem,11.8vw,4.9rem)] uppercase leading-[0.82] tracking-[-0.09em] md:text-[clamp(3.6rem,15vw,12rem)]"
															style={{
																...displayFont,
																color: paper,
																fontWeight: 800,
																transform: "skewX(-16deg)",
																textShadow:
																	"0 0 0.5px color-mix(in srgb, var(--BK) 80%, transparent)",
															}}
														>
															conversion
														</h2>
														<span
															className="mb-[0.35rem] text-[clamp(1rem,2.5vw,1.8rem)] uppercase md:mb-[0.55rem] md:text-[clamp(1.4rem,3.2vw,3.2rem)]"
															style={{
																...displayFont,
																color: paper,
																fontWeight: 700,
																transform: "skewX(-14deg)",
															}}
														>
															inc.
														</span>
													</div>
												</div>
											</div>

											<div className="mt-8 flex items-start justify-between gap-4 border-t pt-4" style={{ borderColor: line }}>
												<div className="flex min-w-0 flex-1 items-center gap-5">
													<img
														src={asset("extract-55d1948b-waveform.png")}
														alt=""
														aria-hidden="true"
														className="w-[min(30rem,42vw)] min-w-[8rem] object-contain opacity-90"
													/>
													<div
														className="hidden h-px flex-1 sm:block"
														style={{ backgroundColor: lineStrong }}
													/>
												</div>
												<p
													className="max-w-[19rem] flex-1 pr-3 text-right text-[0.8rem] uppercase tracking-[0.22em] sm:max-w-[24rem] sm:text-[0.88rem] lg:max-w-[28rem] lg:pr-6"
													style={{ ...labelFont, color: signalYellow }}
												>
													create in parallel.
													<br />
													<span style={{ color: paper }}> move in unison.</span>
												</p>
											</div>
										</div>
									</div>
								</div>

								<div className="relative min-h-[24rem]">
									<div className="absolute right-0 top-0 flex flex-col items-end gap-5">
										<p
											className="text-right text-[clamp(1.3rem,2.1vw,2.3rem)] font-black leading-[0.95]"
											style={{
												...jpFont,
												color: paper,
												writingMode: "vertical-rl",
												textOrientation: "upright",
											}}
										>
											アフターイメージ・シティ
										</p>
										<p
											className="text-[0.72rem] uppercase tracking-[0.42em]"
											style={{
												...monoFont,
												color: signalYellow,
												writingMode: "vertical-rl",
											}}
										>
											afterimage city
										</p>
									</div>

									<div className="absolute inset-x-0 bottom-[9.5rem] top-[5.5rem]">
										<img
											src={asset("edit-c78d60f3-city-black-to-alpha.png")}
											alt=""
											aria-hidden="true"
											className="absolute bottom-0 right-[2%] h-full w-auto max-w-none object-contain"
										/>
									</div>

									<img
										src={asset("extract-de3d8e0a-orange-emblem.png")}
										alt=""
										aria-hidden="true"
										className="absolute right-[13%] top-[3%] w-[22%] min-w-[6rem] object-contain"
									/>

									<div className="absolute bottom-[9.7rem] right-[1.5rem] flex flex-col gap-3">
										<CrosshairMark className="h-14 w-14" color={signalCyan} />
										<OrbitalMark className="h-14 w-14" color={signalYellow} />
									</div>

									<img
										src={asset("extract-c62d9f49-city-icons.png")}
										alt=""
										aria-hidden="true"
										className="absolute bottom-[7rem] right-0 w-[22%] min-w-[4.5rem] object-contain"
									/>

									<div className="absolute bottom-[1rem] left-0 right-0 flex items-end justify-between gap-4 border-t pt-4" style={{ borderColor: line }}>
										<div className="max-w-[14rem]">
											<p
												className="text-[0.72rem] uppercase tracking-[0.34em]"
												style={{ ...monoFont, color: signalYellow }}
											>
												afterimage city
											</p>
											<p
												className="mt-3 text-[0.98rem] leading-[1.8]"
												style={{ ...jpFont, color: paper }}
											>
												都市の切片、視線の残響、ビルボードの熱。
											</p>
											<p
												className="mt-4 text-[0.8rem] leading-[1.7]"
												style={{ ...monoFont, color: "color-mix(in srgb, var(--WH) 72%, transparent)" }}
											>
												35.6895°N
												<br />
												139.6917°E
											</p>
										</div>
										<div className="hidden sm:block">
											<p
												className="text-right text-[0.75rem] uppercase tracking-[0.34em]"
												style={{ ...monoFont, color: paper }}
											>
												001_001_001
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section
					id="protocol"
					className="relative overflow-hidden px-[clamp(1rem,2.6vw,2.25rem)] py-[clamp(4rem,8vw,7rem)]"
				>
					<div
						className="absolute left-[-6rem] top-[4rem] h-[18rem] w-[18rem] rounded-full"
						style={{
							background:
								"radial-gradient(circle, color-mix(in srgb, var(--AC) 22%, transparent) 0%, transparent 68%)",
						}}
					/>
					<div className="relative mx-auto grid w-full max-w-[1640px] gap-10 xl:grid-cols-[0.44fr_0.56fr]">
						<div className="relative">
							<div className="max-w-[34rem]">
								<p
									className="text-[0.78rem] uppercase tracking-[0.42em]"
									style={{ ...labelFont, color: signalYellow }}
								>
									protocol
								</p>
								<h2
									className="mt-5 text-[clamp(2.4rem,5vw,5rem)] uppercase leading-[0.9]"
									style={{ ...displayFont, color: paper, fontWeight: 800 }}
								>
									build
									<br />
									convert
									<br />
									transmit
								</h2>
								<p
									className="mt-8 max-w-[28rem] text-[1rem] leading-[2]"
									style={{ ...jpFont, color: paper }}
								>
									ポスターの要素をそのまま敷き詰めるのではなく、ウェブでは読む順序を設計する。ヒーローで熱量を見せ、ここでは変換装置としての役割を言葉と断片で説明する。
								</p>
							</div>

							<div
								className="mt-10 grid max-w-[33rem] gap-4 rounded-[2rem] border p-6"
								style={{
									borderColor: line,
									background: "color-mix(in srgb, var(--BK) 88%, var(--WH) 12%)",
								}}
							>
								<div className="flex items-center justify-between gap-4">
									<p
										className="text-[0.72rem] uppercase tracking-[0.34em]"
										style={{ ...monoFont, color: signalYellow }}
									>
										system note
									</p>
									<CrosshairMark className="h-9 w-9" color={signalRed} />
								</div>
								<ul className="grid gap-3">
									<li
										className="flex items-start justify-between gap-4 border-b pb-3 text-[0.95rem]"
										style={{ borderColor: line, color: paper }}
									>
										<span style={jpFont}>背景は紙の質感を残し、装飾だけを追加。</span>
										<span style={{ ...monoFont, color: signalYellow }}>01</span>
									</li>
									<li
										className="flex items-start justify-between gap-4 border-b pb-3 text-[0.95rem]"
										style={{ borderColor: line, color: paper }}
									>
										<span style={jpFont}>大きなロゴは DOM テキストで再構成。</span>
										<span style={{ ...monoFont, color: signalYellow }}>02</span>
									</li>
									<li
										className="flex items-start justify-between gap-4 text-[0.95rem]"
										style={{ color: paper }}
									>
										<span style={jpFont}>都市、視線、軌道をセクションごとに再配置。</span>
										<span style={{ ...monoFont, color: signalYellow }}>03</span>
									</li>
								</ul>
							</div>

							<div className="mt-10 flex flex-wrap items-end gap-6">
								<img
									src={asset("extract-7aafcdcf-main.png")}
									alt=""
									aria-hidden="true"
									className="w-[6rem] rotate-[-6deg] object-contain"
								/>
								<div className="flex min-w-[12rem] flex-1 items-center gap-4">
									<img
										src={asset("extract-c62d9f49-city-icons.png")}
										alt=""
										aria-hidden="true"
										className="w-[5rem] object-contain"
									/>
									<p
										className="text-[0.82rem] uppercase tracking-[0.28em]"
										style={{ ...monoFont, color: "color-mix(in srgb, var(--WH) 74%, transparent)" }}
									>
										All systems drifting.
										<br />
										すべてのシステムが漂流しています。
									</p>
								</div>
							</div>
						</div>

						<div className="relative">
							<Panel
								className="img30 IsFlow"
								style={{
									"--bg": "color-mix(in srgb, var(--BK) 90%, var(--WH) 10%)",
									"--MY": "clamp(1.2rem, 2vw, 1.8rem)",
								} as CSSProperties}
							>
								{protocolPanels.map((panel, index) => (
									<PanelItem
										key={panel.step}
										className={index === 1 ? "border" : "border"}
									>
										<figure className="overflow-hidden rounded-[1.3rem] border" style={{ borderColor: line }}>
											<img src={panel.image} alt={panel.alt} loading="lazy" />
										</figure>
										<div className="flex flex-col justify-between gap-5">
											<div className="space-y-3">
												<p
													className="text-[0.72rem] uppercase tracking-[0.34em]"
													style={{ ...monoFont, color: signalYellow }}
												>
													{panel.step}
												</p>
												<h3
													className="text-[clamp(1.35rem,2.2vw,2.2rem)] uppercase leading-[1.02]"
													style={{ ...displayFont, color: paper, fontWeight: 700 }}
												>
													{panel.title}
												</h3>
												<p
													className="text-[0.98rem] leading-[1.95]"
													style={{ ...jpFont, color: paper }}
												>
													{panel.copy}
												</p>
											</div>
											<div
												className="flex items-center justify-between border-t pt-4"
												style={{ borderColor: line }}
											>
												<span
													className="text-[0.72rem] uppercase tracking-[0.34em]"
													style={{ ...monoFont, color: signalYellow }}
												>
													conversion protocol
												</span>
												<OrbitalMark
													className="h-10 w-10"
													color={index === 2 ? signalRed : signalCyan}
												/>
											</div>
										</div>
									</PanelItem>
								))}
							</Panel>
						</div>
					</div>
				</section>

				<section
					id="archive"
					className="relative overflow-hidden border-y px-[clamp(1rem,2.6vw,2.25rem)] py-[clamp(4rem,8vw,7rem)]"
					style={{ borderColor: line }}
				>
					<div className="relative mx-auto w-full max-w-[1640px]">
						<div className="mb-10 flex flex-wrap items-end justify-between gap-6">
							<div className="max-w-[34rem]">
								<p
									className="text-[0.78rem] uppercase tracking-[0.42em]"
									style={{ ...labelFont, color: signalYellow }}
								>
									archive layers
								</p>
								<h2
									className="mt-4 text-[clamp(2rem,4.4vw,4.4rem)] uppercase leading-[0.92]"
									style={{ ...displayFont, color: paper, fontWeight: 800 }}
								>
									poster fragments,
									<br />
									website tempo
								</h2>
							</div>
							<p
								className="max-w-[26rem] text-[0.96rem] leading-[1.9]"
								style={{ ...jpFont, color: paper }}
							>
								下層はテンプレート然とした3段構成にせず、ポスターの断片をカードとして切り出し、都市とUI記号のリズムをそのままグリッドに変換する。
							</p>
						</div>

						<Cards
							className="col3"
							style={
								{
									"--gap": "clamp(1.2rem, 1.8vw, 1.8rem)",
								} as CSSProperties
							}
						>
							{archiveCards.map((card, index) => (
								<CardsItem key={card.title}>
									<article
										className="relative flex h-full min-h-[26rem] flex-col overflow-hidden rounded-[2rem] border p-6"
										style={{
											borderColor: line,
											background:
												index === 1
													? "color-mix(in srgb, var(--BK) 84%, var(--WH) 16%)"
													: "color-mix(in srgb, var(--BK) 90%, var(--WH) 10%)",
										}}
									>
										<div className="flex items-start justify-between gap-4">
											<p
												className="text-[0.72rem] uppercase tracking-[0.34em]"
												style={{ ...monoFont, color: signalYellow }}
											>
												{card.eyebrow}
											</p>
											{index === 0 ? (
												<CrosshairMark className="h-10 w-10" color={signalRed} />
											) : (
												<OrbitalMark
													className="h-10 w-10"
													color={index === 1 ? signalCyan : signalYellow}
												/>
											)}
										</div>

										<div
											className="mt-6 flex h-[12rem] items-center justify-center overflow-hidden rounded-[1.5rem] border"
											style={{
												borderColor: line,
												background:
													index === 2
														? "linear-gradient(180deg, color-mix(in srgb, var(--BK) 60%, transparent), color-mix(in srgb, var(--BK) 92%, var(--WH) 8%))"
														: "linear-gradient(180deg, color-mix(in srgb, var(--WH) 6%, transparent), transparent)",
											}}
										>
											<img
												src={card.image}
												alt={card.alt}
												loading="eager"
												className={index === 2 ? "w-[115%] object-contain" : "max-h-full w-auto object-contain"}
											/>
										</div>

										<div className="mt-6 flex flex-1 flex-col">
											<h3
												className="text-[clamp(1.5rem,2.3vw,2.3rem)] uppercase leading-[0.98]"
												style={{ ...displayFont, color: paper, fontWeight: 700 }}
											>
												{card.title}
											</h3>
											<p
												className="mt-4 flex-1 text-[0.96rem] leading-[1.95]"
												style={{ ...jpFont, color: paper }}
											>
												{card.copy}
											</p>
											<div
												className="mt-6 flex items-center justify-between border-t pt-4"
												style={{ borderColor: line }}
											>
												<span
													className="text-[0.72rem] uppercase tracking-[0.34em]"
													style={{ ...monoFont, color: signalYellow }}
												>
													layer {index + 1}
												</span>
												<span
													className="text-[0.72rem] uppercase tracking-[0.34em]"
													style={{ ...monoFont, color: "color-mix(in srgb, var(--WH) 70%, transparent)" }}
												>
													read more
												</span>
											</div>
										</div>
									</article>
								</CardsItem>
							))}
						</Cards>
					</div>
				</section>

				<section
					id="parallel"
					className="relative overflow-hidden px-[clamp(1rem,2.6vw,2.25rem)] py-[clamp(4rem,8vw,7rem)]"
				>
					<div
						className="absolute inset-0"
						style={{
							background:
								"radial-gradient(circle at 78% 28%, color-mix(in srgb, var(--third) 14%, transparent) 0%, transparent 24%), radial-gradient(circle at 16% 82%, color-mix(in srgb, var(--AC) 14%, transparent) 0%, transparent 28%)",
						}}
					/>
					<div className="relative mx-auto grid w-full max-w-[1640px] gap-10 lg:grid-cols-[0.58fr_0.42fr]">
						<div className="relative overflow-hidden rounded-[2.25rem] border p-[clamp(1.5rem,3vw,2.5rem)]" style={{ borderColor: lineStrong }}>
							<div className="flex items-center justify-between gap-4">
								<p
									className="text-[0.78rem] uppercase tracking-[0.42em]"
									style={{ ...labelFont, color: signalYellow }}
								>
									parallel
								</p>
								<img
									src={asset("extract-03febaf7-globe.png")}
									alt=""
									aria-hidden="true"
									className="w-[5rem] object-contain opacity-90"
								/>
							</div>
							<h2
								className="mt-8 max-w-[12ch] text-[clamp(2.3rem,5.2vw,5.8rem)] uppercase leading-[0.9]"
								style={{ ...displayFont, color: paper, fontWeight: 800 }}
							>
								create
								<br />
								in parallel.
							</h2>
							<p
								className="mt-8 max-w-[34rem] text-[1rem] leading-[2]"
								style={{ ...jpFont, color: paper }}
							>
								メインビジュアルに全情報を詰め込まず、ページ全体でポスターの熱量を保持する。ヒーローで掴み、プロトコルで理解させ、最後にもう一度速度と軌道を見せて締める。
							</p>
							<div className="mt-10 flex flex-wrap items-center gap-4">
								<a
									href="#protocol"
									className="rounded-full border px-5 py-3 text-[0.75rem] uppercase tracking-[0.34em] transition-transform hover:-translate-y-0.5"
									style={{
										...monoFont,
										borderColor: signalYellow,
										color: signalYellow,
									}}
								>
									open protocol
								</a>
								<a
									href="#archive"
									className="rounded-full border px-5 py-3 text-[0.75rem] uppercase tracking-[0.34em] transition-transform hover:-translate-y-0.5"
									style={{
										...monoFont,
										borderColor: lineStrong,
										color: paper,
									}}
								>
									read archive
								</a>
							</div>
							<div
								className="mt-10 border-t pt-5 text-[0.76rem] uppercase tracking-[0.3em]"
								style={{ ...monoFont, borderColor: line, color: "color-mix(in srgb, var(--WH) 74%, transparent)" }}
							>
								move in unison / transmit the signal / keep the drift visible
							</div>
						</div>

						<div className="grid gap-6">
							<div
								className="relative overflow-hidden rounded-[2.25rem] border p-6"
								style={{
									borderColor: line,
									background: "color-mix(in srgb, var(--BK) 88%, var(--WH) 12%)",
								}}
							>
								<div className="flex items-center justify-between gap-4">
									<p
										className="text-[0.72rem] uppercase tracking-[0.34em]"
										style={{ ...monoFont, color: signalYellow }}
									>
										motion core
									</p>
									<CrosshairMark className="h-10 w-10" color={signalRed} />
								</div>
								<div className="mt-5 flex items-center justify-center overflow-hidden rounded-[1.75rem] border p-6" style={{ borderColor: line }}>
									<img
										src={asset("extract-e8c2ebcc-gyroscope.png")}
										alt="軌道をまとった人物ビジュアル"
										loading="eager"
										className="w-[17rem] max-w-full object-contain"
									/>
								</div>
								<p
									className="mt-5 text-[0.96rem] leading-[1.95]"
									style={{ ...jpFont, color: paper }}
								>
									視点変換のコア。ヒーローでは黒と紙のコントラストに埋め込まれていた要素を、ここでは青白い軌道体として独立させる。
								</p>
							</div>

							<div
								className="rounded-[2.25rem] border p-6"
								style={{
									borderColor: line,
									background:
										"linear-gradient(135deg, color-mix(in srgb, var(--BK) 84%, var(--WH) 16%), color-mix(in srgb, var(--BK) 92%, var(--WH) 8%))",
								}}
							>
								<div className="flex items-start justify-between gap-4">
									<div>
										<p
											className="text-[0.72rem] uppercase tracking-[0.34em]"
											style={{ ...monoFont, color: signalYellow }}
										>
											final coordinates
										</p>
										<p
											className="mt-4 text-[clamp(1.4rem,2vw,2rem)] uppercase leading-[1.05]"
											style={{ ...displayFont, color: paper, fontWeight: 700 }}
										>
											afterimage
											<br />
											city
										</p>
									</div>
									<OrbitalMark className="h-12 w-12" color={signalCyan} />
								</div>
								<div
									className="mt-6 grid gap-3 border-t pt-5"
									style={{ borderColor: line }}
								>
									<div className="flex items-center justify-between gap-4">
										<span
											className="text-[0.74rem] uppercase tracking-[0.3em]"
											style={{ ...monoFont, color: "color-mix(in srgb, var(--WH) 64%, transparent)" }}
										>
											sector
										</span>
										<span
											className="text-[0.9rem]"
											style={{ ...jpFont, color: paper }}
										>
											渋谷 / 軌道 / 残像
										</span>
									</div>
									<div className="flex items-center justify-between gap-4">
										<span
											className="text-[0.74rem] uppercase tracking-[0.3em]"
											style={{ ...monoFont, color: "color-mix(in srgb, var(--WH) 64%, transparent)" }}
										>
											signal
										</span>
										<span
											className="text-[0.9rem]"
											style={{ ...jpFont, color: paper }}
										>
											build / convert / transmit
										</span>
									</div>
									<div className="flex items-center justify-between gap-4">
										<span
											className="text-[0.74rem] uppercase tracking-[0.3em]"
											style={{ ...monoFont, color: "color-mix(in srgb, var(--WH) 64%, transparent)" }}
										>
											status
										</span>
										<span
											className="text-[0.9rem]"
											style={{ ...jpFont, color: paper }}
										>
											All systems drifting
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</PageRoot>
	);
}

export default Test6;
