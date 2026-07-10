---
name: scroll-capture
description: Capture viewport screenshots of a public website or local development server at controlled scroll intervals using a background local Chrome session. Use when checking how a page looks across scroll positions, including animation-heavy sites, without manual browser operation.
---

# Scroll Capture

指定URLをバックグラウンドのローカルChromeで開き、スクロール位置ごとのviewportスクリーンショットを保存する。
公開サイトの観察にも、ローカル開発サーバーの表示確認にも使う。

## Usage

既定では `.codex/skills/scroll-capture/config.json` を使う。

スキル内の実行スクリプト:

```bash
.codex/skills/scroll-capture/scripts/run.sh https://example.com
```

プロジェクト直下にショートカットがある場合:

```bash
./scroll-capture https://example.com
```

設定ファイルを明示する場合（別設定は `.codex/skills/scroll-capture/` 配下に置く）:

```bash
.codex/skills/scroll-capture/scripts/run.sh --config tmp/scroll-capture.config.json http://localhost:3000/
```

用意済みの画面サイズ別設定:

```bash
.codex/skills/scroll-capture/scripts/run.sh --config .codex/skills/scroll-capture/config.iphone.json http://localhost:3000/
.codex/skills/scroll-capture/scripts/run.sh --config .codex/skills/scroll-capture/config.tablet.json http://localhost:3000/
```

## Config

`.codex/skills/scroll-capture/config.json` は既定の設定ファイルとして扱う。
ユーザーがviewport、画質、スクロール間隔、待機時間、最大枚数、保存先などの変更を指示した場合は、この `config.json` を書き換えてから実行する。

 `config.iphone.json` と `config.tablet.json` は、画面サイズ別の再利用設定として扱う。
スマホ表示、タブレット表示、レスポンシブ確認などが必要な場合は、該当する設定ファイルを `--config` で指定して実行する。

新しい設定ファイルを作成するかどうかはユーザーの判断に委ねる。エージェントが自己判断で新規設定ファイルを作成しない。都度の調整（待機時間・endYなど）は常に `config.json` を直接編集する。

## Output

スクリプトは `output.dir` の下にサイト別ディレクトリとrunディレクトリを自動作成し、以下を保存する。

- `0000-000000.jpg`, `0001-000720.jpg` など: scrollYごとのviewportスクリーンショット
- `meta.json`: URL、viewport、step、保存ファイル、最終scrollHeightなど
- runディレクトリは実行ごとに `r001`, `r002` のように採番される。

## Notes

- Chromeは一時ユーザーデータディレクトリで起動される。
- 既存のブラウザ操作ではなく、Chrome DevTools Protocolをローカルスクリプトから直接呼ばれる。
- `viewport.width` / `viewport.height` はバックグラウンドChromeの表示領域サイズであり、そのまま出力画像サイズになる。ブラウザUIやアドレスバーは含まれない。
- 下端判定はCDP側の `scrollY` と `scrollHeight` を使う。`maxShots` は保険の上限。
- `scroll.startY` は撮影開始位置。未指定なら `0`。
- `scroll.endY` は撮影終了位置。未指定または `"auto"` ならページのスクロール可能な末尾。
- `scroll.step` は次の撮影までに進めたい目安のピクセル量。実際のscrollYはサイト側の仮想スクロール実装に左右される。
- 1回のホイール入力量は `scroll.step` と同じ値を使う。
- `scroll.wheelIntervalMs` はホイール入力後の短い待機時間。
- `scroll.initialWaitMs` はページ表示後、初回撮影までの待機時間。ローディング画面やオープニングアニメーションが長いサイト用。
- `scroll.waitMs` は各スクロール後、撮影前の待機時間。
- `preCapture.dismissCookieBanner` が `true` の場合、撮影前に一般的なCookie同意/拒否ボタンを探してクリックする。
