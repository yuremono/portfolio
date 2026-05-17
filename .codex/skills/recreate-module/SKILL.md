---
name: recreate-module
description: 既存の公開URLから、Webサイトのセクション、視覚効果、インタラクション、canvas/WebGLアニメーション、UIモジュールをリバースエンジニアリングして再現するときに使う。レンダリング済みDOM、inline script、外部JS/CSS bundle、source map、アセット参照を追い、実装元を特定してから再利用可能な形に移植する。
---

# recreate-module

既存公開サイトから特定のセクション、ホバー演出、canvas/WebGL、スクロール演出、UIモジュールを実装元のソースを特定して「推測による実装」ではなく、「実際のコード」を忠実に再現するスキル。

## 最優先ルール

このスキルの目的は「それっぽく作ること」ではなく、「元サイトの実装経路を特定し、実装元コードを根拠に再現すること」である。

DOM構造、スクリーンショット、一般的な Three.js / GSAP / CSS 知識だけで近似実装してはいけない。実装前に必ず `tmp/recreate-module/<host>/analysis.md` を作成し、以下を埋める。

- 対象DOM
- 実装元JS候補
- 実装元CSS候補
- 採用した元ファイル
- 対象シンボル対応表
- CSS対象ルール対応表
- JS-CSS接続表
- 移植対象コード一覧
- 除外理由
- 直訳移植メモ

`analysis.md` が未作成、または上記が空欄のままの場合、`src` 配下の実装ファイルを編集してはいけない。

例外は、元サイト側に該当コードが取得不能、source mapなし、bundle難読化、外部API依存、ライセンス上の理由などで直訳移植できない場合だけ。その場合も、近似実装へ進む前に「取得不能・移植不能の根拠」を `analysis.md` に書く。

## 実装前ゲート

実装ファイルを編集する前に、必ず以下を `tmp/recreate-module/<host>/analysis.md` に作成する。

- 対象DOMメモ
- 実装元候補ファイル一覧
- 採用した実装元ファイル
- 採用理由
- 対象シンボル対応表
- CSS対象ルール対応表
- JS-CSS接続表
- 移植対象コード一覧
- 除外コードと除外理由
- 直訳移植メモ

`extract-sources.mjs` が `implementation-gate.md` を生成する場合は、それをテンプレートとして使い、空欄を埋めた内容を `analysis.md` として保存してから実装へ進む。

## 近似実装の禁止パターン

以下は禁止。

- 元コードを読まずに、見た目だけから React / CSS / Three.js を新規作成する
- `requestAnimationFrame`、`mousemove`、`getBoundingClientRect()`、`ResizeObserver`、`IntersectionObserver` を見つけたのに、1回だけの測定や CSS transition に置き換える
- shader文字列、uniform、attribute が見つかっているのに、別の簡易shaderへ差し替える
- CSSの `data-*`、CSS変数、keyframes、responsive条件を確認せず、見た目のCSSだけを書く
- ビルドが通ることを「再現できた」と扱う
- スクリーンショット差分を見て、その場で手修正する

これらを行う必要がある場合は、実装前に「なぜ元コードを使えないか」を `analysis.md` に書く。


## ワークフロー

1. 不足情報を確認する
   - 最低限必要な情報が不足していて、探索だけでは補えない場合は、作業前にユーザーへ質問する。
   - 必須情報:
     - 対象URL
     - 対象URL内で対象を特定できるID、属性、テキスト、またはスクリーンショット。
     - 再現モジュールを実装するページ名と、行数または挿入位置を特定できる情報。
   - 必須ではないが、ユーザーが伝えた方がよい情報:
     - 作成するクラス名やコンポーネント名を元サイトから変更する場合の希望名。
     - 元サイトのアセットのファイルサイズや数が大きい場合でも、アセットをローカルで準備するかどうか。アセット自体にデザイン上の役割があり、プレースホルダーでは見た目が大きく変わる場合がある

