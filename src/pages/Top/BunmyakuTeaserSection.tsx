import { CaretRightIcon } from "@phosphor-icons/react";
import { useSectionCanvas } from "./useSectionCanvas";

interface BunmyakuTeaserSectionProps {
	className?: string;
}

export function BunmyakuTeaserSection({
	className,
}: BunmyakuTeaserSectionProps) {
	const { rootRef, canvasRef } = useSectionCanvas({
		text: "文",
		fontSize: 940,
		detailed: true,
		fillOpacity: 1,
	});

	return (
		<section
			ref={rootRef}
			data-l="BunmyakuTeaser"
			className={`[--Eng:--Ship] [--HFF:--Ship] ${className}`}
		>
			<div className="relative min-h-[112.5vw] [grid-area:1/1] max-w-[1620px] w-full mx-auto">
				<div className="sticky h-100lvh top-0 xl:top-[-30%]  grid  place-items-center ">
					<canvas
						ref={canvasRef}
						className="block  w-full aspect-square"
						aria-hidden
					/>
				</div>
			</div>
			<div className="WTS [--WTS:var(--tsw)_var(--BC50)] relative z-10  PX [grid-area:1/1]  max-w-[48em] mx-auto">
				<div className="[--LS:0.1em]    py-[50lvh] ">
					<h2 className=" h2FZ HFF BarAF JsRight">## 文脈.app</h2>
					<p className="BudouxScroll mx-auto my-[3rem] md:text-xl">
						### SPEC.md, DESIGN.md, AGENTS.md をGUIで作成するツール
						<br />
						<br />
						DESIGN.mdは`Stitch`発祥のフロントエンドの要件定義書と認識しています。公開サイトのURLから作成するツールが多く出回っており、一定の効率化につながりますが、Sticthの公式テンプレートの情報量でも不十分であり、結局テンプレート出力になります。
						<br />
						<br />
						一方ClaudeDesignでは最先端モデルが詳細を問いかけ、モダンなテンプレート出力を得られるというものでした。
						<br />
						<br />
                                                このツールはClaudeDesignのヒアリングUXを参考に、場所やモデル性能に依存せずに仕様書を作成、GUIで認知コストを下げることを試したMVPです。実際には仕様書の詳細さを担保するための、質問を用意すること自体を、ChatGPT5.5に任せることができず、相当の時間がかかることがわかりました。
						<br />
						<br />
						AGENTS.md(CLAUDE.md)では文章量を少なくすることが推奨されており、定型的なデータを使う場合が多いので最低水準が低いように思いますが、頻繁に更新するものではありません。AIツールを使い始める人のため、またはプロンプト保存、SKILL保管庫の機能を統合することでチーム内ツールとして活用できる可能性はあると考えます。
						<br />
						またcodex
						app-serverなどでGUI上から文書をプロンプトとしてあらためてmdファイルの作成をリクエストするというアプローチも検討できます。
					</p>
					<div className="JsLeft">
						<a
							href="/bunmyaku"
							className="mt-6 BarBF md:text-xl hover:text-AC "
						>
							Bunmyaku
							<CaretRightIcon className=" align-middle ml-0" />
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
