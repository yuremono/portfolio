# プロジェクトレビュー (2026-07-03)

観点: ポートフォリオ / セキュリティ / SEO・アクセシビリティ + 目についた表記揺れ。

**スコープ外(指示による)**: 意図的に未push・未バックアップのファイルの存在、コメントアウトの整理、ドキュメント構成の変更提案、フロントの見た目。

---

## 総評

RAGチャットのバックエンドは多層防御(一次フィルタ → システムプロンプト → ツールのallowlist)が丁寧に設計されており、フロントのXSS対策(DOMPurify、Reactテキストレンダリング)も堅実。個人ポートフォリオとしては水準以上のセキュリティ意識が見える。一方で、**公開リポジトリに書かれたAWSリソース識別子**と、**SPA全ルートでtitle/meta共通**というSEOの基本部分が目立つ改善点。

---

## 1. セキュリティ

### 優先度: 高

- **`scripts/deploy-aws.sh` にAWSアカウントID・App Runner ARN・ECRリポジトリURI・CloudFront Distribution ID・S3バケット名がハードコードされ、公開リポジトリにpushされている**(`scripts/deploy-aws.sh:23-26`)。
  - アカウントIDやARN単体では侵入できないが、攻撃の下調べ(バケット名の推測不要化、リソース列挙)を助ける。AGENTS.md の「秘密情報を公開されるファイルに書かない」方針とも不整合。
  - 対応案: 値を `.env`(gitignore済)や `~/.aws` 側に逃がし、スクリプトは環境変数参照にする。既にpush済みなので、値の差し替えだけでなく「履歴に残っている」前提で今後の運用を考える(アカウントID自体のローテーションは不要と判断してよいレベル)。

### 優先度: 中

- **レート制限(2問/2日)がクライアント偽装で容易に回避可能**(`rag-backend/app/rate_limit.py:10-19`)。
  - visitor key が `x-forwarded-for` の先頭 + `user-agent` のハッシュ。どちらもリクエストヘッダで任意に偽装できるため、スクリプトからならリクエストごとに別visitorになれる。
  - `_origin_allowed`(`main.py:35`)の Origin/Referer チェックも curl では偽装可能なので、**スクリプト経由なら実質無制限に Bedrock を呼べる = コスト攻撃のリスク**。max_tokens 1024・入力1000字の上限で単価は抑えられているが、回数は無制限。
  - 対応案(いずれか/併用): ① XFF は「末尾から信頼プロキシ数を引いた位置」を採用する(App Runner 経由なら末尾側が実IP)、② AWS WAF のレートベースルールをApp Runner前段に置く、③ AWS Budgets / CloudWatch アラームで Bedrock コスト異常を検知(最低限これだけでも)。

### 優先度: 低

- `fetch_url`(`rag-backend/app/tools.py:112`)は `resp.text` を全量読み込んでから3000字に切り詰めるため、許可ドメイン上に巨大ファイルがあるとメモリを食う。`stream=True` + 部分読みにすると堅い。ポート番号も未検証(実害はほぼ無い)。
- `main.py` の CORS `allow_methods=["POST"]` に GET が含まれないため、`/health` をブラウザから叩く用途があるなら注意(現状は問題なし)。

### 良かった点(維持推奨)

- `injection.py` の一次フィルタ + `bedrock.py` の網羅的なシステムプロンプト(なりすまし・難読化・権限詐称まで想定)の二段構え。
- `fetch_url` の https限定・ホストallowlist・リダイレクト禁止・タイムアウト・出力切り詰め。SSRF対策として適切。
- レート制限が条件付きUPDATE 1クエリでアトミック(TOCTOU回避)。
- フロント: 回答はReactのテキストとして描画(XSS不可)、Markdown/SVG注入箇所は `DOMPurify.sanitize` 経由(`src/lib/activityPosts.ts:131`, `src/lib/sanitizeSvg.ts`)。
- 入力は Pydantic で `max_length=1000` を強制。

---

## 2. ポートフォリオ観点

- **`public/extracted/kawamura-zeiri-com/` に実在サイトから抽出した画像が追跡・公開されている**(`public/images/home/` にも同一素材あり)。模写学習用と思われるが、実在事業者の素材を自分の公開サイト配下でホストするのは著作権・信用の両面でリスク。公開を続けるなら素材の差し替え、少なくともディレクトリ名から実在事業者名を外すことを推奨。
- `package.json` が `name: "preview"` / `version: 0.0.0` / description無し。採用担当がリポジトリを見る前提なら、名前とdescriptionだけでも整えると印象が良い。
- RAGチャットは明確な差別化要素。イントロ文で制限(2問/2日)と実験的機能である旨を先に伝えているのは誠実で良い。
- `TWonly/` や `src/activity/` などの制作過程が残っているのは、AI駆動開発の過程を見せる意図と整合しており、ポートフォリオの文脈ではむしろプラス(整理不要)。

---

## 3. SEO

