import {
	Suspense,
	type MouseEvent as ReactMouseEvent,
	type ReactNode,
	useEffect,
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

import { ScrollToTop } from "./ScrollToTop";
import { playPageTransitionMosaique } from "../lib/effects/maskMosaique";

const ScrollSmoothClass = "PageTransitionScrollSmooth";
const ScrollInstantClass = "PageTransitionScrollInstant";

export interface PageTransitionRoute {
	path: string;
	element: ReactNode;
	pageTransition?: boolean;
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

function resolveCssColor(
	value: string,
	fallback: string,
	scope: Element = document.documentElement,
) {
	const probe = document.createElement("span");
	probe.style.color = value || fallback;
	scope.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	probe.remove();
	return resolved || fallback;
}

function readTransitionOptions(source: Element = document.documentElement) {
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
		color: resolveCssColor(rawColor, "#101010", source),
		sizeFactor: Number.isFinite(sizeFactor) ? sizeFactor : 0.01875,
		stagger: pageTransitionMs,
	};
}

function setDocumentScrollMode(mode: "smooth" | "instant") {
	document.documentElement.classList.toggle(ScrollSmoothClass, mode === "smooth");
	document.documentElement.classList.toggle(ScrollInstantClass, mode === "instant");
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

function RouteSet({ location, routes }: {
	location: Location;
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
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const currentLocationRef = useRef(location);
	const pendingTargetRef = useRef<string | null>(null);
	const transitionRunningRef = useRef(false);

	useEffect(() => {
		currentLocationRef.current = location;
	}, [location]);

	useEffect(() => {
		setDocumentScrollMode("smooth");

		return () => {
			document.documentElement.classList.remove(
				ScrollSmoothClass,
				ScrollInstantClass,
			);
		};
	}, []);

	async function runTransition(target: string) {
		if (transitionRunningRef.current) return;
		transitionRunningRef.current = true;
		pendingTargetRef.current = target;

		setDocumentScrollMode("instant");
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

		const options = readTransitionOptions(
			transitionRef.current ?? document.documentElement,
		);
		await playPageTransitionMosaique(canvas, "cover", options);

		if (pendingTargetRef.current !== target) return;

		// ScrollToTopを戻す場合は、この直接スクロールと下の disabled を外す。
		window.scrollTo({ top: 0, left: 0, behavior: "auto" });
		fillCanvas(canvas, options.color);
		navigate(target);
		await new Promise((resolve) => window.setTimeout(resolve, 0));
		fillCanvas(canvas, options.color);

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
			<div className="PageTransitionActive">
				<RouteSet location={location} routes={routes} />
			</div>
			{overlayVisible ? (
				<div className="PageTransitionOverlay" aria-hidden="true">
					<canvas ref={canvasRef} className="PageTransitionCanvas" />
				</div>
			) : null}
		</div>
	);
}
