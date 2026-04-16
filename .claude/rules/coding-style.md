---
paths: src/**/*.css, src/**/*.scss, src/**/*.sass, src/**/*.less, src/**/*.js, src/**/*.jsx, src/**/*.ts, src/**/*.tsx, src/**/*.vue, src/**/*.svelte, src/**/*.astro
---

# コーディングスタイル

## a11y（アクセシビリティ）
- **a11yツリー（アクセシビリティツリー）** の考え方を採用
- AIが理解しやすい属性（role, aria-*）を付与
- 要素を「意味のある部品」として扱う

```tsx
// 例: a11y準拠の属性
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
