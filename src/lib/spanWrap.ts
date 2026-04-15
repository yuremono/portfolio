/**
 * .p-split p の中身を元jQueryの文字分割に合わせて span 化する。
 * spanWrap は分割だけを担当し、show の付け外しは Intersection 側で扱う。
 */

import { escapeHtmlTextChar } from "./escapeHtmlText";

const ATTR_DONE = "data-span-wrap";
const SELECTOR = ".p-split p";
const DELAY_STEP = 0.05;

export type RuntimeDisconnect = { disconnect: () => void };

function delayStyle(index: number) {
	return `transition-delay:calc(var(--bgTR) + ${index * DELAY_STEP}s)`;
}

function wrapText(text: string, index: { count: number }) {
	return text
		.replace(/\r?\n/g, "")
		.split("")
		.reduce((acc, char) => {
			if (char.trim() === "") {
				return acc + escapeHtmlTextChar(char);
			}

			const span = `<span style="${delayStyle(index.count)}">${escapeHtmlTextChar(char)}</span>`;
			index.count += 1;
			return acc + span;
		}, "");
}

function wrapElement(element: HTMLElement, index: { count: number }) {
	const span = `<span style="${delayStyle(index.count)}">${element.outerHTML}</span>`;
	index.count += 1;
	return span;
}

function convert(target: HTMLElement) {
	const index = { count: 0 };
	let html = "";

	target.childNodes.forEach((node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			html += wrapText(node.textContent ?? "", index);
			return;
		}

		if (node instanceof HTMLBRElement) {
			html += "<br>";
			return;
		}

		if (node instanceof HTMLElement) {
			html += wrapElement(node, index);
		}
	});

	target.innerHTML = html;
}

export function initSpanWrap(
	root: Document | Element = document,
): RuntimeDisconnect {
	const base = root;

	base.querySelectorAll(SELECTOR).forEach((el) => {
		if (!(el instanceof HTMLElement)) return;
		if (el.hasAttribute(ATTR_DONE)) return;
		el.setAttribute(ATTR_DONE, "1");
		convert(el);
	});

	return {
		disconnect: () => {
			/* StrictMode 二重実行で二重ラップしないよう、属性は外さない */
		},
	};
}
