# answer-log-format v2

design-creator-v2 が受け取る入力データのフォーマット定義。
ヒアリング完了後の回答ログ、ヒアリング途中の相談、追加質問への回答、DRAFT レビュー回答を扱う。

v2 では、選択肢の集計よりも「原文を根拠として追跡できること」を優先する。
パース時は `raw_answer` を必ず保持し、正規化値は補助情報としてのみ扱う。

---

## A. 完了データ

ヒアリング完走後に生成される。先頭行は必ず以下の形式にする。

~~~md
# Design Brief v2 — {timestamp}
~~~

`{timestamp}` は同じユーザーの複数 brief を区別するための値であり、
エージェントは表示順やファイル名生成の補助情報として扱う。

### 形式

~~~md
# Design Brief v2 — {timestamp}

## 設定

```yaml
schema_version: design-creator-v2.answer-log-format
volume: Quick | Standard | Deep | Branching
language: ja
requested_use: corporate | lp | ec | portfolio | other | unknown
selected_path:
  - core
  - {用途別パス}
  - expression
```

## answers

```yaml
answers:
  - id: core.use
    stage: core
    question: 作りたいサイトの用途は何か
    answer_type: single
    raw_answer: コーポレートサイト
    normalized_answer: corporate
    selected_options:
      - label: コーポレート
        value: corporate
    free_text: ""
    log_fields:
      intent.use: コーポレートサイト
    draft_impact:
      - Intent
```

## contradictions

```yaml
contradictions:
  - rule_id: conflict.use_goal
    sources:
      - core.use
      - core.primary_goal
    description: コーポレート用途だが、単一 CV を強く求めている
    needs_followup: true
```

## assumptions

```yaml
assumptions:
  - source: core.review_strictness
    assumption: 実装安定性を優先する
    rationale: 表示品質と保守性への要求が強い回答だったため
    risk: 表現の派手さが弱くなる
```

## followups

```yaml
followups:
  - id: followup.conflict.use_goal
    source_conflict: conflict.use_goal
    question: コーポレートサイトと LP のどちらを主軸にしますか
    options:
      - コーポレートを主軸にし、CTA は控えめにする
      - LP を主軸にし、CV 導線を強くする
      - 自由入力
    why_needed: ファーストビューと CTA の強さが変わるため
    answered: false
```

## ユーザー追記

{自由記述}
~~~

### 設定ブロック

`## 設定` は YAML として読める構造にする。

| フィールド | 必須 | 説明 |
|---|---:|---|
| `schema_version` | 必須 | `design-creator-v2.answer-log-format` |
| `volume` | 必須 | `Quick` / `Standard` / `Deep` / `Branching` |
| `language` | 必須 | 原則 `ja`。将来多言語化する場合もこのキーを使う |
| `requested_use` | 必須 | ユーザー初回発話から推定した用途。確定値ではない |
| `selected_path` | 必須 | 実際に表示した質問パス。未表示質問の保存防止に使う |

### answers の保存形式

```yaml
answers:
  - id: {question_id}
    stage: core | branch | expression | followup
    question: {表示した質問文}
    answer_type: single | multi | scale | text | ranked
    raw_answer: {ユーザーが入力または選択した原文}
    normalized_answer: {任意。正規化した場合のみ}
    selected_options:
      - label: {表示ラベル}
        value: {内部値}
    free_text: {自由入力。ない場合は空文字}
    log_fields:
      {field.path}: {原文または抽出値}
    draft_impact:
      - {DRAFT セクション名}
```

- `raw_answer` は必須。選択式でも、ユーザーに表示されたラベルを含める。
- `normalized_answer` は任意。lexicon 値や内部値へ丸めた場合のみ保存する。
- `selected_options` は選択式の場合に保存する。未選択の選択肢は保存しなくてよい。
- `free_text` は自由入力欄が表示され、入力があった場合に原文を保存する。
- `question` は後続レビューで根拠を確認できるよう、表示文の原文を保存する。

### contradictions の保存形式

```yaml
contradictions:
  - rule_id: {conflict_rule_id}
    sources:
      - {answer_id}
    description: {矛盾内容}
    needs_followup: true | false
```

- 矛盾は自動で片方を棄却しない。
- DRAFT の主要判断に影響する場合のみ `needs_followup: true` にする。

### assumptions の保存形式

```yaml
assumptions:
  - source: {answer_id | contradiction_id | agent_assumption}
    assumption: {置いた仮定}
    rationale: {なぜその仮定で進めるか}
    risk: {外れた場合の影響}
```

- 追加質問を省略して進める場合は、必ず `assumptions` に残す。
- ユーザー回答にない判断は `source: agent_assumption` を使う。

