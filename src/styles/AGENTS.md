# css/scss 基本ルール

- 学習データ由来の一般的な書き方よりユーザーの考え方に寄せる
- 変数はカスタムプロパティ、ブレイクポイントのみ@mixin
- 指示がなければ transitionは var(--duration); 以外禁止
- headingタグは基本的に`base`でまとめて指定
- 余白は基本的に全て変数化する。必然性のない差をつけて量産しない
- 指示がなければ言われたことをそのままコメントに書かない
- padding,marginは-inlineと-blockで指定し、ショートハンドで片方を0にしない
- 全ての色は変数で指定する。指示がなければ近い値で複数作らずに丸める
- em,rem,フォント関連プロパティは1/8刻みの値を使う - 例:0.0125,1.25
- 参照デザインや指示がないかぎりopacityやフォントサイズに0.96倍等、微差をつけない
- 参照デザインや指示がないかぎりline-heightとletter-spacingに微差をつけない
- overflow:clipが無効だとブラウザで確認した時以外overflow:hidden禁止
- `vh`は使わず`svh`または`lvh`に統一

## CSS設計ルール（詳細は [css-architecture.md](css-architecture.md)）

- Tailwind シングルクラスは独自クラスに常に勝つ（`@layer` で保証）
- クラスはPascalCaseのCustomClass、モディファイアはPascalCaseの`Is*`
- `Is*`は所有ブロック末尾の`&:where(.IsXxx)`のみ、単独禁止、子要素に付けない
- 状態クラス（`.show`等）も単独禁止、所有コンポーネントのファイル内に書く
- 要素セレクタはfoundation/_base.scssのみ
- 置き場所：config=非出力/tw-preflight=`@tailwind base`/
foundation=`:root`変数・リセット・base/layout=枠のみ/component=再利用パターン/
project=ページ固有・componentの上書き/utility=最後（この並び＝レイヤー順）
- 上書きは project から component への一方通行のみ。component 同士・layout からの上書き禁止
- ブロック内の記述順：ベース → エレメント → モディファイア → 状態
- 同じパターンを2回使ったら構造または機能でクラス名を作り component へ昇格（セマンティック名は保持）
- パーシャルは冒頭に未使用でも `@use "../../config" as *;`を書く
- 新しいディレクトリ・層を作らない、style.scss は触らない


## ビルド

- ビルドは Vite（`npm run dev` / `npm run build`）。sass の直接コンパイル（watch/build コマンド）は使わない
- エントリは `style.scss` 固定

