# プロジェクト概要

`CustomClass`（`src/scss`）でレイアウト構造を組み、Tailwind CSS v3 で装飾・微調整する webページおよびアプリ。

## モード

現在のモード: **DEVELOPMENT**

| モード | 動作 |
|---|---|
| DEVELOPMENT | ドキュメント整備・システム設計を行う為、ユーザー指示に柔軟に従う |
| PRODUCTION | 本番運用。ユーザー指示に従い`ワークフロー`を実行する |

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
- 構造（section / Wrapper / コンポーネント相当）は **CustomClass** で組み、Tailwind v3 は装飾・微調整に使う。
- 新規のクラスや変数は作らない（ユーザーが作る）。
- 副作用は `useEffect` 等にまとめ、依存配列を正確に保つ。
- マークアップでは **a11y**（`role` / `aria-*` など）を意識する（`.claude/rules/coding-style.md`）。

## Execution Levels

調査、編集、検証、テストをそれぞれ独立した別々のstepとして定義する。

- 1step: 迷わず即実行
- 3step以上: `task-log` スキルを実行
- 5step以上: `task-large` スキルを実行
- 4step以下でも影響範囲が広い、設計判断が入るものは`task-large` スキルを実行

**報告はstepに含めない**

## Execution rules

- あなたが実行した行動をユーザーに**誤った行動**だと指摘されたら、論理的に意図を読み取って `tasks/learning.yaml` に追記する
- 部分的な修正は、周囲のコードを書き換えないように `apply_patch` のような差分ツールで最小差分を修正する。
- `app/api/*` は `runtime = "nodejs"` を維持し、app-server との接続はサーバー側で扱う。
- UI は既存の状態表示・承認フローを壊さずに拡張する。
- 初めて編集するファイルは、編集前に必ず内容を確認する。
- `tasks` ,`tmp` ディレクトリを github に push しない
- black,white以外の全ての色は`app/globals.scss`の`oklch`で書かれた既存変数を使用する。透明度もWH50などで指定可能。見つけたら最も近い変数に置き換えてユーザーに報告する。

## ブラウザ確認

- ブラウザでの見た目確認やスクリーンショット比較が必要なときは、`$agent-browser` スキルを使う。
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