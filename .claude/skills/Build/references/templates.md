# Import & Usage Templates

Build スキルで使用するコンポーネントのインポートと使用例。

---

## Common Imports

```tsx
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { getAssetPath } from "../lib/assetPath";
```

---

## CustomClass Components

SKILLが存在するcomponent、詳細は各スキルファイルを参照。

| SKILL | Description | Import |
|-------|-------------|-------|
| Panel | 縦並びコンテナ（ImgTextの集合体） | `import { Panel, PanelItem } from "../components/Panel";` |
| Cards | 横並びカードコンテナ（2-5列） | `import { Cards, CardsItem } from "../components/Cards";` |
| ImgText | 画像 + テキスト横並び | `import { ImgText } from "../components/ImgText";` |
| Toggle | 折りたたみコンテンツ（Q&A 等） | `import { Toggle, ToggleSummary, ToggleBody } from "../components/Toggle";` |

---

## Image Components

### Image

**用途**: 通常画像用。`<figure><img/></figure>` を出力。

```tsx
import { Image } from "../components/Image";

// 使用例
<Image image={getAssetPath("/images/picsum/001.jpg")} />
```

### ImageSvg

**用途**: SVG インライン展開用。サニタイズ処理付き。

```tsx
import { ImageSvg } from "../components/Image";

// ファイルパス指定（public/images/svg/ からの相対パス）
<ImageSvg svg="house-icon.svg" />

// SVG 文字列直接指定
<ImageSvg svg="<svg>...</svg>" />
```

---

### Panel

**用途**: 縦並びコンテナ。ImgText の集合体として使用。**子要素方式**。

```tsx
import { Panel, PanelItem } from "../components/Panel";
import { Image } from "../components/Image";

// 使用例
<Panel className="img40 IsFlow">
  <PanelItem>
    <Image image={getAssetPath("/images/picsum/001.jpg")} />
    <div>
      <h3>タイトル</h3>
      <p>コンテンツ</p>
    </div>
  </PanelItem>
  <PanelItem className="IsRev">
    <Image image={getAssetPath("/images/picsum/002.jpg")} />
    <div>
      <h3>タイトル（反転）</h3>
      <p>IsRev で画像を右側に配置</p>
    </div>
  </PanelItem>
</Panel>
```

**Value classes**: `img20`, `img30`, `img40`, `img50`
**Modifier classes**: `IsFlow`（矢印接続）, `IsRev`（反転）

---

### Cards

**用途**: 横並びカードコンテナ。2-5列で配置。**子要素方式**。

```tsx
import { Cards, CardsItem } from "../components/Cards";
import { Image } from "../components/Image";

// 使用例
<Cards className="col3">
  <CardsItem>
    <Image image={getAssetPath("/images/picsum/001.jpg")} />
    <div className="p-4">
      <h3>カード1</h3>
      <p>説明文</p>
    </div>
  </CardsItem>
  <CardsItem>
    <Image image={getAssetPath("/images/picsum/002.jpg")} />
    <div className="p-4">
      <h3>カード2</h3>
      <p>説明文</p>
    </div>
  </CardsItem>
</Cards>
```

**Value classes**: `col2`, `col3`, `col4`, `col5`
**Modifier classes**: `IsLayer`, `IsFix`, `IsGrow`

---

### ImgText

**用途**: 画像とテキストを横並びに配置。**子要素方式**。

```tsx
import { ImgText } from "../components/ImgText";
import { Image } from "../components/Image";

// 使用例
<ImgText className="img40 IsRev">
  <Image image={getAssetPath("/images/picsum/012.jpg")} />
  <div>
    <h3>タイトル（反転）</h3>
    <p>IsRev で画像を右側に配置</p>
  </div>
</ImgText>
```

**Value classes**: `img20`, `img30`, `img40`, `img50`（画像幅）
**Modifier classes**: `IsRev`（反転）

---

### Toggle

**用途**: 折りたたみコンテンツ。Q&A 形式などで使用。

```tsx
import { Toggle, ToggleSummary, ToggleBody } from "../components/Toggle";

// 使用例
<Toggle className="IsQa">
  <ToggleSummary>質問</ToggleSummary>
  <ToggleBody>
    <p>回答</p>
  </ToggleBody>
</Toggle>
```

**Modifier classes**: `IsQa`（Q&A 形式）

---

## CSS Classes Only（コンポーネント不要）

### Hero

**用途**: 画像にテキストを重ねるセクション

```tsx
// コンポーネント不要。クラスのみで構築。
<section className="Hero out">
  <figure className="back">
    <img src={getAssetPath("/images/hero.jpg")} alt="" loading="lazy" />
  </figure>
  <div className="item">
    <h1>タイトル</h1>
    <p>サブタイトル</p>
  </div>
</section>
```

**注意**: 子要素に `Item` / `back` クラスを付与。

---

### Stick