2. 対象を固定する
   - URL、セレクタ、近辺テキスト、操作条件を具体化する。
   - ユーザーが実カーソル操作や見た目確認を求めた場合は Computer Use を使う。ローカル実装後の確認は `agent-browser` を使う。
   - 繊細なtransitionは`scroll-capture`スキルでプロパティを調整して観測する
   - Puppeteer は使わない。

3. ブラウザで挙動を観察する
   - hover、click、scroll、mousemove、viewport差分を実際に確認する。
   - DOM要素だけでなく、その近くに追加された `canvas`、`svg`、fixed layer、portal、inline style、data属性を見る。
   - canvas がある場合、DOM上の画像追従だけを本体だと決めつけない。

4. 実装元を探す
   - HTML内の inline script から初期化コード、対象セレクタ、constructor名、外部bundle URLを拾う。
   - 外部JS/CSSを取得し、対象セレクタ、class/id、近辺テキスト、constructor名、animation語で検索する。
   - minified bundle は `sourceMappingURL`、`.map`、`.gz`、CDN/S3 asset URL も追う。
   - CSSも同じ重要度で見る。canvasの位置、opacity切替、pointer-events、responsive条件はCSS側にあることが多い。
   - **禁止**: minified bundle 内に対象の constructor / shader / geometry / animation 本体が見つかっているのに、構造だけを見て手書き近似へ置き換えない。
   - **必須**: minified bundle の該当コードを、移植前に利用可能な形へ処理する。該当シンボル周辺を十分広く切り出し、短縮名の依存対応表を作り、Three.js / GSAP / DOM API / 独自関数へ置き換えられる単位に整形してから実装する。
   - **CSSも必須**: minified CSS も「読んだ」だけで終わらせない。対象ID、対象class、JSが付与する `data-*` / CSS custom properties / animation名 / utility class をキーに、使用ルールを抽出し、コピペ可能なCSSブロックまたは既存スタイルへ写せる対応表にしてから実装する。
   - ランダム配置、磁力、衝突回避、接続線、mousemove 追従、初期安定化などは CSS と JS の組み合わせで成立することが多い。`transform`、`scale`、`opacity`、`transition`、`grid-template-rows`、`data-state`、CSS変数のどちらか片方だけを写して完成扱いにしない。

5. 補助スクリプトで取得と検索をまとめる
   - `extract-sources.mjs` は、HTML、inline script/style、外部JS/CSS、CSS内URL、JS/CSS内の相対URL、`sourceMappingURL`、gzip済みテキストbundleを取得し、検索結果を `report.md` にまとめる。
   - 併せて `required-next-steps.md`、`matched-symbols.json`、`css-candidates.md`、`source-map-candidates.md`、`implementation-gate.md` を生成する。
   - 静的に参照されているソースを探す作業の大半は、このスクリプトで完了する。
   - ただし、JS実行後にだけ発生するDOM変更、hover中だけ発生するNetwork、実際のcanvas/WebGL描画、カーソル移動時の歪みはこのスクリプトだけでは確認できない。ブラウザ観察と候補コードの読解は必ず行う。

最初に実行するコマンド:

```bash
rtk node .codex/skills/recreate-module/scripts/extract-sources.mjs "https://example.com/#target" \
  --contains '#target,TargetText,TargetClass,EffectName,canvas,WebGLRenderer,ShaderMaterial,gsap,ScrollTrigger' \
  --depth 2 --max 120
```

レポートを読むコマンド:

```bash
rtk sed -n '1,180p' tmp/recreate-module/example.com/report.md
rtk sed -n '1,220p' tmp/recreate-module/example.com/required-next-steps.md
rtk sed -n '1,220p' tmp/recreate-module/example.com/css-candidates.md
rtk sed -n '1,220p' tmp/recreate-module/example.com/source-map-candidates.md
rtk sed -n '1,260p' tmp/recreate-module/example.com/implementation-gate.md
```

取得済みファイル全体を検索するコマンド:

