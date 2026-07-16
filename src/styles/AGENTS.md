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

- クラスは **PascalCase の CustomClass**
- モディファイアは **PascalCase の `Is*`**。所有者ブロックにのみ付け、子要素に付けない。
単独ではスタイルを書かない。SCSSでは所有者の末尾に `&:where(.IsXxx)`
- 状態は既存の状態クラス（`.show`, `IsStop` 等）のデュアルクラス。単独にスタイルを書かず、
そのコンポーネントのファイル内に書く
- 要素セレクタは foundation/_base.scss に書く
- 置き場所：config=非出力（$変数・mixin）のみ/foundation=`@tailwind base`・`:root`変数・リセット・base/
layout=枠と配置のみ/component=再利用パターン/project=ページ固有とコンポーネントの上書き/
utility=最後
- ブロック内の記述順：ベース → エレメント → モディファイア → 状態
- コンポーネントの上書きは project からの一方通行のみ。component 同士・layout からの上書き禁止
- 同じパターンを2回使ったら構造または機能でクラス名を付け component に昇格させる。セマンティッククラス名は残す
- パーシャル追加時は同ディレクトリの index.scss に `@use` を1行追記。style.scss は触らない。使わなくて`@use "../../config" as *;`で始める。
- 新しいディレクトリ・層を作らない
- Tailwind CSS v3 と併用し、Tailwind のシングルクラスで全カスタムスタイルを上書きできる状態を、
ネイティブ CSS カスケードレイヤー（`@layer`）で保証する（詳細は css-architecture.md）

## ビルド

- ビルドは Vite（`npm run dev` / `npm run build`）。sass の直接コンパイル（watch/build コマンド）は使わない
- エントリは `style.scss` 固定

