export type GlitchRuntime = {
	disconnect: () => void;
};

type TimeoutId = ReturnType<typeof window.setTimeout>;

const GLITCH_SOURCE_SELECTOR =
	"img.bgGlitch";

/** ピクセル処理の長辺上限（これ以下に縮小。CSS で全体表示するため見た目は維持しやすい） */
const GLITCH_MAX_WORK_EDGE_PX = 960;

class GlitchCanvas {
	private readonly container: HTMLElement;
	private readonly sourceImage: HTMLImageElement;
	private readonly canvas: HTMLCanvasElement;
	private readonly ctx: CanvasRenderingContext2D;
	private readonly timeouts = new Set<TimeoutId>();
	private readonly frames = new Set<number>();
	private imageData: ImageData | null = null;
	private originalImageData: Uint8ClampedArray | null = null;
	private isGlitching = false;
	private disposed = false;
	private readonly reduceMotion: MediaQueryList;
	/** `shiftChannel` 用スナップショット（毎フレームの new を避ける） */
	private channelScratch: Uint8ClampedArray | null = null;
	/** `shiftRow` 用（行の slice / 一時配列の new を避ける） */
	private rowScratch: Uint8ClampedArray | null = null;
	private rowShiftedScratch: Uint8ClampedArray | null = null;
	/** `shiftColumn` 用（列バッファの new を避ける） */
	private columnScratch: Uint8ClampedArray | null = null;

	constructor(
		container: HTMLElement,
		sourceImage: HTMLImageElement,
		reduceMotion: MediaQueryList,
	) {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d", { willReadFrequently: true });

		if (!ctx) {
			throw new Error("Canvas 2D context is unavailable.");
		}

		this.container = container;
		this.sourceImage = sourceImage;
		this.canvas = canvas;
		this.ctx = ctx;
		this.reduceMotion = reduceMotion;

		this.sourceImage.classList.add("glitch-source");
		this.canvas.classList.add("glitch-canvas");
		this.canvas.setAttribute("aria-hidden", "true");
		this.container.appendChild(this.canvas);

		void this.init();
	}

	private async init() {
		await this.waitForImage();
		if (this.disposed) return;

		const naturalW = this.sourceImage.naturalWidth || this.container.clientWidth;
		const naturalH =
			this.sourceImage.naturalHeight || this.container.clientHeight;

		if (naturalW <= 0 || naturalH <= 0) return;

		const maxEdge = Math.max(naturalW, naturalH);
		const scale =
			maxEdge > 0
				? Math.min(1, GLITCH_MAX_WORK_EDGE_PX / maxEdge)
				: 1;
		const width = Math.max(1, Math.round(naturalW * scale));
		const height = Math.max(1, Math.round(naturalH * scale));

		this.canvas.width = width;
		this.canvas.height = height;
		this.drawImage();
	}

	private waitForImage() {
		if (
			this.sourceImage.complete &&
			this.sourceImage.naturalWidth > 0
		) {
			return Promise.resolve();
		}

		return new Promise<void>((resolve) => {
			const cleanup = () => {
				this.sourceImage.removeEventListener("load", onComplete);
				this.sourceImage.removeEventListener("error", onComplete);
			};
			const onComplete = () => {
				cleanup();
				resolve();
			};

			this.sourceImage.addEventListener("load", onComplete, {
				once: true,
			});
			this.sourceImage.addEventListener("error", onComplete, {
				once: true,
			});
		});
	}

