python3 -m http.server 5173 --directory public/brand-guideline
http://localhost:5173/index.html

# ブランドガイドラインページ 仕様メモ

随時追記。口頭で伝えられた内容をそのまま短く整理したもの。

## 目的
- 構造化データ・色・画像・スタイルスケープを視覚的に確認するツール
- 第三者向けマニュアルは別途用意予定。このページ自体に説明文は書かない
- 初期値はポートフォリオのトップページ由来だが、現在はトップページとは切り離した独立ツールとして運用。表示値の正はこのディレクトリの`style.css`

## 公開場所・URL
- 配置：`public/brand-guideline/`（index.html + style.css + script.js + style.scss + このspec.md、他ファイル非依存で自己完結）
- 注意：spec.mdもこのディレクトリにあるためビルド時に`dist/brand-guideline/brand-guideline-spec.md`としてそのまま公開される（秘密情報は含まないため許容。気になる場合は要移動）
- 実際に使えるURL：`https://portfolio.yuremono.com/brand-guideline/index.html`（拡張子必須）
- 注意：CloudFrontはS3への403/404時に`/index.html`（メインのReactアプリ）へフォールバックする設定のみで、ディレクトリindex自動解決のCloudFront Functionが無い。よって`/brand-guideline`や`/brand-guideline/`（拡張子なし）はメインアプリ側に落ちてしまい表示できない。短縮URLが欲しい場合はCloudFront Function追加が別途必要（本番インフラ変更のため要相談）

## 全体構造
- body直下：header → main → footer（この3つのみ）
- 各セクション（var_group×2, sections, adjectives, design_notes）に日本語タイトルの`<h2>`を追加（実装済み）。装飾は`text-decoration:underline; text-decoration-thickness:2px`のみ、font-size/font-familyは指定せず既存の`h2{font-size:var(--h2FZ)}`等に委ねる
- `--h2FZ`はデフォルト`clamp(24px,4vw,40px)`だとこのページには大きすぎたため`clamp(16px,2vw,22px)`に微調整（style.scss冒頭のコピー元定義を直接編集、書式は維持）
- セクション間の区切り線（`border-top: var(--line); padding-top: 1.5rem;`）は`.design_notes`等のセマンティッククラスに直接書かず、`.divider`という別クラスに切り出した。セマンティッククラスはそのまま残し、装飾に使うかどうかは問わない。`.divider`は最初のセクション以外の全セクションに付与（セクション間の区切りとして機能）

## header
- position: sticky
- 左：ロゴ＝英語テキスト「Brand Guideline」
- 右：ボタン4つ「マニュアル」「ソースに保存」「HTMLをコピー」「ZIPをダウンロード」
- マニュアル：`.manual`＝全画面オーバーレイ（fixed・headerと同じ`backdrop-filter: blur(10px)`）、`.manual_inner`＝中央のコンテナ。トップレイヤーは使わず、`.is_open`で`opacity`/`visibility`/`pointer-events`をトグル、`transition: var(--trans)`。閉じる操作＝右上×ボタン（`.manual_close`、コンテナのpadding `--PX`と同位置にabsolute）/ オーバーレイ（コンテナ外側）クリック / Esc。ボタン側は`aria-expanded`/`aria-controls`。ツールUIなので`data-export-exclude`（クリーン版に含めない。ZIP版には閉じた状態で含まれる）
- 767px以下：ハンバーガーメニューに切替（Tailwindのmdブレイクポイント=768px基準）

