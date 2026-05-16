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
const LingoChat = lazy(() => import("./pages/LingoChat"));
const Bunmyaku = lazy(() => import("./pages/Bunmyaku"));
const ShuffleDivide = lazy(() => import("./pages/ShuffleDivide"));
const Glitch = lazy(() => import("./pages/Glitch"));
const Yugen = lazy(() => import("./pages/Yugen"));
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
	{ path: "/preview", element: <Preview />, transitionTitle: "BYOS" },
	{ path: "/donut", element: <Donut />, transitionTitle: "Donut" },
	{ path: "/aozora", element: <Aozora />, transitionTitle: "Aozora" },
	{ path: "/Test26", element: <Test26 />, transitionTitle: "Test26" },
	{
		path: "/ZzzScratch",
		element: <ZzzScratch />,
		transitionTitle: "ZzzScratch",
	},
	{ path: "/Test9", element: <Test9 />, transitionTitle: "Test9" },
	{ path: "/Lumaport", element: <Lumaport />, transitionTitle: "Lumaport" },
	{
		path: "/lingochat",
		element: <LingoChat />,
		transitionTitle: "LingoChat",
	},
	{
		path: "/Bunmyaku",
		element: <Bunmyaku />,
		transitionTitle: "Bunmyaku",
	},
	{
		path: "/ShuffleDivide",
		element: <ShuffleDivide />,
		transitionTitle: "ShuffleDivide",
	},
	{ path: "/glitch", element: <Glitch />, transitionTitle: "Glitch" },
	{ path: "/yugen", element: <Yugen />, transitionTitle: "Yugen" },
	{ path: "/examples", element: <Examples />, transitionTitle: "Examples" },
	{ path: "/activity", element: <Activity />, transitionTitle: "Activity" },
	{ path: "/test5", element: <Test5 />, transitionTitle: "Test5" },
	{ path: "/test6", element: <Test6 />, transitionTitle: "Test6" },
	{ path: "/test7", element: <Test7 />, transitionTitle: "Test7" },
	{ path: "/test8", element: <Test8 />, transitionTitle: "Test8" },
	{ path: "/rects", element: <Rects />, transitionTitle: "Rects" },
	{
		path: "/grid-carousel",
		element: <GridCarousel />,
		transitionTitle: "GridCarousel",
	},
	{
		path: "/conversion-inc",
		element: <Conversion />,
		transitionTitle: "ConversionInc",
	},
	{
		path: "/conversion",
		element: <Conversion />,
		transitionTitle: "Conversion",
	},
	{ path: "/bbox", element: <Bbox />, transitionTitle: "Bbox" },
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
