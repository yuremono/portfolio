import { useCallback, useEffect, useRef } from "react";
import { initIntersectionShow } from "../../lib/effects/intersectionShow";
import {
	isDocumentVisible,
	subscribeDocumentVisibility,
} from "../../lib/pageVisibility";

interface SectionCanvasConfig {
	text: string;
	fontSize: number;
	detailed: boolean;
	fillOpacity: number;
}

const SIMPLE_COLOR_SCHEME = {
	// "--background": "oklch(0.16 0.055 255)",
	// "--foreground": "oklch(0.8 0.02 235)",
	// "--MC": "oklch(0.16 0.055 255)",
	// "--SC": "oklch(0.22 0.9 188)",
	// "--AC": "oklch(0.45 0.9 188)",
	// "--BC": "oklch(0.115 0.035 255)",
	// "--TC": "oklch(0.8 0.02 255)",
	// "--GR": "oklch(0.62 0.025 255)",
} as const;

const DETAILED_COLOR_SCHEME = {
	"--background": "oklch(0.16 0.055 255)",
	"--foreground": "oklch(0.8 0.02 235)",
	"--MC": "oklch(0.16 0.055 255)",
	"--SC": "oklch(0.22 0.9 188)",
	"--AC": "oklch(0.45 0.9 188)",
	"--BC": "oklch(0.115 0.035 255)",
	// "--TC": "oklch(0.8 0.02 255)",
	"--GR": "oklch(0.62 0.025 255)",
} as const;

const SIMPLE_CANVAS_COLOR = {
	// 通常時の canvas 色。既存変数は参照せず、--BC と同じベージュ寄りの色を直接指定します。
	base: "oklch(1 0.0 235)",
	// COLOR_SCHEME が有効な間だけ使う canvas 色。以前の --foreground と同じ色です。
	active: "oklch(1 0.0 235)",
} as const;

const DETAILED_CANVAS_COLOR = {
	base: "oklch(80% 0.005 60)",
	active: "oklch(0.9 0.02 235)",
} as const;
const VIEWBOX = 1000;
const FRAGMENT_STEP = 2;
const CANVAS_MAX_DPR = 2;
const FRAGMENT_SKIP_WHEN_FILL_OPACITY = 0.82;

const SIMPLE_TIMELINE = {
	// 断片を見せ始める位置。0 より大きくすると、セクションに入った直後は何も出ません。
	fragmentIntroStart: 0.02,
	// 断片が見え始めてから本来の濃さになるまでの長さ。
	fragmentIntroLength: 0.52,
	// 断片がアウトラインへ戻り切る位置。小さいほど早く集合します。
	gatherEnd: 0.55,
	// 断片収束のカーブ。1 は直線、2〜3 は後半で加速、4 以上はかなり極端です。
	gatherPower: 2,
	// fill の開始位置。終了位置は 1.0 固定なので、小さいほど長く満たされます。
	fillStart: 0.25,
	// fill が見え始めてから不透明になるまでの長さ。短いほど早く濃くなります。
	fillFadeLength: 1,
	// 断片アウトラインを薄くし始める位置。fill と重ねて見せるため後半寄りにしています。
	fragmentFadeStart: 0.3,
	// 最後に残す断片アウトラインの濃さ。0 で完全に消え、0.18 なら少し残ります。
	fragmentFinalOpacity: 0.0,
} as const;

const DETAILED_TIMELINE = {
	...SIMPLE_TIMELINE,
	gatherEnd: 0.35,
	fillStart: 0.325,
} as const;

const SIMPLE_COLOR_SCHEME_INTERSECTION = {
	// IntersectionObserver の root。null は viewport を基準にします。
	root: null,
	// IntersectionObserver の rootMargin。例: "0px 0px -20% 0px" で下端の判定を上へ寄せます。
	rootMargin: "0% 0px 0% 0px",
	// threshold の分割数。多いほど細かく通知されます。
	thresholdSteps: 10,
	// セクションが viewport 高さに対してこの割合以上見えている間だけ配色を適用します。
	activeBoundary: 0.5,
} as const;

