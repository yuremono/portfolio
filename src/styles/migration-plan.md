# CSS 移行計画書 — index.scss + globals.scss → styles/（FLOCSS 風ツリー + カスケードレイヤー）

対象: `src/index.scss` と `src/scss/globals.scss`（および配下パーシャル）を、
本ディレクトリのファイルツリー構成（[css-architecture.md](css-architecture.md) / [AGENTS.md](AGENTS.md)）へ統合する。

**スコープ（ユーザー指示による確定事項）**

- Tailwind CSS v3 は維持
- **命名規則は変更しない**。PascalCase の CustomClass、PascalCase の `Is*` モディファイアを維持（kebab-case BEM への一新は今回やらない）
- **「Tailwind のシングルクラスで全てを上書きできる」仕様を維持・強化する。**
  そのために全カスタムスタイルをネイティブ CSS カスケードレイヤー（`@layer`）で包み、
  Tailwind ユーティリティは非レイヤーのまま最後に置く（非レイヤーは常にレイヤー内に勝つ）
- レイヤー化により詳細度抑制が不要になるため、`_10UNIT.scss` 等にある
  **「Tailwind に負けるための `:where()` ラッパー」は解除**する
- `:where()` は今後**モディファイア記法（`&:where(.IsXxx)`）専用**の運用とする
- 現行参照（`index.scss` + `globals.scss`)は維持したまま、新ツリーをトグルで比較検証後に移行

**決定済みの事項**

- ページ個別 scss（glitch / Donut / Next / ShuffleDivide）は `object/project/` へ物理移動し、per-page import（コード分割）を維持する
- 持ち込み雛形のサンプル実体（`--color-*` 変数、`_btn` `_cards` `_hero` `_about` 等）は本プロジェクトの内容で置換する
- `style.css` / `style.css.map`（持ち込み元のビルド成果物）は削除する。ビルドは Vite（`AGENTS.md` の watch/build 記述は移行完了時に更新）

---

## 1. 現状の把握

### エントリと読み込み経路

| 経路 | 内容 |
|---|---|
| `main.tsx` → `scss/globals.scss` | 番号付きパーシャル束ね（01variables / 02base / 03header / 04headerCylinder / 08intersection / 09hover / 10UNIT / 11DescList / 12shadow / 20utility） |
| `main.tsx` → `index.scss` | `@tailwind` 3ディレクティブ + 雑多な実装（PageTransition, InitialLoading, MindMap, tweakpane 上書き, JsLetter, 変数直結ユーティリティ `.wid .PX .BorderXY` 等） |
| 各ページ → 個別 scss | `glitch.scss`（Glitch/Yugen）, `ShuffleDivide.scss`, `Donut.scss`, `Next.scss`（Next/Top）— ページ単位でコード分割 |

### 調査済みの技術事情

- **`@apply` が 222 箇所**（_03header 等）。Vite の PostCSS が Sass 出力後に処理するため、新エントリでもそのまま動く
- **preflight は有効**（tailwind.config に corePlugins 指定なし）。`@tailwind base` は非レイヤーで出力される
- **Tailwind ディレクティブとしての `@layer base{}` は `index.scss` の 2 箇所のみ**（MindMap 群など）。`@layer components/utilities` の使用はゼロ
- **`_10UNIT.scss` に `:where()` が約 60 箇所**。大半が「Tailwind クラスで上書きできるよう詳細度を 0 にする」ためのブロックラッパー（`:where(.Cards)` `:where(.Hero)` 等）
- **`!important` が `index.scss` に 22 箇所、_03header に 2 箇所**（§6 リスク参照）
- `tailwind.config.js` と arbitrary value（`p-[--PX]` 等）がカスタムプロパティ名に依存。**変数名は変更しない**
- 現 `src/styles/` の実体ファイルは持ち込み元のサンプル。`config/`（$bp-sp, @mixin sp/hover）は非出力なのでそのまま使える

## 2. カスケードレイヤー設計（本計画の核）

### 出力される CSS の最終順序

