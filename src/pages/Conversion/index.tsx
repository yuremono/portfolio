import { ConversionHero } from "./ConversionHero";
import { ConversionSections } from "./ConversionSections";

function Conversion() {
	return (
		<main
			aria-label="Conversion"
			className="relative isolate min-h-screen overflow-x-clip bg-[linear-gradient(180deg,var(--BC)_0%,color-mix(in_oklch,var(--BC)_88%,var(--MC))_52%,color-mix(in_oklch,var(--BC)_70%,var(--TC))_100%)] text-[--TC] [--conversion-bg-base:var(--BC)] [--conversion-gap:clamp(3rem,8vw,6rem)] [--conversion-mint:var(--third)] [--conversion-navy:color-mix(in_oklch,var(--TC)_82%,var(--MC))] [--conversion-pad:clamp(1.25rem,3vw,2.5rem)] [--conversion-pink:color-mix(in_oklch,var(--AC)_38%,var(--WH))] [--conversion-shell:88rem] [--MC:var(--conversion-mint)] [--SC:var(--conversion-pink)] [--AC:color-mix(in_oklch,var(--conversion-pink)_58%,var(--conversion-mint))] [--BC:color-mix(in_oklch,var(--conversion-bg-base)_94%,var(--WH))] [--TC:var(--conversion-navy)] [--GR:color-mix(in_oklch,var(--conversion-navy)_46%,var(--WH))]"
		>
			<div
				aria-hidden="true"
				className="out pointer-events-none absolute inset-0 overflow-hidden"
			>
				<div className="absolute left-[-8rem] top-[-9rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--conversion-mint)_28%,transparent)_0%,transparent_70%)] blur-3xl" />
				<div className="absolute right-[-6rem] top-[12rem] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--conversion-pink)_30%,transparent)_0%,transparent_72%)] blur-3xl" />
				<div className="absolute inset-x-0 bottom-0 h-[16rem] bg-[linear-gradient(180deg,transparent_0%,color-mix(in_oklch,var(--conversion-navy)_16%,transparent)_100%)]" />
			</div>

			<div className="out mt-0">
				<ConversionHero />
				<ConversionSections />
			</div>
		</main>
	);
}

export default Conversion;
