# CustomClass 設計書

**設計思想・変数定義・基本構造については [`STYLE.md`](./STYLE.md) を参照。**

---

## 命名規則

**Value class指定**（ex: 小文字 + 数値）：

valuablesを渡すclass。**例外的にPascalCaseを使用しない**。

| class | 意味 |
|---|---|
| `.col3` `.col4` | カラム数 |
| `.img20` `.img30` | 画像比率 |

**Modifier class**（`Is*` 形式）：

class毎に定義されている。

| class | 効果 | 使用 class |
|---|---|---|
| `.IsRev` | 画像の位置を反転 (右に) | ImgText |
| `.IsLayer` | 画像とテキストを重ねる | Cards |
| `.IsFlow` | パネル間に矢印 | Panel |

**Intersection class**（`Js*` 形式）：

`src/styles/object/component/_intersection.scss`で定義。

| class | 効果 |
|---|---|
| `.JsBottom` | 画面に入ったら下から出現 |

**Break Point**（Tailwind準拠のkebab-case）：
- `.bp-sm`：デフォルトのBP(classにより異なる)を`sm`に変更

## Tailwind CSS

**装飾・調整**でのみ使用する。

## エージェントワークフロー

`.claude/skills/Build/SKILL.md` 参照

---

## CustomClass 一覧

ユーザーが追加した場合最下部に追記する。

CustomClass の role:
- Container : 特定のclass,tagを持つ子要素を使用する前提のコンテナ、クラスセット
- Component : 役割とスタイルがほぼ確定しているUI component
- Wrapper : 囲む事で効果がある or 子要素に影響を与える
- Effect :  js 処理や css の効果を付与する。全ての role と併用可能

points: Wrapper 以外は Wrapper で囲むことが多い。Wrapper を Wrapperで囲むことは少ないが禁止ではない
ex. `.Wrap` > h2 + `.Flex46` + `.Stick` 

required children : class内で定義されているセレクタではなく、見た目を作るのに最低限必要な要素(人間が判断)

| class | role | required children | has component | modifiers & values | common combinations |
|-------|------|----------|---------------|-------------------|-------|
| `.Cards` | Container | `.item` | true | `.col1`–`.col6` `.IsLayer` `.IsGrow` `.IsFix` `.IsIcon` `.IsRow` `.IsShift` `.bp-sm` `.min2` | Wrapper > `.Cards` |
| `.Panel` | Container | `.item` | true | `.img20` `.img30` `.img40` `.img50` `.IsFlow` `.bp-sm` `.item.IsRev` |  Wrapper > `.Panel` |
| `.ImgText` | Container | `figure` + `>div` | true | `.img10`–`.img100` `.IsRev` `.bp-sm` | Wrapper > `.ImgText` |
| `.Toggle` | Component | `summary` `.ToggleIcon` | true | `.IsQa` `.has_img` `.bp-sm` (on `.has_img`) | Wrapper > `.Toggle` |
| `.Flex55` `.Flex46` `.Flex64` `.Flex37` `.Flex73` `.Flex28` `.Flex82` | Wrapper | 2 direct children | false | `.bp-sm` `--few` | FlexR > Image + Container |
| `.Wrap` | Wrapper | - | false | - | Wrapper + `.Hero` + Wrapper |
| `.Hero` | Wrapper | `.back` + `.item` | false | - | Wrapper + `.Hero` + Wrapper |
| `.Stick` | Wrapper, Effect | `.StickItem` + `.StickScr` | false | `.IsRev` | `.Stick`>`h2.StickItem` + `.StickScr.panel` |
| `.RgbShift` | Effect | auto insert | true | `IsBeat` | Wrapper>`figure.RgbShift` + Component |
| `.MaskMosaique` | Effect | direct children or `[data-mask-mosaique-item]` | false | `.IsBack` `--mosaique-size-factor` `--mosaique-stagger` | `.Cards.MaskMosaique` / media wrapper |
| `.WaveHover` | `<WaveHover>` or `useWaveHover` | `.item` | true | - | ラッパー `.WaveHover` > 任意マークアップ（例: `ul` 無修飾） |
| `.PathDraw` | Effect |  `path` in `svg` | true | `--PDS` `--PES` `--PVM`  | Wrapper > `.PathDraw>svg` + Container |
| `.BorderDraw` | Effect | auto insert | false | `.IsDown` `--PVM` `--PDS` | `.Panel` > `.item.BorderDraw` |
| `.BudouxFade` | Effect | auto insert `.BudouxFadePhrase` | false | `--BudouxFadeMin` `--BudouxFadeTrigger` `--BudouxFadeRange` | text block |
| `.LottieScroll` | Effect | DotLottieReact | true | `IsDemo` `--canvasH` | `.Stick` > `.StickItem.LottieScroll` + `.StickScr` |
| `.StickyStep` | Effect | direct children | false | `--top` `--step` | `.StickyStep` > span* (段階的にずれるsticky) |
| `.DescList` | Container | `dl` > `dt` + `dd` | false | `.IsSimple` `.IsZebra` `.IsPlain` `.IsBorder` `.IsHead` `.IsFrame` `.IsColumn` `.IsTimeline` `.IsCenter`  | Wrapper > `.DescList` |
| `.BorderT` `.BorderB` `.BorderL` `.BorderR` `.BorderX` `.BorderY` `.BorderXY` | Modifier | - | false | - | `_02base.scss` `var(--line)`（TBLR / inline・block 軸 / 全周） |

## 汎用 component
| component | props | 書き方 |
|-------|------|----------|
| `Image` | - | `image` `className` | `<Image image={path} />` |
| `ImageSvg` | - | `svg` `className` | `<ImageSvg svg="file.svg" />` |

詳細：`_10UNIT.scss` （編集禁止）
