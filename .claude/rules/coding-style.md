---
paths: src/**/*.css, src/**/*.scss, src/**/*.sass, src/**/*.less, src/**/*.js, src/**/*.jsx, src/**/*.ts, src/**/*.tsx, src/**/*.vue, src/**/*.svelte, src/**/*.astro
---

# コーディングスタイル

## a11y（アクセシビリティ）
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

### 実務上の使い分け早見表

| やりたいこと | 使う属性 |
|------|------|
| JS・CSS・外部ツール・AI 用の目印やメタデータ | `data-*`（命名自由） |
| 要素の種類を支援技術に伝える | まずセマンティック HTML（`<h2>` `<button>` `<nav>`）。無理なら `role`（固定語彙） |
| 視覚テキストのない要素に名前を付ける | `aria-label` / `aria-labelledby` |
| 開閉・選択などの動的状態を伝える | `aria-expanded` / `aria-selected` 等（固定語彙）+ JS で同期を保つ |
| 装飾要素をツリーから隠す | `aria-hidden="true"` |
| 確認 | Chrome DevTools → Elements → Accessibility タブ |

## コメント記述ルール

エディター上で**コードを閉じた**時にコメントが見えるように、`{` のすぐ後に記述します。
`DOMContentLoaded` イベント内,、`forEach` のコールバック関数内などのコメントは、`{` の直後に続けて記述します。**改行しない**

```javascript

document.addEventListener('DOMContentLoaded', () => {// この位置が正しい
    document.querySelectorAll('.budoux').forEach(el => {// autoPhrase(文節改行)
        el.innerHTML = `<budoux-ja>${el.innerHTML}</budoux-ja>`;
    });
});

// この位置は間違い
document.addEventListener('DOMContentLoaded', () => {
    // この位置は間違い
    document.querySelectorAll('.budoux').forEach(el => {
        // この位置は間違い
        el.innerHTML = `<budoux-ja>${el.innerHTML}</budoux-ja>`;
    });
});
```

## コード品質チェックリスト
完了とする前に以下を確認してください：
- [ ] コードが読みやすく、命名が適切である
- [ ] 関数が小さい（50行未満）
- [ ] ファイルが1つの責務に集中している（800行未満）
- [ ] ネストが深すぎない（4階層以内）
- [ ] 適切なエラーハンドリングがなされている
- [ ] 不要な `console.log` が残っていない
- [ ] ハードコードされた値がない
- [ ] 不変性のパターンが守られている
