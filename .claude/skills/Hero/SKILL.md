---
name: Hero
description: |
  BYOS の Hero コンポーネントを生成するスキル。
  指示形式：テキストで画像パスと変数を指定。
  例：`/Hero /images/hero-bg.jpg` または `メインビジュアル 背景画像は /images/main.jpg`
argument-hint: "[image_path] "
allowed-tools: Read, Glob, Grep, Write, Edit
component-variants: true
variant-naming: "{Base}{N}{Sub}"
new-component-triggers: "new, 新規, 新き, 別バージョン, 別の, 新たに, 新しく"
---

# Hero

このスキルは BYOS の Hero コンポーネントを生成・実装します。

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
    - ユーザーが明示的に「新規コンポーネント」「別バージョン」「Hero2」等を指定した場合のみ作成
    - デフォルトは既存コンポーネントを再利用

## コンポーネント分岐ルール

### 分岐条件

- 同じ CustomClass だがデザインが大きく異なる
- Tailwind 装飾がコンポーネント内に含まれる必要がある

### 命名規則

- 親: `{CustomClass}{N}` 例: `Hero2`
- 子: `{CustomClass}{N}{Sub}` 例: `Hero2Item`, `Hero2Back`
- N は 1 桁の連番（2〜9）

### 判断方法

ユーザーが以下を指定した場合のみ新規作成：

- 明示的な番号: `Hero2`
- トリガーワード: 「新規コンポーネント」「別バージョン」「別の」「新たに」「新しく」

## 基本構造

```jsx
<Hero className="{{modifier_classes}}" style={{} as React.CSSProperties}>
  <HeroBack image={getAssetPath("/images/picsum/001.jpg")} />
  <HeroItem>
    <h1>メインタイトル</h1>
    <p>サブテキスト</p>
  </HeroItem>
</Hero>
```

## 引数の指定方法

ユーザーから渡された引数 `$ARGUMENTS` を解析して、適切に変換します。

```
引数例：`/Hero /images/hero-bg.jpg `
```

### HeroBack props

| props | 説明 |
|-----|------|
| `image` | 画像のパス（省略可能） |

### HeroItem props

| props | 説明 |
|-----|------|
| `children` | コンテンツ（タイトル、テキスト等） |

## 実装手順

1. **ユーザー指示を解析**
    - `$ARGUMENTS` からValueクラスを抽出
    - `$ARGUMENTS` からModifierクラス抽出
    - `$ARGUMENTS` から変数を抽出
    - 既存のコンポーネントの有無
    - デザインファイルの指定の有無

2. **既存コンポーネントの確認**
    - `src/components/Hero.tsx` などの既存コンポーネントを確認
    - **存在しない場合**：新しく作成する
    - **存在する場合**：それを利用する

3. **マークアップする**

**前後のセクションを参考にしないこと**

    ```jsx
    <Hero className="{{modifier_classes}}" style={{} as React.CSSProperties}>
      <HeroBack image={getAssetPath("/images/picsum/001.jpg")} />
      <HeroItem>
        <h1>タイトル</h1>
      </HeroItem>
    </Hero>
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

### Hero コンポーネント（`src/components/Hero.tsx`）

```tsx
interface HeroProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Hero = ({ className = "", style, children }: HeroProps) => {
  return (
    <div className={`Hero ${className}`} style={style}>
      {children}
    </div>
  );
};

interface HeroItemProps {
  className?: string;
  children: React.ReactNode;
}

const HeroItem = ({ className = "", children }: HeroItemProps) => {
  return (
    <div className={`item ${className}`}>
      {children}
    </div>
  );
};

interface HeroBackProps {
  image?: string;
  className?: string;
}

const HeroBack = ({ image, className = "" }: HeroBackProps) => {
  return (
    <figure className={`back ${className}`}>
      {image && <img src={image} alt="" />}
    </figure>
  );
};

export { Hero, HeroItem, HeroBack };
```

**props の説明**:

- `className`: 追加する CSS クラス
- `style`: シリアル化可能なスタイルオブジェクト（`React.CSSProperties`）
- `children`: HeroBack と HeroItem 要素
- `image`: HeroBack 内の背景画像パス

## レスポンシブ挙動

- **PC（>768px）**: 背景画像とコンテンツを重ねて表示
- **スマートフォン（≤640px）**: 背景画像は正方形アスペクト比に変更

## 設計思想

1. **Grid レイヤー構造として設計**
   - 背景画像（HeroBack）とコンテンツ（HeroItem）を重ねる
   - CSS Grid の `grid-area: 1/1` で同一位置に配置

2. **関心の分離**
   - `Hero`: レイアウトコンテナ（grid 設定）
   - `HeroBack`: 背景画像専用
   - `HeroItem`: コンテンツ専用

3. **Tailwind で柔軟にカスタマイズ**
   - 高さ、余白、位置合わせは Tailwind クラスで制御
   - `min-h-screen`, `content-end`, `text-right` 等

4. **セマンティックな HTML**
   - 背景画像は装飾目的のため `figure` と `alt=""` を使用
   - コンテンツは意味を持つため `.item` 内に配置

## クラス定義ファイル

`src/scss/_10UNIT.scss`