**用途**: 2領域レイアウト。StickItem固定、StickScrスクロール。

```tsx
// コンポーネント不要。クラスのみで構築。
<div className="Stick items-start">
  <div className="StickItem sticky min-h-[100lvh] content-center">
    {/* fixed content */}
  </div>
  <div className="StickScr">
    {/* scroll content */}
  </div>
</div>
```

**注意**: 子要素に `StickItem` / `StickScr` クラスの付与が必要。

---

### FlexR

**用途**: 2コンテンツの比率制御。画像とテキストを特定の比率で配置。

```tsx
import { Image } from "../components/Image";

// コンポーネント不要。クラスのみで構築。
<div className="Flex37">
  <Image image={getAssetPath("/images/picsum/015.jpg")} />
  <div>
    <h3>タイトル</h3>
    <p>左30%、右70%</p>
  </div>
</div>
```

**Ratio classes**:
| Class | Ratio | Description |
|-------|-------|-------------|
| `Flex55` | 50%:50% | equal |
| `Flex46` | 40%:60% | image 40% |
| `Flex64` | 60%:40% | image 60% |
| `Flex37` | 30%:70% | image 30% |
| `Flex73` | 70%:30% | image 70% |
| `Flex28` | 20%:80% | image 20% |
| `Flex82` | 80%:20% | image 80% |

---

## Effects & Wrappers

### RgbShift

**用途**: RGB クロマシフト効果。

```tsx
import { RgbShift } from "../components/RgbShift";

// 画像ソースを指定
<RgbShift src="/images/image.svg" alt="Description" />

// 子要素を渡す
<RgbShift>
  <svg>...</svg>
</RgbShift>
```

---

### PathDraw

**用途**: スクロール連動 SVG パス描画アニメーション。**既存 SVG ファイルを使用**。

```tsx
import { PathDraw } from "../components/PathDraw";

// 使用例
<PathDraw>
  <svg viewBox="0 0 100 100">
    <path d="M0,0 L100,100" />
  </svg>
</PathDraw>
```

---

### BorderDraw

**用途**: ボーダー描画アニメーション。**クラス追加のみで動作**（コンポーネント不要）。SVG を自動生成するため、既存 SVG ファイルは不要。

```tsx
// コンポーネント不要。クラスを追加するだけ。
<div className="BorderDraw">...</div>
<div className="BorderDraw IsDown">...</div>  {/* vertical direction */}
```

**Modifier class**: `IsDown` - vertical drawing direction

---

### LottieScroll

**用途**: スクロール連動 Lottie アニメーション。DotLottie 形式のファイルを使用。

```tsx
import { LottieScroll } from "../components/LottieScroll";

// 使用例
<LottieScroll
  src={getAssetPath("/lottie/animation.lottie")}
  segmentStartRatio={0}
  segmentEndRatio={1}
  autoplayStopRatio={0.61}
  className="StickItem IsDemo"
  layout={{ fit: "cover", align: [0.5, 0.5] }}
  renderConfig={{ autoResize: true }}
/>
```

**Props**:
| Prop | Type | Description |
|------|------|-------------|
| `src` | string | Lottie ファイルパス |
| `segmentStartRatio` | number | 再生開始位置（0-1） |
| `segmentEndRatio` | number | 再生終了位置（0-1） |
| `autoplayStopRatio` | number | 自動再生停止位置（segment 内 0-1） |
| `className` | string | 追加クラス（先頭に `LottieScroll` が自動付与） |

**Modifier class**: `IsDemo`（明るさアニメーション）
**CSS 変数**: `--canvasH`（canvas 最小高さ）

---

### StickyStep

**用途**: 段階的にずれる sticky 要素。スクロール時に子要素が順番に現れる。

```tsx
// コンポーネント不要。クラスを追加するだけ。
<div className="StickyStep [--step:3em]">
  <span>1つ目</span>
  <span>2つ目</span>
  <span>3つ目</span>
</div>
```

**CSS 変数**:
| 変数 | デフォルト | Description |
|------|-----------|-------------|
| `--top` | `calc(100vh - var(--head))` | sticky 位置 |
| `--step` | `4em` | 子要素間の縦間隔 |

---

## Full Template

```tsx
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

// CustomClass components (as needed)
import { Panel, PanelItem } from "../components/Panel";
import { Cards, CardsItem } from "../components/Cards";
import { ImgText } from "../components/ImgText";
import { Toggle, ToggleSummary, ToggleBody } from "../components/Toggle";
import { Image, ImageSvg } from "../components/Image";

// Effects & Wrappers
import { PathDraw } from "../components/PathDraw";
import { RgbShift } from "../components/RgbShift";
import { LottieScroll } from "../components/LottieScroll";

// Common
import { Header } from "../components/Header";
import { useByosRuntime } from "../hooks/useByosRuntime";
import { getAssetPath } from "../lib/assetPath";
```
