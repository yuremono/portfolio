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

export interface PageTransitionMosaiqueOptions {
	color?: string;
	label?: PageTransitionMosaiqueLabel;
	sizeFactor?: number;
	stagger?: number;
}

export type PageTransitionMosaiquePhase = "cover" | "reveal";

export interface PageTransitionMosaiqueLabel {
	color?: string;
	fontFamily?: string;
	fontSize?: number;
	fontStyle?: string;
	fontWeight?: string;
	lineHeight?: number;
	text: string;
}

const RESIZE_DEBOUNCE_MS = 200; // 画面サイズ変更後、モザイクの位置と分割数を再計算するまでの待ち時間。
const SQUARE_OVERLAP_PX = 1; // canvasの小数座標で出るマス同士の境目を隠すための重なり幅。

function readNumber(el: HTMLElement, name: string, fallback: number): number {
	const raw = getComputedStyle(el).getPropertyValue(name).trim();
	if (!raw) return fallback;
	const value = Number.parseFloat(raw);
	return Number.isFinite(value) ? value : fallback;
}

function formatPathNumber(value: number): string {
	return Number(value.toFixed(3)).toString();
}

function readCssValue(el: HTMLElement, name: string, fallback: string): string {
	const raw = getComputedStyle(el).getPropertyValue(name).trim();
	return raw || fallback;
}

// data-mask-mosaique-itemが付いた要素だけを覆います。
// 指定がない場合は、canvas/script/style以外の直下要素を対象にします。
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

// canvas全体を表示するのではなく、対象要素の矩形部分だけに切り抜きます。
// これにより、モザイクのフタはテキストや画像など対象要素の上にだけ重なります。
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

// host要素と同じサイズにcanvasを合わせ、切り抜き範囲も作り直します。
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

// 対象要素ごとに矩形を小さなマスへ分割します。
// --mosaique-size-factor は MaskMosaique要素に指定するCSS変数で、値が大きいほどマスが細かくなります。
// --mosaique-stagger は最後のマスが消え始めるまでの時間幅で、値が大きいほど全体がゆっくり消えます。
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

function buildRectSquares(
	width: number,
	height: number,
	factor: number,
	stagger: number,
): MosaicSquare[] {
	const cols = Math.max(1, Math.ceil(width * factor));
	const rows = Math.max(1, Math.ceil(height * factor));
	const squareSizeX = Math.ceil(width / cols);
	const squareSizeY = Math.ceil(height / rows);
	const squares: MosaicSquare[] = [];

	for (let y = 0; y < rows; y += 1) {
		for (let x = 0; x < cols; x += 1) {
			const w = x === cols - 1 ? width - x * squareSizeX : squareSizeX;
			const h = y === rows - 1 ? height - y * squareSizeY : squareSizeY;
			squares.push({
				x: x * squareSizeX,
				y: y * squareSizeY,
				w,
				h,
				startAt: 0,
			});
		}
	}

	const order = squares
		.map((_, index) => index)
		.sort(() => Math.random() - 0.5);
	order.forEach((squareIndex, orderIndex) => {
		squares[squareIndex].startAt =
			squares.length <= 1
				? 0
				: (orderIndex / (squares.length - 1)) * stagger;
	});

	return squares;
}

// --mosaique-color の色で、まだ消えていないマスだけをcanvasへ描画します。
// 時間が進むほど描画されるマスが減り、下にある対象要素がランダムに現れます。
function draw(state: HostState, now = performance.now()): void {
	const color = readCssValue(state.host, "--mosaique-color", "#101010");
	const elapsed = state.startTime == null ? 0 : now - state.startTime;

	state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
	state.ctx.fillStyle = color;

	let visibleCount = 0;
	state.squares.forEach((square) => {
		if (state.startTime != null && elapsed >= square.startAt) return;
		state.ctx.fillRect(
			square.x - SQUARE_OVERLAP_PX,
			square.y - SQUARE_OVERLAP_PX,
			square.w + SQUARE_OVERLAP_PX * 2,
			square.h + SQUARE_OVERLAP_PX * 2,
		);
		visibleCount += 1;
	});

	if (state.startTime != null && visibleCount === 0) {
		state.complete = true;
	}
}

