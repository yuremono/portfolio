const HOST_SELECTOR = ".MaskMosaique";
const ATTR = "data-mask-mosaique";
const CANVAS_ATTR = "data-mask-mosaique-canvas";
const ITEM_ATTR = "data-mask-mosaique-item";

export type RuntimeDisconnect = { disconnect: () => void };

interface ShadowObject {
	x: number;
	y: number;
	size: number;
	dirX: 1 | -1;
	dirY: 1 | -1;
	speed: number;
	color: string;
}

interface HostState {
	host: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	offscreenCanvas: HTMLCanvasElement;
	offscreenCtx: CanvasRenderingContext2D;
	objects: ShadowObject[];
	active: boolean;
	then: number;
	resizeTimeoutId: number | null;
	lastViewportWidth: number;
	resizeObserver: ResizeObserver | null;
}

const DEFAULT_COLORS = [
	"#3548FE",
	"#353F9E",
	"#4855DB",
	"#151A36",
	"#3548fe",
	"#2D38B7",
	"#434ECB",
];

const VARPI = 2 * Math.PI;
const RESIZE_DEBOUNCE_MS = 200;
const states = new Set<HostState>();
let rafId: number | null = null;

function isMobileAgent(): boolean {
	return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
		navigator.userAgent,
	);
}

function vwToPx(vw: number): number {
	return (vw / 100) * window.innerWidth;
}

function readNumber(el: HTMLElement, name: string, fallback: number): number {
	const raw = getComputedStyle(el).getPropertyValue(name).trim();
	if (!raw) return fallback;
	const value = Number.parseFloat(raw);
	return Number.isFinite(value) ? value : fallback;
}

function readColors(el: HTMLElement): string[] {
	const raw = getComputedStyle(el).getPropertyValue("--mosaique-colors").trim();
	if (!raw) return DEFAULT_COLORS;
	const colors = raw
		.split(",")
		.map((color) => color.trim())
		.filter(Boolean);
	return colors.length > 0 ? colors : DEFAULT_COLORS;
}

function formatPathNumber(value: number): string {
	return Number(value.toFixed(3)).toString();
}

function getViewportWidth(): number {
	return window.visualViewport?.width ?? window.innerWidth;
}

function getTargetItems(host: HTMLElement): HTMLElement[] {
	const explicit = Array.from(
		host.querySelectorAll<HTMLElement>(`[${ITEM_ATTR}]`),
	).filter((item) => item.closest(HOST_SELECTOR) === host);

	if (explicit.length > 0) {
		return explicit;
	}

	return Array.from(host.children).filter(
		(child): child is HTMLElement =>
			child instanceof HTMLElement &&
			!child.hasAttribute(CANVAS_ATTR) &&
			!["CANVAS", "SCRIPT", "STYLE"].includes(child.tagName),
	);
}

function getNumByArea(state: HostState): number {
	const area = state.canvas.width * state.canvas.height;
	if (!isMobileAgent()) return 2;
	if (area < 300000) return 3;
	if (area < 500000) return 4;
	return 5;
}

function resizeCanvas(state: HostState): void {
	const width = state.host.offsetWidth;
	const height = state.host.offsetHeight;
	if (!width || !height) return;

	state.canvas.width = width;
	state.canvas.height = height;
	state.canvas.style.width = `${width}px`;
	state.canvas.style.height = `${height}px`;
	state.offscreenCanvas.width = width;
	state.offscreenCanvas.height = height;
}