const DETAILED_COLOR_SCHEME_INTERSECTION = {
	...SIMPLE_COLOR_SCHEME_INTERSECTION,
	rootMargin: "0% 0px 50% 0px",
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

// function resolveForegroundColor() {
// 	if (typeof window === "undefined") return "oklch(0.91 0.02 235)";

// 	const rootStyle = getComputedStyle(document.documentElement);
// 	return (
// 		rootStyle.getPropertyValue("--foreground").trim() ||
// 		"oklch(0.91 0.02 235)"
// 	);
// }

function createParticleField(
	font: string,
	text: string,
	fontSize: number,
	lineWidth: number,
): ParticleField {
	const mask = document.createElement("canvas");
	mask.width = VIEWBOX;
	mask.height = VIEWBOX;

	const maskCtx = mask.getContext("2d", { willReadFrequently: true });
	if (!maskCtx) {
		return {
			font,
			mask,
			coloredMasks: new Map(),
			fragments: [],
			inkBlobs: [],
		};
	}

	maskCtx.clearRect(0, 0, VIEWBOX, VIEWBOX);
	maskCtx.font = `${fontSize}px ${font}`;
	maskCtx.lineWidth = lineWidth;
	maskCtx.miterLimit = 2;
	maskCtx.strokeStyle = "#000";
	maskCtx.textAlign = "center";
	maskCtx.textBaseline = "middle";
	maskCtx.strokeText(text, VIEWBOX / 2, VIEWBOX / 2 + 48);

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
	text: string,
	fontSize: number,
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
	inkCtx.font = `${fontSize}px ${font}`;
	inkCtx.textAlign = "center";
	inkCtx.textBaseline = "middle";
	inkCtx.fillStyle = "#000";
	inkCtx.fillText(text, VIEWBOX / 2, VIEWBOX / 2 + 48);

	ctx.save();
	ctx.globalAlpha = opacity;
	ctx.drawImage(inkCanvas, 0, 0);
	ctx.restore();
}

export function useSectionCanvas({
	text,
	fontSize,
	detailed,
	fillOpacity: fillOpacityLimit,
}: SectionCanvasConfig) {
	const rootRef = useRef<HTMLElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const particleFieldRef = useRef<ParticleField | null>(null);
	const isNearViewportRef = useRef(false);
	const isPageVisibleRef = useRef(isDocumentVisible());
	const colorSchemeActiveRef = useRef(false);
	const colorScheme = detailed
		? DETAILED_COLOR_SCHEME
		: SIMPLE_COLOR_SCHEME;
	const canvasColorScheme = detailed
		? DETAILED_CANVAS_COLOR
		: SIMPLE_CANVAS_COLOR;
	const timeline = detailed ? DETAILED_TIMELINE : SIMPLE_TIMELINE;
	const colorSchemeIntersection = detailed
		? DETAILED_COLOR_SCHEME_INTERSECTION
		: SIMPLE_COLOR_SCHEME_INTERSECTION;

	const render = useCallback(() => {
		const canvas = canvasRef.current;
		const root = rootRef.current;
		if (!canvas) return;
		if (!root) return;
		if (!isNearViewportRef.current || !isPageVisibleRef.current) return;

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
		const fillProgress = easeOutCubic(
			progressBetween(scrollProgress, timeline.fillStart, 1),
		);
		const fillOpacity = easeOutCubic(
			progressBetween(
				scrollProgress,
				timeline.fillStart,
				timeline.fillStart + timeline.fillFadeLength,
			),
		);
		const font = resolveShipFont();
		const canvasColor = colorSchemeActiveRef.current
			? canvasColorScheme.active
			: canvasColorScheme.base;

		if (detailed && particleFieldRef.current?.font !== font) {
			particleFieldRef.current = createParticleField(
				font,
				text,
				fontSize,
				1.25,
			);
		}

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, width, height);

		if (fillProgress > 0) {
			if (detailed) {
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
					fillOpacity * clamp01(fillOpacityLimit),
					text,
					fontSize,
				);
			} else {
				ctx.save();
				ctx.setTransform(scale, 0, 0, scale, tx, ty);
				ctx.globalAlpha = fillOpacity * clamp01(fillOpacityLimit);
				ctx.font = `${fontSize}px ${font}`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = canvasColor;
				ctx.fillText(text, VIEWBOX / 2, VIEWBOX / 2 + 48);
				ctx.restore();
			}
		}

		if (!detailed) return;

		const gatherProgress = easeInPower(
			progressBetween(
				scrollProgress,
				timeline.fragmentIntroStart,
				timeline.gatherEnd,
			),
			timeline.gatherPower,
		);
		const fragmentIntroOpacity = easeOutCubic(
			progressBetween(
				scrollProgress,
				timeline.fragmentIntroStart,
				timeline.fragmentIntroStart + timeline.fragmentIntroLength,
			),
		);
		const fragmentFadeProgress = easeOutCubic(
			progressBetween(scrollProgress, timeline.fragmentFadeStart, 1),
		);
		const fragmentOpacity =
			fragmentIntroOpacity *
			(1 - fragmentFadeProgress * (1 - timeline.fragmentFinalOpacity));

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
					timeline.gatherPower,
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
	}, [
		canvasColorScheme.active,
		canvasColorScheme.base,
		detailed,
		fillOpacityLimit,
		fontSize,
		text,
		timeline,
	]);

	const scheduleRender = useCallback(() => {
		if (!isNearViewportRef.current || !isPageVisibleRef.current) return;
		if (rafRef.current !== null) return;
		rafRef.current = window.requestAnimationFrame(() => {
			rafRef.current = null;
			render();
		});
	}, [render]);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		let disposed = false;

		window.addEventListener("scroll", scheduleRender, { passive: true });
		window.addEventListener("resize", scheduleRender, { passive: true });

		const rootMargin = detailed ? "60% 0px 60% 0px" : "45% 0px 45% 0px";
		const viewportObserver =
			typeof IntersectionObserver === "undefined"
				? null
				: new IntersectionObserver(
					(entries) => {
							if (disposed) return;
							const entry = entries[0];
							const nextNearViewport =
								entry.isIntersecting || entry.intersectionRatio > 0;
							isNearViewportRef.current = nextNearViewport;
							if (nextNearViewport) {
								scheduleRender();
								return;
							}
							if (rafRef.current !== null) {
								window.cancelAnimationFrame(rafRef.current);
								rafRef.current = null;
							}
						},
						{
							root: null,
							rootMargin,
							threshold: 0,
						},
					);
		viewportObserver?.observe(root);
		if (!viewportObserver) {
			isNearViewportRef.current = true;
			scheduleRender();
		}

		const resizeObserver =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(scheduleRender);
		if (canvasRef.current) resizeObserver?.observe(canvasRef.current);

		const disconnectVisibility = subscribeDocumentVisibility((visible) => {
			if (disposed) return;
			isPageVisibleRef.current = visible;
			if (!visible) {
				if (rafRef.current !== null) {
					window.cancelAnimationFrame(rafRef.current);
					rafRef.current = null;
				}
				return;
			}
			scheduleRender();
		});

		document.fonts?.ready.then(() => {
			if (disposed) return;
			particleFieldRef.current = null;
			if (isNearViewportRef.current && isPageVisibleRef.current) {
				scheduleRender();
			}
		});

		return () => {
			disposed = true;
			window.removeEventListener("scroll", scheduleRender);
			window.removeEventListener("resize", scheduleRender);
			resizeObserver?.disconnect();
			viewportObserver?.disconnect();
			disconnectVisibility();
			if (rafRef.current !== null) {
				window.cancelAnimationFrame(rafRef.current);
			}
		};
	}, [detailed, scheduleRender]);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		const intersectionShow = initIntersectionShow(root);
		return () => {
			intersectionShow.disconnect();
		};
	}, []);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const previous = new Map<string, string>();
		let active = false;

		const applyScheme = () => {
			if (active) return;
			active = true;
			colorSchemeActiveRef.current = true;
			for (const key of Object.keys(colorScheme) as Array<
				keyof typeof colorScheme
			>) {
				previous.set(
					key,
					document.documentElement.style.getPropertyValue(key),
				);
				document.documentElement.style.setProperty(
					key,
					colorScheme[key],
				);
			}
			scheduleRender();
		};

		const restoreScheme = () => {
			if (!active) return;
			active = false;
			colorSchemeActiveRef.current = false;
			for (const key of Object.keys(colorScheme) as Array<
				keyof typeof colorScheme
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
					visible >= colorSchemeIntersection.activeBoundary
				) {
					applyScheme();
				} else {
					restoreScheme();
				}
			},
			{
				root: colorSchemeIntersection.root,
				rootMargin: colorSchemeIntersection.rootMargin,
				threshold: Array.from(
					{ length: colorSchemeIntersection.thresholdSteps + 1 },
					(_, index) =>
						index / colorSchemeIntersection.thresholdSteps,
				),
			},
		);

		observer.observe(root);

		return () => {
			observer.disconnect();
			restoreScheme();
		};
	}, [colorScheme, colorSchemeIntersection, scheduleRender]);

	return { rootRef, canvasRef };
}
