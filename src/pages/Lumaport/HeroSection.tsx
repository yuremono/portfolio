import { AirplaneTilt, ArrowRight, CaretDown, Clock } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { getAssetPath } from "../../lib/assetPath";

// アセット参照: ページ内画像の解決方法を統一する。
const asset = (path: string) => getAssetPath(`images/lumaport/hero/${path}`);

// テーマ選択: ヒーロー右下パネルの選択肢。
const themes = [
	{ label: "Coffee", sub: "カフェ巡り", image: "i02.png" },
	{ label: "Gallery", sub: "アート散歩", image: "i03.png" },
	{ label: "Sunset", sub: "サンセット", image: "i04.png" },
];

function HeroSection() {
	return (
		<section className="relative mt-0 min-h-[--mvH] w-full overflow-hidden text-[--WH]">
			{/* ヒーロー背景: mv01.png を画面いっぱいに配置する。 */}
			<img
				src={asset("mv01.png")}
				alt=""
				className="pointer-events-none absolute inset-0 h-full w-full max-w-none select-none object-cover object-center"
			/>

			{/* メインコピー: 左側に強い日本語見出しとCTAを置く。 */}
			<div className="relative z-10 flex min-h-[calc(var(--mvH)_-_var(--head))] items-center px-[--PX] pb-28 pt-[calc(var(--head)_+_3rem)] md:pb-32 md:pt-[calc(var(--head)_+_4rem)]">
				<div className="w-full max-w-[--wid]">
					<div className="max-w-[34rem]">
						<h1 className="leading-tight  WTS">
							待ち時間を、
							<br />
							小さな旅に。
						</h1>
						<p className="mt-6 max-w-md text-base font-bold leading-8 WTS">
							空港から始まる3時間の街歩きプランを、
							<br />
							気分とフライト時刻から提案します。
						</p>
						<div className="mt-8 flex flex-wrap gap-4">
							<Link to="#" className="flex min-w-48 items-center justify-center gap-6 rounded-lg bg-[--AC] px-8 py-4 font-bold text-[--MC]">
								旅を探す
								<ArrowRight size={24} aria-hidden="true" />
							</Link>
							<Link
								to="#"
								className="flex min-w-48 items-center justify-center gap-6 rounded-lg BorderXY bg-[--MC] px-8 py-4 font-bold text-[--WH]"
							>
								使い方を見る
								<ArrowRight size={24} aria-hidden="true" />
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* ターミナルカード: 左下の案内板風UIを追加する。 */}
			<aside className="relative z-10 mx-[--PX] -mt-24 mb-6 w-[min(92%,28rem)] overflow-hidden rounded-xl border-2 border-[--MC] bg-[--AC] text-[--MC] md:absolute md:bottom-8 md:left-0 md:mt-0">
				<div className="flex items-center justify-between gap-4 bg-[--MC] px-4 py-2 font-mono text-[--WH]">
					<p className="text-[--h3FZ] font-bold leading-none tracking-[0.125em]">TERMINAL LUMA</p>
					<p className="rounded-md border border-[--AC] px-2 py-1 text-xs font-bold">GATE L-25</p>
				</div>
				<div className="flex items-center justify-between gap-4 px-4 py-3 font-mono text-xs font-bold tracking-[0.125em] md:text-base">
					<p>HAVE A NICE MICRO TRIP!</p>
					<span aria-hidden="true">⌣</span>
				</div>
			</aside>

			{/* 提案パネル: 右下に旅の条件とテーマカードをまとめる。 */}
			<aside className="relative z-10 ml-auto mr-[--PX] mb-10 w-[min(92%,32rem)] rounded-2xl BorderXY bg-[--MC] p-4 md:absolute md:bottom-8 md:right-0">
				<div className="grid grid-cols-3 gap-4 border-b border-[--AC] pb-4">
					<div className="border-r border-[--AC] pr-4">
						<AirplaneTilt size={32} weight="fill" aria-hidden="true" />
						<p className="mt-2 text-xs font-bold uppercase">From</p>
						<p className="text-[--h2FZ] font-bold leading-tight">NRT</p>
						<p className="text-xs font-bold">東京（成田）</p>
					</div>
					<div className="border-r border-[--AC] pr-4">
						<Clock size={28} aria-hidden="true" />
						<p className="mt-2 text-xs font-bold uppercase">Duration</p>
						<p className="text-[--h2FZ] font-bold leading-tight">3h 20m</p>
					</div>
					<div>
						<p className="mt-10 text-xs font-bold uppercase">Theme</p>
						<p className="flex items-center gap-3 text-[--h2FZ] font-bold leading-tight">
							ALL
							<CaretDown size={22} aria-hidden="true" />
						</p>
					</div>
				</div>
				<div className="mt-4 grid grid-cols-3 gap-3">
					{themes.map((theme) => (
						<Link key={theme.label} to="#" className="rounded-lg BorderXY p-3 text-center text-[--WH]">
							<img src={asset(theme.image)} alt="" className="mx-auto h-16 w-full object-contain" />
							<p className="font-bold">{theme.label}</p>
							<p className="mt-1 text-xs font-bold text-[--SC]">{theme.sub}</p>
						</Link>
					))}
				</div>
				<Link to="#" className="mt-4 flex items-center justify-center gap-6 rounded-lg bg-[--AC] px-8 py-4 text-center h3FZ font-bold text-[--MC]">
					プランを提案する
					<ArrowRight size={24} aria-hidden="true" />
				</Link>
			</aside>
		</section>
	);
}

export default HeroSection;
