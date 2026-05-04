const HOST_SELECTOR = ".MaskMosaique";
const ATTR = "data-mask-mosaique";
const CANVAS_ATTR = "data-mask-mosaique-canvas";
const ITEM_ATTR = "data-mask-mosaique-item";

export type RuntimeDisconnect = { disconnect: () => void };

interface MosaicSquare {
	x: number;
	y: number;
	w: number;
	h: number;
	startAt: number;
}

interface HostState {
	host: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	squares: MosaicSquare[];
	startTime: number | null;
	complete: boolean;
	rafId: number | null;
	resizeTimeoutId: number | null;
	resizeObserver: ResizeObserver | null;
}

const RESIZE_DEBOUNCE_MS = 200;

function readNumber(el: HTMLElement, name: string, fallback: number): number {
	const raw = getComputedStyle(el).getPropertyValue(name).trim();
	if (!raw) return fallback;
	const value = Number.parseFloat(raw);
	return Number.isFinite(value) ? value : fallback;
}

function formatPathNumber(value: number): string {
	return Number(value.toFixed(3)).toString();
}

function isTransparent(color: string): boolean {
	return (
		!color ||
		color === "transparent" ||
		color === "rgba(0, 0, 0, 0)" ||
		color === "rgba(0,0,0,0)"
	);
}

function getCoverColor(host: HTMLElement): string {
	let current: HTMLElement | null = host;
	while (current) {
		const color = getComputedStyle(current).backgroundColor;
		if (!isTransparent(color)) return color;
		current = current.parentElement;
	}
	return "#101010";
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

function applyClipPath(state: HostState): void {
	const hostRect = state.host.getBoundingClientRect();
	const pathSegments = getTargetItems(state.host).map((item) => {
		const rect = item.getBoundingClientRect();
		const x = rect.left - hostRect.left;
		const y = rect.top - hostRect.top;
		return `M${formatPathNumber(x)} ${formatPathNumber(y)}h${formatPathNumber(rect.width)}v${formatPathNumber(rect.height)}h${formatPathNumber(-rect.width)}Z`;
	});

	if (pathSegments.length === 0) {
		state.canvas.style.clipPath = "none";
		state.canvas.style.setProperty("-webkit-clip-path", "none");
		return;
	}

	const clipPath = `path('${pathSegments.join(" ")}')`;
	state.canvas.style.clipPath = clipPath;
	state.canvas.style.setProperty("-webkit-clip-path", clipPath);
	state.canvas.style.willChange = "clip-path";
	state.canvas.style.transform = "translateZ(0)";
}

function resizeCanvas(state: HostState): void {
	const width = state.host.offsetWidth;
	const height = state.host.offsetHeight;
	if (!width || !height) return;

	state.canvas.width = width;
	state.canvas.height = height;
	state.canvas.style.width = `${width}px`;
	state.canvas.style.height = `${height}px`;
	applyClipPath(state);
}

function buildSquares(state: HostState): void {
	const hostRect = state.host.getBoundingClientRect();
	const factor = readNumber(state.host, "--mosaique-size-factor", 0.01875);
	const stagger = readNumber(state.host, "--mosaique-stagger", 750);
	const squares: MosaicSquare[] = [];

	getTargetItems(state.host).forEach((item) => {
		const rect = item.getBoundingClientRect();
		const x0 = rect.left - hostRect.left;
		const y0 = rect.top - hostRect.top;
		const cols = Math.max(1, Math.ceil(rect.width * factor));
		const rows = Math.max(1, Math.ceil(rect.height * factor));
		const squareSizeX = Math.ceil(rect.width / cols);
		const squareSizeY = Math.ceil(rect.height / rows);

		for (let y = 0; y < rows; y += 1) {
			for (let x = 0; x < cols; x += 1) {
				const w = x === cols - 1 ? rect.width - x * squareSizeX : squareSizeX;
				const h = y === rows - 1 ? rect.height - y * squareSizeY : squareSizeY;
				squares.push({
					x: x0 + x * squareSizeX,
					y: y0 + y * squareSizeY,
					w,
					h,
					startAt: 0,
				});
			}
		}
	});

	const order = squares
		.map((_, index) => index)
		.sort(() => Math.random() - 0.5);
	order.forEach((squareIndex, orderIndex) => {
		squares[squareIndex].startAt =
			squares.length <= 1 ? 0 : (orderIndex / (squares.length - 1)) * stagger;
	});

	state.squares = squares;
}

function draw(state: HostState, now = performance.now()): void {
	const color = getCoverColor(state.host);
	const elapsed = state.startTime == null ? 0 : now - state.startTime;

	state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
	state.ctx.fillStyle = color;

	let visibleCount = 0;
	state.squares.forEach((square) => {
		if (state.startTime != null && elapsed >= square.startAt) return;
		state.ctx.fillRect(square.x, square.y, square.w, square.h);
		visibleCount += 1;
	});

	if (state.startTime != null && visibleCount === 0) {
		state.complete = true;
	}
}

function stopAnimation(state: HostState): void {
	if (state.rafId != null) {
		cancelAnimationFrame(state.rafId);
		state.rafId = null;
	}
}

function animate(state: HostState): void {
	stopAnimation(state);

	const tick = (now: number) => {
		draw(state, now);
		if (state.complete) {
			state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
			state.rafId = null;
			return;
		}
		state.rafId = requestAnimationFrame(tick);
	};

	state.rafId = requestAnimationFrame(tick);
}

function reset(state: HostState): void {
	stopAnimation(state);
	state.startTime = null;
	state.complete = false;
	resizeCanvas(state);
	buildSquares(state);
	draw(state);
}

function rebuild(state: HostState): void {
	resizeCanvas(state);
	buildSquares(state);
	if (state.complete) {
		state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
		return;
	}
	draw(state);
}

function scheduleRebuild(state: HostState): void {
	if (state.resizeTimeoutId != null) {
		window.clearTimeout(state.resizeTimeoutId);
	}
	state.resizeTimeoutId = window.setTimeout(() => {
		state.resizeTimeoutId = null;
		rebuild(state);
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

	host.appendChild(canvas);
	host.setAttribute(ATTR, "1");

	const state: HostState = {
		host,
		canvas,
		ctx,
		squares: [],
		startTime: null,
		complete: false,
		rafId: null,
		resizeTimeoutId: null,
		resizeObserver: null,
	};

	reset(state);
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
				if (!state || !entry.isIntersecting || state.startTime != null) return;
				state.startTime = performance.now();
				animate(state);
				intersectionObserver.unobserve(state.host);
			});
		},
		{ rootMargin: "0px 0px -20% 0px", threshold: 0.05 },
	);

	root.querySelectorAll(HOST_SELECTOR).forEach((node) => {
		if (!(node instanceof HTMLElement)) return;
		const state = createState(node);
		if (!state) return;
		localStates.push(state);
		intersectionObserver.observe(node);

		if ("ResizeObserver" in window) {
			state.resizeObserver = new ResizeObserver(() => scheduleRebuild(state));
			state.resizeObserver.observe(node);
		}
	});

	const onResize = () => {
		localStates.forEach((state) => scheduleRebuild(state));
	};

	window.addEventListener("resize", onResize, { passive: true });

	return {
		disconnect: () => {
			intersectionObserver.disconnect();
			window.removeEventListener("resize", onResize);

			localStates.forEach((state) => {
				stopAnimation(state);
				if (state.resizeTimeoutId != null) {
					window.clearTimeout(state.resizeTimeoutId);
				}
				state.resizeObserver?.disconnect();
				state.canvas.remove();
				state.host.removeAttribute(ATTR);
			});
		},
	};
}
