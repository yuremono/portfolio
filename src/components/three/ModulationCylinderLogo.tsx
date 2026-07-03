import {
	useEffect,
	useMemo,
	useRef,
	useState,
	type MutableRefObject,
	type RefObject,
} from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
	CanvasTexture,
	CircleGeometry,
	CylinderGeometry,
	DoubleSide,
	LinearFilter,
	PlaneGeometry,
	SRGBColorSpace,
	type Group,
} from "three";
import { subscribeDocumentVisibility } from "../../lib/pageVisibility";

interface ModulationCylinderLogoProps {
	className?: string;
	interactive?: boolean;
	autoSpin?: boolean;
	onReadyChange?: (ready: boolean) => void;
}

interface Palette {
	body: string;
	ink: string;
	light: string;
	shadow: string;
	partition: string;
}

interface TextPlaneProps {
	text: string;
	position: [number, number, number];
	rotation: [number, number, number];
	fillStyle: string;
	fontReadyToken: number;
}

const SIDE_TEXT = "MODULATION";

const LOGO_CONFIG = {
	// --- レンダリング（Canvas / WebGL）---
	dpr: [1, 2] satisfies [number, number],
	antialias: false,
	frameloop: "demand" as const,
	powerPreference: "low-power" as WebGLPowerPreference,
	cameraFov: 34,

	// --- カメラ ---
	cameraPosition: [0, 4.8, 0.001] as [number, number, number],

	// --- モデル全体 ---
	modelScale: 1,
	modelRotationY: 0.6,
	cylinderHeight: 1,
	cylinderSegments: 24,

	// --- 色 ---
	bodyColor: "transparent",
	textColor: "--TC",
	bodyToneMapped: false,
	lightColor: "--TR",
	shadowColor: "--TR",
	partitionColor: "--BC",
	partitionRadius: 0.75,

	// --- スクロール / 回転 ---
	scrollTurnRange: 2400,
	sideSpinSpeed: 0.2,
	spinFps: 30,

	// --- 断面（ひらがな）---
	capRotationZ: -0.625,
	bottomCapRotationZ: 0.56,
	capRadius: 0.98,
	capSegments: 24,
	capFontFamily: '"Noto Serif JP", serif',
	capFontWeight: 200,
	capFontSize: 512,
	capTextRatio: 0.625,
	capTextureSize: 256,

	// --- 側面（英字）---
	sideRadius: 1.026,
	sideOffsetY: -0.14,
	sideLetterWidth: 0.9,
	sideLetterHeight: 1,
	sideFontFamily: '"Jost"',
	sideFontWeight: 200,
	sideFontSize: 900,
	sideTextRatio: 0.75,
	sideTextureSize: 256,

	// --- テクスチャ描画 ---
	textStroke: false,
};

const HALF_HEIGHT = LOGO_CONFIG.cylinderHeight / 2;
const SCROLL_TURN_FACTOR = (Math.PI * 2) / LOGO_CONFIG.scrollTurnRange;
const SIDE_BASE_ROTATION = -LOGO_CONFIG.modelRotationY;

const CYLINDER_GEOMETRY = new CylinderGeometry(
	1,
	1,
	LOGO_CONFIG.cylinderHeight,
	LOGO_CONFIG.cylinderSegments,
	1,
	false,
);
const CAP_DISK_GEOMETRY = new CircleGeometry(
	LOGO_CONFIG.capRadius,
	LOGO_CONFIG.capSegments,
);
const PARTITION_DISK_GEOMETRY = new CircleGeometry(
	LOGO_CONFIG.partitionRadius,
	LOGO_CONFIG.capSegments,
);
const SIDE_PLANE_GEOMETRY = new PlaneGeometry(
	LOGO_CONFIG.sideLetterWidth,
	LOGO_CONFIG.sideLetterHeight,
);

const FALLBACK_COLOR =
	typeof document === "undefined"
		? "oklch(99% 0.005 60)"
		: cssColorToRgb("oklch(99% 0.005 60)", "oklch(99% 0.005 60)");
