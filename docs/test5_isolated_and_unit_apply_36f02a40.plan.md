---
name: test5 isolated and UNIT apply
overview: Test5 を globals.scss / index.scss 非適用の独立エントリとして Vite マルチページ化し、並行して _10UNIT.scss を SCSS ネストと breakpoint mixin を保持したまま @apply でハイブリッド書き換えする。
todos:
  - id: phase1_mpa_setup
    content: vite.config.ts に rollupOptions.input を追加し、test5/index.html と test5/main.tsx を作成して /test5/ を独立エントリ化
    status: completed
  - id: phase1_tailwind_only_scss
    content: test5/tailwind-only.scss を新規作成（@tailwind base/components/utilities のみ）し test5/main.tsx から import
    status: completed
  - id: phase1_visual_check
    content: /test5/ を npm run dev で表示し、globals なしで Header/Footer/IntroSection/FAQSection がどう崩れるかスクリーンショットを取り、セクション <style> に追加すべき :root 変数と装飾クラスをリスト化
    status: completed
  - id: phase2_hero
    content: _10UNIT.scss .Hero ブロックをネストと mixin 保持まま @apply 化し /preview で視覚回帰確認
    status: completed
  - id: phase2_cards
    content: _10UNIT.scss .Cards と全 modifier (IsLayer/IsGrow/IsFix/IsIcon/IsRow/IsShift/IsSwipe 等) を @apply 化
    status: completed
  - id: phase2_panel_imgtext_flex
    content: _10UNIT.scss .Panel / .ImgText / .Flex* ブロックを @apply 化
    status: completed
  - id: phase2_toggle_stick_desclist
    content: _10UNIT.scss .Toggle / .Stick / .DescList ブロックを @apply 化
    status: completed
  - id: phase2_remainder
    content: _10UNIT.scss の残余ブロックを @apply 化し、全ページ (/preview /next /rects /shuffleDivide /glitch /agent /activity) で最終回帰確認
    status: completed
isProject: false
---

## 決定事項 (議論結果)

- `tailwind.config.js` に plugin を生やす方針は **撤回**。受け取り側に config 編集を強いない
- 装飾プリミティブ (`.BorderT` など) と `:root` 変数は **セクション `<style>` 同梱 or ページ集約 `<style>` 注入**で配布
- `intersection_show_in_tailwind` / `_09hover.scss` は **置換方向で合意** (別タスク継続)
- `registry_setup` は Phase 1 の独立エントリ検証でリアルな配布条件が見えてから着手

## Phase 1: /test5/ を独立 Vite エントリ化 (globals 非適用)

### 目的
registry を受け取った第三者の環境 (globals.scss / index.scss / Tailwind reset の一部が無い) に近い状態で Test5 を表示し、セクションの自己完結性を検証する。

### ファイル構成
- 新規 `test5/index.html` (ルート直下、既存 [index.html](index.html) と並列)
- 新規 `test5/main.tsx` — globals.scss / index.scss を **import しない**。Tailwind base だけは import する
- 新規 `test5/tailwind-only.scss` — `@tailwind base/components/utilities;` のみ (index.scss から reset を剥いだ最小版)
- [vite.config.ts](vite.config.ts) に `build.rollupOptions.input` を追加

```ts
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, 'index.html'),
      test5: path.resolve(__dirname, 'test5/index.html'),
    },
  },
},
```

### 動作確認観点
- `/test5/` で Test5 が描画される (dev / preview 両方)
- `Header` / `Footer` が globals なしでどの程度壊れるかを確認 → セクションに含めるべき CSS と除外すべき CSS の境界を実地で見る
- `:root` 変数 (`--MC/--PX/--MY/--head` 等) は [IntroSection.tsx](src/components/sections/IntroSection.tsx) / [FAQSection.tsx](src/components/sections/FAQSection.tsx) の `<style>` に同梱されているか確認。欠けていれば各セクション `<style>` に追記

### 既存 / を壊さない担保
- [src/main.tsx](src/main.tsx) と [src/App.tsx](src/App.tsx) は **無変更**
- [src/App.tsx](src/App.tsx) の `/test5` ルートはそのまま残す (SPA 内からのアクセスは従来通り globals あり)
- 独立検証は `/test5/` (末尾スラッシュ) からのみ

