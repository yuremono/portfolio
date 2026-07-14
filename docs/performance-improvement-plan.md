# パフォーマンス改善計画（portfolio.yuremono.com）

計測日: 2026-07-14 / 計測方法: Lighthouse 13 (desktop preset, headless Chrome, ローカル実行)
※ PageSpeed Insights の API 無料枠が当日上限に達していたため、同条件のローカル Lighthouse で計測。

## 現状のスコアとメトリクス（Desktop）

| メトリクス | 実測値 | 評価 |
|---|---|---|
| Performance スコア | **71** | 要改善 |
| FCP (First Contentful Paint) | 2.0 s | score 0.30 |
| LCP (Largest Contentful Paint) | 2.1 s | score 0.60 |
| Speed Index | **3.4 s** | score 0.17（最も悪い） |
| TBT (Total Blocking Time) | 170 ms | score 0.86 |
| CLS | 0.013 | score 1.0（問題なし） |

CLS は完璧、TBT もほぼ問題なし。**スコアを落としているのは「初期表示の速さ」系
（FCP / LCP / Speed Index）に集中している。**
これはローディング演出・FV動画・Webフォントなど、意図的なデザイン要素と密接に
絡んでいるため、以下では「演出を維持したまま可能な改善」と
「演出とのトレードオフになる改善」を分けて記載する。

---

## 課題一覧（優先度順）

### 1. 【最優先・演出に影響なし】Cache-Control ヘッダーが全アセットで未設定

**Lighthouse 指摘**: cache-insight score 0 / 推定節約 **7,156 KiB**

現状、S3 配信の全ファイル（JS / CSS / 動画 / 画像）に `Cache-Control` が付与されて
おらず、リピート訪問でも毎回フル再ダウンロードになっている。
`scripts/deploy-aws.sh` の `aws s3 sync dist/ ... --delete` が
キャッシュヘッダーなしで一括同期しているのが原因。

**改善案**: デプロイスクリプトの sync を分割し、コンテンツハッシュ付きアセットには
immutable、HTML には no-cache を付ける。

```bash
# 1) ハッシュ付きアセット（/assets/*）: 1年 + immutable
aws s3 sync dist/assets/ "s3://${S3_BUCKET}/assets/" --delete \
  --cache-control "public,max-age=31536000,immutable"

# 2) 動画・画像などの静的メディア: 30日程度
aws s3 sync dist/video/ "s3://${S3_BUCKET}/video/" --delete \
  --cache-control "public,max-age=2592000"
aws s3 sync dist/images/ "s3://${S3_BUCKET}/images/" --delete \
  --cache-control "public,max-age=2592000"

# 3) HTML・それ以外: 常に再検証
aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete \
  --exclude "assets/*" --exclude "video/*" --exclude "images/*" \
  --cache-control "no-cache"
```

- 効果: リピート訪問の体感速度が劇的に改善。CloudFront のエッジキャッシュ効率も向上
- リスク: ほぼゼロ（Vite のアセットはハッシュ付きファイル名なので immutable が安全）
- 工数: 小（deploy-aws.sh の修正のみ。コード変更・再ビルド不要）

### 2. 【高優先】FV 動画が合計 18.5 MB（frontend.mp4 単体で 6.9 MB）

**Lighthouse 指摘**: total-byte-weight score 0.5 / 総転送量 7,838 KiB
（うち `video/frontend.mp4` が 6,880 KiB で 88% を占める）

`src/pages/Top.tsx` の FV には 3 本の動画がある:

| ファイル | サイズ |
|---|---|
| coding.mp4 | 6.9 MB |
| design.mp4 | 4.6 MB |
| frontend.mp4 | 6.9 MB |

`preload="none"` は指定済みだが、計測トレースでは frontend.mp4 が初期ロード中に
フルダウンロードされている。JS 側での `play()` 呼び出し等で preload 指定が
実質無効化されている可能性が高い。

**改善案（演出を維持したまま可能）**:

1. **再エンコードで 1 本 1〜1.5 MB 程度に圧縮**（最も効果大）
   - 背景演出用途なので画質要件は低い。解像度を 1280×720 に落とし、
     CRF を上げる（H.264 なら crf 28〜32、可能なら H.265/VP9/AV1 で更に半減）
   - 例: `ffmpeg -i frontend.mp4 -vf scale=1280:-2 -c:v libx264 -crf 30 -preset slow -an -movflags +faststart frontend_opt.mp4`
   - 音声トラックが残っていれば `-an` で除去（muted 再生なので不要）
2. **表示中の 1 本だけ読み込む**: 3 本同時にマウントせず、アクティブな動画のみ
   `src` をセットする（MindMap の切り替えタイミングでスワップ）
3. **`poster` 属性の追加**: 動画ロード完了までの見た目を軽量な静止画で担保

- 効果: 総転送量が 7.8 MB → 2 MB 前後まで削減見込み。モバイル回線での体感が大幅改善
- リスク: 再エンコードによる画質劣化（背景用途なら許容範囲を目視確認）
- 工数: 中（ffmpeg 再エンコード + Top.tsx の軽微な変更）

