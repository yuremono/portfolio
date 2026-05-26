# LAYOUT_LIBRARY.md - Webサイト構造化出力ルール

## 目的

既存WebサイトのスクリーンショットやURLから、Figmaライブラリ化に使える構造化データを作成する。

目的は、見た目の説明ではなく、**どの単位を再利用可能なレイアウトパターンとして扱うか**を明確にすること。

特に `Section Pattern` は、人間とエージェントの間でレイアウトパターンの意思疎通をブレなく行うための分類として扱う。

## 基本方針

セクションの範囲自体は、人間とエージェントで大きく認識がズレることは少ない。

重要なのは、セクション内のどの単位を「再利用可能なパターン」として抽出するか。

各セクションは以下の2段階で見る。

```yaml
Section:
  Section Pattern: 大枠のレイアウト分類
  property: セクション内の具体的な変化要素
  modifier: 反転や配置差などの軽微な差分
```

## Section Pattern の考え方

`Section Pattern` は、Figmaライブラリ上で「どのテンプレートを選ぶか」を判断するための大枠分類とする。

`Section Pattern` は、細かい見た目ではなく、**主要コンテンツの並び方と構成順**を表す。

以下は `Section Pattern` に含めすぎない。

- ボタンの有無
- アイコンの種類
- 細かい装飾
- 画像の具体的な形
- スライダーか静的配置か
- カード内の細かい情報量
- カラム数の細かい違い
- 左右反転

これらは `property`、`modifier`、`sub property`、`要素` 側で扱う。

## 構造名に関する方針

表面的なコンテンツ名は、構造化データの名前には使わない。

会話上で「サービスセクション」「リクルート」などと言うことはあるが、それは場所を伝えるためであり、構造名として使う意味ではない。

構造化データ内で名前として使ってよい固有名は、現時点では以下のみ。

```yaml
Allowed Named Sections:
  - Header
```

`Company`、`Service`、`News`、`Recruit`、`Contact`、`Footer` などは、原則として `Section Pattern` の専用名にはしない。

ただし、場所を識別するための補助ラベルとして使うことはある。

```yaml
Contact Area / Blue CTA Block:
  Section Pattern: Background + Text Group + Horizontal Content + Card Layout
```

この場合、`Contact Area` はセクションの意味を示す補助ラベルであり、`Section Pattern` ではない。

## Header の扱い

`Header` は、サイト全体で共通化されやすく、ある程度パターン定義できるため、専用の `Section Pattern` として扱ってよい。

```yaml
Header / Compact Top Navigation:
  Section Pattern: Header
```

Header 内では、必要に応じて以下のようなバリエーション名を付ける。

- Compact Top Navigation
- Floating Header
- Minimal Header
- Centered Navigation Header
- Logo + Nav + CTA Header

ただし、これらは補助的な説明名であり、最終的な大分類は `Header` とする。

## Contact の扱い

`Contact` は専用の `Section Pattern` にしない。

理由は、サイトによってバリエーションが多く、専用パターンとして網羅しにくいため。

問い合わせ導線であっても、通常のセクションパターンに分類する。

例：

```yaml
Contact Area / Blue CTA Block:
  Section Pattern: Background + Text Group + Horizontal Content + Card Layout
  説明: 青い背景の上にテキストグループを置き、その下に2カラムの横並びコンテンツと、同幅カード型のボタン群を縦に並べる問い合わせ導線セクション。
  構成単位:
    - Background
    - Text Group
    - Horizontal Content:
        property:
          - 2 Column Layout
          - 左: Text Group
          - 右: Button Group
          - ratio: variable
    - Card Layout:
        property:
          - Equal Width Cards
          - Button Card × 3
  Background:
    - 青色背景
  要素:
    - Text Group:
        - Section Heading
        - 小見出し
    - Horizontal Content:
        - 左:
            - Text Group
        - 右:
            - Pill Button × 2
    - Card Layout:
        - Button Card × 3
```

`Contact` は `sub property` または補助ラベルとして把握し、`Section Pattern` は通常の構造分類で記述する。

## Footer の扱い

`Footer` も専用の `Section Pattern` にしない。

理由は、サイトによって構成差が大きく、パターンとして網羅しにくいため。

Footer は、通常のセクションパターンに分類しつつ、`sub property` または補助ラベルでフッター領域であることを示す。

例：