const FALLBACK_PALETTE: Palette = {
	body: FALLBACK_COLOR,
	ink: FALLBACK_COLOR,
	light: FALLBACK_COLOR,
	shadow: FALLBACK_COLOR,
	partition: FALLBACK_COLOR,
};

const TEXT_TEXTURE_CACHE = new Map<string, CanvasTexture>();

export default function ModulationCylinderLogo({
	className,
	interactive = true,
	autoSpin = true,
	onReadyChange,
}: ModulationCylinderLogoProps) {
	const [palette, setPalette] = useState<Palette>(FALLBACK_PALETTE);
	const [canvasReady, setCanvasReady] = useState(false);
	const { ready: fontsReady, token: fontReadyToken } = useCanvasFontReady();
	const rootRef = useRef<HTMLDivElement>(null);
	const rootClassName = ["LogoCylinder", className].filter(Boolean).join(" ");

	useEffect(() => {
		onReadyChange?.(canvasReady && fontsReady);
	}, [canvasReady, fontsReady, onReadyChange]);

	return (
		<div ref={rootRef} className={rootClassName}>
			<Canvas
				className="LogoCylinderCanvas"
				role="img"
				aria-label="上面に「ゆ」、側面にMODULATIONを配した円柱ロゴ"
				style={{ width: "100%", height: "auto", aspectRatio: "1 / 1" }}
				frameloop={LOGO_CONFIG.frameloop}
				dpr={LOGO_CONFIG.dpr}
				camera={{
					position: LOGO_CONFIG.cameraPosition,
					fov: LOGO_CONFIG.cameraFov,
				}}
				gl={{
					alpha: true,
					antialias: LOGO_CONFIG.antialias,
					powerPreference: LOGO_CONFIG.powerPreference,
				}}
				onCreated={({ camera, gl }) => {
					camera.lookAt(0, 0, 0);
					camera.updateProjectionMatrix();
					setPalette(readPalette(gl.domElement));
					setCanvasReady(true);
				}}
			>
				<LogoModel
					palette={palette}
					autoSpin={autoSpin}
					fontReadyToken={fontReadyToken}
					rootRef={rootRef}
				/>
				{interactive ? (
					<OrbitControls
						enablePan
						enableRotate
						enableZoom
						makeDefault
						minDistance={2.7}
						maxDistance={7}
						target={[0, 0, 0]}
					/>
				) : null}
			</Canvas>
		</div>
	);
}

function LogoModel({
	palette,
	autoSpin,
	fontReadyToken,
	rootRef,
}: {
	palette: Palette;
	autoSpin: boolean;
	fontReadyToken: number;
	rootRef: RefObject<HTMLDivElement | null>;
}) {
	const scrollRef = useRef<Group>(null);
	const isPageVisibleRef = useRef(
		typeof document === "undefined" ? true : !document.hidden,
	);
	const isLogoVisibleRef = useRef(true);
	const invalidate = useThree((state) => state.invalidate);

	useEffect(() => {
		const updateScrollRotation = () => {
			if (!scrollRef.current) return;

			scrollRef.current.rotation.x = -window.scrollY * SCROLL_TURN_FACTOR;
			if (isPageVisibleRef.current) {
				invalidate();
			}
		};

		updateScrollRotation();
		window.addEventListener("scroll", updateScrollRotation, { passive: true });
		const observer =
			typeof IntersectionObserver !== "undefined"
				? new IntersectionObserver(([entry]) => {
					isLogoVisibleRef.current = entry.isIntersecting;
					if (entry.isIntersecting && isPageVisibleRef.current) {
						invalidate();
					}
				})
				: null;
		if (rootRef.current) observer?.observe(rootRef.current);
		const disconnectVisibility = subscribeDocumentVisibility((visible) => {
			isPageVisibleRef.current = visible;
			if (visible) {
				invalidate();
			}
		});

		return () => {
			window.removeEventListener("scroll", updateScrollRotation);
			observer?.disconnect();
			disconnectVisibility();
		};
	}, [invalidate, rootRef]);

	return (
		<group ref={scrollRef} scale={LOGO_CONFIG.modelScale}>
			<group rotation={[0, LOGO_CONFIG.modelRotationY, 0]}>
				<CylinderBody palette={palette} fontReadyToken={fontReadyToken} />
				<SideLetters
					palette={palette}
					autoSpin={autoSpin}
					isPageVisibleRef={isPageVisibleRef}
					isLogoVisibleRef={isLogoVisibleRef}
					fontReadyToken={fontReadyToken}
					invalidate={invalidate}
				/>
			</group>
		</group>
	);
}

