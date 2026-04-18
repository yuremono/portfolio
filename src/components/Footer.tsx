import { Link } from "react-router-dom";

type FooterProps = {
	className?: string;
};

export function Footer({ className }: FooterProps) {
	return (
		<footer
			className={[
				" Eng Wrap into   bg-[--foreground] text-[--background] bg-no-repeat bg-contain bg-left-bottom",
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
				<div className="space-x-4 mt-6">
					<a
						href="https://cms0505.vercel.app/"
						className="hover:text-[--AC] transition-colors "
						target="_blank"
						rel="noopener noreferrer"
					>
						Works
					</a>
					<a
						href="https://github.com/yuremono/BurnYourOwnStyle/tree/react"
						className=" hover:text-[--AC] transition-colors"
						target="_blank"
						rel="noopener noreferrer"
					>
						BYOS
					</a>
					<a
						href="https://chat-kanban.vercel.app/"
						className=" hover:text-[--AC] transition-colors"
						target="_blank"
						rel="noopener noreferrer"
					>
						ChatCanban
					</a>
					<a
						href="https://github.com/yuremono/creative-demos"
						className=" hover:text-[--AC] transition-colors"
						target="_blank"
						rel="noopener noreferrer"
					>
						CreativeDemos
					</a>
					<Link
						to="/rects"
						className="hover:text-[--AC] transition-colors"
					>
						RandomRects
					</Link>
				</div>
			</div>
		</footer>
	);
}