## コピー/ダウンロード/保存機能
- 2系統。クリーン版（コピー）と編集可能版（ZIPダウンロード）の振り分けは「script.jsが同梱されているか」
- **ソースに保存**：File System Access API（`showDirectoryPicker`）で、編集後のindex.html（DOM再シリアライズ）と変数追記済みstyle.cssをフォルダへ直接上書き。初回にフォルダ選択、以降はセッション中ハンドルを使い回す。Chrome/Edge対応（Safari/Firefox非対応）。BraveはAPIを既定で無効化しているため、`navigator.brave`で検知して`brave://flags/#file-system-access-api`の有効化手順をalertで案内（マニュアルにも記載）。ページ側から強制有効化はできない。再保存時の二重追記は`OVERRIDE_MARK`コメントで旧追記ブロックを剥がして防ぐ。注意：DOM再シリアライズのため元ソースの整形（自己終了スラッシュ等）は正規化され、実変更以外のgit差分が出る（開発サーバーのコメントは`<head>`内に置き、保存で消えないようにしてある）
- 書き出しの汚染対策：ブラウザ拡張がページへ注入する`<style>`（imageye等）は保存・コピー・ZIPすべてで除去する（このページのソースは`<style>`タグを持たない前提）
- style.css/script.jsの`fetch`は`cache: "no-store"`。保存直後の再書き出しで古いキャッシュを掴まないため（ハードリロード不要）
- ライブリロード対策：Vite等で開いていると保存によるファイル変更が即リロードを誘発し、後続の書き込みが失われるため、保存は内容確定→2ファイル並列書き込みの順で行う。確実なのはリロードしないサーバー（`python3 -m http.server`）で開くこと
- **HTMLをコピー**：クリーン単一HTML（閲覧・共有用）。CSSは`<style>`にインライン、JSなし。header内のボタンは`data-export-exclude`属性で除外、`contenteditable`属性・`script`タグも除去
- **ZIPをダウンロード**：編集可能版一式（`brand-guideline/` index.html + style.css + script.js + README.md）。index.htmlはlink/script参照を保ったまま編集後のDOMで差し替え、style.css/script.jsは配信ソースをそのまま同梱＝展開すればこのツールがそのまま動く
- どちらも編集後のDOMを反映（未編集箇所は初期値のまま出る）。編集された変数は、コピー=インラインCSS末尾 / ZIP=style.css末尾に`:root{}`として追記（末尾なのでメディアクエリ内の同名定義にも勝つ＝画面表示と同挙動）
- ZIPは無圧縮(stored)を自前生成（script.jsの`buildZip`＋CRC32。依存ライブラリなしの自己完結を維持）
- 注意：再書き出しは`fetch`を使うため、ZIP展開後に`file://`で直接開くと動かない（閲覧・編集は動く）。ローカルサーバーが必要な旨をREADME.mdに記載

## インライン編集（実装済み）
- 対象：ロゴ、main内の`h2`/`h3`/`code`、`.sections_title`/`.sections_desc`、`.adjective_item`、`.design_dl>*`（`script.js`の`EDITABLE_SELECTOR`）。`.editable`は個別クラスを増やさず任意要素を編集可能にする汎用フック（現状未使用）
- script.jsが読み込み時に`contenteditable="plaintext-only"`を付与（ソースHTMLに属性は書かない。plaintext-onlyでペースト時のタグ混入を防ぐ）
- 変数同期：`.variable_label`内のcode 1つ目=変数名、2つ目=値。どちらかを編集すると`document.documentElement.style.setProperty()`で即時反映。変数名を変えた場合はswatchのインライン`var()`参照も付け替え
- 値の`code`には「有効なCSS値」だけを書く（`4rem / 6rem（md~）`のような注記文は不可＝同期が壊れる。レスポンシブ差分はstyle.cssのメディアクエリが担当）
- 編集の保存は無し（リロードで初期値に戻る）。localStorage自動保存は未実装（後回し）
- 編集可能表示：`[contenteditable]`にhover=GR破線 / focus-visible=AC実線のoutline
- 項目の追加：`variable_grid`/`sections_grid`/`adjective_ul`/`design_dl`各末尾に`is_add`（design_dlのみ`.design_add`）タイル。クリックで同種の空項目を直前に挿入、即編集可能。挿入項目は他の項目と同じCSSに乗るため見た目の差分なし

## main（コンテンツ、随時追加）
1. 変数リスト：トップページで使う余白・色のCSS変数を見やすく羅列（実装済み、v3）
   - 共通クラス`.swatch`（border付き, `aspect-ratio:1`, デフォルト`width:var(--MY)`）+ モディファイア`.is_size` / `.is_color`で出し分け。色は背景色だけ、サイズ系は`width`だけインラインで上書き（`height`は書かない＝正方形はaspect-ratioに任せる）
   - `--wid`のみ特殊扱い：`.var_full`は縦並び（label→バーの順）。バーは`width:100%`。`<main class="wid">`で実際に`--wid`を`<main>`自体の幅として使用（表示するだけでなく構造にも反映）
   - 各項目は`.var_item`（`grid-template-columns:1fr auto`、中央寄せ）で名前+数値を左、swatchを右に配置。列幅が全項目で揃うためX軸のズレが出ない
   - レイアウト：`.var_grid`（`grid-template-columns: repeat(auto-fill, minmax(220px,1fr))`）で列数を内容量に応じて自動調整。色変数グループも同じ`.var_grid`を流用（列設定を統一）