```css
@layer layout, component, project, utility;  /* ① レイヤー順の宣言（最初に出力） */
/* ② @tailwind base（preflight + @layer base{} ホイスティング分。非レイヤー） */
/* ③ foundation: :root 変数・要素セレクタ（非レイヤー） */
@layer layout    { /* 枠のみ */ }
@layer component { /* UNIT, DescList … */ }
@layer project   { /* header, PageTransition, MindMap … */ }
@layer utility   { /* .PX .BorderXY .wid … 旧 20utility */ }
/* ④ @tailwind components; @tailwind utilities;（非レイヤー・最後） */
```

### この設計で保証されること

- **非レイヤーはレイヤー内に常に勝つ**（詳細度より先にレイヤーが比較される）ため、
  Tailwind ユーティリティ 1 クラスが `.Block.IsMod`（0,2,0）にも勝つ。
  現状 `:where()` で詳細度を殺して実現していたことが、仕様として保証される
- カスタムスタイル同士も layout < component < project < utility のレイヤー順で優先が固定され、
  「utility は最後に読み常に勝つ」「上書きは project からの一方通行」がカスケードレイヤーとして明文化される

### foundation を非レイヤーに残す理由（要注意ポイント）

「全カスタムスタイルをレイヤーで包む」を文字通りやると、**非レイヤーの preflight が
レイヤー内の foundation に常に勝ってしまい**、`h1{font-size:var(--h1FZ)}` が
preflight の `h1{font-size:inherit}` に負ける等の逆転が起きる。
foundation（要素セレクタ + `:root` 変数）は非レイヤーのまま `@tailwind base` の直後に置けば、
ソース順で preflight に勝ち、かつ要素セレクタ（0,0,1）は Tailwind クラス（0,1,0）に
詳細度で負けるので「シングルクラスで上書き」も維持される。
`.h1FZ` などクラス形のものは utility レイヤーへ移す。

### Sass 実装方法

`@use` は `@layer {}` 内にネストできないため、各層の `index.scss` で `meta.load-css` を使う：

```scss
// object/component/index.scss
@use "sass:meta";
@layer component {
	@include meta.load-css("unit");
	@include meta.load-css("desc-list");
}
```

- レイヤー順宣言 `@layer layout, component, …;` は最初に出力される foundation の先頭パーシャルに置く
- `@tailwind components; @tailwind utilities;` は `style.scss` 本体の末尾に書く
  （Sass は `@use` した CSS をエントリ自身の記述より先に出力するため、自然に最後になる）
- ページ個別 scss も `@layer project { … }` で包む（レイヤー順はメイン CSS が先に宣言済みなので、同名レイヤーは文書全体でマージされる）

### 事前スパイク（Phase 0 で最初に検証）

1. **Tailwind v3 がカスタム名の `@layer` を素通しするか**。v3 は `base/components/utilities` の
   3 名だけを自前ディレクティブとして解釈する仕様だが、未知名でエラーを出さないことを最小構成で確認
2. **`@layer base{}`（Tailwind ホイスティング用・2 箇所）をネイティブレイヤー内に置いたときの挙動**。
   不安定なら、この 2 ブロックだけレイヤー外（foundation 相当位置）に置く逃げ道を採る
3. `meta.load-css` + `@apply` + `@tailwind` 素通しの組み合わせが Vite ビルドで問題ないこと

## 3. 段階分け: 「移動」「レイヤー化」「:where 整理」を分離する

クラス名を変えないため、旧⇔新のトグル比較は最後まで成立する。性質の違う編集を混ぜず、差分の原因を常に特定可能にする。

- **Phase 1（移動のみ）**: セレクタ・値を一切編集せず再配置。スクショ比較で差分ゼロを確認
- **Phase 2（レイヤー化）**: 各層を `@layer` で包む。ここで初めて「カスタムクラスが Tailwind に勝っていた箇所」が反転する。**反転は仕様変更として意図どおり**だが、見た目に出る箇所はケースバイケースで確認
- **Phase 3（:where 整理 + モディファイア記法）**:
  - `_10UNIT.scss` 等の「Tailwind に負けるための `:where()` ラッパー」を解除（レイヤー化で不要になったため）。カスタム同士の優先関係が変わり得るのでファイル単位でスクショ検証
  - `:where(*)`（スクロールバー）等、目的が違う `:where` は**外さない**
  - モディファイアを `&:where(.IsXxx)` + カスタムプロパティ再宣言方式へ統一（ブロック末尾固定・単独スタイル禁止）
