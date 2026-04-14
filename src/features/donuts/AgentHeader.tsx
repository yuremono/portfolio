import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const headerNav = [
	{ href: "https://cms0505.vercel.app/", label: "Works" },
	{
		href: "https://github.com/yuremono/BurnYourOwnStyle/tree/react",
		label: "BYOS",
	},
	{ href: "https://chat-kanban.vercel.app/", label: "ChatCanban" },
];

const headerItems = [
	{
		href: "https://github.com/yuremono/creative-demos",
		label: "CreativeDemos",
		className: "p-2   ",
	},
	{
		href: "https://yuremono.github.io/BurnYourOwnStyle/rects",
		label: "RandomRects",
		className: "p-2   ",
	},
];

function HeaderLogo() {
	return (
		<Link
			to="/"
			className="HeaderLogo absolute w-[var(--logoW)] top-1/2 left-0 translate-y-[-50%] pointer-events-auto"
			aria-label="Agent Driven CMS ホーム"
		>
			<span className="HeaderLogoText ">
				<span>わ</span>
			</span>
		</Link>
	);
}

function DesktopNav() {
	return (
		<nav
			className="HeaderNav hidden md:flex pointer-events-auto"
			aria-label="main navigation"
		>
			<ul className="HeaderUl flex flex-wrap items-center justify-center gap-1 p-2">
				{headerNav.map((item) => (
					<li key={item.href}>
						<a
							href={item.href}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center  py-2 text-sm font-medium text-[var(--TC)]  "
						>
							{item.label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

function HeaderItems() {
	return (
		<div className="HeaderItems hidden md:grid  pointer-events-auto text-right p-2 gap-0">
			{headerItems.map((item) => (
				<a
					key={item.href}
					href={item.href}
					target="_blank"
					rel="noopener noreferrer"
					className={item.className}
				>
					{item.label}
				</a>
			))}
		</div>
	);
}

function MobileMenu() {
	const [open, setOpen] = useState(
		() => new URLSearchParams(window.location.search).get("mobileMenu") === "open",
	);

	useEffect(() => {
		if (!open) {
			return undefined;
		}

		const previousOverflow = document.documentElement.style.overflow;
		document.documentElement.style.overflow = "hidden";

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.documentElement.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [open]);

	return (
		<div className="fixed top-[var(--PX)]  right-[var(--PX)] ml-auto md:hidden pointer-events-auto">
			<button
				type="button"
				className={`HeaderMenu dots inline-flex items-center  transition-opacity  ${
					open ? "active " : ""
				}`}
				onClick={() => setOpen((isOpen) => !isOpen)}
				aria-expanded={open}
				aria-controls="mobile-header-drawer"
				aria-label={open ? "メニューを閉じる" : "メニューを開く"}
			>
				<span className="span1 " />
				<span className="span2 " />
				<span className="span3 " />
			</button>

			<div
				className={`fixed inset-0 z-50 transition-opacity  ease-out ${
					open
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0"
				}`}
				aria-hidden={!open}
			>
				<button
					type="button"
					className="absolute inset-0 bg-[var(--WH)]"
					onClick={() => setOpen(false)}
					tabIndex={-1}
					aria-label="メニューを閉じる"
				/>

				<div
					id="mobile-header-drawer"
					className={`relative flex h-full w-full flex-col bg-[var(--WH)] transition-[opacity,transform]  ease-out ${
						open
							? "translate-y-0 opacity-100"
							: "translate-y-2 opacity-0"
					}`}
				>
					<nav
						aria-label="mobile navigation"
						className="mt-16 flex-1 overflow-y-auto px-[var(--PX)] pb-6 text-white text-right"
					>
						<ul className="">
							<li className="">
								<Link
									to="/"
									className="block px-1 py-4 text-lg font-medium tracking-tight text-[var(--TC)]"
									onClick={() => setOpen(false)}
								>
									HOME
								</Link>
							</li>
							{headerNav.map((item) => (
								<li key={item.href} className="">
									<a
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										className="block px-1 py-4 text-lg font-medium tracking-tight text-[var(--TC)]"
										onClick={() => setOpen(false)}
									>
										{item.label}
									</a>
								</li>
							))}
							{headerItems.map((item) => (
								<li key={item.href} className="">
									<a
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										className="block px-1 py-4 text-lg font-medium tracking-tight text-[var(--TC)]"
										onClick={() => setOpen(false)}
									>
										{item.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</div>
	);
}

export default function AgentHeader() {
	return (
		<header className="Header fixed top-0 z-40 w-full h-full pointer-events-none">
			<div className="HeaderInner px-0  flex-col items-end justify-between h-full">
				<HeaderLogo />
				<DesktopNav />
				<HeaderItems />
				<MobileMenu />
			</div>
		</header>
	);
}