### followups の保存形式

```yaml
followups:
  - id: followup.{rule_id}
    source_conflict: {conflict_rule_id}
    question: {追加質問}
    options:
      - {選択肢}
    why_needed: {この回答が変える設計判断}
    answered: false
```

- 完了データ時点では `answered: false` を基本とする。
- 回答済みの追加質問は、後述の `【追加質問回答】` で別入力として受け取る。

---

## B. 相談データ

ヒアリング途中で、ユーザーが個別設問について相談するための形式。
先頭行の判別マーカーは `【相談 v2】` とする。

```md
【相談 v2】
question_id: {question_id}
stage: core | branch | expression | followup
answer_type: single | multi | scale | text | ranked

Q: {表示中の質問文}

選択肢:
- {label}: {value}
- {label}: {value}

現在の回答候補:
{ユーザーが迷っている内容。未入力なら空}

相談したいこと:
{ユーザーの迷い・判断軸・補足}
```

### 返し方

- 推奨回答を 1 つ示す。
- 判断理由を 1 行から 3 行で説明する。
- 迷いが妥当な場合は、自由入力に入れる文面案を提示する。
- 相談への回答は DRAFT ではなくヒアリング継続の補助として扱う。

---

## C. 追加質問回答

DRAFT 作成前に、エージェントが最大3問の追加質問を行った後の回答形式。
先頭行の判別マーカーは `【追加質問回答】` とする。

```md
【追加質問回答】
brief_timestamp: {timestamp}

answers:
  - id: followup.conflict.use_goal
    question: コーポレートサイトと LP のどちらを主軸にしますか
    raw_answer: コーポレートを主軸にして、問い合わせ導線だけ少し強めたい
    normalized_answer: corporate_with_moderate_cta
    resolves:
      - conflict.use_goal
    log_fields:
      intent.use: コーポレート主軸
      structure.cta: 控えめだが見つけやすい問い合わせ導線
    draft_impact:
      - Intent
      - Component Plan
```

### パース時の扱い

- `raw_answer` を必ず保存する。
- `normalized_answer` は任意であり、原文より優先しない。
- `resolves` に含まれる矛盾は、解消済み候補として扱う。
- 回答が曖昧な場合でも、再質問は最大3問の制限内で行う。

---

## D. DRAFTレビュー回答

`DRAFT-DESIGN.md` 生成後、ユーザーがレビュー論点に答える形式。
先頭行の判別マーカーは `【DRAFTレビュー】` とする。

```md
【DRAFTレビュー】
draft_file: {DRAFT-DESIGN.md のパスまたはファイル名}
brief_timestamp: {timestamp}

review_answers:
  - item: 1
    target: Design Direction
    question: 信頼感と遊びのバランスはこの方向でよいですか
    raw_answer: もう少し信頼感を強くして、遊びは細部だけにしたい
    decision: revise
    normalized_answer: trust_first_subtle_playfulness
    affected_sections:
      - Design Direction
      - Visual System
      - Motion System

  - item: 2
    target: Component Plan
    question: CTA はこの強さでよいですか
    raw_answer: 現状のままでよい
    decision: approve
    affected_sections:
      - Component Plan
```

### decision

`decision` は以下のいずれかにする。

| 値 | 意味 |
|---|---|
| `approve` | 該当判断を承認する |
| `revise` | 該当判断を修正する |
| `reject` | 該当判断を採用しない |
| `defer` | 未決定として残す |

### パース時の扱い

- `raw_answer` を必ず保存する。
- `normalized_answer` は任意。レビュー本文の置き換えには使わない。
- `affected_sections` は編集対象の絞り込みに使う。
- `approve` の項目は、DRAFT の判断を DESIGN.md 昇格候補として扱う。
- `revise` / `reject` / `defer` は、該当セクションだけを更新対象にする。

---

## パース時の注意

- `raw_answer` は必ず保持する。選択式・自由入力・レビュー回答のすべてで例外を作らない。
- 正規化は任意。`normalized_answer` があっても、原文の代替として扱わない。
- 未表示質問は保存しない。`selected_path` と `answers[].id` を照合し、表示していない質問 ID は無視する。
- v2 の判別マーカーは `# Design Brief v2 —`、`【相談 v2】`、`【追加質問回答】`、`【DRAFTレビュー】` の 4 種類とする。
- `requested_use` は初期推定であり、`answers` と矛盾しても上書きせず `contradictions` に記録する。
- DRAFT の `source` には、`answers[].id`、`followups[].id`、`raw_answer` のいずれかを追跡可能な形で残す。