- **Phase 4（本採用）**: エントリ一本化・トグル撤去・後片付け

## 4. 命名規則の読み替え表（持ち込みルール → 本プロジェクト適用）

| 持ち込みルール | 本プロジェクトでの適用 |
|---|---|
| ブロック: kebab-case BEM | **PascalCase CustomClass を維持**（変更なし） |
| モディファイア: `_name` | **`Is*`（PascalCase）を維持**。運用ルールのみ採用: 所有ブロックにのみ付ける・単独スタイル禁止・ブロック末尾に `&:where(.IsXxx)`・中身は変数再宣言が第一選択 |
| 状態: `is-*` デュアルクラス | 既存の状態クラス（`.show`, `IsStop` 等）をそのまま使用。単独スタイル禁止・所有コンポーネントのファイル内に書く、のルールのみ採用 |
| ユーティリティ接頭辞 `u-` | 既存の変数直結クラス（`.PX` `.BorderXY` 等）を utility レイヤーに配置。接頭辞は付けない |
| `js-`（スタイル禁止） | 既存の `Js*`（`JsLetter` 等）が相当。スタイルが当たっている現状は当面維持 |
| 要素セレクタは base のみ | 採用（現行の要素セレクタは foundation/_base へ集約） |

SCSS ブロック内の記述順: ベース → エレメント → `&:where(.IsXxx)`（末尾固定）→ 状態。

## 5. 新ツリーへのマッピング

Phase 1 は「移動のみ・編集なし」。1 ファイル内に複数層が混在する場合のみ分割（切り貼りのみ）。

| 現行 | 移行先 | 備考 |
|---|---|---|
| `_mixin.scss` | `config/` | 非出力なら合流。出力を含むなら該当層へ分離 |
| `_01variables.scss` | `foundation/_root.scss` | `:root` の oklch 変数群。変数名不変 |
| `_02base.scss` | `foundation/_base.scss` | 要素セレクタの本籍 |
| `index.scss` の `@tailwind base` | `foundation/`（先頭パーシャル。レイヤー順宣言もここ） | §2 参照 |
| `index.scss` の見出し・`html`・スクロールバー等の要素セレクタ | `foundation/_base.scss` | `.h1FZ` 等クラス形は utility へ（Phase 2 以降） |
| `_03header.scss` / `_04headerCylinder.scss` | `object/project/` | layout は「枠のみ」のルールのため、中身を持つ header は project |
| `_08intersection.scss` / `_09hover.scss` | `object/project/` | 内容確認の上、component 相当があれば分離 |
| `_10UNIT.scss` / `_11DescList.scss` | `object/component/` | Phase 3 で `:where` ラッパー解除 |
| `_12shadow.scss` | `object/utility/` または foundation（変数のみなら） | 内容を見て判断 |
| `_20utility.scss` + `index.scss` の変数直結クラス | `object/utility/` | 最後に読み常に勝つ層 |
| `index.scss` の PageTransition / InitialLoading / MindMap / JsLetter / dialog / tweakpane | `object/project/` | `@layer base{}` の 2 ブロックはスパイク結果次第で foundation 側へ |
| `index.scss` の `@tailwind components` / `@tailwind utilities` | `style.scss` 末尾 | 非レイヤー・最終出力 |
| ページ個別 scss（glitch 等） | `object/project/` へ物理移動、per-page import 維持 | `@layer project` で包む（Phase 2）。import 張り替えは Phase 4 |
| `_15index.scss` / `_16style` / `_10UNIT.bak` | **対象外** | コメントアウト・.bak は意図的に残されたものとして凍結 |
| 雛形サンプル（`--color-*`, `_btn` `_cards` `_hero` `_about` 等） | 削除し本プロジェクト内容で置換 | 決定済み。`config/` と index.scss 束ね構造は活かす |
| `style.css` / `style.css.map` | 削除 | 決定済み。Vite が Sass を処理 |

