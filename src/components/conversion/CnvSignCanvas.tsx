import { useEffect, useLayoutEffect, useRef } from "react";

export interface CnvSignCanvasProps {
	className?: string;
}

type Palette = {
	base: string;
	panel: string;
	edge: string;
	shadow: string;
	highlight: string;
	text: string;
	ink: string;
	accent: string;
};

const getCssColor = (
	scope: Element | null,
	name: string,
	fallback: string,
) => {
	if (typeof window === "undefined") return fallback;
	const target = scope ?? document.documentElement;
	const value = getComputedStyle(target).getPropertyValue(name).trim();
	return value || fallback;
};

const readPalette = (scope: Element | null): Palette => ({
	base: getCssColor(scope, "--BC", "#fbf9ef"),
	panel: getCssColor(scope, "--MC", "#2db542"),
	edge: getCssColor(scope, "--SC", "#3194c9"),
	shadow: getCssColor(scope, "--TC30", "rgba(51, 51, 51, 0.3)"),
	highlight: getCssColor(scope, "--WH60", "rgba(255, 255, 255, 0.6)"),
	text: getCssColor(scope, "--WH", "#fff"),
	ink: getCssColor(scope, "--BK", "#000"),
	accent: getCssColor(scope, "--AC", "#7f7f7f"),
});

const drawPolygon = (
	ctx: CanvasRenderingContext2D,
	points: Array<[number, number]>,
	fillStyle: string | CanvasGradient,
	strokeStyle?: string,
	lineWidth = 1,
) => {
	ctx.beginPath();
	points.forEach(([x, y], index) => {
		if (index === 0) {
			ctx.moveTo(x, y);
			return;
		}
		ctx.lineTo(x, y);
	});
	ctx.closePath();
	ctx.fillStyle = fillStyle;
	ctx.fill();
	if (strokeStyle) {
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = strokeStyle;
		ctx.stroke();
	}
};

const drawSlit = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
	ctx.fillRect(x, y, w, h);
};

const drawTrackedText = (
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	letterSpacing: number,
) => {
	let cursor = x;
	for (const ch of text) {
		ctx.fillText(ch, cursor, y);
		cursor += ctx.measureText(ch).width + letterSpacing;
	}
};