```bash
rtk rg -n "EffectName|#target|TargetText|TargetClass|WebGLRenderer|ShaderMaterial|sourceMappingURL" tmp/recreate-module/example.com/files
rtk rg -n "sourceMappingURL|\\.map|\\.gz|helpers|bundle|shader|uniform|mousemove|mouseenter|mouseleave" tmp/recreate-module/example.com/files
```

候補ファイル名を確認して、該当語の前後を読むコマンド:

```bash
rtk ls tmp/recreate-module/example.com/files
rtk node .codex/skills/recreate-module/scripts/snip-source.mjs tmp/recreate-module/example.com/files/CANDIDATE_FILE.js EffectName --before 1600 --after 4200
```

`example.com` は対象URLのhostname、`#target`、`TargetText`、`TargetClass`、`EffectName`、`CANDIDATE_FILE.js` は実際の値に置き換える。最初の検索で見つからない場合は、対象セクションのID、近辺テキスト、data属性、constructor名、アニメーション語を `--contains` に追加して再実行する。

minified bundle の該当コードを利用可能な状態に処理する手順:

```bash
rtk node .codex/skills/recreate-module/scripts/snip-source.mjs tmp/recreate-module/example.com/files/CANDIDATE_FILE.js ConstructorName --before 12000 --after 24000 > tmp/recreate-module/example.com/constructor.snip.js
rtk node .codex/skills/recreate-module/scripts/snip-source.mjs tmp/recreate-module/example.com/files/CANDIDATE_FILE.js ShaderName --before 6000 --after 16000 > tmp/recreate-module/example.com/shader.snip.js
rtk rg -n "const ShaderName|function GeometryFn|createMeshLine|new [A-Za-z0-9_$]+\\(|uniforms|vertexShader|fragmentShader|requestAnimationFrame|mousemove|touchmove" tmp/recreate-module/example.com/constructor.snip.js tmp/recreate-module/example.com/shader.snip.js
```

minified CSS の該当ルールを利用可能な状態に処理する手順:

```bash
rtk rg -n "TargetClass|target-id|data-state|animation-name|css-variable|transform|opacity|pointer-events" tmp/recreate-module/example.com/files/*.css
rtk node - <<'NODE'
const fs=require('fs');
const css=fs.readFileSync('tmp/recreate-module/example.com/files/CANDIDATE.css','utf8');
const keys=['target-id','target-class','data-state','animation-name','utility-class','css-variable'];
for (const key of keys) {
  const idx=css.indexOf(key);
  if (idx>=0) console.log(`\n/* ${key} */\n`+css.slice(Math.max(0,idx-1800), Math.min(css.length,idx+3500)));
}
NODE
```

CSS処理で必ず作るもの:

- `CSS対象ルール対応表`: 対象ID/class、JSが付与する `data-state`、CSS変数、animation/keyframes、responsive条件、utility class の実際の宣言値。
- `CSS移植対象一覧`: layout、sizing、transform/scale、opacity、transition/easing/duration、pointer-events、overflow、position、z-index、font、color、background、border、keyframes。
- `JS-CSS接続表`: JSが `style.setProperty()` する変数、JSが切り替える属性/class、CSSがそれをどう解釈するか。
- `除外理由`: 元CSSを使わない場合は、既存プロジェクトCSSで代替できる根拠と、見た目や挙動に影響しない理由。

この処理で必ず作るもの:

- `対象シンボル対応表`: 例 `hn = ShaderMaterial`, `zt = Mesh`, `mi = PlaneGeometry`, `be = Vector2`, `X = Vector3`, `ln = PerspectiveCamera`, `Be = gsap`。
- `移植対象コード一覧`: constructor、初期化、geometry生成、shader文字列、uniform更新、event listener、render loop、cleanup。
- `除外理由`: 使わない元コードがある場合は「規模が大きいから」ではなく、今回の対象外である根拠を具体的に書く。
- `直訳移植メモ`: まず元コードの式・uniform名・attribute名・時間/スクロール/マウス更新を保った直訳版を作る。見た目が確認できる前に独自式へ差し替えない。

