import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import Bunmyaku from "../src/pages/Bunmyaku";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Bunmyaku />
		</BrowserRouter>
	</StrictMode>,
);
