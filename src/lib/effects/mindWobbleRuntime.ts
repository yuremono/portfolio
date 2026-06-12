import type { MindMapRuntimeContext } from "./mindMapScene";

export type MindWobbleRuntime = {
	resume: () => void;
	disconnect: () => void;
};

type WobbleItem = {
	el: HTMLElement;
	phaseX: number;
	phaseY: number;
	ampX: number;
	ampY: number;
	freqX: number;
	freqY: number;
	dispX: number;
	dispY: number;
};

function parseCssCustomNumber(
	style: CSSStyleDeclaration,
	name: string,
): number | undefined {
	const raw = style.getPropertyValue(name).trim();
	if (!raw) return undefined;
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : undefined;
}

function dataNumberAttr(el: HTMLElement, attr: string): number | undefined {
	const raw = el.getAttribute(attr);
	if (raw == null || raw === "") return undefined;
	const n = parseFloat(raw);
	return Number.isFinite(n) ? n : undefined;
}

export function initMindWobbleRuntime(
	queryRoot: ParentNode,
	context: MindMapRuntimeContext,
): MindWobbleRuntime | null {
	const prefersReduced =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	const all = Array.from(queryRoot.querySelectorAll<HTMLElement>(".MindWobble"));
	if (all.length === 0) return null;

	const els = all.filter((el) => !el.closest(".MindMap"));
	if (!els.length) return null;

	const isVisible = new WeakMap<Element, boolean>();
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => isVisible.set(e.target, e.isIntersecting));
		},
		{ root: null, threshold: 0 },
	);

	const items: WobbleItem[] = els.map((el) => {
		io.observe(el);
		const cs = getComputedStyle(el);
		const varAmp = parseCssCustomNumber(cs, "--mmWobbleAmp") || undefined;
		const varAmpX = parseCssCustomNumber(cs, "--mmWobbleAmpX") || undefined;
		const varAmpY = parseCssCustomNumber(cs, "--mmWobbleAmpY") || undefined;
		const varFreqX = parseCssCustomNumber(cs, "--mmWobbleFreqX") || undefined;
		const varFreqY = parseCssCustomNumber(cs, "--mmWobbleFreqY") || undefined;

		const dataAmp = dataNumberAttr(el, "data-wobble-amp") || undefined;
		const dataAmpX = dataNumberAttr(el, "data-wobble-amp-x") || undefined;
		const dataAmpY = dataNumberAttr(el, "data-wobble-amp-y") || undefined;
		const dataFreqX = dataNumberAttr(el, "data-wobble-freq-x") || undefined;
		const dataFreqY = dataNumberAttr(el, "data-wobble-freq-y") || undefined;

		const amp = varAmp ?? dataAmp ?? 16;
		const ampX = varAmpX ?? dataAmpX ?? amp;
		const ampY = varAmpY ?? dataAmpY ?? Math.max(6, amp * 0.6);
		const freqX = varFreqX ?? dataFreqX ?? 0.0008;
		const freqY = varFreqY ?? dataFreqY ?? 0.0006;

		return {
			el,
			phaseX: Math.random() * Math.PI * 2,
			phaseY: Math.random() * Math.PI * 2,
			ampX,
			ampY,
			freqX,
			freqY,
			dispX: 0,
			dispY: 0,
		};
	});

	if (prefersReduced) {
		for (const it of items) it.el.style.transform = "none";
		return {
			resume: () => {},
			disconnect: () => io.disconnect(),
		};
	}

	let rafId = 0;
	let stopped = false;

	const resume = () => {
		if (stopped || rafId !== 0 || context.isDisposed()) return;
		rafId = requestAnimationFrame(tick);
	};

	const tick = (now: number) => {
		if (stopped || context.isDisposed()) return;
		if (context.getIsScrolling()) {
			rafId = 0;
			return;
		}

		const timeSinceResume = now - context.getLastResumeTime();

		for (let i = 0; i < items.length; i++) {
			const it = items[i];
			const vis = isVisible.get(it.el) !== false;
			if (!vis) continue;

			const staggerDelay = i * 10;
			if (timeSinceResume < staggerDelay) continue;

			it.phaseX += it.freqX * 16.6;
			it.phaseY += it.freqY * 16.6;

			const targetX = Math.sin(it.phaseX) * it.ampX;
			const targetY = Math.sin(it.phaseY) * it.ampY;

			const isJustResumedForNode = timeSinceResume < staggerDelay + 300;
			const smooth = isJustResumedForNode ? 0.02 : 0.08;

			it.dispX += (targetX - it.dispX) * smooth;
			it.dispY += (targetY - it.dispY) * smooth;

			it.el.style.transform = `translate3d(${it.dispX.toFixed(2)}px, ${it.dispY.toFixed(2)}px, 0)`;
		}

		rafId = requestAnimationFrame(tick);
	};

	resume();

	return {
		resume,
		disconnect: () => {
			stopped = true;
			cancelAnimationFrame(rafId);
			io.disconnect();
			for (const it of items) {
				it.el.style.transform = "none";
			}
		},
	};
}
