import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

const Next = lazy(() => import("./pages/Next"));
const Preview = lazy(() => import("./pages/Preview"));
const Examples = lazy(() => import("./pages/Examples"));
const Rects = lazy(() => import("./pages/Rects"));
const Donut = lazy(() => import("./pages/Donut"));
const Aozora = lazy(() => import("./pages/Aozora"));
const Test26 = lazy(() => import("./pages/Test26"));
const ZzzScratch = lazy(() => import("./pages/ZzzScratch"));
const Test9 = lazy(() => import("./pages/Test9"));
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

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<ScrollToTop />
			<Suspense fallback={null}>
				<Routes>
					<Route path="/" element={<Next />} />
					<Route path="/preview" element={<Preview />} />
					<Route path="/donut" element={<Donut />} />
					<Route path="/aozora" element={<Aozora />} />
					<Route path="/Test26" element={<Test26 />} />
					<Route path="/ZzzScratch" element={<ZzzScratch />} />
					<Route path="/Test9" element={<Test9 />} />
					<Route path="/shuffle-divide" element={<ShuffleDivide />} />
					<Route path="/glitch" element={<Glitch />} />
					<Route path="/yugen" element={<Yugen />} />
					<Route path="/examples" element={<Examples />} />
					<Route path="/activity" element={<Activity />} />
					<Route path="/test5" element={<Test5 />} />
					<Route path="/test6" element={<Test6 />} />
					<Route path="/test7" element={<Test7 />} />
					<Route path="/test8" element={<Test8 />} />
					<Route path="/rects" element={<Rects />} />
					<Route path="/grid-carousel" element={<GridCarousel />} />
					<Route path="/conversion-inc" element={<Conversion />} />
					<Route path="/conversion" element={<Conversion />} />
					<Route path="/bbox" element={<Bbox />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
