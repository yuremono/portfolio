import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

type PaintWorkletStatus = "idle" | "unsupported" | "loading" | "ready" | "error";
type HoudiniPaintStyle = CSSProperties & Record<`--${string}`, string | number>;
type HoudiniPaintTarget =
	| "backgroundImage"
	| "background"
	| "mask"
	| "borderImage";

interface CssPaintWorklet {
	addModule(moduleURL: string): Promise<void>;
}

interface HoudiniCSS {
	paintWorklet?: CssPaintWorklet;
}

export interface HoudiniPaintProps {
	workletUrl: string;
	paintName: string;
	paintTarget?: HoudiniPaintTarget;
	paintArgs?: string;
	className?: string;
	style?: HoudiniPaintStyle;
	children?: ReactNode;
	fallback?: ReactNode;
}

const loadedWorklets = new Map<string, Promise<void>>();

export function HoudiniPaint({
	workletUrl,
	paintName,
	paintTarget = "backgroundImage",
	paintArgs,
	className = "",
	style,
	children,
	fallback,
}: HoudiniPaintProps) {
	const [status, setStatus] = useState<PaintWorkletStatus>("idle");

	useEffect(() => {
		let isMounted = true;
		const houdiniCSS = globalThis.CSS as HoudiniCSS | undefined;

		if (!houdiniCSS?.paintWorklet) {
			setStatus("unsupported");
			return;
		}

		setStatus("loading");
		const workletPromise = loadedWorklets.get(workletUrl) ?? houdiniCSS.paintWorklet.addModule(workletUrl);
		loadedWorklets.set(workletUrl, workletPromise);

		workletPromise
			.then(() => {
				if (isMounted) {
					setStatus("ready");
				}
			})
			.catch(() => {
				loadedWorklets.delete(workletUrl);
				if (isMounted) {
					setStatus("error");
				}
			});

		return () => {
			isMounted = false;
		};
	}, [workletUrl]);

	const mergedStyle = useMemo<CSSProperties>(
		() => {
			if (status !== "ready") {
				return { ...style };
			}

			const paintValue = `paint(${[paintName, paintArgs].filter(Boolean).join(", ")})`;

			if (paintTarget === "background") {
				return { ...style, background: paintValue };
			}

			if (paintTarget === "mask") {
				return {
					...style,
					maskImage: paintValue,
					WebkitMaskImage: paintValue,
				};
			}

			if (paintTarget === "borderImage") {
				return { ...style, borderImage: `${paintValue} 0 fill` };
			}

			return { ...style, backgroundImage: paintValue };
		},
		[paintArgs, paintName, paintTarget, status, style],
	);

	return (
		<div
			className={className}
			data-houdini-status={status}
			style={mergedStyle}
		>
			{status === "ready" || !fallback ? children : fallback}
		</div>
	);
}