## 6. リスクと対策

| リスク | 対策 |
|---|---|
| 読み込み順の再編成でカスケードが変わる（同詳細度の上書き逆転） | Phase 1 は「移動のみ」を徹底し、スクショ比較で差分箇所だけ順序調整 |
| レイヤー化で「カスタムが Tailwind に勝っていた箇所」が反転 | 意図した仕様変更。Phase 2 として分離し、見た目に出た箇所を個別確認（TSX 側の Tailwind クラス調整 or 該当スタイルの変数化で対応） |
| **`!important` はレイヤー優先順が反転する**（レイヤー内 important > 非レイヤー important）。index.scss に 22 箇所 | Phase 2 で個別確認。大半はコンポーネント内部の勝負なので実害は限定的見込みだが、Tailwind 側 important と衝突する箇所は要注意 |
| `:where` 解除でカスタム同士の優先関係が変わる | Phase 3 でファイル単位に解除 → スクショ確認 → コミット。問題があれば残す判断も可 |
| Tailwind v3 とネイティブ `@layer` の相互作用 | Phase 0 スパイクで最小構成検証（§2） |
| `@apply` が新エントリで解決できない | 原理上問題なし。スパイクで _03header を含めて素通し確認 |
| 動的 import による FOUC | dev 検証限定。本番は移行完了後に静的 import へ戻す |

## 7. トグルの実装

`main.tsx` で環境変数により動的 import を切り替える（静的 import 2 本だと両方バンドルされ衝突するため）。

```ts
// main.tsx（移行期間のみ）
if (import.meta.env.VITE_STYLE_NEXT === "1") {
	import("./styles/style.scss");
} else {
	import("./scss/globals.scss");
	import("./index.scss");
}
```

- 新: `VITE_STYLE_NEXT=1 npm run dev` ／ 旧: `npm run dev`
- 本番ビルド・デプロイは移行完了まで従来のまま（完了時に静的 import 1 本へ戻す）

## 8. 検証方法

1. 両モードで dev サーバーを起動し、`scroll-capture`（または agent-browser）で全ルート × 複数スクロール位置のスクリーンショットを `tmp/browser-checks/` に取得
2. Phase 1: 差分ゼロが合格条件。差分があれば読み込み位置で解消（セレクタは書き換えない）
3. Phase 2〜3: 差分 = 反転・整理の影響箇所。1 件ずつ「意図どおりの変化か」を判定
4. hover / ヘッダー開閉 / ページ遷移 / InitialLoading など動的状態も目視確認
5. `npm run build` が両モードで通ること（lint も）

対象ページ: Top / Glitch / Yugen / Donut / Next / ShuffleDivide ほか、ルーター定義の全ページ。

## 9. 作業チェックリスト

### Phase 0: スパイクと準備
- [ ] Tailwind v3 × ネイティブ `@layer`（カスタム名）の素通し検証
- [ ] `@layer base{}` ホイスティング × ネイティブレイヤーの挙動検証
- [ ] `meta.load-css` + `@apply` + `@tailwind` の Vite ビルド検証
- [ ] 雛形サンプル実体・`style.css(.map)` の削除、`config/` 整備
- [ ] `main.tsx` にトグル実装

### Phase 1: 構造移行（移動のみ・非レイヤー・名前不変）
- [ ] config（_mixin 合流）
- [ ] foundation移設
- [ ] object/component（UNIT, DescList ほか）移設
- [ ] object/project（header, headerCylinder, intersection, hover, index.scss の固有実装群）移設
- [ ] object/utility（20utility, 変数直結クラス, shadow）移設 + `style.scss` 末尾に `@tailwind components/utilities`
- [ ] ページ個別 scss の `object/project/` への物理移動（import は旧パスのまま or 併設。張り替えは Phase 4）
- [ ] 全ルートのスクショ比較（旧⇔新）・差分ゼロ化
- [ ] ビルド・lint 確認