### 制約
- React Router `basename={import.meta.env.BASE_URL}` は本番で `/portfolio/` になるため、独立エントリ側は React Router を使わず Test5 単体レンダーにする (Header の内部リンクが崩れる可能性は残る。壊れた場合は Header を外すか、Header 内の Link を `<a>` に置換した検証版を作る)

## Phase 2: _10UNIT.scss ハイブリッド @apply 化

### 方針
- `:where(.ClassName)` / SCSS ネスト / `@include max-md` mixin は **保持**
- 置換するのは末端のプロパティ宣言のみ
- CSS 変数宣言 (`--itemW: 240px;`) はそのまま
- `calc()` / `var()` / `linear-gradient()` はそのまま

### 変換例 (Cards)

変換前:
```scss
:where(.Cards) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  .item {
    width: var(--itemW);
    margin-top: unset;
    img { width: 100%; }
  }
  &.IsFix {
    --itemW: 240px;
    justify-content: center;
    .item { width: var(--itemW); }
  }
  &.IsIcon {
    --iconW: 7.5em;
    @include max-md { --iconW: 5em; }
    figure { min-height: var(--iconW); align-content: center; }
  }
}
```

変換後:
```scss
:where(.Cards) {
  @apply flex flex-wrap gap-[--gap];
  .item {
    @apply w-[--itemW] mt-0;
    img { @apply w-full; }
  }
  &.IsFix {
    --itemW: 240px;
    @apply justify-center;
    .item { @apply w-[--itemW]; }
  }
  &.IsIcon {
    --iconW: 7.5em;
    @include max-md { --iconW: 5em; }
    figure { @apply min-h-[--iconW] content-center; }
  }
}
```

### 進め方 (ブロック単位で段階実施)

1159 行を 1 コミットで置換すると差分レビューが困難なので、セクション単位で PR サイズのチャンクに分ける。

- 2-1. `.Hero` (冒頭ブロック)
- 2-2. `.Cards` (全 modifier: `IsLayer / IsGrow / IsFix / IsIcon / IsRow / IsShift / IsSwipe` 等)
- 2-3. `.Panel` / `.ImgText` / `.Flex*`
- 2-4. `.Toggle` / `.Stick` / `.DescList` / `.Hero` 残り
- 2-5. その他残余ブロック

各ステップで:
- `npm run dev` で `/preview` `/next` `/rects` `/shuffleDivide` `/glitch` を目視回帰
- `_10UNIT.bak` ([src/scss/_10UNIT.bak](src/scss/_10UNIT.bak)) は保険として残置

### 既存規約との整合
- Tailwind arbitrary は `[--X]` 記法を使用 ([tasks/learning.yaml](tasks/learning.yaml) 20260415)
- `:where()` は優先度 0 なので `@apply` 展開後も優先度挙動は維持される
- `@apply` 内の順序は Tailwind 規約 (layout → spacing → typography → visual) にゆるく従う

### 得るもの / 失うもの
- Get: プロパティ値の Tailwind スケール統一。第三者が Tailwind の語彙で読める
- Lose: ビルド時間がわずかに増 (PostCSS `@apply` 解決コスト)
- 変わらない: HTML 側のクラス名 (`.Hero` `.Cards` 等は残る = CustomClass の本質は不変)

## 実施順序
1. Phase 1 (Vite マルチページ化) を先に完了 → `/test5/` で見え方を確認
2. Phase 1 の結果から、セクション `<style>` に追加すべき :root 変数 / 装飾クラスのリストを確定
3. Phase 2 (_10UNIT @apply 化) をブロック単位で実施

## 本プランで触らないもの
- [src/main.tsx](src/main.tsx) / [src/App.tsx](src/App.tsx) / 既存各ページ
- [tailwind.config.js](tailwind.config.js) (plugin 追加しない)
- `_09hover.scss` / `_08intersection.scss` (別タスク)
- shadcn registry 導入 ([tasks/20260421_tailwind_registry_migration.yaml](tasks/20260421_tailwind_registry_migration.yaml) の `registry_setup`)
