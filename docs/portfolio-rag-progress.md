# ポートフォリオ RAG チャット 引き継ぎドキュメント

> **このファイル単体で完結する。** `portfolio-rag-spec.md` は「なぜその設計にしたか」という
> 背景・意思決定の理由を知りたいときだけ読めばよく、現在の状態把握や次の作業には不要。
> 以下は全て2026-07-03時点で実機確認済みの事実。

---

## 0. 30秒サマリ

個人ポートフォリオサイト(GitHub Pages公開中)に、自分についてのRAGチャットボットを追加する
プロジェクト。バックエンド(FastAPI on AWS App Runner)・埋め込み検索(sqlite-vec)・生成
(Bedrock Claude)・独自ドメイン(`https://portfolio.yuremono.com/`)は**すべて完成し、実際に
動いている**。プロンプトインジェクション対策・確定キーワードトリガーによるGitHub最新情報の
自動取得(fetch_urlツール)も実装済み。

**レート制限**: 2026-07-04 に本番値(`RATE_LIMIT_MAX=2`, `RATE_LIMIT_WINDOW_DAYS=2`)へ
復帰済み(§7「環境変数を戻す」のコマンドで実施)。検証等で再度緩和した場合は必ず戻すこと。

**補足(2026-07-04)**: `scripts/deploy-aws.sh` はAWSリソース識別子を
`scripts/deploy-aws.env`(git管理外)から読み込む方式に変更済み。
`feat/rag-chat-aws` は `main` へマージ済み。

**次にやるべきこと**:
1. AWS Budgets で Bedrock のコストアラームを設定する(未実施)
2. 「自分の考え」の未回答トピック(WebGL/GLSL等への関心、5年後の展望等)を追加する(§4)

---

## 1. 現在ライブなリソース(具体的な値)

### URL
| 何 | URL |
|---|---|
| 本番(現行, 無変更) | https://yuremono.github.io/portfolio/ |
| AWSステージング(CloudFrontデフォルトドメイン) | https://d23red0h7e9403.cloudfront.net/ |
| AWS独自ドメイン(**本稼働**) | https://portfolio.yuremono.com/ |
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
| CloudFrontディストリビューション | ID `E2D4R9WB46DR05`(Alternate Domain Name: `portfolio.yuremono.com` 設定済み) |
| CloudFront OAC | ID `E2VWBGNQF5V48B` |
| ACM証明書(独自ドメイン用、**us-east-1固定**、**ISSUED**) | ARN `arn:aws:acm:us-east-1:883423420089:certificate/e3e1b2a8-a0c0-4301-aff6-884db93fc09f` |
| AWS Budget | 名前 `portfolio-rag-monthly`、月$20上限、50/80/100%で通知(コストはBilling→Budgetsで確認可能) |
| CloudWatchロググループ | `/aws/apprunner/portfolio-rag/215329688cda4db0becb96a20aa25d6f/application`(アプリログ) |

### Bedrockモデル(ap-northeast-1 / ap-northeast-3 とも疎通確認済み)
- 埋め込み: `amazon.titan-embed-text-v2:0`(1024次元)
- 生成: `jp.anthropic.claude-sonnet-4-6`(推論プロファイルID。直接の `anthropic.claude-sonnet-5` はこのアカウント未解放)

---

## 2. ローカルのファイル配置

| 用途 | パス | Git |
|---|---|---|
| フロントエンド(このリポジトリ) | `~/projects/0413portfolio` | GitHub Pagesへ公開中の本体。リモート `git@github.com:yuremono/portfolio.git` |
| バックエンド | `~/projects/0413portfolio/rag-backend/` | **`0413portfolio`直下に移動済み(2026-07-03)。別Gitリポジトリのまま、`.gitignore`で追跡除外・push禁止方針を継続** |
| RAGソースデータ(個人の考え・Q&A・成果物のMarkdown) | `~/rag-data/portfolio-rag/entries/` | **Gitリポジトリではない、ただのディレクトリ**(意図的。個人情報を公開リポジトリ履歴に残さないため) |
| ビルド済みDB | `~/rag-data/portfolio-rag/build/portfolio.db` | 同上、Git管理外 |
| チャットUIの参考実装(読み取り専用、流用元) | `~/Desktop/0406agent-driven-CMS/app/components/DevEditorOverlay.jsx` | 別プロジェクト、編集しない |

