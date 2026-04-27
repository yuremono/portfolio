import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import ZzzScratch from "../src/pages/ZzzScratch";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<ZzzScratch />
		</BrowserRouter>
	</StrictMode>,
);
