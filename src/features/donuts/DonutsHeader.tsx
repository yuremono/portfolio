// import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { CaretUpIcon, CaretDownIcon } from "@phosphor-icons/react";

function HeaderNav() {
	return (
		<ul className="HeaderUl">
			<li>
				<Link to="/next">HOME</Link>
			</li>
			<li>
				<Link to="/">BYOS</Link>
			</li>
			<li>
				<Link to="/agent">Donuts</Link>
			</li>
			<li>
				<Link to="/rects">Generator</Link>
			</li>
			<li className="drop" aria-expanded="false">
				<a className="droplink drop_toggle " tabIndex={-1}>
					Repositories
					<CaretDownIcon className="DropIcon" />
				</a>
				<button
					type="button"
					className="dropbtn drop_toggle"
					aria-label="サブメニューを開閉"
				/>
				<ul aria-hidden="true" aria-label="close">
					<li>
						<a
							href="https://github.com/yuremono/BurnYourOwnStyle/tree/react"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							BurnYourOwnStyle
						</a>
					</li>
					<li>
						<a
							href="https://github.com/yuremono/agent-driven-CMS"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							AgentDrivenCMS
						</a>
					</li>
					<li>
						<a
							href="https://github.com/yuremono/agent-relay"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							AgentRelay
						</a>
					</li>
					<li>
						<Link to="/agent">Agent Driven CMS</Link>
					</li>
					<li>
						<a
							href="https://github.com/yuremono/chatKanban"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							ChatCanban
						</a>
					</li>
					{/* <li>
						<a
							href="https://chat-kanban.vercel.app/"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							ChatCanban
						</a>
					</li> */}

					<li>
						<a
							href="https://cms0505.vercel.app/"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							Portofolio
						</a>
					</li>
				</ul>
			</li>
		</ul>
	);
}
function HeaderItems() {
	return (
		<div className="HeaderItems fix-tab">
			<a
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
			</a>
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
			className={["Header  ", className]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="HeaderInner ">
				<div className="HeaderLogo ">
                                <Link className="HeaderLogoText" to="/">Brand Name</Link>
				</div>
				<button
					type="button"
					className="HeaderMenu MenuToggle burger"
					aria-expanded="false"
					aria-pressed="false"
					aria-controls="nav"
					aria-label="menu open"
				>
					<span className="bar1" />
					<span className="bar2" />
					<span className="bar3" />
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
