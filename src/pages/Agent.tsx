import { useRef } from "react";

import CanvasEffectLayer from "../features/donuts/CanvasEffectLayer";
import EffectWarpDefs from "../features/donuts/EffectWarpDefs";
import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";

import RingScrollShowcase from "../features/donuts/RingScrollShowcase";

import "../scss/Agent.scss";

export default function Agent() {
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
