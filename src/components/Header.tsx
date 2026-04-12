// import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { CaretUpIcon, CaretDownIcon } from "@phosphor-icons/react";

function NavUl() {
	return (
		<ul>
			<li className="dswh">
				<Link to="/">HOME</Link>
			</li>
			<li className="dswh">
				<Link to="/examples">EX. for SKILL</Link>
			</li>
			<li className="dswh">
				<Link to="/rects">RandomGenerator</Link>
			</li>
			<li className="drop" aria-expanded="false">
				<a className="droplink drop_toggle dswh" tabIndex={-1}>
					Works
					<CaretDownIcon className="dropIcon ml-1" />
				</a>
				<button
					type="button"
					className="dropbtn drop_toggle"
					aria-label="サブメニューを開閉"
				/>
				<ul aria-hidden="true" aria-label="close">
					<li>
						<a
							href="https://cms0505.vercel.app/"
							className="hover:text-[--AC] transition-colors "
							target="_blank"
										rel="noopener noreferrer"
						>
							Portofolio
						</a>
					</li>
					<li>
						<a
							href="https://github.com/yuremono/BurnYourOwnStyle/tree/react"
							className=" hover:text-[--AC] transition-colors"
							target="_blank"
										rel="noopener noreferrer"
						>
							BYOS
						</a>
					</li>
					<li>
						<a
							href="https://chat-kanban.vercel.app/"
							className=" hover:text-[--AC] transition-colors"
							target="_blank"
										rel="noopener noreferrer"
						>
							ChatCanban
						</a>
					</li>
					<li>
						<a
							href="https://github.com/yuremono/creative-demos"
							className=" hover:text-[--AC] transition-colors"
							target="_blank"
										rel="noopener noreferrer"
						>
							CreativeDemos
						</a>
					</li>
				</ul>
			</li>
		</ul>
	);
}

type HeaderProps = {
	className?: string;
};

/**
 * LOCAL.html 準拠のヘッダー（#navsp は clone せず JSX で二重化）
 */
export function Header({ className }: HeaderProps) {
	return (
		<header
			id="header"
			className={["h  upInit [--innerBG:unset]", className]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="h_inner">
				<div className="h_logo Eng [--logoW:180px] dswh">
					<Link to="/">Brand Name</Link>
				</div>
				<button
					type="button"
					className="h_menu menu_toggle burger"
					aria-expanded="false"
					aria-pressed="false"
					aria-controls="nav"
					aria-label="menu open"
				>
					<span className="bar1" />
					<span className="bar2" />
					<span className="bar3" />
				</button>
				<div className="h_items fix-tab">
					<a className="textlink __tel dswh" href="#tel">
						tel.000-000-0000
					</a>
					<a className="btn" href="#contact">
						Contact
					</a>
				</div>
				<nav
					className="h_nav "
					id="nav"
					role="navigation"
					aria-label="main navigation"
				>
					<NavUl />
					<div className="focus_trap menu_toggle" tabIndex={0} />
				</nav>
				<nav
					id="navsp"
					className="nav"
					role="navigation"
					aria-label="main navigation (mobile overlay)"
				>
					<div className="nav_inner">
						<NavUl />
					</div>
				</nav>
			</div>
			<div className="h_pagetop">
				<a href="#">
					<CaretUpIcon className="" />
				</a>
			</div>
		</header>
	);
}