### Phase 2: レイヤー化
- [ ] foundation 先頭にレイヤー順宣言、各層 index.scss を `@layer` + `meta.load-css` 化
- [ ] ページ個別 scss を `@layer project` で包む
- [ ] スクショ比較。反転箇所を列挙し、1 件ずつ意図判定・対応
- [ ] `!important` 22 + 2 箇所の影響確認

### Phase 3: :where 整理 + モディファイア記法
- [ ] 「Tailwind に負けるための `:where()`」の棚卸し（_10UNIT 約 60 箇所ほか）
- [ ] ファイル単位で解除 → スクショ確認 → コミット
- [ ] `Is*` モディファイアを `&:where(.IsXxx)` + 変数再宣言方式へ統一（ブロック単位・段階適用）
- [ ] ブロック内記述順（ベース → エレメント → モディファイア → 状態）へ整理

### Phase 4: 本採用
- [ ] 全ページで最終確認
- [ ] `main.tsx` を `styles/style.scss` の静的 import に一本化、トグル撤去
- [ ] ページ個別 scss の import パス張り替え
- [ ] 旧 `src/index.scss` / `src/scss/` 番号付き群の扱い決定（凍結 or 削除はユーザー判断）
- [ ] `STYLE.md` / `CLASS.md` / ルート `AGENTS.md` / 本ディレクトリ `AGENTS.md`・`css-architecture.md` の整合更新（ユーザー指示後）

---

## 10. 実施記録（Phase 0〜3 完了時点）

Phase 0〜3 はブラウザでの見た目確認を行わず、ビルド出力 CSS の静的解析（クラスセレクタ突合・
ブレース深度によるレイヤー帰属確認）のみで検証した。両モードとも `npm run build` は成功し、
出力 CSS のクラスセレクタ数は旧モード・新モードで 1002 個ずつ完全一致している。

### Phase 0 スパイク結果

1. **カスタム名のネイティブ `@layer` 素通し**: 問題なし。Tailwind v3 はエラーを出さずに通す
2. **`@layer base{}`（Tailwind ディレクティブ）をネイティブ `@layer` 内にネスト**: **中身が消失する**。
   ビルド自体は成功するが、ネストした `@layer base{}` の内容が最終 CSS から他の場所へホイストされることも
   なく単純に失われる。この結果を受け、`@layer base{}` を内包する3パーシャル
   （`object/project/_js-letter.scss`、`object/project/_mind-map.scss`、`object/utility/_tailwind-recovery.scss`）は
   各 `index.scss` でネイティブレイヤーの外（非レイヤー）のまま `@use` で読み込んでいる。
   ビルド後 CSS のブレース位置解析で、これら3ファイルの内容が全てのネイティブ `@layer` 宣言より前
   （非レイヤー領域）に出力されることを確認済み
3. **`meta.load-css` + `@apply` + `@tailwind` の素通し**: 問題なし

さらに、Tailwind v3 の `@tailwind base` / `@layer base{}` は**コンパイル後 CSS に実在のネイティブ
`@layer` を一切生成しない**（完全にフラット化された非レイヤー CSS として出力される）ことも判明した。
これにより上記3ファイルの内容は「常に非レイヤー」として扱われる。

### レイヤー化中に発見・修正した設計上の問題（%r-grow のクロスレイヤー漏れ）

`%r-grow`（Sass プレースホルダー）が `object/component/_btn.scss`（component 層）で定義され、
`object/project/_hover.scss`（project 層）からのみ `@extend` されていた。ネイティブレイヤー下では
`@extend` はプレースホルダーの**宣言位置のレイヤーに**マージ後の選択子ごと出力されるため、
このままだと `.f_link` 等 project 固有のセレクタが物理的に component 層へ紛れ込む。
`%r-grow` の定義を唯一の使用元である `_hover.scss` 側へ移設して解決し、ビルド後 CSS のブレース解析で
`.f_link` と `%r-grow` のマージ後ルールが正しく `project` 層に属することを確認した。

### !important の反転リスク（原本再カウント: index.scss 18 箇所 + _03header.scss 2 箇所 = 20 箇所）

