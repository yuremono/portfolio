import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

const Next = lazy(() => import("./pages/Next"));
const Preview = lazy(() => import("./pages/Preview"));
const Examples = lazy(() => import("./pages/Examples"));
const Rects = lazy(() => import("./pages/Rects"));
const Agent = lazy(() => import("./pages/Agent"));
const ShuffleDivide = lazy(() => import("./pages/shuffle-divide"));
const Glitch = lazy(() => import("./pages/glitch"));
const Activity = lazy(() => import("./pages/Activity"));
const Test5 = lazy(() => import("./pages/Test5"));
const GridCarousel = lazy(() => import("./pages/GridCarousel"));

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<ScrollToTop />
			<Suspense fallback={null}>
				<Routes>
					<Route path="/" element={<Next />} />
					<Route path="/preview" element={<Preview />} />
					<Route path="/agent" element={<Agent />} />
					<Route path="/shuffle-divide" element={<ShuffleDivide />} />
					<Route path="/glitch" element={<Glitch />} />
					<Route path="/examples" element={<Examples />} />
					<Route path="/activity" element={<Activity />} />
					<Route path="/test5" element={<Test5 />} />
					<Route path="/rects" element={<Rects />} />
					<Route path="/grid-carousel" element={<GridCarousel />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