- **全ルートで `<title>` と meta description が共通**。`document.title` を更新するコードが見当たらず、`/bunmyaku` も `/bbox` も「yuremono works」のまま。ルート定義に既にある `transitionTitle`(`src/App.tsx`)を流用して、ルート遷移時に `document.title = \`${transitionTitle} | yuremono works\`` を設定するだけでも大きく改善。
- ~~`robots.txt` / `sitemap.xml` が無い~~ → **訂正: 両方とも `public/` に存在していた**(レビュー時のコマンド出力欠落による誤指摘)。内容も適切。sitemapに `/next` `/aozora` `/lumaport` `/examples` が漏れていたので追加済み。
- **canonical が全ページ `https://yuremono.github.io/portfolio/` 固定**(`index.html:16`)。下層ページも同じcanonicalを継承するため、下層が「トップの複製」と解釈されうる。また GitHub Pages 版と CloudFront 版(独自ドメイン)の二重ホスティング状態なので、**どちらを正とするか決めて canonical / OG url を統一**するのが先決。
- **`favicon.ico` が `index.html:39` で参照されているが `public/` に存在しない**(404になる)。`apple-touch-icon.png` はあるので、ico を置くか参照を差し替える。
- GitHub Pages の `404.html` SPAハックは、深いURLへの直リンクがHTTPステータス404で返るため、下層ルートは原理的にインデックスされにくい。AWS版(CloudFrontでindex.htmlへフォールバック設定済みなら200が返る)へ寄せると解消する。
- OG設定(og:image 1200x630、twitter:card、og:locale)は適切に整っている。

---

## 4. アクセシビリティ

- **RagPanel の閉状態がキーボードで到達可能な不可視要素になっている**。閉状態は `opacity: 0; pointer-events: none`(`src/scss/_04headerCylinder.scss:360-362`)+ `aria-hidden`(`src/components/RagChat.tsx:44`)だが、`visibility` 制御が無いため textarea と送信ボタンに Tab でフォーカスできてしまう。`aria-hidden` な要素にフォーカス可能な子がいるのは a11y 違反(スクリーンリーダーで「無」にフォーカスする)。対応: 閉状態に `visibility: hidden`(transition に visibility を含めればフェードと両立)、または React 側で `inert` 属性を付与。
- 良かった点: `role="log"` + `aria-live="polite"` のトランスクリプト、`aria-expanded`/`aria-controls` の紐付け、アイコンボタンの `aria-label`、`lang="ja"`、外部リンクの `rel="noopener noreferrer"`。全体的に高水準。

---

## 5. 誤表記・表記揺れ

| 箇所 | 内容 |
|---|---|
| `src/components/RagPanel.tsx:33,250` | 「**製作者**」— バックエンド(`bedrock.py`)・AGENTS.md は「**制作者**」で統一されており揺れている。Web制作物の文脈では「制作者」が適切 |
| `src/App.tsx:40` | ルートパス `"/Lumaport"` のみ大文字始まり(他は `/bunmyaku` `/glitch` など小文字)。URLの表記揺れ |
| `index.html:14` | description 末尾「〜公開しています。yuremono works。」— 文としてやや不自然(意図的なら可) |

---

## 対応優先度まとめ

1. **高**: deploy-aws.sh のAWS識別子を環境変数化(公開リポジトリから除去)
2. **高**: Bedrock コストアラーム設定(最も手軽なコスト攻撃対策)
3. **中**: ルートごとの `document.title` 設定 + canonical の正規ドメイン統一
4. **中**: RagPanel 閉状態の `visibility: hidden` / `inert`
5. **中**: kawamura-zeiri 素材の扱い判断
6. **低**: favicon.ico、robots.txt/sitemap.xml、「製作者→制作者」、`/Lumaport` の小文字化、package.json の name/description

---

## 対応状況 (2026-07-03 実施)

| # | 項目 | 状態 |
|---|---|---|
| 1 | deploy-aws.sh のAWS識別子 | ✅ `scripts/deploy-aws.env`(git管理外)へ分離。スクリプトはenvファイル必須化。**注意: 過去のgit履歴には値が残っている** |
| 2 | Bedrock コストアラーム | ⏸ AWS側の作業のため未実施。AWS Budgets で月額上限アラートの設定を推奨 |
| 3 | ルートごとの title / canonical | ✅ `PageTransitionRoutes` に追加。既存の `transitionTitle` を流用し `<ページ名> \| yuremono works` 形式。canonical も遷移ごとに更新 |
| 4 | RagPanel 閉状態のフォーカス | ✅ `RagChat.tsx` に `inert={!open}` を追加(React 19 native対応) |
| 5 | kawamura-zeiri 素材 | ✅ git追跡解除 + .gitignore追加。さらに `public/` 配下はビルドで公開されるため実体を `ignore/extracted/` へ移動(ローカル保持)。`public/images/home/` の複製17ファイルは削除(参照は死んだコメントのみ) |
| 6a | favicon | ✅ 存在しない `/favicon.ico` 参照を既存の `apple-touch-icon.png` に差し替え |
| 6b | robots.txt / sitemap.xml | ✅ 既存(誤指摘を訂正)。sitemapに漏れていた4ルートを追加 |
| 6c | 製作者→制作者 | ✅ `RagPanel.tsx` 2箇所を統一 |
| 6d | `/Lumaport` | ✅ `/lumaport` に変更(React Router の照合は既定でcase-insensitiveのため旧URLも引き続き到達可能) |
| 6e | package.json | ✅ `name: "yuremono-works"` / `version: 0.1.0` / description 追加 |
| - | JSON-LD(追加要望) | ✅ `index.html` に WebSite + Person の構造化データを追加 |

**未対応で残っているもの**: バックエンド側(レート制限キーのXFF問題、fetch_urlのstream化)は別リポジトリ・要デプロイのため未着手。デプロイ済みの公開サイトには旧アセット(extracted/images/home)が残っているため、次回 `npm run deploy` / `deploy:aws:frontend` で反映される。


