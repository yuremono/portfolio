const HOST_SELECTOR = ".MaskMosaique";
const ITEM_SELECTOR =
	":scope > :not(canvas):not(script):not(style), :scope [data-mask-mosaique-item]";
const ATTR = "data-mask-mosaique";
const CANVAS_ATTR = "data-mask-mosaique-canvas";

export type RuntimeDisconnect = { disconnect: () => void };

interface MosaicTile {
	x: number;
	y: number;
	w: number;
	h: number;
	item: HTMLElement;
	order: number;
	delay: number;
}

interface Glow {
	x: number;
	y: number;
	r: number;
	vx: number;
	vy: number;
	color: string;
}

interface HostState {
	host: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	tiles: MosaicTile[];
	glows: Glow[];
	startTime: number | null;
	revealed: boolean;
}

const states = new Set<HostState>();

function readNumber(el: HTMLElement, name: string, fallback: number): number {
	const raw = getComputedStyle(el).getPropertyValue(name).trim();
	if (!raw) return fallback;
	const value = Number.parseFloat(raw);
	return Number.isFinite(value) ? value : fallback;
}

function readColors(el: HTMLElement): string[] {
	const raw = getComputedStyle(el).getPropertyValue("--mosaique-colors").trim();
	if (!raw) {
		return ["#3548fe", "#2d38b7", "#4855db", "#151a36"];
	}
	return raw
		.split(",")
		.map((color) => color.trim())
		.filter(Boolean);
}

function getItems(host: HTMLElement): HTMLElement[] {
	const seen = new Set<HTMLElement>();
	const items: HTMLElement[] = [];
	host.querySelectorAll(ITEM_SELECTOR).forEach((node) => {
		if (!(node instanceof HTMLElement)) return;
		if (node.hasAttribute(CANVAS_ATTR)) return;
		const directHost = node.closest(HOST_SELECTOR);
		if (directHost !== host) return;
		if (seen.has(node)) return;
		seen.add(node);
		items.push(node);
	});
	return items;
}

function resizeCanvas(state: HostState) {
	const rect = state.host.getBoundingClientRect();
	const dpr = Math.min(window.devicePixelRatio || 1, 2);
	const width = Math.max(1, Math.round(rect.width));
	const height = Math.max(1, Math.round(rect.height));
	state.canvas.width = Math.round(width * dpr);
	state.canvas.height = Math.round(height * dpr);
	state.canvas.style.width = `${width}px`;
	state.canvas.style.height = `${height}px`;
	state.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	buildTiles(state);
	buildGlows(state);
}

function buildTiles(state: HostState) {
	const hostRect = state.host.getBoundingClientRect();
	const factor = readNumber(state.host, "--mosaique-size-factor", 0.01875);
	const items = getItems(state.host);
	const tiles: MosaicTile[] = [];

	items.forEach((item) => {
		const rect = item.getBoundingClientRect();
		const x0 = rect.left - hostRect.left;
		const y0 = rect.top - hostRect.top;
		const cols = Math.max(1, Math.ceil(rect.width * factor));
		const rows = Math.max(1, Math.ceil(rect.height * factor));
		const tileW = Math.ceil(rect.width / cols);
		const tileH = Math.ceil(rect.height / rows);

		for (let y = 0; y < rows; y += 1) {
			for (let x = 0; x < cols; x += 1) {
				const w = x === cols - 1 ? rect.width - x * tileW : tileW;
				const h = y === rows - 1 ? rect.height - y * tileH : tileH;
				const delay = readNumber(item, "--mosaique-delay", 0);
				tiles.push({
					x: x0 + x * tileW,
					y: y0 + y * tileH,
					w,
					h,
					item,
					order: Math.random(),
					delay,
				});
			}
		}
	});

	state.tiles = tiles.sort((a, b) => a.order - b.order);
}

function buildGlows(state: HostState) {
	const colors = readColors(state.host);
	const width = state.canvas.clientWidth;
	const height = state.canvas.clientHeight;
	const amount = Math.max(3, Math.min(12, Math.ceil((width * height) / 180000)));
	state.glows = Array.from({ length: amount }, (_, index) => ({
		x: Math.random() * width,
		y: Math.random() * height,
		r: Math.max(width, height) * (0.18 + Math.random() * 0.16),
		vx: (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.55),
		vy: (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.45),
		color: colors[index % colors.length],
	}));
}

