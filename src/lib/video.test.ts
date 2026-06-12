import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initVideo } from "./video";

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
	readonly unobserve = vi.fn();

	constructor(callback: IntersectionObserverCallback) {
		this.callback = callback;
		MockIntersectionObserver.instances.push(this);
	}

	observe = (target: Element) => {
		this.observed.add(target);
	};

	trigger(entries: ObserverEntry[]) {
		this.callback(entries as IntersectionObserverEntry[], this as never);
	}

	reset() {
		this.observed.clear();
		this.disconnect.mockReset();
		this.unobserve.mockReset();
	}
}

describe("initVideo", () => {
	let hidden = false;
	const pausedState = new WeakMap<HTMLMediaElement, boolean>();
	let playSpy: ReturnType<typeof vi.spyOn>;
	let pauseSpy: ReturnType<typeof vi.spyOn>;
	let loadSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		document.body.innerHTML = `
			<div class="video_container">
				<video data-src="/video/a.mp4"></video>
			</div>
			<div class="video_container2">
				<video data-src="/video/b.mp4"></video>
			</div>
		`;
		MockIntersectionObserver.instances = [];
		vi.stubGlobal("IntersectionObserver", MockIntersectionObserver as never);
		Object.defineProperty(HTMLMediaElement.prototype, "paused", {
			configurable: true,
			get() {
				return pausedState.get(this as HTMLMediaElement) ?? true;
			},
		});
		playSpy = vi
			.spyOn(HTMLMediaElement.prototype, "play")
			.mockImplementation(function play(this: HTMLMediaElement) {
				pausedState.set(this, false);
				return Promise.resolve();
			});
		pauseSpy = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function pause(
			this: HTMLMediaElement,
		) {
			pausedState.set(this, true);
		});
		loadSpy = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
		hidden = false;
		Object.defineProperty(document, "hidden", {
			configurable: true,
			get: () => hidden,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		MockIntersectionObserver.instances = [];
		document.body.innerHTML = "";
	});

	it("同時に再生する動画を1本に絞り、hidden で停止する", () => {
		const runtime = initVideo(document);
		const [observer] = MockIntersectionObserver.instances;
		expect(observer).toBeDefined();

		const firstContainer = document.querySelector(".video_container") as HTMLElement;
		const secondContainer = document.querySelector(".video_container2") as HTMLElement;
		const firstVideo = firstContainer.querySelector("video") as HTMLVideoElement;
		const secondVideo = secondContainer.querySelector("video") as HTMLVideoElement;

		observer.trigger([
			{ target: firstContainer, isIntersecting: true, intersectionRatio: 1 },
			{ target: secondContainer, isIntersecting: false, intersectionRatio: 0 },
		]);

		expect(loadSpy).toHaveBeenCalledTimes(1);
		expect(playSpy).toHaveBeenCalledTimes(1);
		expect(firstVideo.getAttribute("src")).toBe("/video/a.mp4");
		expect(secondVideo.getAttribute("src")).toBeNull();

		observer.trigger([
			{ target: firstContainer, isIntersecting: false, intersectionRatio: 0 },
			{ target: secondContainer, isIntersecting: true, intersectionRatio: 1 },
		]);

		expect(loadSpy).toHaveBeenCalledTimes(2);
		expect(playSpy).toHaveBeenCalledTimes(2);
		expect(pauseSpy).toHaveBeenCalled();

		hidden = true;
		document.dispatchEvent(new Event("visibilitychange"));
		expect(pauseSpy).toHaveBeenCalled();

		runtime.disconnect();
		expect(firstContainer.hasAttribute("data-video-io")).toBe(false);
		expect(secondContainer.hasAttribute("data-video-io")).toBe(false);
	});
});
