import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import Aozora from "../src/pages/Aozora";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Aozora />
		</BrowserRouter>
	</StrictMode>,
);
