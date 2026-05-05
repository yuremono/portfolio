import { useEffect, useRef, useState } from "react";

import {
	drawPageTransitionLabel,
	playPageTransitionMosaique,
} from "../lib/effects/maskMosaique";
import {
	readPageTransitionCanvasLabel,
	resolveCssColorOnElement,
	waitForPageTransitionCanvasFont,
} from "../lib/pageTransitionCanvasLabel";
import { LoadingLayer } from "./LoadingLayer";

const InitialLoadingStorageKey = "InitialLoadingViewed";

/** TOP `.mindMap .about_p` と同じ文言に手動で揃える。 */
export const INITIAL_LOADING_LABEL_TEXT = "yuremono\nworks";

// デバッグ時は true にすると、sessionStorage を無視してリロードごとに表示します。
const InitialLoadingAlwaysShow = true;

interface InitialLoadingOverlayProps {
	storageKey?: string;
}

function readTimeMs(value: string, fallback: number) {
	const trimmed = value.trim();
	if (!trimmed) return fallback;
	const parsed = Number.parseFloat(trimmed);
	if (!Number.isFinite(parsed)) return fallback;
	return trimmed.endsWith("ms") ? parsed : parsed * 1000;
}

function getSessionViewed(storageKey: string) {
	try {
		return window.sessionStorage.getItem(storageKey) === "1";
	} catch {
		return false;
	}
}

function setSessionViewed(storageKey: string) {
	try {
		window.sessionStorage.setItem(storageKey, "1");
	} catch {
		// Private browsing or disabled storage should not block the loader.
	}
}

/** lazy 済みレイアウトのアンカー。テキスト内容は読まず、タイミング用とスタイルプローブ用のみ。 */
function findPreferredAnchor(): Element | null {
	const anchor = document.querySelector<HTMLElement>(".mindMap .about_p");
	if (anchor?.textContent?.trim()) {
		return anchor;
	}
	return null;
}

function waitForPreferredAnchor(): Promise<Element | null> {
	const hit = findPreferredAnchor();
	if (hit) return Promise.resolve(hit);

	return new Promise((resolve) => {
		let timeoutId: number | null = null;
		const observer = new MutationObserver(() => {
			const el = findPreferredAnchor();
			if (!el) return;
			if (timeoutId != null) {
				window.clearTimeout(timeoutId);
			}
			observer.disconnect();
			resolve(el);
		});

		observer.observe(document.body, { childList: true, subtree: true });
		timeoutId = window.setTimeout(() => {
			observer.disconnect();
			resolve(findPreferredAnchor());
		}, 1000);
	});
}

function readInitialLoadingOptions(source: Element, textStyleSource: Element) {
	const style = getComputedStyle(source);
	const pageTransitionMs = readTimeMs(style.getPropertyValue("--pageTR"), 600);
	const minimumMs = readTimeMs(
		style.getPropertyValue("--initial-loading-min"),
		1000,
	);
	const rawColor =
		style.getPropertyValue("--page-rect-bg").trim() ||
		style.getPropertyValue("--MC").trim() ||
		"#101010";
	const sizeFactor = Number.parseFloat(
		style.getPropertyValue("--page-rect-size").trim(),
	);

	return {
		color: resolveCssColorOnElement(rawColor, "#101010", source),
		label: readPageTransitionCanvasLabel(
			INITIAL_LOADING_LABEL_TEXT,
			source,
			textStyleSource,
		),
		minimumMs,
		sizeFactor: Number.isFinite(sizeFactor) ? sizeFactor : 0.01875,
		stagger: pageTransitionMs,
	};
}

function fillCanvas(
	canvas: HTMLCanvasElement,
	color: string,
	label: ReturnType<typeof readInitialLoadingOptions>["label"],
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	canvas.width = Math.max(1, window.innerWidth);
	canvas.height = Math.max(1, window.innerHeight);
	canvas.style.width = `${canvas.width}px`;
	canvas.style.height = `${canvas.height}px`;
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	drawPageTransitionLabel(
		ctx,
		[{ x: 0, y: 0, w: canvas.width, h: canvas.height, startAt: 0 }],
		label,
	);
}

export function InitialLoadingOverlay({
	storageKey = InitialLoadingStorageKey,
}: InitialLoadingOverlayProps) {
	const [active, setActive] = useState(
		() => InitialLoadingAlwaysShow || !getSessionViewed(storageKey),
	);
	const [probeHtml, setProbeHtml] = useState("");
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const rootRef = useRef<HTMLDivElement | null>(null);
	const textStyleRef = useRef<HTMLParagraphElement | null>(null);

	useEffect(() => {
		if (!active) return;

		let alive = true;
		const root = rootRef.current ?? document.documentElement;
		const canvas = canvasRef.current;

		if (!canvas) {
			if (!InitialLoadingAlwaysShow) {
				setSessionViewed(storageKey);
			}
			const fallbackTimeoutId = window.setTimeout(() => setActive(false), 0);
			return () => window.clearTimeout(fallbackTimeoutId);
		}

		let timeoutId: number | null = null;
		void waitForPreferredAnchor().then((anchor) => {
			if (!alive) return;
			if (anchor) {
				setProbeHtml(anchor.innerHTML);
			}
			const options = readInitialLoadingOptions(
				root,
				textStyleRef.current ?? root,
			);
			void waitForPageTransitionCanvasFont(options.label).then(() => {
				if (!alive) return;
				fillCanvas(canvas, options.color, options.label);
				timeoutId = window.setTimeout(() => {
					void playPageTransitionMosaique(canvas, "reveal", options).then(() => {
						if (!alive) return;
						if (!InitialLoadingAlwaysShow) {
							setSessionViewed(storageKey);
						}
						setActive(false);
					});
				}, options.minimumMs);
			});
		});

		return () => {
			alive = false;
			if (timeoutId != null) {
				window.clearTimeout(timeoutId);
			}
		};
	}, [storageKey, active]);

	return (
		<div
			ref={rootRef}
			className={`InitialLoading ${active ? "" : "InitialLoadingDone"}`}
		>
			<LoadingLayer
				active={active}
				className="InitialLoadingLayer"
				opacity={active ? 1 : 0}
			>
				<p
					ref={textStyleRef}
					className="InitialLoadingTextProbe mmPin"
					aria-hidden="true"
					dangerouslySetInnerHTML={probeHtml ? { __html: probeHtml } : undefined}
				/>
				<canvas
					ref={canvasRef}
					className="InitialLoadingCanvas"
					aria-hidden="true"
				/>
			</LoadingLayer>
		</div>
	);
}
