export type BgTriggerRuntime = {
	disconnect: () => void;
};

export type BgTriggerAfterActivatePayload = {
	triggerIndex: number;
	/** 表示中の `.bgItem`。`.bgItem` が無い場合は `null` */
	activeBgItem: HTMLElement | null;
};

type InitBgTriggerOptions = {
	/** 背景の `current` / `show` 更新直後 */
	onAfterActivate?: (p: BgTriggerAfterActivatePayload) => void;
};

/**
 * `.js-bgTrigger` と `.bgItem` のスクロール同期、右側 `bgNav` ドット。
 * グリッチ等は含まない。`onAfterActivate` で別モジュールと連携する。
 */
export function initBgTrigger(
	root: HTMLElement,
	options?: InitBgTriggerOptions,
): BgTriggerRuntime {
	const triggers = [...root.querySelectorAll<HTMLElement>(".js-bgTrigger")];
	const bgItems = [...root.querySelectorAll<HTMLElement>(".bgItem")];
	bgItems.forEach((item) => {
		item.setAttribute("aria-hidden", "true");
	});
	const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
	const controller = new AbortController();
	let nav: HTMLElement | null = null;
	let scrollRaf = 0;
	let lastTriggerIndex = -1;
	const { onAfterActivate } = options ?? {};

	const resolveBgIndex = (triggerIndex: number): number => {
		if (bgItems.length === 0) return 0;
		return Math.min(Math.max(0, triggerIndex), bgItems.length - 1);
	};

	const activate = (triggerIndex: number) => {
		const bgIndex = resolveBgIndex(triggerIndex);
		const activeBgItem = bgItems[bgIndex] ?? null;

		triggers.forEach((trigger, i) => {
			const isCurrent = i === triggerIndex;
			trigger.classList.toggle("current", isCurrent);
			if (isCurrent) {
				trigger.setAttribute("aria-current", "true");
			} else {
				trigger.removeAttribute("aria-current");
			}
		});

		bgItems.forEach((item, itemIndex) => {
			const isCurrent = itemIndex === bgIndex;
			item.classList.toggle("show", isCurrent);
			item.setAttribute("aria-hidden", isCurrent ? "false" : "true");
			item.querySelectorAll(".JsLetterToggle").forEach((letter) => {
				letter.classList.toggle("show", isCurrent);
			});
		});

		nav?.querySelectorAll<HTMLButtonElement>(".navDot").forEach(
			(dot, dotIndex) => {
				const isCurrent = dotIndex === triggerIndex;
				dot.classList.toggle("current", isCurrent);
				dot.setAttribute("aria-current", isCurrent ? "true" : "false");
			},
		);

		onAfterActivate?.({ triggerIndex, activeBgItem });
	};

	/** ビューポート中央を基準に、現在のセクション番号（0 始まり）を一意に決める */
	const getActiveTriggerIndex = (): number => {
		if (triggers.length === 0) return 0;
		const mark = window.innerHeight * 0.5;
		for (let i = triggers.length - 1; i >= 0; i -= 1) {
			if (triggers[i].getBoundingClientRect().top <= mark) {
				return i;
			}
		}
		return 0;
	};

	const syncFromScroll = () => {
		const next = getActiveTriggerIndex();
		if (next === lastTriggerIndex) return;
		lastTriggerIndex = next;
		activate(next);
	};

	const scheduleSyncFromScroll = () => {
		if (scrollRaf !== 0) return;
		scrollRaf = window.requestAnimationFrame(() => {
			scrollRaf = 0;
			syncFromScroll();
		});
	};

	if (triggers.length > 0) {
		nav = document.createElement("nav");
		nav.className = "bgNav";
		nav.setAttribute("aria-label", "section navigation");

		triggers.forEach((trigger, index) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "navDot";
			button.setAttribute("aria-label", `section ${index + 1}`);
			button.addEventListener(
				"click",
				() => {
					trigger.scrollIntoView({
						behavior: reduceMotion.matches ? "auto" : "smooth",
						block: "start",
					});
				},
				{ signal: controller.signal },
			);
			nav?.appendChild(button);
		});

		root.appendChild(nav);
		scheduleSyncFromScroll();

		window.addEventListener("scroll", scheduleSyncFromScroll, {
			passive: true,
			signal: controller.signal,
		});
		window.addEventListener("resize", scheduleSyncFromScroll, {
			signal: controller.signal,
		});
	}

	return {
		disconnect: () => {
			controller.abort();
			if (scrollRaf !== 0) {
				window.cancelAnimationFrame(scrollRaf);
				scrollRaf = 0;
			}
			nav?.remove();
			triggers.forEach((trigger) => {
				trigger.classList.remove("current");
				trigger.removeAttribute("aria-current");
			});
			bgItems.forEach((item) => {
				item.classList.remove("show");
				item.removeAttribute("aria-hidden");
				item.querySelectorAll(".JsLetterToggle").forEach((letter) => {
					letter.classList.remove("show");
				});
			});
		},
	};
}
