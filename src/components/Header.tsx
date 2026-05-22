import { lazy, Suspense, type MouseEvent, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import {
	CaretUpIcon,
	CaretDownIcon,
	ArrowSquareOutIcon,
} from "@phosphor-icons/react";

const ModulationCylinderLogo = lazy(
	() => import("./three/ModulationCylinderLogo"),
);

function hasHeaderClass(className: string | undefined, target: string) {
	return className?.split(/\s+/).includes(target) ?? false;
}

type HeaderNavVariant = "desktop" | "mobile";

interface HeaderNavProps {
	variant: HeaderNavVariant;
}

function showDropPopover(event: PointerEvent<HTMLLIElement>) {
	const popover =
		event.currentTarget.querySelector<HTMLUListElement>(".DropUl");
	if (!popover || popover.matches(":popover-open")) return;
	const source = event.currentTarget.querySelector<HTMLElement>(".DropA");
	if (source) {
		popover.showPopover({ source });
		return;
	}
	popover.showPopover();
}

function hideDropPopover(event: PointerEvent<HTMLLIElement>) {
	const relatedTarget = event.relatedTarget;
	if (
		relatedTarget instanceof Node &&
		event.currentTarget.contains(relatedTarget)
	) {
		return;
	}

	const popover =
		event.currentTarget.querySelector<HTMLUListElement>(".DropUl");
	if (!popover || !popover.matches(":popover-open")) return;
	popover.hidePopover();
}

function hideClickedPopover(event: MouseEvent<HTMLUListElement>) {
	if (!(event.target instanceof Element) || !event.target.closest("a"))
		return;
	event.currentTarget.hidePopover();
}

function HeaderNav({ variant }: HeaderNavProps) {
	const isDesktop = variant === "desktop";
	const repositoriesPopoverId = `HeaderRepositoriesMenu-${variant}`;
	const pagesPopoverId = `HeaderPagesMenu-${variant}`;
	const dropHoverProps = isDesktop
		? {
				onPointerEnter: showDropPopover,
				onPointerLeave: hideDropPopover,
			}
		: {};

	return (
		<ul className="NavUl">
			<li className="NavLi">
				<Link to="/">HOME</Link>
			</li>
			<li className="NavLi">
				<Link to="/preview">BYOS</Link>
			</li>
			<li className="NavLi [font-family:--Ship]">
				<Link to="/bunmyaku">文脈</Link>
			</li>
			<li className="NavLi NavDrop" {...dropHoverProps}>
				{isDesktop ? (
					<button
						type="button"
						className="DropA DropToggle"
						popoverTarget={repositoriesPopoverId}
					>
						Repositories&nbsp;
						<CaretDownIcon className="DropIcon" />
					</button>
				) : (
					<a className="DropA DropToggle " tabIndex={-1}>
						Repositories&nbsp;
						<CaretDownIcon className="DropIcon" />
					</a>
				)}
				{isDesktop ? (
					<button
						type="button"
						className="DropBtn DropToggle"
						popoverTarget={repositoriesPopoverId}
						aria-label="Toggle repositories submenu"
					/>
				) : (
					<button
						type="button"
						className="DropBtn DropToggle"
						aria-expanded="false"
						aria-controls={repositoriesPopoverId}
						aria-label="Toggle repositories submenu"
					/>
				)}
				<ul
					id={repositoriesPopoverId}
					className="DropUl"
					popover={isDesktop ? "auto" : undefined}
					aria-hidden={isDesktop ? undefined : "true"}
					aria-label={isDesktop ? "Repositories" : undefined}
					onClick={isDesktop ? hideClickedPopover : undefined}
				>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/portfolio"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							Portfolio
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/wp-local-demo"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							wp-local-demo
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/BurnYourOwnStyle/tree/react"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							BurnYourOwnStyle
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/agent-driven-CMS"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							AgentDrivenCMS
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/agent-relay"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							AgentRelay
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/creative-demos"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							CreativeDemos
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/chatKanban"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							ChatCanban
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/portfolio"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							NextJsCMS
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
				</ul>
			</li>
			<li className="NavLi NavDrop" {...dropHoverProps}>
				{isDesktop ? (
					<button
						type="button"
						className="DropA DropToggle"
						popoverTarget={pagesPopoverId}
					>
						Pages&nbsp;
						<CaretDownIcon className="DropIcon" />
					</button>
				) : (
					<a className="DropA DropToggle " tabIndex={-1}>
						Pages&nbsp;
						<CaretDownIcon className="DropIcon" />
					</a>
				)}
				{isDesktop ? (
					<button
						type="button"
						className="DropBtn DropToggle"
						popoverTarget={pagesPopoverId}
						aria-label="Toggle pages submenu"
					/>
				) : (
					<button
						type="button"
						className="DropBtn DropToggle"
						aria-expanded="false"
						aria-controls={pagesPopoverId}
						aria-label="Toggle pages submenu"
					/>
				)}
				<ul
					id={pagesPopoverId}
					className="DropUl"
					popover={isDesktop ? "auto" : undefined}
					aria-hidden={isDesktop ? undefined : "true"}
					aria-label={isDesktop ? "Pages" : undefined}
					onClick={isDesktop ? hideClickedPopover : undefined}
				>
					<li className="DropLi">
						<Link to="/preview">BurnYourOwnStyle</Link>
					</li>
					<li className="DropLi [font-family:--Ship]">
						<Link to="/bunmyaku">文脈</Link>
					</li>
					<li className="DropLi">
						<Link to="/donut">
							Donut<small>(ADCMS)</small>
						</Link>
					</li>
					<li className="DropLi">
						<Link to="/rects">RandomGenerator</Link>
					</li>
					<li className="DropLi">
						<Link to="/shuffleDivide">ShuffleDivide</Link>
					</li>
					<li className="DropLi">
						<Link to="/glitch">Glitch</Link>
					</li>
					<li className="DropLi">
						<Link to="/grid-carousel">GridCarousel</Link>
					</li>
					<li className="DropLi">
						<Link to="/bbox">BBox</Link>
					</li>
					<li className="DropLi">
						<Link to="/activity">Activity</Link>
					</li>
					<li className="DropLi">
						<a
							href="https://chat-kanban.vercel.app/"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							ChatCanban
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://cms0505.vercel.app/"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							NextJsCMS
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi ">
						<Link to="/examples" className="opacity-10">Examples</Link>
					</li>
				</ul>
			</li>
		</ul>
	);
}
function HeaderItems() {
	return (
		<div className="HeaderItems FixTab">
			{/* <a
				href="https://github.com/yuremono/creative-demos"
				target="_blank"
				rel="noopener noreferrer"
			>
				CreativeDemos
			</a>
			<a
				href="https://yuremono.github.io/BurnYourOwnStyle/rects"
				target="_blank"
				rel="noopener noreferrer"
			>
				Generator
			</a> */}
		</div>
	);
}

type HeaderProps = {
	className?: string;
};

/**
 * LOCAL.html 準拠のヘッダー（#HeaderNavMobile は clone せず JSX で二重化）
 */
// export default function AgentHeader() {
export default function Header({ className }: HeaderProps) {
	const usesModulationLogo = hasHeaderClass(className, "NavCircleLeft");

	return (
		<header
			id="Header"
			className={["Header  ", className].filter(Boolean).join(" ")}
		>
			<div className="HeaderInner ">
				<div className="HeaderLogo ">
					<Link
						className={
							usesModulationLogo
								? "LogoObject"
								: "HeaderLogoText Eng"
						}
						to="/"
						aria-label={usesModulationLogo ? "HOME" : undefined}
					>
						{usesModulationLogo ? (
							<Suspense
								fallback={<span className="LogoLoading" />}
							>
								<ModulationCylinderLogo
									interactive={false}
									autoSpin
								/>
							</Suspense>
						) : (
							<>
								yuremono
								<br />
								works
							</>
						)}
					</Link>
				</div>
				<button
					type="button"
					className="HeaderMenu MenuToggle IsDots"
					aria-expanded="false"
					aria-controls="HeaderNavMobile"
					aria-label="Open menu"
				>
					<span className="span1" />
					<span className="span2" />
					<span className="span3" />
				</button>
				<HeaderItems />
				<nav
					className="HeaderNav"
					id="HeaderNav"
					role="navigation"
					aria-label="main navigation"
				>
					<HeaderNav variant="desktop" />
					<div className="FocusTrap MenuToggle" tabIndex={0} />
				</nav>
				<nav
					id="HeaderNavMobile"
					className="HeaderNavMobile"
					role="navigation"
					aria-label="main navigation (mobile overlay)"
				>
					<div className="NavInner">
						<HeaderNav variant="mobile" />
					</div>
				</nav>
			</div>
			<div className="HeaderPagetop">
				<a href="#">
					<CaretUpIcon className="" />
				</a>
			</div>
		</header>
	);
}
