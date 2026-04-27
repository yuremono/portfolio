import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import Test26 from "../src/pages/Test26";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Test26 />
		</BrowserRouter>
	</StrictMode>,
);