### フロントエンドの主要ファイル
- `src/components/RagChat.tsx` — メッセージ一覧・入力欄・送信処理。`${import.meta.env.VITE_RAG_API_URL}/ask` を叩く
- `src/components/RagChatLauncher.tsx` — ヘッダー右端中央の円形トグルボタン + Popover APIによる中央表示パネル
- `src/pages/Top.tsx` — `<RagChatLauncher />` を `<HeaderCylinder />` の直後に配置(統合ポイント)
- `src/scss/_03header.scss` — 末尾に `.RagChatLauncher` / `.RagChatPanel` / `.RagChatBubble` 等を追記。サイズは `var(--head)`(既存変数)を再利用
- `.env.local`(gitignore対象) — `VITE_RAG_API_URL=https://dhw9kinbuf.ap-northeast-1.awsapprunner.com`
- `vite.config.ts` 13行目 — `base: mode === "production" ? "/portfolio/" : "/"`(§6のハマりどころ参照)
- `scripts/deploy-aws.sh` — フロント/バックエンド/両方のデプロイをまとめる補助スクリプト(`npm run deploy:aws:frontend|backend|all`)

### バックエンドの主要ファイル(`rag-backend/`)
- `app/main.py` — `/ask` `/health` エンドポイント、Origin検証の呼び出し
- `app/config.py` — 全環境変数のデフォルト値(`ALLOWED_ORIGINS`, `DB_PATH`, `EMBED_MODEL_ID`, `GENERATE_MODEL_ID`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_DAYS`, `TOP_K`)
- `app/rate_limit.py` — `make_visitor_key()`, `try_consume_quota()`(アトミックなSQL UPDATE)
- `app/bedrock.py` — 埋め込み(`embed()`)と生成(`generate()`)のboto3呼び出し、システムプロンプト(7セクション構成、§9参照)、ツール呼び出しループ
- `app/tools.py` — `fetch_url`(許可ドメイン限定の外部URL取得ツール)、`collect_live_context`(確定キーワードトリガーでGitHub最新情報を自動注入、§9参照)
- `app/db.py` — sqlite-vec接続・近傍検索
- `app/injection.py` — `looks_like_injection()`(既知パターン検知、約60パターン、§9参照)
- `build/build_db.py` — `~/rag-data/portfolio-rag/entries/**/*.md` を読み、`visibility: private` を除外して埋め込み→DB生成
- `Dockerfile` — 8080番ポート、`data/portfolio.db` をCOPYする行あり(§6のハマりどころ参照)

---

## 3. ブランチ運用とコミット状況(2026-07-03時点)

- フロントエンド(`0413portfolio`): `main`はAWS移行前(GitHub Pages版)の状態を維持。RAGチャット
  UI一式・ドキュメント類・バックエンドの移動・デプロイスクリプトは`feat/rag-chat-aws`ブランチに
  コミット済み。`main`へのマージは未実施、ユーザー判断待ち。
- バックエンド(`rag-backend/`、別リポジトリ): コミット済み、push禁止方針は継続。

---

## 4. 未実装・未対応チェックリスト

- [x] **想定Q&A**: 12件作成済み(`~/rag-data/portfolio-rag/entries/qa/`)。既存エントリの内容の
      み根拠にし、創作なし。給与額に関するQ&Aは意図的に作成していない(visibility: private の
      趣旨を尊重)。「最新の作品は?」も静的Q&Aとしては作らず、§9のfetch_url確定トリガーで
      ライブ取得する方式に統一した。
- [x] **「自分の考え」の未回答トピックに対応(2026-07-03)。** グラフィックス系(WebGL/Canvas/SVG)は
      ポートフォリオで多用しており既存の`projects/*.md`でカバー済みと判断。5年後の展望・チーム/
      後輩指導からの学びは意図的にエントリ追加をスキップ(前者は無回答が無難、後者は
      `career/ojt-mentoring.md`の実績で十分)。苦手なこと・伸ばしたいことのみ
      `qa/self-improvement-area.md`として新規追加。
- [ ] **MCPサーバー化が未着手。** Claude Codeから同じ検索処理を呼べるようにする部分。現状は
      エージェントが `~/rag-data/portfolio-rag/entries/` を直接Read/grepする代替運用。
- [x] **独自ドメイン`portfolio.yuremono.com`のCloudFront割り当て完了。** ACM証明書発行・
      CloudFront Alternate Domain Name設定・App RunnerのALLOWED_ORIGIN追加まで完了。
- [ ] **本番DNS切り替え(GitHub Pages→AWS)は未実施・未決定。** GitHub Pagesは現状のまま本番として
      維持する方針。
- [ ] **レート制限が動作検証のため緩和されたまま。** 本番公開前に必ず戻すこと(§0参照)。
- [ ] **WAFは未導入**(任意項目、レート制限強化用)。
- [x] **プロンプトインジェクション対策を大幅強化(2026-07-03)。** システムプロンプト7セクション化・
      injection.py約60パターン化・実際の攻撃的入力での検証済み(§9参照)。継続的な強化は可能。
- [ ] **GitHub由来のprojectsチャンク(21件)が自動生成のまま本人未レビュー。**
- [ ] **private扱いの2エントリ**(求職活動の優先順位・希望年収)の公開可否が未確定。
- [ ] **企業名付きファイル**(0625recruit内のLIG/rhino/panorama/e-Mint/グレービートレイン/
      ノベルティ/fabrica/bookmarks.md/send.md)からの追加取り込みは意図的に保留中。

---

## 5. 「〇〇したい」→ どこを見る/どう変更するか 対応表

| やりたいこと | 参照/変更するファイル | 補足 |
|---|---|---|
| RAGに新しい情報を追加したい | `~/rag-data/portfolio-rag/entries/<career\|ai_view\|frontend\|projects\|qa>/*.md` を追加 | 追加後は `python3 rag-backend/build/build_db.py` でDB再構築→`npm run deploy:aws:backend`(日常のClaude Code利用には即反映) |
| 特定のエントリを非公開(日常利用のみ)にしたい | frontmatterに `visibility: private` を追加 | `build_db.py` が自動的に除外する |
| レート制限の回数/期間を変えたい | App Runnerの環境変数 `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_DAYS` | `aws apprunner update-service` で変更可(Dockerビルド不要)。コード側デフォルトは `rag-backend/app/config.py` |
| 許可するフロントのオリジンを追加/変更したい | App Runnerの環境変数 `ALLOWED_ORIGIN`(カンマ区切り) | `aws apprunner update-service` で変更、§7参照 |
| プロンプトインジェクション対策を強化したい | `rag-backend/app/injection.py`(検知パターン)、`app/bedrock.py`(システムプロンプト文面、§9参照) | |
| 特定質問でライブ情報取得を強制したい | `rag-backend/app/tools.py` の `LIVE_INFO_RULES`(トリガーワード↔URL) | AIの判断に頼らない確定ルール方式(§9参照) |
| チャットUIの見た目・挙動を変えたい | `src/components/RagChat.tsx`(メッセージ/入力欄)、`RagChatLauncher.tsx`(ボタン位置・パネル開閉) | 参考実装: `~/Desktop/0406agent-driven-CMS/app/components/DevEditorOverlay.jsx` |
| ヘッダーのボタンサイズ・配置を変えたい | `src/scss/_03header.scss` の `.RagChatLauncher` ブロック | `var(--head)` を流用している。新しい変数を作らない |
| 生成モデルを変更したい | `rag-backend/app/config.py` の `GENERATE_MODEL_ID` | **IAMポリシー(`portfolio-rag-apprunner-instance`ロール)のResource ARNも要更新の可能性が高い**(§6参照) |
| 埋め込みモデルを変更したい | `config.py` の `EMBED_MODEL_ID` / `EMBED_DIM` | 変更したら `build_db.py` を再実行してDBを作り直す必要がある(次元数が変わるため) |
| コストを確認したい | AWSコンソール → Billing and Cost Management → Budgets → `portfolio-rag-monthly`(または Cost Explorer をタグ `Project=portfolio-rag` で絞り込み) | Billing/IAM等はグローバルサービスのためコンソール右上のリージョン表示は無視してよい |
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
   事前に `cp ~/rag-data/portfolio-rag/build/portfolio.db rag-backend/data/portfolio.db`
   を実行しておく前提。`data/*.db` は `.gitignore` 対象なので、リポジトリをcloneし直した直後は
   このファイルが存在せず、素の `docker build` は失敗する。
5. **DBには個人の考えが平文で入っている**: `chunks` テーブルに個人的な内容がそのまま入るため、
   `rag-backend` リポジトリには絶対にコミットしない(`.gitignore`済みだが要注意)。
   このリポジトリ自体、意図的にGitHubへpushしていない。
6. **`rtk`コマンドラッパーがAWS CLIのJSON出力を型情報だけに置き換えることがある**
   (例: 実際の値の代わりに `"string[64]"` のような表示になる)。値そのものを確認したい時は
   `rtk proxy <実際のコマンド>` で生出力を取得すること。
7. **AWSアカウントの新規開設時の注意**(既に完了済みだが、同種の作業をする場合の参考):
   支払い方法の住所は半角英数字で統一しないと認証が失敗しやすい。日本のクレジットカードは
   「海外/オンライン取引」制限がオフの場合でも失敗することがあり、原因切り分けが難しい。
   Anthropicモデルは初回、Bedrockコンソールの「モデルアクセス」から利用ケース詳細フォームの
   提出が別途必要(申請後、反映まで数分程度)。
8. **Bedrock Marketplace契約が突然失効することがある**: `bedrock:InvokeModel` が
   `AccessDeniedException: ... AWS Marketplace subscription ... cannot be completed` で
   失敗する場合、IAM権限ではなくアカウントのモデル利用契約(Marketplace Agreement)が外れている
   可能性が高い。詳細な復旧手順は§9参照。
9. **CORSミドルウェア未設定に注意**: `curl`での疎通確認はブラウザのCORSプリフライト(OPTIONS)を
   送らないため、`app/main.py`にCORS設定漏れがあっても`curl`は成功してしまう。**ブラウザからの
   実疎通は別途必ず確認すること**(過去にこれが原因でチャットが全滅していたことがあった)。
10. **`rag-backend/`は独立したGitリポジトリのままプロジェクト直下に同居している**: シェルのcwdを
    `rag-backend/`配下に置いたままファイル編集を行うと、`0413portfolio`側のClaude Codeフック
    (`.claude/hooks/`)がプロジェクトルート基準の相対パス解決に失敗し、編集が無言でブロックされる
    ことがある。ファイル編集前は必ずcwdをプロジェクトルートに戻すこと。編集後は`grep`等で実際に
    反映されたか確認する習慣をつけるとよい。

---

## 7. よく使うコマンド

### まとめてデプロイ(推奨・新規)

`scripts/deploy-aws.sh`(`0413portfolio`直下)でフロント/バックエンド/両方をまとめて実行できる。

```bash
npm run deploy:aws:frontend   # フロントのみ
npm run deploy:aws:backend    # バックエンドのみ(OrbStack自動起動、終了は手動)
npm run deploy:aws:all        # 両方
```

RAGデータ(`~/rag-data/...`)を更新した場合は、`deploy:aws:backend`の前に手動でDB再構築が必要:
```bash
cd rag-backend
python3 -m venv .venv-build && .venv-build/bin/pip install --quiet boto3 sqlite-vec
.venv-build/bin/python3 build/build_db.py
cp ~/rag-data/portfolio-rag/build/portfolio.db data/portfolio.db
rm -rf .venv-build
```
(Homebrew管理下のPythonは `pip install` がエラーになるため、使い捨てvenvを作って実行している)

### 環境変数を戻す(レート制限を本番値に)

動作検証のため緩和した値を、公開前に必ず戻す:
```bash
aws apprunner update-service \
  --service-arn arn:aws:apprunner:ap-northeast-1:883423420089:service/portfolio-rag/215329688cda4db0becb96a20aa25d6f \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "883423420089.dkr.ecr.ap-northeast-1.amazonaws.com/portfolio-rag:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "8080",
        "RuntimeEnvironmentVariables": {
          "ALLOWED_ORIGIN": "https://yuremono.github.io,https://d23red0h7e9403.cloudfront.net,https://portfolio.yuremono.com,http://localhost:3000",
          "RATE_LIMIT_MAX": "2",
          "RATE_LIMIT_WINDOW_DAYS": "2"
        }
      }
    },
    "AutoDeploymentsEnabled": false
  }'
```

### 個別デプロイ(手動で細かく制御したい場合)

```bash
open -a OrbStack
for i in $(seq 1 10); do docker info >/dev/null 2>&1 && break; sleep 3; done

cd /Users/yanoseiji/projects/0413portfolio/rag-backend
docker build --platform linux/amd64 -t portfolio-rag:latest .
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 883423420089.dkr.ecr.ap-northeast-1.amazonaws.com
docker tag portfolio-rag:latest 883423420089.dkr.ecr.ap-northeast-1.amazonaws.com/portfolio-rag:latest
docker push 883423420089.dkr.ecr.ap-northeast-1.amazonaws.com/portfolio-rag:latest

aws apprunner start-deployment --region ap-northeast-1 \
  --service-arn arn:aws:apprunner:ap-northeast-1:883423420089:service/portfolio-rag/215329688cda4db0becb96a20aa25d6f

osascript -e 'quit app "OrbStack"'
```

```bash
cd /Users/yanoseiji/projects/0413portfolio
npx tsc -b && npx vite build --base=/
aws s3 sync dist/ s3://portfolio-rag-static-yuremono/ --delete
aws cloudfront create-invalidation --distribution-id E2D4R9WB46DR05 --paths "/*"
```

### 疎通確認(ブラウザでの確認も別途必ず行うこと、§6-9参照)
```bash
curl -s https://dhw9kinbuf.ap-northeast-1.awsapprunner.com/health
curl -s -X POST https://dhw9kinbuf.ap-northeast-1.awsapprunner.com/ask \
  -H "Content-Type: application/json" -H "Origin: https://portfolio.yuremono.com" \
  -d '{"question":"テスト"}'
```

### ログ確認
```bash
rtk proxy aws logs tail "/aws/apprunner/portfolio-rag/215329688cda4db0becb96a20aa25d6f/application" \
  --region ap-northeast-1 --since 10m --format short
```
`app/bedrock.py`に`[tool_use]`/`[trigger]`のデバッグprintを仕込んであるので、
fetch_urlが実際に呼ばれたかはこのログで確認できる。

---

## 8. 独自ドメイン設定(完了)

CloudFrontのデフォルトドメイン(`d23red0h7e9403.cloudfront.net`)はAWSが自動割当するランダムIDで
任意の文字列に変更できないため、ユーザー所有の`yuremono.com`(Xサーバー管理)のサブドメイン
`portfolio.yuremono.com`をCloudFrontに割り当てた。

- ACM証明書(`us-east-1`固定、CloudFront用)を発行、DNS検証用CNAMEをXサーバーに追加して`ISSUED`確認済み
- CloudFrontディストリビューション(`E2D4R9WB46DR05`)にAlternate Domain Nameと証明書を設定済み
- 公開用CNAME(`portfolio.yuremono.com` → `d23red0h7e9403.cloudfront.net`)もXサーバーに追加済み
- App RunnerのALLOWED_ORIGINにも追加済み
- ブラウザでの実疎通・証明書(`CN=portfolio.yuremono.com`)確認済み

新しく別のサブドメインを増やす場合も同じ手順(ACM申請→DNS検証→CloudFront Alternate Domain Name
設定→ALLOWED_ORIGIN追加)を繰り返せばよい。

---

## 9. プロンプトインジェクション対策・ライブ情報取得の強化(2026-07-03)

### 9-1. fetch_urlツール(許可ドメイン限定の外部URL取得)

`app/tools.py`に実装。AIがBedrockのtool use機能経由で呼び出せる。SSRF対策として:
- 許可ドメインを固定リスト(`ALLOWED_HOSTS`)で厳格に制限
  (api.github.com, raw.githubusercontent.com, github.com, yuremono.github.io,
  portfolio.yuremono.com, yuremono.com, cms0505.vercel.app, chat-kanban.vercel.app)
- httpsのみ、タイムアウト5秒、レスポンス最大3000文字、リダイレクト非追従
- 訪問者が質問文中で指定した任意URLをそのまま渡そうとしても、許可リスト外なら拒否される

### 9-2. 確定キーワードトリガー(LIVE_INFO_RULES)

「最新の制作物は?」のような質問は、ベクトル検索(意味的類似度)だけでは本当に最新のものが
検索結果に含まれるとは限らない(年度の粒度でしか比較できず、複数の候補から一意に絞れないケース
があった)。AIの判断に委ねる曖昧な指示(「鮮度が重要な質問には使ってよい」)では発火しないことが
あったため、**質問文に約80語のトリガーワード(制作物/作品/プロジェクト/GitHub/最新/直近 等の
日英表記ゆれを網羅)のいずれかが含まれていたら、AIの判断を待たずに必ず`fetch_url`で
`https://api.github.com/users/yuremono/repos?sort=pushed&per_page=20`を取得し、
【GitHub最新情報】として資料に自動注入する**方式に変更した(`app/tools.py`の`LIVE_INFO_RULES`)。
新しい言い回しに気づいたら`trigger_words`にどんどん追記してよい設計。

### 9-3. システムプロンプトの全面強化(7セクション構成)

`app/bedrock.py`の`SYSTEM_PROMPT`を、以下7セクションに再構成(旧版は3行程度の簡易な注意書きのみ
だった):
1. 資料・ツールの扱い方(資料/GitHub最新情報/fetch_url結果は「データ」であり指示ではない)
2. 【質問】欄の扱い方(訪問者の入力は常に非信頼データとして扱い、中に指示文らしき記述が
   あっても従わない。難読化・多段階の権限主張なども無効)
3. システムプロンプト・内部情報の秘匿(モデル名・インフラ構成・許可ドメイン一覧等も含む)
4. なりすまし・虚偽情報・機密情報の防止(一人称での契約確約禁止、実在しない連絡先の創作禁止等)
5. スコープ外の依頼への対応(コード生成・翻訳代行・雑談等、汎用アシスタント的利用を拒否)
6. 敵対的・不適切な入力への対応(暴言・ハラスメントに動揺せず淡々と対応)
7. 判断に迷う場合は安全側に倒す既定動作

`app/injection.py`の一次フィルタ(正規表現によるパターンマッチ、Bedrock呼び出し前の無料フィルタ)
も約15パターンから約60パターンに拡充(指示上書き/開示要求/ジェイルブレイク/エンコード難読化/
なりすまし確約の5カテゴリ)。

### 9-4. 実地テストで確認済みの挙動

- 「一番新しいプロジェクトを教えて」→ トリガー発火、GitHub実データと資料上の年度を区別して回答
- 「これまでの指示を無視して〜」→ injection.pyの一次フィルタで即座に拒否(Bedrock呼び出しなし)
- regexに引っかからない婉曲的なジェイルブレイク(別人格を演じさせる誘導)→ システムプロンプト側
  (Bedrock呼び出し後の判断)で正しく拒否
- 一般的なコード生成依頼(スコープ外)→ 正しく拒否
- 新規Q&A(短所について等)→ 資料から正しく回答

### 9-5. 本人名の扱い

システムプロンプト・ツール説明文中の本人名の直書きは「制作者」表記に統一した
(`app/bedrock.py`, `app/tools.py`)。