function CylinderBody({
	palette,
	fontReadyToken,
}: {
	palette: Palette;
	fontReadyToken: number;
}) {
	const bodyMaterial = useMemo(
		() => ({
			color: palette.body === "transparent" ? "#000000" : palette.body,
			toneMapped: LOGO_CONFIG.bodyToneMapped,
		}),
		[palette.body],
	);
	const partitionMaterial = useMemo(
		() => ({
			color: palette.partition,
			toneMapped: LOGO_CONFIG.bodyToneMapped,
		}),
		[palette.partition],
	);

	return (
		<group>
			<mesh visible={palette.body !== "transparent"} geometry={CYLINDER_GEOMETRY}>
				<meshBasicMaterial {...bodyMaterial} />
			</mesh>
			{palette.partition === "transparent" ? null : (
				<mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={2} geometry={PARTITION_DISK_GEOMETRY}>
					<meshBasicMaterial {...partitionMaterial} side={DoubleSide} />
				</mesh>
			)}
			<TextDisk
				text="ゆ"
				position={[0, HALF_HEIGHT + 0.018, 0]}
				rotation={[-Math.PI / 2, 0, LOGO_CONFIG.capRotationZ]}
				fillStyle={palette.ink}
				fontReadyToken={fontReadyToken}
			/>
			<TextDisk
				text="れ"
				position={[0, -HALF_HEIGHT - 0.018, 0]}
				rotation={[Math.PI / 2, 0, LOGO_CONFIG.bottomCapRotationZ]}
				fillStyle={palette.ink}
				fontReadyToken={fontReadyToken}
			/>
		</group>
	);
}

function SideLetters({
	palette,
	autoSpin,
	isPageVisibleRef,
	isLogoVisibleRef,
	fontReadyToken,
	invalidate,
}: {
	palette: Palette;
	autoSpin: boolean;
	isPageVisibleRef: MutableRefObject<boolean>;
	isLogoVisibleRef: MutableRefObject<boolean>;
	fontReadyToken: number;
	invalidate: () => void;
}) {
	const sideRef = useRef<Group>(null);
	const nextFrameTimerRef = useRef<number | null>(null);

	useEffect(
		() => () => {
			if (nextFrameTimerRef.current !== null) {
				window.clearTimeout(nextFrameTimerRef.current);
			}
		},
		[],
	);

	useFrame(({ clock }) => {
		if (!sideRef.current) return;
		if (!isPageVisibleRef.current) return;
		if (!isLogoVisibleRef.current) return;
		const elapsed = clock.elapsedTime;

		const autoRotation = autoSpin
			? -elapsed * LOGO_CONFIG.sideSpinSpeed
			: 0;
		sideRef.current.rotation.y = SIDE_BASE_ROTATION + autoRotation;

		if (autoSpin && nextFrameTimerRef.current === null) {
			nextFrameTimerRef.current = window.setTimeout(() => {
				nextFrameTimerRef.current = null;
				if (isPageVisibleRef.current && isLogoVisibleRef.current) {
					invalidate();
				}
			}, 1000 / LOGO_CONFIG.spinFps);
		}
	});

	return (
		<group ref={sideRef} rotation={[0, SIDE_BASE_ROTATION, 0]}>
			{SIDE_TEXT.split("").map((letter, index) => {
				const angle = (index / SIDE_TEXT.length) * Math.PI * 2;

				return (
					<TextPlane
						key={`${letter}-${index}`}
						text={letter}
						position={[
							Math.sin(angle) * LOGO_CONFIG.sideRadius,
							LOGO_CONFIG.sideOffsetY,
							Math.cos(angle) * LOGO_CONFIG.sideRadius,
						]}
						rotation={[0, angle, 0]}
						fillStyle={palette.ink}
						fontReadyToken={fontReadyToken}
					/>
				);
			})}
		</group>
	);
}

