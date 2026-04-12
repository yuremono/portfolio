import { BrowserRouter, Routes, Route } from "react-router-dom";
import Preview from "./pages/Preview";
import Test2 from "./pages/Test2";
import Test3 from "./pages/test3";
import Playground from "./pages/Playground";
import Examples from "./pages/Examples";
import Rects from "./pages/Rects";

function App() {
	return (
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<Routes>
				<Route path="/" element={<Preview />} />
				<Route path="/test2" element={<Test2 />} />
				<Route path="/test3" element={<Test3 />} />
				<Route path="/playground" element={<Playground />} />
				<Route path="/examples" element={<Examples />} />
				<Route path="/rects" element={<Rects />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
