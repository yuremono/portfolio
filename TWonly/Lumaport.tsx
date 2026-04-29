import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import Lumaport from "../src/pages/Lumaport";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Lumaport />
		</BrowserRouter>
	</StrictMode>,
);
