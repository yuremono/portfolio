# 口語指示 → 骨格 HTML の例

**口語指示 だけ**で構造を伝えたときの解釈例と、実装時の注意点をまとめる。

## Stick と StickScr（スクロール列）

- `.Stick` の直下は、**固定側**（`.StickItem`）と**スクロール側**（`.StickScr`）の2列になる想定（`CLASS.md`・`_10UNIT.scss`）。
- スクロール側の中身が **`Cards` など別 CustomClass そのもの**である場合、**余計なラッパー `div` を挟まず**、**その要素に `StickScr` と `Cards`（と Value 等）を同じノードに付ける**。

  - 悪い例: `Stick` > `StickItem` + `div.StickScr` > `div.Cards`（`StickScr` 専用の箱だけが増える）
  - よい例: `Stick` > `StickItem` + `div.StickScr.Cards.col2`（スクロール列＝カード列を1要素で表す）

- ユーザーが `StickScr` を言及し忘れていても、Stick の骨格として必要なら付与するが、**上記のとおり `Cards` と同居させる**ことを優先する。

---

## 例1: Stick ＋ SVG（StickItem）＋ Cards（col2・4アイテム）

**口語**

メイン直下にスティッククラス月のセクションを配置してその中にあのSVG画像を配置してスティックアイテムクラスを付けるその隣にカーズクラスを置いてCore2モディファイヤーを付けるアイテムは4つセクションはここまで

**解釈**
メイン直下にスティッククラス**付き**のセクションを配置し、その中に SVG を置き **StickItem** を付ける。その**隣**に **Cards** を置き、**col2** モディファイア（「Core2」等の誤変換あり）を付け、アイテムは4つ。セクションはここまで。

**骨格（最小スニペット）**

```html
<section class="Stick">
  <div class="StickItem">
    <svg></svg>
  </div>
  <div class="StickScr Cards col2">
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
    <div class="item"></div>
  </div>
</section>
```

---

## 例2: Wrap ＋ h2（.sub）＋ Flex46 ＋ h3 ＋ Panel

**口語**

ルート直下にラップクラス付きのセクションを作成する中にH2タグを入れて中にドットサブ装飾文字を入れる次にフレックス46を配置してその中にH3タグとパネルを入れるセクションはここまで

**解釈**
ルート直下に **Wrap** 付きのセクションを作る。中に **h2** を入れ、その中に**サブ装飾文字**（プロジェクトでは `span.sub` 等）。次に **Flex46** を置き、その中に **h3** と **Panel**。セクションはここまで。

**骨格（最小スニペット）**

```html
<section class="Wrap">
  <h2>
    <span class="sub"></span>
  </h2>
  <div class="Flex46">
    <h3></h3>
    <div class="Panel">
      <div class="item"></div>
    </div>
  </div>
</section>
```

---

## Reference

- [voice-input-patterns.md](../../../voice-input-patterns.md) 
