import {
	Suspense,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import {
	Route,
	Routes,
	matchPath,
	useLocation,
	useNavigate,
	type Location,
} from "react-router-dom";

import {
	readPageTransitionCanvasLabel,
	resolveCssColorOnElement,
	waitForPageTransitionCanvasFont,
} from "../lib/effects/pageTransitionCanvasLabel";
import { INITIAL_LOADING_LABEL_TEXT } from "./InitialLoadingOverlay";
import { ScrollToTop } from "./ScrollToTop";
import { playPageTransitionMosaique } from "../lib/effects/maskMosaique";

const ScrollSmoothClass = "ScrollSmooth";
const ScrollAutoClass = "ScrollAuto";

/**
 * 試験用: `true` のとき cover 完了後〜reveal 開始前のキャンバス全面塗りつぶしをスキップする。
 * 従来動作に戻すなら `false` に変更するだけでよい。
 */
const PAGE_TRANSITION_SKIP_SOLID_FILL_BETWEEN_PHASES = true;
const PAGE_TRANSITION_READY_TIMEOUT_MS = 1400;

export interface PageTransitionRoute {
	path: string;
	element: ReactNode;
	pageTransition?: boolean;
	/** 遷移アニメの canvas に出す名前。省略時は URL 末尾から自動生成。 */
	transitionTitle?: string;
}

function prefersReducedMotion() {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
		return false;
	}

	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function findRoute(routes: PageTransitionRoute[], pathname: string) {
	return routes.find((route) =>
		matchPath({ path: route.path, end: true }, pathname),
	);
}

/** 未定義時は末尾セグメントをそのまま、ハイフン区切りは単語頭を大文字にそろえる。 */
function defaultTransitionTitle(pathname: string): string {
	const normalized = pathname.replace(/\/+$/, "") || "/";
	if (normalized === "/") {
		return INITIAL_LOADING_LABEL_TEXT;
	}
	const leaf =
		normalized.split("/").filter(Boolean).pop() ?? pathname.replace(/^\//u, "");

	if (!leaf) {
		return INITIAL_LOADING_LABEL_TEXT;
	}
	if (!leaf.includes("-")) {
		if (/^[a-z][a-z0-9]*$/u.test(leaf)) {
			return leaf.charAt(0).toUpperCase() + leaf.slice(1);
		}
		return leaf;
	}

	return leaf
		.replace(/-/g, " ")
		.replace(/\b\w/gu, (character) => character.toUpperCase());
}

function resolveRouteTransitionTitle(
	routes: PageTransitionRoute[],
	pathname: string,
): string {
	const route = findRoute(routes, pathname);
	if (route?.transitionTitle) {
		return route.transitionTitle;
	}
	return defaultTransitionTitle(pathname);
}

function canAnimateRouteChange(
	routes: PageTransitionRoute[],
	from: Location,
	to: Location,
) {
	if (from.pathname === to.pathname || prefersReducedMotion()) {
		return false;
	}

	const fromRoute = findRoute(routes, from.pathname);
	const toRoute = findRoute(routes, to.pathname);

	return fromRoute?.pageTransition !== false && toRoute?.pageTransition !== false;
}

function readTimeMs(value: string, fallback: number) {
	const trimmed = value.trim();
	if (!trimmed) return fallback;
	const parsed = Number.parseFloat(trimmed);
	if (!Number.isFinite(parsed)) return fallback;
	return trimmed.endsWith("ms") ? parsed : parsed * 1000;
}

function readTransitionMosaicOptions(
	source: Element = document.documentElement,
) {
	const rootStyle = getComputedStyle(source);
	const pageTransitionMs = readTimeMs(
		rootStyle.getPropertyValue("--pageTR"),
		600,
	);
	const rawColor =
		rootStyle.getPropertyValue("--page-rect-bg").trim() ||
		rootStyle.getPropertyValue("--MC").trim() ||
		"#101010";
	const sizeFactor = Number.parseFloat(
		rootStyle.getPropertyValue("--page-rect-size").trim(),
	);

	return {
		color: resolveCssColorOnElement(rawColor, "#101010", source),
		sizeFactor: Number.isFinite(sizeFactor) ? sizeFactor : 0.01875,
		stagger: pageTransitionMs,
	};
}

function setDocumentScrollMode(mode: "smooth" | "auto") {
	document.documentElement.classList.toggle(ScrollSmoothClass, mode === "smooth");
	document.documentElement.classList.toggle(ScrollAutoClass, mode === "auto");
}

function fillCanvas(canvas: HTMLCanvasElement, color: string) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
		canvas.width = Math.max(1, window.innerWidth);
		canvas.height = Math.max(1, window.innerHeight);
		canvas.style.width = `${canvas.width}px`;
		canvas.style.height = `${canvas.height}px`;
	}

	ctx.fillStyle = color;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function waitForTimeout(ms: number) {
	return new Promise<void>((resolve) => {
		window.setTimeout(resolve, ms);
	});
}

function waitForNextFrame() {
	return new Promise<void>((resolve) => {
		window.requestAnimationFrame(() => resolve());
	});
}

async function waitForStableFrames(count = 2) {
	for (let i = 0; i < count; i += 1) {
		await waitForNextFrame();
	}
}

async function waitForDocumentFonts() {
	if (!("fonts" in document)) return;

	try {
		await document.fonts.ready;
	} catch {
		// Font readiness is best-effort; a failed font should not freeze navigation.
	}
}

async function waitForImageDecode(image: HTMLImageElement) {
	if (image.complete && image.naturalWidth > 0) return;

	try {
		if (typeof image.decode === "function") {
			await image.decode();
			return;
		}
	} catch {
		return;
	}

	await new Promise<void>((resolve) => {
		const done = () => resolve();
		image.addEventListener("load", done, { once: true });
		image.addEventListener("error", done, { once: true });
	});
}

async function waitForVisualReadiness(root: Element | null) {
	if (!root) {
		await waitForStableFrames();
		return;
	}

	const images = Array.from(root.querySelectorAll<HTMLImageElement>("img"))
		.filter((image) => image.currentSrc || image.src)
		.slice(0, 16);

	await Promise.race([
		Promise.all([
			waitForDocumentFonts(),
			Promise.all(images.map((image) => waitForImageDecode(image))),
			waitForStableFrames(),
		]).then(() => undefined),
		waitForTimeout(PAGE_TRANSITION_READY_TIMEOUT_MS),
	]);
}

function stripBasePath(pathname: string) {
	const base = import.meta.env.BASE_URL;
	if (base === "/" || !pathname.startsWith(base)) {
		return pathname;
	}

	const stripped = pathname.slice(base.length - 1);
	return stripped || "/";
}

function getInternalNavigationTarget(event: MouseEvent) {
	if (
		event.defaultPrevented ||
		event.button !== 0 ||
		event.metaKey ||
		event.altKey ||
		event.ctrlKey ||
		event.shiftKey
	) {
		return null;
	}

	const target = event.target;
	if (!(target instanceof Element)) return null;

	const anchor = target.closest<HTMLAnchorElement>("a[href]");
	if (!anchor || anchor.target || anchor.hasAttribute("download")) return null;

	const rawHref = anchor.getAttribute("href");
	if (
		!rawHref ||
		rawHref.startsWith("#") ||
		rawHref.startsWith("mailto:") ||
		rawHref.startsWith("tel:")
	) {
		return null;
	}

	const url = new URL(anchor.href, window.location.href);
	if (url.origin !== window.location.origin) return null;

	const pathname = stripBasePath(url.pathname);
	if (pathname === window.location.pathname && url.hash) return null;

	return `${pathname}${url.search}${url.hash}`;
}

function RouteCommitMarker({
	location,
	onCommit,
}: {
	location: Location;
	onCommit: (location: Location) => void;
}) {
	useLayoutEffect(() => {
		onCommit(location);
	}, [location, onCommit]);

	return null;
}

function AnimatedRouteSet({
	location,
	onCommit,
	routes,
}: {
	location: Location;
	onCommit: (location: Location) => void;
	routes: PageTransitionRoute[];
}) {
	return (
		<Suspense fallback={null}>
			<Routes location={location}>
				{routes.map((route) => (
					<Route
						key={route.path}
						path={route.path}
						element={route.element}
					/>
				))}
			</Routes>
			<RouteCommitMarker location={location} onCommit={onCommit} />
		</Suspense>
	);
}

export function PageTransitionRoutes({ routes }: {
	routes: PageTransitionRoute[];
}) {
	const location = useLocation();
	const navigate = useNavigate();
	const [overlayVisible, setOverlayVisible] = useState(false);
	const transitionRef = useRef<HTMLDivElement | null>(null);
	const textStyleProbeRef = useRef<HTMLParagraphElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const currentLocationRef = useRef(location);
	const pendingTargetRef = useRef<string | null>(null);
	const transitionRunningRef = useRef(false);
	const routeCommitWaiterRef = useRef<{
		pathname: string;
		resolve: () => void;
	} | null>(null);

	useEffect(() => {
		currentLocationRef.current = location;
	}, [location]);

	useEffect(() => {
		setDocumentScrollMode("smooth");

		return () => {
			document.documentElement.classList.remove(
				ScrollSmoothClass,
				ScrollAutoClass,
			);
		};
	}, []);

	const handleRouteCommit = useCallback((committedLocation: Location) => {
		const waiter = routeCommitWaiterRef.current;
		if (!waiter || committedLocation.pathname !== waiter.pathname) return;

		routeCommitWaiterRef.current = null;
		waiter.resolve();
	}, []);

	function waitForRouteCommit(pathname: string) {
		if (currentLocationRef.current.pathname === pathname) {
			return Promise.resolve();
		}

		return new Promise<void>((resolve) => {
			routeCommitWaiterRef.current = { pathname, resolve };
		});
	}

	async function runTransition(target: string) {
		if (transitionRunningRef.current) return;
		transitionRunningRef.current = true;
		pendingTargetRef.current = target;

		setDocumentScrollMode("auto");
		setOverlayVisible(true);
		await new Promise((resolve) => window.setTimeout(resolve, 0));

		const canvas = canvasRef.current;
		if (!canvas) {
			navigate(target);
			setOverlayVisible(false);
			transitionRunningRef.current = false;
			pendingTargetRef.current = null;
			setDocumentScrollMode("smooth");
			return;
		}

		const root = transitionRef.current ?? document.documentElement;
		const mosaic = readTransitionMosaicOptions(root);
		const resolved = new URL(target, window.location.href);
		const targetPathname = stripBasePath(resolved.pathname);
		const transitionText = resolveRouteTransitionTitle(
			routes,
			targetPathname,
		);
		const textProbe = textStyleProbeRef.current ?? root;
		const label = readPageTransitionCanvasLabel(
			transitionText,
			root,
			textProbe,
		);
		const options = { ...mosaic, label };

		await waitForPageTransitionCanvasFont(label);
		await playPageTransitionMosaique(canvas, "cover", options);

		if (pendingTargetRef.current !== target) return;

		// ScrollToTopを戻す場合は、この直接スクロールと下の disabled を外す。
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		if (!PAGE_TRANSITION_SKIP_SOLID_FILL_BETWEEN_PHASES) {
			fillCanvas(canvas, mosaic.color);
		}
		navigate(target);
		await waitForRouteCommit(targetPathname);
		await waitForVisualReadiness(transitionRef.current);
		if (!PAGE_TRANSITION_SKIP_SOLID_FILL_BETWEEN_PHASES) {
			fillCanvas(canvas, mosaic.color);
		}

		await playPageTransitionMosaique(canvas, "reveal", options);

		if (pendingTargetRef.current !== target) return;
		setOverlayVisible(false);
		transitionRunningRef.current = false;
		pendingTargetRef.current = null;
		setDocumentScrollMode("smooth");
	}

	function handleNavigationClick(event: ReactMouseEvent<HTMLDivElement>) {
		const target = getInternalNavigationTarget(event.nativeEvent);
		if (!target) return;

		const targetUrl = new URL(target, window.location.origin);
		const targetLocation = {
			...location,
			pathname: targetUrl.pathname,
			search: targetUrl.search,
			hash: targetUrl.hash,
		};
		if (!canAnimateRouteChange(routes, currentLocationRef.current, targetLocation)) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		void runTransition(target);
	}

	return (
		<div
			ref={transitionRef}
			className={`PageTransition ${
				overlayVisible ? "PageTransitionRunning" : ""
			}`}
			onClickCapture={handleNavigationClick}
		>
			{/* 一時停止中。戻す場合は disabled を外し、上の直接 scrollTo を削除する。 */}
			<ScrollToTop disabled />
			<AnimatedRouteSet
				location={location}
				onCommit={handleRouteCommit}
				routes={routes}
			/>
			{overlayVisible ? (
				<div className="PageTransitionOverlay" aria-hidden="true">
					<p
						ref={textStyleProbeRef}
						className="InitialLoadingTextProbe mmPin"
						aria-hidden="true"
					/>
					<canvas ref={canvasRef} className="PageTransitionCanvas" />
				</div>
			) : null}
		</div>
	);
}