2. セクション一覧：トップページのセクション順序とタイトル（実装済み、v3）
   - `.sections_grid`で3カラム固定グリッド、各項目に既存の`BorderXY`クラス（`--line`変数の枠線）を使用
   - `list-style:none` + CSSカウンター（`::before`）で番号表示（枠からはみ出す標準マーカーは使わない）
   - 矢印（`::after`）はコンテンツ側と重複する見た目になるため一旦削除。数字のみ
3. 形容詞リスト：ページを表す形容詞（英語+日本語）（実装済み、ドラフト）
   - ul > li は display:inline-block、横並び→右端でカラム落ち（折り返し）
   - 中身：Top.tsxを見た印象からの暫定リスト（Experimental/実験的、Associative/連想的、Minimal/ミニマル、Monochrome/モノクローム、Analytical/分析的、Introspective/内省的、Layered/重層的、Fluid/流動的、Technical/テクニカル、Personal/パーソナル）。「空の予定枠」ではなく必ず見える状態にする方針 → 差し替え歓迎
4. デザイン判断メモ：短い構造化テキスト（A＝B、条件文、3項目以上は→で接続）（実装済み、v4）
   - v3までは(a) Top.tsx/デザインシステムから読み取れる実際の判断（--MC=--SC等）と(b) このページ構築中の指摘のルール化、の2系統を混在させていたが、(a)は推測・未確認の「ダミー」判断だったためユーザー指示で全削除
   - 中身は(b)のみに整理：このページ構築中にユーザーから受けた指摘をそのままルール化したもの（略語ルール, タグ名重複禁止, swatch共通化, aspect-ratio活用, 簡易BEM＋BEM要素命名＋swatch例外, 共通スタイル分離）。6項目に整理・統合
   - 表現方針：「初めて見た人が状況と変更決定理由がわかるように」。単なる before→after ではなく、左セルに「ルール名」、右セルに「具体的な適用方法・理由・例」を書く形に統一
   - レイアウト（v3）：`display:grid`+`--cols`をやめ`display:flex`に変更。`.dn_cell`（各項目）は`flex:1`で自動的に均等幅になるため項目数を事前に指定する必要がない
   - 各`.dn_cell`は個別に`border`+`background`を持つ（左右で同じ値でも別々に設定＝ボーダーはどちらの箱にも付く）
   - 矢印は`.dn_cell:not(:last-child)::after`の疑似要素。`position:absolute`+`right:-0.75rem`+`translate(50%,-50%)`でgapのちょうど中央に配置、`background:var(--BC)`を敷いて枠線と重ならないようにした

## クラス命名
- このページは独立ページなのでプロジェクト全体のCustomClass規約（PascalCase）は使わず、**snake_case**（簡易BEM、ハイフンの代わりにアンダースコア1つ。例：`var_grid`, `sections_grid`, `is_size`）
- BEMの要素名は親ブロック名を引き継ぐ（例：`<header>`配下は`header_logo`, `header_toggle`, `header_actions`, `header_btn`。`sections`ブロック配下は`sections_grid`）。ブロック名と無関係な独立語を子要素に付けない
- 例外1：`.swatch`とその中の`.is_color`/`.is_size`は複数ブロック（余白/色）で共有する独立コンポーネントとして扱うため`var_swatch`のようにブロック名を付けない
- 例外2：style.scss冒頭（コピー元variables.scss由来）の既存ユーティリティクラス（`wid`, `PX`, `MY`, `gap`, `BorderXY`, `BorderT/B/L/R/X/Y`, `Ser`/`San`/`Eng`, `TS`/`DS`/`BS`/`WTS`/`BGgrad`系等）はそのまま流用し、リネームしない
- クラス名は極力シンプルに。タグ名だけで意味が通るのに単語を足さない（例：`<header>`に`header_bar`は不可、`header`のみ。`<section>`に`section_list`も同様の理由で`sections`に修正）
- 略語は「誰が見ても理解できる」ものだけ許可（例：`var`=variable, `btn`=button）。それ以外の独自略語は使わない

