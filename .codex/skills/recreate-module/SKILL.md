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
     - 元サイトのアセットのファイルサイズや数が大きい場合でも、アセットをローカルで準備するかどうか。アセット自体にデザイン上の役割があり、プレースホルダーでは見た目が大きく変わる場合がある。

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

6. 重点検索語を切り替える
   - WebGL/canvas: `WebGLRenderer`, `ShaderMaterial`, `PlaneGeometry`, `uniform`, `vertexShader`, `fragmentShader`, `requestAnimationFrame`, `uTexture`, `uOffset`, `mousemove`
   - GSAP: `gsap`, `ScrollTrigger`, `quickTo`, `timeline`, `power`, `scrub`
   - hover preview: `mouseenter`, `mouseover`, `mouseleave`, `pointermove`, `dataset`, `data-`, `TextureLoader`
   - smooth scroll: `lenis`, `locomotive`, `scrollTo`, `wheel`, `transform`
   - image/media: `imagesLoaded`, `url(`, `srcset`, `crossOrigin`, `video`, `canvas`

7. 移植する
   - 元コードをそのまま再現できるなら再現する。該当箇所が多い、長い場合は機能と見た目が確認できる最小の形で忠実に再現する。
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
[] CSSのhover条件、fixed配置、responsive条件が一致しているか
[] source map、gzip bundle、CDN/S3上のhelper bundleを確認したか。
[] 操作中の歪みや遅延など、静止画では見えない差分を実カーソルで確認したか。
