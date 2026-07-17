import { useRef } from "react";

import CanvasEffectLayer from "./Donut/CanvasEffectLayer";
import EffectWarpDefs from "./Donut/EffectWarpDefs";
import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";

import RingScrollShowcase from "./Donut/RingScrollShowcase";

export default function Donut() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass(
		"Donuts [--wid:85%] [--logoW:calc(100%_-_var(--wid))] [--Eng:var(--Ship)] [&_::-webkit-scrollbar]:bg-transparent [&_::-webkit-scrollbar]:w-0 [&_::-webkit-scrollbar]:h-0",
	);

	return (
		<PageRoot ref={pageRootRef}>
			<EffectWarpDefs />
			<CanvasEffectLayer />
			<Header className="Triangle" />
			<RingScrollShowcase />
		</PageRoot>
	);
}