## 運用ルール（重要）
- 「こういう場合はこうする」という設計判断の指示が出たら、都度このファイルに追記する。抜けると同じ話を繰り返すことになるため必須
- 長い口頭指示はまず要点を上の各セクションに構造化して追記し、加えて原文も`## ユーザープロンプト`以下にそのまま書き写す（要約だけだとニュアンス欠落の恐れがあるため二重に残す）

## footer
- 中央に「Copyright」とだけ表示

## スタイル方針
- third partyがTailwindに依存せず取得できるよう専用style.cssを用意
- style.cssのベースは`TWonly/variables.scss`のカスタムプロパティ定義をコピー（SCSSの`@for`ループなど非CSS構文は除外、コメントは`/* */`に変換）
- 適用ルール（html{}のfont/背景色指定や`.Ser`等のユーティリティクラス）はコピーしない。変数の**定義**のみ持ち込み、装飾には使わない
- まずは色変数・新規フォント指定セレクタを使わない。レイアウトに必要な最小限のCSS（sticky、flex-wrap相当、ブレイクポイント切替、dl/olの見やすさ用grid）のみ

## 既知の差異・注意点
- 表示する変数値（main内の変数リストの初期値）の正はこのディレクトリの`style.css`。`src/scss/_01variables.scss`や`TWonly/variables.scss`とは同期しない（独立運用）
- `--wine` `--brown` `--forest`もstyle.cssに定義済み
- 変数は全網羅ではなく主要トークンのみ抜粋
  - 余白：`--wid` `--MY` `--PX` `--PX2` `--gap` `--gapH` `--spaceXS` `--spaceS` `--spaceM` `--spaceL` `--spaceXL`
  - `--space*`は5段階の余白トークン（XS=0.25rem / S=0.5rem / M=1rem / L=2rem / XL=4rem）。このページ自体のpadding/gapは実サイズ直書きをやめて全てこのトークンを使用（カード間gap=M、最小限のpadding=XS）。例外：`.var_item`の`gap: 2px`は罫線用の隙間なのでスケール外として実寸のまま
  - 色：`--MC` `--SC` `--AC` `--BC` `--TC` `--GR` `--BK` `--WH` `--wine` `--brown` `--forest`
  - セマンティック：`--primary` `--secondary` `--accent` `--background` `--foreground` `--muted` `--border`
  - 拡張したい場合は指示ください（オパシティ差分`--MC10〜90`等は今回除外）
- favicon（`/favicon.ico`）はあえてリンクしていない（他ディレクトリ依存を避けるため）

## セクション一覧（Top.tsx抽出、実装内容）
1. Hero（MindMapマスク映像＋Coding/Design/Applicationアンカー）
2. Experience and Dependencies
3. Vibe or Vault Driven（AI Ready / Burn Your Own Style）
4. Bunmyaku Teaser
5. Repulsion Lists
6. Coding（#coding）
7. Design（#design）
8. Frontend（#frontend）
9. Footer

## ユーザープロンプト

