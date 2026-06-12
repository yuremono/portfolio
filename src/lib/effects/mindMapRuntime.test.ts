import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `vi.mock` の hoist 前後で同じ binding を使うため var が必要。
// eslint-disable-next-line no-var
var mockSceneState: {
	sim: {
		on: ReturnType<typeof vi.fn>;
		stop: ReturnType<typeof vi.fn>;
		restart: ReturnType<typeof vi.fn>;
	};
	io: {
		disconnect: ReturnType<typeof vi.fn>;
	};
	setPageVisible: ReturnType<typeof vi.fn>;
	onMouseEnter: ReturnType<typeof vi.fn>;
	onMouseMove: ReturnType<typeof vi.fn>;
	onMouseLeave: ReturnType<typeof vi.fn>;
	onResize: ReturnType<typeof vi.fn>;
	removeVideoHoverListeners: ReturnType<typeof vi.fn>;
	container: HTMLElement;
	nodes: [];
};
// eslint-disable-next-line no-var
var mockWobbleRuntime: {
	pause: ReturnType<typeof vi.fn>;
	resume: ReturnType<typeof vi.fn>;
	disconnect: ReturnType<typeof vi.fn>;
};
const mockInitMindMapScene = vi.hoisted(() => vi.fn());
const mockInitMindWobbleRuntime = vi.hoisted(() => vi.fn());

vi.mock("./mindMapScene", () => ({
	initMindMapScene: mockInitMindMapScene,
}));

vi.mock("./mindWobbleRuntime", () => ({
	initMindWobbleRuntime: mockInitMindWobbleRuntime,
}));

import { initMindMapRuntime } from "./mindMapRuntime";

describe("initMindMapRuntime", () => {
	let hidden = false;

	beforeEach(() => {
		vi.useFakeTimers();
		document.body.innerHTML = "";
		mockInitMindMapScene.mockReset();
		mockInitMindWobbleRuntime.mockReset();
		mockSceneState = {
			sim: {
				on: vi.fn(),
				stop: vi.fn(),
				restart: vi.fn(),
			},
			io: {
				disconnect: vi.fn(),
			},
			setPageVisible: vi.fn(),
			onMouseEnter: vi.fn(),
			onMouseMove: vi.fn(),
			onMouseLeave: vi.fn(),
			onResize: vi.fn(),
			removeVideoHoverListeners: vi.fn(),
			container: document.createElement("section"),
			nodes: [],
		};
		mockSceneState.container.className = "MindMap";
		mockSceneState.container.innerHTML =
			'<br /><button class="MindMapBtn" type="button">Go</button>';
		document.body.appendChild(mockSceneState.container);

		mockWobbleRuntime = {
			pause: vi.fn(),
			resume: vi.fn(),
			disconnect: vi.fn(),
		};

		mockInitMindMapScene.mockResolvedValue(mockSceneState);
		mockInitMindWobbleRuntime.mockReturnValue(mockWobbleRuntime);

		hidden = false;
		Object.defineProperty(document, "hidden", {
			configurable: true,
			get: () => hidden,
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
		document.body.innerHTML = "";
	});

	it("scrollとvisibilitychangeで開始停止と再開を切り替え、cleanupで残さない", async () => {
		const disconnect = initMindMapRuntime(document);
		await Promise.resolve();
		await Promise.resolve();

		expect(mockInitMindMapScene).toHaveBeenCalled();
		expect(mockSceneState.setPageVisible).toHaveBeenCalledWith(true);

		window.dispatchEvent(new Event("scroll"));
		expect(mockSceneState.sim.stop).toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(mockSceneState.sim.restart).toHaveBeenCalled();
		expect(mockWobbleRuntime.resume).toHaveBeenCalled();

		hidden = true;
		document.dispatchEvent(new Event("visibilitychange"));
		expect(mockSceneState.setPageVisible).toHaveBeenCalledWith(false);
		expect(mockWobbleRuntime.pause).toHaveBeenCalled();

		hidden = false;
		document.dispatchEvent(new Event("visibilitychange"));
		expect(mockSceneState.setPageVisible).toHaveBeenCalledWith(true);
		expect(mockWobbleRuntime.resume).toHaveBeenCalledTimes(2);

		const stopCount = mockSceneState.sim.stop.mock.calls.length;
		disconnect();
		expect(mockWobbleRuntime.disconnect).toHaveBeenCalled();
		const stopCountAfterCleanup = mockSceneState.sim.stop.mock.calls.length;
		expect(stopCountAfterCleanup).toBeGreaterThan(stopCount);

		window.dispatchEvent(new Event("scroll"));
		vi.advanceTimersByTime(100);
		expect(mockSceneState.sim.stop.mock.calls.length).toBe(stopCountAfterCleanup);
	});
});
