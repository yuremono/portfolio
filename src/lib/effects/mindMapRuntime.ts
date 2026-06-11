/**
 * mind map と mind wobble の起動・停止をまとめる束ね役
 */

import {
	type MindMapContainerState,
	type MindMapRuntimeContext,
	initMindMapScene,
} from "./mindMapScene";
import {
	type MindWobbleRuntime,
	initMindWobbleRuntime,
} from "./mindWobbleRuntime";

/** 最後の scroll からこの ms 経過したらスクロール終了とみなす */
const SCROLL_SETTLE_MS = 100;

function getQueryRoot(root: Document | HTMLElement): ParentNode {
	return root instanceof Document ? root : root;
}

export function initMindMapRuntime(
	rootDocument: Document | HTMLElement,
): () => void {
	let isScrolling = false;
	let scrollTimer: ReturnType<typeof setTimeout> | null = null;
	let lastResumeTime = 0;
	let disposed = false;
	const mindMapStates: MindMapContainerState[] = [];
	let wobbleRuntime: MindWobbleRuntime | null = null;

	const context: MindMapRuntimeContext = {
		getIsScrolling: () => isScrolling,
		getLastResumeTime: () => lastResumeTime,
		isDisposed: () => disposed,
	};

	/**
	 * スクロール中は mind map のシミュレーションを止める。
	 */
	function pauseMindMapSimsOnce() {
		for (const st of mindMapStates) {
			st.sim.stop();
		}
	}

	function resumeScrollEffects() {
		scrollTimer = null;
		isScrolling = false;
		lastResumeTime = performance.now();
		for (const st of mindMapStates) {
			st.sim.restart();
		}
		wobbleRuntime?.resume();
	}

	const onScrollActivity = () => {
		isScrolling = true;
		pauseMindMapSimsOnce();
		if (scrollTimer !== null) clearTimeout(scrollTimer);
		scrollTimer = setTimeout(resumeScrollEffects, SCROLL_SETTLE_MS);
	};

	window.addEventListener("scroll", onScrollActivity, { passive: true });
	document.addEventListener("scroll", onScrollActivity, {
		passive: true,
		capture: true,
	});

	const queryRoot = getQueryRoot(rootDocument);
	const htmlElement =
		rootDocument instanceof Document
			? rootDocument.documentElement
			: rootDocument.ownerDocument?.documentElement ?? document.documentElement;

	void (async () => {
		wobbleRuntime = initMindWobbleRuntime(queryRoot, context);

		queryRoot.querySelectorAll(".MindMap > br").forEach((br) => {
			br.remove();
		});

		const containers = Array.from(
			queryRoot.querySelectorAll<HTMLElement>(".MindMap"),
		);
		if (!containers.length) return;

		for (const c of containers) {
			if (disposed) break;
			try {
				const state = await initMindMapScene(c, context);
				if (disposed || !state) continue;
				mindMapStates.push(state);
				if (isScrolling) {
					state.sim.stop();
				}
			} catch {
				/* ignore */
			}
		}

		if (!disposed) {
			htmlElement.classList.add("MindMapReady");
		}
	})();

	return () => {
		if (disposed) return;
		disposed = true;

		window.removeEventListener("scroll", onScrollActivity);
		document.removeEventListener("scroll", onScrollActivity, { capture: true });
		if (scrollTimer !== null) clearTimeout(scrollTimer);
		wobbleRuntime?.disconnect();

		const states = [...mindMapStates];
		mindMapStates.length = 0;

		for (const st of states) {
			st.sim.on("tick", null);
			st.sim.stop();
			st.io.disconnect();
			st.container.removeEventListener("mouseenter", st.onMouseEnter);
			st.container.removeEventListener("mousemove", st.onMouseMove);
			st.container.removeEventListener("mouseleave", st.onMouseLeave);
			window.removeEventListener("resize", st.onResize);
			st.removeVideoHoverListeners();
			for (const button of st.container.querySelectorAll<HTMLButtonElement>(".MindMapBtn")) {
				button.onclick = null;
				button.classList.remove("IsStop");
				button.removeAttribute("aria-current");
			}
			st.container.parentElement
				?.querySelector<HTMLElement>(".MindMapMask")
				?.classList.remove("IsStop");
			for (const n of st.nodes) {
				n.element.style.transform = "";
				n.element.classList.remove("MindMapNode");
				if (n.pin) n.element.classList.remove("mmStatic");
			}
			const elWithMm = st.container as HTMLElement & {
				_mmPointerEnabled?: boolean;
				_mmCoolTimer?: ReturnType<typeof setTimeout>;
				_mmMaskTransitionTimer?: ReturnType<typeof setTimeout>;
			};
			window.clearTimeout(elWithMm._mmCoolTimer);
			window.clearTimeout(elWithMm._mmMaskTransitionTimer);
			delete elWithMm._mmPointerEnabled;
			delete elWithMm._mmCoolTimer;
			delete elWithMm._mmMaskTransitionTimer;
		}

		const htmlWithMm = htmlElement as HTMLElement & {
			_mmHtmlClassTokens?: string[];
		};
		if (htmlWithMm._mmHtmlClassTokens?.length) {
			htmlWithMm.classList.remove(...htmlWithMm._mmHtmlClassTokens);
		}
		delete htmlWithMm._mmHtmlClassTokens;

		htmlElement.classList.remove("MindMapReady");
	};
}
