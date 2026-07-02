# ポートフォリオ RAG チャット 引き継ぎドキュメント

> **このファイル単体で完結する。** `portfolio-rag-spec.md` は「なぜその設計にしたか」という
> 背景・意思決定の理由を知りたいときだけ読めばよく、現在の状態把握や次の作業には不要。
> 以下は全て2026-07-03時点で実機確認済みの事実。

---

## 0. 30秒サマリ

個人ポートフォリオサイト(GitHub Pages公開中)に、自分についてのRAGチャットボットを追加する
プロジェクト。バックエンド(FastAPI on AWS App Runner)・埋め込み検索(sqlite-vec)・生成
(Bedrock Claude)は**完成し、実際に動いている**。フロントのチャットUIも実装済みでCloudFront
本番URL(独自ドメイン `https://portfolio.yuremono.com/`)で動作確認済み(最新のUI/文言も反映済み)。
フロント・バックエンドとも未コミット変更はコミット済み(`feat/rag-chat-aws`ブランチ、§3参照)。

**残っているのは主にRAGに入れるデータの拡充。独自ドメイン設定は完了した。**

**次にやるべきこと最優先3つ**:
1. 想定Q&A(`~/rag-data/portfolio-rag/entries/qa/`)が0件なので追加する(§4)
2. ユーザーによる本番動作テスト(`https://portfolio.yuremono.com/` でのチャット往復)。
   ただし直近の動作確認curlでレート制限(2問/2日)をほぼ消費済みの可能性あり(§8-2参照)
3. `main`ブランチへのマージ判断(現在`feat/rag-chat-aws`で作業中、§3参照)

---

## 1. 現在ライブなリソース(具体的な値)

### URL
| 何 | URL |
|---|---|
| 本番(現行, 無変更) | https://yuremono.github.io/portfolio/ |
| AWS移行先(ステージング, 動作確認済み) | https://d23red0h7e9403.cloudfront.net/ |
| AWS独自ドメイン(**設定完了・動作確認済み**) | https://portfolio.yuremono.com/ |
| バックエンドAPI | https://dhw9kinbuf.ap-northeast-1.awsapprunner.com (`/health`, `/ask`) |

### AWSアカウント/認証
- アカウントID: `883423420089`
- リージョン: `ap-northeast-1`(東京)。**例外**: Bedrock生成モデル(下記)は大阪(`ap-northeast-3`)の実体も使う
- CLI認証: このMacに `aws configure` 済み(IAMユーザー `claude-code-cli`, AdministratorAccess)。
  `aws sts get-caller-identity` で疎通確認可能。**新しいマシン/セッションでは認証情報の再設定が必要**
  (このドキュメントにキーは書かない。無ければユーザーに聞く)

### AWSリソース一覧(全て `Project: portfolio-rag` タグ付き、`aws resourcegroupstaggingapi get-resources --tag-filters Key=Project,Values=portfolio-rag` で一覧可能)

| リソース | 識別子 |
|---|---|
| ECRリポジトリ | `883423420089.dkr.ecr.ap-northeast-1.amazonaws.com/portfolio-rag`(tag: `latest`) |
| IAMロール(App Runner実行用、Bedrock呼び出し権限) | `portfolio-rag-apprunner-instance` |
| IAMロール(App Runner用、ECR pull権限) | `portfolio-rag-apprunner-ecr-access` |
| App Runnerサービス | 名前 `portfolio-rag` / ARN `arn:aws:apprunner:ap-northeast-1:883423420089:service/portfolio-rag/215329688cda4db0becb96a20aa25d6f` |
| App Runnerオートスケーリング設定 | `portfolio-rag-minimal`(min=max=1インスタンス固定、コスト予測可能にするため) |
| S3バケット(フロント静的ファイル) | `portfolio-rag-static-yuremono`(ap-northeast-1、パブリックアクセス全ブロック) |
| CloudFrontディストリビューション | ID `E2D4R9WB46DR05` |
| CloudFront OAC | ID `E2VWBGNQF5V48B` |
| ACM証明書(独自ドメイン用、**us-east-1固定**) | ARN `arn:aws:acm:us-east-1:883423420089:certificate/e3e1b2a8-a0c0-4301-aff6-884db93fc09f`(ドメイン `portfolio.yuremono.com`、DNS検証待ち。§8参照) |
| AWS Budget | 名前 `portfolio-rag-monthly`、月$20上限、50/80/100%で `5alvia0fficinali50@gmail.com` に通知 |
| CloudWatchロググループ | `/aws/apprunner/portfolio-rag/215329688cda4db0becb96a20aa25d6f/application`(アプリログ) |

