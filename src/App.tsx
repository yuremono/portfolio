import { BrowserRouter, Routes, Route } from "react-router-dom";
import Preview from "./pages/Preview";
import Examples from "./pages/Examples";
import Rects from "./pages/Rects";
import Agent from "./pages/Agent";
import Next from "./pages/Next";
import ShuffleDivide from "./pages/shuffle-divide";
import Glitch from "./pages/glitch";

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<Routes>
				<Route path="/" element={<Preview />} />
				<Route path="/next" element={<Next />} />
				<Route path="/agent" element={<Agent />} />
				<Route path="/shuffle-divide" element={<ShuffleDivide />} />
				<Route path="/glitch" element={<Glitch />} />
				<Route path="/examples" element={<Examples />} />
				<Route path="/rects" element={<Rects />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
