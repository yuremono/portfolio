import { loadDefaultJapaneseParser } from "budoux";

const ATTR = "data-budoux-scroll";
const SELECTOR = ".BudouxScroll";
const PHRASE_CLASS = "BudouxScrollPhrase";
const ZWSP = "\u200B";

type BudouxParser = ReturnType<typeof loadDefaultJapaneseParser>;

export interface InitBudouxScrollOptions {
	minOpacity?: number;
	trigger?: number;
	range?: number;
	focus?: number;
}

export type RuntimeDisconnect = { disconnect: () => void };

interface BudouxScrollConfig {
	minOpacity: number;
	trigger: number;
	range: number;
}

interface BudouxScrollState {
	element: HTMLElement;
	phrases: HTMLElement[];
}

const DEFAULT_CONFIG: BudouxScrollConfig = {
	minOpacity: 0.3,
	trigger: 0.5,
	range: 1,
};

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function normalizeText(text: string) {
	return text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.join("");
}

function readNumber(value: string, fallback: number) {
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function readConfig(element: HTMLElement, options: InitBudouxScrollOptions) {
	const style = window.getComputedStyle(element);
	const fallbackTrigger = options.trigger ?? options.focus ?? DEFAULT_CONFIG.trigger;
	// 未表示文節の透明度
	const minOpacity = readNumber(
		style.getPropertyValue("--BudouxScrollMin"),
		options.minOpacity ?? DEFAULT_CONFIG.minOpacity,
	);
	// 各行の表示を始める画面内の高さ
	const trigger = readNumber(
		style.getPropertyValue("--BudouxScrollTrigger"),
		readNumber(
			style.getPropertyValue("--BudouxScrollFocus"),
			fallbackTrigger,
		),
	);
	// 1行を左から右へ表示するスクロール距離
	const range = readNumber(
		style.getPropertyValue("--BudouxScrollRange"),
		options.range ?? DEFAULT_CONFIG.range,
	);

	return {
		minOpacity: clamp(minOpacity, 0, 1),
		trigger,
		range,
	};
}

function resolveViewportValue(value: number, viewportHeight: number) {
	return value <= 1 ? viewportHeight * value : value;
}

function resolveRangeValue(
	value: number,
	lineHeight: number,
) {
	return value <= 1 ? lineHeight * value : value;
}

function wrapTextNode(textNode: Text, parser: BudouxParser) {
	const text = normalizeText(textNode.nodeValue ?? "");
	if (!text) {
		textNode.remove();
		return;
	}

	const phrases = parser.parse(text).filter(Boolean);
	if (phrases.length === 0) return;

	const ownerDocument = textNode.ownerDocument;
	const fragment = ownerDocument.createDocumentFragment();
	phrases.forEach((phrase, index) => {
		const span = ownerDocument.createElement("span");
		span.className = PHRASE_CLASS;
		span.textContent = phrase;
		fragment.append(span);

		if (index < phrases.length - 1) {
			fragment.append(ownerDocument.createTextNode(ZWSP));
		}
	});

	textNode.replaceWith(fragment);
}

function wrapElement(element: HTMLElement, parser: BudouxParser) {
	Array.from(element.childNodes).forEach((node) => {
		if (node instanceof Text) {
			wrapTextNode(node, parser);
			return;
		}

		if (node instanceof HTMLBRElement) return;

		if (node instanceof HTMLElement) {
			if (node instanceof HTMLDivElement) return;
			wrapElement(node, parser);
		}
	});
}

function prepareElement(element: HTMLElement, parser: BudouxParser) {
	if (!element.hasAttribute(ATTR)) {
		element.setAttribute(ATTR, "1");
		wrapElement(element, parser);
	}

	return Array.from(element.querySelectorAll(`.${PHRASE_CLASS}`)).filter(
		(phrase): phrase is HTMLElement => phrase instanceof HTMLElement,
	);
}

function getTargets(base: Document | Element) {
	const targets = base instanceof HTMLElement && base.matches(SELECTOR)
		? [base]
		: [];

	targets.push(
		...Array.from(base.querySelectorAll(SELECTOR)).filter(
			(element): element is HTMLElement => element instanceof HTMLElement,
		),
	);

	return targets;
}

function updateState(state: BudouxScrollState, options: InitBudouxScrollOptions) {
	const config = readConfig(state.element, options);
	const viewportHeight =
		window.innerHeight || document.documentElement.clientHeight;
	const triggerY = resolveViewportValue(config.trigger, viewportHeight);

	const lines: Array<Array<{ phrase: HTMLElement; rect: DOMRect }>> = [];
	state.phrases.forEach((phrase) => {
		const rect = phrase.getBoundingClientRect();
		const currentLine = lines.at(-1);
		const lineTop = currentLine?.[0]?.rect.top;

		if (!currentLine || lineTop === undefined || Math.abs(rect.top - lineTop) > 2) {
			lines.push([{ phrase, rect }]);
			return;
		}

		currentLine.push({ phrase, rect });
	});

	lines.forEach((line) => {
		const lineTop = Math.min(...line.map(({ rect }) => rect.top));
		const lineHeight = Math.max(...line.map(({ rect }) => rect.height));
		const range = Math.max(1, resolveRangeValue(config.range, lineHeight));
		const progress = clamp((triggerY - lineTop) / range, 0, 1);
		const activeCount =
			lineTop > triggerY ? 0 : Math.max(1, Math.ceil(progress * line.length));

		line.forEach(({ phrase }, index) => {
			phrase.style.opacity =
				index < activeCount ? "1" : String(config.minOpacity);
		});
	});
}

export function initBudouxScroll(
	root: Document | Element = document,
	options: InitBudouxScrollOptions = {},
): RuntimeDisconnect {
	const base = root;
	const parser = loadDefaultJapaneseParser();
	const states = getTargets(base)
		.map((element) => ({
			element,
			phrases: prepareElement(element, parser),
		}))
		.filter((state) => state.phrases.length > 0);

	if (states.length === 0) {
		return {
			disconnect: () => {
				/* noop */
			},
		};
	}

	let rafId: number | null = null;

	const updateStates = () => {
		rafId = null;
		states.forEach((state) => updateState(state, options));
	};

	const scheduleUpdate = () => {
		if (rafId !== null) return;
		rafId = window.requestAnimationFrame(updateStates);
	};

	const observer = new IntersectionObserver(
		() => {
			scheduleUpdate();
		},
		{ rootMargin: "30% 0px 30% 0px" },
	);

	states.forEach((state) => {
		observer.observe(state.element);
	});

	window.addEventListener("scroll", scheduleUpdate, { passive: true });
	window.addEventListener("resize", scheduleUpdate);
	scheduleUpdate();

	return {
		disconnect: () => {
			observer.disconnect();
			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleUpdate);
			if (rafId !== null) {
				window.cancelAnimationFrame(rafId);
			}
		},
	};
}
