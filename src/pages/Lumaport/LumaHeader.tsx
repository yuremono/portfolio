// import type { CSSProperties } from "react";
import { Link, NavLink } from "react-router-dom";
import { UserCircle } from "@phosphor-icons/react";

import { getAssetPath } from "../../lib/assetPath";
const navItems = ["Trips", "Layovers", "Guides", "Pass"];

type HeaderProps = {
	className?: string;
};
const asset = (path: string) => getAssetPath(`images/lumaport/hero/${path}`);

/**
 * LOCAL.html 準拠のヘッダー（#HeaderNavMobile は clone せず JSX で二重化）
 */
// export default function AgentHeader() {
export default function Header({ className }: HeaderProps) {
	return (
		<header
			id="Header"
			className={[
				"Header fixed top-0 z-[1000] flex min-h-[--head] w-full items-center justify-between gap-4 PX",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<Link
				to="/"
				aria-label="LUMA PORT ホーム"
				className="relative  w-[min(19rem,56vw)] content-center rounded-[1em] bg-[--MC]  PX py-2 BorderXY"
			>
				<img
					src={asset("logo.png")}
					alt="LUMA PORT"
					className="h-auto w-full object-contain"
				/>
			</Link>
			<nav
				aria-label="主要ナビゲーション"
				className="hidden rounded-xl BorderXY bg-[--MC] p-2 text-[--AC] md:block content-center"
			>
				<ul className="flex items-center gap-2">
					{navItems.map((item) => (
						<li key={item}>
							<NavLink
								to="#"
								className="block rounded-md px-7  font-bold text-[--AC]"
							>
								{item}
							</NavLink>
						</li>
					))}
					<li>
						<NavLink
							to="#"
							className="flex items-center gap-2 rounded-lg BorderXY px-5  font-bold text-[--AC]"
						>
							<UserCircle
								size={24}
								weight="fill"
								aria-hidden="true"
							/>
							ログイン
						</NavLink>
					</li>
				</ul>
			</nav>
		</header>
	);
}
