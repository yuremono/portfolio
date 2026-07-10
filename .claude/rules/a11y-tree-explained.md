# a11yツリーと属性の考え方 — coding-style.md の補足解説

`coding-style.md` の「a11yツリーの考え方を採用」という記述について、
一般的な定義・仕様上の位置づけ・例示コードの妥当性を整理したドキュメント。

---

## 1. アクセシビリティツリーとは（一般的な考え方）

ブラウザは HTML から DOM ツリーを作るが、それとは別に
**アクセシビリティツリー（a11yツリー）** という並行構造を生成している。
スクリーンリーダー等の支援技術（AT）は DOM を直接読むのではなく、
OS のアクセシビリティ API を通じてこのツリーを読む。

a11yツリーの各ノードが持つ情報は主に4つ：

| 情報 | 内容 | 例 |
|------|------|-----|
| **Role（役割）** | その要素は「何」なのか | `heading`, `button`, `navigation` |
| **Name（名前）** | その要素を何と呼ぶか | ボタンのテキスト、`aria-label` の値 |
| **State（状態）** | 今どういう状態か（変化する） | `aria-expanded="true"`, checked |
| **Property（特性）** | 補足的な性質（基本変化しない） | `aria-level="2"`, `aria-describedby` |

「a11yツリーの考え方」とは要するに、
**見た目（CSS）ではなくツリー上の意味で要素を設計する**という発想。
「大きい太字のテキスト」ではなく「レベル2の見出し」としてツリーに載るように書く。

重要な性質：

- `<h2>` や `<button>` などのセマンティックな HTML 要素は、
  **何もしなくても暗黙のロールを持つ**（`<h2>` → `role="heading"` + `aria-level="2"` 相当）。
- `role` / `aria-*` は「ツリーに載る情報を上書き・補完する」ためだけの属性で、
  **挙動は一切変えない**（`role="button"` を付けてもクリックやキーボード操作は動かない。JSで自前実装が必要）。
- Chrome DevTools の Elements → Accessibility タブで、実際のツリーを確認できる。

---

## 2. `data-type` は一般的・推奨される属性か？

**a11y の文脈では No。** これが今回の質問の核心。

- `data-*` 属性（`data-id`, `data-type` など）は **アクセシビリティツリーに一切載らない**。
  スクリーンリーダーは `data-type="heading"` を完全に無視する。
- つまり coding-style.md の例にある `data-type="heading"` は
  「a11y準拠の属性」ではなく、**開発者・外部ツール・AI パーサー向けのメタデータ**。
- ARIA 仕様にも HTML 仕様にも `data-type` という定義済み属性は存在しない。
  誰かが自由に付けた名前にすぎない。

ただし「悪い」わけではない。役割が違うだけ：

| 属性 | 誰のためか | ツリーに載るか | 名前の自由度 |
|------|-----------|:---:|------|
| `data-*` | 自分のJS・CSS・外部ツール・AI | 載らない | **完全に自由**（`data-` 以降は好きに命名） |
| `role` | 支援技術 | 載る | **仕様で列挙された値のみ** |
| `aria-*` | 支援技術 | 載る | **仕様で定義された属性名のみ** |

このプロジェクトで `data-type` を使う目的（AIや外部ツールがパース時に
セクションの意味的種類を識別できるようにする）は正当な使い方だが、
それは「機械可読メタデータ」であって「アクセシビリティ対応」ではない、
という区別を持っておくとよい。

---

## 3. 「名前が決まっている属性」は定められているのか？

**Yes。ARIA は語彙（ボキャブラリー）が完全に固定された仕様。**
「こういう要素にはこういう属性、ただし名前は自由」ではない。

### role — 値が仕様で列挙されている

WAI-ARIA 仕様（現行 Recommendation は 1.2、1.3 はドラフト）が
使えるロール名をすべて列挙している。約80種類あり、それ以外の値は無効。

- ランドマーク系: `banner`, `navigation`, `main`, `contentinfo`, `search`, `region`
- ウィジェット系: `button`, `tab`, `dialog`, `slider`, `checkbox`
- 文書構造系: `heading`, `list`, `listitem`, `table`, `img`

`role="hero-section"` のような独自ロールは**書けない**（無効値として無視される）。

### aria-* — 属性名も、多くは値も固定

`aria-label`, `aria-level`, `aria-expanded`, `aria-hidden` など
約50個が仕様で定義済み。`aria-mytype="foo"` のような独自 aria 属性は無効。
さらに値の型も決まっている：

- `aria-expanded` → `true` / `false` のみ
- `aria-level` → 正の整数のみ
- `aria-label` → 自由テキスト（ここだけは中身が自由）

### さらに「ロールごとに使える aria-* の組み合わせ」も決まっている

