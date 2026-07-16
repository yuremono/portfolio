import { type ReactNode } from "react";
import { createPortal } from "react-dom";

interface LoadingLayerProps {
	active?: boolean;
	children?: ReactNode;
	className?: string;
	opacity: number;
	portalTarget?: Element | DocumentFragment | null;
	text?: ReactNode;
	textOpacity?: number;
	textShiftVw?: number;
}

function LoadingLayerContent({
	active = true,
	children,
	className = "",
	opacity,
	text,
	textOpacity = opacity,
	textShiftVw = 0,
}: Omit<LoadingLayerProps, "portalTarget">) {
	const loadingLayer = (
		<div
			data-l="LoadingLayer"
			aria-hidden="true"
			className={`Eng fixed inset-0 z-[1000]  text-[var(--BK70)] transition-opacity duration-[1500ms] ease-out ${
				active ? "pointer-events-auto" : "pointer-events-none"
			} ${className}`}
			style={{ opacity }}
		>
			<div data-l="LoadingStage" className="relative h-full w-full">
				{text != null ? (
					<div
						data-l="LoadingValue"
						className="absolute left-1/2 top-1/2 z-[1] text-[clamp(2.5rem,6vw,5.75rem)] italic leading-none transition-[transform,opacity] duration-[1000ms] ease-out"
						style={{
							opacity: textOpacity,
							transform: `translate(-50%, -50%) translateX(${textShiftVw}vw)`,
						}}
					>
						{text}
					</div>
				) : null}
				{children}
			</div>
		</div>
	);

	return loadingLayer;
}

export function LoadingLayer({ portalTarget, ...props }: LoadingLayerProps) {
	const loadingLayer = <LoadingLayerContent {...props} />;

	return portalTarget ? createPortal(loadingLayer, portalTarget) : loadingLayer;
}
