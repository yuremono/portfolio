import { ConversionLeftRail } from "./ConversionLeftRail";

interface ConversionHeroProps {
	className?: string;
}

function OverlayGlyph() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 32 32"
			className="h-8 w-8 text-[--SC]"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.25"
		>
			<circle cx="16" cy="16" r="10.5" />
			<path d="M16 7v18M7 16h18" strokeLinecap="round" />
		</svg>
	);
}

function OverlayArrow() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 20 20"
			className="h-4 w-4"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
		>
			<path d="M4.5 10h10.5" strokeLinecap="round" />
			<path d="m11 5.5 4.5 4.5-4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

export function ConversionHero({ className = "" }: ConversionHeroProps) {
	return (
		<section
			aria-labelledby="conversion-hero-title"
			aria-describedby="conversion-hero-description conversion-status-copy"
			className={`relative isolate overflow-hidden  border border-[color:var(--TC)]/10 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--WH)_84%,transparent)_0%,color-mix(in_oklch,var(--BC)_90%,var(--MC))_100%)] shadow-[0_36px_110px_-72px_color-mix(in_oklch,var(--BK)_85%,transparent)] ${className}`.trim()}
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
			>
				<div className="absolute left-[-12%] top-[-18%] h-[24rem] w-[24rem]  bg-[radial-gradient(circle,color-mix(in_oklch,var(--MC)_18%,transparent)_0%,transparent_72%)] blur-3xl" />
				<div className="absolute right-[-8%] bottom-[-22%] h-[22rem] w-[22rem]  bg-[radial-gradient(circle,color-mix(in_oklch,var(--SC)_18%,transparent)_0%,transparent_70%)] blur-3xl" />
			</div>

			<div className="grid gap-4 xl:grid-cols-[minmax(16rem,19rem)_minmax(0,1fr)]">
				<ConversionLeftRail className="xl:sticky xl:top-6 xl:self-start" />

				<div className="relative min-h-[46rem] overflow-hidden ] border border-[color:var(--TC)]/10 bg-[color-mix(in_oklch,var(--WH)_42%,transparent)]">
					<img
						src="/images/common/conversion-hero-master.png"
						alt=""
						aria-hidden="true"
						loading="eager"
						decoding="async"
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--BK)_10%,transparent)_0%,transparent_26%,transparent_58%,color-mix(in_oklch,var(--BK)_18%,transparent)_100%)]" />
					<div className="absolute inset-y-0 left-0 w-[max(26%,15rem)] bg-[linear-gradient(90deg,color-mix(in_oklch,var(--BK)_18%,transparent)_0%,transparent_100%)]" />

					<div className="relative z-10 flex h-full flex-col justify-between p-[clamp(1.25rem,2.5vw,2rem)] sm:p-[clamp(1.5rem,3vw,2.5rem)]">
						<div className="max-w-[26rem] .75rem] border border-[color:var(--TC)]/12 bg-[color-mix(in_oklch,var(--WH)_68%,transparent)] p-5 shadow-[0_24px_80px_-54px_color-mix(in_oklch,var(--BK)_70%,transparent)] backdrop-blur-md">
							<img
								src="/images/common/conversion-logo-full.png"
								alt=""
								aria-hidden="true"
								loading="eager"
								decoding="async"
								className="h-auto w-[min(18rem,72%)]"
							/>
							<div className="mt-5 flex items-center gap-3">
								<OverlayGlyph />
								<div>
									<p className="text-[0.66rem] uppercase tracking-[0.46em] text-[--GR]">
										signal archive
									</p>
									<h1
										id="conversion-hero-title"
										className="mt-2 text-[clamp(2rem,4vw,3.75rem)] font-semibold leading-[0.92] tracking-[-0.08em] text-[--TC]"
									>
										変換株式会社
									</h1>
								</div>
							</div>
							<p
								id="conversion-hero-description"
								className="mt-4 max-w-[28ch] text-sm leading-7 text-[--TC]"
							>
								実画像を土台に、左 rail とオーバーレイのテキストだけを DOM で重ねる構成です。
							</p>
						</div>

						<div className="pointer-events-none absolute left-[clamp(1.25rem,2.5vw,2rem)] top-[28%] w-[min(14rem,34vw)] sm:left-[clamp(1.5rem,3vw,2.5rem)]">
							<div
								className="overflow-hidden .35rem] border border-[color:var(--TC)]/12 bg-[color-mix(in_oklch,var(--WH)_60%,transparent)] shadow-[0_20px_64px_-42px_color-mix(in_oklch,var(--BK)_72%,transparent)] backdrop-blur-sm"
								style={{ clipPath: "polygon(0 0, 100% 0, 100% 84%, 88% 100%, 0 100%)" }}
							>
								<img
									src="/images/common/conversion-line-label.png"
									alt=""
									aria-hidden="true"
									decoding="async"
									className="block h-auto w-full"
								/>
							</div>
						</div>

						<div className="pointer-events-none absolute right-[clamp(1rem,2vw,1.5rem)] top-[16%] w-[min(18rem,34vw)] sm:right-[clamp(1.5rem,3vw,2.5rem)]">
							<div
								className="overflow-hidden .6rem] border border-[color:var(--TC)]/12 bg-[color-mix(in_oklch,var(--WH)_54%,transparent)] shadow-[0_24px_72px_-44px_color-mix(in_oklch,var(--BK)_76%,transparent)]"
								style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)" }}
							>
								<img
									src="/images/common/conversion-poster-card.png"
									alt=""
									aria-hidden="true"
									decoding="async"
									className="block h-auto w-full"
								/>
							</div>
						</div>

						<div className="mt-auto flex flex-col gap-4 lg:max-w-[34rem]">
							<div className="inline-flex w-fit items-center gap-2  border border-[color:var(--TC)]/12 bg-[color-mix(in_oklch,var(--WH)_68%,transparent)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.44em] text-[--TC] backdrop-blur-md">
								FWD
								<OverlayArrow />
							</div>

							<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,16rem)]">
								<div className=".5rem] border border-[color:var(--TC)]/12 bg-[color-mix(in_oklch,var(--WH)_70%,transparent)] p-4 shadow-[0_18px_50px_-36px_color-mix(in_oklch,var(--BK)_70%,transparent)] backdrop-blur-md">
									<p className="text-[0.66rem] uppercase tracking-[0.42em] text-[--GR]">
										build / convert / transmit
									</p>
									<p className="mt-3 text-sm leading-6 text-[--TC]">
										画像の質感は保持しつつ、意味を持つ語だけを後乗せするメインビジュアル。
									</p>
								</div>

								<div className="relative overflow-hidden .5rem] border border-[color:var(--TC)]/12 bg-[color-mix(in_oklch,var(--WH)_62%,transparent)] p-2 shadow-[0_18px_54px_-38px_color-mix(in_oklch,var(--BK)_72%,transparent)] backdrop-blur-md">
									<img
										src="/images/common/conversion-cta-panel.png"
										alt=""
										aria-hidden="true"
										decoding="async"
										className="block h-auto w-full ]"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