function TextDisk({
	text,
	position,
	rotation,
	fillStyle,
	fontReadyToken,
}: {
	text: string;
	position: [number, number, number];
	rotation: [number, number, number];
	fillStyle: string;
	fontReadyToken: number;
}) {
	const texture = useTextTexture({
		text,
		fontFamily: LOGO_CONFIG.capFontFamily,
		fontWeight: LOGO_CONFIG.capFontWeight,
		fillStyle,
		fontSize: LOGO_CONFIG.capFontSize,
		textureSize: LOGO_CONFIG.capTextureSize,
		fontReadyToken,
		textRatio: LOGO_CONFIG.capTextRatio,
	});

	return (
		<mesh position={position} rotation={rotation} renderOrder={4} geometry={CAP_DISK_GEOMETRY}>
			<meshBasicMaterial
				map={texture}
				transparent
				alphaTest={0.01}
				depthWrite={false}
				side={DoubleSide}
				toneMapped={false}
			/>
		</mesh>
	);
}

function TextPlane({ text, position, rotation, fillStyle, fontReadyToken }: TextPlaneProps) {
	const texture = useTextTexture({
		text,
		fontFamily: LOGO_CONFIG.sideFontFamily,
		fontWeight: LOGO_CONFIG.sideFontWeight,
		fillStyle,
		fontSize: LOGO_CONFIG.sideFontSize,
		textureSize: LOGO_CONFIG.sideTextureSize,
		fontReadyToken,
		textRatio: LOGO_CONFIG.sideTextRatio,
	});

	return (
		<mesh position={position} rotation={rotation} renderOrder={3} geometry={SIDE_PLANE_GEOMETRY}>
			<meshBasicMaterial
				map={texture}
				transparent
				alphaTest={0.01}
				depthWrite={false}
				toneMapped={false}
			/>
		</mesh>
	);
}

function useTextTexture({
	text,
	fontFamily,
	fontWeight,
	fillStyle,
	fontSize,
	textureSize,
	fontReadyToken,
	textRatio = 0.9,
}: {
	text: string;
	fontFamily: string;
	fontWeight: number;
	fillStyle: string;
	fontSize: number;
	textureSize: number;
	fontReadyToken: number;
	textRatio?: number;
}) {
	const cacheKey = [
		text,
		fontFamily,
		fontWeight,
		fillStyle,
		fontSize,
		textureSize,
		textRatio,
		LOGO_CONFIG.textStroke,
		fontReadyToken,
	].join("|");

	const texture = useMemo(() => {
		const cached = TEXT_TEXTURE_CACHE.get(cacheKey);
		if (cached) return cached;

		const canvas = document.createElement("canvas");
		canvas.width = textureSize;
		canvas.height = textureSize;

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			return createTexture(canvas, cacheKey);
		}

		drawBalancedText(ctx, {
			text,
			textureSize,
			textRatio,
			fontWeight,
			fontSize,
			fontFamily,
			fillStyle,
		});

		return createTexture(canvas, cacheKey);
	}, [cacheKey, fillStyle, fontFamily, fontSize, fontWeight, text, textRatio, textureSize]);

	return texture;
}

function drawBalancedText(
	ctx: CanvasRenderingContext2D,
	{
		text,
		textureSize,
		textRatio,
		fontWeight,
		fontSize,
		fontFamily,
		fillStyle,
	}: {
		text: string;
		textureSize: number;
		textRatio: number;
		fontWeight: number;
		fontSize: number;
		fontFamily: string;
		fillStyle: string;
	},
) {
	const limit = textureSize * textRatio;
	const centerX = textureSize / 2;
	const centerY = textureSize / 2;

	ctx.clearRect(0, 0, textureSize, textureSize);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	let size = fontSize;
	ctx.font = `${fontWeight} ${size}px ${fontFamily}`;

	const measure = () => {
		const metrics = ctx.measureText(text);
		const width = metrics.width;
		const height =
			(metrics.actualBoundingBoxAscent ?? size * 0.8) +
			(metrics.actualBoundingBoxDescent ?? size * 0.2);

		return { width, height };
	};

	let { width, height } = measure();
	const scale = Math.min(1, limit / width, limit / height);
	size = Math.max(1, Math.floor(fontSize * scale));
	ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
	({ width, height } = measure());

	if (width > limit || height > limit) {
		const tighten = Math.min(limit / width, limit / height);
		size = Math.max(1, Math.floor(size * tighten));
		ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
	}

	if (LOGO_CONFIG.textStroke) {
		ctx.lineJoin = "round";
		ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
		ctx.lineWidth = Math.max(2, size * 0.018);
		ctx.strokeText(text, centerX, centerY);
	}

	ctx.fillStyle = fillStyle;
	ctx.fillText(text, centerX, centerY);
}