では、そのページについての説明を整理せずにどんどん伝えていきます。私が  
  伝えた内容をまとめるためのファイルを作成してもらっても構いません。後か  
  ら追加する情報があることを想定して、柔軟に対応してください。私からも読  
  みやすいように、できる限り短い表現でコンパクトに書いてほしいです。例え  
  ば、丁寧語を使わないとか、構造化情報にできることはJSON形式にしてほしい  
  という意味ではないですけど。- 〇〇：〇〇                                
  というように表現するなどです。                                          
  可能であれば、パブリック直下にブランドガイドラインディレクトリを作成し  
  て、その中に全てのファイルを入れてください。その他の場所にのファイルに  
  依存しないようにしたいです。完全にそれが難しい場合は、その解説もどこか  
  に書いておいてください。                                                
                                                                          
  まずボディ直下にヘッダータグ、メインタグ、フッタータグが並びます。ヘッ  
  ダーにはよくあるレイアウトでブランドガイドラインという英語のテキストで  
  ロゴを表現し、それを左端に置き、右端にHTMLをコピーというボタンとHTMLを  
  ダウンロードというボタンを配置しそのページで作られたHTMLとCSSを第三者が 
  取得できるようにします。ページ自体にはJavaScriptを使用して部分的に変更  
  ができるようにします取得したHTMLとCSSはJavaScriptをほぼ使わない、もしく 
  は最低限のスクリプトを加えた単一ファイルの内容を取得するようにします。  
  メインタグの中のコンテンツはブランドガイドラインを設定するためのもので  
  す。まずはこのプロジェクト、つまりポートフォリオですが、そのトップペー  
  ジのブランドガイドラインをサンプルとして作ってみようと思います。そして  
  重要なことですが、私の指定した以外の、私の指定すること以外で、説明的な  
  文章を一切HTML上に書かないでください。まずはタイトルさえ付けなくていい  
  くらいです。ページ自体の第三者向け説明。つまりマニュアルは別途用意する  
  予定です。あくまで構造化データや色や画像やスタイルスケープを視覚的に確  
  認することが目的です。とはいえ、補足のテキストは必要になると思いますの  
  で、随時指示を出しますが、基本的にはテキストを使わないつもりでいてもら  
  って大丈夫です。                                                        
  まずパッと見じゃない、思いつく、思いついた順番に適当に伝えていきますけ  
  どブランドコンセプトガイドラインって言った方がいいかおよび、およびじゃ  
  ない。今回の場合はトップページについてですが、余白の取り方や使われてい  
  る色それを指定するための変数を視覚的に見れるようにします。というかトッ  
  プページで使われている変数をとにかく見やすい形で羅列すると言った方が早  
  そうですねあとは最終的に残すか分からないけどトップページのコンテンツじ  
  ゃないなセクションの順番とタイトルを並べることもやっておきましょう      
  あとは、そのページを表す形容詞を英語と日本語で羅列します。ここはディス  
  プレイインラインブロックのULリストで横並びに並べて、右端まで来たらカラ  
  ム落ちする仕様にしてください。カラム落ちね。あとは、主にデザインする上  
  での判断についてわかるセクションを追加します。作ります。これは文章です  
  が、さっきこのページ用のドキュメントを作成するための表現方法について伝  
  えましたが、同じように構造化して短い表現で何々イコール何々とか、こうい  
  う時はこうするとか。3つ以上の情報を並べる場合は矢印で横並びにしたりしま 
  す。とりあえずこんなところですね。第三者が取得するときに、テイルウィン  
  ドウでは困るので、専用のstyle.cssにまずは'/Users/yanoseiji/projects/041 
  3portfolio/TWonly/variables.scss'これをコピーして使ってください。装飾は 
  極力行わない。まずは色変数も使わないでくださいHTMLタグで指定されている  
  フォント関連のプロパティも、新しくセレクタで使うことを極力避けてくださ  
  い。単純に伝えた内容をHTMLで表現するくらいの気持ちでいいです。ヘッダー  
  はポジションスティッキーでお願いしますっていうtailwindブレイクポイント  
  のmdブレイクポイントでハンバーガーメニューに切り替わるようにしてくださ  
  いフッターはとりあえず中央にCopyrightを入れておくだけでいいです。ではお 
  願いします。

### 追記 2026-07-10（変数の可視化・グリッド化について）

とりあえず変数 余白やサイズの変数はそのサイズが視覚的にわかるように並べ
てください --wid変数は実際の幅がわかる見た目を作って --MY、--PXも同様。
それを作った上でコンパクトにカラム数を適切なカラム数をその並んでいる変数
に応じてカラム数を変えながらコンパクトにレイアウトしてください。色変数は
同じカラム数でいいのでこれも実際の色がわかるように並べてください。変数に
よって幅を変えつつ横並びにコンパクトに並べるっていうことです。色変数に関
しては今の状態から四角いちょうどいい大きさの色が見える要素を追加すればい
いですが重ねたりしないでください。文字とその色見本を重ねたりしないでくだ
さい。セクションの羅列はこれもカラム数を統一して横並びにしてください。
BorderXYクラスを使ってください。とりあえず3カラムでいいかな。あとさっき
私が伝えたこと抜けてますよね。こういう場合こうするというデザイン上の設計
判断について、これブランドガイドラインスペック.MDに書いてありますか。私
がさっき話した内容を振り返って追記してください。こういうことがあると困る
ので、とりあえずさっき話した内容はこのファイルの末尾にそのまま書き写して
おいてください。それからブランドガイドラインスペック.MDはブランドガイド
ラインディレクトリに移動してください。
