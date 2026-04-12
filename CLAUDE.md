# プロジェクト概要

`CustomClass`（`src/scss`）でレイアウト構造を組み、Tailwind CSS v3 で装飾・微調整する webページおよびアプリ。

## モード

現在のモード: **PRODUCTION**

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
| `src/lib/` | ユーティリティ |
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

## 行動原則

- 3ステップ以上のタスクは必ずPlanモードで開始する
- 動作を証明できるまでタスクを完了とマークしない
- 変更は必要な箇所のみ。影響範囲を最小化する
- **Read してから Write/Edit**: 初めて編集するファイルは編集する前に必ず内容を読む
- **Edit が失敗したら Write ツールで書換える** Edit ツールは LF 形式のファイルのみ対応（CRLF 形式だと編集失敗）
- **CI**: `.github/workflows/ci.yml` で `lint` → `test` → `build` を実行。
- コンテキストが残り少ない場合、その旨を伝えて区切りを提案する
- リサーチ・調査はサブエージェントに委譲してメインコンテキストを節約する

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