import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSectionCanvas } from "./useSectionCanvas";

type ObserverEntry = {
	target: Element;
	isIntersecting: boolean;
	intersectionRatio?: number;
};

class MockIntersectionObserver {
	static instances: MockIntersectionObserver[] = [];

	readonly callback: IntersectionObserverCallback;
	readonly observed = new Set<Element>();
	readonly disconnect = vi.fn();

	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback;
		MockIntersectionObserver.instances.push(this);
	}

	observe = (target: Element) => {
		this.observed.add(target);
	};

	trigger(entries: ObserverEntry[]) {
		if (this.disconnect.mock.calls.length > 0) return;
		this.callback(entries as IntersectionObserverEntry[], this as never);
	}
}

class MockResizeObserver {
	readonly disconnect = vi.fn();
	observe = vi.fn();
	unobserve = vi.fn();
}

function TestSectionCanvas() {
	const { rootRef, canvasRef } = useSectionCanvas({
		text: "Canvas",
		fontSize: 64,
		detailed: false,
		fillOpacity: 1,
	});

	return (
		<section ref={rootRef} data-testid="section">
			<canvas ref={canvasRef} data-testid="canvas" />
		</section>
	);
}

describe("useSectionCanvas", () => {
	let hidden = false;
	let clearRectSpy: ReturnType<typeof vi.fn>;
	let fillTextSpy: ReturnType<typeof vi.fn>;
	let requestAnimationFrameSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		document.body.innerHTML = "";
		MockIntersectionObserver.instances = [];
		vi.stubGlobal("IntersectionObserver", MockIntersectionObserver as never);
		vi.stubGlobal("ResizeObserver", MockResizeObserver as never);
		clearRectSpy = vi.fn();
		fillTextSpy = vi.fn();
		Object.defineProperty(document, "fonts", {
			configurable: true,
			value: {
				ready: Promise.resolve(),
				status: "loaded",
			},
		});
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
			() =>
				({
					clearRect: clearRectSpy,
					setTransform: vi.fn(),
					fillText: fillTextSpy,
					drawImage: vi.fn(),
					save: vi.fn(),
					restore: vi.fn(),
					beginPath: vi.fn(),
					arc: vi.fn(),
					fill: vi.fn(),
					getImageData: vi.fn(),
				}) as never,
		);
		requestAnimationFrameSpy = vi
			.spyOn(window, "requestAnimationFrame")
			.mockImplementation((callback: FrameRequestCallback) => {
				callback(16);
				return 1;
			});
		hidden = false;
		Object.defineProperty(document, "hidden", {
			configurable: true,
			get: () => hidden,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		document.body.innerHTML = "";
	});

	function renderProbe() {
		const container = document.createElement("div");
		document.body.appendChild(container);
		const root = createRoot(container);

		act(() => {
			root.render(<TestSectionCanvas />);
		});

		return { container, root };
	}

	function setBounds(element: HTMLElement, rect: Partial<DOMRect>) {
		Object.defineProperty(element, "getBoundingClientRect", {
			configurable: true,
			value: () =>
				({
					x: rect.x ?? 0,
					y: rect.y ?? 0,
					left: rect.left ?? rect.x ?? 0,
					top: rect.top ?? rect.y ?? 0,
					right: rect.right ?? (rect.left ?? rect.x ?? 0) + (rect.width ?? 0),
					bottom:
						rect.bottom ?? (rect.top ?? rect.y ?? 0) + (rect.height ?? 0),
					width: rect.width ?? 0,
					height: rect.height ?? 0,
					toJSON: () => ({}),
				}) as DOMRect,
		});
	}

	it("viewport 近傍でだけ描画し、hidden と cleanup で止まる", async () => {
		const { container, root } = renderProbe();
		const section = container.querySelector("[data-testid=section]") as HTMLElement;
		const canvas = container.querySelector("[data-testid=canvas]") as HTMLCanvasElement;
		setBounds(section, { top: 2000, left: 0, width: 320, height: 180 });
		setBounds(canvas, { top: 2000, left: 0, width: 320, height: 180 });

		expect(clearRectSpy).not.toHaveBeenCalled();
		expect(requestAnimationFrameSpy).not.toHaveBeenCalled();

		const [viewportObserver] = MockIntersectionObserver.instances;
		expect(viewportObserver).toBeDefined();

		act(() => {
			setBounds(section, { top: 200, left: 0, width: 320, height: 180 });
			setBounds(canvas, { top: 200, left: 0, width: 320, height: 180 });
			viewportObserver.trigger([
				{
					target: section,
					isIntersecting: true,
					intersectionRatio: 1,
				},
			]);
		});

		await Promise.resolve();

		expect(requestAnimationFrameSpy.mock.calls.length).toBeGreaterThan(0);
		expect(clearRectSpy).toHaveBeenCalled();
		expect(fillTextSpy).toHaveBeenCalled();
		const rafCount = requestAnimationFrameSpy.mock.calls.length;

		hidden = true;
		document.dispatchEvent(new Event("visibilitychange"));
		act(() => {
			window.dispatchEvent(new Event("scroll"));
		});

		expect(requestAnimationFrameSpy.mock.calls.length).toBe(rafCount);

		act(() => {
			root.unmount();
		});

		const clearCount = clearRectSpy.mock.calls.length;
		act(() => {
			viewportObserver.trigger([
				{
					target: section,
					isIntersecting: true,
					intersectionRatio: 1,
				},
			]);
		});

		expect(clearRectSpy).toHaveBeenCalledTimes(clearCount);
	});
});
