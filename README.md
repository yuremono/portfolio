# ポートフォリオ

BurnYourOwnStylをベースに制作物をまとめています。

個人のスタイルシステム（クラス、変数、コンポーネント、jsモジュール）を、Claude Code・Cursor 等のエージェントに利用させ、Web 制作の全工程をAI前提で進める為の public template です。

**プロジェクト固有のCSSクラス=CustomClassと呼称します**

## 進捗状況

| フェーズ | 内容 | ステータス |
|---|---|---|
| 1 | 各種ドキュメントの整備 | 🔄 随時更新 |
| 2 | 個別componentスキルの実践テスト | ✅ 完了 |
| 3 | 汎用的な CustomClass を追加 | 🔄 随時更新  |
| 4 | デザインファイルの CustomClass 実装 | ⚠️ 保留中 |
| 5 | クラスと引数から `.pen` ファイルを生成 | ⚠️ 保留中 |
| 6 | ページ作成をまとめて行うスキルを実装 | ✅ 完了・改善中 |

---

## 設計思想

- LLM の学習データに基づくwebデザイン・コーディングは平均的で、振れ幅の大きい、標準ではないものであり、個人のマークアップ、スタイリングとかけ離れたものになる。
- 口頭で伝えづらい、見せても再現できないヴィジュアル表現は人間が具体的データを渡し、レヴューを行うしかない。
- 創造性を制御し、決められた手順を実行させる。vibeツールはモックアップ作成に使用する。テンプレート更新を含め、人間の判断以外の作業を全てエージェントに実行させるための環境を整える。

## 目的

- 個人のクラス、変数、コンポーネント、jsモジュールを再利用可能にする
- 「AI臭い」デザインをさせないようマークアップレベルで制御する
- エージェントによるデザイン再現の精度と効率を向上させる
- 一貫性のあるUI/UXを維持しながら開発スピードを上げる

![BYOSoverview](/public/overview.jpeg)

---

## 想定するワークフロー

1. フレームワークのブランチをクローン
2. 依存パッケージをインストール（`npm install`、`pnpm install` など）
3. 開発サーバーを起動して確認
4. 新規ウェブサイト/ウェブアプリの開発を開始

## Tailwind CSSとの連携

| 層 | CustomClass | Tailwind CSS |
|---|---|---|
| **レイアウト骨格** | ✅ | ❌ |
| **コンポーネント構造** | ✅ | ❌ |
| **色・グラデーション** | ❌ | ✅ |
| **余白微調整** | ✅(変数) | ✅ |
| **フォントサイズ** | ✅(変数) | ✅ |
| **レスポンシブ** | ✅ | ✅ |

**基本方針**: CustomClassクラスで骨格を作り、Tailwindで装飾を加える。

---

## 製作者の開発環境

環境構築には多くの時間がかかります。環境構築用スキル実装を検討しています。チーム内で共有する場合もメンバーが暗黙知を理解する必要があります。ここでは私の偏ったスタイルシステムでの例をご紹介します。

### ルール設計

- ユーザーのハンドコーディングとタイピングでの指示に備え速記性を重視する。
- CustomClassではパスカルケースを使いTailwindと視覚的に差別化
- デスクトップでの外観にフォーカスしたクラス名を使用。ブレイクポイントをTailwindに合わせて上書きも可能

### プロジェクト構成

```
PROJECT_ROOT/          
├── .claude/skills/        # プロジェクト固有スキル      
│   ├── Build/                # ページ、コンポーネント一括実装スキル   
│   │   └── SKILL.md
│   ├── Cards/              # コンポーネント実装スキル
│   │   └── SKILL.md
│   └── ...
├── designs/                 # pencil.dev デザインファイル
├── src/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   └── scss/globals.scss    # CustomClass を含むスタイルのエントリ（ビルドで読み込み）
├── js/                            # 参照用
├── scss/                       # 参照用（ルート直下・別系統ソース）
├── CLAUDE.md          # エージェント用プロジェクトルール
├── STYLE.md              # 設計思想・変数設計
└── CLASS.md             # CustomClass クラスリファレンス
```

### CustomClassの一例

| CustomClass | 説明 |
|------|------|
| `Cards` | 一般的な横並びコンテナ（2〜5列程度） |
| `Panel` | 一般的な縦並びコンテナ。ImgTextを複数まとめたものに近い |
| `ImgText` | 画像+テキスト横並びコンテナ。画像比率をValueクラスで可変 |
| `Toggle` | summary,detailsタグを使う開閉コンテンツ。 |
| `Stick` | fixコンテナとscrollコンテナの比率を変数で可変するラッパー |

