import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
	drawPageTransitionLabel,
	playPageTransitionMosaique,
} from "../lib/effects/maskMosaique";
import {
	readPageTransitionCanvasLabel,
	resolveCssColorOnElement,
	waitForPageTransitionCanvasFont,
} from "../lib/effects/pageTransitionCanvasLabel";
import { LoadingLayer } from "./LoadingLayer";

const InitialLoadingStorageKey = "InitialLoadingViewed";
const BODY_PENDING_CLASS = "SiteTransitionPending";
const BOOT_ELEMENT_ID = "InitialLoadingBoot";

/** index.html の静的ファーストペイント要素を、キャンバス側の準備が整った時点で除去する。 */
function removeBootElement() {
	document.getElementById(BOOT_ELEMENT_ID)?.remove();
}

/** TOP `.MindMap .about_p` と同じ文言に手動で揃える。 */
export const INITIAL_LOADING_LABEL_TEXT = "yuremono\nworks";

// デバッグ時は true にすると、sessionStorage を無視してリロードごとに表示します。
const InitialLoadingAlwaysShow = false;

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
	const anchor = document.querySelector<HTMLElement>(".MindMap .about_p");
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

	const label = readPageTransitionCanvasLabel(
		INITIAL_LOADING_LABEL_TEXT,
		source,
		textStyleSource,
	);
	// JsLetter(spanWrap)と同じ「--first-delay + index * --letter-delay」の式でキャンバスラベルを1文字ずつ出す。
	const firstDelayMs = readTimeMs(style.getPropertyValue("--first-delay"), 800);
	const stepDelayMs = readTimeMs(style.getPropertyValue("--letter-delay"), 37.5);
	const charAppearAtMs: number[] = [];
	let letterIndex = 0;
	for (const ch of label.text.replace(/\r?\n/g, "")) {
		if (ch.trim() === "") continue;
		charAppearAtMs.push(firstDelayMs + letterIndex * stepDelayMs);
		letterIndex += 1;
	}
	label.charAppearAtMs = charAppearAtMs;

	return {
		color: resolveCssColorOnElement(rawColor, "#101010", source),
		label,
		minimumMs,
		sizeFactor: Number.isFinite(sizeFactor) ? sizeFactor : 0.01875,
		stagger: pageTransitionMs,
	};
}

function paintCanvasFrame(
	canvas: HTMLCanvasElement,
	color: string,
	label: ReturnType<typeof readInitialLoadingOptions>["label"],
) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.fillStyle = color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	drawPageTransitionLabel(
		ctx,
		[{ x: 0, y: 0, w: canvas.width, h: canvas.height, startAt: 0 }],
		label,
	);
}

function fillCanvas(
	canvas: HTMLCanvasElement,
	color: string,
	label: ReturnType<typeof readInitialLoadingOptions>["label"],
) {
	canvas.width = Math.max(1, window.innerWidth);
	canvas.height = Math.max(1, window.innerHeight);
	canvas.style.width = `${canvas.width}px`;
	canvas.style.height = `${canvas.height}px`;
	paintCanvasFrame(canvas, color, label);
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

	useLayoutEffect(() => {
		if (typeof document === "undefined") return;
		if (!active) {
			document.body.classList.remove(BODY_PENDING_CLASS);
			removeBootElement();
			return;
		}

		document.body.classList.add(BODY_PENDING_CLASS);
		return () => {
			document.body.classList.remove(BODY_PENDING_CLASS);
		};
	}, [active]);

	useEffect(() => {
		if (!active) return;

		let alive = true;
		let minimumTimeoutId: number | null = null;
		let labelRafId: number | null = null;
		const root = rootRef.current ?? document.documentElement;
		const canvas = canvasRef.current;

		const stopLabelLoop = () => {
			if (labelRafId != null) {
				window.cancelAnimationFrame(labelRafId);
				labelRafId = null;
			}
		};

		if (!canvas) {
			setSessionViewed(storageKey);
			removeBootElement();
			const fallbackTimeoutId = window.setTimeout(() => setActive(false), 0);
			return () => window.clearTimeout(fallbackTimeoutId);
		}

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
				options.label.appearBaseTimeMs = performance.now();
				fillCanvas(canvas, options.color, options.label);
				removeBootElement();
				document.body.classList.remove(BODY_PENDING_CLASS);

				const appearTimes = options.label.charAppearAtMs ?? [];
				const lastAppearMs = Math.max(0, ...appearTimes);
				if (appearTimes.length > 0) {// 文字が出揃うまで再描画する。reveal 開始後はモザイク側の毎フレーム描画が同じラベルを引き継ぐ
					const tick = () => {
						if (!alive) return;
						paintCanvasFrame(canvas, options.color, options.label);
						const elapsed =
							performance.now() - (options.label.appearBaseTimeMs ?? 0);
						const allVisible =
							(options.label.visibleCharCount ?? 0) >= appearTimes.length;
						// キュー型（1フレーム最大1文字）なので完了は時刻でなく表示数で判定する。時間側は暴走防止の保険
						labelRafId =
							!allVisible && elapsed <= lastAppearMs + 5000
								? window.requestAnimationFrame(tick)
								: null;
					};
					labelRafId = window.requestAnimationFrame(tick);
				}

				minimumTimeoutId = window.setTimeout(() => {
					window.setTimeout(() => {
						if (!alive) return;
						stopLabelLoop();
						void playPageTransitionMosaique(canvas, "reveal", options).then(
							() => {
						if (!alive) return;
						setSessionViewed(storageKey);
						setActive(false);
					},
				);
					}, 0);
				}, Math.max(options.minimumMs, lastAppearMs));
			});
		});

		return () => {
			alive = false;
			stopLabelLoop();
			if (minimumTimeoutId != null) {
				window.clearTimeout(minimumTimeoutId);
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
