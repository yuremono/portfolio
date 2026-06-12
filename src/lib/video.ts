/**
 * MV 動画・YouTube: ビューポート連動
 * 元: js/function.js 407–448 行
 */

import {
	isDocumentVisible,
	subscribeDocumentVisibility,
} from "./pageVisibility";

const SELECTOR = ".video_container,.video_container2";
const ATTR = "data-video-io";
const THRESHOLD = 0.1;

export type RuntimeDisconnect = { disconnect: () => void };

export function initVideo(
	root: Document | Element = document,
): RuntimeDisconnect {
	const base = root;
	const isReducedMotion =
		typeof window !== "undefined" &&
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	let isPageVisible = isDocumentVisible();
	const visibleContainers: HTMLElement[] = [];
	const containerVisibility = new WeakMap<HTMLElement, boolean>();

	const syncPlayback = () => {
		const activeContainer = visibleContainers.find(
			(container) => containerVisibility.get(container) === true,
		);

		for (const container of visibleContainers) {
			const video = container.querySelector<HTMLVideoElement>("video");

			const shouldPlay =
				!isReducedMotion &&
				isPageVisible &&
				activeContainer === container;
			const iframe = container.querySelector("iframe");
			if (iframe?.src.includes("youtube.com")) {
				const command = shouldPlay ? "playVideo" : "pauseVideo";
				iframe.contentWindow?.postMessage(
					JSON.stringify({
						event: "command",
						func: command,
						args: "",
					}),
					"https://www.youtube.com",
				);
			}
			if (!video) continue;
			video.preload = shouldPlay
				? "auto"
				: isReducedMotion && isPageVisible && activeContainer === container
					? "metadata"
					: "none";

			if (!shouldPlay) {
				if (!video.paused) {
					video.pause();
				}
				continue;
			}

			if (video.dataset.src && !video.getAttribute("src")) {
				video.setAttribute("src", video.dataset.src);
				video.load();
			}
			if (video.paused) {
				void video.play().catch(() => {});
			}
		}
	};

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const container = entry.target;
				if (!(container instanceof HTMLElement)) continue;

				containerVisibility.set(container, entry.isIntersecting);
				if (entry.isIntersecting && !visibleContainers.includes(container)) {
					visibleContainers.push(container);
				}

			}
			syncPlayback();
		},
		{ threshold: THRESHOLD },
	);

	const disconnectVisibility = subscribeDocumentVisibility((visible) => {
		isPageVisible = visible;
		syncPlayback();
	});

	base.querySelectorAll(SELECTOR).forEach((el) => {
		if (!(el instanceof HTMLElement)) return;
		if (el.hasAttribute(ATTR)) return;
		el.setAttribute(ATTR, "1");
		observer.observe(el);
		visibleContainers.push(el);
	});

	syncPlayback();

	return {
		disconnect: () => {
			disconnectVisibility();
			observer.disconnect();
			base.querySelectorAll(`[${ATTR}]`).forEach((e) => {
				e.removeAttribute(ATTR);
			});
			for (const container of visibleContainers) {
				const video = container.querySelector<HTMLVideoElement>("video");
				if (video && !video.paused) {
					video.pause();
				}
			}
			visibleContainers.length = 0;
		},
	};
}
