import "../src/scss/_01variables.scss";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import Test7 from "../src/pages/Test7";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Test7 />
		</BrowserRouter>
	</StrictMode>,
);
