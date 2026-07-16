import { useEffect, useRef } from "react";
import { Image } from "../components/Image";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { PageRoot } from "../components/PageRoot";
// import { initGlitch } from "../features/glitch/initGlitch";
import { initBgTrigger } from "../lib/effects/initBgTrigger";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";

import "../styles/object/project/_glitch.scss";

const images = {
	heroA: getAssetPath("/images/yugen/bg/b1.png"),
	heroB: getAssetPath("/images/yugen/bg/b2.png"),
	heroC: getAssetPath("/images/yugen/bg/b3.png"),
	heroD: getAssetPath("/images/yugen/bg/b4.png"),
};

function Yugen() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	const openingRef = useRef<HTMLElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	useEffect(() => {
		if (!pageRootRef.current) return;
		// const runtime = initGlitch(pageRootRef.current);
		// return runtime.disconnect;
		const { disconnect } = initBgTrigger(pageRootRef.current);
		return disconnect;
	}, []);

	return (
		<PageRoot
			ref={pageRootRef}
			className="glitch bg-black text-white isolate [--Eng:--Jost] [--innerPX:--PX]  [--line:2px_solid_var(--AC)] [--HFW:400] [--HLS:0.5em]"
		>
			<Header className=" " />

			<main aria-label="Yuden page" className="[--MY:0px]">
				<section className="bgLayer out">
					<div className="bgItem  ">
						<img
							className="bgGlitch"
							src={images.heroA}
							alt=""
							loading="eager"
						/>
					</div>
					<div className="bgItem  ">
						<img
							className="bgGlitch"
							src={images.heroB}
							alt=""
							loading="lazy"
						/>
					</div>
					<div className="bgItem  ">
						<img
							className="bgGlitch"
							src={images.heroC}
							alt=""
							loading="lazy"
						/>
					</div>
					<div className="bgItem  ">
						<img
							className="bgGlitch"
							src={images.heroD}
							alt=""
							loading="lazy"
						/>
					</div>
				</section>

				<section
					ref={openingRef}
					className="js-bgTrigger"
					aria-label="Hero"
				>
					<div className="Hero out min-h-[100lvh]">
						<div className="item">
							<p className="Eng text-[length:9vmin] leading-none">
								soak <br /> sense <br /> return
							</p>
							<h1 className=" ">浸かる。感じる。還る。</h1>
							<p className="">
								to the water, to the body, to what is real.
							</p>
							<p className="BorderL pl-4 ">
								an alternative wellness complex
								<br />
								rooted in ancient ritual
								<br />
								tuned to the days.
							</p>
						</div>
					</div>
				</section>
				<section
					ref={openingRef}
					className="js-bgTrigger"
					aria-label="Water temperature"
				>
					<div className="Hero out min-h-[100lvh]">
						<div className="item">
							<p className="Eng text-[length:9vmin] leading-none">
								water
								<br />
								temperature
							</p>
							<h2 className=" ">湯の温度。感覚の目安。</h2>
							<p className="">
								water as it should be.
								<br />
								each degree, a different state.
							</p>
							<p className="BorderL pl-4 ">
								guided by tradition.
								<br />
								aligned with the body.
								<br />
								tuned to the moment.
							</p>
						</div>
					</div>
				</section>
				<section
					ref={openingRef}
					className="js-bgTrigger"
					aria-label="Meridian flow"
				>
					<div className="Hero out min-h-[100lvh]">
						<div className="item">
							<p className="Eng text-[length:9vmin] leading-none">
								meridian
								<br />
								flow
							</p>
							<h2 className=" ">経絡の流れ</h2>
							<p className="">
								the river within.
								<br />
								water remembers.
							</p>
							<p className="BorderL pl-4 ">
								so does the body.
								<br />
								meridians are tides—
								<br />
								guiding, cleansing,
								<br />
								returning.
								<br />
								<br />
								ritual bathing as
								<br />
								remembrance.
								<br />
								realignment.
								<br />
								return.
							</p>
						</div>
					</div>
				</section>

				<section
					className="Hero out js-bgTrigger"
					aria-label="Meridian flow"
				>
					<div className="item">
						<div className="grid min-h-[100lvh] items-center gap-[clamp(2rem,4vw,4rem)] md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
							<div className="max-w-[34rem] pt-[7vh]">
								<div className="mt-10 max-w-[20rem] border-l border-[--WH40] pl-4 text-[clamp(0.8rem,1vw,0.95rem)] leading-[2] tracking-[0.16em] text-[--WH70]"></div>
							</div>

							<div className="flex flex-col items-center gap-8 pt-[4vh]">
								<Image
									image={getAssetPath(
										"/images/yugen/assets/a3.png",
									)}
									alt=""
									figureClassName="w-[min(100%,60rem)]"
									imgClassName="w-full object-contain"
								/>
								<Image
									image={getAssetPath(
										"/images/yugen/assets/a4.png",
									)}
									alt=""
									figureClassName="w-[min(100%,58rem)]"
									imgClassName="w-full object-contain"
								/>
							</div>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</PageRoot>
	);
}

export default Yugen;
