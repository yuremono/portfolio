import { Link } from "react-router-dom";
import { Clock, Footprints, Sparkle } from "@phosphor-icons/react";
import { getAssetPath } from "../../lib/assetPath";

// 画像参照はページ内で同じ経路に揃える。
const asset = (path: string) => getAssetPath(`/images/lumaport/city/${path}`);

// 行き先カードは素材画像と表示テキストを対応させる。
const destinations = [
	{
		id: "cafe",
		title: "Quiet Cafe",
		label: "静かなカフェ",
		stay: "15 min",
		walk: "7 min",
		image: "c10.png",
	},
	{
		id: "gallery",
		title: "Tiny Gallery",
		label: "小さなギャラリー",
		stay: "25 min",
		walk: "10 min",
		image: "c11.png",
	},
	{
		id: "deck",
		title: "Sunset Deck",
		label: "夕日のデッキ",
		stay: "40 min",
		walk: "15 min",
		image: "c12.png",
	},
];

function CitySection() {
	return (
		<section
			className="w-full mt-0 relative isolate overflow-hidden  px-[--PX] py-[--MY] text-[oklch(0.24_0.08_225)]"
			aria-labelledby="city-title"
		>
			{/* 空港らしい周辺小物を背景として配置する。 */}
			<img
				src={asset("background.png")}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 bottom-0 z-0 mx-auto h-full w-full max-w-none object-cover object-bottom "
			/>

			<div className="wid mx-auto max-w-full relative">
				{/* セクションの導入文と行動ボタン。 */}
				<div className="relative z-10 flex flex-col items-start gap-8">
					<p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[oklch(0.32_0.12_190)]">
						<Sparkle size={18} weight="fill" aria-hidden="true" />
						City Pockets
					</p>
					<div
						className="h-1 w-20 rounded-full bg-[oklch(0.76_0.14_176)]"
						aria-hidden="true"
					/>
					<h2
						id="city-title"
						className="text-h2FZ font-bold leading-tight"
					>
						空港の外にある、
						<br />
						小さな目的地。
					</h2>
				</div>

				{/* マップ画像と行き先カードを重ねて都市散策の流れを見せる。 */}
				<div className="flex mt-[--PX]">
					<div className="space-y-6">
						<p className="max-w-2xl text-largeFZ font-bold leading-relaxed">
							移動時間と戻りやすさを基準に、
							<br className="hidden sm:block" />
							短い滞在でも楽しめる場所だけを選びます。
						</p>
						<Link
							to="#"
							className="inline-flex items-center justify-center rounded-full bg-[oklch(0.28_0.10_215)] px-8 py-4 text-base font-bold text-[oklch(0.96_0.04_180)] outline outline-2 outline-[oklch(0.30_0.10_205)]"
						>
							近くのスポットを見る
						</Link>
					</div>
					<div className="ml-auto grid gap sm:grid-cols-3 ">
						{destinations.map((destination) => (
							<Link
								key={destination.id}
								to="#"
								className="group relative block rounded-lg bg-[oklch(0.18_0.08_215)] p-2 text-[oklch(0.94_0.06_170)] outline outline-2 outline-[oklch(0.70_0.15_178)] transition-transform hover:-translate-y-2 focus:outline-4"
							>
								<img
									src={asset(destination.image)}
									alt=""
									className="w-full rounded-md"
								/>
								<div className="sr-only">
									{destination.title}、{destination.label}
									、滞在 {destination.stay}、徒歩{" "}
									{destination.walk}
								</div>
								<div
									className="pointer-events-none absolute inset-x-5 bottom-5 hidden items-center justify-between gap-2 text-xs font-bold sm:flex"
									aria-hidden="true"
								>
									<span className="inline-flex items-center gap-1">
										<Clock size={18} weight="bold" />
										{destination.stay}
									</span>
									<span className="h-6 w-px bg-[oklch(0.70_0.15_178/0.35)]" />
									<span className="inline-flex items-center gap-1">
										<Footprints size={18} weight="fill" />
										{destination.walk}
									</span>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

export default CitySection;
