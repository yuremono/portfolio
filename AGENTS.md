# プロジェクト概要

個人の制作物をまとめるポートフォリオ。ページ編集や行動指針は`タスクレベル`に応じて柔軟に対応する。

## 技術スタック

- React 19 + Vite 7 + TypeScript 5.x
- スタイリング: Sass（CustomClass）+ Tailwind CSS **v3**（v4 は使わない）
- ルーティング: react-router-dom
- テスト: Vitest（happy-dom）
- 状態管理: React 組み込み + React Router

## コマンド

| コマンド | 用途 |
|---------|------|
| `npm run dev` | 開発サーバー（ポート **3000**） |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルドのプレビュー |
| `npm run lint` | ESLint |
| `npm test` | Vitest 一回実行 |

## 主要ディレクトリ・ファイル

| パス | 役割 |
|-----|------|
| [`STYLE.md`] | 設計思想・変数設計・Tailwind と CustomClass の役割分担 |
| [`CLASS.md`] | CustomClass のクラス指定・リファレンス |
| [`.claude/skills/Build/SKILL.md`] | `/Build` でのコンポーネント・ページ組み立てワークフロー |
| `src/components/` | UI（Cards, ImgText, Panel など CustomClass 対応） |
| `src/pages/` | ページ |
| `src/lib/` | 共有ロジック（直下）公開 API は [`src/lib/index.ts`](src/lib/index.ts) |
| `src/hooks/` | カスタムフック |
| `src/scss/` | スタイルエントリ・CustomClass 定義 |

## コーディング規約

- コンポーネントは関数コンポーネント + hooks
- Props型は `interface` で定義
- コンポーネント名は **PascalCase**、 `lib`,`utils` modules, custom hooks は **camelCase**、
- カスタムフックは `use` プレフィックス必須
- 新規のクラスや変数は作らない（ユーザーが作る）。
- 副作用は `useEffect` 等にまとめ、依存配列を正確に保つ。
- マークアップでは **a11y**（`role` / `aria-*` など）を意識する（`.claude/rules/coding-style.md`）

## CustomClass

ユーザーが`カスタムクラス`を使うと言ったら`STYLE.md`,`CLASS.md`を読む。
- 構造（section / Wrapper / コンポーネント相当）は **CustomClass** で組み、Tailwind v3 は装飾・微調整に使う。

## task Levels

セッション開始時、言われなければ `level 0`、言われたら以降継続する上書き式。

- Level 0: 最短でユーザーの要望をシンプルに解決する。最低限必要な情報のみを読み、複雑化しない。
- Level 1: `task-level-1` スキルを実行する。テストやタスクログの実行は禁止する。
- Level 2: `task-level-2`,`task-log` スキルを実行する。
- Level 3: `task-level-2`,`task-large` スキルを実行する。

## Execution rules

- あなたが実行した行動をユーザーに**誤った行動**だと指摘されたら、意図を論理的に整理して `tasks/learning.yaml` に追記する
- 外科的な変更: 既存コードを編集する際、**必要な部分だけ触る。自分の変更で出た問題だけ片付ける。**
- 初めて編集するファイルは、編集前に必ず内容を確認する。
- `.gitignore` に含まれるファイルを強制 push しない。publicで必要な場合は報告する
- 全ての色は`/src/scss/_01variables.scss`の`oklch`で書かれた既存変数を使用する。透明度は`{name}/50`,WH50などで指定。新規作成しない。見つけたら最も近い変数に置き換えてユーザーに報告する。
- 現環境ではcalc関数以外では [var(--{name})] ではなく [--{name}] を使用すること

## ブラウザ確認

- ブラウザでの見た目確認やスクリーンショット比較が必要なときは、`agent-browser` スキルを実行する。
- スクリーンショットはプロジェクト内の `tmp/browser-checks/` を既定の保存先とする。

## 禁止事項

<important if="creating or editing files">
- 調査・検討段階で作業を始めない（ユーザーの口調で判断）  
- いかなる識別子にもプロジェクト名を使用しない 
- 秘密情報やファイルパスのユーザー名を公開されるファイルに書かない
</important>

<important if="overwriting, deleting, or resetting">
- 調査・検討段階で作業を始めない（ユーザーの口調で判断） 
- 承認なしにコメントを削除しない
</important>

## 誤変換に注意

ユーザー発言に不自然な単語や文章があったら `voice-input-patterns.md` の確認や、追記を行うこと。