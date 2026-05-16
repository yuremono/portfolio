import { useCallback, useEffect, useRef } from "react";
// import {
// 	// Moon,
// 	// Sun,
// 	CaretRightIcon,
// 	// CaretDownIcon,
// 	// XIcon,
// 	// ListPlusIcon,
// 	// ArrowSquareOutIcon,
// } from "@phosphor-icons/react";

interface BunmyakuTeaserSectionProps {
	className?: string;
}

const COLOR_SCHEME = {
	"--background": "oklch(0.16 0.055 255)",
	"--foreground": "oklch(0.91 0.02 235)",
	"--MC": "oklch(0.16 0.055 255)",
	"--SC": "oklch(0.22 0.9 188)",
	"--AC": "oklch(0.45 0.9 188)",
	"--BC": "oklch(0.115 0.035 255)",
	"--TC": "oklch(0.91 0.02 255)",
	"--GR": "oklch(0.62 0.025 255)",
	"--Eng": "var(--Ship)",
	"--HFF": "var(--Ship)",
} as const;

const CANVAS_COLOR = {
	// 通常時の canvas 色。既存変数は参照せず、--BC と同じベージュ寄りの色を直接指定します。
	base: "oklch(99% 0.005 60)",
	// COLOR_SCHEME が有効な間だけ使う canvas 色。以前の --foreground と同じ色です。
	active: "oklch(0.9 0.02 235)",
} as const;
const VIEWBOX = 1000;
const FRAGMENT_STEP = 2;
const CANVAS_MAX_DPR = 2;
const FRAGMENT_SKIP_WHEN_FILL_OPACITY = 0.82;

const TIMELINE = {
	// 断片を見せ始める位置。0 より大きくすると、セクションに入った直後は何も出ません。
	fragmentIntroStart: 0.02,
	// 断片が見え始めてから本来の濃さになるまでの長さ。
	fragmentIntroLength: 0.52,
	// 断片がアウトラインへ戻り切る位置。小さいほど早く集合します。
	gatherEnd: 0.4,
	// 断片収束のカーブ。1 は直線、2〜3 は後半で加速、4 以上はかなり極端です。
	gatherPower: 2,
	// fill の開始位置。終了位置は 1.0 固定なので、小さいほど長く満たされます。
	fillStart: 0.38,
	// fill が見え始めてから不透明になるまでの長さ。短いほど早く濃くなります。
	fillFadeLength: 1,
	// 断片アウトラインを薄くし始める位置。fill と重ねて見せるため後半寄りにしています。
	fragmentFadeStart: 0.3,
	// 最後に残す断片アウトラインの濃さ。0 で完全に消え、0.18 なら少し残ります。
	fragmentFinalOpacity: 0.0,
} as const;

const COLOR_SCHEME_INTERSECTION = {
	// IntersectionObserver の root。null は viewport を基準にします。
	root: null,
	// IntersectionObserver の rootMargin。例: "0px 0px -20% 0px" で下端の判定を上へ寄せます。
	rootMargin: "0% 0px 75% 0px",
	// threshold の分割数。多いほど細かく通知されます。
	thresholdSteps: 10,
	// セクションが viewport 高さに対してこの割合以上見えている間だけ配色を適用します。
	activeBoundary: 0.5,
} as const;

interface InkBlob {
	x: number;
	y: number;
	radius: number;
	blur: number;
	delay: number;
}

interface OutlineFragment {
	sourceX: number;
	sourceY: number;
	size: number;
	startX: number;
	startY: number;
	targetX: number;
	targetY: number;
	opacity: number;
	delay: number;
}

interface ParticleField {
	font: string;
	mask: HTMLCanvasElement;
	coloredMasks: Map<string, HTMLCanvasElement>;
	fragments: OutlineFragment[];
	inkBlobs: InkBlob[];
}

function clamp01(value: number) {
	return Math.min(1, Math.max(0, value));
}

function easeOutCubic(value: number) {
	return 1 - (1 - value) ** 3;
}

function easeInPower(value: number, power: number) {
	return value ** power;
}

function progressBetween(value: number, start: number, end: number) {
	return clamp01((value - start) / (end - start));
}

function randomFromIndex(index: number) {
	const value = Math.sin(index * 12.9898) * 43758.5453;
	return value - Math.floor(value);
}

function resolveShipFont() {
	if (typeof window === "undefined") return "serif";

	const rootStyle = getComputedStyle(document.documentElement);
	const ship = rootStyle.getPropertyValue("--Ship").trim();
	return ship || '"Shippori Mincho", serif';
}