```yaml
Footer Area / Sitemap Block:
  Section Pattern: Background + Text Group + Horizontal Content
  説明: 背景の上にロゴをテキストグループ的に配置し、その下にサイトマップを横並びで配置するフッター領域。追加要素として下部に補助リンクとコピーライトを持つ。
  構成単位:
    - Background
    - Text Group:
        property:
          - titleType: Logo
    - Horizontal Content:
        property:
          - Sitemap Column Group
    - Additional Content:
        property:
          - Utility Links / Copyright
  要素:
    - Text Group:
        - Logo Area
    - Horizontal Content:
        - Column Link Group × 複数
    - Additional Content:
        - Utility Links
        - Copyright
```

Footer は細かく分解しすぎると、`Background + Logo + Horizontal Content + Full-width Content` のようにパターン名が肥大化する。

そのため、基本は以下のように扱う。

```yaml
Section Pattern: Background + Text Group + Horizontal Content
Additional Content: Utility Links / Copyright
```

## Section Pattern の命名ルール

`Section Pattern` は、以下の構成語を組み合わせて表現する。

```yaml
Pattern Units:
  - Header
  - Background
  - Text Group
  - Image Text
  - Horizontal Content
  - Vertical Content
  - Card Layout
  - List Content
  - Image
  - Effect Wrapper
```

使用しない構成語：

```yaml
Deprecated Pattern Units:
  - Single Content
  - Title Group
  - Text Area
  - Text + Image
  - Image + Text
```

例：

```yaml
Section Patterns:
  - Header
  - Image + Effect Wrapper
  - Image Text
  - Background + Text Group
  - Background + Image Text
  - Background + Text Group + Horizontal Content
  - Background + Text Group + Horizontal Content + Card Layout
  - Background + Text Group + Card Layout
  - Text Group + Horizontal Content
  - Text Group + Card Layout
  - Text Group + List Content
```

## Text Group の扱い

`Title Group` と `Text Area` は統合し、`Text Group` として扱う。

`Text Group` は、見出し・小見出し・リード文・本文・補助テキストなどを含むテキストのまとまりを指す。

```yaml
Text Group:
  property:
    - title: true
    - subtitle: true
    - lead: true
    - body: true
```

タイトルがない本文だけの領域も `Text Group` とする。

```yaml
Text Group:
  property:
    - title: false
    - body: true
```

ロゴがセクション冒頭の識別要素として機能している場合、Footer などでは `Logo Area` を `Text Group` の変種として扱ってよい。

```yaml
Text Group:
  property:
    - titleType: Logo
```

## Image Text の扱い

`Text + Image` と `Image + Text` は分けない。

どちらも `Image Text` として扱う。

左右の順序差は `modifier` で表す。

```yaml
Image Text:
  modifier:
    - reverse: false
```

```yaml
Image Text:
  modifier:
    - reverse: true
```

`Image Text` は頻出する独立パターンとして扱う。

テキスト側は `Text Group`、画像側は `Image` または `Image Area` として記述する。

```yaml
Image Text Section:
  Section Pattern: Image Text
  構成単位:
    - Text Group
    - Image
  modifier:
    - reverse: false
```

## Horizontal Content の扱い

`Horizontal Content` は、横並びの主要コンテンツを指す。

原則として、**左右の比率を可変する2カラム構成**として扱う。

```yaml
Horizontal Content:
  property:
    - 2 Column Layout
    - 左: Text Group
    - 右: Button Group
    - ratio: variable
```

左右が `1:1` の場合でも、左右の中身がカードではなく、役割の違う2つのコンテンツであれば `Horizontal Content` として扱う。

```yaml
Horizontal Content:
  property:
    - 2 Column Layout
    - ratio: 1:1
    - 左: Text Group
    - 右: Image
```

横並びコンテンツがセクション内で複数回出る場合は、`Section Pattern` に重ねて書いてよい。

```yaml
Section Pattern: Background + Text Group + Horizontal Content + Horizontal Content
```

ただし、同じ幅のカードが2つ以上並ぶ場合は `Horizontal Content` ではなく、基本的に `Card Layout` とする。

## Card Layout の扱い

`Card Layout` は、同じ幅のカードが2つ以上並ぶ構成を指す。

```yaml
Card Layout:
  property:
    - Equal Width Cards
    - Card × 3
```

人物カード風、ずらし配置、重なり配置、カードが浮いているかどうかは、`Card Layout` の判断基準にはしない。

それらは `property` や `要素` 側で扱う。

```yaml
Card Layout:
  property:
    - Equal Width Cards
    - offset: true
    - overlap: false
```