計画書冒頭の「index.scss に22箇所」は再カウントの結果 **18箇所**（コメントアウト4箇所除く）だった。

| 区分 | 箇所数 | 所在 | リスク評価 |
|---|---|---|---|
| 非レイヤー（安全・変化なし） | 1 | `foundation/_base.scss`（html scroll-behavior） | 元々非レイヤー、foundation 自体が非レイヤー設計のため変化なし |
| 非レイヤー（安全・変化なし） | 14 | `_js-letter.scss`(1) + `_mind-map.scss`(13) | 元々 `@layer base{}` 内でTailwindがフラット化していたため非レイヤー、今も同じ |
| ネイティブレイヤー内（反転リスクあり） | 6 | `object/component/_btn.scss` | コンポーネント内部の勝負が中心、実害は限定的見込み |
| ネイティブレイヤー内（反転リスクあり） | 2 | `object/component/_intersection.scss` | 同上 |
| ネイティブレイヤー内（反転リスクあり） | 1 | `object/project/_hover.scss` | 同上 |
| **ネイティブレイヤー内（Phase2で新規発生したリスク）** | 2 | `object/project/_page-transition.scss` | `html.PageTransitionScrollInstant` と `body.SiteTransitionPending #root > .InitialLoading` の2箇所。原本の index.scss では `@layer base{}` の外側の素のトップレベル記述だったため、今回のレイヤー化で初めて「非レイヤー→レイヤー」に変わった。使用箇所（`InitialLoadingOverlay.tsx` 等）を確認したが、競合する Tailwind の `!` 接頭辞ユーティリティは現状使われておらず実害は未確認。将来の変更で衝突しうる点として要注意 |
| ネイティブレイヤー内（反転リスクあり） | 2 | `object/project/_header.scss`（旧 `_03header.scss` の2箇所） | 計画書が事前に指摘していた「_03header の2箇所」に該当。`.HeaderNavMobile_inner>ul` の padding 上書きと `.__cross` の transform リセット |

### Phase 3: :where() 整理の集計

新ツリー全体（ページ個別 scss の4ファイルは対象外）で123件ヒットした `:where(` のうち、
実質的な判定対象は約64件。

| 分類 | 件数 | 内訳 |
|---|---|---|
| 詳細度抑制ラッパー（解除済み） | 44件 | `_unit.scss`31件（`.Hero` `.Cards` `.Toggle` `.Panel` `.Flex55〜82`(8) `.Wrap` `.Stick` `.PathDraw` `.BorderDraw` `.RgbShift` `.MaskMosaique` `.LottieScroll` `.RandomRects` `.ImgText` `.NodeStack` 他）+ `_btn.scss`(`.btn`)1件 + `_main.scss`(`main>*`)1件 + `_decoration.scss`(`.BorderT`〜`.BorderXY3`等)10件 + `_header.scss`(`.HeaderNav` `.HeaderNavMobile`)2件 |
| 保持: モディファイア記法（対応済み） | 1件 | `_unit.scss` の `&:where(.IsLayer)`。既に正しい形式のため変更不要 |
| **保持: 複雑・目的不明瞭のため未解除** | 24件 | `_unit.scss` の `>:where(:nth-child(1\|2))` 系（Flex55〜82全種、`&.bp-sm > :where(...)` 含む）。クラス名ではなく疑似クラスを where で包む用途が不明瞭で、Tailwind 対抗以外の意図の可能性もあるため保持 |
| **保持: 複合セレクタ・構造変更を伴うため未解除** | 1件 | `_unit.scss` の `&:where(.Panel .IsRev *)` |
| 保持: foundation は非レイヤーのため対象外 | 7件 | `foundation/_base.scss` 全て（`:target,[id]`、`.PageRoot`/`#root>div`、`:where(*)` 系3件） |
| 保持: `:not()` ガード（クラス名の抑制ではない） | 1件 | `_hover.scss` の `&:where(:not([class], .h a, ...))` |
| コメントアウト（触らず） | 3件 | `_unit.scss` 内の無効化済みコード |