### Bedrockモデル(ap-northeast-1で疎通確認済み)
- 埋め込み: `amazon.titan-embed-text-v2:0`(1024次元)
- 生成: `jp.anthropic.claude-sonnet-4-6`(推論プロファイルID。直接の `anthropic.claude-sonnet-5` はこのアカウント未解放)

---

## 2. ローカルのファイル配置

| 用途 | パス | Git |
|---|---|---|
| フロントエンド(このリポジトリ) | `/Users/yanoseiji/projects/0413portfolio` | GitHub Pagesへ公開中の本体 |
| バックエンド | `/Users/yanoseiji/projects/portfolio-rag-backend` | **ローカルのみ、リモート未設定、push禁止方針**(§6参照) |
| RAGソースデータ(個人の考え・Q&A・成果物のMarkdown) | `/Users/yanoseiji/rag-data/portfolio-rag/entries/` | **Gitリポジトリではない、ただのディレクトリ**(意図的。§6参照) |
| ビルド済みDB | `/Users/yanoseiji/rag-data/portfolio-rag/build/portfolio.db` | 同上、Git管理外 |
| チャットUIの参考実装(読み取り専用、流用元) | `/Users/yanoseiji/Desktop/0406agent-driven-CMS/app/components/DevEditorOverlay.jsx` | 別プロジェクト、編集しない |

### フロントエンドの主要ファイル
- `src/components/RagChat.tsx` — メッセージ一覧・入力欄・送信処理。`${import.meta.env.VITE_RAG_API_URL}/ask` を叩く
- `src/components/RagChatLauncher.tsx` — ヘッダー右端中央の円形トグルボタン + Popover APIによる中央表示パネル
- `src/pages/Top.tsx` — `<RagChatLauncher />` を `<HeaderCylinder />` の直後に配置(統合ポイント)
- `src/components/HeaderCylinder.tsx` — **変更していない**。Popoverパターンの参考元
- `src/scss/_03header.scss` — 末尾に `.RagChatLauncher` / `.RagChatPanel` / `.RagChatBubble` 等を追記。サイズは `var(--head)`(既存変数)を再利用
- `.env.local`(gitignore対象) — `VITE_RAG_API_URL=https://dhw9kinbuf.ap-northeast-1.awsapprunner.com`
- `vite.config.ts` 13行目 — `base: mode === "production" ? "/portfolio/" : "/"`(§6のハマりどころ参照)

