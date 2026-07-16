# CSS設計

FLOCSS 風のレイヤー分割を土台に、IDEの表示順と読み込み順が一致するよう構成している。
Tailwind CSS v3 と併用し、Tailwind のシングルクラスで全てのカスタムスタイルを
上書きできる状態を維持する。
作業ルールは [AGENTS.md](AGENTS.md)。

## クラス命名規則

- ブロックは **PascalCase の CustomClass**（`.Header`, `.MindMap`, `.DescList` 等）。
- モディファイアは **PascalCase の `Is*`**（`.IsLayer`, `.IsRev` 等）。運用ルール:
  - 所有ブロックにのみ付ける。子要素に付けない
  - 単独ではスタイルを書かない（スコープ外での再利用を妨げないため）
  - ブロック末尾に `&:where(.IsXxx)` として固定し、中身はカスタムプロパティ再宣言を第一選択とする
  - `:has()` を伴う複雑な条件分岐やメディアクエリ単位で内容が分岐するモディファイアなど、
  機械的に変換すると構造が崩れるケースは対象外とする
- 状態は既存の状態クラス（`.show`, `IsStop` 等）をそのまま使う。単独スタイル禁止・所有コンポーネントのファイル内に書く
- ユーティリティは変数直結クラス（`.PX`, `.BorderXY`, `.wid` 等）。接頭辞は付けない
- JSフック用クラスは `Js*`（`.JsLetter` 等）。現状スタイルが当たっているものも当面維持する
- 要素セレクタは foundation の base のみに書く

## SCSSファイル内の記述順

```scss
.Block {
  // ベース
  .Element { }
  &:where(.IsXxx) {          // モディファイア（末尾固定）
    --block-foo: 2;          // 第一選択：変数再宣言
    .Element { }             // 変数で書けない性質のみ
  }
  &.show { }                 // 状態
}
```

## レイヤーと責務


| 層                | 責務                                            | 例                                                        |
| ---------------- | --------------------------------------------- | -------------------------------------------------------- |
| config           | **非出力のみ**。$変数・mixin（breakpoint、hoverガード）      | `$bp-sp`, `@mixin sp`, `@mixin menu`                     |
| foundation       | `@tailwind base`・カスタムプロパティ（`:root`）・リセット・base | 見出しサイズもbaseに集約                                           |
| layout           | 大枠の**枠と配置だけ**。中身に関知しない                        | `.main`, `.into`                                         |
| object/component | 文脈フリーの再利用パターン                                 | `.Unit` 内の `.Hero` `.Cards` `.Panel`、`.DescList`, `.btn` |
| object/project   | ページ・サイト固有。コンポーネントのミックス先                       | `.Header`, `.MindMap`, `.PageTransition`                 |
| object/utility   | 最後に読み、常に勝つ。刻みは絞る                              | `.PX`, `.wid`, `.BorderXY`                               |


- 非出力の置き場は `config/`
- カスタムプロパティは foundation（`:root {}` はCSS出力なので config に置かない）
- header の中身は project（layout は枠のみ）
- 文脈上書きは一方通行（project → component）。①使用側でモディファイア指定 ②project ブロックのミックスでシングルクラス上書き ③カスタムプロパティ再宣言
- 同一層内のブロック同士は上書きしない
- 状態スタイルはそのコンポーネントのファイル内に書く

## 並び順の不変条件

IDEの表示順＝読み込み順を、番号なしで維持する。

- config → foundation → layout → object → style.scss、object内も component → project → utility（アルファベット順＝カスケード順）
- object を平坦化しない
- 非出力（$変数・mixin）は自由に増やしてよい。置き場は config
- 束ね役はアンダースコアなしの `index.scss`（パーシャル群の最下段に固定されるため）
- foundation 内のみ reset → base の順序依存あり。index.scss の記述順で担保

## ディレクトリ構成

```
styles/
├─ config/          … index.scss（$変数・mixin。非出力のみ）
├─ foundation/       … _tailwind-base.scss, _custom-property.scss, _reset.scss, _base.scss, index.scss
├─ layout/          … _main.scss, _inner.scss, index.scss
├─ object/
│   ├─ component/   … _unit.scss, _desc-list.scss, _intersection.scss, _btn.scss, _accordion.scss ほか
│   ├─ project/     … _header.scss, _header-cylinder.scss, _mind-map.scss, _page-transition.scss ほか
│   └─ utility/     … _spacing.scss, _decoration.scss, _display.scss, _typography.scss ほか
└─ style.scss       … 各層のディレクトリ名だけ@use（configは読まない）。末尾に @tailwind components/utilities
```

パーシャル追加時は同ディレクトリの `index.scss` に `@use` を1行追記する。

## Tailwind CSS v3 との併用（カスケードレイヤー設計）

「Tailwind のシングルクラスで全てを上書きできる」仕様を、ネイティブ CSS カスケードレイヤー
（`@layer`）で保証している。プリフライトも `tw-preflight` レイヤー（最下位）に入れるため、
独自クラスの margin / padding 等がリセットに潰されることはない。

```css
@layer tw-preflight, foundation, layout, component, project, utility;  /* レイヤー順の宣言 */
@layer tw-preflight { /* @tailwind base（preflight + @layer base{} ホイスティング分） */ }
@layer foundation   { /* :root 変数・リセット・要素セレクタ */ }
@layer layout       { /* 枠のみ */ }
@layer component    { /* 文脈フリーの再利用パターン */ }
@layer project      { /* ページ・サイト固有 */ }
@layer utility      { /* 独自レイヤーの最後・独自クラス同士では常に勝つ */ }
/* @tailwind components; @tailwind utilities;（非レイヤー・最後） */
```

- レイヤー順宣言と `@layer tw-preflight { @tailwind base; }` は foundation の最初に出力される
`_tailwind-base.scss` に書く。`tw-preflight` は Tailwind の予約名（base/components/utilities）
ではないため横取りされず、ネイティブレイヤーとして残る
- foundation を含む全層の `index.scss` は、`@use "sass:meta";` と
`@layer <層名> { @include meta.load-css("..."); }` で各パーシャルを層に包む
（`@use` は `@layer {}` 内にネストできないため `meta.load-css` を使う）
- 優先順位は「非レイヤー ＞ 後に宣言されたレイヤー ＞ 先に宣言されたレイヤー」で、
詳細度より先に判定される。したがって:
  - 非レイヤーの Tailwind ユーティリティ1クラスが、独自クラスの組み合わせ（高詳細度）にも勝つ
  - すべての独自レイヤーが tw-preflight より上位のため、独自クラスはプリフライトに負けない
- Tailwind の `@layer base{}` ディレクティブを内包するパーシャル（`_tailwind-recovery.scss`）は、
ネイティブ `@layer` の中にネストすると中身が消失するためトップレベルで `@use` する。
中身は `@tailwind base` の位置へホイストされ tw-preflight レイヤーに入る
- `Tailwind に負けるための :where()` ラッパーは、レイヤー化により詳細度抑制が不要になったため解除している。
`:where()` は**モディファイア記法（`&:where(.IsXxx)`）専用**の運用とする
- `:where(:target,[id])` や `:where(*)` のスクロールバー等、モディファイア記法・詳細度抑制のいずれとも
目的が異なる `:where()` は解除しない

## 参考

- [https://qiita.com/super-mana-chan/items/644c6827be954c8db2c0](https://qiita.com/super-mana-chan/items/644c6827be954c8db2c0)（objectの入れ子・index.scss方式はこれに準拠）

