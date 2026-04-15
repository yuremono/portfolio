import type { RuntimeDisconnect } from "../../lib/initClientRuntime";

type ShuffleElement = HTMLElement & {
	dataset: HTMLElement["dataset"] & {
		originalHtml?: string;
		shuffled?: string;
	};
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function parseHtmlToParts(html: string): string[] {
	const parts: string[] = [];
	const regex = /(<br\s*\/?>|&[a-zA-Z0-9#]+;|.)/gi;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(html)) !== null) {
		parts.push(match[0]);
	}

	return parts;
}

function shuffleArray<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

function clearTimeouts(timeouts: Set<number>) {
	timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
	timeouts.clear();
}

function splitImage(img: HTMLImageElement): HTMLCanvasElement[] {
	const width = img.naturalWidth;
	const height = img.naturalHeight;

	if (!width || !height || img.dataset.shuffleDivideProcessed === "true") {
		return [];
	}

	const canvasA = document.createElement("canvas");
	const canvasB = document.createElement("canvas");
	canvasA.width = canvasB.width = width;
	canvasA.height = canvasB.height = height;

	const ctxA = canvasA.getContext("2d");
	const ctxB = canvasB.getContext("2d");
	if (!ctxA || !ctxB) return [];

	ctxA.drawImage(img, 0, 0, width, height);
	ctxB.drawImage(img, 0, 0, width, height);

	const rects: Array<{ x: number; y: number; w: number; h: number }> = [];
	for (let i = 0; i < 50; i += 1) {
		const ratio = [
			[1, 1],
			[1, 2],
			[2, 1],
		][Math.floor(Math.random() * 3)];
		if (!ratio) continue;

		const baseSize = Math.floor(Math.random() * (width / 10)) + 100;
		const w =
			ratio[0] > ratio[1]
				? baseSize
				: Math.floor((baseSize * ratio[0]) / ratio[1]);
		const h =
			ratio[1] > ratio[0]
				? baseSize
				: Math.floor((baseSize * ratio[1]) / ratio[0]);
		const expandedWidth = width * 1.5;
		const expandedHeight = height * 1.5;
		const offsetX = width * -0.25;
		const offsetY = height * -0.25;
		const x = Math.floor(Math.random() * (expandedWidth - w)) + offsetX;
		const y = Math.floor(Math.random() * (expandedHeight - h)) + offsetY;

		rects.push({ x, y, w, h });
	}

	ctxA.clearRect(0, 0, width, height);
	ctxA.save();
	ctxA.beginPath();
	rects.forEach((rect) => ctxA.rect(rect.x, rect.y, rect.w, rect.h));
	ctxA.clip();
	ctxA.drawImage(img, 0, 0);
	ctxA.restore();

	ctxB.save();
	ctxB.beginPath();
	rects.forEach((rect) => ctxB.rect(rect.x, rect.y, rect.w, rect.h));
	ctxB.clip();
	ctxB.clearRect(0, 0, width, height);
	ctxB.restore();
	ctxB.globalCompositeOperation = "destination-in";
	ctxB.drawImage(img, 0, 0);
	ctxB.globalCompositeOperation = "source-over";

	img.dataset.shuffleDivideProcessed = "true";
	img.parentElement?.append(canvasA, canvasB);

	return [canvasA, canvasB];
}

export function initShuffleDivide(root: Document | Element): RuntimeDisconnect {
	const cleanups: Array<() => void> = [];
	const timeouts = new Set<number>();
	const generatedCanvases = new Set<HTMLCanvasElement>();
	const processedImages = new Set<HTMLImageElement>();
	const shuffleOriginals = new Map<
		ShuffleElement,
		{
			html: string;
			height: string;
			width: string;
		}
	>();

	const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
	const prefersReducedMotion = () => mediaQuery.matches;

	const trackTimeout = (callback: () => void, delay: number) => {
		const timeoutId = window.setTimeout(() => {
			timeouts.delete(timeoutId);
			callback();
		}, delay);
		timeouts.add(timeoutId);
		return timeoutId;
	};

	const processPanelImages = (panel: Element) => {
		if (prefersReducedMotion()) return;

		panel.querySelectorAll<HTMLImageElement>(".GenerateBox img").forEach((img) => {
			const process = () => {
				const canvases = splitImage(img);
				if (canvases.length === 0) return;
				processedImages.add(img);
				canvases.forEach((canvas) => generatedCanvases.add(canvas));
			};

			if (img.complete && img.naturalWidth > 0) {
				process();
				return;
			}

			const onLoad = () => process();
			img.addEventListener("load", onLoad, { once: true });
			cleanups.push(() => img.removeEventListener("load", onLoad));
		});
	};

	root.querySelectorAll<HTMLElement>(".tabContainer").forEach(
		(container, containerIndex) => {
			const tabs = Array.from(container.querySelectorAll<HTMLButtonElement>(".tab"));
			const panels = Array.from(container.querySelectorAll<HTMLElement>(".tabPanel"));
			const tabList = container.querySelector<HTMLElement>(".tabButtons");
			const nextButton =
				container.querySelector<HTMLButtonElement>(".tab-next-button");
			let currentIndex = 0;

			tabList?.setAttribute("role", "tablist");

			const activateTab = (activeIndex: number, focusTab = true) => {
				tabs.forEach((tab, tabIndex) => {
					const panel = panels[tabIndex];
					const isActive = activeIndex === tabIndex;
					tab.setAttribute("aria-selected", String(isActive));
					tab.setAttribute("tabindex", isActive ? "0" : "-1");
					if (panel) {
						panel.hidden = !isActive;
						panel.classList.toggle("show", isActive);
					}
				});

				currentIndex = activeIndex;

				if (focusTab && window.innerWidth > 834) {
					tabs[activeIndex]?.focus({ preventScroll: true });
				}

				const activePanel = panels[activeIndex];
				if (!activePanel) return;
				trackTimeout(() => processPanelImages(activePanel), 50);
			};

			tabs.forEach((tab, tabIndex) => {
				const panel = panels[tabIndex];
				if (!panel) return;

				const tabId = `shuffle-divide-tab-${containerIndex}-${tabIndex}`;
				const panelId = `shuffle-divide-panel-${containerIndex}-${tabIndex}`;

				tab.setAttribute("role", "tab");
				tab.setAttribute("id", tabId);
				tab.setAttribute("aria-controls", panelId);
				tab.setAttribute("tabindex", tabIndex === 0 ? "0" : "-1");
				tab.setAttribute("aria-selected", tabIndex === 0 ? "true" : "false");

				panel.setAttribute("role", "tabpanel");
				panel.setAttribute("id", panelId);
				panel.setAttribute("aria-labelledby", tabId);

				const onClick = () => activateTab(tabIndex);
				const onKeyDown = (event: KeyboardEvent) => {
					let newIndex: number | null = null;
					switch (event.key) {
						case "ArrowRight":
							newIndex = (tabIndex + 1) % tabs.length;
							break;
						case "ArrowLeft":
							newIndex = (tabIndex - 1 + tabs.length) % tabs.length;
							break;
						case "Home":
							newIndex = 0;
							break;
						case "End":
							newIndex = tabs.length - 1;
							break;
						default:
							break;
					}

					if (newIndex === null) return;
					event.preventDefault();
					tabs[newIndex]?.focus();
					activateTab(newIndex, false);
				};

				tab.addEventListener("click", onClick);
				tab.addEventListener("keydown", onKeyDown);
				cleanups.push(() => {
					tab.removeEventListener("click", onClick);
					tab.removeEventListener("keydown", onKeyDown);
				});
			});

			if (nextButton) {
				const onNextClick = () => {
					const nextIndex = (currentIndex + 1) % panels.length;
					activateTab(nextIndex, false);
				};
				nextButton.addEventListener("click", onNextClick);
				cleanups.push(() => nextButton.removeEventListener("click", onNextClick));
			}

			activateTab(0, false);
			const firstPanel = panels[0];
			if (firstPanel) trackTimeout(() => processPanelImages(firstPanel), 100);
		},
	);

	const initializeShuffleElement = (element: ShuffleElement) => {
		const originalHtml = element.innerHTML;
		const rect = element.getBoundingClientRect();
		const contentSpan = document.createElement("span");
		contentSpan.innerHTML = originalHtml;

		shuffleOriginals.set(element, {
			html: originalHtml,
			height: element.style.height,
			width: element.style.width,
		});
		element.dataset.originalHtml = originalHtml;
		if (rect.height > 0) element.style.height = `${rect.height}px`;
		if (rect.width > 0) element.style.width = `${rect.width}px`;
		element.replaceChildren(contentSpan);

		return contentSpan;
	};

	const animateShuffleElement = (
		element: ShuffleElement,
		contentSpan: HTMLSpanElement,
	) => {
		if (prefersReducedMotion()) return;

		contentSpan.classList.add("show");
		const originalHtml = element.dataset.originalHtml;
		if (!originalHtml) return;

		const originalParts = parseHtmlToParts(originalHtml);
		const shuffledState = shuffleArray(originalParts);
		let shuffleStep = 0;
		let restoreStep = 0;

		const restoreNext = () => {
			const restoreSteps = 10;
			if (restoreStep < restoreSteps) {
				const progress = (restoreStep + 1) / restoreSteps;
				const targetCount = Math.floor(originalParts.length * progress);
				const partialRestore = [...shuffledState];
				for (let i = 0; i < targetCount; i += 1) {
					partialRestore[i] = originalParts[i] ?? "";
				}
				contentSpan.innerHTML = partialRestore.join("");
				restoreStep += 1;
				trackTimeout(restoreNext, 50);
				return;
			}

			contentSpan.innerHTML = originalHtml;
		};

		const performShuffle = () => {
			if (shuffleStep < 1) {
				contentSpan.innerHTML = shuffleArray(originalParts).join("");
				shuffleStep += 1;
				trackTimeout(performShuffle, 50);
				return;
			}

			restoreNext();
		};

		trackTimeout(performShuffle, 100);
	};

	if (!prefersReducedMotion()) {
		const shuffleElements = Array.from(
			root.querySelectorAll<ShuffleElement>(".shuffle"),
		);
		const observer =
			"IntersectionObserver" in window
				? new IntersectionObserver(
						(entries) => {
							entries.forEach((entry) => {
								const target = entry.target as ShuffleElement;
								if (
									entry.isIntersecting &&
									target.dataset.shuffled !== "true" &&
									!prefersReducedMotion()
								) {
									target.dataset.shuffled = "true";
									const contentSpan = target.querySelector<HTMLSpanElement>(
										":scope > span",
									);
									if (contentSpan) animateShuffleElement(target, contentSpan);
								}
							});
						},
						{
							rootMargin: "0px 0px -20% 0px",
							threshold: 0.1,
						},
					)
				: null;

		shuffleElements.forEach((element) => {
			const contentSpan = initializeShuffleElement(element);
			if (observer) {
				observer.observe(element);
				return;
			}
			animateShuffleElement(element, contentSpan);
		});

		if (observer) cleanups.push(() => observer.disconnect());
	}

	return {
		disconnect: () => {
			cleanups.forEach((cleanup) => cleanup());
			cleanups.length = 0;
			clearTimeouts(timeouts);

			generatedCanvases.forEach((canvas) => canvas.remove());
			generatedCanvases.clear();
			processedImages.forEach((img) => {
				delete img.dataset.shuffleDivideProcessed;
			});
			processedImages.clear();

			shuffleOriginals.forEach((original, element) => {
				element.innerHTML = original.html;
				element.style.height = original.height;
				element.style.width = original.width;
				delete element.dataset.originalHtml;
				delete element.dataset.shuffled;
			});
			shuffleOriginals.clear();
		},
	};
}