function clipToItems(ctx: CanvasRenderingContext2D, state: HostState) {
	const hostRect = state.host.getBoundingClientRect();
	ctx.beginPath();
	getItems(state.host).forEach((item) => {
		const rect = item.getBoundingClientRect();
		ctx.rect(
			rect.left - hostRect.left,
			rect.top - hostRect.top,
			rect.width,
			rect.height,
		);
	});
	ctx.clip();
}

function drawGlows(state: HostState) {
	const { ctx, canvas } = state;
	ctx.save();
	clipToItems(ctx, state);
	ctx.globalCompositeOperation = "source-over";
	state.glows.forEach((glow) => {
		glow.x += glow.vx;
		glow.y += glow.vy;
		if (glow.x < -glow.r || glow.x > canvas.clientWidth + glow.r) glow.vx *= -1;
		if (glow.y < -glow.r || glow.y > canvas.clientHeight + glow.r) glow.vy *= -1;

		const gradient = ctx.createRadialGradient(
			glow.x,
			glow.y,
			0,
			glow.x,
			glow.y,
			glow.r,
		);
		gradient.addColorStop(0, glow.color);
		gradient.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	});
	ctx.restore();
}

function drawTiles(state: HostState, progress: number) {
	const color = getComputedStyle(state.host)
		.getPropertyValue("--mosaique-mask-color")
		.trim();
	state.ctx.fillStyle = color || getComputedStyle(state.host).backgroundColor;
	state.tiles.forEach((tile, index) => {
		const tileProgress = Math.min(
			1,
			Math.max(0, progress - tile.delay / readNumber(state.host, "--mosaique-duration", 900)),
		);
		const threshold = 1 - index / state.tiles.length;
		if (tileProgress >= threshold) return;
		state.ctx.fillRect(tile.x, tile.y, tile.w, tile.h);
	});
}

function drawState(state: HostState, now: number) {
	const { ctx, canvas } = state;
	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	drawGlows(state);

	if (state.startTime != null && !state.revealed) {
		const duration = readNumber(state.host, "--mosaique-duration", 900);
		const delay = readNumber(state.host, "--mosaique-delay", 0);
		const elapsed = Math.max(0, now - state.startTime - delay);
		const progress = Math.min(1, elapsed / duration);
		drawTiles(state, progress);
		const maxTileDelay = state.tiles.reduce(
			(max, tile) => Math.max(max, tile.delay),
			0,
		);
		if (elapsed >= duration + maxTileDelay) {
			state.revealed = true;
		}
	} else if (state.startTime == null) {
		drawTiles(state, 0);
	}
}

let rafId: number | null = null;

function loop(now: number) {
	states.forEach((state) => drawState(state, now));
	rafId = states.size > 0 ? requestAnimationFrame(loop) : null;
}

function ensureLoop() {
	if (rafId == null) {
		rafId = requestAnimationFrame(loop);
	}
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
		tiles: [],
		glows: [],
		startTime: null,
		revealed: false,
	};
	resizeCanvas(state);
	return state;
}

export function initMaskMosaique(
	root: Document | Element = document,
): RuntimeDisconnect {
	const localStates: HostState[] = [];
	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) return;
				const state = localStates.find((item) => item.host === entry.target);
				if (!state || state.startTime != null) return;
				state.startTime = performance.now();
				observer.unobserve(state.host);
			});
		},
		{ rootMargin: "0px 0px -20% 0px", threshold: 0.05 },
	);

	root.querySelectorAll(HOST_SELECTOR).forEach((node) => {
		if (!(node instanceof HTMLElement)) return;
		const state = createState(node);
		if (!state) return;
		states.add(state);
		localStates.push(state);
		observer.observe(node);
	});

	const onResize = () => {
		localStates.forEach((state) => resizeCanvas(state));
	};

	window.addEventListener("resize", onResize, { passive: true });
	ensureLoop();

	return {
		disconnect: () => {
			observer.disconnect();
			window.removeEventListener("resize", onResize);
			localStates.forEach((state) => {
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