const drawSign = (
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	scope: Element | null,
) => {
	const palette = readPalette(scope);
	const scale = Math.min(width, height);
	const signW = Math.max(180, scale * 0.34);
	const signH = Math.max(110, scale * 0.18);
	const skew = Math.max(20, signW * 0.12);
	const sideDepth = Math.max(18, signW * 0.08);
	const x = width - signW - Math.max(20, width * 0.08);
	const y = Math.max(20, height * 0.08);
	const tilt = -0.16;

	ctx.save();
	ctx.translate(x + signW * 0.55, y + signH * 0.4);
	ctx.rotate(tilt);
	ctx.translate(-signW * 0.55, -signH * 0.4);

	const front: Array<[number, number]> = [
		[0, 0],
		[signW, 0],
		[signW - skew, signH],
		[-skew, signH],
	];
	const side: Array<[number, number]> = [
		[signW, 0],
		[signW + sideDepth, sideDepth * 0.4],
		[signW + sideDepth - skew, signH + sideDepth * 0.4],
		[signW - skew, signH],
	];
	const top: Array<[number, number]> = [
		[0, 0],
		[signW, 0],
		[signW + sideDepth, sideDepth * 0.4],
		[sideDepth, sideDepth * 0.4],
	];
	const bottom: Array<[number, number]> = [
		[-skew, signH],
		[signW - skew, signH],
		[signW + sideDepth - skew, signH + sideDepth * 0.4],
		[sideDepth - skew, signH + sideDepth * 0.4],
	];
	const base: Array<[number, number]> = [
		[signW * 0.08, signH + sideDepth * 0.3],
		[signW * 0.72, signH + sideDepth * 0.3],
		[signW * 0.62, signH + sideDepth * 0.42],
		[0, signH + sideDepth * 0.42],
	];

	const frontFill = ctx.createLinearGradient(0, 0, signW, signH);
	frontFill.addColorStop(0, palette.panel);
	frontFill.addColorStop(0.65, palette.edge);
	frontFill.addColorStop(1, palette.panel);

	const sideFill = ctx.createLinearGradient(signW, 0, signW + sideDepth, signH);
	sideFill.addColorStop(0, palette.shadow);
	sideFill.addColorStop(1, palette.ink);

	const topFill = ctx.createLinearGradient(0, 0, signW, sideDepth);
	topFill.addColorStop(0, palette.highlight);
	topFill.addColorStop(1, palette.panel);

	const bottomFill = ctx.createLinearGradient(0, signH, signW, signH + sideDepth);
	bottomFill.addColorStop(0, palette.shadow);
	bottomFill.addColorStop(1, palette.ink);

	ctx.shadowColor = palette.shadow;
	ctx.shadowBlur = Math.max(8, scale * 0.02);
	ctx.shadowOffsetX = Math.max(6, scale * 0.012);
	ctx.shadowOffsetY = Math.max(10, scale * 0.02);
	ctx.save();
	ctx.filter = "hue-rotate(76deg) saturate(1.35) brightness(1.02)";
	drawPolygon(ctx, side, sideFill);
	drawPolygon(ctx, top, topFill);
	drawPolygon(ctx, front, frontFill, palette.ink, 1.5);
	drawPolygon(ctx, bottom, bottomFill);
	drawPolygon(ctx, base, palette.base);
	ctx.restore();

	ctx.shadowColor = "transparent";

	ctx.save();
	ctx.globalAlpha = 0.85;
	ctx.fillStyle = palette.highlight;
	ctx.beginPath();
	ctx.moveTo(8, 8);
	ctx.lineTo(signW * 0.52, 8);
	ctx.lineTo(signW * 0.42, signH * 0.18);
	ctx.lineTo(12, signH * 0.18);
	ctx.closePath();
	ctx.fill();
	ctx.restore();

	ctx.fillStyle = palette.ink;
	ctx.fillRect(signW * 0.1, signH * 0.26, Math.max(4, signW * 0.014), signH * 0.42);
	drawSlit(ctx, signW * 0.2, signH * 0.74, signW * 0.16, Math.max(3, signH * 0.035));
	drawSlit(ctx, signW * 0.72, signH * 0.14, signW * 0.08, Math.max(3, signH * 0.03));

	ctx.save();
	ctx.translate(signW * 0.5, signH * 0.45);
	ctx.rotate(0.05);
	ctx.fillStyle = palette.text;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = `700 ${Math.max(28, signH * 0.42)}px sans-serif`;
	ctx.fillText("01", 0, -signH * 0.02);
	ctx.font = `600 ${Math.max(12, signH * 0.12)}px sans-serif`;
	drawTrackedText(ctx, "CNV-2025-01", -signW * 0.18, signH * 0.26, Math.max(1, signW * 0.005));
	ctx.restore();

	ctx.save();
	ctx.strokeStyle = palette.text;
	ctx.lineWidth = Math.max(2, signH * 0.02);
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.beginPath();
	ctx.moveTo(signW * 0.63, signH * 0.58);
	ctx.lineTo(signW * 0.78, signH * 0.58);
	ctx.lineTo(signW * 0.73, signH * 0.53);
	ctx.moveTo(signW * 0.78, signH * 0.58);
	ctx.lineTo(signW * 0.73, signH * 0.63);
	ctx.stroke();
	ctx.restore();

	ctx.restore();
};

const drawCanvas = (canvas: HTMLCanvasElement) => {
	const rect = canvas.getBoundingClientRect();
	const dpr = Math.max(1, window.devicePixelRatio || 1);
	const width = Math.max(1, Math.round(rect.width));
	const height = Math.max(1, Math.round(rect.height));
	const scope = canvas.closest("main");

	canvas.width = Math.max(1, Math.round(width * dpr));
	canvas.height = Math.max(1, Math.round(height * dpr));

	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, width, height);
	drawSign(ctx, width, height, scope);
};

const CnvSignCanvas = ({ className = "" }: CnvSignCanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useLayoutEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		drawCanvas(canvas);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		let ro: ResizeObserver | null = null;
		const redraw = () => drawCanvas(canvas);

		if (typeof ResizeObserver !== "undefined") {
			ro = new ResizeObserver(() => {
				redraw();
			});
			ro.observe(canvas);
		}

		window.addEventListener("resize", redraw);
		window.addEventListener("orientationchange", redraw);

		return () => {
			ro?.disconnect();
			window.removeEventListener("resize", redraw);
			window.removeEventListener("orientationchange", redraw);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className={className}
			aria-hidden="true"
			role="presentation"
			style={{
				background: "transparent",
				display: "block",
				height: "100%",
				width: "100%",
				pointerEvents: "none",
			}}
		/>
	);
};

export { CnvSignCanvas };