function resolveForegroundColor() {
	if (typeof window === "undefined") return "oklch(0.91 0.02 235)";

	const rootStyle = getComputedStyle(document.documentElement);
	return (
		rootStyle.getPropertyValue("--foreground").trim() ||
		"oklch(0.91 0.02 235)"
	);
}

function createParticleField(font: string): ParticleField {
	const mask = document.createElement("canvas");
	mask.width = VIEWBOX;
	mask.height = VIEWBOX;

	const maskCtx = mask.getContext("2d", { willReadFrequently: true });
	if (!maskCtx) {
		return { font, mask, coloredMasks: new Map(), fragments: [], inkBlobs: [] };
	}

	maskCtx.clearRect(0, 0, VIEWBOX, VIEWBOX);
	maskCtx.font = `940px ${font}`;
	maskCtx.lineWidth = 1.25;
	maskCtx.miterLimit = 2;
	maskCtx.strokeStyle = "#000";
	maskCtx.textAlign = "center";
	maskCtx.textBaseline = "middle";
	maskCtx.strokeText("文", VIEWBOX / 2, VIEWBOX / 2 + 48);

	const data = maskCtx.getImageData(0, 0, VIEWBOX, VIEWBOX).data;
	const fragments: OutlineFragment[] = [];

	for (let y = 0; y < VIEWBOX; y += FRAGMENT_STEP) {
		for (let x = 0; x < VIEWBOX; x += FRAGMENT_STEP) {
			let maxAlpha = 0;
			for (
				let yy = y;
				yy < Math.min(y + FRAGMENT_STEP, VIEWBOX);
				yy += 1
			) {
				for (
					let xx = x;
					xx < Math.min(x + FRAGMENT_STEP, VIEWBOX);
					xx += 1
				) {
					maxAlpha = Math.max(
						maxAlpha,
						data[(yy * VIEWBOX + xx) * 4 + 3],
					);
				}
			}
			if (maxAlpha <= 24) continue;

			const index = fragments.length;
			const angle = randomFromIndex(index + 11) * Math.PI * 2;
			const distance = 180 + randomFromIndex(index + 23) * 540;

			fragments.push({
				sourceX: x,
				sourceY: y,
				size: FRAGMENT_STEP,
				startX: x + Math.cos(angle) * distance,
				startY: y + Math.sin(angle) * distance,
				targetX: x,
				targetY: y,
				opacity: maxAlpha / 255,
				delay: randomFromIndex(index + 47) * 0.18,
			});
		}
	}

	const inkBlobs = [
		{ x: 255, y: 245, radius: 245, blur: 34, delay: 0 },
		{ x: 525, y: 235, radius: 250, blur: 42, delay: 0.08 },
		{ x: 765, y: 325, radius: 190, blur: 32, delay: 0.16 },
		{ x: 310, y: 650, radius: 205, blur: 38, delay: 0.24 },
		{ x: 560, y: 650, radius: 250, blur: 48, delay: 0.32 },
		{ x: 760, y: 610, radius: 165, blur: 30, delay: 0.4 },
		{ x: 430, y: 430, radius: 150, blur: 26, delay: 0.5 },
		{ x: 650, y: 465, radius: 135, blur: 24, delay: 0.6 },
	];

	return { font, mask, coloredMasks: new Map(), fragments, inkBlobs };
}

function createColoredMask(field: ParticleField, foreground: string) {
	const cachedMask = field.coloredMasks.get(foreground);
	if (cachedMask) return cachedMask;

	const coloredMask = document.createElement("canvas");
	coloredMask.width = field.mask.width;
	coloredMask.height = field.mask.height;

	const coloredMaskCtx = coloredMask.getContext("2d");
	if (!coloredMaskCtx) return null;

	coloredMaskCtx.fillStyle = foreground;
	coloredMaskCtx.fillRect(0, 0, coloredMask.width, coloredMask.height);
	coloredMaskCtx.globalCompositeOperation = "destination-in";
	coloredMaskCtx.drawImage(field.mask, 0, 0);
	field.coloredMasks.set(foreground, coloredMask);

	return coloredMask;
}

