# ORCA (onorca.dev) アーキテクチャ調査メモ

ORCA v1.4.141 の macOS アプリバンドル解析と GitHub リポジトリ（stablyai/orca）の
確認結果のまとめ（調査日: 2026-07-15）。

## 概要

- **正体**: Stably AI 製の「ADE（Agent Development Environment）」。
  複数の CLI コーディングエージェント（Claude Code、opencode 等）を並列実行・管理する
  ことが主目的で、エディタ機能は従属的な位置づけ。
- **ライセンス**: MIT（オープンソース、GitHub 約 1.96 万スター、TypeScript 製）
- **Bundle ID**: `com.stablyai.orca`

## 技術スタック

| 項目 | 内容 |
|---|---|
| シェル | **Electron 43**（Chrome 150）。Tauri ではない |
| UI | ゼロから書かれた独自 React アプリ（shadcn/ui、i18next） |
| エディタ | Monaco Editor（VS Code のエディタ部分のみ。ワークベンチは不使用） |
| ターミナル | xterm.js（WebGL レンダリング、パッチ当てベータ版）+ node-pty |
| 音声入力 | sherpa-onnx（ONNX ベースのローカル音声認識を全プラットフォーム分同梱） |
| ブラウザ自動化 | agent-browser（arm64 ネイティブバイナリを同梱） |
| その他 | SSH2（リモート開発）、Linear SDK、electron-updater + Squirrel、PostHog |
| 開発体制 | pnpm + Node 24、oxlint / oxfmt（Rust 製ツール群）、electron-vite |

## VS Code フォーク（Cursor 等）との違い・軽さの理由

- Cursor が重いのは「Electron だから」より「**VS Code 丸ごとのフォーク**だから」。
  拡張機能ホスト・TS サーバー・ファイルウォッチャー等の常駐プロセスを抱える。
- ORCA は VS Code の拡張機構を持たない専用設計。プロセスは Electron 標準の
  4 Helper（GPU / Renderer / Plugin / 汎用）のみで、実行時依存も 20 個程度と少ない。
- ディスクサイズは約 498MB（Electron Framework 274MB + app.asar 111MB）と小さくは
  ないが、実行時メモリはプロセス構成と UI の薄さにより軽い。
- 動作要件: macOS 12 以上。

## 拡張性

- **VS Code 拡張（.vsix）に相当するプラグイン API は存在しない**。
- リポジトリの `skills/` はエージェントに渡すスキル（computer-use、Linear 連携、
  Android エミュレータ操作等。Claude Code のスキルと同じ概念）であり、
  アプリ本体の拡張機構ではない。
- VS Code 拡張で行っていた作業の多くは、配下の CLI エージェント + MCP + スキル側で
  代替できる設計思想。

## 機能を自分で追加したい場合の選択肢

1. **インストール済み app.asar の直接改造（非推奨）**:
   `ElectronAsarIntegrity`（asar ハッシュ検証）と macOS コード署名の両方が壊れるため
   再署名が必要。アップデートごとに全部やり直しで自動更新も壊れる。
2. **フォークして自分でビルド（正攻法）**:
   `pnpm install && pnpm build` の標準的な electron-vite 構成でビルド可能。
   自分の変更をコミットとして持ち、公式リリースのタグに rebase → ビルドし直す
   「パッチ乗せ直し」モデルで運用できる。Homebrew Cask の自動更新は使えなくなる。
3. **本家に PR を出す（最善）**:
   外部コントリビューションを積極的に歓迎する文化（CONTRIBUTING.md 完備）。
   マージされれば公式機能になり、再適用の手間が消滅する。

## 参考

- 公式サイト: https://onorca.dev
- リポジトリ: https://github.com/stablyai/orca
- インストール: `brew install --cask stablyai/orca/orca`