### Phase 3: Is* モディファイア記法変換の集計

`&.IsXxx {` → `&:where(.IsXxx) {` の記法変換のみ実施（内容を変数再宣言方式へ刷新する作業は未着手）。
単純・単独出現・重複衝突なしと判断できたもののみ変換し、それ以外は保留した。

| ファイル | 変換 | 保留 |
|---|---|---|
| `object/component/_unit.scss` | 11件: IsGrow, IsFix, IsIcon, IsRow, IsShift, IsQa, IsSmall, IsFlow, IsDown×2, IsDemo | **IsColumn(2箇所)**: `.Stick` 内で `&.IsColumn` が2回定義され内容が矛盾（`display:block` vs `flex-col`）。既に後勝ちのソース順依存で、片方だけ変換すると優先順位が変わるため両方保留。**IsRev(10箇所)**: `.Stick` 内で3つの `@media` ブロックに反復定義されており、`.MindMap.IsLayer` と同種の「大きな構造分岐」に該当するため保留 |
| `object/component/_desc-list.scss` | 8件: IsSimple, IsZebra, IsBorder, IsHead, IsColumn, IsTimeline, IsCenter, IsDdright | なし |
| `object/component/_intersection.scss` | 2件: IsShow×2（内容が同一のため安全） | なし |
| `object/project/_header.scss` | 2件: IsBurger, IsDots | なし |
| `object/project/_header-cylinder.scss` | 6件: IsReady, IsOpen, IsUser×2, IsAssistant×2 | なし |
| `object/project/_mind-map.scss` / `_js-letter.scss` | **一切変換せず** | IsLayer, IsStop, IsDeco, IsDeco2 等。非レイヤー・escape hatch 対象ファイルであり、`.MindMap.IsLayer` は「変換しない例」の代表例そのものであるため全件保留 |

**合計: 29件変換、13件保留**。保留分は中身を「カスタムプロパティ再宣言方式」へ刷新する作業も未着手
（`@apply` ベースの子要素上書きが大半で、ベース側に対応する変数が存在しないものが多く、安全な変換には
新規変数設計とブラウザでの見た目確認が必須なため）。

### Phase 4 への申し送り事項

- ページ個別 scss（`_glitch.scss` `_donut.scss` `_next.scss` `_shuffle-divide.scss`）は
  `object/project/` へコピー配置済みだが、各ページ tsx の import パス（`../scss/glitch.scss` 等）は
  未変更で、`object/project/index.scss` の `@use` にも未接続（接続すると per-page コード分割が壊れるため）。
  Phase 4 で import パス張り替えと旧 `src/scss/` 側ファイルの削除判断が必要
- `main.tsx` のトグルは維持したまま。Phase 4 で `styles/style.scss` の静的 import 一本化とトグル撤去を行う
- 上記「Phase 3: Is* モディファイア記法変換の集計」の保留13件について、変数再宣言方式への刷新
  （新規カスタムプロパティ設計 + ブラウザでの見た目確認）が未着手
- `object/component/_unit.scss` の `:where(:nth-child(N))` 系24件と `&:where(.Panel .IsRev *)` は
  目的が不明瞭なため保持したまま。意図が判明すれば解除の要否を再判定できる
- !important の新規反転リスク2箇所（`_page-transition.scss`）は実害未確認だが要注意事項として記録

## 11. Phase 4 本採用後の実地検証（プリフライトのレイヤー化不可判明 → tw-preflight 方式へ再設計）

Phase 4（エントリ一本化・トグル撤去）実施後、ブラウザでの実地検証中に
「独自クラスのみレイヤー化し、プリフライトは非レイヤーのまま」という §2 の当初設計に
重大な欠陥が判明した。プリフライト（`ul{margin:0}` 等）が非レイヤーである限り、
レイヤー内の独自クラスは詳細度に関わらず必ず負けるため、独自クラスで
margin/padding 等を指定できなくなる。

