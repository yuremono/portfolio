import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import Test6 from "../src/pages/Test6";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Test6 />
		</BrowserRouter>
	</StrictMode>,
);