### Valueクラス

CSS変数に値を渡すクラス。

| クラス | 意味 | 使用CustomClass |
|--------|------|----------|
| `.col2`, `.col3`, `.col4` | カラム数 | Cards |
| `.img20`, `.img30`, `.img40`, `.img60` | 画像比率 | ImgText, Panel |

### Modifierクラス

CustomClassクラス毎に定義されている状態・モードの切り替え（パスカルケース）。

| クラス | 効果 | 使用CustomClass |
|--------|------|----------|
| `.IsRev` | 画像の位置を反転（右に） | ImgText, Panel |
| `.IsLayer` | 画像とテキストを重ねる | Cards |
| `.IsFlow` | パネル間に矢印 | Panel |
| `.IsQa` | Q&Aの装飾付与 | Toggle |

### 使用例

**Cards（3カラム）**:
```html
<div class="Cards col3">
  <div class="item gap-0 ">
    <figure><img src="/images/960x480.png" alt=""></figure>
    <div class="p-4 rounded-lg shadow-lg flex-1">
      <div>
        <h3 class="font-bold mb-2">カード 1</h3>
        <p>ここで Tailwind クラスを使って装飾できます。</p>
      </div>
    </div>
  </div>
  ...
</div>
```

**Toggle（アコーディオン）**:
```html
<details class="Toggle IsQa">
  <summary class="">これはどのような仕組みですか？</summary>
  <div class="">
    <p>summary と details タグを使った開閉コンテンツです。</p>
  </div>
</details>
```

Tailwindのarbitrary value構文を使用：

- `bg-[--MC]` - メインカラーの背景
- `text-[--TC]` - テキストカラー
- `border-[--SC]` - サブカラーのボーダー

## 変数設計

### 基本レイアウト変数

| 変数 | 例 | 説明 | 使用シーン |
|------|----------|------|-----------|
| `--wid` | `1080px` | `main>*`のwidthになる幅 | コンテンツ幅制御 |
| `--gap` | `2rem` | Flexコンテンツの基本ギャップ | Cards, Panel, FlexR系 |
| `--MY` | `4rem` | セクション間の基本縦余白 | `main>*+*`, `.wrapper>*+*` |
| `--PX` | `1.5rem` | 全コンテンツの基本横余白 | `main`のpadding-inline |
| `--into` | 計算値 | 中身が--widの幅になる横余白 | `.intoL`, `.intoR` |
| `--out` | 計算値 | コンテンツ幅を画面幅にする | `.out`, `.outR`, `.outL` |

### 色変数

| 変数 | 値（例） | 説明 |
|------|----------|------|
| `--MC` | `#2db542` | メインカラー |
| `--SC` | `#3194c9` | サブカラー |
| `--AC` | `#512db5` | アクセントカラー |
| `--BC` | `#fbf9ef` | ベースカラー |
| `--TC` | `#333` | テキストカラー |

他 `--primary` などTailwind文化の変数名と併用

---

## React + Vite Preview

https://yuremono.github.io/BurnYourOwnStyle/

## テンプレート開発に基づく考察
- `pencil.dev` でのデザイン作成は思ったより簡単に意思伝達が可能だが、デザイン作成自体が特殊な作業であり**注意事項**が膨れ上がりコンテキストは多く消費する。
- 「構造化データ」を作るという意味で本番用コンポーネントのプロトタイピングをすることと変わらないと考え。デザイン作成、再現は保留。
- classベースの運用になり、個人のワークフローを元に即再現する準備をしている。誰でも使えるようにするなら、**個人のスタイルシステムと質問回答を元にdocument作成と環境構築を行うスキル**を作るということになりそう。

---

## 詳細ドキュメント

| ドキュメント | 説明 |
|------------|------|
| [STYLE.md](STYLE.md) | 設計思想・変数設計・基本構造 |
| [CLASS.md](CLASS.md) | CustomClassクラスリファレンス・詳細使用方法 |
| [.claude/skills/Build/SKILL.md](.claude/skills/Build/SKILL.md)| `/Build` 明示的指示で読み込むプロンプト |

## ライセンス

本プロジェクトはMITライセンスで公開されています。

## GitHubリポジトリ

https://github.com/yuremono/BurnYourOwnStyle/tree/react
