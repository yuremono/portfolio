/**
 * /test5 用 イントロセクション。
 *
 * 既存の CustomClass (.Stick / .Panel / .StickItem / .BorderDraw 等) を使わず、
 * Tailwind ユーティリティとグローバル CSS 変数 (--head / --MY / --into / --gap / --PX / --Eng) だけで
 * 左固定見出し + 右スクロールパネルのレイアウトを 1 ファイルに閉じて再現する。
 *
 * 他プロジェクトへ移植するときはこの 1 ファイルと依存 2 つ (`Image` 相当 = 直接 <img>, `getAssetPath`) を運ぶだけで済むことを狙う。
 */

import { getAssetPath } from "../../lib/assetPath";

type IntroItem = {
	title: string;
	image: string;
	body: string;
};

const items: IntroItem[] = [
	{
		title: "Sticky Heading",
		image: "/images/picsum/011.jpg",
		body: "左側の見出しを position:sticky top-0 で固定し、右側のコンテンツだけがスクロールします。CustomClass の .Stick と同じ挙動を Tailwind のみで組み直しています。",
	},
	{
		title: "Tailwind Only",
		image: "/images/picsum/012.jpg",
		body: "クラス名は Tailwind のユーティリティか CSS 変数を指す arbitrary 値 (bg-[var(--TC)] 等) のみ。プロジェクト固有のクラスに依存しないため、Tailwind さえ入っていれば動きます。",
	},
	{
		title: "Single-file Section",
		image: "/images/picsum/013.jpg",
		body: "マークアップ・ダミーデータを同じファイルに保持します。呼び出し側では <IntroSection /> を 1 行 import するだけで、セクション丸ごと再利用できます。",
	},
	{
		title: "Portable",
		image: "/images/picsum/010.jpg",
		body: "移植先で CSS 変数が未定義でも、fallback を書いておけば崩れません (例: var(--into, 1.5rem))。本ファイルでは既存プロジェクト前提のため省略しています。",
	},
];

export default function IntroSection() {
	return (
		<section
			data-section="t5-intro"
			className="w-auto max-w-none mx-[calc(50%-50vw)] px-[var(--into)] pb-[var(--MY)] bg-[var(--TC)] text-[var(--WH)] flex flex-wrap items-start"
		>
			<h1 className="flex-1 basis-1/2 sticky top-0 md:min-h-[100lvh] content-center font-[family-name:var(--Eng)] font-medium text-center pt-6 md:pt-0">
				<span className="block text-sm text-[var(--GR)] mb-2 font-[family-name:var(--Eng)]">
					Not Vibe Design
				</span>
				Tailwind Only
				<br />
				Single-File
				<br />
				Section Pattern
			</h1>

			<div className="basis-full md:basis-1/2 md:max-w-[50%] ml-auto text-sm">
				<div className="flex flex-col">
					{items.map((item, i) => (
						<article
							key={i}
							className="flex flex-wrap items-center gap-[var(--gap)] p-[var(--PX)] border-t border-[var(--WH)]/30 last:border-b"
						>
							<figure className="w-[30%] m-0">
								<img
									src={getAssetPath(item.image)}
									alt=""
									className="w-full h-auto block"
								/>
							</figure>
							<div className="flex-1 min-w-0">
								<h3 className="mb-2">
									<span className="block text-xl font-[family-name:var(--Eng)] font-medium">
										{item.title}
									</span>
								</h3>
								<p className="leading-relaxed">{item.body}</p>
							</div>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
