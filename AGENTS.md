# プロジェクト概要

個人の制作物をまとめるプロジェクト。

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
| `npm run dev -- --host 0.0.0.0` | スマホ確認 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルドのプレビュー |
| `npm run lint` | ESLint |
| `npm test` | Vitest 一回実行 |

## 主要ディレクトリ・ファイル

| パス | 役割 |
|-----|------|
| `src/components/` | UI（Cards, ImgText, Panel など CustomClass 対応） |
| `src/pages/` | ページ |
| `src/lib/` | 共有ロジック（直下）公開 API は [`src/lib/index.ts`](src/lib/index.ts) |
| `src/hooks/` | カスタムフック |
| `src/scss/` | スタイルエントリ・CustomClass 定義 |

## コーディング規約

- コンポーネントは関数コンポーネント + hooks
- Props型は `interface` で定義
- コンポーネント名は **PascalCase**、 `lib`,`utils` modules, custom hooks は **camelCase**、
- 独自クラス名は **PascalCase**
- カスタムフックは `use` プレフィックス必須
- 新規のクラスや変数は作らない（ユーザーが作る）。
- 副作用は `useEffect` 等にまとめ、依存配列を正確に保つ。
- マークアップでは **a11y**（`role` / `aria-*` など）を意識する（`.claude/rules/coding-style.md`）

## CustomClass

ユーザーが`カスタムクラス`を使うと言ったら`STYLE.md`,`CLASS.md`を読む。
- 構造（section / Wrapper / コンポーネント相当）は **CustomClass** で組み、Tailwind v3 は装飾・微調整に使う。

## Execution rules

- あなたが実行した行動をユーザーに**誤った行動**だと指摘されたら、意図を論理的に整理して `tasks/learning.yaml` に追記する
- 外科的な変更: 既存コードを編集する際、**必要な部分だけ触る。自分の変更で出た問題だけ片付ける。**
- 初めて編集するファイルは、編集前に必ず内容を確認する。
- `.gitignore` に含まれるファイルを強制 push しない。publicで必要な場合は報告する
- 現環境ではcalc関数以外では [var(--{name})] ではなく [--{name}] を使用する。例: p-[--PX]
- 全ての色は`/src/scss/_01variables.scss`の`oklch`で書かれた既存変数を使用する。透明度は`{name}/50`,WH50などで指定。
例: `bg-MC`, `text-AC`,  `bg-background` 、透明度付きカラー指定: `MC/50` 
- 変数をそのまま使用するクラスが`/src/index.scss`に書かれているので優先的に使う(`wid PX BorderXY BGgrad`等)
- 確実に必要な場合以外、`overflow` プロパティを指定しない。`hidden` が必要に見える場合も、まず  `overflow-clip` / `overflow-x-clip` / `overflow-y-clip` を優先する。
- React コンポーネントを新規作成・編集するときは、外部から import して使う可能性があるコンポーネントに必ず `className?: string` を Props に含め、最外周のルート要素へ渡す。既定クラスがある場合は ` className={`ClassName ${className ?? ""}`}` で結合し、既定クラスがない場合もクラスを追加できる状態にしておく。実装前と完了前にこの項目を確認する。
- ユーザーの指示がないのに勝手に本ファイルを編集しない。
- ブラウザ確認、ビルド、テストをユーザーの指示がない時に実行しない。問題が生じた時に実行すれば良い。

## ブラウザ確認

- ブラウザでの見た目確認やスクリーンショット比較が必要なときは、`agent-browser` スキルまたは`computer-use`を実行する。
- スクリーンショットはプロジェクト内の `tmp/browser-checks/` を既定の保存先とする。

## RAGチャット(バックエンド `rag-backend/`)

- バックエンド本体は `rag-backend/`(このプロジェクト直下、`.gitignore`済み・GitHubには絶対にpushしない方針)。別Gitリポジトリとして独立管理している。
- RAGソースデータ・ビルド済みDBは `~/rag-data/portfolio-rag/`(Git管理外のただのディレクトリ)。
- **デプロイは変更対象で4パターン**(詳細はREADME.md「デプロイ」節、コマンドは `scripts/deploy-aws.sh` / `npm run deploy:aws:*`):
  1. フロントのみ変更 → `npm run deploy:aws:frontend`
  2. バックエンドのコードのみ変更 → `npm run deploy:aws:backend`
  3. RAGデータ(`~/rag-data/...`)を変更 → 先に `rag-backend/build/build_db.py` でDB再構築してから2と同じ手順(DBはコンテナに焼き込み式のため、コード変更なしでもビルド・デプロイをやり直す必要がある)
  4. 環境変数のみ(レート制限・CORS許可先等) → `aws apprunner update-service` を直接実行、Dockerビルド不要
- `rag-backend` のDockerビルド・pushが必要な時だけ、直前に `open -a OrbStack` でOrbStackを自動起動する。
- ビルド・push・デプロイ確認が完了したら、OrbStackを閉じる(`osascript -e 'quit app "OrbStack"'` 等)。開発中や通常のフロント編集では起動しない、常時起動もしない。
- **シェルのcwdに注意**: `rag-backend/` はそれ自体が独立したGitリポジトリ(`.git`あり)。cwdをそこに移動したままファイル編集を行うと、プロジェクトルート基準のhook(`.claude/hooks/`)がパス解決に失敗し編集がブロックされることがある。編集系の操作前は必ずプロジェクトルート(`0413portfolio/`直下)にcwdを戻すこと。
- システムプロンプト・プロンプトインジェクション対策・確定トリガー(キーワード検知でGitHub最新情報を自動注入する仕組み)は `rag-backend/app/bedrock.py` / `app/tools.py` / `app/injection.py` を参照。本人名は「制作者」表記に統一している。
- 詳細な手順・AWSリソースの実値は `portfolio-rag-progress.md` を参照(実パス・AWSアカウントIDを含むため`.gitignore`対象、リポジトリには含まれない)。

## 禁止事項

<important if="creating or editing files">
- 調査・検討段階で作業を始めない（ユーザーの口調で判断）  
- いかなる識別子にもプロジェクト名を使用しない 
- 秘密情報やファイルパスのユーザー名を公開されるファイルに書かない
</important>

<important if="overwriting, deleting, or resetting">
- 調査・検討段階で作業を始めない（ユーザーの口調で判断） 
- コメントアウトされたコードはユーザーが**意図的に残しているので**作業に関連があっても削除しない。ファイル削除の指示がある場合は、その**意図**がないと判断し、削除してよい。
</important>

## 誤変換に注意

ユーザー発言に不自然な単語や文章があったら `voice-input-patterns.md` の確認や、追記を行うこと。
