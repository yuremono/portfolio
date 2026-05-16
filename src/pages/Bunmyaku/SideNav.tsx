import { useEffect } from "react";
import {
	ArchiveBoxIcon,
	FileTextIcon,
	FoldersIcon,
	GearSixIcon,
	HouseIcon,
	ShapesIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import type { SideNavProps } from "./data";

// navItems: サイドバーに表示する主要ナビゲーション。
const logoSrc = "/images/bunmyaku/bunmyaku-logo.png";

const navSections = [
	{
		label: "メイン",
		items: [
			{ label: "Dashboard", icon: HouseIcon, active: true },
			{ label: "ドキュメント", icon: FileTextIcon },
		],
	},
	{
		label: "ライブラリ",
		items: [
			{ label: "プロンプト一覧", icon: ArchiveBoxIcon },
			{ label: "テンプレート", icon: FoldersIcon },
			{ label: "パーツ", icon: ShapesIcon },
		],
	},
	{
		label: "履歴",
		items: [
			{ label: "最近使ったもの", icon: ArchiveBoxIcon },
			{ label: "設定", icon: GearSixIcon },
		],
	},
];

export function SideNav({ state: _state, className }: SideNavProps) {
	void _state;

	useEffect(() => {
		const image = new Image();
		image.src = logoSrc;
	}, []);

	return (
		<>
			<header
				data-l="MobileNav"
				className="BorderB sticky top-0 z-30 mt-0 bg-MC/95 px-[--PX] py-2 text-WH backdrop-blur lg:hidden"
			>
				<div data-l="MobileNavInner" className="flex items-center gap-2 overflow-x-auto">
					<div data-l="MobileBrand" className="flex size-11 shrink-0 items-center justify-center">
						<img src={logoSrc} alt="文脈" className="size-8 BabelRightDown object-contain" />
					</div>

					<nav
						data-l="MobileMenu"
						className="flex min-w-max items-center gap-1.5"
						aria-label="文脈ナビゲーション"
					>
						{navSections.flatMap((section) =>
							section.items.map((item) => {
								const Icon = item.icon;

								return (
									<button
										key={item.label}
										type="button"
										className={[
											"BorderXY flex h-11 w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 BabelRightDown px-1 transition",
											item.active
												? "bg-SC/20 text-WH shadow-[inset_0_-3px_0_var(--AC)]"
												: "text-WH/70 hover:bg-SC/10 hover:text-WH focus-visible:bg-SC/10 focus-visible:text-WH",
										].join(" ")}
									>
										<Icon size={18} weight={item.active ? "fill" : "regular"} aria-hidden="true" />
										<span className="w-full truncate text-center text-[0.5625rem] leading-none">
											{item.label}
										</span>
									</button>
								);
							}),
						)}

						<button
							type="button"
							className="BorderXY flex h-11 w-[4.25rem] shrink-0 flex-col items-center justify-center gap-0.5 BabelRightDown px-1 text-WH/70 transition hover:bg-SC/10 hover:text-WH focus-visible:bg-SC/10 focus-visible:text-WH"
						>
							<UserCircleIcon size={18} weight="duotone" className="text-AC" aria-hidden="true" />
							<span className="w-full truncate text-center text-[0.5625rem] leading-none">
								Workspace
							</span>
						</button>
					</nav>
				</div>
			</header>

			<aside
				data-l="SideNav"
				className={[
					"BorderR mt-0 hidden h-[100lvh] min-h-[100lvh] w-[--sideW] flex-col overflow-hidden px-[--PX] py-[--PX] text-WH lg:flex",
					className,
				]
					.filter(Boolean)
					.join(" ")}
			>
				<div data-l="SideBrand" className="largeFZ BorderB flex shrink-0 items-center  pb-3 gap-[0.5em]">
					<img src={logoSrc} alt="" className="size-[1.25em] BabelRightDown object-contain" />
					<div className="min-w-0">
						<p className="largeFZ [--HLH:1] [--HLS:0.5em]">文脈</p>
					</div>
				</div>

				<nav data-l="SideMenu" className=" text-xs flex flex-1 flex-col gap-6 overflow-y-auto py-5 pr-1" aria-label="文脈ナビゲーション">
					{navSections.map((section, sectionIndex) => (
						<section data-l={`NavSection${sectionIndex + 1}`} key={section.label} className="space-y-2">
							<h2 className="px-2 text-[0.875em] uppercase tracking-[0.075em] text-WH/50">
								{section.label}
							</h2>
							<ul className="space-y-1.5">
								{section.items.map((item) => {
									const Icon = item.icon;

									return (
										<li key={item.label}>
											<button
												type="button"
												className={[
													"BorderXY flex h-10 w-full items-center gap-3 BabelLeft px-3 text-left  transition",
													item.active
														? "bg-SC/20 text-WH shadow-[inset_3px_0_0_var(--AC)]"
														: "text-WH/70 hover:bg-SC/10 hover:text-WH focus-visible:bg-SC/10 focus-visible:text-WH",
												].join(" ")}
											>
												<Icon size={18} weight={item.active ? "fill" : "regular"} aria-hidden="true" />
												<span className="min-w-0 truncate">{item.label}</span>
											</button>
										</li>
									);
								})}
							</ul>
						</section>
					))}
				</nav>

				<div data-l="SideAccount" className="BorderT shrink-0 pt-4">
					<div data-l="AccountCard" className="BorderXY flex items-center gap-3 BabelRightDown bg-SC/10 p-3">
						<UserCircleIcon size={28} weight="duotone" className="shrink-0 text-AC" aria-hidden="true" />
						<div className="min-w-0">
							<p className="truncate  font-bold leading-tight ">Workspace</p>
							<p className="mt-1 text-xs leading-tight text-WH/55">Ready</p>
						</div>
						<span className="ml-auto size-2 shrink-0 rounded-full bg-AC" aria-hidden="true" />
					</div>
				</div>
			</aside>
		</>
	);
}
