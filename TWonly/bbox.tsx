import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import Bbox from "../src/pages/Bbox";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter basename={import.meta.env.BASE_URL}>
			<Bbox />
		</BrowserRouter>
	</StrictMode>,
);