検証の結果、Tailwind v3 が横取りする予約名は `base`/`components`/`utilities` の3つのみで、
それ以外の名前（`tw-preflight`）でプリフライトを包めば横取りされずネイティブレイヤーとして
残ることを `/tmp/twspike/` でのスパイクテストで確認。プリフライトを含む全独自レイヤーを
`tw-preflight, foundation, layout, component, project, utility` の順で並べる方式に再設計した
（詳細は [css-architecture.md](css-architecture.md) の「Tailwind CSS v3 との併用」節）。
`src/styles/foundation/_tailwind-base.scss` と `foundation/index.scss` を書き換えて実装済み。
`AGENTS.md`（本ディレクトリ）のレイヤー順記載もこの方式に同期済み。

### 発見・修正した実地不具合

- **InitialLoadingBoot SVG の表示崩れ**: 動的 `import()` によるCSS読み込み遅延と、
  React マウント処理（canvas 描画・boot 要素除去）のタイミング競合（FOUC）が原因。
  Phase 4 の静的 import 一本化で解消
- **ページトランジション時の白画面**: `src/components/LoadingLayer.tsx` にハードコードされていた
  `bg-[var(--WH)]` が、レイヤー化後は非レイヤーの Tailwind ユーティリティとして
  `_page-transition.scss`（project 層）側の `visibility: hidden` 解除だけでは消えなくなっていた。
  `LoadingLayer.tsx` からは `bg-[var(--WH)]` を削除し、本来この背景色が必要な
  `src/pages/Donut/VideoRingOverlay.tsx` 側の `<LoadingLayer>` 呼び出しにのみ付与する形で解決
- **tweakpane の変数上書き不可**: tweakpane が自身の `<style>` タグを非レイヤーで注入するため、
  project 層からの変数上書きが常に負ける。呼び出し元コンテナ（`Rects.tsx`）に
  tweakpane 公式フック名（`--tp-base-background-color` 等）の Tailwind arbitrary クラスを
  付与する方式で解決。`_tweakpane.scss` 側の変数直接宣言は削除しコメントで理由を明記

### TSX ハードコード Tailwind × CSS 上書きの反転パターン（要継続監視）

レイヤー化により、「TSX にハードコードされた Tailwind ユーティリティクラスを、
project/component 層の独自クラスで上書きする」という書き方は、非レイヤーの Tailwind が
常に勝つため機能しなくなる。上記の LoadingLayer の白背景がこの実例。

再発防止のため、`src/styles/object/project/*.scss` と `component/*.scss` の
`background-color`/`color`/`border-color` 宣言と、対応する TSX 側のハードコードクラスを
横断的に洗い出した。

- **衝突なしと確認済み**: `VideoRingOverlay.tsx`（修正済み移設先）、`Next.tsx` の
  フォーム input/textarea、`Glitch.tsx`、`FAQSection.tsx`/`IntroSection.tsx`（CustomClass 不使用の
  単体デモ）、`.btn`/`.textlink`/`.MindMapBtn`（該当ハードコードなし、または既に `!important` 対策済み）、
  `Header.tsx`/`HeaderCylinder.tsx`（ハードコード色クラスなし。`Next.tsx` 内の
  `.HeaderPagetop`/`.ThemeToggle` への `text-WH` 付与も CSS 側は子要素 `a`/`svg` 対象のため非衝突）
- **反転が実際に起きているが実害未確認**: `Top.tsx` の `.JsLetter.IsDeco`（グラデーション文字演出）に
  `bg-background/50` が併記されている。`.IsDeco` は `background` ショートハンドで
  `background-color: transparent` を暗黙に含むが、非レイヤーの `bg-background/50` がこの
  サブプロパティを上書きしてしまう。ただし `background-image`（グラデーション）自体は不透明で
  全面を覆うため、視覚的破綻は起きていない可能性が高い。ブラウザでの目視確認が必要
- **未着手**: `ShuffleDivide.tsx`（`text-[--TC]` という構文が正しくコンパイルされているか要確認）、
  `Bbox/*`, `Bunmyaku/*`, `Aozora.tsx` 等（`styles/object` 配下の13ファイル以外に専用CSSを
  持つ可能性が高く、別途調査が必要）
