import { ShieldCheck } from "@phosphor-icons/react";
import { getAssetPath } from "../../lib/assetPath";

// アセット参照: Safe セクションの画像パスをページ内で統一する。
const asset = (path: string) => getAssetPath(`images/lumaport/safe/${path}`);

// 指標カード: デザイン下部の余裕時間・移動時間・搭乗口を表示する。
const safetyStats = [
	{
		id: "buffer",
		image: "c01.png",
		alt: "余裕時間45分",
		label: "Buffer",
		value: "45m",
	},
	{
		id: "walk",
		image: "c02.png",
		alt: "徒歩12分",
		label: "Walk",
		value: "12m",
	},
	{
		id: "gate",
		image: "c03.png",
		alt: "搭乗口17時30分",
		label: "Gate",
		value: "17:30",
	},
];

function SafeSection() {
	return (
		<section className="[--wid:900px] relative isolate mt-0 w-full overflow-hidden px-[--PX] py-[--MY] text-[--MC]">
			{/* 背景装飾: 空港周辺のピクセル素材を左右に広げる。 */}
			<img
				src={asset("bg03.png")}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-full w-full object-cover object-bottom "
			/>

			<div className="mx-auto max-w-[--wid] items-center gap-[--gap] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,30rem)]">
				<div className="relative overflow-hidden rounded-[2rem] BorderXY bg-[--MC] p-6 text-WH BS md:p-8">
					<div className="absolute right-8 top-14 hidden w-32 md:block">
						<img src={asset("i20.png")} alt="" aria-hidden="true" className="block h-auto w-full object-contain" />
					</div>

					<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.125em] text-[--AC]">
						<ShieldCheck size={22} weight="fill" aria-hidden="true" />
						<span>Safe Return</span>
					</div>

					<div className="mt-6 max-w-[38rem] pr-0 md:pr-32">
						<h2 className="text-[--h3FZ] font-black leading-[--LH] md:text-[--h2FZ]">
							搭乗時刻から逆算して、
							<br />
							戻る余裕まで見える。
						</h2>
						<p className="mt-6 max-w-2xl text-[--FZ] font-bold leading-[--LH] text-WH">
							チェックイン、保安検査、搭乗口までの移動を見込んで、寄り道の終わり時刻を自動で調整します。
						</p>
					</div>

					<div className="mt-8 border-t-2 border-dashed border-[--AC] pt-8">
						<img src={asset("flow.png")} alt="現在地、出発、探索、帰路、搭乗口までの流れ" className="w-full" />
					</div>

					<div className="mt-8 grid gap-4 md:grid-cols-3">
						{safetyStats.map((stat) => (
							<div key={stat.id} className="overflow-hidden rounded-[1.25rem]">
								<img src={asset(stat.image)} alt={stat.alt} className="block h-auto w-full object-contain" />
								<div className="sr-only">
									{stat.label} {stat.value}
								</div>
							</div>
						))}
					</div>
				</div>

				
			</div>
		</section>
	);
}

export default SafeSection;
