import { loadDefaultJapaneseParser } from "budoux";

const ATTR = "data-budoux-fade";
const SELECTOR = ".BudouxFade";
const PHRASE_CLASS = "BudouxFadePhrase";
const ZWSP = "\u200B";

type BudouxParser = ReturnType<typeof loadDefaultJapaneseParser>;

export interface InitBudouxFadeOptions {
	minOpacity?: number;
	trigger?: number;
	range?: number;
	focus?: number;
}

export type RuntimeDisconnect = { disconnect: () => void };

interface BudouxFadeConfig {
	minOpacity: number;
	trigger: number;
	range: number;
}

interface BudouxFadeState {
	element: HTMLElement;
	phrases: HTMLElement[];
}

const DEFAULT_CONFIG: BudouxFadeConfig = {
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

function readConfig(element: HTMLElement, options: InitBudouxFadeOptions) {
	const style = window.getComputedStyle(element);
	const fallbackTrigger = options.trigger ?? options.focus ?? DEFAULT_CONFIG.trigger;
	const minOpacity = readNumber(
		style.getPropertyValue("--BudouxFadeMin"),
		options.minOpacity ?? DEFAULT_CONFIG.minOpacity,
	);
	const trigger = readNumber(
		style.getPropertyValue("--BudouxFadeTrigger"),
		readNumber(
			style.getPropertyValue("--BudouxFadeFocus"),
			fallbackTrigger,
		),
	);
	const range = readNumber(
		style.getPropertyValue("--BudouxFadeRange"),
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
	viewportHeight: number,
	elementHeight: number,
) {
	return value <= 1 ? Math.max(viewportHeight, elementHeight) * value : value;
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

function updateState(state: BudouxFadeState, options: InitBudouxFadeOptions) {
	const config = readConfig(state.element, options);
	const viewportHeight =
		window.innerHeight || document.documentElement.clientHeight;
	const triggerY = resolveViewportValue(config.trigger, viewportHeight);
	const rect = state.element.getBoundingClientRect();
	const range = Math.max(
		1,
		resolveRangeValue(config.range, viewportHeight, rect.height),
	);
	const progress = clamp((triggerY - rect.top) / range, 0, 1);
	const activeCount = progress <= 0
		? 0
		: Math.ceil(progress * state.phrases.length);

	state.phrases.forEach((phrase, index) => {
		phrase.style.opacity = index < activeCount ? "1" : String(config.minOpacity);
	});
}

export function initBudouxFade(
	root: Document | Element = document,
	options: InitBudouxFadeOptions = {},
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