function drawInkFill(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	scale: number,
	tx: number,
	ty: number,
	font: string,
	foreground: string,
	inkBlobs: InkBlob[],
	progress: number,
	opacity: number,
) {
	const inkCanvas = document.createElement("canvas");
	inkCanvas.width = width;
	inkCanvas.height = height;

	const inkCtx = inkCanvas.getContext("2d");
	if (!inkCtx) return;

	inkCtx.setTransform(scale, 0, 0, scale, tx, ty);
	inkCtx.fillStyle = foreground;

	for (const blob of inkBlobs) {
		const blobProgress = easeOutCubic(
			clamp01((progress - blob.delay) / (1 - blob.delay)),
		);
		if (blobProgress <= 0) continue;

		inkCtx.save();
		inkCtx.globalAlpha = Math.min(1, 0.35 + blobProgress * 0.85);
		inkCtx.filter = `blur(${blob.blur * scale}px)`;
		inkCtx.beginPath();
		inkCtx.arc(
			blob.x,
			blob.y,
			blob.radius * (0.18 + blobProgress * 0.98),
			0,
			Math.PI * 2,
		);
		inkCtx.fill();
		inkCtx.restore();
	}

	inkCtx.globalCompositeOperation = "destination-in";
	inkCtx.filter = "none";
	inkCtx.font = `940px ${font}`;
	inkCtx.textAlign = "center";
	inkCtx.textBaseline = "middle";
	inkCtx.fillStyle = "#000";
	inkCtx.fillText("文", VIEWBOX / 2, VIEWBOX / 2 + 48);

	ctx.save();
	ctx.globalAlpha = opacity;
	ctx.drawImage(inkCanvas, 0, 0);
	ctx.restore();
}

