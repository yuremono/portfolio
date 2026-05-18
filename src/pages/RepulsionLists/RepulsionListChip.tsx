import {
	useEffect,
	useMemo,
	useRef,
	type ReactNode,
	type CSSProperties,
} from "react";
import { Link } from "react-router-dom";
import { deterministicNoise, px } from "./utils";

export function RepulsionListChip({
	title,
	to,
	href,
	index = 0,
	className,
	active = false,
	onActivate,
	onClose,
	children,
}: {
	title: string;
	to?: string;
	href?: string;
	index?: number;
	className?: string;
	active?: boolean;
	onActivate?: (id: string) => void;
	onClose?: (id: string) => void;
	children?: ReactNode;
}) {
	const rootRef = useRef<HTMLLIElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);
	const timerRef = useRef<number | null>(null);
	const closeTimerRef = useRef<number | null>(null);
	const id = `repulsion-list-item-${index}`;
	const jitter = useMemo(() => {
		const x = deterministicNoise(index, 1);
		const y = deterministicNoise(index, 2);
		return {
			x: (x - 0.5) * -10,
			y: (y - 0.5) * -10,
		};
	}, [index]);

	const clearTimers = () => {
		if (timerRef.current !== null) window.clearTimeout(timerRef.current);
		if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
		timerRef.current = null;
		closeTimerRef.current = null;
	};

	const open = () => {
		const node = rootRef.current;
		if (!node) return;
		clearTimers();
		onActivate?.(id);
		node.dispatchEvent(
			new CustomEvent("repulsion-list-chip:activate", {
				bubbles: true,
				detail: { tagId: id },
			}),
		);
	};

	const close = () => {
		clearTimers();
		onClose?.(id);
	};

	const delayOpen = () => {
		clearTimers();
		timerRef.current = window.setTimeout(() => {
			open();
			timerRef.current = null;
		}, 50);
	};

	const emitFocus = () => {
		const node = rootRef.current;
		if (!node) return;
		const rect = node.getBoundingClientRect();
		node.dispatchEvent(
			new CustomEvent("repulsion-list-chip:focus", {
				bubbles: true,
				detail: {
					x: rect.left + rect.width / 2,
					y: rect.top + rect.height / 2,
				},
			}),
		);
	};

	useEffect(() => {
		const node = rootRef.current;
		const popup = popupRef.current;
		if (!node || !popup) return;

		if (active) {
			clearTimers();
			node.setAttribute("data-state", "active");
			popup.style.setProperty("--repulsion-list-chip-grid-rows", "1fr");
			return;
		}

		if (node.getAttribute("data-state") !== "active") return;
		clearTimers();
		node.setAttribute("data-state", "closing");
		popup.style.setProperty("--repulsion-list-chip-grid-rows", "0fr");
		closeTimerRef.current = window.setTimeout(() => {
			node.setAttribute("data-state", "idle");
			popup.style.removeProperty("--repulsion-list-chip-grid-rows");
			closeTimerRef.current = null;
		}, 400);
	}, [active]);

	useEffect(() => clearTimers, []);

	const controlProps = {
		onFocus: () => {
			emitFocus();
			open();
		},
		onBlur: close,
	};

	return (
		<li
			ref={rootRef}
			data-repulsion-list-chip="true"
			data-repulsion-list-item-id={id}
			data-state="idle"
			data-jitter-x={jitter.x.toFixed(2)}
			data-jitter-y={jitter.y.toFixed(2)}
			className={["repulsion-list-chip relative list-none bg-WH", className].filter(Boolean).join(" ")}
			style={
				{
					transform: `translate(${px(jitter.x * 10)}, ${px(jitter.y * 0)})`,
				} as CSSProperties
			}
			onMouseEnter={delayOpen}
			onMouseLeave={close}
		>
			<div className="repulsion-list-chip-control">
				{to ? (
					<Link to={to} {...controlProps}>
						<div className="repulsion-list-chip-content [font-size:clamp(2rem,_5vw,_5rem)] font-light">
							<span className="repulsion-list-chip-label block mx-auto p-4 whitespace-nowrap text-center bg-[repultion-list-light]">{title}</span>
						</div>
					</Link>
				) : href ? (
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						{...controlProps}
					>
						<div className="repulsion-list-chip-content [font-size:clamp(2rem,_5vw,_5rem)] font-light">
							<span className="repulsion-list-chip-label block mx-auto p-4 whitespace-nowrap text-center bg-[repultion-list-light] ">{title}</span>
						</div>
					</a>
				) : (
                                                <span className=" font-thin  z-10 leading-[1.25em] [font-size:calc(var(--mmFZ)*4.5)]">{title}</span>
				)}
				<div ref={popupRef} className="repulsion-list-chip-popup">
					{children}
				</div>
			</div>
		</li>
	);
}
