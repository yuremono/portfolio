import { useEffect, useRef } from "react";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";

import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { PageRoot } from "../components/PageRoot";


import { initShuffleDivide } from "../features/shuffle-divide/initShuffleDivide";
import { getAssetPath } from "../lib/assetPath";

import "../scss/shuffle-divide.scss";

const heroImages = [
	{
		src: "/images/picsum/001.jpg",
		alt: "抽象的なポートフォリオ用ビジュアル 1",
	},
	{
		src: "/images/picsum/002.jpg",
		alt: "抽象的なポートフォリオ用ビジュアル 2",
	},
];

const tabPanels = [
	{
		buttonLabel: "夕暮れの海",
		buttonLead: "Sunset Sea",
		image: "/images/picsum/003.jpg",
		alt: "夕暮れの海と波",
		contentClassName: "Bottom leading-[1.5em] ",
		content: (
			<mark className="">
				波の向こうに
				<br />
				日が沈む
			</mark>
		),
	},
	{
		buttonLabel: "緑の畝",
		buttonLead: "Green Rows",
		image: "/images/picsum/007.jpg",
		alt: "整然と並ぶ緑の畑",
		contentClassName: "Right",
		content: (
			<span className="tate  text-center text-[--TC]">
				風が通る
				<br />
				緑のライン
			</span>
		),
	},
	{
		buttonLabel: "霧の山",
		buttonLead: "Misty Ridge",
		image: "/images/picsum/005.jpg",
		alt: "霧に包まれた山並み",
		contentClassName: "HeaderCenter",
		content: <span>Silent Mountain</span>,
	},
	{
		buttonLabel: "水中の光",
		buttonLead: "Water Light",
		image: "/images/picsum/006.jpg",
		alt: "水中から見た波と光",
		contentClassName: "Center",
		content: "水面がほどける",
	},
];

function ShuffleDivide() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	useEffect(() => {
		const root = pageRootRef.current;
		if (!root) return undefined;

		const runtime = initShuffleDivide(root);
		return runtime.disconnect;
	}, []);

	return (
		<PageRoot ref={pageRootRef}>
			<Header className=" " />

			<main
				className="shuffle-divide [--h1FZ:clamp(32px,6.4vw,96px)]"
				aria-label="Shuffle Divide  page"
			>
                        <div className="clearfix H-grad halfRight my-[10vh]">
                                <div>
                                        <p className="shuffle __lg __step">
                                                Right
                                                <br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;Shuffle
                                        </p>
                                </div>
                        </div>

                        <div className="cont01 out into  ">
                                <div className="clearfix  relative z-[10] text-white">
                                        <div>
                                                <h2 className="shuffle tate  ">Our&nbsp;Service</h2>
                                        </div>
                                </div>

                                <div className="cont01_fb abs0 JsCpL">
                                        {heroImages.map((image) => (
                                                <div className="box" key={image.src}>
                                                        <img src={getAssetPath(image.src)} alt={image.alt} />
                                                        <div aria-hidden="true" />
                                                </div>
                                        ))}
                                </div>

                                <div className=" cont01_tx halfRight">
                                        <div>
                                                <div className="JsCpL">
                                                        <h1 className="h2FZ">
                                                                <span>デザイン</span>で未来を創る
                                                        </h1>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        <div className="clearfix H-grad halfLeft">
                                <div>
                                        <p className="shuffle __lg __step">
                                                Left
                                                <br />
                                                &nbsp;&nbsp;&nbsp;&nbsp;Shuffle
                                        </p>
                                </div>
                        </div>

                        <div className="cont02  ">
                                <div className="tabContainer JsHide text-white">
                                        <div className="tabButtons">
                                                {tabPanels.map((panel, index) => (
                                                        <button
                                                                className="tab"
                                                                data-tab={index}
                                                                
                                                                type="button"
                                                        >
                                                                <i>{panel.buttonLead}</i>
                                                                {panel.buttonLabel}
                                                        </button>
                                                ))}
                                        </div>

                                        <button
                                                className="tab-next-button"
                                                type="button"
                                                aria-label="次のタブを表示"
                                        >
                                                <span aria-hidden="true">NEXT</span>
                                        </button>

                                        <div className="tabPanels">
                                                {tabPanels.map((panel) => (
                                                        <div
                                                                className="clearfix GenerateBox tabPanel"
                                                                
                                                        >
                                                                <img
                                                                        src={getAssetPath(panel.image)}
                                                                        alt={panel.alt}
                                                                        className="imgC"
                                                                />
                                                                <div>
                                                                        <div className={panel.contentClassName}>{panel.content}</div>
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                </div>
                        </div>

                        <div className="out my-[15vh] text-center">
                                <div className="clearfix H-grad pl1e">
                                        <div>
                                                <h2 className="shuffle __lg">PERFORMANCE END</h2>
                                        </div>
                                </div>
                        </div>
                        </main>
                        <Footer/>
                        
		</PageRoot>
	);
}

export default ShuffleDivide;
