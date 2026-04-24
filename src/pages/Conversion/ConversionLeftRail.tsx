interface RailItem {
	id: "night-transfer" | "afterimage" | "city-loop" | "soft-noise" | "drift-system";
	label: string;
	index: string;
}

interface ConversionLeftRailProps {
	className?: string;
}

const railItems: RailItem[] = [
	{ id: "night-transfer", label: "night transfer", index: "01" },
	{ id: "afterimage", label: "afterimage", index: "02" },
	{ id: "city-loop", label: "city loop", index: "03" },
	{ id: "soft-noise", label: "soft noise", index: "04" },
	{ id: "drift-system", label: "drift system", index: "05" },
];

function RailMarker() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			className="h-4 w-4 text-[--SC]"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
		>
			<path d="M4 12h16" strokeLinecap="round" />
			<path d="M12 4v16" strokeLinecap="round" />
			<circle cx="12" cy="12" r="3.25" />
		</svg>
	);
}

function RailArrow() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 20 20"
			className="h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
		>
			<path d="M4 10h11" strokeLinecap="round" />
			<path d="m10.75 5.5 4.5 4.5-4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function RailItemIcon() {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 16 16"
			className="h-3.5 w-3.5 text-[--GR]"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.3"
		>
			<rect x="2.5" y="2.5" width="11" height="11" rx="2.5" />
			<path d="M5 8h6" strokeLinecap="round" />
		</svg>
	);
}

export function ConversionLeftRail({
	className = "",
}: ConversionLeftRailProps) {
	return (
		<aside
			aria-label="Conversion navigation"
			className={`relative flex h-full flex-col gap-5 text-[--TC] ${className}`.trim()}
		>
			<div className="rounded-[1.75rem] border border-[color:var(--TC)]/12 bg-[color-mix(in_oklch,var(--WH)_72%,transparent)] p-5 shadow-[0_24px_70px_-48px_color-mix(in_oklch,var(--BK)_78%,transparent)] backdrop-blur-md">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-2">
						<p className="text-[0.68rem] uppercase tracking-[0.46em] text-[--GR]">
							signal archive
						</p>
						<div className="flex items-center gap-2">
							<RailMarker />
							<p className="text-sm tracking-[0.28em] text-[--TC]">
								変換株式会社
							</p>
						</div>
					</div>
					<span className="rounded-full border border-[color:var(--TC)]/12 px-2.5 py-1 text-[0.64rem] uppercase tracking-[0.4em] text-[--GR]">
						FWD
					</span>
				</div>

				<div className="mt-5 space-y-2 border-t border-[color:var(--TC)]/10 pt-5">
					<p
						id="conversion-status-copy"
						className="text-[0.78rem] uppercase tracking-[0.28em] text-[--TC]"
					>
						All systems drifting.
					</p>
					<p className="text-sm leading-6 text-[--GR]">
						すべてのシステムが漂流しています。
					</p>
				</div>

				<nav aria-label="Section links" className="mt-6">
					<ul className="space-y-2">
						{railItems.map((item) => (
							<li key={item.id}>
								<a
									href={`#${item.id}`}
									className="group flex items-center gap-3 rounded-[1rem] border border-[color:var(--TC)]/10 bg-[color-mix(in_oklch,var(--WH)_52%,transparent)] px-3 py-3 text-[0.72rem] uppercase tracking-[0.3em] text-[--TC] transition-colors duration-200 hover:border-[color:var(--TC)]/24 hover:bg-[color-mix(in_oklch,var(--WH)_76%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--SC]"
								>
									<RailItemIcon />
									<span className="min-w-0 flex-1">{item.label}</span>
									<span className="text-[0.62rem] tracking-[0.42em] text-[--GR]">
										{item.index}
									</span>
									<span className="text-[--SC] transition-transform duration-200 group-hover:translate-x-0.5">
										<RailArrow />
									</span>
								</a>
							</li>
						))}
					</ul>
				</nav>

				<div className="mt-6 grid grid-cols-3 gap-2" aria-label="Transmission phases">
					<span className="rounded-[0.95rem] border border-[color:var(--TC)]/10 px-3 py-2 text-center text-[0.62rem] uppercase tracking-[0.34em] text-[--TC]">
						build
					</span>
					<span className="rounded-[0.95rem] border border-[color:var(--TC)]/10 px-3 py-2 text-center text-[0.62rem] uppercase tracking-[0.34em] text-[--TC]">
						convert
					</span>
					<span className="rounded-[0.95rem] border border-[color:var(--TC)]/10 px-3 py-2 text-center text-[0.62rem] uppercase tracking-[0.34em] text-[--TC]">
						transmit
					</span>
				</div>

				<a
					href="#night-transfer"
					className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--TC)]/12 bg-[color-mix(in_oklch,var(--WH)_80%,transparent)] px-4 py-2 text-[0.68rem] uppercase tracking-[0.42em] text-[--TC] transition-colors duration-200 hover:border-[color:var(--TC)]/24 hover:bg-[color-mix(in_oklch,var(--WH)_92%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--SC]"
				>
					FWD
					<RailArrow />
				</a>
			</div>
		</aside>
	);
}
