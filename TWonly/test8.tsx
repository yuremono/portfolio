import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import Test8 from "../src/pages/Test8";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Test8 />
		</BrowserRouter>
	</StrictMode>,
);
