import { CnvSignCanvas } from "../components/conversion/CnvSignCanvas";

type SectionKey =
	| "night-transfer"
	| "afterimage"
	| "city-loop"
	| "soft-noise"
	| "drift-system";

interface SectionItem {
	id: SectionKey;
	title: string;
	subtitle: string;
	description: string;
	accent: string;
}

const sections: SectionItem[] = [
	{
		id: "night-transfer",
		title: "night transfer",
		subtitle: "arrival layer / transit",
		description:
			"夜の移動と到着をつなぐ導線。奥行きは残しつつ、背景はあとから画像へ差し替えやすい抽象レイヤーで仮組みしている。",
		accent: "01",
	},
	{
		id: "afterimage",
		title: "afterimage",
		subtitle: "trace / residual glow",
		description:
			"見出しや余白に残像を持たせるためのプレースホルダー。フェードインや差し替えを後から足しても破綻しない構造にしてある。",
		accent: "02",
	},
	{
		id: "city-loop",
		title: "city loop",
		subtitle: "circulation / repeat",
		description:
			"都市の反復感を示すループ区画。ナビのアンカーと同じ順番で流れるので、単一ページ内の移動がそのまま章立てになる。",
		accent: "03",
	},
	{
		id: "soft-noise",
		title: "soft noise",
		subtitle: "texture / diffusion",
		description:
			"参照画像の代わりにグラデーションと粒子感のある面で仮置きするセクション。背景アセットへ置換しやすいよう、装飾は分離してある。",
		accent: "04",
	},
	{
		id: "drift-system",
		title: "drift system",
		subtitle: "end state / drift",
		description:
			"最後の区画は余韻を残すための着地点。右下の CTA プレースホルダーと呼応するよう、次の操作へ移る余白を確保している。",
		accent: "05",
	},
];

interface SectionBlockProps {
	item: SectionItem;
}

function SectionBlock({ item }: SectionBlockProps) {
	return (
		<section
			id={item.id}
			aria-labelledby={`${item.id}-title`}
			className="group relative isolate scroll-mt-24 rounded-[2rem] border border-[color:var(--TC)]/10 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--WH)_80%,transparent)_0%,color-mix(in_oklch,var(--BC)_82%,transparent)_100%)] p-[--section-pad] shadow-[0_24px_80px_-48px_color-mix(in_oklch,var(--BK)_55%,transparent)]"
		>
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10 overflow-hidden rounded-[2rem]"
			>
				<div className="absolute left-[-10%] top-[-20%] h-48 w-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--MC)_24%,transparent)_0%,transparent_70%)] blur-3xl" />
				<div className="absolute right-[-8%] bottom-[-18%] h-56 w-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--SC)_18%,transparent)_0%,transparent_72%)] blur-3xl" />
			</div>

			<div className="flex flex-wrap items-baseline justify-between gap-4">
				<p className="text-xs uppercase tracking-[0.38em] text-[--GR]">
					{item.accent}
				</p>
				<p className="text-xs uppercase tracking-[0.32em] text-[--GR]">
					{item.subtitle}
				</p>
			</div>
			<h2
				id={`${item.id}-title`}
				className="mt-5 text-[clamp(2rem,5vw,4.75rem)] font-semibold uppercase leading-[0.92] tracking-[-0.06em] text-[--TC] md:max-w-[12ch]"
			>
				{item.title}
			</h2>
			<p className="mt-5 max-w-2xl text-sm leading-7 text-[--TC] sm:text-base">
				{item.description}
			</p>

			<div className="mt-8 grid gap-3 sm:grid-cols-3">
				<div className="min-h-28 rounded-[1.25rem] border border-[color:var(--TC)]/10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--MC)_18%,transparent)_0%,transparent_68%)] p-4">
					<p className="text-[0.7rem] uppercase tracking-[0.35em] text-[--GR]">
						layer
					</p>
					<p className="mt-4 text-sm leading-6 text-[--TC]">
						後で画像や動画に置換するための余白。
					</p>
				</div>
				<div className="min-h-28 rounded-[1.25rem] border border-[color:var(--TC)]/10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--SC)_16%,transparent)_0%,transparent_68%)] p-4">
					<p className="text-[0.7rem] uppercase tracking-[0.35em] text-[--GR]">
						state
					</p>
					<p className="mt-4 text-sm leading-6 text-[--TC]">
						セクション単位で独立して差し替えできる。
					</p>
				</div>
				<div className="min-h-28 rounded-[1.25rem] border border-[color:var(--TC)]/10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--AC)_14%,transparent)_0%,transparent_68%)] p-4">
					<p className="text-[0.7rem] uppercase tracking-[0.35em] text-[--GR]">
						anchor
					</p>
					<p className="mt-4 text-sm leading-6 text-[--TC]">
						左ナビと同じ語をそのまま章名に使っている。
					</p>
				</div>
			</div>
		</section>
	);
}

