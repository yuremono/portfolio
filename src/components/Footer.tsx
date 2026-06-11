import { Link } from "react-router-dom";
import { ArrowSquareOutIcon} from "@phosphor-icons/react";

type FooterProps = {
	className?: string;
};

export function Footer({ className }: FooterProps) {
	return (
		<footer
			className={[
				" Eng Wrap into min-h-[100lvh] content-center bg-[--foreground] text-[--background] bg-no-repeat bg-contain bg-left-bottom",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			style={{
				backgroundImage: `url(images/fff2.svg)`,
			}}
		>
			<div className="DescList  IsCenter     ">
				<div>
					<dl>
						<dt>Name</dt>
						<dd>Yano Seiji</dd>
						<dt>Hobby</dt>
						<dd>
							Manga I love
							<br />
							Anime I love
							<br />
							Light Novel I love
							<br />
							Music I love
						</dd>
						<dt>Specialty</dt>
						<dd>
							CSS Styling
							<br />
							Context Engineering
						</dd>
					</dl>
				</div>
			</div>
			<div className="text-center   ">
				<p className="mb-0    text-[length:var(--logoFZ)]">
					yuremono works
				</p>
				<ul className="flex flex-wrap gap md:justify-center mt-6">
					<li className="">
						<Link to="/preview">BurnYourOwnStyle</Link>
                                        </li>
					<li className="[font-family:--Ship]">
                                        <Link to="/bunmyaku">文脈</Link>
                                        </li>
					<li className="">
						<Link to="/donut">
							Donut<small>(ADCMS)</small>
						</Link>
					</li>
					<li className="">
						<Link to="/rects">RandomGenerator</Link>
					</li>
					<li className="">
						<Link to="/shuffleDivide">ShuffleDivide</Link>
					</li>
					<li className="">
						<Link to="/glitch">Glitch</Link>
					</li>
					<li className="">
						<Link to="/grid-carousel">GridCarousel</Link>
					</li>
					<li className="">
						<Link to="/bbox">BBox</Link>
					</li>
					<li className="">
						<Link to="/activity">Activity</Link>
                                        </li>
                                        
				</ul>
				<ul className="flex flex-wrap gap md:justify-center mt-6">
                                        <li className="">
						<a
							href="https://github.com/yuremono?tab=repositories"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							Repositories
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="">
						<a
							href="https://chat-kanban.vercel.app/"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							ChatCanban&nbsp;
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
					<li className="">
						<a
							href="https://cms0505.vercel.app/"
							className=" "
							target="_blank"
							rel="noopener noreferrer"
						>
							NextJsCMS&nbsp;
							<ArrowSquareOutIcon size={16} />
						</a>
					</li>
				</ul>
			</div>
		</footer>
	);
}
