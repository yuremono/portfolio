---
name: Pencil
description: |
  pencil MCPツールを使用して.penデザインファイルを作成するスキル。
  ユーザーが「新しいデザインファイルを作成」「pencilでデザイン」「.penファイルを作成」等の指示をした時に使用。
  CustomClassコンポーネント（Panel, ImgText, Cards, Hero等）のデザインを作成する際にも使用する。
argument-hint: "[デザインの説明やCustomClass名]"
allowed-tools: Bash, Glob, Grep, Read, Write, Edit, mcp__pencil__*
---

# pencil MCPツール デザイン作成ワークフロー

## 概要

pencil MCPツールを使用して、.penファイルを作成するためのワークフロー。

---

## 注意事項（必読）

**`/src/scss/_01variables.scss`の変数`--{variables} ` = pencil variables `${variables} ` である**

- **IDはCustomClass名と同じ**: ImgText, Cards, Toggle 等
- **コンポーネントはファイル間参照不可**: 使用している.penファイルがあればコピーする
- `open_document("new")` はファイルを作成しない。先に `touch designs/{TIMESTAMP}.pen` で空ファイルを作成する
- `layout: "horizontal"` または `"vertical"` の場合、子要素の x/y は無視される。絶対位置指定する場合は `layout: "none"` を設定
- 無効なプロパティ名: textColor, strokeColor, strokeThickness, flex → 有効: fill（色）, stroke（枠線）, fill_container（サイズ）
- テキストに fill を指定しないと黒色/透明になる。`fill: "$TC"` または `fill: "$BK"` で色を指定
- `fontFamily` は文字列または変数で指定。`"Noto Sans JP"` または `"$FF"`。警告が出る場合は直接指定
- サイズ指定は `width: "fill_container"` または `"fit_content"`。`flex: 1` は不可
- 親が flexbox（horizontal/vertical）の子に x/y を指定しても無視される。`layout: "none"` の場合のみ有効
- `stroke` はオブジェクト形式必須: `stroke: {align: "inside", fill: "$TC", thickness: {bottom: 1}}`
- 同じ batch_design 内で作成したコンポーネントを ref で即座に参照できない。定義とインスタンス作成は別の batch_design に分ける
- 再利用予定がないなら `reusable: true` にせず、直接キャンバスに要素を作成する
- テキストノードに padding は使えない。親フレームで管理: `Body=I(Card, {padding:16, layout:"vertical"}); Title=I(Body, {type:"text"})`
- `layout: "horizontal"` または `"vertical"` では gap を設定しないと子要素がくっつく。`"$gap"` を追加
- `layout: "horizontal"` または `"vertical"` の子にのみ `fill_container` が有効。`layout: "none"` の場合は明示的な数値（width: 1080）を指定
- Gridレイヤー構造（Hero等）は `layout: "none"` で作成し、子要素を同じx,yに配置すると重なる（CSS Grid の grid-area: 1/1 相当）
- 画像プレースホルダーには `G(nodeId, "stock", "nature landscape")` で画像を配置。色だけで済ませない
- テキストがはみ出る場合は `\n` で改行を入れる
- `Toggle` QとAのテキストは枠に対して中央揃え: `{layout:"vertical", alignItems:"center", justifyContent:"center"}`
- `Toggle` horizontalレイアウトで縦中央揃え: `{layout:"horizontal", "$gap", alignItems:"center"}`
- `fill_container` が効かない（0になる）場合は明示的な数値を指定: `"$wid", height:400`
- 親フレームに padding を設定してテキストがはみ出ないようにする: `{padding: "$PX", layout:"vertical"}`

---

## 基本ワークフロー（初回のみ、２回目以降は### step6へ）

新しい.penファイルを作成する際は、以下の手順を**必ず**実行する。

### Step 1: ファイル名の決定
```bash
# 現在時刻を取得（HHMM形式）
date +"%H%M"
# → {TIMESTAMP}
```

### Step 2: 空ファイル作成
```bash
touch designs/{TIMESTAMP}.pen
```

### Step 3: pencilでファイルを開く

```
open_document("designs/{TIMESTAMP}.pen")
```

### Step 4: 変数をインポート

`src/scss/_01variables.scss` の変数を**全て**同期する。

```例
set_variables({
  mc: { type: "color", value: "#2db542" },
  sc: { type: "color", value: "#3194c9" },
  ac: { type: "color", value: "#512db5" },
  ...
})
```

### Step 5: コンポーネントをインポート

必要なCustomClassコンポーネントを定義する。詳細は「Components（コンポーネント）運用」を参照。

### Step 6: キャンバス作成

キャンバスサイズの幅は**1920px固定**とする。

```javascript
batch_design:
  canvas = I(document, {
    type: "frame",
    name: "{TIMESTAMP}",
    width: 1920,
    height: 3000,
    fill: "$background",
    layout: "none"
  })
```

---

## 要素作成・ 基本ワークフロー（２回目以降）

### Step 6 要素を作成する

フレームサイズはCustomClassクラス、コンポーネントの計算式に従う
指定がない限り全てのプロパティは変数で指定する。

---

## プレースホルダー一覧

### 基本プレースホルダー

| プレースホルダー | 説明 | 例 |
|-----------------|------|-----|
| `{TIMESTAMP}` | 4桁の時刻（HHMM） | 1520 |
| `{CANVAS_COLOR}` | キャンバス背景色 | $background |
| `{ELEMENT_TYPE}` | 要素タイプ | rectangle, ellipse, text, frame |
| `{ELEMENT_NAME}` | 要素名 | Yellow Rectangle |
| `{X_POSITION}` | X座標 | 360 |
| `{Y_POSITION}` | Y座標 | 120 |
| `{WIDTH}` | 幅 | 1200 |
| `{HEIGHT}` | 高さ | 600 |
| `{ELEMENT_COLOR}` | 要素の色 | $SC|