function createObjects(state: HostState): void {
	const mobile = isMobileAgent();
	const colors = readColors(state.host);
	const baseSize = readNumber(state.host, "--mosaique-base-size", mobile ? 12 : 4);
	const sizeVariation = readNumber(
		state.host,
		"--mosaique-size-variation",
		mobile ? 4 : 1.5,
	);
	const initialDuration = readNumber(state.host, "--mosaique-duration", 7);
	const durationVariation = readNumber(state.host, "--mosaique-duration-variation", 6);
	const speedCoef = readNumber(state.host, "--mosaique-speed", mobile ? 2 : 0.7);
	const total = colors.length * getNumByArea(state);

	state.objects = Array.from({ length: total }, (_, index) => {
		const finalSizeVw = baseSize + Math.random() * sizeVariation;
		const duration = initialDuration + Math.random() * durationVariation;
		return {
			x: Math.random() * state.canvas.width,
			y: Math.random() * state.canvas.height,
			size: vwToPx(finalSizeVw),
			dirX: Math.random() < 0.5 ? -1 : 1,
			dirY: Math.random() < 0.5 ? -1 : 1,
			speed: (state.canvas.width / (duration * readNumber(state.host, "--mosaique-fps", 35))) * speedCoef,
			color: colors[index % colors.length],
		};
	});
}

function clampObjectsToCanvas(state: HostState): void {
	const mobile = isMobileAgent();
	const baseSize = readNumber(state.host, "--mosaique-base-size", mobile ? 12 : 4);
	const sizeVariation = readNumber(
		state.host,
		"--mosaique-size-variation",
		mobile ? 4 : 1.5,
	);
	const boundary = vwToPx(baseSize + sizeVariation);
	const maxX = state.canvas.width + boundary;
	const maxY = state.canvas.height + boundary;
	const minBoundary = -boundary;

	state.objects.forEach((obj) => {
		obj.x = Math.max(minBoundary, Math.min(obj.x, maxX));
		obj.y = Math.max(minBoundary, Math.min(obj.y, maxY));
	});
}

function moveObject(obj: ShadowObject, state: HostState): void {
	obj.x += obj.dirX * obj.speed;
	obj.y += obj.dirY * obj.speed;

	if (obj.x > state.canvas.width + obj.size / 2 || obj.x < -obj.size / 2) {
		obj.dirX *= -1;
	}
	if (obj.y > state.canvas.height + obj.size / 2 || obj.y < -obj.size / 2) {
		obj.dirY *= -1;
	}
}

function applyClipPath(state: HostState, pathSegments: string[]): void {
	if (pathSegments.length === 0) {
		state.canvas.style.clipPath = "none";
		state.canvas.style.setProperty("-webkit-clip-path", "none");
		return;
	}

	const pathString = pathSegments.join(" ");
	const clipPath = `path('${pathString}')`;
	state.canvas.style.clipPath = clipPath;
	state.canvas.style.setProperty("-webkit-clip-path", clipPath);
	state.canvas.style.willChange = "clip-path";
	state.canvas.style.transform = "translateZ(0)";
}

function draw(state: HostState): void {
	const items = getTargetItems(state.host);
	if (items.length === 0) {
		state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
		applyClipPath(state, []);
		return;
	}

	state.offscreenCtx.clearRect(
		0,
		0,
		state.offscreenCanvas.width,
		state.offscreenCanvas.height,
	);

	state.objects.forEach((obj) => {
		state.offscreenCtx.beginPath();
		state.offscreenCtx.arc(obj.x, obj.y, obj.size, 0, VARPI, false);
		state.offscreenCtx.fillStyle = obj.color;
		state.offscreenCtx.shadowColor = obj.color;
		state.offscreenCtx.shadowBlur = isMobileAgent() ? 0 : 50;
		state.offscreenCtx.fill();
		moveObject(obj, state);
	});

	state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
	const parentRect = state.host.getBoundingClientRect();
	const pathSegments: string[] = [];

	items.forEach((item) => {
		const rect = item.getBoundingClientRect();
		const x = rect.left - parentRect.left;
		const y = rect.top - parentRect.top;
		pathSegments.push(
			`M${formatPathNumber(x)} ${formatPathNumber(y)}h${formatPathNumber(rect.width)}v${formatPathNumber(rect.height)}h${formatPathNumber(-rect.width)}Z`,
		);
		state.ctx.drawImage(
			state.offscreenCanvas,
			x,
			y,
			rect.width,
			rect.height,
			x,
			y,
			rect.width,
			rect.height,
		);
	});

	applyClipPath(state, pathSegments);
}

