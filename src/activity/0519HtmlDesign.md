---
id: 0519
label: AI時代のデザイン
category: 思考メモ
title: AI時代のデザイン
dateTime: 2026-05-19
# image: /images/common/html_design/cover.png
---

<p class="text-sm opacity-70">作成: ChatGPT / GPT-5.5 / reasoning effort: low</p>

AnthropicのClaude Codeチームに関するインタビューで、「HTML is the new Markdown」という考え方が紹介されていた。
要約記事では、HTMLを単なる表示形式ではなく、計画書、仕様書、UIモック、デザインシステムとして使う実践が語られている。

この話を聞いて、FigmaやPencilのようなデザインツールをAI時代の中心に置き続ける必要があるのか、改めて疑問を持った。
PencilはIDE上で扱えるデザインデータとして面白いし、非エンジニアが自然言語でデザインに近づく入口にもなり得る。
Figmaも、複数人同時編集やコメント、既存組織の承認フローには強い。
ただ、それらの強みは、人間がGUIで分業する時代の前提に寄っている。

AIエージェントに「デザインデータを書かせる」前提では、評価軸が変わる。
AIが扱うのは、見た目そのものではなく、ツール固有のノード、座標、制約、参照関係、MCPの操作手順である。
そこに多くの時間を使うなら、初めからHTMLを書かせる方が自然だと思う。

HTMLなら、人間はブラウザで確認できる。
エージェントは構造を読める。
エンジニアは差分を追える。
さらに、レスポンシブ、スクロール、hover、実テキストの収まり、状態差分まで同じ媒体で検証できる。
合意形成においても、静的なカンプより実際の画面に近い。

デザイン資産として残す場合も、必ずしもFigmaファイルである必要はない。
小さなHTML、触れる仕様書、コンポーネントカタログ、`design_system.html`のようなファイルの方が、AIと人間の共通言語として扱いやすい場面は増えるはずだ。

従来のデザインツールを維持するためにAIを使うのではなく、AIと人間の双方が扱いやすいHTMLを標準にする。
少なくとも、これからのデザインデータは、ブラウザで動き、差分で読めて、実装に接続できる形式を第一候補にするべきだと思う。


<p class="text-sm opacity-70">AIがデザインデータを使うのが苦手だからFigma MCPで苦労するのが無駄でHTMLで作るプロトタイプファーストにするべきだと思います。</p>

参照:

- [How I AI: HTML is the new Markdown](https://www.lennysnewsletter.com/p/how-i-ai-html-is-the-new-markdown)
- [Claude Code: Anthropic's Thariq Shihipar on replacing Markdown with HTML](https://www.chatprd.ai/how-i-ai/claude-code-anthropic-thariq-shihipar-on-replacing-markdown-with-html)
- [Generate a living HTML design system with AI for UI consistency](https://www.chatprd.ai/how-i-ai/workflows/generate-a-living-html-design-system-with-ai-for-ui-consistency)