ARIA は「役割（role）が、対応する状態・特性（aria-*）を規定する」構造。
例えば `aria-level` は `heading` などの限られたロールでのみ有効で、
`role="button"` に `aria-level` を付けても意味を成さない。
この対応表も仕様に明記されており、ESLint の `eslint-plugin-jsx-a11y` や
axe DevTools がこの整合性を機械チェックできる。

### まとめると

| 質問 | 答え |
|------|------|
| data属性は自由に命名していい？ | **Yes**（`data-` プレフィックスさえ守れば） |
| aria-label のように語彙が固定された属性群がある？ | **Yes**（role の値・aria-* の属性名はすべて仕様で列挙） |
| 「要素ごとに付ける属性は決まっているが名前は自由」？ | **No**。ARIA 側は名前も値も固定。自由なのは data-* 側だけ |

---

## 4. coding-style.md の例示コードの評価

```tsx
<div
  data-id="blk_abc123"
  data-type="heading"
  role="heading"
  aria-level="2"
  aria-label="ヒーローセクションのメイン見出し"
>
  <h2>Multi Agent</h2>
</div>
```

このコードは一般的なベストプラクティスから見ると**問題がある**。

1. **見出しの二重化**: 外側の div に `role="heading" aria-level="2"` を付けつつ、
   中に `<h2>` を入れている。a11yツリー上は「見出しの中に見出しがある」状態になり、
   スクリーンリーダーが見出しを2回アナウンスしたり、見出しジャンプ機能が混乱する。
2. **ARIA の第一原則違反**: W3C の "First Rule of ARIA" は
   「ネイティブ HTML 要素で表現できるなら role を使うな」。
   `<h2>` がある時点で `role="heading"` は不要どころか有害。
3. **aria-label による Name の上書き**: `aria-label` は要素の Name を**置き換える**。
   この例では視覚テキスト「Multi Agent」ではなく
   「ヒーローセクションのメイン見出し」と読み上げられ、
   見えている文字と聞こえる文字が食い違う（WCAG 2.5.3 Label in Name に抵触しうる）。
4. **実データとの裏付け**: WebAIM Million の調査では、
   ARIA を使っているページの方が使っていないページより検出エラーが平均70%多い。
   原因のほとんどが「不要・不正な ARIA の追加」。
   **"No ARIA is better than bad ARIA"** が業界の合言葉。

### 意図を活かした修正版

「AI・外部ツールが要素の意味的種類を識別できるようにしたい」という
このプロジェクトの意図は、data-* だけで達成できる：

```tsx
{/* 機械可読メタデータは data-*、a11y はネイティブ HTML に任せる */}
<div data-id="blk_abc123" data-type="heading">
  <h2>Multi Agent</h2>
</div>
```

- `<h2>` が暗黙に `role="heading"` + level 2 をツリーに提供する（ARIA 不要）
- `data-type` はツリーに載らないので支援技術の邪魔をしない
- AI・パーサーは従来どおり `data-type` で種類を識別できる

role / aria-* が本当に必要になるのは、**ネイティブ要素で表現できない**とき：

```tsx
{/* 例1: div で作ったタブ（本来 button 等がないケース） */}
<div role="tab" aria-selected={isActive} tabIndex={0}>設定</div>

{/* 例2: 同じ nav が複数あるとき区別のためのラベル */}
<nav aria-label="パンくずリスト">…</nav>

{/* 例3: アイコンだけのボタン（視覚テキストがない） */}
<button aria-label="メニューを開く"><svg …/></button>
```

---

## 5. 実務上の使い分け早見表

| やりたいこと | 使う属性 |
|------|------|
| JS・CSS・外部ツール・AI 用の目印やメタデータ | `data-*`（命名自由） |
| 要素の種類を支援技術に伝える | まずセマンティック HTML（`<h2>` `<button>` `<nav>`）。無理なら `role`（固定語彙） |
| 視覚テキストのない要素に名前を付ける | `aria-label` / `aria-labelledby` |
| 開閉・選択などの動的状態を伝える | `aria-expanded` / `aria-selected` 等（固定語彙）+ JS で同期を保つ |
| 装飾要素をツリーから隠す | `aria-hidden="true"` |
| 確認 | Chrome DevTools → Elements → Accessibility タブ |

---

## 参考資料（Sources）

- [WAI-ARIA 1.2 Recommendation（W3C・ロールと属性の正式な列挙）](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA 1.3 Editor's Draft（W3C）](https://w3c.github.io/aria/)
- [ARIA - MDN Web Docs（第一原則・アンチパターン解説）](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)
- [ARIA states and properties 一覧 - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes)
- [ARIA and HTML - web.dev（暗黙ロール・WebAIM Million の統計）](https://web.dev/learn/accessibility/aria-html)
- [data-* と aria-* の使い分け（LinkedIn 記事）](https://www.linkedin.com/advice/0/how-do-you-choose-between-data-attributes-aria-accessibility)
- [What the heck is an accessibility tree? - DEV Community](https://dev.to/miasalazar/what-the-heck-is-an-accessibility-tree-4e43)
