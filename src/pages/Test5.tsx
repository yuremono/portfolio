import { useRef } from "react";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";

type RailIcon = "moon" | "afterimage" | "loop" | "noise" | "drift";

interface RailItem {
	title: string;
	subtitle: string;
	icon: RailIcon;
}

const railItems: RailItem[] = [
	{ title: "night transfer", subtitle: "22:30 → 05:45", icon: "moon" },
	{ title: "afterimage", subtitle: "残像", icon: "afterimage" },
	{ title: "city loop", subtitle: "都市ループ", icon: "loop" },
	{ title: "soft noise", subtitle: "ソフトノイズ", icon: "noise" },
	{ title: "drift system", subtitle: "浮遊システム", icon: "drift" },
];

function ForwardArrow() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 28 28"
			className="h-[55%] w-[55%]"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M5 14h15" />
			<path d="m15 8 6 6-6 6" />
		</svg>
	);
}

function RailGlyph({ icon }: { icon: RailIcon }) {
	switch (icon) {
		case "moon":
			return (
				<svg aria-hidden="true" viewBox="0 0 24 24" className="h-[52%] w-[52%]" fill="none" stroke="currentColor" strokeWidth="1.8">
					<path
						d="M16.7 3.9a7.7 7.7 0 1 0 3.4 14.6A8.7 8.7 0 1 1 16.7 3.9Z"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			);
		case "afterimage":
			return (
				<svg aria-hidden="true" viewBox="0 0 24 24" className="h-[52%] w-[52%]" fill="none" stroke="currentColor" strokeWidth="1.8">
					<path d="M4 8c2.2 1.2 4.3 1.2 6.5 0S14.8 6.8 17 8s4.3 1.2 3 0" strokeLinecap="round" />
					<path d="M4 16c2.2 1.2 4.3 1.2 6.5 0S14.8 14.8 17 16s4.3 1.2 3 0" strokeLinecap="round" />
				</svg>
			);
		case "loop":
			return (
				<svg aria-hidden="true" viewBox="0 0 24 24" className="h-[52%] w-[52%]" fill="none" stroke="currentColor" strokeWidth="1.8">
					<path d="M19 12a7 7 0 1 1-2.05-4.95" strokeLinecap="round" />
					<path d="M19 5v5h-5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case "noise":
			return (
				<svg aria-hidden="true" viewBox="0 0 24 24" className="h-[52%] w-[52%]" fill="none" stroke="currentColor" strokeWidth="1.8">
					<path d="M5 13.5h2l2-5 3 10 2-6 1.5 3H19" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			);
		case "drift":
			return (
				<svg aria-hidden="true" viewBox="0 0 24 24" className="h-[52%] w-[52%]" fill="none" stroke="currentColor" strokeWidth="1.8">
					<path d="M6 18V9" strokeLinecap="round" />
					<path d="M12 18V5" strokeLinecap="round" />
					<path d="M18 18v-7" strokeLinecap="round" />
					<path d="M4 18h16" strokeLinecap="round" />
				</svg>
			);
	}
}

function RailRow({ item }: { item: RailItem }) {
	return (
		<li className="flex items-center gap-[clamp(0.18rem,0.45vw,0.52rem)] text-[#24336d]">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-[clamp(0.18rem,0.45vw,0.55rem)]">
					<p className="truncate text-[clamp(0.43rem,0.82vw,0.98rem)] font-medium lowercase tracking-[0.045em]">
						{item.title}
					</p>
					<div className="h-px flex-1 border-b border-dotted border-[#7f8cb0]" />
				</div>
				<p className="mt-[0.18em] text-[clamp(0.3rem,0.58vw,0.68rem)] tracking-[0.08em] text-[#7a86ac]">
					{item.subtitle}
				</p>
			</div>
			<div className="grid aspect-square w-[clamp(0.8rem,1.8vw,2.35rem)] place-items-center rounded-full border border-[#6d7ea8]/70 bg-[#f6fbf2]/95 text-[#576a95] shadow-[0_10px_24px_-18px_rgba(31,44,99,0.52)]">
				<RailGlyph icon={item.icon} />
			</div>
		</li>
	);
}

function AccentDashes({ count, className = "" }: { count: number; className?: string }) {
	return (
		<div aria-hidden="true" className={`flex items-center gap-[0.28vw] ${className}`}>
			{Array.from({ length: count }).map((_, index) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative sequence
					key={index}
					className="block h-[0.48vw] min-h-[2px] rounded-full bg-[#ff8fc7]"
					style={{ width: `${index === 0 ? 1.35 : 0.86}vw` }}
				/>
			))}
		</div>
	);
}

