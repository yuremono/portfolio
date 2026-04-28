import { useState } from "react";
import { QuestionIcon } from "@phosphor-icons/react";
import { FullscreenDialog } from "../../components/FullscreenDialog";

/** 公開向けの簡易マニュアル。ツールバー「一括生成」の直前から全画面モーダルで表示する */
export default function BboxManualDialog() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				title="BBox エディタの概要と操作手順を表示"
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls="bbox-public-manual-dialog"
				className="San inline-flex items-center gapH whitespace-nowrap rounded BorderXY px-2 py-[5px] text-xs text-accent transition-colors hover:border-accent hover:bg-accent/5"
				onClick={() => {
					setOpen(true);
				}}
			>
				<QuestionIcon className="h-4 w-4 shrink-0" aria-hidden />
				<span>使い方</span>
			</button>
			<FullscreenDialog
				id="bbox-public-manual-dialog"
				open={open}
				dialogAriaLabel="BBox エディタの使い方"
				closeAriaLabel="マニュアルを閉じる"
				onOpenChange={setOpen}
			>
				<div className="San wid mx-auto flex flex-col gap pb-[--PY] text-GR [--HTC:--WH]">
					<header className="BorderB pb-[--PY]">
						<p className="text-xs font-medium uppercase text-accent">
							BBox エディタ
						</p>
						<h2 className="mt-3">使い方（簡易）</h2>
						<p className="mt-4 ">
							写真やスクリーンショットを開き、注目したい矩形を親・子の入れ子で囲み、座標やラベルを
							JSON または Markdown として取り出せる画面です。データ取りやメモ用の下書きに向いています。
						</p>
					</header>
					<section
						className="flex flex-col gapH"
						aria-labelledby="bbox-manual-start"
					>
						<h3 id="bbox-manual-start">始め方</h3>
						<ul className="flex list-inside list-disc flex-col gapH ">
							<li>
								<span className="text-TC">画像を載せる</span>
								：ツールバーの「+ 画像を開く」、または中央のキャンバスへ画像ファイルをドラッグ＆ドロップします。
							</li>
							<li>
								<span className="text-TC">親の範囲を決める</span>
								：右の「+ グループ追加」を押したあと、キャンバス上でドラッグして親（大きい枠）を確定します。{" "}
								<span className="text-TC">Esc</span>
								で取りやめられます。
							</li>
						</ul>
					</section>
					<section
						className="flex flex-col gapH"
						aria-labelledby="bbox-manual-toolbar"
					>
						<h3 id="bbox-manual-toolbar">上部ツールバー</h3>
						<ul className="flex list-inside list-disc flex-col gapH ">
							<li>
								<span className="text-TC">W</span>
								：プレビュー幅。書き出しではこの幅を基準に座標が正規化されます。
							</li>
							<li>
								<span className="text-TC">Snap</span>
								：ドラッグや描画をグリッドに揃える間隔です。{" "}
								<span className="text-TC">OFF</span>
								で無効になります。
							</li>
							<li>
								<span className="text-TC">Guide</span>
								：縦方向のガイド本数です。{" "}
								<span className="text-TC">OFF</span>
								で非表示です。
							</li>
							<li>
								<span className="text-TC">Undo / Redo</span>
								：直前の操作を戻したり進めたりします（キーボードショートカットでも同じ）。
							</li>
							<li>
								<span className="text-TC">モード</span>
								（グループを選んだとき）：<span className="text-TC">
									親グループ
								</span>{" "}
								では外枠の移動・リサイズができ、親の内側をドラッグするとそのグループごと動かせます。
								<span className="text-TC">子を追加描画</span>{" "}
								では親の内側にドラッグして子の矩形を追加します。
							</li>
						</ul>
					</section>
					<section
						className="flex flex-col gapH"
						aria-labelledby="bbox-manual-sidebar"
					>
						<h3 id="bbox-manual-sidebar">右のパネル（Groups / Output）</h3>
						<ul className="flex list-inside list-disc flex-col gapH ">
							<li>
								グループ行をクリックするとそのグループがアクティブになります。名前は行をダブルクリックして編集します。
							</li>
							<li>
								<span className="text-TC">子</span>
								の行をクリックすると子の編集モードになり、枠の移動・伸縮や、{" "}
								<span className="text-TC">Shift</span>{" "}
								を押しながらクリックで複数選択ができます。子どうしの順番はドラッグで入れ替えられます。子の名前は行をダブルクリックして編集します。
							</li>
							<li>
								<span className="text-TC">カメラ</span>
								のアイコンは、その親に合わせた範囲で画像と枠線をつなげた PNG を保存します。
							</li>
							<li>
								キャンバスでは、子編集モードで枠を{" "}
								<span className="text-TC">ダブルクリック</span>
								すると、その場でラベルを編集する入力が開きます。
							</li>
							<li>
								<span className="text-TC">吹き出し</span>
								のアイコンから、書き出しに含めたいコメントを親・子ごとに付けられます。
							</li>
							<li>
								<span className="text-TC">Output</span>
								：<span className="text-TC">JSON</span> /{" "}
								<span className="text-TC">Markdown</span>
								を切り替えて内容を確認し、「Copy to Clipboard」でクリップボードへコピーします。
							</li>
						</ul>
					</section>
					<section
						className="flex flex-col gapH"
						aria-labelledby="bbox-manual-keys"
					>
						<h3 id="bbox-manual-keys">主なキー操作</h3>
						<ul className="flex list-inside list-disc flex-col gapH ">
							<li>
								<span className="text-TC">⌘Z</span> /{" "}
								<span className="text-TC">Ctrl+Z</span>
								：元に戻す
							</li>
							<li>
								<span className="text-TC">⇧⌘Z</span> /{" "}
								<span className="text-TC">Ctrl+Shift+Z</span>
								：やり直し
							</li>
							<li>
								<span className="text-TC">Backspace</span>
								：子を編集中に、選択している子矩形を削除
							</li>
							<li>
								<span className="text-TC">Esc</span>
								：描画中の取りやめや、ラベル入力を閉じるほか、親グループへのモード復帰などに使います
							</li>
						</ul>
						<p className="mt-2 text-xs ">
							入力欄にフォーカスがあるときは、一部のショートカットがページ全体には効きません。
						</p>
					</section>
					<section
						className="flex flex-col gapH"
						aria-labelledby="bbox-manual-batch"
					>
						<h3 id="bbox-manual-batch">
							「一括生成（ローカル限定）」について
						</h3>
						<p className="">
							開発者が手元で{" "}
							<code className="rounded BorderXY bg-BK/30 px-2 py-1 text-TC">
								npm run dev
							</code>
							などでサイトを動かしているときだけ使える補助機能です。
							<span className="text-TC">
								インターネットに公開されただけの静的サイトではファイルは保存されません。
							</span>
							一般利用では、右側のコピーや親範囲の PNG 保存をご利用ください。
						</p>
					</section>
				</div>
			</FullscreenDialog>
		</>
	);
}
