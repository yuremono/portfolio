# src/pages AGENTS.md

<EXTREMELY-IMPORTANT>
/TWonly 由来の独立エントリ向けルール。
 `カスタムクラス`を使う=STYLE.mdを読んでいる場合は本ファイルを読んではならない。
</EXTREMELY-IMPORTANT>
<EXTREMELY-IMPORTANT>
変数定義でもcolor-mix使用禁止 透明度`/nn`を使用。
0.125,0.25,0.375,0.5,0.625,0.75,0.875以外の小数点第2位の数値指定禁止
あらかじめ定義された変数を使う。セクションやページ固有変数の作成は禁止。`--heroH:calc(100lvh - var(--head))`などどうしても必要な変数のみ許可する。ユーザーの言及がない時に１セクションで３つ以上必要だと考えたのなら構造が間違っている。ユーザーに相談しなければいけない。
</EXTREMELY-IMPORTANT>

## 基本変数

以下を参考にhtmlまたはmainタグで[変数定義]を行うこと。

### レイアウト変数

| 変数名 | 単位の例 | 説明 | 使用シーン |
|--------|------------|------|-----------|
| `--wid` | `px,%` | 基本コンテンツmax-width | 
| `--MY` | `rem,lvh` | セクション間の縦余白,大きい縦余白 | 
| `--PX` | `rem,%` | 全てのコンテンツの基本横余白、小さい縦横余白 |  
| `--PY` | `rem` | 小さい縦余白(--PXのみ指定して省略可) |  
| `--gap` | `rem,%` | flex,grid の基本ギャップ,小さい余白のバリエーション | 
| `--imgW` | `%` | 同じ画像サイズをつかう場合 |
| `--itemW` | 計算値 | 同じアイテムサイズをつかう場合|

### 派生変数

| 変数名 | 計算式 | 説明 |
|--------|--------|------|
| `--PX2` | `calc(var(--PX) * 2)` | PX の 2 倍 |
| `--gapN` | `calc(var(--gap)*-1)` | ギャップの負の値（ネガティブマージン用） |
| `--gapH` | `calc(var(--gap)/2)` | ギャップの半分 |

### タイポグラフィ変数 

--H1, --H2, --H3, --FZ, --FW, --LH, --LS, --FF, --HFF

### 色変数

| 変数名 | 説明 |
|--------|------|
| `--MC` | メインカラー |
| `--SC` | セカンダリーカラー |
| `--AC` |  アクセントカラー |
| `--BC` |  ベースカラー |
| `--TC` |  テキストカラー |
| `--GR` | グレー |
| `--BK` | ブラック |
| `--WH` | ホワイト |

合わせてスタンダードな下記名称のみを使用する。
--primary,--secondary,--accent,--foreground,--muted, --background,--border

## Tailwind-only の前提

- arbitraryの書き方: `bg-MC`, `text-AC`, `border-primary`, `bg-background` などを使える。
- 透明度指定: `MC/50` などの `/NN` は `tailwind.config.js` の `cssVarColor()` により透明度付きカラーが有効。
- 独自 arbitrary utility: `text-shadow-[--TS]`, `drop-shadow-[--DS]`, `box-shadow-[--BS]`, `text-stroke-[...]` を使用できる。
- アセットパス方針: ページ内の静的アセット参照は `getAssetPath()`、またはそのページローカルの `asset()` ラッパーに統一する。`/images/...` の直書きと混在させない。

## 値の書き方

### 色
-  色を hex / rgb / rgba / hsl で新規に書かない。
-  `bg-MC`, `text-AC`, `border-primary` など tailwind.config 拡張を優先。
- arbitrary `[--MC]` は `/50` 等の透明度指定やグラデーション中間色に限る。
-  `color-mix()` / `oklch()` を JS 定数 (`const line = "...")` にしない。

### 数値・関数
-  `clamp()` / `calc()` は arbitrary に直書きせず、`main` / `html` に `[--name:...]` で宣言して参照。微妙に違う似た値を量産しない。
-  テキストサイズは `--FZ` / `--h1` / `--h2` / `--h3` の 4 種を基本とする。極大文字のみ arbitrary `text-[...]` を許可。
-  ページ内で使うフォントファミリは通常 2 種、多くても 3 種まで。
-  余白は横 = `--PX` / `--gap`、縦 = `--MY` / `--PY` の 4 種に収める。
-  `text-[0.72rem]` `tracking-[0.34em]` のような Tailwind 標準に近い arbitrary は使わない。
- `rounded-[...]` / `aspect-[...]` は 3 段階以内のスケールを使用。

### 影・装飾
- `shadow-[...]` `drop-shadow-[...]` は `--TS,--DS,--BS` 等の変数で定義して再利用。
- background/mask gradient は `--BGgrad` を基底とし、方向または色だけを変えた派生を **ページ内で合計 3 パターンまで** 許容。
- border は `--line` を基底とし、色・太さ・方向の組み合わせ派生を **ページ内で合計 3 パターンまで** 許容。

## 依存の取り回し
-  外部スタイルシートとフォントを `useEffect` で動的注入しない。HTML `<head>` か `@import` / `@font-face`。
-  フォントファミリを JS の `CSSProperties` 定数で保持しない。
-  スタイルトークン（色・影・グラデーション・フォントファミリ・サイズ値）を JS 側の定数・`CSSProperties` オブジェクトで保持しない。CSS 変数として宣言し Tailwind arbitrary で参照する。

## コード構造
-  レスポンシブ理由で同じブロックを二重レンダリングしない（DRY）。
-  装飾 SVG / マーク系: サイズは変数で統一する。微調整はユーザーの指示を待つ
-  兄弟要素の位置・サイズを個別指定する場合、データ配列 `{ id, left, top, width, content }[]` にしてループ描画。
- max-w-[1774px] / max-w-[1800px] / max-w-[1640px] のような根拠不明な最大幅を増やさない。`--wid` または既存スケールへ。

## コメント
- 以下には簡単な日本語コメントを残す:
  - モジュールトップレベルの宣言
  - ファイル冒頭の定数ブロック
  - `PageRoot` 内の各 `<section>` とその中のまとまった意味を持つグループ