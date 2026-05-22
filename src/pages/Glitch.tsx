import { useEffect, useRef } from "react";
import { createGlitchLayers } from "../lib/initGlitch";
import { initBgTrigger } from "../lib/initBgTrigger";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { PageRoot } from "../components/PageRoot";

import "../scss/glitch.scss";

const images = {
	over: getAssetPath("/images/common/glitch-bg00.png"),
	heroA: getAssetPath("/images/common/glitch01.jpg"),
	heroB: getAssetPath("/images/common/glitch02.jpg"),
	heroC: getAssetPath("/images/common/glitch-bg04.jpg"),
	heroD: getAssetPath("/images/common/glitch-bg04.jpg"),
	phone: getAssetPath("/images/common/glitch-phone.jpg"),
	frame: getAssetPath("/images/common/glitch-frame.png"),
};

function Glitch() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	const openingRef = useRef<HTMLElement>(null);
	const detailsRef = useRef<HTMLElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	useEffect(() => {
		if (!pageRootRef.current) return;
		const root = pageRootRef.current;
		const layers = createGlitchLayers(root);
		const { disconnect } = initBgTrigger(root, {
			onAfterActivate: ({ activeBgItem }) => {
				layers.syncActiveItem(activeBgItem);
			},
		});
		return () => {
			disconnect();
			layers.disconnect();
		};
	}, []);

	const scrollToSection = (target: HTMLElement | null) => {
		if (!target) return;
		target.scrollIntoView({
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? "auto"
				: "smooth",
			block: "start",
		});
	};

	return (
		<PageRoot
			ref={pageRootRef}
			className="glitch [--background:--BK] [--foreground:--WH]  isolate [--Eng:--Jost] [--innerPX:--PX] [--HFW:100] [--letter-delay:0.1s] "
		>
			<Header className="NoLogo TopHidden  [--menuC:--WH] [--SPnavC:--BK]" />

			<main aria-label="Glitch page" className="[--MY:0px] ">
				<section className=" bgLayer out">
					<div className="bgItem __glitch p-split">
                                                <img
                                                        className="bgGlitch"
                                                        src={images.heroA} alt="" loading="eager" />
						<img
							className="bgOverImg"
							src={images.over}
							alt=""
							loading="lazy"
						/>
						<p
							className="JsLetter JsLetterToggle"
							aria-label="Char Anime Text"
						>
							Char
							<br />
							Anime
							<br />
							Text
						</p>
					</div>
					<div className="bgItem __glitch p-split">
                                                <img
                                                        className="bgGlitch"
                                                        src={images.heroB} alt="" loading="lazy" />
						<img
							className="bgOverImg"
							src={images.over}
							alt=""
							loading="lazy"
						/>
						<p
							className="bgTxRight JsLetter JsLetterToggle text-left  sm:px-3"
							aria-label="Leading Students toward Ideal Professions."
						>
							Leading
							<br />
							Students toward
							<br />
							Ideal
							<br />
							Professions.
						</p>
					</div>
					<div className="bgItem" aria-hidden="true" />
					<div className="bgItem">
						<img
							className="bgPhone"
							src={images.phone}
							alt=""
							loading="lazy"
						/>
						<img
							className="bgFrame"
							src={images.frame}
							alt=""
							loading="lazy"
						/>
					</div>
					<div className="bgItem __glitch p-split">
                                                <img
                                                        className="bgGlitch"
                                                        src={images.heroC} alt="" loading="eager" />
						<img
							className="bgOverImg"
							src={images.over}
							alt=""
							loading="lazy"
						/>
						<p
							className="JsLetter JsLetterToggle"
							aria-label="Char Anime Text"
						>
							Char
							<br />
							Anime
							<br />
							Text
						</p>
					</div>
				</section>

				<section
					ref={openingRef}
					className=" js-bgTrigger first"
					aria-label="Glitch opening"
				>
					<div className="h-[75vh]" />
				</section>

				<section
					className=" js-bgTrigger ml-0 spPX10p w-1/2  text-right max-sm:w-full"
					aria-label="Concept"
				>
					<div className="min-h-screen">
						<p className="h3FZ budoux sm:px-3">
							未来世代の職業を
							<br />
							設計する協力者
						</p>
					</div>
				</section>

				<section
					className="part_rect out js-bgTrigger grid min-h-[75lvh] content-center gap-[var(--gap)]"
					aria-label="Service overview"
				>
					<div className=" ml-0 px-[--PX] sm:px-0 w-1/2 text-right max-sm:w-full">
						<h1 className="ml-0 mb-12 [font-family:var(--Eng)] text-[var(--h3FZ)] italic leading-[1.1] [text-shadow:0_1rem_4rem_var(--BK80)]">
                                                わたしたちの
							<br />
							ワンストップサービス
						</h1>
					</div>
					<div className=" w-full">
						<button
							type="button"
							className="borderLink w-full appearance-none border-0 bg-transparent p-0 text-left"
							onClick={() => scrollToSection(detailsRef.current)}
						>
							<i>
								Digital Platform
								<br />
								Administration
							</i>
							管理代理
						</button>
						<button
							type="button"
							className="borderLink w-full appearance-none border-0 bg-transparent p-0 text-left"
							onClick={() => scrollToSection(detailsRef.current)}
						>
							<i>
								Career Search
								<br />
								Assistance
							</i>
							就業活動援助
						</button>
					</div>
				</section>

				<section
					ref={detailsRef}
					className=" js-bgTrigger mr-0 spPX10p txshbk w-1/2 max-sm:w-full"
					aria-label="Details"
				>
					<div className="min-h-[75lvh]">
						<h2 className="m-0 mb-12  text-[var(--h2FZ)] italic leading-[1.1] [text-shadow:0_1rem_4rem_var(--BK80)]">
							Digital Platform Administration
						</h2>
						<button
							type="button"
							className="btn mt48"
							onClick={() => scrollToSection(openingRef.current)}
						>
							DETAILS
						</button>
					</div>
				</section>
				<section
					ref={detailsRef}
					className=" js-bgTrigger ml-0 text-TC text-right spPX10p txshwh w-1/2 max-sm:w-full"
					aria-label="Details"
				>
					<div className="min-h-[75lvh]">
						<h2 className="m-0 mb-12  text-[var(--h2FZ)] italic leading-[1.1] [text-shadow:0_1rem_4rem_var(--BK80)]">
							Digital Platform Administration
						</h2>
						<button
							type="button"
							className="btn mt48"
							onClick={() => scrollToSection(openingRef.current)}
						>
							DETAILS
						</button>
					</div>
				</section>
                        </main>
                        <Footer/>
                        
		</PageRoot>
	);
}

export default Glitch;