function BottomTicks() {
	return (
		<div aria-hidden="true" className="mt-[1.1%] flex items-center gap-[1.3%]">
			<div className="flex w-[44%] gap-[3.2%]">
				<span className="block h-[0.6vw] min-h-[3px] flex-1 rounded-full bg-[#6c76a7]" />
				<span className="block h-[0.6vw] min-h-[3px] flex-1 rounded-full bg-[#707ab0]" />
				<span className="block h-[0.6vw] min-h-[3px] flex-1 rounded-full bg-[#7c85bb]" />
			</div>
			<div className="flex flex-1 gap-[5.5%]">
				{Array.from({ length: 7 }).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative sequence
					<span key={index} className="block h-[0.45vw] min-h-[2px] flex-1 rounded-full bg-[#7f86bc]" />
				))}
			</div>
		</div>
	);
}

function Test5() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
		<PageRoot ref={pageRootRef} className="bg-[#eef7eb]">
			<main className="relative overflow-hidden bg-[#eef7eb] px-0 text-[#1f2c63] [--wid:100%]">


				<section aria-labelledby="test5-title" className="relative">
					<h1 id="test5-title" className="sr-only">
						Conversion Inc.
					</h1>

					<div className="mx-auto w-full max-w-[1774px]">
						<div className="relative aspect-[1774/887] w-full">
							<img
								src="/images/common/conversion-hero-master.png"
								alt=""
								aria-hidden="true"
								loading="eager"
								decoding="async"
								className="absolute inset-0 h-full w-full object-cover"
							/>

							<div aria-hidden="true" className="pointer-events-none absolute inset-0">
								<div
									className="absolute left-0 top-0 h-[41.6%] w-[41.8%]"
									style={{
										background:
											"linear-gradient(90deg, rgba(246,251,241,0.99) 0%, rgba(242,249,238,0.98) 82%, rgba(242,249,238,0.55) 92%, rgba(242,249,238,0) 100%)",
									}}
								/>
								<div
									className="absolute left-0 top-[40.5%] h-[24.8%] w-[17.2%]"
									style={{
										background:
											"linear-gradient(90deg, rgba(244,250,239,0.98) 0%, rgba(240,248,236,0.97) 78%, rgba(240,248,236,0.3) 94%, rgba(240,248,236,0) 100%)",
									}}
								/>
								<div
									className="absolute left-0 top-[64.6%] h-[35.6%] w-[19.8%]"
									style={{
										background:
											"linear-gradient(90deg, rgba(244,250,239,0.96) 0%, rgba(238,247,235,0.95) 80%, rgba(238,247,235,0.22) 94%, rgba(238,247,235,0) 100%)",
									}}
								/>
								<div className="absolute left-[8.5%] top-[66%] h-[19.5%] w-[8.6%] rounded-[999px] bg-[radial-gradient(circle,rgba(240,248,236,0.98)_0%,rgba(240,248,236,0.92)_68%,rgba(240,248,236,0)_100%)]" />
								<div
									className="absolute right-0 top-[76.7%] h-[23.3%] w-[16.2%]"
									style={{
										background:
											"linear-gradient(90deg, rgba(246,251,241,0) 0%, rgba(242,249,238,0.55) 14%, rgba(242,249,238,0.95) 26%, rgba(238,247,235,0.95) 100%)",
									}}
								/>
							</div>

							<div className="absolute inset-0">
								<p className="absolute left-[2.45%] top-[4.35%] text-[clamp(0.4rem,0.92vw,1.05rem)] font-medium uppercase leading-[1.55] tracking-[0.62em] text-[#ff8fc7]">
									signal
									<br />
									archive
								</p>

								<img
									src="/images/common/conversion-line-label.png"
									alt=""
									aria-hidden="true"
									decoding="async"
									className="absolute left-[12.05%] top-[4.05%] w-[26.5%]"
								/>

								<div
									className="absolute left-[1.95%] top-[9.4%] w-[37.05%]"
									style={{ filter: "drop-shadow(0 20px 44px rgba(31,44,99,0.13))" }}
								>
									<img
										src="/images/common/conversion-logo-full.png"
										alt="Conversion Inc."
										loading="eager"
										decoding="async"
										className="block h-auto w-full"
									/>
								</div>

								<div className="absolute left-[2.35%] top-[36.55%] flex w-[19%] items-center gap-[0.7vw]">
									<p className="text-[clamp(0.38rem,0.86vw,0.98rem)] uppercase tracking-[0.36em] text-[#ff90c9]">
										[ 変換株式会社 ]
									</p>
									<AccentDashes count={6} className="flex-1" />
								</div>

								<div className="absolute left-[2.45%] top-[42.4%] w-[11.1%]">
									<ul className="space-y-[clamp(0.22rem,0.85vw,0.72rem)]">
										{railItems.map((item) => (
											<RailRow key={item.title} item={item} />
										))}
									</ul>
								</div>

								<div className="absolute left-[2.4%] top-[66.55%] w-[5.85%] overflow-hidden rounded-[0.45vw] border border-[#7889b0]/40 shadow-[0_20px_40px_-24px_rgba(31,44,99,0.34)]">
									<img
										src="/images/common/conversion-poster-card.png"
										alt=""
										aria-hidden="true"
										decoding="async"
										className="block h-auto w-full"
									/>
								</div>

								<div className="absolute left-[10.05%] top-[67.45%] grid aspect-square w-[5.45%] place-items-center rounded-full border border-[#5f719e]/80 bg-[#f8fcf4]/92 text-[#203069] shadow-[0_22px_42px_-30px_rgba(31,44,99,0.42)]">
									<div className="grid place-items-center gap-[0.18vw]">
										<span className="text-[clamp(0.35rem,0.76vw,0.82rem)] font-medium uppercase tracking-[0.38em]">
											FWD
										</span>
										<span className="flex justify-center">
											<ForwardArrow />
										</span>
									</div>
								</div>

								<p className="absolute left-[10.85%] top-[79.05%] text-[clamp(0.38rem,0.88vw,0.98rem)] uppercase leading-[1.45] tracking-[0.34em] text-[#ff8fc7]">
									build
									<br />
									convert
									<br />
									transmit
								</p>

								<div className="absolute left-[2.3%] top-[87.15%] w-[12.5%] text-[#7380a5]">
									<div className="flex items-center gap-[0.7vw]">
										<div className="h-px w-[26%] bg-[#7280a6]/55" />
										<p className="text-[clamp(0.32rem,0.74vw,0.78rem)] tracking-[0.08em]">
											All systems drifting.
										</p>
									</div>
									<p className="mt-[0.65%] text-[clamp(0.28rem,0.58vw,0.66rem)] tracking-[0.06em] text-[#8792b3]">
										すべてのシステムが漂流しています。
									</p>
									<BottomTicks />
								</div>

								<div className="absolute right-[0.95%] top-[78.35%] w-[13.7%] overflow-hidden rounded-[1vw] border border-[#d8e0d1]/55 shadow-[0_24px_50px_-34px_rgba(31,44,99,0.32)]">
									<img
										src="/images/common/conversion-cta-panel.png"
										alt=""
										aria-hidden="true"
										decoding="async"
										className="block h-auto w-full"
									/>
								</div>
							</div>
						</div>
					</div>
                                </section>
                                
			</main>
		</PageRoot>
	);
}

export default Test5;