### 3. 【高優先】Google Fonts が 3 系統に分散・重複読み込み

**Lighthouse 指摘**: unused-css-rules score 0（推定 267 KiB）、
unminified-css（24 KiB）— いずれも大半が Google Fonts の CSS

現在、フォント CSS のリクエストが 3 本走っている:

| 読み込み元 | フォント | 問題 |
|---|---|---|
| `index.html` (link) | Jost, Viaoda Libre | — |
| `src/scss/_01variables.scss` の `@import url(...)` | Jost, **Noto Serif JP 200..900 全域**, Shippori Mincho ×4, Viaoda Libre | Jost / Viaoda が **重複**。CSS 内 `@import` は CSS 到着後に発火するため**レンダーブロッキングの直列チェーン**になる |
| `src/scss/Next.scss` の `@import url(...)` | Jost, Zen Kaku Gothic New ×3 | Jost が重複。トップページでは **100% 未使用**（Lighthouse 判定） |

**改善案**:

1. **CSS 内 `@import url(...)` を廃止し、`index.html` の `<link>` 1 本に統合する**
   （直列チェーン解消。preconnect は設定済みなので効果が出やすい）
2. **ウェイト指定を実使用分に絞る**: 特に Noto Serif JP `wght@200..900`（可変全域）は
   フォント CSS ~152 KiB の主因。実際に使うウェイトのみ列挙する
3. Next ページ専用フォント（Zen Kaku Gothic New）は Next 系ルートに入った時のみ
   動的に `<link>` 追加する運用も検討（トップの初期ロードから除外）
4. 中期的には `@fontsource` 系でのセルフホストも選択肢
   （`@fontsource-variable/geist` の導入実績あり。fonts.googleapis.com への
   接続往復自体を消せる）

- 効果: FCP / Speed Index の改善（レンダーブロッキングチェーン解消）、CSS 転送 ~240 KiB 削減
- リスク: ウェイトを絞りすぎると合成太字が発生。使用ウェイトの棚卸しが必要
- 工数: 小〜中

### 4. 【要判断・演出とのトレードオフ】初回ローディング演出が FCP / Speed Index を直撃

FCP 2.0 s / Speed Index 3.4 s の構造的な要因は
`InitialLoadingOverlay`（`src/components/InitialLoadingOverlay.tsx`）:

- `--initial-loading-min`（デフォルト **1000 ms**）の最低表示時間
- アンカー要素の出現待ち（最大 1000 ms のタイムアウト）+ Canvas 用フォントロード待ち
- その後にモザイク reveal アニメーション（`--pageTR` ベース）

つまり「コンテンツは用意できているのに、演出として最低 1 秒 + α 隠している」状態で、
Lighthouse はこれをそのまま「表示が遅い」と評価する。
**これは意図した演出なので、削除ではなく緩和の選択肢を提示する**:

| 選択肢 | 内容 | スコア効果 | 演出への影響 |
|---|---|---|---|
| A | `--initial-loading-min` を 1000ms → 400〜600ms に短縮 | 中 | 小（テンポが速くなるだけ） |
| B | オーバーレイの背後でメインコンテンツを先に描画させ、LCP 要素がオーバーレイ外で計測されるようにする（現在 body に `SiteTransitionPending` を付けて描画を保留している部分の見直し） | 大 | なし〜小 |
| C | 演出は現状維持し、スコアより体験を優先すると割り切る | なし | なし |

すでに sessionStorage で「初回のみ表示」になっている点は良い設計
（ただし Lighthouse は毎回クリーンセッションなので計測には毎回かかる）。

- 推奨: まず A + B の併用を検証。演出のテンポ感は実機で目視確認してから決める
- 工数: A は極小、B は中（描画保留ロジックの調整とデグレ確認）

### 5. 【中優先】three.js / maskMosaique チャンクの初期ロード負荷

**Lighthouse 指摘**: bootup-time score 0（JS 実行 1.4 s）、
mainthread-work-breakdown score 0（メインスレッド 2.6 s）

| チャンク | 転送量 | メインスレッド占有 |
|---|---|---|
| `maskMosaique-*.js`（modulepreload 済み） | 73 KiB gz | **1,524 ms**（scripting 959 ms） |
| `react-three-fiber.esm-*.js` | 48 KiB gz | 507 ms |
| `three.module-*.js` | 176 KiB raw（**55% 未使用**） | — |

maskMosaique（ページ遷移・初回ローディングのモザイク演出）が index.html から
modulepreload され、初期の JS 実行時間の主因になっている。
three.js 系は `HeaderCylinder` 等の 3D 表現で使用。

**改善案**:

1. **maskMosaique の初期化コストを調査・分割する**: 演出発火前に 1 秒近い
   評価コストが走っているため、「import 時に重い処理をしている」箇所を
   遅延実行（関数呼び出し時に初期化）へ変更できないか確認
