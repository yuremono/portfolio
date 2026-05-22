import {
	Children,
	cloneElement,
	isValidElement,
	type CSSProperties,
	type PointerEvent,
	type ReactElement,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";
import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { Footer } from "../components/Footer";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";

/*
 * GridCarousel
 *   Layouts:
 *     sm: 2 × 3、visible 5、中央は 1 マス
 *     md: 3 × 3、visible 7、中央は 2 列結合
 *     lg: 4 × 3、visible 10、中央は 2 列結合
 *
 *   Slot 順（時計回り、右下始まり）:
 *     layout ごとの positions を順番に使う
 *
 *   Cell i の slot (N = <Cell> の個数, N >= 11 を想定):
 *     rawSlot = LAST_SLOT - i + step
 *     slot    = ((rawSlot % N) + N) % N   // 0..N を循環
 *
 *   slot の表示規則:
 *     [0, LAST_SLOT]           : positions で通常表示 (z=3, opacity 1)
 *     (LAST_SLOT, LAST_SLOT+1] : 退場中 exitTarget へ線形補間 (z=0, opacity 1)
 *     (LAST_SLOT+1, N-1)       : 画面外待機 [2, cols]（opacity 0）
 *     [N-1, N)                 : 入場中 [2, cols]→[2, cols-1]（z=2, opacity 1）
 *
 *   右下の背景マスクを z=1 で常駐させ、
 *   入場セル(z=2) > 背景マスク(z=1) > 退場セル(z=0) の重なりで
 *   退場セルが「新しく出現したセルの下に潜り込む」演出を実現する。
 */

type Pos = readonly [row: number, col: number];

type Breakpoint = "sm" | "md" | "lg";

type Layout = {
	readonly cols: number;
	readonly positions: readonly Pos[];
	readonly mergedColSpan: number;
	readonly exitTarget: Pos;
};

const LAYOUTS = {
	sm: {
		cols: 2,
		positions: [
			[2, 1],
			[2, 0],
			[1, 0],
			[0, 0],
			[0, 1],
		] as const,
		mergedColSpan: 1,
		exitTarget: [0, 2] as const,
	},
	md: {
		cols: 3,
		positions: [
			[2, 2],
			[2, 1],
			[2, 0],
			[1, 0],
			[0, 0],
			[0, 1],
			[0, 2],
		] as const,
		mergedColSpan: 2,
		exitTarget: [0, 3] as const,
	},
	lg: {
		cols: 4,
		positions: [
			[2, 3],
			[2, 2],
			[2, 1],
			[2, 0],
			[1, 0],
			[0, 0],
			[0, 1],
			[0, 2],
			[0, 3],
			[1, 3],
		] as const,
		mergedColSpan: 2,
		exitTarget: [2, 3] as const,
	},
} as const satisfies Record<Breakpoint, Layout>;

const SCROLL_SENSITIVITY = 300;
const SWIPE_SENSITIVITY = 160;

type CellStyle = {
	row: number;
	col: number;
	opacity: number;
	z: number;
};

function useBreakpoint(): Breakpoint {
	const [breakpoint, setBreakpoint] = useState<Breakpoint>("lg");

	useEffect(() => {
		if (typeof window === "undefined") return;

		const lgQuery = window.matchMedia("(min-width: 1024px)");
		const mdQuery = window.matchMedia("(min-width: 768px)");

		const updateBreakpoint = () => {
			if (lgQuery.matches) {
				setBreakpoint("lg");
				return;
			}

			if (mdQuery.matches) {
				setBreakpoint("md");
				return;
			}

			setBreakpoint("sm");
		};

		updateBreakpoint();
		lgQuery.addEventListener("change", updateBreakpoint);
		mdQuery.addEventListener("change", updateBreakpoint);

		return () => {
			lgQuery.removeEventListener("change", updateBreakpoint);
			mdQuery.removeEventListener("change", updateBreakpoint);
		};
	}, []);

	return breakpoint;
}

function computeCellStyle(slot: number, cellCount: number, layout: Layout): CellStyle {
	const lastSlot = layout.positions.length - 1;

	if (slot <= lastSlot) {
		const a = Math.floor(slot);
		const b = Math.min(a + 1, lastSlot);
		const t = slot - a;
		const [rA, cA] = layout.positions[a];
		const [rB, cB] = layout.positions[b];
		return {
			row: rA + (rB - rA) * t,
			col: cA + (cB - cA) * t,
			opacity: 1,
			z: 3,
		};
	}

	if (slot <= lastSlot + 1) {
		const t = slot - lastSlot;
		const [startRow, startCol] = layout.positions[lastSlot];
		const [endRow, endCol] = layout.exitTarget;
		return {
			row: startRow + (endRow - startRow) * t,
			col: startCol + (endCol - startCol) * t,
			opacity: 1,
			z: 0,
		};
	}

	if (slot < cellCount - 1) {
		return { row: 2, col: layout.cols, opacity: 0, z: 0 };
	}

	const t = slot - (cellCount - 1);
	return { row: 2, col: layout.cols - t, opacity: 1, z: 2 };
}

function wrap(value: number, mod: number): number {
	return ((value % mod) + mod) % mod;
}

/* セル定義用マーカー。中身を children として受け取るだけで、
   実際の描画は Carousel 側で行うため Cell 自体は何もレンダリングしない。
   → <Cell>...</Cell> の中には自由な DOM を複数そのまま並べられる。 */
type CellProps = { children?: ReactNode };
export function Cell({ children }: CellProps) {
	return <>{children}</>;
}

/* Carousel。children の中から <Cell> を順番に抽出してスロット配置する。
   Cell 以外の要素（中央結合セルなど）はそのまま section 内に描画する。 */
type CarouselProps = { children?: ReactNode };

function Carousel({ children }: CarouselProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const pointerRef = useRef<{
		id: number;
		x: number;
		y: number;
	} | null>(null);
	const [step, setStep] = useState(0);
	const breakpoint = useBreakpoint();
	const layout = LAYOUTS[breakpoint];

	const cellContents: ReactNode[] = [];
	const others: ReactNode[] = [];
	Children.forEach(children, (child) => {
		if (isValidElement(child) && child.type === Cell) {
			cellContents.push((child as ReactElement<CellProps>).props.children);
		} else {
			others.push(child);
		}
	});
	const cellCount = cellContents.length;
	const mergedCellIndex = others.findIndex(isValidElement);

	useEffect(() => {
		const el = sectionRef.current;
		if (!el || cellCount === 0) return;
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const delta = e.deltaY + e.deltaX;
			setStep((prev) => wrap(prev + delta / SCROLL_SENSITIVITY, cellCount));
		};
		el.addEventListener("wheel", onWheel, { passive: false });
		return () => el.removeEventListener("wheel", onWheel);
	}, [cellCount]);

	const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
		if (event.pointerType === "mouse") return;
		pointerRef.current = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
		const pointer = pointerRef.current;
		if (!pointer || pointer.id !== event.pointerId || cellCount === 0) return;
		event.preventDefault();

		const dx = event.clientX - pointer.x;
		const dy = event.clientY - pointer.y;
		const primaryDelta = Math.abs(dx) >= Math.abs(dy) ? -dx : dy;
		if (primaryDelta === 0) return;

		pointerRef.current = {
			...pointer,
			x: event.clientX,
			y: event.clientY,
		};
		setStep((prev) => wrap(prev + primaryDelta / SWIPE_SENSITIVITY, cellCount));
	};

	const handlePointerEnd = (event: PointerEvent<HTMLElement>) => {
		const pointer = pointerRef.current;
		if (!pointer || pointer.id !== event.pointerId) return;
		pointerRef.current = null;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	};

	const mergedCellStyle: CSSProperties = {
		top: "calc(var(--gap) + (var(--ch) + var(--gap)) * 1)",
		left: `calc(var(--gap) + 1 * (var(--cw) + var(--gap)))`,
		width: `calc(var(--cw) * ${layout.mergedColSpan} + var(--gap) * ${layout.mergedColSpan - 1})`,
		height: "var(--ch)",
	};

	const maskStyle: CSSProperties = {
		top: "calc(var(--gap) + 2 * (var(--ch) + var(--gap)/2))",
		left: `calc(var(--gap) + ${layout.cols - 1} * (var(--cw) + var(--gap)))`,
	};

	return (
		<section
			ref={sectionRef}
			className="
				relative h-full w-full p-[--gap] out
				touch-none select-none
				[--cols:2] md:[--cols:3] lg:[--cols:4]
				[--cw:calc((100vw-var(--gap)*(var(--cols)+1))/var(--cols))]
				[--ch:calc((100svh-var(--gap)*4)/3)]
				[--rad:0.5rem]
				[--gap:1em]
				[--mascBG:--background]
			"
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerEnd}
			onPointerCancel={handlePointerEnd}
		>
			{others.map((child, index) => {
				if (!isValidElement(child) || index !== mergedCellIndex) {
					return child;
				}

				const mergedCellElement = child as ReactElement<{
					style?: CSSProperties;
				}>;

				return cloneElement(mergedCellElement, {
					style: {
						...mergedCellElement.props.style,
						...mergedCellStyle,
					},
				});
			})}

			{/* 右下 [2,3] の背景マスク（退場セルが下に潜り込み、入場セルは上に乗る） */}
			<div
				aria-hidden
				className="absolute z-[1] w-[--cw] h-[calc(var(--ch)+var(--gap))]  bg-[--mascBG]"
				style={maskStyle}
			/>

			{cellContents.map((content, i) => {
				const slot = wrap(layout.positions.length - 1 - i + step, cellCount);
				const { row, col, opacity, z } = computeCellStyle(slot, cellCount, layout);
				return (
					<div
						key={i}
						className="absolute w-[--cw] h-[--ch] rounded-[--rad] bg-[--background] BorderXY overflow-hidden  "
						style={{
							top: `calc(var(--gap) + ${row} * (var(--ch) + var(--gap)))`,
							left: `calc(var(--gap) + ${col} * (var(--cw) + var(--gap)))`,
							opacity,
							zIndex: z,
							willChange: "top, left, opacity",
						}}
					>
						{content}
					</div>
				);
			})}
		</section>
	);
}

