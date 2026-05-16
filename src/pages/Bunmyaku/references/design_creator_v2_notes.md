# design-creator v2 方針

## 現行方式の問題

現行の design-creator は、ヒアリング回答を `question-bank.md` の signal に変換し、`lexicon / patterns / templates` から具体値を選んで DESIGN.md を生成する。

この方式は、機械可読な要件定義書を安定して作るには有効だが、以下の問題がある。

- lexicon にない表現を原則として採用できず、ユーザーの意図が `[要確認]` に退避されやすい
- patterns が少ないほど出力が凡庸になり、patterns を増やすほど保守コストが増える
- template の穴埋めに寄るため、回答同士の矛盾・優先順位・文脈的な判断が弱い
- ヒアリングが線形で、用途・業種・目的に応じた深掘りが不足する
- DESIGN.md が「設計判断の成果物」ではなく「辞書選択結果」に見えやすい

v2 では、テンプレートを増やして対応するのではなく、生成思想を変更する。

## v2 の目的

v2 の目的は、ユーザーの回答ログから、エージェントが新規にレビュー可能なデザイン要件定義を組み立てることである。

DESIGN.md は以下を満たす必要がある。

- ユーザー意図を、色・文字・レイアウト・動き・制約へ翻訳している
- 採用案だけでなく、採用理由・代替案・レビュー観点を含む
- lexicon 外の意図も、根拠を明示すれば設計案として扱える
- 未確定点は、辞書外だからではなく意思決定に必要な情報が足りない時だけ残す
- 実装者がそのままモックアップや画面設計に進める粒度を持つ

## 生成思想

v2 では `lexicon / patterns / templates` を「厳守する選択肢」ではなく「参照材料」として扱う。

### 現行

```text
ヒアリング回答
→ signal に変換
→ lexicon から具体値を選択
→ template に埋める
→ DESIGN.md
```

### v2

```text
ヒアリング回答
→ 意図・制約・矛盾・優先順位を抽出
→ エージェントが設計仮説を作成
→ lexicon / patterns で品質チェック・候補補強
→ DRAFT-DESIGN.md
→ ユーザーレビュー
→ DESIGN.md
```

v2 では、エージェントが自由に創作してよいわけではない。自由度を上げる代わりに、すべての判断に以下を必須とする。

- `source`: どの回答・自由入力・参考情報から判断したか
- `rationale`: なぜその設計にしたか
- `risk`: その判断の失敗条件
- `review_question`: ユーザーに確認すべき場合の質問

## 質問設計

v2 の質問は、固定20問ではなく、共通コア質問と用途別分岐質問に分ける。

### 共通コア質問

すべてのサイトで必ず聞く。

- use: サイトの用途
- audience: 主な訪問者
- primary_goal: 訪問者に取ってほしい行動
- first_impression: 3秒で残したい印象
- avoid: 避けたい表現
- flexibility: どれくらい既存のWeb表現から逸脱してよいか
- review_strictness: 実装安定性と表現自由度のどちらを優先するか

### 用途別分岐

`use` に応じて質問セットを切り替える。

#### corporate

- company_stage: スタートアップ / 成長企業 / 老舗 / 採用強化中 / 上場・IR寄り
- trust_basis: 技術力 / 実績 / 人柄 / 透明性 / 先進性
- content_priority: 事業紹介 / 採用 / ニュース / 導入事例 / 代表メッセージ
- tone_boundary: どこまで遊んでよいか
- stakeholder: 顧客 / 採用候補者 / 投資家 / パートナー

#### lp

- offer: 何を訴求するか
- conversion: CV の種類
- campaign_context: 常設 / 期間限定 / イベント / 新商品
- persuasion_axis: 機能 / 感情 / 価格 / 限定性 / 世界観
- scroll_story: どの順で納得させるか
- cta_intensity: CTA の強さ

#### ec

- product_count: 単品 / 少数 / 多数
- browsing_style: 探索型 / 指名買い / 比較型
- trust_required: 返品 / レビュー / サイズ / 素材 / 決済安心
- visual_priority: 商品写真 / ブランド世界観 / 価格訴求

#### portfolio

- owner_type: 個人 / チーム / スタジオ / 研究者
- proof_type: 作品 / 実績 / 思考過程 / 技術力 / 受賞歴
- browsing_depth: 一覧重視 / 詳細重視 / ストーリー重視
- personality: どの程度本人性を出すか

### 表現深掘り質問

色・フォント・アニメーションを直接選ばせる前に、表現の判断軸を聞く。

- memory: 訪問後に何を覚えていてほしいか
- emotional_range: 楽しい / 信頼 / 緊張 / 余白 / 高揚 / 親密
- contrast_policy: 強い対比を使うか、なじませるか
- density: 情報密度
- motion_role: 装飾 / 誘導 / 物語 / フィードバック / ほぼ不要
- visual_risk: 避けたい失敗例

## 分岐ロジック

質問は以下の順で展開する。

