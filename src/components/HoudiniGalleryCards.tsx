import { HoudiniPaint, type HoudiniPaintProps } from "./HoudiniPaint";

interface HoudiniCard {
	title: string;
	group: string;
	paintName: string;
	workletUrl?: string;
	style: HoudiniPaintProps["style"];
	bezelSides?: {
		className: string;
		direction: string;
		color: string;
	}[];
}

const workletUrl = "/houdini/portfolio-paints.js";

const cards: HoudiniCard[] = [
	{
		title: "Snow Field",
		group: "Particle",
		paintName: "portfolio-snow",
		style: {
			"--paint-density": 260,
			"--paint-min": 1,
			"--paint-max": 6,
			"--paint-seed": 111,
		},
	},
	{
		title: "Confetti",
		group: "Particle",
		paintName: "portfolio-confetti",
		style: {
			"--paint-density": 120,
			"--paint-colors": "#f25f4c, #ff8906, #e53170, #3da9fc",
			"--paint-seed": 222,
		},
	},
	{
		title: "Star Dust",
		group: "Particle",
		paintName: "portfolio-stars",
		style: {
			"--paint-density": 160,
			"--paint-color": "#fffffe",
			"--paint-seed": 333,
		},
	},
	{
		title: "Bubble Cluster",
		group: "Particle",
		paintName: "portfolio-bubbles",
		style: {
			"--paint-density": 30,
			"--paint-min": 14,
			"--paint-max": 86,
			"--paint-colors": "#3da9fc, #90b4ce, #fffffe",
			"--paint-seed": 444,
		},
	},
	{
		title: "Isometric Grid",
		group: "Geometry",
		paintName: "portfolio-isometric",
		style: {
			"--paint-color": "rgba(255,255,255,0.2)",
			"--paint-accent": "#3da9fc",
			"--paint-gap": 34,
		},
	},
	{
		title: "Polka Dot Fade",
		group: "CodePen",
		paintName: "portfolio-polka-dot-fade",
		style: {
			"--dot-spacing": "20px",
			"--dot-fade-offset": "0%",
			"--dot-color": "#fc466b",
		},
	},
	{
		title: "Circles",
		group: "Houdini.how",
		paintName: "circles",
		workletUrl: "https://unpkg.com/css-houdini-circles/dist/circles.js",
		style: {
			"--colors": "#f94144, #f8961e, #90be6d, #43aa8b, #577590",
			"--min-radius": 12,
			"--max-radius": 90,
			"--min-opacity": 18,
			"--max-opacity": 64,
			"--num-circles": 22,
		},
	},
	{
		title: "Connections",
		group: "Houdini.how",
		paintName: "connections",
		workletUrl: "https://unpkg.com/css-houdini-connections/dist/connections.js",
		style: {
			"--connections-particleColor": "#fffffe",
			"--connections-lineColor": "#3da9fc",
			"--connections-particleAmount": 150,
			"--connections-defaultRadius": 2,
			"--connections-variantRadius": 4,
			"--connections-linkRadius": 72,
		},
	},
	{
		title: "Lines",
		group: "Houdini.how",
		paintName: "lines",
		workletUrl: "https://unpkg.com/css-houdini-lines/dist/lines.js",
		style: {
			"--lines-colors": "#f25f4c, #ff8906, #e53170, #3da9fc",
			"--lines-widths": "18, 4, 10, 2",
			"--lines-gaps": "14, 3, 9, 18",
			"--lines-rotate": 225,
		},
	},
	{
		title: "Voronoi",
		group: "Houdini.how",
		paintName: "voronoi",
		workletUrl: "https://unpkg.com/css-houdini-voronoi/dist/worklet.js",
		style: {
			"--voronoi-cell-colors": "#001858, #172c66, #3da9fc, #90b4ce, #fffffe",
			"--voronoi-number-of-cells": 36,
			"--voronoi-line-color": "#fffffe",
			"--voronoi-line-width": 1,
			"--voronoi-dot-color": "#f25f4c",
			"--voronoi-dot-size": 2,
		},
	},
	{
		title: "Fractals",
		group: "Houdini.how",
		paintName: "fractals",
		workletUrl: "https://unpkg.com/css-houdini-fractals@1.1.0/fractals.js",
		style: {
			"--colors": "#fffffe #f25f4c #ff8906 #e53170 #3da9fc",
			"--shape": "line",
			"--angle": 28,
			"--starting-length-percent": 28,
			"--next-line-size": 0.72,
		},
	},
	{
		title: "Sparkles",
		group: "Houdini.how",
		paintName: "extra-sparkles",
		workletUrl: "https://unpkg.com/extra-sparkles/worklet.js",
		style: {
			"--extra-sparkleNumber": 80,
			"--extra-sparkleHue": 205,
			"--extra-sparkleHeightVariance": 16,
			"--extra-sparkleWidthVariance": 18,
			"--extra-sparkleWeightVariance": 4,
		},
	},
	{
		title: "Powdered Gradient",
		group: "Houdini.how",
		paintName: "powdered-gradient",
		workletUrl: "https://unpkg.com/houdini-powdered-gradient/worklet.js",
		style: {
			"--powdered-gradient-direction": "to-top",
			"--powdered-gradient-color": "#fffffe",
			"--powdered-gradient-size": 3,
		},
	},
	{
		title: "Static Gradient Bezel",
		group: "CodePen",
		paintName: "static-gradient",
		workletUrl: "https://unpkg.com/houdini-static-gradient/worklet.js",
		style: {
			"--static-gradient-size": 10,
			"--static-gradient-width": `35%`,
		},
		bezelSides: [
			{
				className: "inset-x-0 top-0 h-[--static-gradient-width]",
				direction: "to-bottom",
				color: "#f25f4c",
			},
			{
				className: "inset-y-0 right-0 w-[--static-gradient-width]",
				direction: "to-left",
				color: "#ff8906",
			},
			{
				className: "inset-x-0 bottom-0 h-[--static-gradient-width]",
				direction: "to-top",
				color: "#3da9fc",
			},
			{
				className: "inset-y-0 left-0 w-[--static-gradient-width]",
				direction: "to-right",
				color: "#e53170",
			},
		],
	},
];

export function HoudiniGalleryCards() {
	return (
		<div className="Cards col4  PX">
			{cards.map((card) => {
				if (card.bezelSides) {
					return (
						<div key={card.title} className="item relative content-end min-h-[38lvh] bg-TC p-6 text-[--WH]">
							{card.bezelSides.map((side) => (
								<HoudiniPaint
									key={side.direction}
									workletUrl={card.workletUrl ?? workletUrl}
									paintName={card.paintName}
									className={`absolute  ${side.className}`}
									style={{
										...card.style,
										"--static-gradient-direction": side.direction,
										"--static-gradient-color": side.color,
									}}
								/>
							))}
							<div className="mix-blend-difference">
							<p className=" text-xl  ">{card.group}</p>
							<h2 className="h3FZ  ">{card.title}</h2>
						</div>
						</div>
					);
				}

				return (
					<HoudiniPaint
						key={card.paintName}
						workletUrl={card.workletUrl ?? workletUrl}
						paintName={card.paintName}
						className={`item min-h-[30lvh] content-end bg-[--TC] p-6 text-[--WH] ${card.paintName === "portfolio-polka-dot-fade" ? "houdini-polka-card" : ""}`}
						style={card.style}
					>
						<div className="mix-blend-difference">
							<p className=" text-xl  ">{card.group}</p>
							<h2 className="h3FZ  ">{card.title}</h2>
						</div>
					</HoudiniPaint>
				);
			})}
		</div>
	);
}