export function BunmyakuTeaserSection({
	className,
}: BunmyakuTeaserSectionProps) {
	const rootRef = useRef<HTMLElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const particleFieldRef = useRef<ParticleField | null>(null);
	const colorSchemeActiveRef = useRef(false);

	const render = useCallback(() => {
		const canvas = canvasRef.current;
		const root = rootRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		const dpr = Math.min(window.devicePixelRatio || 1, CANVAS_MAX_DPR);
		const width = Math.max(1, Math.floor(rect.width * dpr));
		const height = Math.max(1, Math.floor(rect.height * dpr));

		if (canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
		}

		const size = width;
		const scale = size / VIEWBOX;
		const tx = 0;
		const ty = (height - size) / 2;
		const rootRect = root?.getBoundingClientRect();
		const viewportHeight = window.innerHeight || height;
		const scrollProgress = rootRect
			? clamp01(
					(viewportHeight - rootRect.top) /
						(viewportHeight + rootRect.height),
				)
			: 0;
		const gatherProgress = easeInPower(
			progressBetween(
				scrollProgress,
				TIMELINE.fragmentIntroStart,
				TIMELINE.gatherEnd,
			),
			TIMELINE.gatherPower,
		);
		const fragmentIntroOpacity = easeOutCubic(
			progressBetween(
				scrollProgress,
				TIMELINE.fragmentIntroStart,
				TIMELINE.fragmentIntroStart + TIMELINE.fragmentIntroLength,
			),
		);
		const fillProgress = easeOutCubic(
			progressBetween(scrollProgress, TIMELINE.fillStart, 1),
		);
		const fillOpacity = easeOutCubic(
			progressBetween(
				scrollProgress,
				TIMELINE.fillStart,
				TIMELINE.fillStart + TIMELINE.fillFadeLength,
			),
		);
		const fragmentFadeProgress = easeOutCubic(
			progressBetween(scrollProgress, TIMELINE.fragmentFadeStart, 1),
		);
		const fragmentOpacity =
			fragmentIntroOpacity *
			(1 - fragmentFadeProgress * (1 - TIMELINE.fragmentFinalOpacity));
		const font = resolveShipFont();
		const canvasColor = colorSchemeActiveRef.current
			? CANVAS_COLOR.active
			: CANVAS_COLOR.base;

		if (particleFieldRef.current?.font !== font) {
			particleFieldRef.current = createParticleField(font);
		}

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, width, height);

		if (fillProgress > 0) {
			drawInkFill(
				ctx,
				width,
				height,
				scale,
				tx,
				ty,
				font,
				canvasColor,
				particleFieldRef.current?.inkBlobs ?? [],
				fillProgress,
				fillOpacity,
			);
		}

		ctx.setTransform(scale, 0, 0, scale, tx, ty);

		const field = particleFieldRef.current;
		const coloredMask = field
			? createColoredMask(field, canvasColor)
			: null;
		if (
			field &&
			coloredMask &&
			fragmentOpacity > 0 &&
			fillOpacity < FRAGMENT_SKIP_WHEN_FILL_OPACITY
		) {
			for (const fragment of field.fragments) {
				const fragmentProgress = clamp01(
					(gatherProgress - fragment.delay) / (1 - fragment.delay),
				);
				const easedFragmentProgress = easeInPower(
					fragmentProgress,
					TIMELINE.gatherPower,
				);
				const x =
					fragment.startX +
					(fragment.targetX - fragment.startX) *
						easedFragmentProgress;
				const y =
					fragment.startY +
					(fragment.targetY - fragment.startY) *
						easedFragmentProgress;

				ctx.globalAlpha =
					fragment.opacity *
					(0.25 + fragmentProgress * 0.75) *
					fragmentOpacity;
				ctx.drawImage(
					coloredMask,
					fragment.sourceX,
					fragment.sourceY,
					fragment.size,
					fragment.size,
					x,
					y,
					fragment.size,
					fragment.size,
				);
			}
		}
		ctx.globalAlpha = 1;
	}, []);

	const scheduleRender = useCallback(() => {
		if (rafRef.current !== null) return;
		rafRef.current = window.requestAnimationFrame(() => {
			rafRef.current = null;
			render();
		});
	}, [render]);

	useEffect(() => {
		render();
		window.addEventListener("scroll", scheduleRender, { passive: true });
		window.addEventListener("resize", scheduleRender, { passive: true });

		const resizeObserver = new ResizeObserver(scheduleRender);
		if (canvasRef.current) resizeObserver.observe(canvasRef.current);

		document.fonts?.ready.then(() => {
			particleFieldRef.current = null;
			scheduleRender();
		});

		return () => {
			window.removeEventListener("scroll", scheduleRender);
			window.removeEventListener("resize", scheduleRender);
			resizeObserver.disconnect();
			if (rafRef.current !== null) {
				window.cancelAnimationFrame(rafRef.current);
			}
		};
	}, [render, scheduleRender]);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const previous = new Map<string, string>();
		let active = false;

		const applyScheme = () => {
			if (active) return;
			active = true;
			colorSchemeActiveRef.current = true;
			for (const key of Object.keys(COLOR_SCHEME) as Array<
				keyof typeof COLOR_SCHEME
			>) {
				previous.set(
					key,
					document.documentElement.style.getPropertyValue(key),
				);
				document.documentElement.style.setProperty(
					key,
					COLOR_SCHEME[key],
				);
			}
			scheduleRender();
		};

		const restoreScheme = () => {
			if (!active) return;
			active = false;
			colorSchemeActiveRef.current = false;
			for (const key of Object.keys(COLOR_SCHEME) as Array<
				keyof typeof COLOR_SCHEME
			>) {
				const value = previous.get(key);
				if (value) {
					document.documentElement.style.setProperty(key, value);
				} else {
					document.documentElement.style.removeProperty(key);
				}
			}
			previous.clear();
			scheduleRender();
		};

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				const rootHeight =
					entry.rootBounds?.height ?? window.innerHeight;
				const visible = entry.intersectionRect.height / rootHeight;

				if (
					entry.isIntersecting &&
					visible >= COLOR_SCHEME_INTERSECTION.activeBoundary
				) {
					applyScheme();
				} else {
					restoreScheme();
				}
			},
			{
				root: COLOR_SCHEME_INTERSECTION.root,
				rootMargin: COLOR_SCHEME_INTERSECTION.rootMargin,
				threshold: Array.from(
					{ length: COLOR_SCHEME_INTERSECTION.thresholdSteps + 1 },
					(_, index) =>
						index / COLOR_SCHEME_INTERSECTION.thresholdSteps,
				),
			},
		);

		observer.observe(root);

		return () => {
			observer.disconnect();
			restoreScheme();
		};
	}, [scheduleRender]);

	return (
		<section ref={rootRef} data-l="BunmyakuTeaser" className={className}>
			<div className="relative min-h-[125vw] [grid-area:1/1] max-w-[1680px] mx-auto">
				<div className="sticky h-100lvh top-0 xl:top-[-25%]  grid  place-items-center ">
					<canvas
						ref={canvasRef}
						className="block  w-full aspect-square"
						aria-hidden
					/>
				</div>
			</div>
			<div className="relative z-10  PX [grid-area:1/1] h3FZ [font-family:--HFF]">
				<div className="w-fit max-w-[--wid] mx-auto py-[50lvh] ">
					<h2 className=" h2FZ HFF"># 文脈.app</h2>
					<p className="mx-auto mt-8 ">
						## SPEC.md, DESIGN.md, AGENTS.md をGUIで作成するMVP
						<br />
						### プロンプトテンプレート、SKILL保管庫を兼ねる想定
					</p>
					<a href="/Bunmyaku" className="mt-6 BarBF ">
						Bunmyaku
						{/* <CaretRightIcon
							className=" align-middle ml-0"
						/> */}
					</a>
				</div>
			</div>
		</section>
	);
}
