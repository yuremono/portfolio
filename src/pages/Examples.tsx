// CustomClass components
import { useRef } from "react";
import { Panel, PanelItem } from "../components/Panel";
import { Cards, CardsItem } from "../components/Cards";
import { Toggle, ToggleSummary, ToggleBody } from "../components/Toggle";
import { Image } from "../components/Image";
// import { RgbShift } from "../components/RgbShift";
import { PathDraw } from "../components/PathDraw";
import { LottieScroll } from "../components/LottieScroll";
import { HoudiniGalleryCards } from "../components/HoudiniGalleryCards";


// Common
import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { Footer } from "../components/Footer";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";

function Examples() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
		<PageRoot ref={pageRootRef}>
			<Header className="" />

			<main className="mt-[--head]">
				<section className="out Stick IsColumn mt-[--Nhead]">
					<LottieScroll
						src={getAssetPath("/lottie/untitled.lottie")}
						segmentStartRatio={0}
						segmentEndRatio={1}
						autoplayStopRatio={0.61}
						className="StickItem IsDemo"
						layout={{ fit: "cover", align: [0.5, 0.5] }}
						renderConfig={{ autoResize: true }}
					/>
					<div className="StickyStep StickScr [--step:3em] h3FZ">
						<span>LottieScrollは</span>
						<span>
							特定ファイル向けに
							<br />
							調整されてる
						</span>
						<span>StickyStepは</span>
						<span>FV向け調整</span>
					</div>
					</section>
					<section className="Wrap PX bg-TC text-[--WH] Eng">
						<div className="Cards col4 MaskMosaique [--mosaique-colors:#3548FE,#353F9E,#4855DB,#151A36,#2D38B7,#434ECB]">
							<div className="item min-h-[30lvh] p-6">
								<p className="text-xl">MaskMosaique</p>
								<h2 className="h3FZ">Layered block</h2>
							</div>
							<div className="item min-h-[30lvh] p-6">
								<p className="text-xl">MaskMosaique</p>
								<h2 className="h3FZ">Random reveal</h2>
							</div>
							<div className="item relative min-h-[30lvh] overflow-hidden p-6">
								<video
									className="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
									src={getAssetPath("/video/demo.mp4")}
									autoPlay
									muted
									loop
									playsInline
								/>
								<div className="relative">
									<p className="text-xl">MaskMosaique</p>
									<h2 className="h3FZ">Media layer</h2>
								</div>
							</div>
							<div className="item min-h-[30lvh] p-6">
								<p className="text-xl">MaskMosaique</p>
								<h2 className="h3FZ">Canvas mask</h2>
							</div>
						</div>
					</section>
					{/* Houdini Paint Worklet */}
					<section className="out bg-BC Eng">
						<HoudiniGalleryCards />
					</section>

					{/* DescList */}
					<section className="Wrap into">
					<h2>DescList</h2>

					<div className="DescList ">
						<dl>
							<dt>Modifierなし</dt>
							<dd>装飾なしの最小構成</dd>
							<dt>min padding</dt>
							<dd>パディングを最小にしたコンパクト表示</dd>
						</dl>
					</div>

					<div className="DescList IsSimple">
						<dl>
							<dt>IsSimple</dt>
							<dd>下線で区切るシンプルなDLリスト</dd>
							<dt>border-bottom</dt>
							<dd>dt/ddの下部にボーダーを表示</dd>
						</dl>
					</div>

					<div className="DescList IsZebra">
						<dl>
							<dt>IsZebra</dt>
							<dd>奇数行に背景色を付けるストライプ表示</dd>
							<dt>nth-of-type</dt>
							<dd>奇数行にBC背景色を適用</dd>
						</dl>
					</div>

					<div className="DescList IsBorder">
						<dl>
							<dt>IsBorder</dt>
							<dd>dl単位で下線を引くボーダー区切り</dd>
							<dt>line-height</dt>
							<dd>行間1.6で読みやすさを確保</dd>
						</dl>
					</div>

					<div className="DescList IsHead">
						<dl>
							<dt>IsHead</dt>
							<dd>dlにMCカラーの下線を付与</dd>
						</dl>
						<dl>
							<dt>dt background</dt>
							<dd>下線装飾のためdt,dd一と組づつdlでwrap</dd>
						</dl>
					</div>

					<div className="DescList IsColumn">
						<dl>
							<dt>IsColumn</dt>
							<dd>dt/ddを縦に並べるレイアウト</dd>
							<dt>flex-direction</dt>
							<dd>columnでdt上・dd下の構成</dd>
						</dl>
					</div>

					<div className="DescList IsTimeline">
						<dl>
							<dt>IsTimeline</dt>
							<dd>縦線と丸マーカーで沿革風に表示</dd>
							<dt>pseudo elements</dt>
							<dd>MCカラーの線と円で接続を表現</dd>
						</dl>
					</div>

					<div className="DescList IsCenter">
						<dl>
							<dt>IsCenter</dt>
							<dd>dtを右寄せにして中央で区切る</dd>
							<dt>text-align right</dt>
							<dd>ラベルと値の境界を揃える</dd>
						</dl>
					</div>
				</section>

				{/* Hero */}
				<section className="Hero out">
					<figure className="back">
						<img
							src={getAssetPath("/images/picsum/003.jpg")}
							alt=""
							loading="lazy"
						/>
					</figure>
					<div className="item">
						<h1>Hero タイトル</h1>
						<p>サブタイトル</p>
					</div>
				</section>

				{/* PathDraw */}
				<section className="">
					<h2>PathDraw</h2>
					<p>スクロール連動 SVG パス描画アニメーション。</p>
					<svg
						viewBox="0 0 100 50"
						preserveAspectRatio="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<rect
							x="86.15"
							y="23.2"
							width="25.7"
							height="25.7"
							fill="var(--GR50)"
						/>
						<rect
							x="39.95"
							y="-8.725"
							width="26.9"
							height="40.35"
							fill="var(--GR50)"
						/>
						<rect
							x="-14.3"
							y="-4.9"
							width="30"
							height="20"
							fill="var(--GR50)"
						/>
						<rect
							x="79.35"
							y="-1.4"
							width="20.9"
							height="20.9"
							fill="var(--GR50)"
						/>
					</svg>

					<PathDraw className="[--stw:1]">
						<svg
							viewBox="0 0 100 100"
							role="img"
							aria-label="パス描画デモ"
						>
							<path
								d="M10,50 L90,50"
								stroke="currentColor"
								fill="none"
							/>
							<path
								d="M50,10 L50,90"
								stroke="currentColor"
								fill="none"
							/>
							<circle
								cx="50"
								cy="50"
								r="30"
								stroke="currentColor"
								strokeWidth="1"
								fill="none"
							/>
						</svg>
					</PathDraw>
				</section>

				{/* Panel */}
				<section className="">
					<h2>Panel</h2>
					<p>縦並びコンテナ。ImgText の集合体。</p>
					<h3>Panel img40 IsFlow</h3>
					<h3>
						BorderDraw.Panel.IsDown BorderDraw.PanelItem
						ボーダー描画アニメーション。BorderDrawは独立して使用可
					</h3>
					<Panel className="img40 IsFlow BorderDraw IsDown">
						<PanelItem className="BorderDraw">
							<Image
								image={getAssetPath("/images/picsum/002.jpg")}
							/>
							<div>
								<span className="sub">Step 01</span>
								<h3>タイトル</h3>
								<p>コンテンツ説明文</p>
							</div>
						</PanelItem>
						<PanelItem className="IsRev BorderDraw">
							<Image
								image={getAssetPath("/images/picsum/003.jpg")}
							/>
							<div>
								<span className="sub">Step 02</span>
								<h3>タイトル（反転）</h3>
								<p>IsRev で画像をStickItemに配置</p>
							</div>
						</PanelItem>
					</Panel>
				</section>

				{/* Cards */}
				<section className="Wrap into bg-[--BC]">
					<h2>Wrap</h2>
					<p>セクションラッパー</p>
					<h2>Cards</h2>
					<p>横並びカードコンテナ。</p>
					<h3>Cards col3</h3>
					<Cards className="col3">
						<CardsItem>
							<Image
								image={getAssetPath("/images/picsum/004.jpg")}
							/>
							<div className="p-4">
								<h3>カード1</h3>
								<p>説明文</p>
							</div>
						</CardsItem>
						<CardsItem>
							<Image
								image={getAssetPath("/images/picsum/005.jpg")}
							/>
							<div className="p-4">
								<h3>カード2</h3>
								<p>説明文</p>
							</div>
						</CardsItem>
						<CardsItem>
							<Image
								image={getAssetPath("/images/picsum/006.jpg")}
							/>
							<div className="p-4">
								<h3>カード3</h3>
								<p>説明文</p>
							</div>
						</CardsItem>
					</Cards>
				</section>

				{/* ImgText */}
				<section className="">
					<h2>ImgText</h2>
					<p>画像とテキスト横並び。</p>
					<h3>ImgText img40 IsRev</h3>
					<div className="ImgText img40 IsRev">
						<Image image={getAssetPath("/images/picsum/012.jpg")} />
						<div>
							<h3>タイトル（反転）</h3>
							<p>IsRev で画像をStickItemに配置</p>
						</div>
					</div>
				</section>

				{/* Toggle */}
				<section className="">
					<h2>Toggle</h2>
					<p>折りたたみコンテンツ。</p>
					<h3>Toggle IsQa</h3>
					<Toggle className="IsQa">
						<ToggleSummary>
							IsQaは`Q`と`A`の装飾を付与する
						</ToggleSummary>
						<ToggleBody>
							<p>IsQaは`Q`と`A`の装飾を付与する</p>
						</ToggleBody>
					</Toggle>
					<Toggle className="IsQa">
						<ToggleSummary>
							質問2：回答2：のような書き方はしないこと！
						</ToggleSummary>
						<ToggleBody>
							<p>質問2：回答2：のような書き方はしないこと！</p>
						</ToggleBody>
					</Toggle>
				</section>

				{/* FlexR */}
				<section className="">
					<h2>FlexR</h2>
					<p>2コンテンツ比率制御（クラスのみ）。</p>
					<h3>FlexR Flex37（30%:70%）</h3>
					<div className="Flex37">
						<Image image={getAssetPath("/images/picsum/015.jpg")} />
						<div>
							<h3>タイトル</h3>
							<p>左30%、右70%</p>
						</div>
					</div>
				</section>

				{/* Stick */}
				<section className="text-center ">
					<h2>Stick</h2>
					<p>
						2領域レイアウト。StickItemが固定、StickScrがスクロール。
					</p>
					<p>RgbShift クロマシフト効果。</p>

					<div className="Stick MY Wrap bg-[--TC] text-white text-left ">
						<div className="StickItem">
							<Image
								className=" RgbShift IsBeatY "
								image={getAssetPath("/images/picsum/014.jpg")}
							/>
						</div>
						<Panel className="StickScr img40">
							<PanelItem>
								<Image
									image={getAssetPath(
										"/images/picsum/016.jpg",
									)}
								/>
								<div>
									<h3>スクロールコンテンツ1</h3>
									<p>StickItemがスクロールされます</p>
								</div>
							</PanelItem>
							<PanelItem className="IsRev">
								<Image
									image={getAssetPath(
										"/images/picsum/017.jpg",
									)}
								/>
								<div>
									<h3>スクロールコンテンツ2</h3>
									<p>StickScrは固定されています</p>
								</div>
							</PanelItem>
							<PanelItem>
								<Image
									image={getAssetPath(
										"/images/picsum/016.jpg",
									)}
								/>
								<div>
									<h3>スクロールコンテンツ1</h3>
									<p>StickItemがスクロールされます</p>
								</div>
							</PanelItem>
						</Panel>
					</div>
				</section>
			</main>

			<Footer />
		</PageRoot>
	);
}

export default Examples;