1. 共通コア質問で用途・目的・制約を確定する
2. 用途別分岐で、そのサイト種別に必要な設計情報を集める
3. 表現深掘り質問で、視覚・タイポ・動きの判断軸を作る
4. 回答に矛盾がある場合だけ追加質問を行う
5. 追加質問は最大3問までに制限し、回答負荷を増やしすぎない

矛盾の例。

- `trustworthy` を求めつつ、`theatrical` と `high deviation` も強い
- `mobile-first` だが、複雑な WebGL 演出を要求している
- `minimal` を選びながら、多色・多パーツ・多モーションを要求している
- `corporate` だが、CV が明確に LP 型である

## DESIGN.md 生成方針

v2 では最初から DESIGN.md を完成扱いにしない。

まず `DRAFT-DESIGN.md` を生成し、ユーザーレビュー後に `DESIGN.md` に昇格する。

### DRAFT-DESIGN.md の必須セクション

- Intent
- Audience / Goal
- Design Direction
- Visual System
- Typography System
- Layout System
- Component Plan
- Motion System
- Content Priority
- Accessibility / Performance
- Open Questions
- Review Checklist
- Source Log

### 各設計値の書き方

各設計値は、単なる値ではなく判断情報を持つ。

```md
### Primary Direction

- decision: playful campaign LP with high color variety
- source: Q-intent-03, Q-mood-01, Q-mood-02, Q-mood-04
- rationale: 楽しさ・カラフル・温度感を固定しない回答が揃っているため
- risk: 色数が増えすぎると CTA と本文の視認性が落ちる
- review_question: CTA だけは単色基準で統一してよいか
```

色・フォント・アニメーションも同じ構造にする。

### 数値の扱い

数値はテンプレート由来の固定値として扱わない。以下のいずれかを明示する。

- `derived`: 回答から導いた値
- `default`: 実装標準として置いた値
- `candidate`: レビュー待ちの候補値
- `constraint`: アクセシビリティやパフォーマンス上の制約値

例。

```md
- h1: 56px desktop / 36px mobile
  type: candidate
  rationale: full-bleed LP で第一印象を強めるため
  risk: 長い日本語コピーでは折り返しが増える
```

## lexicon / patterns / templates の新しい役割

### lexicon

現行の「採用可能値リスト」から、「候補集・既知の安全値・比較対象」に変更する。

- 採用候補として参照する
- lexicon 外の値も、理由とリスクが明示されれば採用可能にする
- ただし外部リソース、ライセンス、実装可否は必ず確認する

### patterns

現行の「組み合わせ決定」から、「レビュー観点・失敗例・経験則」に変更する。

- mood × use の定番を提示する
- あえて外す場合のリスクを書く
- 実装時の注意点を補強する

### templates

現行の「穴埋め先」から、「出力フォーマット・必須セクション定義」に変更する。

- セクション順序を規定する
- 設計値の書式を規定する
- 中身の選定までは固定しない

## レビュー会話フロー

v2 は以下の確認ループを標準とする。

1. ヒアリング完了後、エージェントが `DRAFT-DESIGN.md` を生成する
2. エージェントが「確認が必要な3点」をユーザーに提示する
3. ユーザー回答を受けて、該当箇所のみ更新する
4. DESIGN.md に昇格する

確認が必要な3点は、以下の優先順位で選ぶ。

1. 実装コスト・パフォーマンスに影響するもの
2. ブランド印象を大きく変えるもの
3. CTA / CV / 情報設計に影響するもの
4. lexicon 外の表現
5. エージェントの仮定が強いもの

## 既存ファイルからの移行計画

### Phase 1: 方針分離

- `DESIGN_CREATOR_V2.md` を追加する
- 既存 `SKILL.md` は変更しない
- 現行方式と v2 方式の差分をレビュー可能にする

### Phase 2: 質問スキーマ追加

- `references/question-schema.v2.md` を追加する
- 線形 question-bank ではなく、共通コア + 用途別分岐 + 矛盾時追加質問の構造にする

### Phase 3: 出力スキーマ追加

- `references/templates/DRAFT-DESIGN-template.v2.md` を追加する
- `decision / source / rationale / risk / review_question` を必須項目にする

### Phase 4: intake_form_reference.html 改修

- 分岐質問を扱えるようにする
- 回答ログには、未表示の選択肢ではなく、分岐理由と表示済み質問を保存する
- AI 相談時には、現在の回答履歴も含める

### Phase 5: SKILL.md 切り替え

- v2 を標準フローにする
- 旧フローは `mode=legacy` として残す

## 成功条件

v2 は以下を満たした時に成功とする。

- DESIGN.md が辞書選択結果ではなく、設計判断の記録になっている
- lexicon 外の要望も、理由・リスク・確認事項つきで扱える
- ユーザーがレビューすべき論点が明確である
- 実装者が次に作るべき UI の方向性を迷わない
- 質問数は増えても、用途に関係ない質問は出さない
- テンプレート追加ではなく、質問設計とレビュー会話で柔軟性を上げている