interface NavItemProps {
	id: SectionKey;
	label: string;
	index: string;
}

function NavItem({ id, label, index }: NavItemProps) {
	return (
		<li>
			<a
				href={`#${id}`}
				className="group flex items-center justify-between gap-4 rounded-full border border-[color:var(--TC)]/10 px-4 py-3 text-sm uppercase tracking-[0.24em] text-[--TC] transition-colors hover:border-[color:var(--TC)]/25 hover:bg-[color-mix(in_oklch,var(--WH)_65%,transparent)]"
			>
				<span>{label}</span>
				<span className="text-[0.7rem] tracking-[0.42em] text-[--GR] transition-transform group-hover:translate-x-1">
					{index}
				</span>
			</a>
		</li>
	);
}

function ConversionInc() {
	return (
		<main
			className="relative min-h-screen overflow-x-clip bg-[linear-gradient(180deg,var(--BC)_0%,color-mix(in_oklch,var(--BC)_88%,var(--MC))_54%,color-mix(in_oklch,var(--BC)_82%,var(--SC))_100%)] text-[--TC] [--MC:oklch(0.86_0.09_176)] [--SC:oklch(0.89_0.12_355)] [--AC:oklch(0.87_0.07_290)] [--BC:oklch(0.985_0.01_95)] [--TC:oklch(0.29_0.1_267)] [--GR:oklch(0.6_0.03_258)] [--sun:oklch(0.95_0.1_100)] [--page-pad:clamp(1rem,3vw,2.5rem)] [--rail-w:clamp(11rem,18vw,14rem)] [--hero-gap:clamp(1.5rem,4vw,3.5rem)] [--section-pad:clamp(1.25rem,2vw,2rem)] [--header-h:4.5rem] scroll-smooth"
			aria-label="Conversion Inc."
		>
			<div
				aria-hidden="true"
				className="out pointer-events-none   overflow-hidden"
			>
				<div className=" left-[-8rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--MC)_18%,transparent)_0%,transparent_66%)] blur-3xl" />
				<div className=" right-[-6rem] top-[12rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--SC)_14%,transparent)_0%,transparent_68%)] blur-3xl" />
				<div className=" inset-x-0 bottom-0 h-[18rem] bg-[linear-gradient(180deg,transparent_0%,color-mix(in_oklch,var(--BK)_10%,transparent)_100%)]" />
			</div>

			<header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-[--page-pad] pt-5">
				<div
					aria-hidden="true"
					className="rounded-full border border-[color:var(--TC)]/10 bg-[color-mix(in_oklch,var(--WH)_70%,transparent)] px-4 py-2 text-[0.7rem] uppercase tracking-[0.5em] text-[--SC] backdrop-blur-md"
				>
					signal archive
				</div>
				<div
					aria-hidden="true"
					className="rounded-full border border-[color:var(--TC)]/10 bg-[color-mix(in_oklch,var(--WH)_60%,transparent)] px-4 py-2 text-[0.7rem] uppercase tracking-[0.42em] text-[--GR] backdrop-blur-md"
				>
					conversion inc. / fade target
				</div>
			</header>

			<div className="mx-auto flex w-full max-w-[88rem] gap-[--hero-gap] px-[--page-pad] pb-[--page-pad] pt-[calc(var(--header-h)+1rem)] lg:grid lg:grid-cols-[var(--rail-w)_minmax(0,1fr)]">
				<aside className="lg:sticky lg:top-[calc(var(--header-h)+1.25rem)] lg:self-start">
					<nav aria-label="Conversion Inc. sections" className="space-y-4">
						<p className="text-[0.68rem] uppercase tracking-[0.45em] text-[--GR]">
							sections
						</p>
						<ul className="space-y-2">
							<NavItem id="night-transfer" label="night transfer" index="01" />
							<NavItem id="afterimage" label="afterimage" index="02" />
							<NavItem id="city-loop" label="city loop" index="03" />
							<NavItem id="soft-noise" label="soft noise" index="04" />
							<NavItem id="drift-system" label="drift system" index="05" />
						</ul>
					</nav>
				</aside>

				<div className="min-w-0 space-y-[--hero-gap]">
					<section
						aria-labelledby="conversion-hero"
						className="relative isolate overflow-hidden rounded-[2.5rem] border border-[color:var(--TC)]/10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--WH)_78%,transparent)_0%,color-mix(in_oklch,var(--BC)_90%,var(--MC))_100%)] px-[clamp(1.25rem,3vw,3rem)] py-[clamp(1.75rem,4vw,4.5rem)] shadow-[0_30px_100px_-60px_color-mix(in_oklch,var(--BK)_65%,transparent)]"
					>
						<div
							aria-hidden="true"
							className="absolute inset-0 -z-10 overflow-hidden"
						>
							<div className="absolute left-[10%] top-[18%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--MC)_24%,transparent)_0%,transparent_65%)] blur-3xl" />
							<div className="absolute right-[5%] bottom-[6%] h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--SC)_18%,transparent)_0%,transparent_68%)] blur-3xl" />
						</div>

						<div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
							<div className="max-w-3xl space-y-6">
								<div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.72rem] uppercase tracking-[0.48em]">
									<p className="text-[--SC]">signal archive</p>
									<div className="h-px min-w-24 flex-1 bg-[linear-gradient(90deg,var(--TC),transparent)]" />
									<p className="text-[--TC]">conversion inc.</p>
								</div>
								<h1
									id="conversion-hero"
									className="max-w-[9ch] text-[clamp(4rem,12vw,9rem)] font-semibold uppercase leading-[0.82] tracking-[-0.1em]"
								>
									conversion
									<br />
									inc.
								</h1>
								<p className="max-w-2xl text-sm leading-7 text-[--TC] sm:text-base">
									左ナビの 5 項目をそのまま 5 セクションへ対応させた、
									単一ページ寄りの仮組みレイアウト。参照画像本体はあとから差し替える前提で、
									まずは配色、ロゴ領域、固定 CTA、象徴オブジェクトの重なり順を固める。
								</p>
								<div className="flex flex-wrap gap-4 text-[0.68rem] uppercase tracking-[0.42em] text-[--GR]">
									<span>night transfer 22:30 - 05:45</span>
									<span>city loop</span>
									<span>soft noise</span>
								</div>
							</div>
							<div className="relative min-h-[20rem] rounded-[1.75rem] border border-[color:var(--TC)]/10 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--WH)_70%,transparent)_0%,color-mix(in_oklch,var(--BC)_78%,transparent)_100%)] p-5 backdrop-blur-sm">
								<div
									className="absolute right-[-2rem] top-[-2rem] h-[13rem] w-[17rem] max-w-[70%]"
									style={{
										filter:
											"drop-shadow(0 18px 50px color-mix(in oklch, var(--SC) 30%, transparent))",
									}}
								>
									<CnvSignCanvas />
								</div>
								<div className="absolute bottom-5 left-5 right-5 rounded-[1.25rem] border border-[color:var(--TC)]/10 bg-[color-mix(in_oklch,var(--WH)_64%,transparent)] p-4">
									<p className="text-[0.68rem] uppercase tracking-[0.45em] text-[--GR]">
										canvas overlay test
									</p>
									<p className="mt-3 text-sm leading-7 text-[--TC]">
										右上の象徴オブジェクトを、透過背景の Canvas として上から重ねる実験枠。
									</p>
								</div>
							</div>
						</div>
					</section>

					<div className="space-y-6">
						{sections.map((item) => (
							<SectionBlock key={item.id} item={item} />
						))}
					</div>
				</div>
			</div>

			<aside
				aria-label="CTA placeholder"
				className="fixed bottom-5 right-5 z-40 w-[min(22rem,calc(100vw-2.5rem))]"
			>
				<div className="rounded-[1.5rem] border border-[color:var(--TC)]/10 bg-[color-mix(in_oklch,var(--WH)_74%,transparent)] p-4 shadow-[0_18px_60px_-36px_color-mix(in_oklch,var(--BK)_70%,transparent)] backdrop-blur-md">
					<p className="text-[0.68rem] uppercase tracking-[0.46em] text-[--GR]">
						cta placeholder
					</p>
					<p className="mt-3 text-sm leading-6 text-[--TC]">
						右下固定の CTA は後から実ボタンに差し替える前提のプレースホルダー。
					</p>
					<div className="mt-4 grid h-24 place-items-center rounded-[1.4rem] border border-dashed border-[color:var(--TC)]/20 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--WH)_78%,transparent)_0%,color-mix(in_oklch,var(--SC)_10%,transparent)_100%)] text-center text-[0.72rem] uppercase tracking-[0.42em] text-[--TC]">
						c / inc.
					</div>
				</div>
			</aside>
		</main>
	);
}

export default ConversionInc;
