import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { playPageTransitionMosaique } from "../lib/effects/maskMosaique";
import {
	INITIAL_LOADING_LABEL_TEXT,
	InitialLoadingOverlay,
} from "./InitialLoadingOverlay";

vi.mock("../lib/effects/maskMosaique", () => ({
	playPageTransitionMosaique: vi.fn(),
}));

(
	globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const playPageTransitionMosaiqueMock = vi.mocked(playPageTransitionMosaique);
let revealResolver: (() => void) | null = null;

function renderInitialLoading(storageKey = "InitialLoadingTest") {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);

	act(() => {
		root.render(<InitialLoadingOverlay storageKey={storageKey} />);
	});

	return { container, root };
}

/** アンカー待ちが即終了するよう、実ページ相当の段落を載せる（文言はキャンバス既定と揃える）。 */
function appendMindMapAboutAnchor(html = "yuremono<br>works") {
	const mindMap = document.createElement("section");
	mindMap.className = "mindMap";
	const about = document.createElement("p");
	about.className = "about_p";
	about.innerHTML = html;
	mindMap.appendChild(about);
	document.body.appendChild(mindMap);
}

function unmount(root: Root) {
	act(() => {
		root.unmount();
	});
}

beforeEach(() => {
	vi.useFakeTimers();
	playPageTransitionMosaiqueMock.mockReset();
	document.body.innerHTML = "";
	window.sessionStorage.clear();
	document.documentElement.style.setProperty("--pageTR", "0.5s");
	document.documentElement.style.setProperty("--initial-loading-min", "1000ms");
	document.documentElement.style.setProperty("--page-rect-bg", "#101010");
	document.documentElement.style.setProperty("--page-rect-size", "0.01");
	playPageTransitionMosaiqueMock.mockImplementation(
		() =>
			new Promise<void>((resolve) => {
				revealResolver = resolve;
			}),
	);
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
	revealResolver = null;
	document.documentElement.removeAttribute("style");
	window.sessionStorage.clear();
});

describe("InitialLoadingOverlay", () => {
	it("初回表示では最低表示時間後にモザイクrevealで消える", async () => {
		appendMindMapAboutAnchor();
		const { container, root } = renderInitialLoading();

		expect(container.querySelector(".InitialLoading")).not.toBeNull();
		expect(container.querySelector(".InitialLoadingCanvas")).not.toBeNull();
		expect(playPageTransitionMosaiqueMock).not.toHaveBeenCalled();

		await act(async () => {
			await Promise.resolve();
		});

		expect(playPageTransitionMosaiqueMock).not.toHaveBeenCalled();

		act(() => {
			vi.advanceTimersByTime(250);
		});
		await act(async () => {
			await Promise.resolve();
		});
		expect(playPageTransitionMosaiqueMock).not.toHaveBeenCalled();
		expect(document.body.classList.contains("SiteTransitionPending")).toBe(
			false,
		);

		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(playPageTransitionMosaiqueMock).toHaveBeenCalledWith(
			expect.objectContaining({ className: "InitialLoadingCanvas" }),
			"reveal",
			expect.objectContaining({
				label: expect.objectContaining({ text: INITIAL_LOADING_LABEL_TEXT }),
				minimumMs: 1000,
			}),
		);

		await act(async () => {
			revealResolver?.();
			await Promise.resolve();
		});

		expect(container.querySelector(".InitialLoading")).not.toBeNull();
		expect(
			container
				.querySelector(".InitialLoading")
				?.classList.contains("InitialLoadingDone"),
		).toBe(true);
		expect(window.sessionStorage.getItem("InitialLoadingTest")).toBe("1");

		unmount(root);
	});

	it("表示済みでもデバッグ設定では初期状態で表示される", () => {
		window.sessionStorage.setItem("InitialLoadingTest", "1");
		const { container, root } = renderInitialLoading();

		expect(container.querySelector(".InitialLoading")).not.toBeNull();
		expect(
			container
				.querySelector(".InitialLoading")
				?.classList.contains("InitialLoadingDone"),
		).toBe(false);
		expect(playPageTransitionMosaiqueMock).not.toHaveBeenCalled();

		unmount(root);
	});
});