	private drawImage() {
		try {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.imageSmoothingEnabled = true;
			this.ctx.imageSmoothingQuality = "high";
			this.ctx.drawImage(
				this.sourceImage,
				0,
				0,
				this.canvas.width,
				this.canvas.height,
			);
			this.imageData = this.ctx.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height,
			);
			this.originalImageData = new Uint8ClampedArray(
				this.imageData.data,
			);
			this.allocateScratchBuffers(
				this.canvas.width,
				this.canvas.height,
				this.imageData.data.length,
			);
		} catch {
			this.imageData = null;
			this.originalImageData = null;
			this.channelScratch = null;
			this.rowScratch = null;
			this.rowShiftedScratch = null;
			this.columnScratch = null;
		}
	}

	private allocateScratchBuffers(
		width: number,
		height: number,
		dataLength: number,
	) {
		if (this.channelScratch?.length !== dataLength) {
			this.channelScratch = new Uint8ClampedArray(dataLength);
		}
		const rowBytes = width * 4;
		if (this.rowScratch?.length !== rowBytes) {
			this.rowScratch = new Uint8ClampedArray(rowBytes);
			this.rowShiftedScratch = new Uint8ClampedArray(rowBytes);
		}
		const colBytes = height * 4;
		if (this.columnScratch?.length !== colBytes) {
			this.columnScratch = new Uint8ClampedArray(colBytes);
		}
	}

	start() {
		if (this.disposed || this.reduceMotion.matches || this.isGlitching) {
			return;
		}
		this.isGlitching = true;
		this.scheduleGlitch();
	}

	stop() {
		this.isGlitching = false;
		this.clearPendingWork();
		if (!this.imageData || !this.originalImageData) return;
		this.imageData.data.set(this.originalImageData);
		this.ctx.putImageData(this.imageData, 0, 0);
	}

	disconnect() {
		this.disposed = true;
		this.stop();
		this.sourceImage.classList.remove("glitch-source");
		this.canvas.remove();
	}

	isFor(container: HTMLElement) {
		return this.container === container;
	}

	private scheduleGlitch() {
		if (!this.isGlitching || this.disposed) return;

		const timeout = window.setTimeout(() => {
			this.timeouts.delete(timeout);
			this.applyGlitchWithTransition();
			this.scheduleGlitch();
		}, Math.random() * 1500 + 750);

		this.timeouts.add(timeout);
	}

	private applyGlitchWithTransition() {
		if (!this.imageData || !this.originalImageData) return;
		this.imageData.data.set(this.originalImageData);
		this.applyGlitchStepByStep();
	}

	private applyGlitchStepByStep() {
		if (!this.imageData || !this.originalImageData) return;

		const steps = Math.floor(Math.random() * 10) + 3;
		let currentStep = 0;

		let frame = 0;
		const animate = () => {
			this.frames.delete(frame);
			if (
				this.disposed ||
				!this.isGlitching ||
				!this.imageData ||
				!this.originalImageData
			) {
				return;
			}

			if (currentStep >= steps) {
				const timeout = window.setTimeout(() => {
					this.timeouts.delete(timeout);
					if (!this.imageData || !this.originalImageData) return;
					this.imageData.data.set(this.originalImageData);
					this.ctx.putImageData(this.imageData, 0, 0);
				}, 500);
				this.timeouts.add(timeout);
				return;
			}

			const progress = currentStep / steps;
			this.imageData.data.set(this.originalImageData);
			this.applyHorizontalShiftWithProgress(progress);
			this.applyRgbShiftWithProgress(progress);
			this.applyVerticalShiftWithProgress(progress);
			this.ctx.putImageData(this.imageData, 0, 0);
			currentStep += 1;

			frame = window.requestAnimationFrame(animate);
			this.frames.add(frame);
		};

		frame = window.requestAnimationFrame(animate);
		this.frames.add(frame);
	}

	private applyHorizontalShiftWithProgress(progress: number) {
		if (!this.imageData) return;

		const { data, width, height } = this.imageData;
		const intensity = Math.sin(progress * Math.PI) ** 0.5;
		const glitchRows = Math.floor(intensity * 20) + 10;

		for (let i = 0; i < glitchRows; i += 1) {
			const row = Math.floor(Math.random() * height);
			const offset = Math.round((Math.random() - 0.5) * 1 * intensity);
			this.shiftRow(data, width, height, row, offset);
		}
	}

	private applyRgbShiftWithProgress(progress: number) {
		if (!this.imageData) return;

		const { data } = this.imageData;
		const intensity = Math.sin(progress * Math.PI) ** 0.35;
		const pattern = Math.floor(Math.random() * 3);
		const getBalancedShift = (baseShift: number) => {
			const direction = Math.random() < 0.5 ? 1 : -1;
			const magnitude = Math.random() * baseShift;
			return Math.floor(direction * magnitude * intensity);
		};

		if (pattern === 0) {
			this.shiftChannel(data, 0, getBalancedShift(20));
			this.shiftChannel(data, 1, getBalancedShift(10));
			return;
		}

		if (pattern === 1) {
			this.shiftChannel(data, 2, getBalancedShift(30));
			this.shiftChannel(data, 1, getBalancedShift(20));
			return;
		}

		this.shiftChannel(data, 0, getBalancedShift(10));
		this.shiftChannel(data, 2, getBalancedShift(30));
	}

	private applyVerticalShiftWithProgress(progress: number) {
		if (!this.imageData) return;

		const { data, width, height } = this.imageData;
		const intensity = Math.sin(progress * Math.PI) ** 0.5;
		const glitchCols = Math.floor(intensity * 50) + 5;

		for (let i = 0; i < glitchCols; i += 1) {
			const col = Math.floor(Math.random() * width);
			const offset = Math.round((Math.random() - 0.5) * 300 * intensity);
			this.shiftColumn(data, width, height, col, offset);
		}
	}

	private shiftChannel(
		data: Uint8ClampedArray,
		channel: 0 | 1 | 2,
		shift: number,
	) {
		if (shift === 0) return;

		const source = this.channelScratch;
		if (!source || source.length !== data.length) return;

		source.set(data);
		for (let i = 0; i < data.length; i += 4) {
			const targetIndex = i + shift * 4;
			if (targetIndex >= 0 && targetIndex < source.length) {
				data[i + channel] = source[targetIndex + channel];
			}
		}
	}

	private shiftRow(
		data: Uint8ClampedArray,
		width: number,
		height: number,
		row: number,
		offset: number,
	) {
		if (height <= 0 || width <= 0) return;

		const rowStart = row * width * 4;
		const rowEnd = rowStart + width * 4;
		const rowScratch = this.rowScratch;
		const shiftedRow = this.rowShiftedScratch;
		if (!rowScratch || !shiftedRow || rowScratch.length !== width * 4) {
			return;
		}

		rowScratch.set(data.subarray(rowStart, rowEnd));

		for (let i = 0; i < width; i += 1) {
			const sourceIndex = i * 4;
			const targetColumn = (i + offset + width) % width;
			const targetIndex = targetColumn * 4;

			shiftedRow[targetIndex] = rowScratch[sourceIndex];
			shiftedRow[targetIndex + 1] = rowScratch[sourceIndex + 1];
			shiftedRow[targetIndex + 2] = rowScratch[sourceIndex + 2];
			shiftedRow[targetIndex + 3] = rowScratch[sourceIndex + 3];
		}

		data.set(shiftedRow, rowStart);
	}

	private shiftColumn(
		data: Uint8ClampedArray,
		width: number,
		height: number,
		col: number,
		offset: number,
	) {
		if (height <= 0 || width <= 0) return;

		const colData = this.columnScratch;
		if (!colData || colData.length !== height * 4) return;

		for (let row = 0; row < height; row += 1) {
			const index = (row * width + col) * 4;
			colData[row * 4] = data[index];
			colData[row * 4 + 1] = data[index + 1];
			colData[row * 4 + 2] = data[index + 2];
			colData[row * 4 + 3] = data[index + 3];
		}

		for (let row = 0; row < height; row += 1) {
			const targetRow = (row + offset + height) % height;
			const targetIndex = (targetRow * width + col) * 4;

			data[targetIndex] = colData[row * 4];
			data[targetIndex + 1] = colData[row * 4 + 1];
			data[targetIndex + 2] = colData[row * 4 + 2];
			data[targetIndex + 3] = colData[row * 4 + 3];
		}
	}

	private clearPendingWork() {
		this.timeouts.forEach((timeout) => window.clearTimeout(timeout));
		this.timeouts.clear();
		this.frames.forEach((frame) => window.cancelAnimationFrame(frame));
		this.frames.clear();
	}
}

