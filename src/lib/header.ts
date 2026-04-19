/**
 * ヘッダー SP ナビ開閉・ドロップダウン（clone なし前提のマークアップ）
 * 元: js/function.js 121–219 行
 */

export type RuntimeDisconnect = { disconnect: () => void };

export function initHeader(root: Document | Element = document): RuntimeDisconnect {
	const doc = root instanceof Document ? root : root.ownerDocument!;
	const base = root;

	const menu = base.querySelector<HTMLButtonElement>(".HeaderMenu");
	const navPc = base.querySelector<HTMLElement>(".HeaderNav");
	const navLinks = base.querySelectorAll<HTMLAnchorElement>(".HeaderNav a");
	const nSp = doc.querySelector<HTMLElement>("#HeaderNavMobile");
	const nUl = doc.querySelector<HTMLElement>("#HeaderNavMobile ul");
	const toggleBtns = base.querySelectorAll<HTMLElement>(
		".MenuToggle, .HeaderNavMobile a:not(.NoPointer,.DropToggle)",
	);
	const contactLinks =
		base.querySelectorAll<HTMLAnchorElement>(".HeaderItems a");
	const dropToggles = base.querySelectorAll<HTMLElement>(".DropToggle");
	const header = doc.querySelector<HTMLElement>("#Header");
	const focusTrap = base.querySelector<HTMLElement>(".FocusTrap");

	if (!menu || !navPc || !nSp || !nUl || !header) {
		return { disconnect: () => {} };
	}

	const btnPress = () => {
		navPc.inert = !navPc.inert;
		nSp.classList.toggle("show");
		nUl.classList.toggle("show");
		const pressed = menu.getAttribute("aria-pressed") === "true";
		menu.setAttribute("aria-pressed", pressed ? "false" : "true");
		menu.setAttribute("aria-expanded", pressed ? "false" : "true");
		menu.setAttribute(
			"aria-label",
			menu.getAttribute("aria-label") === "menu open"
				? "menu close"
				: "menu open",
		);
		header.classList.toggle("active");
		menu.classList.toggle("active");
	};

	const onNavLinkClick = (el: HTMLAnchorElement) => {
		setTimeout(() => el.blur(), 600);
	};

	const onContactClick = () => {
		if (header.classList.contains("active")) btnPress();
	};

	const onToggleClick = () => {
		btnPress();
	};

	const dropDown = (el: HTMLElement) => {
		const parent = el.closest("li");
		const target = parent?.querySelector<HTMLElement>("ul");
		if (!parent || !target) return;
		target.classList.toggle("show");
		el.classList.toggle("active");
		const exp = parent.getAttribute("aria-expanded") === "true";
		parent.setAttribute("aria-expanded", exp ? "false" : "true");
		const hidden = target.getAttribute("aria-hidden") === "false";
		target.setAttribute("aria-hidden", hidden ? "true" : "false");
		const label = target.getAttribute("aria-label");
		target.setAttribute("aria-label", label === "open" ? "close" : "open");
	};

	const onDropToggle = (el: HTMLElement) => () => dropDown(el);

	const onFocusTrap = () => menu.focus();

	const onKeyUp = (event: KeyboardEvent) => {
		if (event.key === "Escape" && menu.getAttribute("aria-pressed") === "true") {
			btnPress();
		}
	};

	const linkFns: Array<() => void> = [];
	navLinks.forEach((el) => {
		const fn = () => onNavLinkClick(el);
		el.addEventListener("click", fn);
		linkFns.push(() => el.removeEventListener("click", fn));
	});

	const contactFns: Array<() => void> = [];
	contactLinks.forEach((el) => {
		const fn = onContactClick;
		el.addEventListener("click", fn);
		contactFns.push(() => el.removeEventListener("click", fn));
	});

	const toggleFns: Array<() => void> = [];
	toggleBtns.forEach((el) => {
		el.addEventListener("click", onToggleClick);
		toggleFns.push(() => el.removeEventListener("click", onToggleClick));
	});

	let trapFn: (() => void) | undefined;
	if (focusTrap) {
		trapFn = onFocusTrap;
		focusTrap.addEventListener("focus", trapFn);
	}

	window.addEventListener("keyup", onKeyUp);

	const dropFns: Array<() => void> = [];
	dropToggles.forEach((el) => {
		const fn = onDropToggle(el);
		el.addEventListener("click", fn);
		dropFns.push(() => el.removeEventListener("click", fn));
	});

	return {
		disconnect: () => {
			linkFns.forEach((f) => f());
			contactFns.forEach((f) => f());
			toggleFns.forEach((f) => f());
			dropFns.forEach((f) => f());
			if (focusTrap && trapFn) {
				focusTrap.removeEventListener("focus", trapFn);
			}
			window.removeEventListener("keyup", onKeyUp);
		},
	};
}