function hasActiveState(): boolean {
	return Array.from(states).some((state) => state.active);
}

function loop(now: number): void {
	let hasActive = false;

	states.forEach((state) => {
		if (!state.active) return;
		hasActive = true;
		const fps = Math.max(1, readNumber(state.host, "--mosaique-fps", 35));
		const interval = 1000 / fps;
		const delta = now - state.then;
		if (delta > interval) {
			draw(state);
			state.then = now - (delta % interval);
		}
	});

	rafId = hasActive ? requestAnimationFrame(loop) : null;
}

function ensureLoop(): void {
	if (rafId == null && hasActiveState()) {
		rafId = requestAnimationFrame(loop);
	}
}

function scheduleResize(state: HostState): void {
	const currentWidth = getViewportWidth();
	if (currentWidth === state.lastViewportWidth && state.canvas.width === state.host.offsetWidth) {
		return;
	}

	state.lastViewportWidth = currentWidth;
	if (state.resizeTimeoutId != null) {
		window.clearTimeout(state.resizeTimeoutId);
	}
	state.resizeTimeoutId = window.setTimeout(() => {
		state.resizeTimeoutId = null;
		resizeCanvas(state);
		clampObjectsToCanvas(state);
		state.then = performance.now();
		draw(state);
	}, RESIZE_DEBOUNCE_MS);
}

function createState(host: HTMLElement): HostState | null {
	host.querySelectorAll(`:scope > canvas[${CANVAS_ATTR}]`).forEach((el) => {
		el.remove();
	});

	const canvas = document.createElement("canvas");
	canvas.setAttribute(CANVAS_ATTR, "1");
	canvas.setAttribute("aria-hidden", "true");
	canvas.className = "MaskMosaiqueCanvas";

	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	const offscreenCanvas = document.createElement("canvas");
	const offscreenCtx = offscreenCanvas.getContext("2d");
	if (!offscreenCtx) return null;

	host.appendChild(canvas);
	host.setAttribute(ATTR, "1");

	const state: HostState = {
		host,
		canvas,
		ctx,
		offscreenCanvas,
		offscreenCtx,
		objects: [],
		active: false,
		then: performance.now(),
		resizeTimeoutId: null,
		lastViewportWidth: getViewportWidth(),
		resizeObserver: null,
	};

	resizeCanvas(state);
	createObjects(state);
	draw(state);
	return state;
}

export function initMaskMosaique(
	root: Document | Element = document,
): RuntimeDisconnect {
	const localStates: HostState[] = [];
	const intersectionObserver = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const state = localStates.find((item) => item.host === entry.target);
				if (!state) return;
				state.active = entry.isIntersecting;
				if (state.active) {
					state.then = performance.now();
					draw(state);
					ensureLoop();
				}
			});
		},
		{ rootMargin: "10% 0px", threshold: 0 },
	);

	root.querySelectorAll(HOST_SELECTOR).forEach((node) => {
		if (!(node instanceof HTMLElement)) return;
		const state = createState(node);
		if (!state) return;
		states.add(state);
		localStates.push(state);
		intersectionObserver.observe(node);

		if ("ResizeObserver" in window) {
			state.resizeObserver = new ResizeObserver(() => scheduleResize(state));
			state.resizeObserver.observe(node);
		}
	});

	const onResize = () => {
		localStates.forEach((state) => scheduleResize(state));
	};

	window.addEventListener("resize", onResize, { passive: true });
	window.visualViewport?.addEventListener("resize", onResize);

	return {
		disconnect: () => {
			intersectionObserver.disconnect();
			window.removeEventListener("resize", onResize);
			window.visualViewport?.removeEventListener("resize", onResize);

			localStates.forEach((state) => {
				if (state.resizeTimeoutId != null) {
					window.clearTimeout(state.resizeTimeoutId);
				}
				state.resizeObserver?.disconnect();
				states.delete(state);
				state.canvas.remove();
				state.host.removeAttribute(ATTR);
			});

			if (states.size === 0 && rafId != null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		},
	};
}
