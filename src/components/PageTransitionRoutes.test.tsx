import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BrowserRouter, Link } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { playPageTransitionMosaique } from "../lib/effects/maskMosaique";
import {
	PageTransitionRoutes,
	type PageTransitionRoute,
} from "./PageTransitionRoutes";

vi.mock("../lib/effects/maskMosaique", () => ({
	playPageTransitionMosaique: vi.fn(),
}));

(
	globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const playPageTransitionMosaiqueMock = vi.mocked(playPageTransitionMosaique);
let transitionResolvers: Array<() => void> = [];

function setReducedMotion(matches: boolean) {
	Object.defineProperty(window, "matchMedia", {
		configurable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches,
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		})),
	});
}

function renderRoutes(routes: PageTransitionRoute[]) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);

	act(() => {
		root.render(
			<BrowserRouter>
				<PageTransitionRoutes routes={routes} />
			</BrowserRouter>,
		);
	});

	return { container, root };
}

function unmount(root: Root) {
	act(() => {
		root.unmount();
	});
}

const baseRoutes: PageTransitionRoute[] = [
	{
		path: "/",
		element: (
			<div data-testid="home">
				Home
				<Link to="/about">About</Link>
				<a href="/about">Raw About</a>
			</div>
		),
	},
	{ path: "/about", element: <div data-testid="about">About page</div> },
];

beforeEach(() => {
	vi.useFakeTimers();
	transitionResolvers = [];
	document.body.innerHTML = "";
	window.history.replaceState(null, "", "/");
	window.scrollTo = vi.fn();
	setReducedMotion(false);
	playPageTransitionMosaiqueMock.mockImplementation(
		() =>
			new Promise<void>((resolve) => {
				transitionResolvers.push(resolve);
			}),
	);
});

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("PageTransitionRoutes", () => {
	it("初回表示では遷移レイヤーを作らない", () => {
		const { container, root } = renderRoutes(baseRoutes);

		expect(container.querySelector("[data-testid='home']")).not.toBeNull();
		expect(container.querySelector(".PageTransitionOverlay")).toBeNull();

		unmount(root);
	});

	it("有効なルート間ではcanvasで覆ってからルートを切り替える", async () => {
		const { container, root } = renderRoutes(baseRoutes);
		const link = Array.from(
			container.querySelectorAll<HTMLAnchorElement>("a"),
		).find((anchor) => anchor.textContent === "Raw About");

		act(() => {
			link?.dispatchEvent(
				new MouseEvent("click", {
					bubbles: true,
					cancelable: true,
					button: 0,
				}),
			);
		});
		act(() => {
			vi.runOnlyPendingTimers();
		});
			act(() => {
				vi.runOnlyPendingTimers();
			});
			await act(async () => {
				await Promise.resolve();
			});

		expect(container.querySelector("[data-testid='home']")).not.toBeNull();
		expect(container.querySelector("[data-testid='about']")).toBeNull();
		expect(container.querySelector(".PageTransitionOverlay")).not.toBeNull();
		expect(
			document.documentElement.classList.contains("ScrollAuto"),
		).toBe(true);

		await act(async () => {
			transitionResolvers.shift()?.();
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(window.scrollTo).toHaveBeenCalledWith({
			top: 0,
			left: 0,
			behavior: "auto",
		});
		expect(container.querySelector("[data-testid='home']")).toBeNull();
		expect(container.querySelector("[data-testid='about']")).not.toBeNull();
		expect(container.querySelector(".PageTransitionOverlay")).not.toBeNull();

		act(() => {
			vi.runOnlyPendingTimers();
		});
		await act(async () => {
			await Promise.resolve();
		});

		await act(async () => {
			transitionResolvers.shift()?.();
			await Promise.resolve();
			await Promise.resolve();
		});

		expect(container.querySelector("[data-testid='home']")).toBeNull();
		expect(container.querySelector("[data-testid='about']")).not.toBeNull();
		expect(container.querySelector(".PageTransitionOverlay")).toBeNull();
		expect(
			document.documentElement.classList.contains("ScrollSmooth"),
		).toBe(true);

		unmount(root);
	});

	it("pageTransition=false のルートでは即時切り替えする", () => {
		const { container, root } = renderRoutes([
			baseRoutes[0],
			{ ...baseRoutes[1], pageTransition: false },
		]);
		const link = Array.from(
			container.querySelectorAll<HTMLAnchorElement>("a"),
		).find((anchor) => anchor.textContent === "About");

		act(() => {
			link?.click();
		});
		act(() => {
			vi.advanceTimersByTime(0);
		});

		expect(container.querySelector("[data-testid='home']")).toBeNull();
		expect(container.querySelector("[data-testid='about']")).not.toBeNull();
		expect(container.querySelector(".PageTransitionOverlay")).toBeNull();

		unmount(root);
	});

	it("prefers-reduced-motion: reduce では即時切り替えする", () => {
		setReducedMotion(true);
		const { container, root } = renderRoutes(baseRoutes);
		const link = container.querySelector<HTMLAnchorElement>("a");

		act(() => {
			link?.click();
		});
		act(() => {
			vi.advanceTimersByTime(0);
		});

		expect(container.querySelector("[data-testid='home']")).toBeNull();
		expect(container.querySelector("[data-testid='about']")).not.toBeNull();
		expect(container.querySelector(".PageTransitionOverlay")).toBeNull();

		unmount(root);
	});
});