### バックエンドの主要ファイル(`portfolio-rag-backend/`)
- `app/main.py` — `/ask` `/health` エンドポイント、Origin検証の呼び出し
- `app/config.py` — 全環境変数のデフォルト値(`ALLOWED_ORIGINS`, `DB_PATH`, `EMBED_MODEL_ID`, `GENERATE_MODEL_ID`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_DAYS`, `TOP_K`)
- `app/rate_limit.py` — `make_visitor_key()`, `try_consume_quota()`(アトミックなSQL UPDATE)
- `app/bedrock.py` — 埋め込み(`embed()`)と生成(`generate()`)のboto3呼び出し、システムプロンプト
- `app/db.py` — sqlite-vec接続・近傍検索
- `app/injection.py` — `looks_like_injection()`(既知パターン検知)
- `build/build_db.py` — `~/rag-data/portfolio-rag/entries/**/*.md` を読み、`visibility: private` を除外して埋め込み→DB生成
- `Dockerfile` — 8080番ポート、`data/portfolio.db` をCOPYする行あり(§6のハマりどころ参照)

---

## 3. ブランチ運用とコミット状況(2026-07-03時点)

- フロントエンド(`0413portfolio`): `main`はAWS移行前(GitHub Pages版)の状態を維持。RAGチャット
  UI一式・ドキュメント類は`feat/rag-chat-aws`ブランチにコミット済み(`main`へのマージは未実施、
  ユーザー判断待ち)。
- バックエンド(`portfolio-rag-backend`): 未コミットだった`Dockerfile`/`app/config.py`/
  `app/main.py`(複数オリジン許可対応)はコミット済み。リモート未設定・push禁止方針は継続。

---

## 4. 未実装・未対応チェックリスト

- [ ] **想定Q&A(`entries/qa/`)が0件。** 元の設計では「回答の質を決める最重要ゾーン」とされていた
      部分が未着手。`~/rag-data/portfolio-rag/entries/qa/` に `question`/`answer`/`source_url` の
      frontmatterを持つ `.md` を追加していく(既存の `career/` 等のファイルを参考にできる)。
- [ ] **「自分の考え」の未回答トピックが残っている**: グラフィックス系(WebGL/GLSL/Canvas/SVG)への
      関心、5年後の展望、チーム/後輩指導から得た学び、苦手なこと・伸ばしたいこと。
- [ ] **MCPサーバー化が未着手。** Claude Codeから同じ検索処理を呼べるようにする部分。現状は
      エージェントが `~/rag-data/portfolio-rag/entries/` を直接Read/grepする代替運用。
- [x] **独自ドメイン`portfolio.yuremono.com`のCloudFront割り当て完了(2026-07-03)。** ACM証明書
      発行・CloudFront Alternate Domain Name設定・App RunnerのALLOWED_ORIGIN追加まで完了。§8参照。
- [ ] **本番DNS切り替え(GitHub Pages→AWS)は未実施・未決定。** GitHub Pagesは現状のまま本番として
      維持する方針。AWS側は独自ドメイン設定後、ユーザーが動作テストを行った上で判断する。
- [ ] **WAFは未導入**(任意項目、レート制限強化用)。
- [ ] **プロンプトインジェクション対策の実攻撃的入力での検証が未実施。**
- [ ] **GitHub由来のprojectsチャンク(21件)が自動生成のまま本人未レビュー。**
- [ ] **private扱いの2エントリ**(求職活動の優先順位・希望年収)の公開可否が未確定。
- [ ] **企業名付きファイル**(0625recruit内のLIG/rhino/panorama/e-Mint/グレービートレイン/
      ノベルティ/fabrica/bookmarks.md/send.md)からの追加取り込みは意図的に保留中。

---

## 5. 「〇〇したい」→ どこを見る/どう変更するか 対応表

| やりたいこと | 参照/変更するファイル | 補足 |
|---|---|---|
| RAGに新しい情報を追加したい | `~/rag-data/portfolio-rag/entries/<career\|ai_view\|frontend\|projects\|qa>/*.md` を追加 | 追加後は §7 の「バックエンド再デプロイ手順」を実行しないとAWS側には反映されない(日常のClaude Code利用には即反映) |
| 特定のエントリを非公開(日常利用のみ)にしたい | frontmatterに `visibility: private` を追加 | `build_db.py` が自動的に除外する |
| レート制限の回数/期間を変えたい | `portfolio-rag-backend/app/config.py` の `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_DAYS` | ロジック自体は `app/rate_limit.py` |
| 許可するフロントのオリジンを追加/変更したい | App Runnerの環境変数 `ALLOWED_ORIGIN`(カンマ区切り) | `aws apprunner update-service` で変更、§7参照 |
| プロンプトインジェクション対策を強化したい | `portfolio-rag-backend/app/injection.py`(検知パターン)、`app/bedrock.py`(システムプロンプト文面) | |
| チャットUIの見た目・挙動を変えたい | `src/components/RagChat.tsx`(メッセージ/入力欄)、`RagChatLauncher.tsx`(ボタン位置・パネル開閉) | 参考実装: `/Users/yanoseiji/Desktop/0406agent-driven-CMS/app/components/DevEditorOverlay.jsx` |
| ヘッダーのボタンサイズ・配置を変えたい | `src/scss/_03header.scss` の `.RagChatLauncher` ブロック | `var(--head)` を流用している。新しい変数を作らない |
| 生成モデルを変更したい | `portfolio-rag-backend/app/config.py` の `GENERATE_MODEL_ID` | **IAMポリシー(`portfolio-rag-apprunner-instance`ロール)のResource ARNも要更新の可能性が高い**(§6参照) |
| 埋め込みモデルを変更したい | `config.py` の `EMBED_MODEL_ID` / `EMBED_DIM` | 変更したら `build_db.py` を再実行してDBを作り直す必要がある(次元数が変わるため) |
| コストを確認したい | `aws budgets describe-budget --account-id 883423420089 --budget-name portfolio-rag-monthly` | またはAWS Billingコンソール |
| バックエンドのエラーを調査したい | CloudWatch Logs `/aws/apprunner/portfolio-rag/215329688cda4db0becb96a20aa25d6f/application` | `rtk proxy aws logs tail <group> --region ap-northeast-1 --since 10m` (§6のrtk注意点参照) |
| なぜこの設計にしたか(背景)を知りたい | `portfolio-rag-spec.md` | **状態把握には不要、意思決定の理由を知りたい時だけ** |

---

## 6. 既知の落とし穴(ハマりどころ)

1. **Viteのbaseパス**: `vite.config.ts` は本番ビルドで `base: "/portfolio/"`(GitHub Pages用)固定。
   CloudFrontへデプロイする際は `npx vite build --base=/` のように明示しないと、JS/CSSが
   `/portfolio/assets/...` を探しに行き404→白画面になる。
2. **生成モデルはリージョンをまたぐ**: `jp.anthropic.claude-sonnet-4-6` は東京(ap-northeast-1)
   と大阪(ap-northeast-3)の両方の実体モデルにルーティングされる。IAMポリシーで片方だけ
   許可すると、片方に割り振られたリクエストだけ `AccessDeniedException` になる
   (`aws bedrock get-inference-profile --inference-profile-identifier <ID>` で実体ARNを確認できる)。
3. **App Runnerの `update-service` は必ずしも新イメージをpullし直さない**: ECRの同じタグ(`latest`)
   にpushし直しただけでは反映されないことがある。確実に反映させるには
   `aws apprunner start-deployment --service-arn <ARN>` を明示的に呼ぶ。
4. **DockerfileのDBコピーは手動ステップに依存**: `Dockerfile` の `COPY data/portfolio.db ...` は、
   事前に `cp ~/rag-data/portfolio-rag/build/portfolio.db portfolio-rag-backend/data/portfolio.db`
   を実行しておく前提。`data/*.db` は `.gitignore` 対象なので、リポジトリをcloneし直した直後は
   このファイルが存在せず、素の `docker build` は失敗する。
5. **DBには個人の考えが平文で入っている**: `chunks` テーブルに個人的な内容がそのまま入るため、
   `portfolio-rag-backend` リポジトリには絶対にコミットしない(`.gitignore`済みだが要注意)。
   このリポジトリ自体、意図的にGitHubへpushしていない。
6. **`rtk`コマンドラッパーがAWS CLIのJSON出力を型情報だけに置き換えることがある**
   (例: 実際の値の代わりに `"string[64]"` のような表示になる)。値そのものを確認したい時は
   `rtk proxy <実際のコマンド>` で生出力を取得すること。
7. **AWSアカウントの新規開設時の注意**(既に完了済みだが、同種の作業をする場合の参考):
   支払い方法の住所は半角英数字で統一しないと認証が失敗しやすい。日本のクレジットカードは
   「海外/オンライン取引」制限がオフの場合でも失敗することがあり、原因切り分けが難しい。
   Anthropicモデルは初回、Bedrockコンソールの「モデルアクセス」から利用ケース詳細フォームの
   提出が別途必要(申請後、反映まで数分程度)。

---

## 7. よく使うコマンド

### バックエンドの再ビルド・再デプロイ

OrbStack(Dockerデーモン)は常時起動しておく必要はない。**ビルド直前に自動起動し、
デプロイ完了後に閉じる**運用にする(AGENTS.md「RAGバックエンドのデプロイ」参照)。

```bash
open -a OrbStack
for i in $(seq 1 10); do docker info >/dev/null 2>&1 && break; sleep 3; done

cd /Users/yanoseiji/projects/portfolio-rag-backend
# RAGデータを更新した場合はまずDBを作り直す
python3 build/build_db.py   # 出力: ~/rag-data/portfolio-rag/build/portfolio.db
cp ~/rag-data/portfolio-rag/build/portfolio.db data/portfolio.db

docker build --platform linux/amd64 -t portfolio-rag:latest .
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 883423420089.dkr.ecr.ap-northeast-1.amazonaws.com
docker tag portfolio-rag:latest 883423420089.dkr.ecr.ap-northeast-1.amazonaws.com/portfolio-rag:latest
docker push 883423420089.dkr.ecr.ap-northeast-1.amazonaws.com/portfolio-rag:latest

# 確実に新イメージを反映させる
aws apprunner start-deployment --region ap-northeast-1 \
  --service-arn arn:aws:apprunner:ap-northeast-1:883423420089:service/portfolio-rag/215329688cda4db0becb96a20aa25d6f

# 動作確認が済んだらOrbStackを閉じる
osascript -e 'quit app "OrbStack"'
```

### フロントエンドの再ビルド・CloudFrontへの再デプロイ
```bash
cd /Users/yanoseiji/projects/0413portfolio
npx tsc -b && npx vite build --base=/
aws s3 sync dist/ s3://portfolio-rag-static-yuremono/ --delete
aws cloudfront create-invalidation --distribution-id E2D4R9WB46DR05 --paths "/*"
```
GitHub Pages側(`npm run build` を素で叩く分には `base: "/portfolio/"` のままでよく、
このリポジトリの既存デプロイ手順に影響しない)。

### 疎通確認
```bash
curl -s https://dhw9kinbuf.ap-northeast-1.awsapprunner.com/health
curl -s -X POST https://dhw9kinbuf.ap-northeast-1.awsapprunner.com/ask \
  -H "Content-Type: application/json" -H "Origin: https://d23red0h7e9403.cloudfront.net" \
  -d '{"question":"テスト"}'
```

### ログ確認
```bash
rtk proxy aws logs tail "/aws/apprunner/portfolio-rag/215329688cda4db0becb96a20aa25d6f/application" \
  --region ap-northeast-1 --since 10m --format short
```

---

## 8. 独自ドメイン設定(進行中)

CloudFrontのデフォルトドメイン(`d23red0h7e9403.cloudfront.net`)はAWSが自動割当するランダムIDで
任意の文字列に変更できないため、ユーザー所有の`yuremono.com`(Xサーバー管理)のサブドメイン
`portfolio.yuremono.com`をCloudFrontに割り当てる作業を進めている。

### 手順と現状
1. **(完了)** ACM証明書を`us-east-1`(CloudFrontはこのリージョン固定)でリクエスト済み。
   ARN: `arn:aws:acm:us-east-1:883423420089:certificate/e3e1b2a8-a0c0-4301-aff6-884db93fc09f`
2. **(ユーザー対応待ち)** 以下のCNAMEレコードをXサーバーのDNS管理画面に追加する必要がある
   (証明書のドメイン所有権検証用):
   - ホスト名: `_2923cef77288360f3d6350f5ebe3ff39.portfolio.yuremono.com.`
   - 値: `_662d69940322b3b5423dbcb1280292b6.jkddzztszm.acm-validations.aws.`
   - 検証状況確認コマンド:
     ```bash
     rtk proxy aws acm describe-certificate --region us-east-1 \
       --certificate-arn arn:aws:acm:us-east-1:883423420089:certificate/e3e1b2a8-a0c0-4301-aff6-884db93fc09f \
       --query "Certificate.Status" --output text
     ```
     `ISSUED`になれば検証完了。
3. **(未着手・検証完了後に実施)** CloudFrontディストリビューション(`E2D4R9WB46DR05`)に
   Alternate Domain Name(`portfolio.yuremono.com`)と発行済みACM証明書を設定する
   (`aws cloudfront update-distribution` でDistributionConfigの`Aliases`と`ViewerCertificate`を更新)。
4. **(未着手・手順3完了後にユーザー対応)** 最終的な公開用CNAMEレコードをXサーバーに追加する:
   - ホスト名: `portfolio.yuremono.com`
   - 値: `d23red0h7e9403.cloudfront.net`(CloudFrontの実ドメイン。手順3実施後も変わらない)
5. 反映確認後、`README.md`・本ドキュメント§0/§1の「設定進行中」表記を確定URLに更新する。

**(完了・2026-07-03)** 上記1〜4すべて完了。App RunnerのALLOWED_ORIGIN環境変数にも`https://portfolio.yuremono.com`を追加し、`aws apprunner update-service`で反映済み。

### 8-1. 動作確認中に見つかったBedrock Marketplace契約失効(解消済み)

独自ドメイン設定後の最終疎通確認で、`bedrock:InvokeModel`が
`AccessDeniedException: ... AWS Marketplace subscription for this model cannot be completed`
で失敗する問題が見つかった。IAMポリシー(§省略)は問題なく、
`aws bedrock get-foundation-model-availability`で`agreementAvailability.status: NOT_AVAILABLE`
になっていたことから、アカウントのMarketplace利用契約自体が外れていたと判明(原因不明、既存の
IAM権限やコードの変更とは無関係)。

復旧手順:
```bash
# 1. 契約オファーのトークンを取得
aws bedrock list-foundation-model-agreement-offers \
  --model-id anthropic.claude-sonnet-4-6 --region ap-northeast-1

# 2. offers[0].offerToken を使って契約を再承諾
aws bedrock create-foundation-model-agreement \
  --region ap-northeast-1 --model-id anthropic.claude-sonnet-4-6 \
  --offer-token "<offerToken>"

# 3. 復旧確認(ap-northeast-1 / ap-northeast-3 両方でAVAILABLEになればOK。
#    推論プロファイルが東京/大阪をまたぐため契約は両リージョンで確認すること)
aws bedrock get-foundation-model-availability --region ap-northeast-1 --model-id anthropic.claude-sonnet-4-6
aws bedrock get-foundation-model-availability --region ap-northeast-3 --model-id anthropic.claude-sonnet-4-6
```
料金体系(on-demand課金)は契約失効前と変わらず、再承諾で追加コストは発生しない。
今後同じ症状(`/ask`が原因不明の500エラーを返す)が出た場合、まずこれを疑うこと。

### 8-2. 注意: 動作確認のcurl実行がレート制限を消費している

本ドキュメントの§7「疎通確認」やユーザーの動作テストは同一ネットワーク(自宅IP)から行うため、
今回の作業中のcurlでの動作確認だけで訪問者レート制限(2問/2日)の大半〜全部を消費した可能性が高い。
ユーザーが実際にブラウザからチャットを試す際に即座に「質問の上限に達しました」と表示される場合、
バグではなくこれが原因。対応が必要な場合は`portfolio-rag-backend/app/config.py`の
`RATE_LIMIT_MAX`を一時的に増やしてApp Runnerへ反映するか、モバイル回線等の別ネットワークから
テストする。
