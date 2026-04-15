/**
 * IntersectionObserver で .show を付与（Once / Toggle の2系統）
 * 元: js/function.js 271–303 行付近
 */

const ATTR_ONCE = "data-io-once";
const ATTR_TOGGLE = "data-io-toggle";

const SELECTOR_ONCE =
	"[class*=Js]:not([class*=JsCh],.JsBgFix,.JsLetterToggle),[class*=JsCh]>* ";
const SELECTOR_TOGGLE = ".f_main,.JsBgFix";

const ROOT_MARGIN_ONCE = "0% 0% -15% 0px";
const THRESHOLD_ONCE = 0;

const ROOT_MARGIN_TOGGLE = "-0% 0% -50% 0px";

export type RuntimeDisconnect = { disconnect: () => void };

export function initIntersectionShow(
	root: Document | Element = document,
): RuntimeDisconnect {
	const base = root;

	const observerOnce = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add("show");
				}
			}
		},
		{ rootMargin: ROOT_MARGIN_ONCE, threshold: THRESHOLD_ONCE },
	);

	const observerToggle = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const t = entry.target;
				if (entry.isIntersecting) {
					t.classList.add("show");
				} else {
					t.classList.remove("show");
				}
			}
		},
		{ rootMargin: ROOT_MARGIN_TOGGLE },
	);

	base.querySelectorAll(SELECTOR_ONCE).forEach((el) => {
		if (el.hasAttribute(ATTR_ONCE)) return;
		el.setAttribute(ATTR_ONCE, "1");
		observerOnce.observe(el);
	});

	base.querySelectorAll(SELECTOR_TOGGLE).forEach((el) => {
		if (el.hasAttribute(ATTR_TOGGLE)) return;
		el.setAttribute(ATTR_TOGGLE, "1");
		observerToggle.observe(el);
	});

	return {
		disconnect: () => {
			observerOnce.disconnect();
			observerToggle.disconnect();
			base.querySelectorAll(`[${ATTR_ONCE}]`).forEach((el) => {
				el.removeAttribute(ATTR_ONCE);
			});
			base.querySelectorAll(`[${ATTR_TOGGLE}]`).forEach((el) => {
				el.removeAttribute(ATTR_TOGGLE);
			});
		},
	};
}