6. 重点検索語を切り替える
   - WebGL/canvas: `WebGLRenderer`, `ShaderMaterial`, `PlaneGeometry`, `uniform`, `vertexShader`, `fragmentShader`, `requestAnimationFrame`, `uTexture`, `uOffset`, `mousemove`
   - GSAP: `gsap`, `ScrollTrigger`, `quickTo`, `timeline`, `power`, `scrub`
   - hover preview: `mouseenter`, `mouseover`, `mouseleave`, `pointermove`, `dataset`, `data-`, `TextureLoader`
   - smooth scroll: `lenis`, `locomotive`, `scrollTo`, `wheel`, `transform`
   - image/media: `imagesLoaded`, `url(`, `srcset`, `crossOrigin`, `video`, `canvas`
   - random/layout: `jitter`, `collision`, `repulsion`, `distance`, `getBoundingClientRect`, `requestAnimationFrame`, `IntersectionObserver`, `ResizeObserver`, `data-state`, `style.setProperty`, `transition`, `grid-template-rows`
   - generated CSS: 対象class、Tailwind utility、arbitrary value、`@keyframes`、`@media`、CSS変数名、JSから参照される `data-*` セレクタ

7. 移植する
   - `analysis.md` の実装前ゲートが完了していない場合、`src` 配下のファイルを編集してはいけない。
   - 原則は、処理済みの minified bundle 該当コードを直訳移植する。該当箇所が多い、長い場合も、まず constructor / shader / geometry / render loop の中核を元コードの変数名・uniform名・attribute名に近い形で移植する。
   - 元コードをそのまま再現できない場合だけ縮約する。その場合も、縮約前に「どの元コードを捨てたか」「見た目にどう影響するか」を明記し、ユーザー確認なしに手書き近似へ切り替えない。
   - CSSは抽出済みの元ルールを先に移植し、その後にプロジェクト都合のスコープ化や変数差し替えを行う。ブラウザで見つけた差分を1個ずつ手修正する前に、元CSS/JSの取りこぼしを疑う。
   - ランダムに見えるレイアウトは、単なる乱数だけでなく、初回測定、安定化ループ、衝突回避、近接拡大、周辺要素の反発、接続線再描画、モバイル横ドラッグの組み合わせを直訳対象に含める。
   - 元コードが `getBoundingClientRect()` を繰り返し使う場合、初回 `setTimeout` や1回だけの `requestAnimationFrame` に縮約しない。元実装の測定期間、安定判定、resize/scroll/mouse/touch listener、cleanup まで移植する。
   - その後の指示があった場合はそれに従う。
   - 必要な挙動、入力、状態遷移、cleanup、responsive gating を実装する。
   - 名前は対象サイト固有名ではなく、効果や役割を表す短い語にする。
   - 画像や固有アセットはプロジェクト内の仮画像に差し替えてよい。

実装先を確認するコマンド:

```bash
rtk rg --files src/pages src/components src/scss
rtk rg -n "INSERT_ANCHOR|ExistingSection|main|section|ComponentName|ClassName" src/pages/PageName.tsx src/components src/scss CLASS.md STYLE.md
rtk sed -n '1,220p' src/pages/PageName.tsx
```

`PageName.tsx`、`INSERT_ANCHOR`、`ExistingSection`、`ComponentName`、`ClassName` は実際の挿入先ページ、既存セクション名、候補名に置き換える。初めて編集するファイルは、このコマンドで内容を確認してから編集する。

8. 検証する
   - build/test を通す。
   - hoverやmousemoveなど、元挙動で重要だった操作をブラウザで再確認する。
   - canvas/WebGLの場合は、canvas数、opacity、サイズ、ピクセルが非空であることも確認する。
   - ブラウザ確認で差分が出たら、すぐに見た目を逐次手修正しない。まず「元JSの未移植処理」「元CSSの未抽出ルール」「JS-CSS接続の欠落」「DOM構造/属性の不一致」のどれかを再確認する。
   - ユーザーが「ブラウザで見つかった箇所を直す方式を避ける」と指示している場合、差分を見つけた時点で一旦停止し、取りこぼし候補と次の抽出方針を報告する。
   - 最終報告では、下のフォーマットに沿って、参照した元ソースの場所と再現したファイルを短く説明する。

