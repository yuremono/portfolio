import { lazy } from "react";
import { BrowserRouter } from "react-router-dom";
import { InitialLoadingOverlay } from "./components/InitialLoadingOverlay";
import {
	PageTransitionRoutes,
	type PageTransitionRoute,
} from "./components/PageTransitionRoutes";

const Next = lazy(() => import("./pages/Next"));
const Preview = lazy(() => import("./pages/Preview"));
const Examples = lazy(() => import("./pages/Examples"));
const Rects = lazy(() => import("./pages/Rects"));
const Donut = lazy(() => import("./pages/Donut"));
const Aozora = lazy(() => import("./pages/Aozora"));
const Test26 = lazy(() => import("./pages/Test26"));
const ZzzScratch = lazy(() => import("./pages/ZzzScratch"));
const Test9 = lazy(() => import("./pages/Test9"));
const Lumaport = lazy(() => import("./pages/Lumaport"));
const ShuffleDivide = lazy(() => import("./pages/shuffle-divide"));
const Glitch = lazy(() => import("./pages/glitch"));
const Yugen = lazy(() => import("./pages/yugen"));
const Activity = lazy(() => import("./pages/Activity"));
const Test5 = lazy(() => import("./pages/Test5"));
const Test6 = lazy(() => import("./pages/Test6"));
const Test7 = lazy(() => import("./pages/Test7"));
const Test8 = lazy(() => import("./pages/Test8"));
const GridCarousel = lazy(() => import("./pages/GridCarousel"));
const Conversion = lazy(() => import("./pages/Conversion"));
const Bbox = lazy(() => import("./pages/Bbox"));

const routes: PageTransitionRoute[] = [
	{ path: "/", element: <Next /> },
	{ path: "/preview", element: <Preview /> },
	{ path: "/donut", element: <Donut /> },
	{ path: "/aozora", element: <Aozora /> },
	{ path: "/Test26", element: <Test26 /> },
	{ path: "/ZzzScratch", element: <ZzzScratch /> },
	{ path: "/Test9", element: <Test9 /> },
	{ path: "/Lumaport", element: <Lumaport /> },
	{ path: "/shuffle-divide", element: <ShuffleDivide /> },
	{ path: "/glitch", element: <Glitch /> },
	{ path: "/yugen", element: <Yugen /> },
	{ path: "/examples", element: <Examples /> },
	{ path: "/activity", element: <Activity /> },
	{ path: "/test5", element: <Test5 /> },
	{ path: "/test6", element: <Test6 /> },
	{ path: "/test7", element: <Test7 /> },
	{ path: "/test8", element: <Test8 /> },
	{ path: "/rects", element: <Rects /> },
	{ path: "/grid-carousel", element: <GridCarousel /> },
	{ path: "/conversion-inc", element: <Conversion /> },
	{ path: "/conversion", element: <Conversion /> },
	{ path: "/bbox", element: <Bbox /> },
];

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<InitialLoadingOverlay />
			<PageTransitionRoutes routes={routes} />
		</BrowserRouter>
	);
}

export default App;