function GridCarousel() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass("");

	return (
		<PageRoot ref={pageRootRef}>
			<Header className="LinkShadow  " />

			<main className="h-[100svh] overflow-hidden">
				<Carousel>
					{/* 中央結合セル（固定・回転対象外） */}
					<div className="absolute z-[4] rounded-[--rad]  flex items-center justify-center text-center p-[--gap]">
						<div>
							<h2 className="mb-2">Grid Carousel</h2>
							<p className="text-sm">中央結合セル</p>
						</div>
					</div>

					{/* セル定義 — <Cell> の中は自由な DOM。複数タグを並べても OK。
					    個数を増減すれば循環ループも自動で追従する (N >= 11 を想定)。 */}
					<Cell>
						<h2 className="text-center">FIRST</h2>
						<img
							src={getAssetPath("/images/picsum/001.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/002.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/003.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/004.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
                                        <Cell>
						<h2 className="text-center">5.tailwind md-bp last</h2>
                                                
						<img
							src={getAssetPath("/images/picsum/005.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
                                        <Cell>
						<img
							src={getAssetPath("/images/picsum/006.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
                                        <Cell>
						<h2 className="text-center">7.tailwind lg-bp last</h2>
						<img
							src={getAssetPath("/images/picsum/007.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/008.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
                                        <Cell>
						<h2 className="text-center">No.10</h2>
                                                
						<img
							src={getAssetPath("/images/picsum/009.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
                                        <Cell>
						<h2 className="text-center">11.Desktop last</h2>
						<img
							src={getAssetPath("/images/picsum/010.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
                                        <Cell>
                                                
						<img
							src={getAssetPath("/images/picsum/011.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/012.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/013.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
                                        <Cell>
						<h2 className="text-center">No.15</h2>
						<img
							src={getAssetPath("/images/picsum/014.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/015.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/016.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/017.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/018.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/019.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
					<Cell>
						<img
							src={getAssetPath("/images/picsum/020.jpg")}
							alt=""
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</Cell>
				</Carousel>
			</main>

			<Footer />
		</PageRoot>
	);
}

export default GridCarousel;
