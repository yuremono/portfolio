/**
 * /test5 用 FAQ セクション。
 *
 * 既存の CustomClass (.Stick / .Toggle / .Cards / .IsQa) を使わず Tailwind と
 * 同ファイル内にスコープした <style> だけで「背景画像が sticky に貼り付き、前面に Q&A が
 * スクロールしてくる」レイアウトを再現する。
 *
 * ::details-content に height transition を効かせるために最小限の scoped CSS を同梱。
 * data-section 属性でこのセクション配下にしか影響しないように限定している。
 */

import { CaretDownIcon } from "@phosphor-icons/react";
import { getAssetPath } from "../../lib/assetPath";
import type { ReactNode } from "react";

type QAItem = {
	q: string;
	a: ReactNode;
};

const items: QAItem[] = [
	{
		q: "このセクションは何を示していますか?",
		a: "既存の CustomClass (.Toggle / .IsQa / .Stick) を使わず、Tailwind とこのファイル内に閉じた <style> だけで FAQ UI を再現する例です。",
	},
	{
		q: "なぜ 1 ファイルに収めるのですか?",
		a: "他プロジェクトへ持ち込むときに、このファイルだけコピーすれば済む状態を作るためです。グローバル CSS への追記が不要になります。",
	},
	{
		q: "キーフレームや擬似要素はどう書きますか?",
		a: "Tailwind の arbitrary variant で書ききれない部分 (::details-content など) は、コンポーネント内部の <style> に data-section で scope させて同梱します。",
	},
	{
		q: "デザインシステムとの折り合いは?",
		a: "ルート変数 (--MC / --SC / --head) は :root で定義される前提のまま使っています。Tailwind + CSS 変数 の組み合わせは自然に共存できます。",
	},
];

export default function FAQSection() {
	return (
		<section
			data-section="t5-faq"
			className="relative w-auto max-w-none mx-[calc(50%-50vw)] mt-[var(--MY)]"
		>
			<style>{`
				[data-section="t5-faq"] details { interpolate-size: allow-keywords; }
				[data-section="t5-faq"] details::details-content {
					transition: height 0.4s ease, content-visibility 0.4s allow-discrete;
					height: 0;
					overflow: hidden;
				}
				[data-section="t5-faq"] details[open]::details-content { height: auto; }
				[data-section="t5-faq"] details[open] .t5-chev { transform: translateY(-50%) scaleY(-1); }
				[data-section="t5-faq"] summary::-webkit-details-marker { display: none; }
			`}</style>

			<div className="sticky top-[var(--head)] h-[100lvh] flex gap-[var(--gap)] px-[var(--PX)]">
				<figure className="w-1/2 m-0 overflow-hidden">
					<img
						src={getAssetPath("/images/picsum/018.jpg")}
						alt=""
						className="w-full h-full object-cover block"
					/>
				</figure>
				<figure className="w-1/2 m-0 overflow-hidden">
					<img
						src={getAssetPath("/images/picsum/019.jpg")}
						alt=""
						className="w-full h-full object-cover block"
					/>
				</figure>
			</div>

			<div className="relative z-[1] -mt-[90lvh] mb-[var(--MY)] w-[min(100%,var(--wid))] md:w-1/2 mx-auto p-4 xl:p-8 bg-[var(--WH)]/60 backdrop-blur-sm">
				<h2 className="text-center pb-12 font-[family-name:var(--Eng)]">
					<span className="block text-2xl text-[var(--GR)] mb-2">
						Toggle
					</span>
					Accordion Contents
				</h2>

				<div className="flex flex-col">
					{items.map((item, i) => (
						<details
							key={i}
							className="border-t border-[var(--TC)]/20 last:border-b"
						>
							<summary className="relative list-none cursor-pointer pl-[4em] pr-[2.5em] py-4 transition-opacity hover:opacity-80">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 inline-grid place-items-center w-8 aspect-square rounded bg-[var(--MC)] text-[var(--WH)] font-[family-name:var(--Eng)]">
									Q
								</span>
								<span className="font-medium">{item.q}</span>
								<CaretDownIcon
									className="t5-chev absolute right-4 top-1/2 -translate-y-1/2 text-2xl transition-transform"
									aria-hidden
								/>
							</summary>
							<div className="relative pl-[4em] pr-[2.5em] py-4">
								<span className="absolute left-4 top-4 inline-grid place-items-center w-8 aspect-square rounded bg-[var(--SC)] text-[var(--WH)] font-[family-name:var(--Eng)]">
									A
								</span>
								<p>{item.a}</p>
							</div>
						</details>
					))}
				</div>
			</div>
		</section>
	);
}
