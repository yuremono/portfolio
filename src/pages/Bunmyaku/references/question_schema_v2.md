# design-creator-v2 質問スキーマ

このスキーマは、分岐ヒアリング UI と回答ログ変換で共有する質問定義である。
固定テンプレートの穴埋めではなく、`DRAFT-DESIGN.md` の設計判断に必要な
意図・制約・矛盾・優先順位を集めることを目的とする。

## 基本形式

各質問は以下の形で扱う。

```yaml
id: core.use
stage: core | branch | expression | followup
applies_when: always | use == corporate | use == lp | use == ec | use == portfolio
answer_type: single | multi | scale | text | ranked
required: true | false
log_fields: [intent.use]
draft_impact: [Intent, Design Direction]
```

- `id` は回答ログと `source` 参照に使うため変更しない。
- `applies_when` は分岐条件。複数条件が必要な場合は AND で解釈する。
- `draft_impact` は、その回答が主に影響する DRAFT セクションを示す。
- 自由入力は正規化せず、原文を `raw_answer` に残す。

## 共通コア質問

すべての用途で必ず聞く。

| id | 質問 | answer_type | log_fields | draft_impact |
|---|---|---|---|---|
| `core.use` | 作りたいサイトの用途は何か | single | `intent.use` | Intent |
| `core.audience` | 主な訪問者は誰か | text | `intent.audience` | Audience / Goal |
| `core.primary_goal` | 訪問者に最終的に取ってほしい行動は何か | text | `intent.primary_goal`, `structure.cta` | Audience / Goal, Content Priority |
| `core.first_impression` | 最初の3秒で残したい印象は何か | text | `intent.first_impression`, `expression.mood` | Design Direction |
| `core.avoid` | 避けたい表現・印象・競合に似せたくない点は何か | text | `intent.avoid`, `constraints.avoid` | Design Direction, Open Questions |
| `core.flexibility` | 既存のWeb表現からどれくらい逸脱してよいか | scale | `preferences.flexibility` | Visual System, Motion System |
| `core.review_strictness` | 実装安定性と表現自由度のどちらを優先するか | single | `constraints.review_strictness` | Accessibility / Performance, Review Checklist |

## 用途別分岐

`core.use` の回答に応じて、該当する用途の質問だけを追加する。
初期推定と回答が矛盾した場合は、推定を上書きせず `contradictions` に残す。

### corporate

| id | 質問 | answer_type | log_fields | draft_impact |
|---|---|---|---|---|
| `corporate.company_stage` | 会社の現在地をどう見せたいか | single | `intent.company_stage` | Intent, Design Direction |
| `corporate.trust_basis` | 信頼の根拠として最も見せたいものは何か | multi | `intent.trust_basis`, `content.proof` | Content Priority |
| `corporate.content_priority` | 優先して読ませたい情報は何か | ranked | `structure.content_priority` | Content Priority, Layout System |
| `corporate.tone_boundary` | 企業サイトとしてどこまで遊んでよいか | scale | `constraints.tone_boundary` | Visual System, Motion System |
| `corporate.stakeholder` | 最も重視するステークホルダーは誰か | single | `intent.stakeholder` | Audience / Goal |

### lp

| id | 質問 | answer_type | log_fields | draft_impact |
|---|---|---|---|---|
| `lp.offer` | 何を訴求する LP か | text | `intent.offer` | Intent |
| `lp.conversion` | コンバージョンの種類は何か | single | `structure.conversion`, `structure.cta` | Audience / Goal, Component Plan |
| `lp.campaign_context` | 常設・期間限定・イベント・新商品など、文脈は何か | single | `intent.campaign_context` | Design Direction |
| `lp.persuasion_axis` | 何で納得させたいか | ranked | `content.persuasion_axis` | Content Priority |
| `lp.scroll_story` | どの順で理解・納得・行動へ進めたいか | text | `structure.scroll_story` | Layout System, Content Priority |
| `lp.cta_intensity` | CTA はどれくらい強く出すべきか | scale | `structure.cta_intensity` | Component Plan, Visual System |

### ec

| id | 質問 | answer_type | log_fields | draft_impact |
|---|---|---|---|---|
| `ec.product_count` | 商品数は単品・少数・多数のどれに近いか | single | `structure.product_count` | Layout System |
| `ec.browsing_style` | 探索型・指名買い・比較型のどれが中心か | single | `intent.browsing_style` | Layout System, Component Plan |
| `ec.trust_required` | 購入前の不安を消すために必要な情報は何か | multi | `content.trust_required` | Content Priority, Component Plan |
| `ec.visual_priority` | 商品写真・ブランド世界観・価格訴求のどれを優先するか | ranked | `expression.visual_priority` | Visual System, Content Priority |

### portfolio