2. **three / R3F を requestIdleCallback 後の動的 import に変更**:
   FV は動画 + Canvas 2D なので、three 系は初期表示に必須でない可能性が高い。
   `HeaderCylinder` を `lazy()` + Suspense 化して初期チャンクから外す
3. rollupOptions の `manualChunks` で three を明示分割し、
   トップ以外のページ訪問時に読ませない

- 効果: TBT 改善 + FCP 前の JS 実行削減。特にモバイル（CPU 4x スロットル）で効く
- リスク: 演出の発火タイミングがずれる可能性。遷移演出の目視確認が必要
- 工数: 中

### 6. 【中優先】メイン CSS の未使用率 79%

`main-*.css` は raw 263 KiB / gzip 43 KiB で、トップページでは **79% が未使用**
（Lighthouse unused-css-rules）。全ページ分の CustomClass / Tailwind 出力が
1 ファイルに集約されているため。

**改善案**:

- ページ固有 SCSS（Next.scss 等は既に分離済み）の import 構成を見直し、
  グローバルに残す必要のないルールをページチャンク側の CSS へ移す
- Tailwind v3 の `content` 設定が過剰マッチしていないか `tailwind.config.js` を確認
- gzip 後 43 KiB なので体感インパクトは項目 1〜4 より小さい。急がなくてよい

- 効果: 小〜中（スタイル計算 655 ms の削減にも寄与）
- 工数: 中〜大（クラスの依存関係の棚卸しが必要なため、最後で良い）

---

## 実施順の推奨

| 順 | 項目 | 効果 | 工数 | 演出への影響 |
|---|---|---|---|---|
| 1 | Cache-Control 設定（deploy-aws.sh） | ★★★ | 小 | なし |
| 2 | FV 動画の再エンコード + poster | ★★★ | 中 | 要目視確認 |
| 3 | Google Fonts 統合・ウェイト絞り込み | ★★ | 小〜中 | 要目視確認 |
| 4 | 初回ローディング演出の緩和（要判断） | ★★★ | 小〜中 | **あり（要相談）** |
| 5 | three / maskMosaique の遅延化 | ★★ | 中 | 要目視確認 |
| 6 | 未使用 CSS の削減 | ★ | 中〜大 | なし |

1〜3 だけでも転送量が 7.8 MB → 2 MB 弱になり、リピート訪問はほぼキャッシュ配信に
なる。4 は演出方針の判断が必要なので、実施前に選択肢 A/B/C のどれを取るか決めること。

## 実施結果（2026-07-14）

| 項目 | 結果 |
|---|---|
| 1. Cache-Control | **実施済み**。`scripts/deploy-aws.sh` を4段階 sync に変更（assets=1年 immutable / video・images=30日 / HTML等=no-cache）。次回 `deploy:aws:frontend` から有効 |
| 2. FV 動画 | **見送り（削減不可能と判定）**。HEVC crf23 で frontend 6.9→12.6MB と逆に増加、AV1 crf36 でも同サイズ（SSIM 0.94 で既に劣化域）、VP9(WebM) も 11.9MB に増加（SSIM 0.917 と3コーデック中最低）。iPhone 非対応コーデックは `<source>` フォールバックで H.264 と出し分ける前提だったため互換性は問題でなく、純粋にサイズが減らないため見送り。ノイズ成分の多い映像のため HandBrake 出力が既に圧縮限界。品質を落とさない削減手段は存在しない。Cache-Control 30日により再訪問時の再取得は解消 |
| 3. Google Fonts | **実施済み**。3系統の読み込みを `index.html` の `<link>` 1本に統合（Jost / Noto Serif JP / Shippori Mincho 400-800 / Viaoda Libre / Zen Kaku Gothic New）。`_01variables.scss` `Next.scss` `Donut.scss` と対応するコンパイル済み CSS から `@import url(...)` を削除 |
| 4. 初回ローディング | **600ms に戻して据え置き**。600ms  |
| 5. three / maskMosaique | **一部実施**。`HeaderCylinder` 内の `ModulationCylinderLogo`（three + R3F 約680KB）のマウントを requestIdleCallback 後（Safari は 300ms 後）に遅延。フォールバック表示は既存の `LogoLoading` を使用するため見た目は従来の読み込み中と同じ。maskMosaique 名のチャンクは実体が React 本体を含むアプリコアのため遅延不可 |
| 6. 未使用 CSS | **保留**（ユーザー判断） |

## 検証方法

- 各施策の適用後に `npx lighthouse https://portfolio.yuremono.com/ --preset=desktop --only-categories=performance` で before/after を比較する（PSI の無料枠が回復していれば PSI でも可）
- モバイルは desktop より条件が厳しい（CPU 4x スロットル + 低速回線エミュレート）ため、`--preset` なし（デフォルトがモバイル）でも必ず計測する
- 演出（初回ローディング / ページ遷移 / FV 動画切り替え）は実機ブラウザで目視確認する