### テキスト関連プレースホルダー

| プレースホルダー | 説明 | 例 |
|-----------------|------|-----|
| `{TEXT_CONTENT}` | テキスト内容 | "Hello World" |
| `{FONT_FAMILY}` | フォントファミリー | "$FF" |
| `{FONT_SIZE}` | フォントサイズ |"$FZ" |
| `{FONT_WEIGHT}` | フォントウェイト | "$FW" |
| `{TEXT_ALIGN}` | テキスト揃え | "left", "center", "right" |
| `{LINE_HEIGHT}` | 行の高さ（比率） | "$LH" |
| `{LETTER_SPACING}` | 文字間隔 | "$LS" |

### レイアウト関連プレースホルダー

| プレースホルダー | 説明 | 例 |
|-----------------|------|-----|
| `{LAYOUT}` | レイアウトタイプ | "none", "horizontal", "vertical" |
| `{GAP}` | 要素間の間隔 |"$gap"|
| `{PADDING}` | 内側の余白 | "$PX"|
| `{JUSTIFY_CONTENT}` | 主軸揃え | "start", "center", "end", "space_between" |
| `{ALIGN_ITEMS}` | 交差軸揃え | "start", "center", "end" |

### スタイル関連プレースホルダー

| プレースホルダー | 説明 | 例 |
|-----------------|------|-----|
| `{STROKE_COLOR}` | ボーダー色 | $TC |
| `{STROKE_WIDTH}` | ボーダー太さ | 1, 2, 4 |
| `{CORNER_RADIUS}` | 角丸 | "#rad" |
| `{OPACITY}` | 不透明度 | 0.5, 1.0 |
| `{ROTATION}` | 回転角度 | 0, 45, 90 |

### コンポーネント関連プレースホルダー

| プレースホルダー | 説明 | 例 |
|-----------------|------|-----|
| `{REF_ID}` | 参照するコンポーネントID（CustomClass名と同じ） | "ImgText", "Cards", "Hero" |
| `{REUSABLE}` | 再利用可能フラグ | true, false |

---

## 作成後の確認・修正ワークフロー

### 作成完了後のセルフチェック

1. **スクリーンショット撮影**: `get_screenshot(nodeId)` で全体を確認
2. **問題点の特定**: 以下を確認
   - テキストがはみ出ていないか
   - 画像プレースホルダーに画像が入っているか
   - 中央揃えが必要な要素が正しく揃っているか
   - 要素が表示されていない（サイズ0になっていない）か
3. **修正**: 問題があれば `batch_design` で修正
4. **注意事項の追記**: 新たな失敗パターンがあれば「注意事項」に追記

### ユーザーレビュー対応

ユーザーから指摘があった場合：

1. **指摘内容を理解**: 何が問題か整理
2. **修正**: `batch_design` で該当箇所を修正
3. **注意事項の追記**: 同じ失敗を防ぐため「注意事項」に追記
4. **スクリーンショットで確認**: 修正後再度確認

---

## Variables（変数）運用

### 概要

pencilのVariablesはCSS変数やデザイントークンのようなもの。一箇所で定義して全体で使用可能。

### 使用方法

```javascript
// 変数参照（$プレフィックス）
fill: "$MC"
fill: "$SC"
fontFamily: "$FF"
```

### ツール

- `get_variables()` - 現在の変数定義を取得
- `set_variables()` - 変数を追加・更新

---

## Components（コンポーネント）運用

### 概要

pencilのReusable ComponentsはFigmaやReactのコンポーネントに似た再利用可能な要素。

### BYOS CustomClassコンポーネントとの連携

BYOSのCustomClass名をそのままpencilコンポーネントIDとして使用する。

```
BYOS CustomClass    pencil Component ID
───────────  ───────────────────
ImgText  →   ImgText（Reusable）
Cards    →   Cards（Reusable）
Toggle   →   Toggle（Reusable）
Hero     →   Hero（Reusable）
FlexR    →   FlexR（Reusable）
Panel    →   Panel（Reusable）
```

### 使用方法

```javascript
// コンポーネント定義（reusable: true）
ImgText = I(document, {
  type: "frame",
  id: "ImgText",
  name: "ImgText",
  reusable: true,
  // ...
})

// コンポーネント使用（refで参照）
instance = I(canvas, {
  type: "ref",
  ref: "ImgText",
  // オーバーライド可能
})
```

---

## 実装例（1520）

> 以下は実際に作成した例です。

### 実行コマンド

```bash
# 1. 現在時刻取得
date +"%H%M"
# → 1520

# 2. 空ファイル作成
touch designs/1520.pen
```

```
# 3. pencilでファイルを開く
open_document("designs/1520.pen")

# 4. 変数をインポート
set_variables({ MC: {...}, sc: {...}, ... })

# 5. キャンバス作成
batch_design:
  canvas = I(document, {type:"frame", name:"1520", width:1920, height:3000, fill:"$BC", layout:"none"})
  rect = I(canvas, {type:"rectangle", name:"Yellow Rectangle", x:360, y:120, width:1200, height:600, fill:"$SC"})
```

---

## 参考リンク

- [Variables](https://docs.pencil.dev/core-concepts/variables)
- [Components](https://docs.pencil.dev/core-concepts/components)
- [Design to Code](https://docs.pencil.dev/design-and-code/design-to-code)
