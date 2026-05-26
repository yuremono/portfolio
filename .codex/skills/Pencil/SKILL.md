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
- `.pen` は直接 `Read` / `Grep` / JSON編集せず、必ず Pencil MCP の `open_document` / `batch_get` / `batch_design` で読む・編集する。直接編集はファイル上の差分が見えても Pencil 側に反映されないことがある。
- Codex に `mcp__pencil__*` が出ない場合は MCP 未登録の可能性がある。`~/.codex/config.toml` に `[mcp_servers.pencil] command="/Users/yanoseiji/.pencil/mcp/cursor/out/mcp-server-darwin-arm64" args=["-app","cursor"]` を追加し、次セッションで確認する。
- 当該セッションでツールが未注入でも、Pencil アプリと socket が起動済みなら `mcp-server-darwin-arm64 -app cursor` に JSON-RPC で `initialize` → `tools/list` → `tools/call` を送って原因調査できる。
- MCP編集後は `export_nodes` または `get_screenshot` で必ずレンダー確認する。画像生成 `G()` は `pencil:pending-image-*` になることがあるため、少し待って再取得・再エクスポートする。
- `G(nodeId, "stock", "...")` は検索語が具体的すぎると Unsplash 側で失敗し、同じ `batch_design` ブロック全体がロールバックされる。画像配置は1件ずつ、または短い検索語で実行する。

---

## 基本ワークフロー

新しい.penファイルを作成する際は、以下の手順を**基本**とする。

### Step 1: ファイル名の決定
`MMDDHHmm` 形式の 8 桁にする。既存ファイルがあるならそれを起点にする。

### Step 2: 空ファイル作成
必要なら空ファイルを作成する。

### Step 3: pencilでファイルを開く
同じファイルを続けて扱うなら、まず `batch_get` / `batch_design` を `filePath` 付きで使う。`open_document` は、編集対象を切り替える必要があるときだけ使う。

### Step 4: 変数をインポート

必要な変数だけを同期する。既存の変数で足りるなら追加しない。

### Step 5: コンポーネントをインポート

必要なCustomClassコンポーネントだけを定義する。再利用しないものは無理に reusable にしない。

### Step 6: 土台を作る

最初にトップレベルフレームを作る。既存の土台がある場合はそれを起点にする。

### Step 7: 構造を生成する

`batch_design` は小分けにして使う。手で1個ずつ積むより、共通関数、配列、繰り返し処理で構造を組む。

### Step 8: 配置を整える

画面全体に対する最大幅、中央寄せかどうか、セクション間の間隔を先に決める。余計な要素や装飾は足さない。

### Step 9: 仕上げる

作成後は `batch_get` や `snapshot_layout` でまず構造を確認する。`snapshot_layout` で足りるならそこで止め、見た目の確認が必要なときだけ `get_screenshot` か `export_nodes` を使う。必要なら位置とサイズだけ修正する。

---

## レイヤー命名ルール

ワイヤーフレームやレイアウト検討用の `.pen` を作る場合、レイヤー名は内容名ではなく構造名にする。

- 決められた言葉に無理に寄せない。既存語で粒度が合わない場合は、構造を表す新しい名前を使う。
- `Card Layout` は原則使わず、カードの集合には `Card Group` を使う。既存資料との対応で `Card Layout` を使う場合も、同じ幅や同じ役割のカードが2つ以上並ぶ集合レイアウトに限定する。
- カード単体には `Card` を使う。小さな画像付きリンクやカテゴリ項目は `Card` ではなく、`Tile Grid`、`Tile Row`、`Tile` を使う。
- ボタン単体には `Button`、ボタンのまとまりには `Button Group` を使う。
- 小さなリンク単体には `Link`、複数リンクのまとまりには `Link Group` を使う。
- `Card Layout` や `Card Group` を、カード単体、ボタン単体、タグ、ラベル、小さなリンク要素に使わない。
- `Horizontal Content` は原則使わず、横並びの役割が分かる名前へ落とす。例: `Header Bar`、`Section Head`、`News Strip`、`Footer Top`、`Nav Group`、`Utility Group`。
- `Horizontal Content` と `Card Layout` / `Card Group` は、同じ階層で選択する類似カテゴリとして扱う。`Horizontal Content` の中に `Card Layout` / `Card Group` を入れない。
- `Horizontal Content` の中にさらに `Horizontal Content` を入れない。
- リストの1行は `List Item`、見出しとボタンの横並びは `Section Head`、ニュースの細い横帯は `News Strip` とする。
- `Tile Grid` や `Card Group` の中に行分けが必要な場合は、行を `Tile Row` または `Row`、各要素を `Tile` または `Card` とする。

---

## 要素作成の基本

### Step 1: 要素を作成する

フレームサイズはCustomClassクラス、コンポーネントの計算式に従う。
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

## 参考リンク

- [Variables](https://docs.pencil.dev/core-concepts/variables)
- [Components](https://docs.pencil.dev/core-concepts/components)
- [Design to Code](https://docs.pencil.dev/design-and-code/design-to-code)
