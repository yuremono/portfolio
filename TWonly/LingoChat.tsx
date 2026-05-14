import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import LingoChat from "../src/pages/LingoChat";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<LingoChat />
		</BrowserRouter>
	</StrictMode>,
);
