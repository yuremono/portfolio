import { Link } from "react-router-dom";

type FooterProps = {
	className?: string;
};

export function Footer({ className }: FooterProps) {
	return (
		<footer
			className={[
				"Wrap into bg-[--TC] text-white",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="text-center font-medium Eng ">
				<p className="mb-0 font-bold   text-[length:var(--logoFZ)]">
					yuremono works
				</p>
				<div className="space-x-4">
					
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
