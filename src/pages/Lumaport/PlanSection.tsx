import { Link } from "react-router-dom";
import { ArrowRightIcon, SparkleIcon } from "@phosphor-icons/react";
import { getAssetPath } from "../../lib/assetPath";

// 画像パス: plan配下の素材参照をこの関数にまとめる。
const asset = (name: string) => getAssetPath(`/images/lumaport/plan/${name}`);

// 手順カード: デザインの3ステップをDOMと支給アイコンで再現する。
const planSteps = [
	{
		id: "01",
		title: "時間を入力",
		icons: ["i10.png"],
		text: "フライトの出発時刻から、使える時間を自動で計算します。",
	},
	{
		id: "02",
		title: "気分を選ぶ",
		icons: ["i12.png", "i13.png", "i14.png"],
		text: "気分に合わせて「カフェ巡り」「アート散歩」「サンセット」から選択。",
	},
	{
		id: "03",
		title: "ルートを受け取る",
		icons: ["i15.png"],
		text: "移動時間や混雑を考慮した、あなただけの最適ルートが完成。",
	},
];

// ルート表示: 下部のタイムラインに並べる仮プラン。
const routeItems = [
	{ id: "start", label: "NRT", time: "14:10", image: "i10.png" },
	{ id: "coffee", label: "Coffee", time: "35m", image: "i12.png" },
	{ id: "gallery", label: "Gallery", time: "50m", image: "i13.png" },
	{ id: "gate", label: "Gate", time: "17:30", image: "i10.png" },
];

export function PlanSection() {
	return (
		<section className="relative isolate mt-0 w-full overflow-hidden px-[--PX] py-[--MY] text-[--MC]">
			{/* 背景装飾: 支給背景画像をセクション全体に敷く。 */}
			<img
				src={asset("bg02.png")}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center "
			/>
			<div className="absolute inset-0 -z-20 " />

			<div className="mx-auto flex w-full max-w-[--wid] flex-col gap-[--gap]">
				{/* 見出し: プラン生成の価値を伝える導入。 */}
				<div className="grid items-start gap lg:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)]">
					<div className="flex flex-col items-start gap-6">
						<p className="inline-flex items-center gap-2 rounded-md bg-[--MC] px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.05em] text-[--AC]">
							<SparkleIcon aria-hidden="true" weight="fill" />
							<span>PLAN BUILDER</span>
						</p>
						<h2 className="max-w-4xl  font-bold leading-[1.45] md:">
							フライトまでの時間から、
							<br />
							寄り道プランを組み立てる。
						</h2>
						<p className="max-w-2xl  font-bold leading-[2]">
							出発時刻・気分・移動距離をもとに、
							<br className="hidden sm:block" />
							カフェ、展示、夕景スポットを無理なくつなぎます。
						</p>
						<Link
							to="#"
							className="inline-flex items-center gap-2 rounded-md bg-[--MC] px-6 py-4 font-bold text-[--AC] transition hover:translate-y-[-2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--MC] focus-visible:ring-offset-2"
						>
							プランを試す
							<ArrowRightIcon aria-hidden="true" weight="bold" />
						</Link>
					</div>
				</div>

				{/* 手順カード: 入力からルート提案までを3枚で示す。 */}
				<ol className="grid gap lg:grid-cols-3">
					{planSteps.map((step, index) => (
						<li key={step.id} className="relative">
							<article className="h-full overflow-hidden rounded-md border-2 border-[--MC] bg-WH shadow-none">
								<header className="flex items-center justify-center gap-4 bg-[--MC] px-4 py-4 text-[--AC] sm:gap-8 sm:px-6">
									<span className="font-mono text-[--FZ] font-bold text-ω[--AC]">
										{step.id}ω
									</span>
									<h3 className="text-[--FZ] font-bold">
										{step.title}
									</h3>
								</header>
								<div className="flex min-h-56 flex-col items-center justify-center gap-6 px-6 py-8 text-center">
									<div className="flex min-h-20 items-center justify-center gap-4">
										{step.icons.map((icon) => (
											<img
												key={icon}
												src={asset(icon)}
												alt=""
												aria-hidden="true"
												className="h-16 w-auto object-contain sm:h-20"
											/>
										))}
									</div>
									<p className="text-base font-bold leading-[1.8] text-[--MC]">
										{step.text}
									</p>
								</div>
							</article>
							{index < planSteps.length - 1 ? (
								<div className="hidden lg:absolute lg:left-full lg:top-1/2 lg:z-10 lg:flex lg:w-[--gap] lg:-translate-y-1/2 lg:items-center lg:justify-center">
									<span className="text-3xl font-bold leading-none text-[--MC]">
										•••
									</span>
								</div>
							) : null}
						</li>
					))}
				</ol>

				{/* タイムライン: 完成した寄り道ルートのサンプル。 */}
				<div className="rounded-md border-2 border-[--MC] bg-WH px-6 py-5 text-[--MC]">
					<ol className="grid gap-6 md:grid-cols-4">
						{routeItems.map((item, index) => (
							<li
								key={item.id}
								className="relative flex items-center gap-4 md:justify-center"
							>
								<div className="flex size-16 shrink-0 items-center justify-center rounded-md border-2 border-[--MC] bg-WH">
									<img
										src={asset(item.image)}
										alt=""
										aria-hidden="true"
										className="max-h-12 max-w-12 object-contain"
									/>
								</div>
								<div className="font-mono font-bold leading-[1.35]">
									<p className="">{item.label}</p>
									<p
										className={
											index === 0 ||
											index === routeItems.length - 1
												? ""
												: " text-[--SC]"
										}
									>
										{item.time}
									</p>
								</div>
								{index < routeItems.length - 1 ? (
									<div
										className="hidden md:block md:h-px md:flex-1 md:border-t-2 md:border-dashed md:border-[--MC]"
										aria-hidden="true"
									/>
								) : null}
							</li>
						))}
					</ol>
				</div>
			</div>
		</section>
	);
}
