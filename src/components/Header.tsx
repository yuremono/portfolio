// import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { CaretUpIcon, CaretDownIcon ,ArrowSquareOutIcon} from "@phosphor-icons/react";

function HeaderNav() {
	return (
		<ul className="NavUl">
			<li className="NavLi">
				<Link to="/">HOME</Link>
			</li>
			<li className="NavLi">
				<Link to="/preview">BYOS</Link>
			</li>
			<li className="NavLi">
				<Link to="/agent">Donuts</Link>
			</li>
			<li className="NavLi">
				<Link to="/rects">Generator</Link>
			</li>
			<li className="NavLi NavDrop" aria-expanded="false">
				<a className="DropA DropToggle " tabIndex={-1}>
					Repositories&nbsp;
					<CaretDownIcon className="DropIcon" />
				</a>
				<button
					type="button"
					className="DropBtn DropToggle"
					aria-label="サブメニューを開閉"
				/>
				<ul className="DropUl" aria-hidden="true" aria-label="close">
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
			<li className="NavLi NavDrop" aria-expanded="false">
				<a className="DropA DropToggle " tabIndex={-1}>
					Pages&nbsp;
					<CaretDownIcon className="DropIcon" />
				</a>
				<button
					type="button"
					className="DropBtn DropToggle"
					aria-label="サブメニューを開閉"
				/>
				<ul className="DropUl" aria-hidden="true" aria-label="close">
					<li className="DropLi">
						<Link to="/preview">BurnYourOwnStyle</Link>
					</li>
					<li className="DropLi">
						<Link to="/agent">
							Donuts<small>(ADCMS)</small>
						</Link>
					</li>
					<li className="DropLi">
						<Link to="/rects">RandomGenerator</Link>
					</li>
					<li className="DropLi">
						<Link to="/shuffle-divide">ShuffleDivide</Link>
					</li>
					<li className="DropLi">
						<Link to="/glitch">Glitch</Link>
					</li>
					<li className="DropLi">
						<Link to="/examples">EX.forBuildSKILL</Link>
					</li>
					<li className="DropLi">
						<Link to="/grid-carousel">GridCarousel</Link>
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
	return (
		<header
			id="Header"
			className={["Header  ", className].filter(Boolean).join(" ")}
		>
			<div className="HeaderInner ">
				<div className="HeaderLogo ">
					<Link className="HeaderLogoText Eng" to="/">
						yuremono
						<br />
						works
					</Link>
				</div>
				<button
					type="button"
					className="HeaderMenu MenuToggle IsDots"
					aria-expanded="false"
					aria-pressed="false"
					aria-controls="nav"
					aria-label="menu open"
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
					<HeaderNav />
					<div className="FocusTrap MenuToggle" tabIndex={0} />
				</nav>
				<nav
					id="HeaderNavMobile"
					className="HeaderNavMobile"
					role="navigation"
					aria-label="main navigation (mobile overlay)"
				>
					<div className="NavInner">
						<HeaderNav />
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
