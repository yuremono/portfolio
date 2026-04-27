import { useRef } from "react";

import CanvasEffectLayer from "./Donut/CanvasEffectLayer";
import EffectWarpDefs from "./Donut/EffectWarpDefs";
import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";

import RingScrollShowcase from "./Donut/RingScrollShowcase";

import "../scss/Donut.scss";

export default function Donut() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass("Donuts");

	return (
		<PageRoot ref={pageRootRef}>
			<EffectWarpDefs />
			<CanvasEffectLayer />
			<Header className="Triangle" />
			<RingScrollShowcase />
		</PageRoot>
	);
}
