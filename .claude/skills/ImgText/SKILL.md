---
name: ImgText
description: |
  BYOS の ImgText コンポーネントを生成するスキル。画像とテキストの横並びレイアウトが必要な時に使用。
  指示形式：テキストでモディファイアクラス（IsRev など）と Value クラス（img30, img40 など）、を指定。
  例：`/ImgText img30 IsRev` または `画像 30% 反転`
argument-hint: "[img30 | img40 | img60 | IsRev]"
allowed-tools: Read, Glob, Grep, Write, Edit
component-variants: true
variant-naming: "{Base}{N}{Sub}"
new-component-triggers: "new, 新規, 新き, 別バージョン, 別の, 新たに, 新しく"
---

# ImgText

このスキルは BYOS の ImgText コンポーネントを生成・実装します。

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
    - ユーザーが明示的に「新規コンポーネント」「別バージョン」「ImgText2」等を指定した場合のみ作成
    - デフォルトは既存コンポーネントを再利用

## コンポーネント分岐ルール

### 分岐条件

- 同じ CustomClass だがデザインが大きく異なる
- Tailwind 装飾がコンポーネント内に含まれる必要がある

### 命名規則

- 親: `{CustomClass}{N}` 例: `ImgText2`
- 子: `{CustomClass}{N}{Sub}` 例: `ImgText2Figure`, `ImgText2Body`
- N は 1 桁の連番（2〜9）

### 判断方法

ユーザーが以下を指定した場合のみ新規作成：

- 明示的な番号: `ImgText2`
- トリガーワード: 「新規コンポーネント」「別バージョン」「別の」「新たに」「新しく」

## 基本構造

```jsx
<ImgText className="img30" image={getAssetPath("/images/picsum/011.jpg")}>
        <h3 className="font-bold mb-2">ImgText 基本使い方</h3>
        <p>
                画像とテキストを横並びで配置。
                <br />
                ImgText クラスでレイアウトを制御。
        </p>
</ImgText>
```

## 引数の指定方法

ユーザーから渡された引数 `$ARGUMENTS` を解析して、適切に変換します。

```
引数例：`/ImgText img30 IsRev`
```

### Modifier・Value クラス

クラス名に追加する修飾語：

| 引数 | 効果 | HTML 出力 |
| --------- | --------------------------------------- | ---------------------------- |
| `img60` | 画像幅 60% | `class="ImgText img60"` |
| `img40` | 画像幅 40% | `class="ImgText img40"` |
| `img30` | 画像幅 30% | `class="ImgText img30"` |
| `img20` | 画像幅 20% | `class="ImgText img20"` |
| `IsRev` | 画像を右側に配置 | `class="ImgText IsRev"` |

## 実装手順

1. **ユーザー指示を解析**
    - `$ARGUMENTS` からValueクラスを抽出
    - `$ARGUMENTS` からModifierクラス抽出
    - `$ARGUMENTS` から変数を抽出
    - 既存のコンポーネントの有無
    - デザインファイルの指定の有無

2. **既存コンポーネントの確認**
    - `src/components/ImgText.tsx` などの既存コンポーネントを確認
    - **存在しない場合**：新しく作成する
    - **存在する場合**：それを利用する

3. **マークアップする**

**前後のセクションを参考にしないこと**

    ```jsx
    <ImgText className="{{value_classes}} {{modifier_classes}}" style={{} as React.CSSProperties}>
      ...
    </ImgText>
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

### ImgText コンポーネント（`src/components/ImgText.tsx`）

```tsx
interface ImgTextProps {
  image?: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

const ImgText = ({ image, className = "", style, children }: ImgTextProps) => {
  return (
    <div className={`ImgText ${className}`} style={style}>
        {image && <figure><img src={image} alt=""/></figure>}
        <div className="">
        {children}
        </div>
    </div>
  )
}

export { ImgText }
```

**props の説明**:

- `image`: 画像のパス（省略可能）
- `className`: 追加する CSS クラス（`img30`, `img40`, `IsRev` 等）
  - `img20`（画像 20%）, `img30`（画像 30%）, `img40`（画像 40%）, `img60`（画像 60%）
  - `IsRev`：画像を右側に配置（反転）
- `style`: シリアル化可能なスタイルオブジェクト（`React.CSSProperties`）
- `children`: テキストコンテンツ（`h3`, `p` 等）

## レスポンシブ挙動

- **PC（>768px）**: 指定の画像比率で横並び
- **スマートフォン（≤640px）**:
  - 自動で 1 列に折り返される
  - `.IsRev` の場合もスマホでは通常順序に戻る（flex-direction を解除）

## 設計思想

1. **画像とテキストの横並び専用**
   - 単一の画像 + テキストペアを表現する
   - 複数組み合わせたい場合は `Panel` コンポーネントを使用

2. **画像比率を固定**
   - `--imgW` 変数で画像の幅を制御
   - テキスト側は自動的に残りの幅を確保

3. **IsRev で順序を反転**
   - スマホでは自動的に通常の順序に戻る
   - レスポンシブ対応済み

4. **シンプル API**
   - 画像とテキストを一つのコンポーネントで完結
   - `Item` サブコンポーネントは不要

## クラス定義ファイル

`src/scss/_10UNIT.scss`
