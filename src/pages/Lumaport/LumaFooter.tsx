import {
	AirplaneTilt,
	ArrowRight,
	EnvelopeSimple,
	InstagramLogo,
	XLogo,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { getAssetPath } from "../../lib/assetPath";

// アセット参照をこのセクション内で統一する。
const asset = (path: string): string => getAssetPath(`/images/lumaport/${path}`);

// フッター内の主要リンク群。
const footerGroups = [
	{
		id: "service",
		icon: "footer/i30.png",
		title: "Service",
		links: ["Trips", "Layovers", "Guides"],
	},
	{
		id: "company",
		icon: "footer/i31.png",
		title: "Company",
		links: ["Story", "Journal", "Contact"],
	},
	{
		id: "support",
		icon: "footer/i32.png",
		title: "Support",
		links: ["Help", "Safety", "Terms"],
	},
];

// 出発案内風の装飾テーブル。
const departures = [
	{ code: "TYO", name: "CITY WALK", state: "ON TIME" },
	{ code: "COF", name: "COFFEE", state: "ON TIME" },
	{ code: "GAL", name: "GALLERY", state: "DELAY 05m" },
	{ code: "SUN", name: "SUNSET", state: "ON TIME" },
];

function LumaFooter() {
	return (
		<footer
			aria-labelledby="footer-heading"
			className="relative isolate overflow-hidden  px-[--PX] py-[--MY] text-[oklch(0.94_0.03_185)]"
		>
			{/* 背景装飾 */}
			<img
				src={asset("footer/left01.png")}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 left-0 z-10 w-[min(48vw,36rem)] max-md:w-[22rem]"
			/>
			<img
				src={asset("footer/right01.png")}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 right-0 z-10 w-[min(42vw,34rem)] max-md:w-[19rem]"
			/>

			<div className="relative mx-auto max-w-[--wid]">
				<div className="relative overflow-hidden rounded-[2rem] border border-[oklch(0.76_0.12_164)] bg-[oklch(0.22_0.08_210)] px-[--PX] pb-[--PY] pt-[--PX2] shadow-none md:rounded-[2.5rem]">
					<div className="pointer-events-none absolute inset-x-[--PX] bottom-[--PY] h-px bg-[oklch(0.76_0.12_164)]" />

					{/* 上段コンテンツ */}
					<div className="grid gap lg:grid-cols-[1fr_1.5fr_1fr] lg:items-start">
						<div className="relative z-20 max-w-md">
							<h2 id="footer-heading" className="sr-only">
								LUMA PORT footer
							</h2>
							<Link
								to="#"
								aria-label="LUMA PORT home"
								className="inline-block"
							>
								<img
									src={asset("hero/logo.png")}
									alt="LUMA PORT"
									className="h-auto w-[min(19rem,72vw)] object-contain brightness-0 invert"
								/>
							</Link>
							<p className="mt-8 text-base leading-[var(--LH)]">
								空港からはじまる、
								<br />
								あなたの3時間を特別にする
								<br />
								マイクロトラベルサービスです。
							</p>

							<div className="mt-8 flex gap-4">
								<Link
									to="#"
									aria-label="Instagram"
									className="grid size-11 place-items-center rounded-lg border border-[oklch(0.67_0.11_164)] text-[oklch(0.75_0.13_164)]"
								>
									<InstagramLogo size={24} weight="bold" />
								</Link>
								<Link
									to="#"
									aria-label="X"
									className="grid size-11 place-items-center rounded-lg border border-[oklch(0.67_0.11_164)] text-[oklch(0.75_0.13_164)]"
								>
									<XLogo size={24} weight="bold" />
								</Link>
								<Link
									to="#"
									aria-label="Mail"
									className="grid size-11 place-items-center rounded-lg border border-[oklch(0.67_0.11_164)] text-[oklch(0.75_0.13_164)]"
								>
									<EnvelopeSimple size={24} weight="bold" />
								</Link>
							</div>
						</div>

						{/* フッターナビゲーション */}
						<nav
							aria-label="Footer navigation"
							className="relative z-20 grid gap sm:grid-cols-3"
						>
							{footerGroups.map((group) => (
								<div
									key={group.id}
									className="border-[oklch(0.59_0.09_173)] sm:border-l sm:pl-[--gap]"
								>
									<img
										src={asset(group.icon)}
										alt=""
										aria-hidden="true"
										className="mb-4 size-16 object-contain"
									/>
									<p className=" font-bold text-[oklch(0.78_0.14_150)]">
										{group.title}
									</p>
									<div className="my-4 border-t border-dotted border-[oklch(0.66_0.11_153)]" />
									<ul className="space-y-4">
										{group.links.map((label) => (
											<li key={label}>
												<Link
													to="#"
													className="flex items-center justify-between gap-4 text-base font-bold"
												>
													<span>{label}</span>
													<ArrowRight
														size={26}
														weight="bold"
														className="text-[oklch(0.78_0.14_150)]"
													/>
												</Link>
											</li>
										))}
									</ul>
								</div>
							))}
						</nav>

						{/* 出発案内 */}
						<div className="relative z-20 rounded-2xl border border-[oklch(0.72_0.12_163)] bg-[oklch(0.18_0.06_205)] p-6 text-xs">
							<div className="mb-4 flex items-center gap-2  font-bold uppercase text-[oklch(0.78_0.14_150)]">
								<span>Departures</span>
								<AirplaneTilt size={20} weight="fill" />
							</div>
							<div className="space-y-3 border-t border-[oklch(0.43_0.07_195)] pt-3 font-bold uppercase">
								{departures.map((item) => (
									<div
										key={item.code}
										className="grid grid-cols-[3rem_1fr_auto] gap-4"
									>
										<span>{item.code}</span>
										<span>{item.name}</span>
										<span
											className={
												item.state.startsWith("DELAY")
													? "text-[oklch(0.84_0.16_88)]"
													: "text-[oklch(0.78_0.14_150)]"
											}
										>
											{item.state}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* CTAフォーム */}
					<div className="relative z-20 mt-[--gap] ml-auto max-w-3xl rounded-3xl border border-[oklch(0.72_0.12_163)] bg-[oklch(0.19_0.07_205)] p-6">
						<div className="mb-4 flex items-center gap-4  font-bold">
							<span className="relative grid size-14 place-items-center rounded-md bg-[oklch(0.80_0.14_150)] text-[oklch(0.20_0.07_205)]">
								<EnvelopeSimple size={36} weight="fill" />
								<span className="absolute -right-2 -top-2 size-5 rounded-full bg-[oklch(0.74_0.18_9)]" />
							</span>
							<span>次の待ち時間を、旅に変える。</span>
						</div>
						<form className="grid gap-4 sm:grid-cols-[1fr_auto]">
							<label className="sr-only" htmlFor="footer-email">
								メールアドレス
							</label>
							<input
								id="footer-email"
								type="email"
								placeholder="メールアドレスを入力"
								className="min-h-16 rounded-xl border border-[oklch(0.72_0.12_163)] bg-transparent px-6 text-base text-[oklch(0.94_0.03_185)] placeholder:text-[oklch(0.78_0.04_185)]"
							/>
							<Link
								to="#"
								className="inline-flex min-h-16 items-center justify-center gap-8 rounded-xl bg-[oklch(0.82_0.14_150)] px-8 text-base font-bold text-[oklch(0.19_0.07_205)]"
							>
								<span>通知を受け取る</span>
								<ArrowRight size={28} weight="bold" />
							</Link>
						</form>
					</div>

					{/* コピーライト */}
					<p className="relative z-20 mt-8 text-center text-base font-bold tracking-[0.125em] text-[oklch(0.76_0.12_164)]">
						© LUMA PORT
					</p>
				</div>
			</div>
		</footer>
	);
}

export default LumaFooter;
