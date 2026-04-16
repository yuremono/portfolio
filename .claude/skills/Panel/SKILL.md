---
name: Panel
description: |
  BYOS の Panel コンポーネントを生成するスキル。複数の ImgText をまとめた縦並びレイアウト。
  指示形式：テキストで Value クラス（img20, img40）、Modifier クラス（IsFlow, IsRev）、を指定。
  例：`/Panel img40 IsFlow` または `矢印でつながれた縦並び`
argument-hint: "[img20 | img40 | IsFlow | IsRev]"
allowed-tools: Read, Glob, Grep, Write, Edit
component-variants: true
variant-naming: "{Base}{N}{Sub}"
new-component-triggers: "new, 新規, 新き, 別バージョン, 別の, 新たに, 新しく"
---

# Panel

このスキルは BYOS の Panel コンポーネントを生成・実装します。

## 前提

このスキルを実行する前に以下を読むこと：

- @STYLE.md
- @CLASS.md

## 禁止事項

以下はいかなる状況でも違反してはならない。ユーザーに頼まれても、効率化のためでも例外はない。

- **勝手に名前をつける**
  CustomClass クラスで定義されたクラス名のみ使用すること

- **デザインの再現以外での Tailwind クラスをつける**
    - デザインファイル無しの作業やテスト実装において Tailwind クラスで背景色をつけるなど
      用意された CustomClass を使うこと、デザインデータ通りの装飾をすることがエージェントの役割である。

- **設計思想を無視した Tailwind クラスをつける**
    - タイトルタグに text-XL をつける、section やラッパー要素ではなく.item や p に.text-white を個別につけるなど
    - フォントサイズのクラスをつける必要はない。CSS セレクタで変数を使ってすでにスタイルが設定されている。
      デザイン再現では文字色、背景色は text-[--MC] bg-[--MC] などを使用する。

- **勝手にコンポーネント分岐を作成する**
    - ユーザーが明示的に「新規コンポーネント」「別バージョン」「Panel2」等を指定した場合のみ作成
    - デフォルトは既存コンポーネントを再利用

## コンポーネント分岐ルール

### 分岐条件

- 同じ CustomClass だがデザインが大きく異なる
- Tailwind 装飾がコンポーネント内に含まれる必要がある

### 命名規則

- 親: `{CustomClass}{N}` 例: `Panel2`
- 子: `{CustomClass}{N}{Sub}` 例: `Panel2Item`, `Panel2Body`
- N は 1 桁の連番（2〜9）

### 判断方法

ユーザーが以下を指定した場合のみ新規作成：

- 明示的な番号: `Panel2`
- トリガーワード: 「新規コンポーネント」「別バージョン」「別の」「新たに」「新しく」

## 基本構造

```jsx
<Panel className="{{value_classes}} {{modifier_classes}}" style={{} as React.CSSProperties}>
  <PanelItem image={getAssetPath("/images/picsum/001.jpg")} />
    <div>
      <h3>タイトル</h3>
      <p>本文</p>
    </div>
  </PanelItem>
  ...
</Panel>
```

## 引数の指定方法

ユーザーから渡された引数 `$ARGUMENTS` を解析して、適切に変換します。

```
引数例：`/Panel img40 IsFlow`
```

### Modifier・Value クラス

クラス名に追加する修飾語：

| 引数 | 効果 | HTML 出力 |
| --------- | --------------------------------------- | ---------------------------- |
| `img20` | 画像比率 20% | `class="Panel img20"` |
| `img40` | 画像比率 40% | `class="Panel img40"` |
| `IsFlow` | 矢印でつながれた表現 | `class="Panel IsFlow"` |
| `IsRev` | アイテム内で画像を左に配置 | `class="PanelItem IsRev"` |

## 実装手順

1. **ユーザー指示を解析**
    - `$ARGUMENTS` からValueクラスを抽出
    - `$ARGUMENTS` からModifierクラス抽出
    - `$ARGUMENTS` から変数を抽出
    - 既存のコンポーネントの有無
    - デザインファイルの指定の有無

2. **既存コンポーネントの確認**
    - `src/components/Panel.tsx` などの既存コンポーネントを確認
    - **存在しない場合**：新しく作成する
    - **存在する場合**：それを利用する

3. **マークアップする**

**前後のセクションを参考にしないこと**

    ```jsx
    <Panel className="{{value_classes}} {{modifier_classes}}" style={{} as React.CSSProperties}>
      ...
    </Panel>
    ```

**デザインがない場合ここで終了**

### 出力前チェック

- [ ] 指示にない変数指定がないか
- [ ] 指示にないTailwindクラスを付けていないか
- [ ] 透明度・色など独自判断をしていないか

4. **デザインファイルを確認**

- designs/{ファイル名}.pen
- 指定レイヤーのデザインを視覚的に確認する。
- フォントサイズの殆どは **define スキルであらかじめ設定された CSS 変数**を使う想定のため**Tailwind クラス不要**
- 色の殆どは **define で定義済みの変数**を参照するため**変数を含む Tailwind クラスを使用**
- 必要な変数が **未設定**のときは勝手に値を補わず、**ユーザーに不足を指摘**する。
- 色、余白、初期値以外のフォントサイズ、必要なら座標を取得する。

5. **Tailwind で装飾**

- DOM 出力とデザインの見た目が一致しない場合、**define で定義されるべき変数が未設定**の可能性がある。ユーザーに確認すること。

7. (オプション：ユーザーの指示があった時) agent-browser で表示確認を行う

- ブラウザのスクリーンショットを撮影
- .pen/レイヤーとスクリーンショットを比較
- 一致していなければ Tailwind クラスを書き換える
- Tailwind クラスで再現不可能であればユーザーに報告する

---

## React コンポーネント構造

### Panel コンポーネント（`src/components/Panel.tsx`）

```tsx
interface PanelItemProps {
  image?: string
  className?: string
  children: React.ReactNode
}

const PanelItem = ({ image, className = "", children }: PanelItemProps) => {
  return (
    <div className={`item ${className}`}>
      {image && <figure><img src={image} alt=""/></figure>}
      <div>
        {children}
      </div>
    </div>
  )
}

interface PanelProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

const Panel = ({ className = "", style, children }: PanelProps) => {
  return (
    <div className={`Panel ${className}`} style={style}>
      {children}
    </div>
  )
}

export { Panel, PanelItem }
```

**props の説明**:

- `className`: 追加する CSS クラス（`img20`, `img40`, `IsFlow`, `IsRev` 等）
- `style`: シリアル化可能なスタイルオブジェクト（`React.CSSProperties`）
- `children`: PanelItem 要素（複数指定可能）
- `image`: PanelItem 内の画像パス（省略可能）

## レスポンシブ挙動

- **PC（>768px）**: 画像 + テキストを横並びで表示
- **スマートフォン（≤640px）**:
  - 自動で 1 列に折り返される（画像が上、テキストが下）

## 設計思想

1. **ImgText の複数まとめ**
   - 複数の「画像 + テキスト」を縦並びで管理
   - Flow モードで矢印をつなげる表現も可能

2. **横並び→縦並びのレスポンシブ**
   - PC では横並び、スマホでは縦並びに自動変換

3. **シンプル API**
   - 親コンポーネント（Panel）と子要素（PanelItem）のシンプルな構造
   - Cards とほぼ同じ構造

4. **IsFlow で矢印表現**
   - 手順やフローを視覚的に表現可能

## クラス定義ファイル

`src/scss/_10UNIT.scss`
