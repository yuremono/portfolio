import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
} from "react";

function getScrollY(): number {
	if (typeof window === "undefined") return 0;
	return (
		window.scrollY ||
		window.pageYOffset ||
		document.documentElement.scrollTop ||
		0
	);
}

interface ScrollXSectionProps {
	className?: string;
	children: React.ReactNode;
}

/**
 * `.ScrollX` ルート先頭がビューポート上端に来てから、縦スクロール分だけ横送り（translateX）を進める。
 * 右端到達後は通常の垂直スクロールに戻る。ホバー / wheel の乗っ取りは使わない。
 */
export function ScrollXSection({ className = "", children }: ScrollXSectionProps) {
	const rootRef = useRef<HTMLDivElement | null>(null);
	/** 旧 viewport + track を兼ねる 1 枚（sticky・横 flex・transform の対象） */
	const scrollLayerRef = useRef<HTMLDivElement | null>(null);
	const spacerRef = useRef<HTMLDivElement | null>(null);
	const maxXRef = useRef(0);
	const rafRef = useRef<number | null>(null);

	const applyTransform = useCallback(() => {
		const root = rootRef.current;
		const layer = scrollLayerRef.current;
		if (!root || !layer) return;

		const y = getScrollY();
		const r = root.getBoundingClientRect();
		// ルート上端の文書上の Y（r.top + y は常に同一点を指す）
		const yDoc = r.top + y;
		const H = maxXRef.current;
		const t = y - yDoc;
		const tx = -Math.max(0, Math.min(H, t));
		layer.style.transform = `translate3d(${tx}px,0,0)`;
	}, []);

	const schedule = useCallback(() => {
		if (rafRef.current != null) return;
		rafRef.current = window.requestAnimationFrame(() => {
			rafRef.current = null;
			applyTransform();
		});
	}, [applyTransform]);

	const measure = useCallback(() => {
		const layer = scrollLayerRef.current;
		const sp = spacerRef.current;
		if (!layer || !sp) return;
		const w = layer.clientWidth;
		const next =
			layer.scrollWidth - w > 0 ? layer.scrollWidth - w : 0;
		maxXRef.current = next;
		sp.style.height = `${next}px`;
		applyTransform();
	}, [applyTransform]);

	/** 初回レイアウト・フォント直後用に 1 フレーム遅延でもう一度測る */
	useLayoutEffect(() => {
		measure();
		const id2 = requestAnimationFrame(() => {
			measure();
		});
		return () => cancelAnimationFrame(id2);
	}, [measure]);

	useEffect(() => {
		const onScroll = () => {
			schedule();
		};

		const ro = new ResizeObserver(() => {
			measure();
		});
		if (rootRef.current) {
			ro.observe(rootRef.current);
		}
		if (scrollLayerRef.current) {
			ro.observe(scrollLayerRef.current);
		}
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", measure, { passive: true });

		return () => {
			ro.disconnect();
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", measure);
			if (rafRef.current != null) {
				window.cancelAnimationFrame(rafRef.current);
			}
		};
	}, [measure, schedule]);

	return (
		<div
			ref={rootRef}
			className={["ScrollX", className].filter(Boolean).join(" ")}
		>
			<div
				ref={scrollLayerRef}
				className="ScrollTrack"
			>
				{children}
			</div>
			<div
				ref={spacerRef}
				className="ScrollSpacer"
				aria-hidden
			/>
		</div>
	);
}