検証コマンド:

```bash
rtk npm run build
rtk npm test
rtk npm run dev -- --host 127.0.0.1
```

ブラウザ確認コマンド:

```bash
rtk agent-browser open http://127.0.0.1:3000/PagePath
rtk agent-browser set viewport 1280 760
rtk agent-browser screenshot tmp/browser-checks/recreate-module-before.png
rtk agent-browser mouse move 340 380
rtk agent-browser screenshot tmp/browser-checks/recreate-module-hover.png
rtk agent-browser eval '({canvasCount: document.querySelectorAll("canvas").length, visibleText: document.body.innerText.slice(0, 500)})'
```

`PagePath` は実装先ルートに置き換える。canvas/WebGLの再現では、hover前後のスクリーンショットだけでなく、`canvasCount`、canvasサイズ、hover時のopacity、非空ピクセルも確認する。

## 最終報告フォーマット

最終報告では必ず以下を短く出す。

1. 参照した元URL
2. 採用した元JSファイル
3. 採用した元CSSファイル
4. 移植した中核処理
   - constructor
   - geometry
   - shader
   - event listener
   - render loop
   - cleanup
5. 移植しなかった処理と理由
6. 検証結果
   - build
   - browser確認
   - hover / mousemove / scroll確認
   - canvas数、canvasサイズ、非空ピクセル確認
7. 近似した箇所がある場合、その理由

## チェックリスト

[] `analysis.md` を作成し、実装前ゲートを空欄なしで埋めたか。
[] 元サイトの表示DOM要素と構造が一致しているか
[] inline scriptの初期化コードだけで止まらず、constructor本体がある外部bundleまで追ったか。
[] minified bundle の該当コードを切り出し、短縮名の依存対応表を作り、利用可能な移植単位に処理したか。
[] minified CSS の該当ルールを切り出し、CSS対象ルール対応表とJS-CSS接続表を作ったか。
[] 対象の constructor / shader / geometry / render loop があるのに、手書き近似で置き換えていないか。
[] ランダム/磁力/衝突回避/接続線/初期安定化など、レイアウトを作るJS処理をCSSだけ・HTMLだけで近似していないか。
[] CSSのhover条件、fixed配置、responsive条件が一致しているか
[] source map、gzip bundle、CDN/S3上のhelper bundleを確認したか。
[] 操作中の歪みや遅延など、静止画では見えない差分を実カーソルで確認したか。

## tips

### 手順・ソース特定
recreate-module どおり 抽出レポート → 該当バンドル特定 → snip-source で広めに切り出し が効く。
同じサイトでも app.js の Three と main.js の three-canvas は別物。DOM の id（KV と three-canvasなど）で実装元を切り分ける。

### 移植時
minified の 短縮シンボル対応表（ju=パス生成、wb=ジオメトリ、Be=GSAP など）を前提にすると迷いが減る。
CSSも同じ。minified CSS 内の対象 utility / keyframes / data-state ルールを対応表にしてから移植すると、目視差分を1つずつ潰す非効率を避けられる。
ランダム配置は `Math.random` や seed だけではない。元実装が DOM 測定後に安定化ループ、衝突回避、反発、接続線再計算をしている場合、その一連の処理を移植対象に含める。
シェーダは「整理」と「省略」を混同しない。例: permute(vec3) を落として コンパイルエラーになった。
コピペだけでなく、Three のバージョン・結合順で壊れる部分（overload・precision）はビルド／コンソールで必ず確認する。

### 検証
ビルドとブラウザの両方で見る（シェーダは lint では拾えない）。

### アセット
元が .fv_logo_src など DOM 参照なら、同じ画像を public に置いて getAssetPath に寄せるとプロジェクト側と整合しやすい。
