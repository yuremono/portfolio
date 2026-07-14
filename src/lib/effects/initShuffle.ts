import type { RuntimeDisconnect } from "../initClientRuntime";

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

export function initShuffle(root: Document | Element): RuntimeDisconnect {
	const cleanups: Array<() => void> = [];
	const timeouts = new Set<number>();
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

	const initShuffleElements = () => {
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
	};

	let disposed = false;
	if (!prefersReducedMotion()) {
		const rafId = window.requestAnimationFrame(() => {// 初回レイアウトでフォント要求を発火させてから、フォント確定後に採寸・初期化する（スワップ前の寸法で width/height を固定すると崩れるため）
			void document.fonts.ready.then(() => {
				if (disposed) return;
				initShuffleElements();
			});
		});
		cleanups.push(() => window.cancelAnimationFrame(rafId));
	}

	return {
		disconnect: () => {
			disposed = true;
			cleanups.forEach((cleanup) => cleanup());
			cleanups.length = 0;
			clearTimeouts(timeouts);

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
