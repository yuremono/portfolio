export type GlitchRuntime = {
	disconnect: () => void;
};

type TimeoutId = ReturnType<typeof window.setTimeout>;

const GLITCH_SOURCE_SELECTOR =
	"img:not(.bgOverImg):not(.bgPhone):not(.bgFrame)";

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

		const width = this.sourceImage.naturalWidth || this.container.clientWidth;
		const height =
			this.sourceImage.naturalHeight || this.container.clientHeight;

		if (width <= 0 || height <= 0) return;

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
		} catch {
			this.imageData = null;
			this.originalImageData = null;
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
		}, Math.random() * 2500 + 500);

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
				}, 200);
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

		const { data } = this.imageData;
		const { width, height } = this.canvas;
		const intensity = Math.sin(progress * Math.PI);
		const glitchRows = Math.floor(intensity * 5) + 1;

		for (let i = 0; i < glitchRows; i += 1) {
			const row = Math.floor(Math.random() * height);
			const offset = Math.round((Math.random() - 0.5) * 10 * intensity);
			this.shiftRow(data, width, height, row, offset);
		}
	}

	private applyRgbShiftWithProgress(progress: number) {
		if (!this.imageData) return;

		const { data } = this.imageData;
		const intensity = Math.sin(progress * Math.PI);
		const pattern = Math.floor(Math.random() * 3);
		const getBalancedShift = (baseShift: number) => {
			const direction = Math.random() < 0.5 ? 1 : -1;
			const magnitude = Math.random() * baseShift;
			return Math.floor(direction * magnitude * intensity);
		};

		if (pattern === 0) {
			this.shiftChannel(data, 0, getBalancedShift(20));
			this.shiftChannel(data, 1, getBalancedShift(20));
			return;
		}

		if (pattern === 1) {
			this.shiftChannel(data, 2, getBalancedShift(20));
			this.shiftChannel(data, 1, getBalancedShift(20));
			return;
		}

		this.shiftChannel(data, 0, getBalancedShift(20));
		this.shiftChannel(data, 2, getBalancedShift(20));
	}

	private applyVerticalShiftWithProgress(progress: number) {
		if (!this.imageData) return;

		const { data } = this.imageData;
		const { width, height } = this.canvas;
		const intensity = Math.sin(progress * Math.PI);
		const glitchCols = Math.floor(intensity * 2) + 1;

		for (let i = 0; i < glitchCols; i += 1) {
			const col = Math.floor(Math.random() * width);
			const offset = Math.round((Math.random() - 0.5) * 100 * intensity);
			this.shiftColumn(data, width, height, col, offset);
		}
	}

	private shiftChannel(
		data: Uint8ClampedArray,
		channel: 0 | 1 | 2,
		shift: number,
	) {
		if (shift === 0) return;

		const source = new Uint8ClampedArray(data);
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
		const rowData = data.slice(rowStart, rowEnd);
		const shiftedData = new Uint8ClampedArray(rowData.length);

		for (let i = 0; i < width; i += 1) {
			const sourceIndex = i * 4;
			const targetColumn = (i + offset + width) % width;
			const targetIndex = targetColumn * 4;

			shiftedData[targetIndex] = rowData[sourceIndex];
			shiftedData[targetIndex + 1] = rowData[sourceIndex + 1];
			shiftedData[targetIndex + 2] = rowData[sourceIndex + 2];
			shiftedData[targetIndex + 3] = rowData[sourceIndex + 3];
		}

		data.set(shiftedData, rowStart);
	}

	private shiftColumn(
		data: Uint8ClampedArray,
		width: number,
		height: number,
		col: number,
		offset: number,
	) {
		if (height <= 0 || width <= 0) return;

		const colData = new Uint8ClampedArray(height * 4);
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
	let observer: IntersectionObserver | null = null;
	let nav: HTMLElement | null = null;

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

	const activate = (index: number) => {
		triggers.forEach((trigger, triggerIndex) => {
			const isCurrent = triggerIndex === index;
			trigger.classList.toggle("current", isCurrent);
			if (isCurrent) {
				trigger.setAttribute("aria-current", "true");
			} else {
				trigger.removeAttribute("aria-current");
			}
		});

		bgItems.forEach((item, itemIndex) => {
			const isCurrent = itemIndex === index;
			item.classList.toggle("show", isCurrent);
			item.setAttribute("aria-hidden", isCurrent ? "false" : "true");
			item.querySelectorAll(".JsLetterToggle").forEach((letter) => {
				letter.classList.toggle("show", isCurrent);
			});
		});

		glitchCanvases.forEach((canvas) => canvas.stop());
		const activeItem = bgItems[index];
		const activeCanvas = glitchCanvases.find(
			(canvas) => canvas.isFor(activeItem),
		);
		activeCanvas?.start();

		nav?.querySelectorAll<HTMLButtonElement>(".navDot").forEach(
			(dot, dotIndex) => {
				const isCurrent = dotIndex === index;
				dot.classList.toggle("current", isCurrent);
				dot.setAttribute("aria-current", isCurrent ? "true" : "false");
			},
		);
	};

	if (triggers.length > 0) {
		nav = document.createElement("nav");
		nav.className = "bgNav";
		nav.setAttribute("aria-label", "glitch section navigation");

		triggers.forEach((trigger, index) => {
			trigger.dataset.bgIndex = String(index);

			const button = document.createElement("button");
			button.type = "button";
			button.className = "navDot";
			button.dataset.bgIndex = String(index);
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
		activate(0);

		if ("IntersectionObserver" in window) {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (!entry.isIntersecting) return;
						const index = Number(
							(entry.target as HTMLElement).dataset.bgIndex,
						);
						if (Number.isNaN(index)) return;
						activate(index);
					});
				},
				{ threshold: 0.5 },
			);
			triggers.forEach((trigger) => observer?.observe(trigger));
		}
	}

	return {
		disconnect: () => {
			controller.abort();
			observer?.disconnect();
			glitchCanvases.forEach((canvas) => canvas.disconnect());
			nav?.remove();
			triggers.forEach((trigger) => {
				trigger.classList.remove("current");
				trigger.removeAttribute("aria-current");
				delete trigger.dataset.bgIndex;
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
