import { useState } from "react";
import { QuestionIcon } from "@phosphor-icons/react";
import { DialogBase } from "../../components/DialogBase";

interface BunmyakuManualDialogProps {
	/** マウント時にマニュアルを開いた状態で表示する（セッション初回アクセス時の自動表示用） */
	initialOpen?: boolean;
	className?: string;
}

/** 公開向けの簡易マニュアル。IntakePanel のヘッダー操作列から全画面モーダルで表示する */
export default function BunmyakuManualDialog({
	initialOpen = false,
	className,
}: BunmyakuManualDialogProps) {
	const [open, setOpen] = useState(initialOpen);

	return (
		<>
			<button
				type="button"
				title="文脈の概要と操作手順を表示"
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls="bunmyaku-manual-dialog"
				className={`BabelRightDown inline-flex items-center gap-1 whitespace-nowrap bg-AC px-3 py-2 text-xs font-bold text-WH transition-colors hover:bg-AC/70 ${className ?? ""}`}
				onClick={() => {
					setOpen(true);
				}}
			>
				<QuestionIcon className="h-4 w-4 shrink-0" aria-hidden />
				<span>使い方</span>
			</button>
			<DialogBase
				id="bunmyaku-manual-dialog"
				open={open}
				dialogAriaLabel="文脈の使い方"
				closeAriaLabel="マニュアルを閉じる"
				onOpenChange={setOpen}
			>
				<div className="mx-auto flex max-w-[52rem] flex-col gap pb-[--PY] text-GR">
					<header className="BorderB pb-[--PY]">
						<p className="text-xs font-medium uppercase text-AC">
							Manual
						</p>
						<h1 className="h2FZ mt-3 text-TC">
							文脈 — 構造化ドキュメント生成ツール
						</h1>
						<p className="mt-4">
							チャットで曖昧に要件を説明する代わりに、選択式のUIで目的・制約・文脈を整理しながら
							SPEC.md（要件定義）/ DESIGN.md（デザイン設計）/ AGENTS.md（基本スキーマ）などの
							Markdownプロンプトを組み立てるツールです。
							選択を重ねるだけで一定品質のドキュメントを生成し、AIへの指示文として再利用できます。
							以降の説明はAIによるもので矛盾が含まれる場合があります。
						</p>
					</header>
					<section
						className="flex flex-col gapH"
						aria-labelledby="bunmyaku-manual-start"
					>
						<h3 className="mt-4 text-TC" id="bunmyaku-manual-start">
							始め方
						</h3>
						<ul className="flex list-inside list-disc flex-col gapH">
							<li>
								<span className="text-TC">出力形式を選ぶ</span>
								：中央パネル上部で「要件定義 / デザイン設計 / 基本スキーマ」から作りたいドキュメントの種類を選びます。形式に応じて設問カードが切り替わります。
							</li>
							<li>
								<span className="text-TC">設問カードに答える</span>
								：各設問の選択肢をクリックして回答します。設問によっては自由入力欄を開いて補足テキストを追加できます。
							</li>
							<li>
								<span className="text-TC">結果を確認する</span>
								：回答内容は右の Output パネルに Markdown としてリアルタイムに反映されます。
							</li>
						</ul>
					</section>
					<section
						className="flex flex-col gapH"
						aria-labelledby="bunmyaku-manual-intake"
					>
						<h3 className="text-TC" id="bunmyaku-manual-intake">
							中央パネル（ヒアリング入力）
						</h3>
						<ul className="flex list-inside list-disc flex-col gapH">
							<li>
								設問はセクションごとにグループ化されています。上から順に答えても、必要な設問だけ答えても構いません。
							</li>
							<li>
								<span className="text-TC">未選択を出力</span>
								：未回答の設問も出力に含めるかを切り替えます。あとで埋める前提のたたき台を作るときに便利です。
							</li>
						</ul>
					</section>
					<section
						className="flex flex-col gapH"
						aria-labelledby="bunmyaku-manual-output"
					>
						<h3 className="text-TC" id="bunmyaku-manual-output">
							右パネル（Output）
						</h3>
						<ul className="flex list-inside list-disc flex-col gapH">
							<li>
								生成された Markdown 本文が表示されます。右上の
								<span className="text-TC">拡大アイコン</span>
								から、全画面ダイアログで本文を直接編集できます。
							</li>
							<li>
								<span className="text-TC">Copy Markdown</span>
								：生成結果をクリップボードへコピーします。そのままAIツールのプロンプトに貼り付けられます。
							</li>
							<li>
								<span className="text-TC">Download Markdown</span>
								：生成結果を .md ファイルとして保存します。
							</li>
							<li>
								中央パネルとの境目のハンドルをドラッグすると、Output パネルの幅を調整できます。
							</li>
						</ul>
					</section>
					<section
						className="flex flex-col gapH"
						aria-labelledby="bunmyaku-manual-notes"
					>
						<h3 className="text-TC" id="bunmyaku-manual-notes">
							補足
						</h3>
						<p>
							ホバーで「Implemented someday…」と表示されるボタン（テンプレート、サイドバーの一部ナビゲーション等）は未実装のデモ表示です。
						</p>
					</section>
				</div>
			</DialogBase>
		</>
	);
}
