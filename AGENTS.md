# プロジェクト概要

個人の制作物をまとめるプロジェクト。

## 技術スタック

- React 19 + Vite 7 + TypeScript 5.x
- スタイリング: Sass（CustomClass）+ Tailwind CSS **v3**（v4 は使わない）
- ルーティング: react-router-dom
- テスト: Vitest（happy-dom）
- 状態管理: React 組み込み + React Router
- RAGチャットバックエンド(`rag-backend/`): Python 3.12 + FastAPI
- RAGチャットのAI: AWS Bedrock（生成: Claude Sonnet、埋め込み: Titan Embeddings）+ sqlite-vec
- ホスティング: フロント= S3 + CloudFront、RAGチャットバックエンド= AWS App Runner

## コマンド

### 開発

| コマンド | 用途 |
|---------|------|
| `npm run dev` | 開発サーバー（ポート **3000**） |
| `npm run dev -- --host 0.0.0.0` | スマホ確認 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルドのプレビュー |
| `npm run lint` | ESLint |
| `npm test` | Vitest 一回実行 |

### デプロイ

**重要: GitHub Pages(`npm run deploy`)は今後デプロイしない。** 本番はAWSに移行済みで、
GitHub Pagesは移行前の状態のまま凍結して保持する方針(誤って実行したら旧コミットへ force push で戻す)。

| コマンド | 用途 | 対象を変更した後に使う |
|---------|------|------|
| ~~`npm run deploy`~~ | GitHub Pages(**使用禁止・凍結中**) | 使わない(上記の重要事項参照) |
| `npm run deploy:aws:frontend` | S3 sync + CloudFront invalidation | フロントのコード/CSS(現行本番) |
| `npm run deploy:aws:backend` | Docker build → ECR push → App Runner deploy(OrbStack自動起動、終了は手動) | `rag-backend/app/*.py`、または`build_db.py`でDB再構築した後 |
| `npm run deploy:aws:all` | 上記frontend→backendを連続実行 | 両方を変更したとき |
| (npmスクリプト無し)`aws apprunner update-service` | 環境変数のみ更新、Dockerビルド不要 | レート制限値・CORS許可先(ALLOWED_ORIGIN)等のみ変更したとき。コマンド例は`portfolio-rag-progress.md`参照 |

RAGデータ(`~/rag-data/portfolio-rag/entries/`)を更新した場合は、`deploy:aws:backend`の前に
`rag-backend/build/build_db.py`でDB再構築が必要(詳細は`portfolio-rag-progress.md`)。

`deploy:aws:*` 系は、AWSリソース識別子(S3バケット名・ARN等)を定義した
`scripts/deploy-aws.env`(git管理外)が存在する前提で動く(無ければエラー終了)。

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

### 場所と管理方針

| 何 | 場所 | 備考 |
|---|---|---|
| バックエンド本体 | `rag-backend/` | `.gitignore` 別Gitリポジトリとして独立管理。**GitHubには絶対にpushしない方針** |
| RAGソースデータ・ビルド済みDB | `~/rag-data/portfolio-rag/` | - |

OrbStackは`deploy:aws:backend`実行時に自動起動されるので、完了確認後は手動で閉じる(`osascript -e 'quit app "OrbStack"'`)。

### コードの場所

| やりたいこと | 見るファイル |
|---|---|
| システムプロンプトを直す | `rag-backend/app/bedrock.py` |
| 外部URL取得ツール・確定トリガー(キーワード検知でGitHub最新情報を自動注入)を直す | `rag-backend/app/tools.py` |
| プロンプトインジェクションの一次フィルタパターンを直す | `rag-backend/app/injection.py` |

詳細な運用手順・AWSリソースの実値は `portfolio-rag-progress.md` を参照

## 禁止事項

<important if="creating or editing files">
- 調査・検討段階で作業を始めない（ユーザーの口調で判断）  
- いかなる識別子にもプロジェクト名を使用しない 
- 秘密情報やファイルパスのユーザー名を公開されるファイルに書かない
- 仕様系ドキュメントには「今の状態」だけを書く。「どこから移動した」
  「〜に統合済み」等の編集履歴・経緯のメモは残しておく必要がない。
  進捗ドキュメントは例外。
</important>

<important if="overwriting, deleting, or resetting">
- 調査・検討段階で作業を始めない（ユーザーの口調で判断） 
- コメントアウトされたコードはユーザーが**意図的に残しているので**作業に関連があっても削除しない。ファイル削除の指示がある場合は、その**意図**がないと判断し、削除してよい。
</important>

## 誤変換に注意

ユーザー発言に不自然な単語や文章があったら `voice-input-patterns.md` の確認や、追記を行うこと。
