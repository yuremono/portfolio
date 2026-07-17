# CSS設計

FLOCSS 風のレイヤー分割を土台に、IDEの表示順と読み込み順が一致するよう構成している。
Tailwind CSS v3 と併用し、Tailwind のシングルクラスで全てのカスタムスタイルを
上書きできる状態を維持する。
作業ルールは [AGENTS.md](AGENTS.md)。

## クラス命名規則

- 独自クラスは基本PascalCase、モディファイアはPascalCaseの`Is*`
- `Is*`は所有ブロック末尾の`.IsXxx`のみ、単独禁止、子要素に付けない
- 状態クラス（`.show`等）も単独禁止、所有コンポーネントのファイル内に書く

## カスタムクラス

`.CustomClass` は PascalCase の再利用可能なスタイルブロック。モディファイア・状態は
ブロックの中にネストして書く。

```scss
.Custom {
  .CustomItem {
    color: var(--MC);
  }
  &.IsXxx {
    --col: 2;
  }
  &.show {
    opacity: 1;
  }
}
```

## レイヤーと責務

全てのクラスは再利用を想定し、FLOCSS の `project` の概念・上書きルールは適応しない。
component と project の違いはレイヤー順（カスケード順）のみで、役割上の上下関係はない。

| 層                | 責務                                            | 例                                                        |
| ---------------- | --------------------------------------------- | -------------------------------------------------------- |
| config           | 非出力                                           | `$menu`, `@mixin hover`, `@mixin menu`                    |
| foundation       | `@tailwind base`・カスタムプロパティ（`:root`）・リセット・base | `_root.scss`, `_reset-base.scss`                          |
| layout           | 大枠の**枠と配置だけ**。中身に関知しない                        | `.into`                                                   |
| object/component | 再利用パターン                                       | `_btn.scss`, `_DescList.scss`, `_intersection.scss`, `_structure.scss`, `_visuals.scss` |
| object/project   | 未定                                            | `_Header.scss`, `_HeaderCylinder.scss`, `_MindMap.scss`, `_PageTransition.scss` |
| object/utility   | ユーティリティ                                      | `_decoration.scss`, `_utility.scss`                       |

- 非出力の置き場は `config/`
- カスタムプロパティは foundation（`:root {}` はCSS出力なので config に置かない）
- header の中身は project（layout は枠のみ）
- 束ね役はアンダースコアなしの `index.scss`（パーシャル群の最下段に固定されるため）
- パーシャル追加時は同ディレクトリの `index.scss` に `@use` を1行追記する
- パーシャルは冒頭に未使用でも `@use "../../config" as *;` を書く
- 主要クラスに付随するクラスをまとめたパーシャルファイルはクラス名と同じファイル名にする(PascalCaseなのにkebab-caseにしない)

## 並び順の不変条件

IDEの表示順=読み込み順を、番号なしで維持する。

- config → foundation → layout → object → style.scss、object内も component → project → utility（アルファベット順＝カスケード順）
- object を平坦化しない
- foundation 内のみ順序依存あり。index.scss の記述順で担保
- 新しいディレクトリ・層を作らない、style.scss は触らない

## Tailwind CSS v3 との併用（カスケードレイヤー設計）

ネイティブ CSS カスケードレイヤー（`@layer`）で読み込み順を固定している。
`tw-preflight`（リセット CSS）→ カスタムクラス → Tailwind utility の順で読み込まれる。

```css
@layer tw-preflight, foundation, layout, component, project, utility;  /* レイヤー順の宣言 */
@layer tw-preflight { /* @tailwind base（preflight + @layer base{} ホイスティング分） */ }
@layer foundation   { /* :root 変数・リセット・要素セレクタ */ }
@layer layout       { /* 枠のみ */ }
@layer component    { /* 再利用パターン */ }
@layer project      { /* 再利用パターン（component とはレイヤー順のみが異なる） */ }
@layer utility      { /* 独自レイヤーの最後・独自クラス同士では常に勝つ */ }
/* @tailwind components; @tailwind utilities;（非レイヤー・最後） */
``` 

- `foundation/index.scss` に `tw-preflight` → `foundation` → `layout` → `component` → `project` → `utility`
の順でレイヤー宣言があり、`tw-preflight` が最初に読み込まれる
- `tw-preflight` は Tailwind の予約名（base/components/utilities）ではない。横取りされずネイティブレイヤーとして残す意図で採用
- foundation を含む全層の `index.scss` は `@use "sass:meta";` と
`@layer <レイヤー名> { @include meta.load-css("..."); }` で各パーシャルを包む
（`@use` は `@layer {}` 内にネストできないため `meta.load-css` を使う）
- `@layer base{}` を内包するパーシャル（`_tailwind-recovery.scss`）はトップレベルで `@use` する
（ネイティブ `@layer` にネストすると中身が消失するため）。中身は `@tailwind base` の位置へホイストされ tw-preflight レイヤーに入る

## 参考

- [https://qiita.com/super-mana-chan/items/644c6827be954c8db2c0](https://qiita.com/super-mana-chan/items/644c6827be954c8db2c0)（objectの入れ子・index.scss方式はこれに準拠）
