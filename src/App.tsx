import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Next = lazy(() => import("./pages/Next"));
const Preview = lazy(() => import("./pages/Preview"));
const Examples = lazy(() => import("./pages/Examples"));
const Rects = lazy(() => import("./pages/Rects"));
const Agent = lazy(() => import("./pages/Agent"));
const ShuffleDivide = lazy(() => import("./pages/shuffle-divide"));
const Glitch = lazy(() => import("./pages/glitch"));

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<Suspense fallback={null}>
				<Routes>
					<Route path="/" element={<Next />} />
					<Route path="/preview" element={<Preview />} />
					<Route path="/agent" element={<Agent />} />
					<Route path="/shuffle-divide" element={<ShuffleDivide />} />
					<Route path="/glitch" element={<Glitch />} />
					<Route path="/examples" element={<Examples />} />
					<Route path="/rects" element={<Rects />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
