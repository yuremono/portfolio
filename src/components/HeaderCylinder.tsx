import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
	type MouseEvent,
	type PointerEvent,
} from "react";
import { Link } from "react-router-dom";
import {
	// CaretUpIcon,
	CaretDownIcon,
	ArrowSquareOutIcon,
} from "@phosphor-icons/react";

const ModulationCylinderLogo = lazy(
	() => import("./three/ModulationCylinderLogo"),
);

interface HeaderCylinderProps {
	className?: string;
}

function showDropPopover(event: PointerEvent<HTMLLIElement>) {
	if (event.pointerType !== "mouse") return;
	const popover =
		event.currentTarget.querySelector<HTMLUListElement>(".DropUl");
	if (!popover || popover.matches(":popover-open")) return;
	const source = event.currentTarget.querySelector<HTMLElement>(".DropA");
	if (source) {
		positionDropPopover(popover, source);
		popover.showPopover({ source });
		return;
	}
	popover.showPopover();
}

function hideDropPopover(event: PointerEvent<HTMLLIElement>) {
	if (event.pointerType !== "mouse") return;
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

function toggleDropPopover(event: MouseEvent<HTMLButtonElement>) {
	event.preventDefault();
	const button = event.currentTarget;
	const popoverId = button.getAttribute("popovertarget");
	const popover = popoverId
		? document.getElementById(popoverId)
		: button.parentElement?.querySelector(".DropUl");
	if (!(popover instanceof HTMLUListElement)) return;

	if (popover.matches(":popover-open")) {
		popover.hidePopover();
		return;
	}
	positionDropPopover(popover, button);
	popover.showPopover({ source: button });
}

const dropHoverProps = {
	onPointerEnter: showDropPopover,
	onPointerLeave: hideDropPopover,
};

function positionDropPopover(popover: HTMLUListElement, source: HTMLElement) {
	const rect = source.getBoundingClientRect();
	const viewport = window.visualViewport;
	const viewportLeft = viewport?.offsetLeft ?? 0;
	const viewportTop = viewport?.offsetTop ?? 0;
	popover.style.setProperty("--dropPopoverLeft", `${viewportLeft + rect.right}px`);
	popover.style.setProperty(
		"--dropPopoverTop",
		`${viewportTop + rect.top + rect.height / 2}px`,
	);
}

export default function HeaderCylinder({ className }: HeaderCylinderProps) {
	const [open, setOpen] = useState(false);
	const navRef = useRef<HTMLElement>(null);

	const hideOpenDropPopovers = useCallback(() => {
		const root = navRef.current;
		if (!root) return;
		root.querySelectorAll<HTMLUListElement>(".DropUl").forEach((el) => {
			if (el.matches(":popover-open")) {
				el.hidePopover();
			}
		});
	}, []);

	const closeNav = useCallback(() => {
		hideOpenDropPopovers();
		setOpen(false);
	}, [hideOpenDropPopovers]);

	const toggleOpen = useCallback(() => {
		setOpen((current) => {
			if (current) {
				hideOpenDropPopovers();
				return false;
			}
			return true;
		});
	}, [hideOpenDropPopovers]);

	useEffect(() => {
		const onKeyUp = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			closeNav();
		};

		window.addEventListener("keyup", onKeyUp);

		return () => window.removeEventListener("keyup", onKeyUp);
	}, [closeNav]);

	return (
		<header
			id="Header"
			className={["Header HeaderCylinder", className].filter(Boolean).join(" ")}
			data-nav-open={open ? "true" : "false"}
		>
			<div className="HeaderInner ">
				<button
					type="button"
					className="HeaderLogo HeaderCylinderLogo"
					aria-expanded={open}
					aria-controls="HeaderNav"
					aria-label={open ? "Close menu" : "Open menu"}
					onClick={toggleOpen}
				>
					<Suspense fallback={<span className="LogoLoading" />}>
						<ModulationCylinderLogo interactive={false} autoSpin />
                                        </Suspense>
                                        <span className="HeaderAnotation WTS text-[--BC] ">
                                                <span>Tap or Click</span>
                                                <span>Open Menu</span>
                                        </span>
				</button>
				<nav
					ref={navRef}
					className="HeaderNav"
					id="HeaderNav"
					role="navigation"
					aria-label="main navigation"
					aria-hidden={!open}
					inert={open ? undefined : true}
				>
					<HeaderCylinderNav onNavigate={closeNav} />
					<div className="FocusTrap MenuToggle" tabIndex={0} />
				</nav>
			</div>
			
		</header>
	);
}

