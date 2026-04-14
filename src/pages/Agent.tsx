import { useEffect } from "react";

import CanvasEffectLayer from "../features/donuts/CanvasEffectLayer";
import EffectWarpDefs from "../features/donuts/EffectWarpDefs";
import Header from "../components/Header";
import { useClientRuntime } from "../hooks/useClientRuntime";

import RingScrollShowcase from "../features/donuts/RingScrollShowcase";

import "../scss/Agent.scss";

export default function Agent() {
	useClientRuntime();
	useEffect(() => {
		const root = document.documentElement;
		const { body } = document;
		root.classList.add("Donuts");
		body.classList.add("siteBody");
		return () => {
			root.classList.remove("Donuts");
			body.classList.remove("siteBody");
		};
	}, []);

	return (
		<>
			<EffectWarpDefs />
			<CanvasEffectLayer />
			<Header className="Triangle" />
			<RingScrollShowcase />
		</>
	);
}
