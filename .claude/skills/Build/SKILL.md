---
name: Build
description: |
  Creates components and assembles pages in one workflow. Use when the user runs `/Build` to implement CustomClass-based layouts, page composition, or Tailwind-allowed styling.
argument-hint: "[target_file] [section_spec...] [tailwind: none|partial|full]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
disable-model-invocation: true
hooks:
  TaskCompleted:
    - hooks:
        - type: agent
          prompt: |
            Review the files you created or edited against the checklist below. Return only JSON in the form {"ok": true} or {"ok": false, "reason": "Specific problem"}.

            Check the following:
            1. All structures are created using CustomClass /`src/scss` and are not built solely with Tailwind.
            2. The component name matches the CustomClass name, or the element name if no class definition exists.
            3. `text-*` is not used without permission.
            4. `[...]` is not used to overwrite variables without permission.
            5. Colors not defined in the variables are not used.

            $ARGUMENTS
          timeout: 60
---

# Build

`$ARGUMENTS` から CustomClass コンポーネントを作成し、ページを構成します。

---

## 前提条件

最初に読むこと:
1. @STYLE.md
2. @CLASS.md

---

<important if="creating components or building pages">

## 制限事項

1. 構造 section, Wrapper, Component は Tailwind ではなく CustomClass で作る。
2. 新しい CSS クラス名を勝手に作らない。既存の CustomClass のみを使う。
3. 明確な指示なしに `text-*` や装飾色を追加しない。
4. 許可なく `[...]` で CSS 変数を上書きしない。
5. `text-[#...]` で色を勝手に作らず、定義済みのトークンを使う。

</important>

---

## 音声入力の解析

ユーザーは音声入力を多用するため、`$ARGUMENTS` に誤変換が含まれる可能性があります。

1. **文脈推論**: 単語単体ではなく全体の文脈から判断する
2. **類似音候補**: BYOS 文脈で最も妥当な解釈を選択する
3. **不明時は質問**: 作業を一時停止して`AskUserQuestion` ツールを使用する

変換パターンは [voice-input-patterns.md](../../../voice-input-patterns.md) を参照。

---

## 参照ファイル

| ファイル | 読むタイミング |
|----------|----------------|
| [references/conversion.md](./references/conversion.md) | 音声入力による指示の解釈に迷った時 |
| [references/scss-structure.md](./references/scss-structure.md) | CustomClass の内容を確認する必要を感じた時 |
| [references/templates.md](./references/templates.md) | インポート文や CustomClass 使用例が必要な時 |
| [references/checklist.md](./references/checklist.md) | 完了前チェックを確認する時 |

---

## Tailwind permission level

| level | description | user prompt example |
|--------|------|---------------|
| `partial` | 指示に含まれるクラスのみ使用可能 | "Tailwind でマージン追加", "p-4 をつけておいて" |
| `full` | Tailwind 全面許可。装飾・調整に自由に使用可能 | "Tailwindで自由に装飾して", "〇〇を参考に装飾はお任せ" |

### if="tailwind: partial"
<important if="tailwind: partial">
- Do not use other Tailwind classes
- Do not arbitrarily add color to the text or background.
</important>

### if="tailwind: full"
<important if="tailwind: full">
- Actively use the Tailwind class.
- **Follow the project's color tokens.** Do not create `text-[#...]`.
- Variables can be overwritten with the `[...]` class.
</important>

---

## 実装ステップ

### 1. ユーザー指示の解析

`$ARGUMENTS` から抽出:
- 対象ファイル（既存ページまたは新規）
- CustomClass、Modifier Class、Value Class、セクション構成
- Tailwind/装飾が明示的に言及されているか

### 2. 既存コンポーネントの確認

- `src/components/*.tsx` を確認。存在すれば使用。
- ない場合、Wrapper/Effect で十分か判断、または CustomClass スキルを参照してコンポーネント作成。

### 3. Examples ページの確認

**必ず `src/pages/Examples.tsx` を閲覧し、CustomClass の使用例を確認する。**

- Examples ページは Build スキル向けの参照実装として用意されている
- 他のページ（Test, Test2 等）は参照しない
- Tailwind なしで見た目が整う最低限の構成を確認する

### 4. 画像の準備

指示なしなら `/images/picsum` 画像を使用する。

新規作成が必要なときだけ次を実行する:
```bash
./scripts/download-image.sh 600 400
```
保存先は `public/images/picsum/{seq}.jpg`

### 5. ページ構築 (JSX)

```tsx
<section className="">
  {/* Content */}
</section>
```

### 6. Tailwind 全面許可（装飾/微調整）

全面許可でも、**構造は CustomClass で定義されているものを必ず使う**。

---

## 完了前確認

最終確認は [references/checklist.md](./references/checklist.md) を使う。
TaskCompleted フックでも同じ基準を機械的に確認し、1 つでも不明点があれば完了扱いにしない。

### 7. （オプション）ブラウザ確認

ユーザーが要求した場合のみ。

---

## CustomClass コンポーネントの命名

`src/components` に**2つ目以降を**追加する場合:

- **親**: `{ClassName}{N}` 例: `Panel2`
- **子**: `{ClassName}{N}{Sub}` 例: `Panel2Item`
- **N**: 1桁の連番（2-9）

Tailwindで大きく異なる装飾をした場合は新規作成する。**一つ目のCustomClassComponentは番号{N}をつけない。**

---

## インポートテンプレート

インポートパターンは [references/templates.md](./references/templates.md) を参照。
