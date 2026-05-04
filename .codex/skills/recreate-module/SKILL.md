---
name: recreate-module
description: 既存の公開URLから、Webサイトのセクション、視覚効果、インタラクション、canvas/WebGLアニメーション、UIモジュールをリバースエンジニアリングして再現するときに使う。レンダリング済みDOM、inline script、外部JS/CSS bundle、source map、アセット参照を追い、実装元を特定してから再利用可能な形に移植する。
---

# リクリエイトモジュール

元サイトのセクション、ホバー演出、canvas/WebGL、スクロール演出、UIモジュールを再現する前に、実装元のソースがどこにあるかを特定するためのスキル。
「見た目だけの推測」ではなく、観察した挙動と実際の HTML/CSS/JS を照合してから移植する。

## ワークフロー

1. 対象を固定する
   - URL、セレクタ、近辺テキスト、操作条件を具体化する。
   - ユーザーが実カーソル操作や見た目確認を求めた場合は Computer Use を使う。ローカル実装後の確認は `agent-browser` を使う。
   - Puppeteer は使わない。

2. ブラウザで挙動を観察する
   - hover、click、scroll、mousemove、viewport差分を実際に確認する。
   - DOM要素だけでなく、その近くに追加された `canvas`、`svg`、fixed layer、portal、inline style、data属性を見る。
   - canvas がある場合、DOM上の画像追従だけを本体だと決めつけない。

3. 実装元を探す
   - HTML内の inline script から初期化コード、対象セレクタ、constructor名、外部bundle URLを拾う。
   - 外部JS/CSSを取得し、対象セレクタ、class/id、近辺テキスト、constructor名、animation語で検索する。
   - minified bundle は `sourceMappingURL`、`.map`、`.gz`、CDN/S3 asset URL も追う。
   - CSSも同じ重要度で見る。canvasの位置、opacity切替、pointer-events、responsive条件はCSS側にあることが多い。

4. 補助スクリプトで取得と検索をまとめる

```bash
rtk node .codex/skills/recreate-module/scripts/extract-sources.mjs https://example.com/ \
  --contains '#target,target_class,EffectName,WebGLRenderer,ShaderMaterial,uOffset'
```

出力は既定で `tmp/recreate-module/<host>/` に保存される。
`report.md`、`sources.json`、取得したHTML/CSS/JS/Mapを確認し、候補ファイルを `rg` で深掘りする。

5. 重点検索語を切り替える
   - WebGL/canvas: `WebGLRenderer`, `ShaderMaterial`, `PlaneGeometry`, `uniform`, `vertexShader`, `fragmentShader`, `requestAnimationFrame`, `uTexture`, `uOffset`, `mousemove`
   - GSAP: `gsap`, `ScrollTrigger`, `quickTo`, `timeline`, `power`, `scrub`
   - hover preview: `mouseenter`, `mouseover`, `mouseleave`, `pointermove`, `dataset`, `data-`, `TextureLoader`
   - smooth scroll: `lenis`, `locomotive`, `scrollTo`, `wheel`, `transform`
   - image/media: `imagesLoaded`, `url(`, `srcset`, `crossOrigin`, `video`, `canvas`

6. 移植する
   - 元コードをそのまま再現できるなら再現する。該当箇所が多い、長い場合は機能と見た目が確認できる最小の形で忠実に再現する。
   - その後の指示があった場合はそれに従う、
   - 必要な挙動、入力、状態遷移、cleanup、responsive gating を実装する。
   - 名前は対象サイト固有名ではなく、効果や役割を表す短い語にする。
   - 画像や固有アセットはプロジェクト内の仮画像に差し替えてよい。

7. 検証する
   - build/test を通す。
   - hoverやmousemoveなど、元挙動で重要だった操作をブラウザで再確認する。
   - canvas/WebGLの場合は、canvas数、opacity、サイズ、ピクセルが非空であることも確認する。
   - 最終報告では、参照した元ソースの場所と、再現したファイルを短く説明する。

## 失敗しやすい確認漏れ

- 対象セクション内に見えているDOM要素と、JSが後から追加したcanvas/SVG layerを分けて考えたか。
- inline scriptの初期化コードだけで止まらず、constructor本体がある外部bundleまで追ったか。
- CSSのhover条件、fixed配置、responsive条件を確認したか。
- source map、gzip bundle、CDN/S3上のhelper bundleを確認したか。
- 操作中の歪みや遅延など、静止画では見えない差分を実カーソルで確認したか。