| id | 質問 | answer_type | log_fields | draft_impact |
|---|---|---|---|---|
| `portfolio.owner_type` | 誰のポートフォリオか | single | `intent.owner_type` | Intent |
| `portfolio.proof_type` | 何を実力の証明として見せたいか | ranked | `content.proof_type` | Content Priority |
| `portfolio.browsing_depth` | 一覧・詳細・ストーリーのどれを重視するか | single | `structure.browsing_depth` | Layout System |
| `portfolio.personality` | 本人性や個性をどの程度出すか | scale | `preferences.personality` | Design Direction, Visual System |

## 表現深掘り質問

色・フォント・アニメーションを直接選ばせる前に、表現判断の軸を聞く。
回答は `Visual System`、`Typography System`、`Motion System` の根拠にする。

| id | 質問 | answer_type | log_fields | draft_impact |
|---|---|---|---|---|
| `expression.memory` | 訪問後に何を覚えていてほしいか | text | `expression.memory` | Design Direction |
| `expression.emotional_range` | 感情の幅はどこに置きたいか | multi | `expression.emotional_range` | Visual System |
| `expression.contrast_policy` | 強い対比で見せるか、なじませて見せるか | single | `expression.contrast_policy` | Visual System, Typography System |
| `expression.density` | 情報密度はどれくらいが適切か | scale | `expression.density` | Layout System |
| `expression.motion_role` | 動きの役割は何か | single | `expression.motion_role` | Motion System |
| `expression.visual_risk` | 見た目で避けたい失敗例は何か | text | `expression.visual_risk`, `constraints.visual_risk` | Open Questions |

## 矛盾検出ルール

矛盾は自動で片方を棄却せず、`contradictions` に記録する。
DRAFT 作成前に設計判断へ影響する場合だけ追加質問する。

| rule_id | 条件 | 扱い |
|---|---|---|
| `conflict.use_goal` | `core.use` が corporate だが、`primary_goal` や `conversion` が単一 CV に強く寄る | corporate と LP のどちらを主軸にするか確認候補 |
| `conflict.trust_expressive` | 信頼・堅実を求めつつ、逸脱度や演出強度も高い | 表現の上限を確認候補 |
| `conflict.mobile_heavy_motion` | mobile-first や実装安定性優先なのに、重い WebGL・多量の常時アニメーションを求める | パフォーマンス制約を優先し、演出代替案を提示 |
| `conflict.minimal_dense` | minimal / 余白重視なのに、情報密度・要素数・CTA 強度が高い | レイアウト密度か表現トーンの優先順位を確認候補 |
| `conflict.visual_avoid` | `first_impression` と `avoid` が同じ印象語を含む | 原文を残し、何を避けたいのか確認候補 |
| `conflict.ec_brand_price` | EC でブランド世界観と価格訴求の両方が最上位 | ファーストビューの主役を確認候補 |

## 追加質問ルール

追加質問は最大3問まで。情報が不足しているだけでは聞かず、
設計判断・実装コスト・ユーザー成果に影響する場合に限定する。

優先順位:

1. 実装コスト・パフォーマンスに影響するもの
2. ブランド印象を大きく変えるもの
3. CTA / CV / 情報設計に影響するもの
4. lexicon 外の表現で、採用リスクが高いもの
5. エージェントの仮定が強く、失敗時の影響が大きいもの

追加質問の形式:

```yaml
id: followup.{rule_id}
source_conflict: conflict.mobile_heavy_motion
question: 確認したい内容
options: [推奨案, 代替案, 自由入力]
why_needed: この回答が変える設計判断
```

質問しなくても妥当な仮定で進められる場合は、
`assumptions` に `source`、`assumption`、`risk` を残して DRAFT を作る。

## 回答ログに残すべきフィールド

回答ログは、DRAFT の `source` とレビュー会話で追跡できる粒度を保つ。

```yaml
schema_version: design-creator-v2.question-schema
session:
  requested_use: ユーザー発話からの初期推定
  selected_volume: Quick | Standard | Deep | Branching
  language: ja
answers:
  - id: core.first_impression
    stage: core
    applies_when: always
    raw_answer: 原文
    normalized_answer: 任意。機械的に丸めた場合のみ
    confidence: high | medium | low
    log_fields:
      expression.mood: 原文または抽出値
    draft_impact: [Design Direction]
contradictions:
  - rule_id: conflict.trust_expressive
    sources: [core.first_impression, core.flexibility]
    description: 矛盾内容
    needs_followup: true
assumptions:
  - source: core.review_strictness
    assumption: 実装安定性を優先する
    risk: 表現の派手さが弱くなる
followups:
  - id: followup.conflict.trust_expressive
    answered: false
```

必須フィールド:

- `schema_version`
- `session.requested_use`
- `session.selected_volume`
- `answers[].id`
- `answers[].raw_answer`
- `answers[].log_fields`
- `answers[].draft_impact`
- `contradictions[].rule_id`
- `assumptions[].source`
- `followups[].id`