export function initGlitch(root: HTMLElement): GlitchRuntime {
	const triggers = [...root.querySelectorAll<HTMLElement>(".js-bgTrigger")];
	const bgItems = [...root.querySelectorAll<HTMLElement>(".bgItem")];
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	const glitchCanvases: GlitchCanvas[] = [];
	const controller = new AbortController();
	let nav: HTMLElement | null = null;
	let scrollRaf = 0;
	let lastTriggerIndex = -1;

	bgItems.forEach((item) => {
		item.setAttribute("aria-hidden", "true");
		if (!item.classList.contains("__glitch")) return;

		const image = item.querySelector<HTMLImageElement>(
			GLITCH_SOURCE_SELECTOR,
		);
		if (!image) return;

		try {
			glitchCanvases.push(new GlitchCanvas(item, image, reduceMotion));
		} catch {
			/* Canvasなしでも背景表示は継続する */
		}
	});

	const resolveBgIndex = (triggerIndex: number): number => {
		if (bgItems.length === 0) return 0;
		return Math.min(Math.max(0, triggerIndex), bgItems.length - 1);
	};

	const activate = (triggerIndex: number) => {
		const bgIndex = resolveBgIndex(triggerIndex);

		triggers.forEach((trigger, i) => {
			const isCurrent = i === triggerIndex;
			trigger.classList.toggle("current", isCurrent);
			if (isCurrent) {
				trigger.setAttribute("aria-current", "true");
			} else {
				trigger.removeAttribute("aria-current");
			}
		});

		bgItems.forEach((item, itemIndex) => {
			const isCurrent = itemIndex === bgIndex;
			item.classList.toggle("show", isCurrent);
			item.setAttribute("aria-hidden", isCurrent ? "false" : "true");
			item.querySelectorAll(".JsLetterToggle").forEach((letter) => {
				letter.classList.toggle("show", isCurrent);
			});
		});

		glitchCanvases.forEach((canvas) => canvas.stop());
		const activeItem = bgItems[bgIndex];
		const activeCanvas = glitchCanvases.find((canvas) =>
			canvas.isFor(activeItem),
		);
		activeCanvas?.start();

		nav?.querySelectorAll<HTMLButtonElement>(".navDot").forEach(
			(dot, dotIndex) => {
				const isCurrent = dotIndex === triggerIndex;
				dot.classList.toggle("current", isCurrent);
				dot.setAttribute("aria-current", isCurrent ? "true" : "false");
			},
		);
	};

	/** ビューポート中央を基準に、現在のセクション番号（0 始まり）を一意に決める */
	const getActiveTriggerIndex = (): number => {
		if (triggers.length === 0) return 0;
		const mark = window.innerHeight * 0.5;
		for (let i = triggers.length - 1; i >= 0; i--) {
			if (triggers[i].getBoundingClientRect().top <= mark) {
				return i;
			}
		}
		return 0;
	};

	const syncFromScroll = () => {
		const next = getActiveTriggerIndex();
		if (next === lastTriggerIndex) return;
		lastTriggerIndex = next;
		activate(next);
	};

	const scheduleSyncFromScroll = () => {
		if (scrollRaf !== 0) return;
		scrollRaf = window.requestAnimationFrame(() => {
			scrollRaf = 0;
			syncFromScroll();
		});
	};

	if (triggers.length > 0) {
		nav = document.createElement("nav");
		nav.className = "bgNav";
		nav.setAttribute("aria-label", "glitch section navigation");

		triggers.forEach((trigger, index) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "navDot";
			button.setAttribute("aria-label", `section ${index + 1}`);
			button.addEventListener(
				"click",
				() => {
					trigger.scrollIntoView({
						behavior: reduceMotion.matches ? "auto" : "smooth",
						block: "start",
					});
				},
				{ signal: controller.signal },
			);
			nav?.appendChild(button);
		});

		root.appendChild(nav);
		scheduleSyncFromScroll();

		window.addEventListener("scroll", scheduleSyncFromScroll, {
			passive: true,
			signal: controller.signal,
		});
		window.addEventListener("resize", scheduleSyncFromScroll, {
			signal: controller.signal,
		});
	}

	return {
		disconnect: () => {
			controller.abort();
			if (scrollRaf !== 0) {
				window.cancelAnimationFrame(scrollRaf);
				scrollRaf = 0;
			}
			glitchCanvases.forEach((canvas) => canvas.disconnect());
			nav?.remove();
			triggers.forEach((trigger) => {
				trigger.classList.remove("current");
				trigger.removeAttribute("aria-current");
			});
			bgItems.forEach((item) => {
				item.classList.remove("show");
				item.removeAttribute("aria-hidden");
				item.querySelectorAll(".JsLetterToggle").forEach((letter) => {
					letter.classList.remove("show");
				});
			});
		},
	};
}
