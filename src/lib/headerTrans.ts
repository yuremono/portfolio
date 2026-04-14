/**
 * ヘッダー変形: .mv 等の IO と #Header.UpInit のスクロール方向
 * 元: js/function.js 220–269 行
 */

const SELECTOR_HEAD = ".mv,.first,.title1,.page-title";
const SCROLL_THRESHOLD = 20;

export type RuntimeDisconnect = { disconnect: () => void };

export function initHeaderTrans(
	root: Document | Element = document,
): RuntimeDisconnect {
	const doc = root instanceof Document ? root : root.ownerDocument!;
	const base = root;

	const headerIO = doc.querySelector("#Header:not(.UpInit)");
	const headerScroll = doc.querySelector("#Header.UpInit:not(.Triangle)");
	const head = base.querySelectorAll(SELECTOR_HEAD);

	const observerH = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!headerIO) continue;
				if (entry.isIntersecting) {
					headerIO.classList.remove("trans");
				} else {
					headerIO.classList.add("trans");
				}
			}
		},
		{ rootMargin: "0% 0% -0% 0px", threshold: 0.5 },
	);

	head.forEach((tgt) => observerH.observe(tgt));

	let lastScroll = 0;
	let ticking = false;

	const onScroll = () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const currentScroll =
					window.pageYOffset || doc.documentElement.scrollTop;
				const scrollDiff = currentScroll - lastScroll;

				if (Math.abs(scrollDiff) > SCROLL_THRESHOLD) {
					if (scrollDiff > 0) {
						headerScroll?.classList.add("trans");
					} else {
						headerScroll?.classList.remove("trans");
					}
					lastScroll = currentScroll;
				}
				ticking = false;
			});
			ticking = true;
		}
	};

	window.addEventListener("scroll", onScroll, { passive: true });

	return {
		disconnect: () => {
			observerH.disconnect();
			window.removeEventListener("scroll", onScroll);
		},
	};
}
