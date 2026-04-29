---
name: FlexR
description:  BYOS の FlexR コンポーネントを生成するスキル。2 種類のコンテンツを比率で配置する必要がある時に使用。
  指示形式：テキストでクラス名（Flex55, Flex46, Flex64, Flex37, Flex73, Flex28, Flex82 等）指定。
  例：`Flex46` または `4 対 6 に分割`
argument-hint: "[Flex55 | Flex46 | Flex64 | Flex37 | Flex73 | Flex28 | Flex82]"
allowed-tools: Read, Glob, Grep, Write, Edit
component-variants: true
variant-naming: "{Base}{N}{Sub}"
new-component-triggers: "new, 新規, 新き, 別バージョン, 別の, 新たに, 新しく"
---

# FlexR

このスキルは BYOS の FlexR コンポーネントを生成・実装します。

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
    - ユーザーが明示的に「新規コンポーネント」「別バージョン」「FlexR2」等を指定した場合のみ作成
    - デフォルトは既存コンポーネントを再利用

## コンポーネント分岐ルール

### 分岐条件

- 同じ CustomClass だがデザインが大きく異なる
- Tailwind 装飾がコンポーネント内に含まれる必要がある

### 命名規則

- 親: `{CustomClass}{N}` 例: `FlexR2`
- 子: `{CustomClass}{N}{Sub}` 例: `FlexR2Image`, `FlexR2Body`
- N は 1 桁の連番（2〜9）

### 判断方法

ユーザーが以下を指定した場合のみ新規作成：

- 明示的な番号: `FlexR2`
- トリガーワード: 「新規コンポーネント」「別バージョン」「別の」「新たに」「新しく」

## 基本構造

```jsx
<FlexR className="{{ratio_class}}" style={{} as React.CSSProperties}>
  <FlexRImage image={getAssetPath("/images/picsum/001.jpg")} />
  <div>
    <h3>タイトル</h3>
    <p>本文</p>
  </div>
</FlexR>
```

## 引数の指定方法

ユーザーから渡された引数 `$ARGUMENTS` を解析して、適切に変換します。

```
引数例：`Flex46`
```

### Modifier・Value クラス

クラス名に追加する修飾語：

| 引数 | 効果 | HTML 出力 |
| -------- | ----------- | ----------- |
| `Flex55` | 50%:50% 等分 | `class="FlexR Flex55"` |
| `Flex46` | 40%:60% 画像 4 割、本文 6 割 | `class="FlexR Flex46"` |
| `Flex64` | 60%:40% 画像 6 割、本文 4 割 | `class="FlexR Flex64"` |
| `Flex37` | 30%:70% 画像 3 割、本文 7 割 | `class="FlexR Flex37"` |
| `Flex73` | 70%:30% 画像 7 割、本文 3 割 | `class="FlexR Flex73"` |
| `Flex28` | 20%:80% 画像 2 割、本文 8 割 | `class="FlexR Flex28"` |
| `Flex82` | 80%:20% 画像 8 割、本文 2 割 | `class="FlexR Flex82"` |

### FlexRImage props

| props | 説明 |
|-------|------|
| `image` | 画像のパス（省略可能） |

## 実装手順

1. **ユーザー指示を解析**
    - `$ARGUMENTS` からValueクラスを抽出
    - `$ARGUMENTS` からModifierクラス抽出
    - `$ARGUMENTS` から変数を抽出
    - 既存のコンポーネントの有無
    - デザインファイルの指定の有無

2. **既存コンポーネントの確認**
    - `src/components/FlexR.tsx` などの既存コンポーネントを確認
    - **存在しない場合**：新しく作成する
    - **存在する場合**：それを利用する

3. **マークアップする**

**前後のセクションを参考にしないこと**

    ```jsx
    <FlexR className="{{ratio_class}}" style={{} as React.CSSProperties}>
      <FlexRImage image="/images/path.png" />
      <div>
        <h3>タイトル</h3>
        <p>本文</p>
      </div>
    </FlexR>
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

### FlexR コンポーネント（`src/components/FlexR.tsx`）

```tsx
interface FlexRProps {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

const FlexR = ({ className = "", style, children }: FlexRProps) => {
  return (
    <div className={`FlexR ${className}`} style={style}>
      {children}
    </div>
  )
}

interface FlexRImageProps {
  image?: string
  className?: string
}

const FlexRImage = ({ image, className = "" }: FlexRImageProps) => {
  return (
    <figure className={className}>
      {image && <img src={image} alt=""/>}
    </figure>
  )
}

export { FlexR, FlexRImage }
```

**props の説明**:

- `FlexR`:
  - `className`: 比率クラス（Flex55, Flex46, Flex64 等）
  - `style`: シリアル化可能なスタイルオブジェクト（`React.CSSProperties`）
  - `children`: 2 要素（FlexRImage と div の順序）
- `FlexRImage`:
  - `image`: 画像のパス
  - `className`: 追加する CSS クラス（省略可能）

## レスポンシブ挙動

- **PC（>768px）**: 指定の比率で 2 分割表示
- **スマートフォン（≤640px）**:
  - 自動で 1 列に折り返される（figure が上、div が下）

## 設計思想

1. **2 種類コンテンツの比率制御**
   - figure（画像）と div（テキスト）の比率をクラス名で指定
   - Flex46 = 画像 4 割、本文 6 割

2. **すべて round された見た目**
   - 実際には--gap を大きい要素から差し引く
   - Flex55 は等分

3. **細かい調整は--few で上書き**
   - 25% など細かい調整は近いクラスを選び--few を上書き可能

4. **シンプル API**
   - クラス名で比率を指定するだけ

## クラス定義ファイル

`src/scss/_10UNIT.scss`
