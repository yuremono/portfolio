import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import Test9 from "../src/pages/Test9";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Test9 />
		</BrowserRouter>
	</StrictMode>,
);
