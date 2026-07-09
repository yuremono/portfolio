import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface NodeStackProps {
	children: React.ReactNode;
	className?: string;
	/** "curve" = 曲線で接続 / "angular" = 直角に曲がって接続 */
	variant?: "curve" | "angular";
}

type Point = { x: number; y: number };
type Side = "left" | "right";

const REACH = 90;

// var(--PX) を要素のカスケード上で解決し、px 値として計測する
function resolvePxVar(el: HTMLElement, varName: string): number {
	const probe = document.createElement("div");
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	probe.style.width = `var(${varName})`;
	el.appendChild(probe);
	const px = probe.getBoundingClientRect().width;
	el.removeChild(probe);
	return px;
}

function buildSegment(from: Point, to: Point, side: Side, variant: "curve" | "angular") {
	const dir = side === "right" ? 1 : -1;
	const fromMidX = from.x - REACH * dir;
	const toMidX = to.x + REACH * dir;

	if (variant === "angular") {
		return `L${fromMidX},${from.y} L${toMidX},${to.y} L${to.x},${to.y}`;
	}

	return `C${fromMidX},${from.y} ${toMidX},${to.y} ${to.x},${to.y}`;
}

export function NodeStack({ children, className, variant = "curve" }: NodeStackProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const pathRef = useRef<SVGPathElement>(null);
	const [d, setD] = useState("");
	const [pathLength, setPathLength] = useState(0);
	const [points, setPoints] = useState<Point[]>([]);

	useLayoutEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const items = Array.from(root.querySelectorAll<HTMLElement>(".item"));
		if (items.length < 2) return;

		const updatePath = () => {
			const rootBox = root.getBoundingClientRect();
			// :nth-child(odd) は右端から --PX、:nth-child(even) は左端から --PX の位置を接続点にする
			const anchors: Point[] = items.map((item, index) => {
				const box = item.getBoundingClientRect();
				const y = box.top + box.height / 2 - rootBox.top;
				const isOdd = index % 2 === 0;
				const px = resolvePxVar(item, "--PX");

				if (isOdd) {
					return { x: box.right - rootBox.left - px, y };
				}
				return { x: box.left - rootBox.left + px, y };
			});

			let path = `M${anchors[0].x},${anchors[0].y} `;
			anchors.slice(0, -1).forEach((from, i) => {
				const to = anchors[i + 1];
				const side: Side = i % 2 === 0 ? "right" : "left";
				path += buildSegment(from, to, side, variant) + " ";
			});
			setD(path.trim());
			setPoints(anchors);
		};

		updatePath();

		// 画像の非同期ロード等で .item のサイズ・位置が後から変わるケースに追従する
		const observer = new ResizeObserver(updatePath);
		items.forEach((item) => observer.observe(item));

		return () => observer.disconnect();
	}, [children, variant]);

	// d の更新のたびにパス全長を測り直し、非表示状態（未描画）にリセットする
	useLayoutEffect(() => {
		const path = pathRef.current;
		if (!path || !d) return;
		const length = path.getTotalLength();
		setPathLength(length);
		path.style.transition = "none";
		path.style.strokeDasharray = String(length);
		path.style.strokeDashoffset = String(length);
	}, [d]);

	// 画面内に入ったら描画、出たらリセットして次回の再突入に備える
	// 上スクロールで（上端から）再突入した場合は逆方向（終点→始点）に描く
	useEffect(() => {
		const root = rootRef.current;
		const path = pathRef.current;
		if (!root || !path || !pathLength) return;

		let lastScrollY = window.scrollY;
		let direction: "down" | "up" = "down";
		const onScroll = () => {
			const y = window.scrollY;
			if (y !== lastScrollY) {
				direction = y > lastScrollY ? "down" : "up";
				lastScrollY = y;
			}
		};
		window.addEventListener("scroll", onScroll, { passive: true });

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					const hiddenOffset = direction === "up" ? -pathLength : pathLength;
					path.style.transition = "none";
					path.style.strokeDashoffset = String(hiddenOffset);
					// transition を切った状態を一度確定させてから再度有効化する（強制リフロー）
					void path.getBoundingClientRect();
					path.style.transition = "stroke-dashoffset var(--pathTrans)";
					path.style.strokeDashoffset = "0";
				} else {
					path.style.transition = "none";
					path.style.strokeDashoffset = String(pathLength);
				}
			},
			{ threshold: 0.2 },
		);
		observer.observe(root);

		return () => {
			window.removeEventListener("scroll", onScroll);
			observer.disconnect();
		};
	}, [pathLength]);

	return (
		<div ref={rootRef} className={`NodeStack relative ${className ?? ""}`}>
			{children}
			<svg
				className="z-10 absolute inset-0 w-full h-full overflow-visible pointer-events-none mix-blend-difference"
				aria-hidden
			>
				<path
					ref={pathRef}
					d={d}
					fill="none"
					stroke="var(--pathC)"
					strokeWidth={2}
					strokeLinecap="round"
				/>
				{points.map((point, i) => (
					<circle
						key={i}
						cx={point.x}
						cy={point.y}
						r={8}
						fill="var(--fillC)"
						stroke="var(--strokeC)"
						strokeWidth={2}
					/>
				))}
			</svg>
		</div>
	);
}
