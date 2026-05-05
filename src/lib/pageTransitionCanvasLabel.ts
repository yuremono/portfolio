import type { PageTransitionMosaiqueLabel } from "./effects/maskMosaique";

function readNumber(value: string, fallback: number) {
	const parsed = Number.parseFloat(value.trim());
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolveCssColorOnElement(
	value: string,
	fallback: string,
	scope: Element,
) {
	const probe = document.createElement("span");
	probe.style.color = value || fallback;
	scope.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	probe.remove();
	return resolved || fallback;
}

/**
 * ページ遷移モザイクと初期ロードで canvas 文言の見た目を揃える。
 * `scope` は `--pageTR` / `--page-rect-bg` と同じ樹のルート、`textStyleSource` は `.InitialLoadingTextProbe` 相当。
 */
export function readPageTransitionCanvasLabel(
	text: string,
	scope: Element,
	textStyleSource: Element,
): PageTransitionMosaiqueLabel {
	const textStyle = getComputedStyle(textStyleSource);
	const rawTextColor = textStyle.color || "#ffffff";
	const fontSize = readNumber(textStyle.fontSize, 96);
	const lineHeightPx = readNumber(textStyle.lineHeight, fontSize);

	return {
		color: resolveCssColorOnElement(rawTextColor, "#ffffff", scope),
		fontFamily: textStyle.fontFamily || "sans-serif",
		fontSize,
		fontStyle: textStyle.fontStyle || "normal",
		fontWeight: textStyle.fontWeight || "300",
		lineHeight: lineHeightPx / fontSize,
		text,
	};
}

export function waitForPageTransitionCanvasFont(
	label: PageTransitionMosaiqueLabel,
) {
	if (typeof document === "undefined" || !("fonts" in document)) {
		return Promise.resolve();
	}

	const font = `${label.fontStyle ?? "normal"} ${label.fontWeight ?? "400"} ${label.fontSize}px ${label.fontFamily}`;
	return Promise.race([
		document.fonts.load(font, label.text).then(() => undefined),
		new Promise<void>((resolve) => window.setTimeout(resolve, 250)),
	]);
}
