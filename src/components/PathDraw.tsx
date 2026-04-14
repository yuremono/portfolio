import React, { useCallback, useLayoutEffect, useRef } from "react";
import {
	computePathDrawStrokeStyleFromLayout,
	getSvgPathLength,
	readPathDrawLayoutState,
} from "../lib/effects/pathDrawMath";

export interface PathDrawProps {
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
	/** 線として扱う要素（既定: path） */
	pathSelector?: string;
	/** true のときスクロール連動を行わない */
	paused?: boolean;
	/**
	 * 何フレームに 1 回だけ stroke を更新するか（負荷と滑らかさのトレードオフ）。
	 * 1 = 毎フレーム（最も滑らか・負荷最大寄り）。4 など大きくすると更新はおおよそ 1/N に減る。
	 */
	frameStride?: number;
}

/**
 * DrawSVG 相当を stroke-dasharray / stroke-dashoffset で再現。
 * ラッパーに .PathDraw（--PDS / --PES / --PVM）を付与し SCSS と整合。
 */
const PathDraw = ({
	className = "",
	style,
	children,
	pathSelector = "path",
	paused = false,
	// 既定は 1（毎フレーム）。負荷試験は 4 や 8 などに変更して比較する。
	frameStride = 2,
}: PathDrawProps) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const rafIdRef = useRef<number | null>(null);
	const strideCounterRef = useRef(0);
	const dirtyRef = useRef(false);

	const updateStroke = useCallback(() => {
		const root = rootRef.current;
		if (!root || paused) {
			return;
		}

		const paths = root.querySelectorAll<SVGPathElement>(pathSelector);
		if (!paths.length) {
			return;
		}

		const layout = readPathDrawLayoutState(root);
		paths.forEach((path) => {
			const len = getSvgPathLength(path);
			const s = computePathDrawStrokeStyleFromLayout(layout, len);
			path.style.strokeDasharray = s.strokeDasharray;
			path.style.strokeDashoffset = s.strokeDashoffset;
		});
	}, [pathSelector, paused]);

	useLayoutEffect(() => {
		if (paused) return;

		// 1 未満は 1 扱い（整数に丸めて間引き幅を決める）
		const stride = Math.max(1, Math.floor(frameStride));

		const cancelScheduledRaf = () => {
			if (rafIdRef.current != null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
		};

		const scheduleLoop = () => {
			if (rafIdRef.current != null) return;
			rafIdRef.current = requestAnimationFrame(loop);
		};

		const loop = () => {
			rafIdRef.current = null;
			if (!dirtyRef.current) {
				return;
			}

			if (stride > 1) {
				strideCounterRef.current += 1;
				if (strideCounterRef.current < stride) {
					rafIdRef.current = requestAnimationFrame(loop);
					return;
				}
				strideCounterRef.current = 0;
			}

			updateStroke();
			dirtyRef.current = false;
			// この後もスクロールが続けば onScroll が再度 dirty を立てて scheduleLoop する
		};

		const onScroll = () => {
			dirtyRef.current = true;
			scheduleLoop();
		};

		// リサイズはレイアウトが変わるため間引きせず即時更新（見た目のズレ防止）
		const onResize = () => {
			cancelScheduledRaf();
			strideCounterRef.current = 0;
			dirtyRef.current = false;
			updateStroke();
		};

		// スクロール終了時は最新位置で必ず 1 回描く（間引き中の取り残し防止）
		const flushNow = () => {
			cancelScheduledRaf();
			strideCounterRef.current = 0;
			dirtyRef.current = false;
			updateStroke();
		};

		const supportsScrollEnd = typeof window !== "undefined" && "onscrollend" in window;

		updateStroke();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);
		if (supportsScrollEnd) {
			window.addEventListener("scrollend", flushNow, { passive: true });
		}

		return () => {
			cancelScheduledRaf();
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			if (supportsScrollEnd) {
				window.removeEventListener("scrollend", flushNow);
			}
		};
	}, [paused, updateStroke, frameStride]);

	return (
		<div
			ref={rootRef}
			className={`PathDraw ${className}`}
			style={style}
			role="presentation"
		>
			{children}
		</div>
	);
};

export { PathDraw };
