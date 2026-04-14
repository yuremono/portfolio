import { useEffect } from "react";

import CanvasEffectLayer from "../features/donuts/CanvasEffectLayer";
import EffectWarpDefs from "../features/donuts/EffectWarpDefs";
import AgentHeader from "../features/donuts/AgentHeader";
import RingScrollShowcase from "../features/donuts/RingScrollShowcase";

import "../scss/Agent.scss";

export default function Agent() {
	useEffect(() => {
		const root = document.documentElement;
		const { body } = document;
		root.classList.add("agent-cms-active");
		body.classList.add("siteBody");
		return () => {
			root.classList.remove("agent-cms-active");
			body.classList.remove("siteBody");
		};
	}, []);

	return (
		<>
			<EffectWarpDefs />
			<CanvasEffectLayer />
			<AgentHeader />
			<RingScrollShowcase />
		</>
	);
}