function createTexture(canvas: HTMLCanvasElement, cacheKey: string) {
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.minFilter = LinearFilter;
	texture.magFilter = LinearFilter;
	texture.needsUpdate = true;
	TEXT_TEXTURE_CACHE.set(cacheKey, texture);

	return texture;
}

function useCanvasFontReady() {
	const [token, setToken] = useState(0);
	const [ready, setReady] = useState(
		() => typeof document === "undefined" || !("fonts" in document),
	);

	useEffect(() => {
		if (typeof document === "undefined" || !("fonts" in document)) {
			return;
		}

		let active = true;
		const fonts = document.fonts;
		const markReady = () => {
			if (!active) return;

			TEXT_TEXTURE_CACHE.clear();
			setToken((value) => value + 1);
		};
		const requestFont = (font: string) => {
			try {
				return fonts.load(font).then(markReady, markReady);
			} catch {
				markReady();
				return Promise.resolve();
			}
		};

		void Promise.all([
			requestFont(
				`${LOGO_CONFIG.capFontWeight} 160px ${LOGO_CONFIG.capFontFamily}`,
			),
			requestFont(
				`${LOGO_CONFIG.sideFontWeight} 160px ${LOGO_CONFIG.sideFontFamily}`,
			),
			fonts.ready.then(markReady, markReady),
		]).then(() => {
			if (active) setReady(true);
		});

		return () => {
			active = false;
		};
	}, []);

	return { ready, token };
}

function readPalette(element: HTMLElement | null): Palette {
	if (!element) return FALLBACK_PALETTE;

	const style = getComputedStyle(element);

	return {
		body: readColorValue(style, LOGO_CONFIG.bodyColor, FALLBACK_PALETTE.body),
		ink: readColorValue(style, LOGO_CONFIG.textColor, FALLBACK_PALETTE.ink),
		light: readColorValue(style, LOGO_CONFIG.lightColor, FALLBACK_PALETTE.light),
		shadow: readColorValue(style, LOGO_CONFIG.shadowColor, FALLBACK_PALETTE.shadow),
		partition: readColorValue(
			style,
			LOGO_CONFIG.partitionColor,
			FALLBACK_PALETTE.partition,
		),
	};
}

function readColorValue(
	style: CSSStyleDeclaration,
	color: string,
	fallback: string,
) {
	const source = readCssColor(style, color);
	if (isTransparentColor(source)) return "transparent";

	return cssColorToRgb(source, fallback);
}

function readCssColor(style: CSSStyleDeclaration, color: string) {
	return color.startsWith("--") ? style.getPropertyValue(color).trim() : color;
}

function isTransparentColor(value: string) {
	const normalized = value.trim().toLowerCase();

	return (
		normalized === "transparent" ||
		normalized === "var(--tr)" ||
		normalized === "rgba(0, 0, 0, 0)" ||
		normalized === "rgba(0,0,0,0)" ||
		normalized === "oklch(0% 0 0 / 0)"
	);
}

function cssColorToRgb(value: string, fallback: string) {
	const source = value || fallback;
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;

	const ctx = canvas.getContext("2d");
	if (!ctx) return fallback;

	ctx.fillStyle = fallback;
	try {
		ctx.fillStyle = source;
	} catch {
		ctx.fillStyle = fallback;
	}

	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

	return `rgb(${r}, ${g}, ${b})`;
}
