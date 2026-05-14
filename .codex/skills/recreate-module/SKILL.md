---
name: recreate-module
description: 既存の公開URLから、Webサイトのセクション、視覚効果、インタラクション、canvas/WebGLアニメーション、UIモジュールをリバースエンジニアリングして再現するときに使う。レンダリング済みDOM、inline script、外部JS/CSS bundle、source map、アセット参照を追い、実装元を特定してから再利用可能な形に移植する。
---

# recreate-module

既存公開サイトから特定のセクション、ホバー演出、canvas/WebGL、スクロール演出、UIモジュールを実装元のソースを特定して「推測による実装」ではなく、「実際のコード」を忠実に再現するスキル。

## ワークフロー

1. 不足情報を確認する
   - 最低限必要な情報が不足していて、探索だけでは補えない場合は、作業前にユーザーへ質問する。
   - 必須情報:
     - 対象URL。
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

5. 補助スクリプトで取得と検索をまとめる
   - `extract-sources.mjs` は、HTML、inline script/style、外部JS/CSS、CSS内URL、JS/CSS内の相対URL、`sourceMappingURL`、gzip済みテキストbundleを取得し、検索結果を `report.md` にまとめる。
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

7. 移植する
   - 原則は、処理済みの minified bundle 該当コードを直訳移植する。該当箇所が多い、長い場合も、まず constructor / shader / geometry / render loop の中核を元コードの変数名・uniform名・attribute名に近い形で移植する。
   - 元コードをそのまま再現できない場合だけ縮約する。その場合も、縮約前に「どの元コードを捨てたか」「見た目にどう影響するか」を明記し、ユーザー確認なしに手書き近似へ切り替えない。
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
   - 最終報告では、参照した元ソースの場所と、再現したファイルを短く説明する。

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

## チェックリスト

[] 元サイトの表示DOM要素と構造が一致しているか
[] inline scriptの初期化コードだけで止まらず、constructor本体がある外部bundleまで追ったか。
[] minified bundle の該当コードを切り出し、短縮名の依存対応表を作り、利用可能な移植単位に処理したか。
[] 対象の constructor / shader / geometry / render loop があるのに、手書き近似で置き換えていないか。
[] CSSのhover条件、fixed配置、responsive条件が一致しているか
[] source map、gzip bundle、CDN/S3上のhelper bundleを確認したか。
[] 操作中の歪みや遅延など、静止画では見えない差分を実カーソルで確認したか。

## tips

### 手順・ソース特定
recreate-module どおり 抽出レポート → 該当バンドル特定 → snip-source で広めに切り出し が効く。
同じサイトでも app.js の Three と main.js の three-canvas は別物。DOM の id（KV と three-canvasなど）で実装元を切り分ける。

### 移植時
minified の 短縮シンボル対応表（ju=パス生成、wb=ジオメトリ、Be=GSAP など）を前提にすると迷いが減る。
シェーダは「整理」と「省略」を混同しない。例: permute(vec3) を落として コンパイルエラーになった。
コピペだけでなく、Three のバージョン・結合順で壊れる部分（overload・precision）はビルド／コンソールで必ず確認する。

### 検証
ビルドとブラウザの両方で見る（シェーダは lint では拾えない）。

### アセット
元が .fv_logo_src など DOM 参照なら、同じ画像を public に置いて getAssetPath に寄せるとプロジェクト側と整合しやすい。
