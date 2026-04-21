/**
 * /test5 – CustomClass → Tailwind 置き換え実験ページ。
 *
 * 目的: 既存 Preview ページのような構造を、セクション単位で 1 ファイル完結
 * (Tailwind ユーティリティのみ) に書き直す検証。ページ側では各セクション
 * コンポーネントを 1 行 import するだけで組み上がることを確認する。
 */

import { useRef } from "react";
import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { Footer } from "../components/Footer";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";

import IntroSection from "../components/sections/IntroSection";
import FAQSection from "../components/sections/FAQSection";

function Test5() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
		<PageRoot ref={pageRootRef}>
			<Header className="LinkShadow UpInit" />

			<main className="min-h-screen mt-[var(--head)] pb-[var(--MY)]">
				<section className="px-[var(--PX)] py-[var(--MY)] text-center">
					<p className="text-sm text-[var(--GR)] mb-2 font-[family-name:var(--Eng)]">
						/test5
					</p>
					<h1 className="text-[var(--h1FZ)] font-[family-name:var(--Eng)] font-medium">
						Tailwind-only Section Experiment
					</h1>
					<p className="mt-4 max-w-[60ch] mx-auto text-sm leading-relaxed">
						CustomClass を使わずに Tailwind とルート CSS 変数だけで
						セクションを 1 ファイル完結に書き直した検証。以下 2 つのセクションは
						それぞれ単独ファイルを <code>import</code> するだけで組み込まれている。
					</p>
				</section>

				<IntroSection />
				<FAQSection />
			</main>

			<Footer />
		</PageRoot>
	);
}

export default Test5;
