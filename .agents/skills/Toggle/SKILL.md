---
name: Toggle
description: |
  BYOS の Toggle コンポーネントを生成するスキル。。
  指示形式：テキストで Modifier クラス（IsQa）とスタイル属性を指定。
  例：`/Toggle IsQa` または `Q&A 形式のアコーディオン`
argument-hint: "[IsQa]"
allowed-tools: Read, Glob, Grep, Write, Edit
component-variants: true
variant-naming: "{Base}{N}{Sub}"
new-component-triggers: "new, 新規, 新き, 別バージョン, 別の, 新たに, 新しく"
---

# Toggle

このスキルは BYOS の Toggle コンポーネントを生成・実装します。

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
    - ユーザーが明示的に「新規コンポーネント」「別バージョン」「Toggle2」等を指定した場合のみ作成
    - デフォルトは既存コンポーネントを再利用

## コンポーネント分岐ルール

### 分岐条件

- 同じ CustomClass だがデザインが大きく異なる
- Tailwind 装飾がコンポーネント内に含まれる必要がある

### 命名規則

- 親: `{CustomClass}{N}` 例: `Toggle2`
- 子: `{CustomClass}{N}{Sub}` 例: `Toggle2Summary`, `Toggle2Body`
- N は 1 桁の連番（2〜9）

### 判断方法

ユーザーが以下を指定した場合のみ新規作成：

- 明示的な番号: `Toggle2`
- トリガーワード: 「新規コンポーネント」「別バージョン」「別の」「新たに」「新しく」

## 基本構造

```jsx
<Toggle className="{{modifier_classes}}" style={{} as React.CSSProperties}>
  <ToggleSummary>見出し</ToggleSummary>
  <ToggleBody>
    <p>本文コンテンツ</p>
  </ToggleBody>
</Toggle>
```

## 引数の指定方法

ユーザーから渡された引数 `$ARGUMENTS` を解析して、適切に変換します。

```
引数例：`/Toggle IsQa`
```

### Modifier・Value クラス

クラス名に追加する修飾語：

| 引数 | 効果 | HTML 出力 |
| --------- | --------------------------------------- | ---------------------------- |
| `IsQa` | Q&A の装飾付与 | `class="Toggle IsQa"` |

### ToggleSummary / ToggleBody props

| props | 説明 |
|-------|------|
| `children` | コンテンツ |

## 実装手順

1. **ユーザー指示を解析**
    - `$ARGUMENTS` からValueクラスを抽出
    - `$ARGUMENTS` からModifierクラス抽出
    - `$ARGUMENTS` から変数を抽出
    - 既存のコンポーネントの有無
    - デザインファイルの指定の有無

2. **既存コンポーネントの確認**
    - `src/components/Toggle.tsx` などの既存コンポーネントを確認
    - **存在しない場合**：新しく作成する
    - **存在する場合**：それを利用する

3. **マークアップする**

**前後のセクションを参考にしないこと**

    ```jsx
    <Toggle className="{{modifier_classes}}" style={{} as React.CSSProperties}>
      <ToggleSummary>見出し</ToggleSummary>
      <ToggleBody>
        <p>本文コンテンツ</p>
      </ToggleBody>
    </Toggle>
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

### Toggle コンポーネント（`src/components/Toggle.tsx`）

```tsx
import { CaretDownIcon } from "@phosphor-icons/react";

interface ToggleProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Toggle = ({ className = "", style, children }: ToggleProps) => {
  return (
    <details className={`Toggle ${className}`} style={style}>
      {children}
    </details>
  );
};

interface ToggleSummaryProps {
  children: React.ReactNode;
  className?: string;
}

const ToggleSummary = ({ children, className = "" }: ToggleSummaryProps) => {
  return (
    <summary className={`ToggleSummary ${className}`}>
      {children}
      <CaretDownIcon className="ToggleIcon" />
    </summary>
  );
};

interface ToggleBodyProps {
  children?: React.ReactNode;
  className?: string;
}

const ToggleBody = ({ children, className = "" }: ToggleBodyProps) => {
  return <div className={className}>{children}</div>;
};

export { Toggle, ToggleSummary, ToggleBody };
```

**props の説明**:

- `className`: 追加する CSS クラス（`IsQa` 等）
- `style`: シリアル化可能なスタイルオブジェクト（`React.CSSProperties`）
- `children`: ToggleSummary, ToggleBody 要素

## レスポンシブ挙動

- **PC・スマートフォン共通**: 同じ表示

## 設計思想

1. **summary, details 原生機能活用**
   - セマンティックな開閉コンテンツ
   - CSS で完結するための工夫が必要

2. **Phosphor Icons 採用**
   - `@phosphor-icons/react` を使用（Tree Shaking 対応）
   - CDN 方式ではなく React コンポーネント方式
   - `CaretDownIcon` が ToggleSummary に内蔵される

3. **IsQa で Q&A 装飾**
   - Q/A ラベルが付与される
   - open 時にアイコンが反転するアニメーション

4. **画像付き対応**
   - 本文内に.has_img を使って画像を埋め込める

5. **シンプル API**
   - details タグをラップするだけの単純な構造

## クラス定義ファイル

`src/scss/_10UNIT.scss`