function drawPageTransitionMosaique(
	ctx: CanvasRenderingContext2D,
	squares: MosaicSquare[],
	color: string,
	phase: PageTransitionMosaiquePhase,
	elapsed: number,
	label?: PageTransitionMosaiqueLabel,
): boolean {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = color;

	let visibleCount = 0;
	const visibleSquares: MosaicSquare[] = [];
	squares.forEach((square) => {
		const visible =
			phase === "cover"
				? elapsed >= square.startAt
				: elapsed < square.startAt;
		if (!visible) return;
		visibleSquares.push(square);

		ctx.fillRect(
			square.x - SQUARE_OVERLAP_PX,
			square.y - SQUARE_OVERLAP_PX,
			square.w + SQUARE_OVERLAP_PX * 2,
			square.h + SQUARE_OVERLAP_PX * 2,
		);
		visibleCount += 1;
	});

	if (label) {
		drawPageTransitionLabel(ctx, visibleSquares, label);
	}

	return phase === "cover"
		? visibleCount === squares.length
		: visibleCount === 0;
}

export function drawPageTransitionLabel(
	ctx: CanvasRenderingContext2D,
	clipSquares: MosaicSquare[],
	label: PageTransitionMosaiqueLabel,
) {
	const lines = label.text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	if (lines.length === 0 || clipSquares.length === 0) return;

	const fontSize = Math.round(
		label.fontSize ?? Math.min(Math.max(ctx.canvas.width * 0.08, 48), 120),
	);
	const fontFamily = label.fontFamily ?? "sans-serif";
	const fontStyle = label.fontStyle ?? "italic";
	const fontWeight = label.fontWeight ?? "400";
	const lineHeight = fontSize * (label.lineHeight ?? 1);
	const firstLineY =
		ctx.canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

	ctx.save();
	ctx.beginPath();
	clipSquares.forEach((square) => {
		ctx.rect(
			square.x - SQUARE_OVERLAP_PX,
			square.y - SQUARE_OVERLAP_PX,
			square.w + SQUARE_OVERLAP_PX * 2,
			square.h + SQUARE_OVERLAP_PX * 2,
		);
	});
	ctx.clip();
	ctx.fillStyle = label.color ?? "#ffffff";
	ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	lines.forEach((line, index) => {
		ctx.fillText(
			line,
			ctx.canvas.width / 2,
			firstLineY + index * lineHeight,
		);
	});
	ctx.restore();
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

// 初期化時や再実行時に、canvasサイズ、対象マス、初期描画を作り直します。
function reset(state: HostState): void {
	stopAnimation(state);
	state.startTime = null;
	state.complete = false;
	resizeCanvas(state);
	buildSquares(state);
	draw(state);
}

// リサイズ時は現在の完了状態を保ったまま、位置とマスだけを作り直します。
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

export function playPageTransitionMosaique(
	canvas: HTMLCanvasElement,
	phase: PageTransitionMosaiquePhase,
	options: PageTransitionMosaiqueOptions = {},
): Promise<void> {
	const ctx = canvas.getContext("2d");
	if (!ctx) return Promise.resolve();

	const width = Math.max(1, window.innerWidth);
	const height = Math.max(1, window.innerHeight);
	const factor = options.sizeFactor ?? 0.01875;
	const stagger = options.stagger ?? 750;
	const color = options.color ?? "#101010";
	const label = options.label;
	const squares = buildRectSquares(width, height, factor, stagger);

	canvas.width = width;
	canvas.height = height;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;

	return new Promise((resolve) => {
		let rafId: number | null = null;
		const startTime = performance.now();

		const finish = () => {
			if (phase === "cover") {
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			} else {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
			rafId = null;
			resolve();
		};

		const tick = (now: number) => {
			const complete = drawPageTransitionMosaique(
				ctx,
				squares,
				color,
				phase,
				now - startTime,
				label,
			);

			if (complete) {
				finish();
				return;
			}

			rafId = requestAnimationFrame(tick);
		};

		rafId = requestAnimationFrame(tick);
		if (rafId == null) {
			resolve();
		}
	});
}