判断基準は以下の二択を基本とする。

```yaml
Layout Decision:
  Horizontal Content:
    - 比率制御する2カラム
    - または役割の違う1:1の2カラム
  Card Layout:
    - 同じ幅のカードが2つ以上並ぶ
```

## Single Content の扱い

`Single Content` は `Section Pattern` の構成語として使わない。

理由は、`Image Text`、`Text Group`、`Horizontal Content`、`Vertical Content` なども広い意味では単一のコンテンツブロックになり得るため。

大雑把な概念としては便利だが、Figmaライブラリ上で意思疎通するための `Section Pattern` としてはブレやすい。

そのため、以下のように具体的な構成語で書く。

```yaml
悪い例:
  Section Pattern: Background + Single Content

良い例:
  Section Pattern: Background + Text Group
  Section Pattern: Background + Image Text
  Section Pattern: Background + Text Group + Horizontal Content
```

Footer の下部リンクやコピーライトのような補助要素は、`Single Content` ではなく `Additional Content` として扱う。

```yaml
Additional Content:
  property:
    - Utility Links
    - Copyright
```

## Vertical Content の扱い

`Vertical Content` は、主要コンテンツが縦方向に積まれる場合に使う。

ただし、単に `Text Group` の下に `Card Layout` や `Horizontal Content` が続く場合は、`Vertical Content` と抽象化せず、構成順をそのまま書く。

```yaml
Section Pattern: Background + Text Group + Card Layout
```

```yaml
Section Pattern: Background + Text Group + Horizontal Content + Card Layout
```

## Background の扱い

`Background` は、単なる背景色だけでなく、以下のような装飾的な土台も含む。

```yaml
Background:
  - 背景色
  - 背景画像
  - 流体背景
  - 大型英字テキスト
  - 画像モザイク
  - 半透明オーバーレイ
  - 波形境界
  - 曲線マスク
  - 有機的な図形
```

Background の中身は `Section Pattern` に含めず、`Background` 項目で説明する。

## List Content の扱い

ニュースやお知らせのように、カードではなくテキスト行の一覧が主役の場合は `List Content` とする。

```yaml
Simple List Section:
  Section Pattern: Text Group + List Content
```

`News` という名前は `Section Pattern` には使わない。

## 出力形式

出力は YAML 風の構造化データのみを基本とする。

余計な説明文、メタコメント、判断過程は書かない。

```yaml
Section Name / Variation Name:
  Section Pattern: Pattern Name
  説明: ...
  構成単位:
    - ...
  modifier:
    - ...
  Background:
    - ...
  要素:
    - ...
```

## 判断が曖昧な場合

推測で断定しない。

ただし、スクリーンショットから十分に読み取れる範囲では、構造化出力を優先する。

不確定な点があっても、構造化データ内に「後で確認」「要確認」などは書かない。

必要な場合だけ、出力前に質問する。

## 重要ルールまとめ

```yaml
Additional Rules:
  Contact:
    - 専用の Section Pattern にはしない
    - 通常のセクションパターンに分類する
    - Contact であることは補助ラベルまたは sub property として扱う

  Footer:
    - 専用の Section Pattern にはしない
    - 通常のセクションパターンに分類する
    - Footer であることは補助ラベルまたは sub property として扱う
    - 細かく分解しすぎない
    - 基本は Background + Text Group + Horizontal Content などに分類し、下部要素は Additional Content として追加する

  Header:
    - 専用の Section Pattern として扱ってよい
    - ただしバリエーション名は補助的に使う

  Image Text:
    - Text + Image と Image + Text は分けない
    - Section Pattern は Image Text に統一する
    - 左右反転は modifier: reverse で扱う

  Text Group:
    - Title Group と Text Area は統合する
    - タイトル、小見出し、本文、ロゴタイトルなどは Text Group の property として扱う

  Single Content:
    - Section Pattern の構成語として使わない
    - 具体的な Text Group / Image Text / Horizontal Content / Card Layout などで表現する
    - 補助的な下部要素は Additional Content として扱う

  Horizontal Content:
    - 原則として比率制御する2カラム構成
    - 役割の違う左右1:1の2カラムも含める
    - 同じ幅のカードが2つ以上並ぶ場合は Card Layout を優先する

  Card Layout:
    - 同じ幅のカードが2つ以上並ぶ構成
    - 人物カード風、ずらし配置、重なり配置、浮いている見た目などは判断基準にしない
    - それらは property または要素で扱う
```