interface HeaderCylinderNavProps {
	onNavigate: () => void;
}

function HeaderCylinderNav({ onNavigate }: HeaderCylinderNavProps) {
	const idPrefix = useId();
	const repositoriesPopoverId = `${idPrefix}-repositories`;
	const pagesPopoverId = `${idPrefix}-pages`;

	return (
		<ul className="NavUl">
			<li className="NavLi">
				<Link to="/" onClick={onNavigate}>
					HOME
				</Link>
			</li>
			<li className="NavLi [font-family:--Ship]">
				<Link to="/bunmyaku" onClick={onNavigate}>
					文脈
				</Link>
			</li>
			<li className="NavLi NavDrop" {...dropHoverProps}>
				<button
					type="button"
					className="DropA DropToggle"
					popoverTarget={repositoriesPopoverId}
					onClick={toggleDropPopover}
				>
					Repositories
					<CaretDownIcon size={20} className="DropIcon" />
				</button>
				<button
					type="button"
					className="DropBtn DropToggle"
					popoverTarget={repositoriesPopoverId}
					aria-label="Toggle repositories submenu"
					onClick={toggleDropPopover}
				/>
				<ul
					id={repositoriesPopoverId}
					className="DropUl"
					popover="auto"
					aria-label="Repositories"
					onClick={hideClickedPopover}
				>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/portfolio"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
							onClick={onNavigate}
						>
							Portfolio
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/portfolio-wp"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
							onClick={onNavigate}
						>
							Portfolio-wp
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://github.com/yuremono/BurnYourOwnStyle/tree/react"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
							onClick={onNavigate}
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
							onClick={onNavigate}
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
							onClick={onNavigate}
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
							onClick={onNavigate}
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
							onClick={onNavigate}
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
							onClick={onNavigate}
						>
							NextJsCMS
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
				</ul>
			</li>
			<li className="NavLi NavDrop" {...dropHoverProps}>
				<button
					type="button"
					className="DropA DropToggle"
					popoverTarget={pagesPopoverId}
					onClick={toggleDropPopover}
				>
					Pages
					<CaretDownIcon size={20} className="DropIcon" />
				</button>
				<button
					type="button"
					className="DropBtn DropToggle"
					popoverTarget={pagesPopoverId}
					aria-label="Toggle pages submenu"
					onClick={toggleDropPopover}
				/>
				<ul
					id={pagesPopoverId}
					className="DropUl"
					popover="auto"
					aria-label="Pages"
					onClick={hideClickedPopover}
				>
					<li className="DropLi">
						<Link to="/preview" onClick={onNavigate}>
							BurnYourOwnStyle
						</Link>
					</li>
					<li className="DropLi [font-family:--Ship]">
						<Link to="/bunmyaku" onClick={onNavigate}>
							文脈
						</Link>
					</li>
					<li className="DropLi">
						<Link to="/donut" onClick={onNavigate}>
							Donut<small>(ADCMS)</small>
						</Link>
					</li>
					<li className="DropLi">
						<Link to="/rects" onClick={onNavigate}>
							RandomGenerator
						</Link>
					</li>
					<li className="DropLi">
						<Link to="/shuffleDivide" onClick={onNavigate}>
							ShuffleDivide
						</Link>
					</li>
					<li className="DropLi">
						<Link to="/glitch" onClick={onNavigate}>
							Glitch
						</Link>
					</li>
					<li className="DropLi">
						<Link to="/grid-carousel" onClick={onNavigate}>
							GridCarousel
						</Link>
					</li>
					<li className="DropLi">
						<Link to="/bbox" onClick={onNavigate}>
							BBox
						</Link>
					</li>
					<li className="DropLi">
						<Link to="/activity" onClick={onNavigate}>
							Activity
						</Link>
                                        </li>
                                        <li className="DropLi">
						<a
							href="https://yuremono.com/"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							Portfolio-wp
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi">
						<a
							href="https://chat-kanban.vercel.app/"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
							onClick={onNavigate}
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
							onClick={onNavigate}
						>
							NextJsCMS
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="DropLi opacity-10">
						<Link to="/examples" onClick={onNavigate}>
							Examples
						</Link>
					</li>
				</ul>
			</li>
			<li className="NavLi">
				<Link to="/preview" onClick={onNavigate}>
					BYOS
				</Link>
			</li>
		</ul>
	);
}
