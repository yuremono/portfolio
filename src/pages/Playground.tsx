import type { CSSProperties } from "react";
import { Panel, PanelItem } from "../components/Panel";
import { Cards, CardsItem } from "../components/Cards";
import { Image } from "../components/Image";
// import { RgbShift } from "../components/RgbShift";
import { PathDraw } from "../components/PathDraw";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { getAssetPath } from "../lib/assetPath";

function Playground() {
	useClientRuntime();

	return (
		<>
			<Header className="" />

			<main id="" className=" min-h-screen mt-[--head]">
				{/* Hero */}
				<section className="Hero out text-white">
					<figure className="back">
						<img
							src={getAssetPath("/images/picsum/001.jpg")}
							alt=""
							loading="lazy"
						/>
					</figure>
					<div className="item">
						<h1 className="font-bold tracking-tight drop-shadow-lg">
							Playground
						</h1>
						<p className="mt-4 font-light">
							コンポーネントのプレイグラウンドページ
						</p>
					</div>
				</section>

				{/* Panel - img50, 画像なし, 3アイテム */}
				<Panel className="img50" style={{} as CSSProperties}>
					<PanelItem className="items-center">
						<div>
							<h3 className="font-bold mb-2">
								<span className="sub block">Service 01</span>
								デザイン
							</h3>
							<p>
								クリエイティブなデザインでブランドの魅力を最大限に引き出します。
							</p>
						</div>
					</PanelItem>
					<PanelItem className="items-center">
						<div>
							<h3 className="font-bold mb-2">
								<span className="sub block">Service 02</span>
								開発
							</h3>
							<p>
								最新技術を活用した高品質なWebアプリケーションを開発します。
							</p>
						</div>
					</PanelItem>
					<PanelItem className="items-center">
						<div>
							<h3 className="font-bold mb-2">
								<span className="sub block">Service 03</span>
								運用
							</h3>
							<p>
								継続的な改善とサポートでビジネスの成長を支援します。
							</p>
						</div>
					</PanelItem>
				</Panel>

				{/* Wrap + Stick + RgbShift */}
				<section
					className="Wrap bg-[--MC] text-white"
					style={{} as CSSProperties}
				>
					<div
						className="Stick items-start"
						style={{} as CSSProperties}
					>
						{/* <RgbShift
							src={getAssetPath("/images/p-1.svg")}
							alt="ロゴ"
							className="IsBeat StickItem sticky min-h-[100lvh] content-center"
						/> */}
						<Panel
							className="StickScr img40 IsFlow"
							style={{} as CSSProperties}
						>
							<PanelItem className="items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/002.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2">
										<span className="sub block">
											Step 01
										</span>
										企画
									</h3>
									<p>
										ヒアリングを通じてプロジェクトの方向性を決定します。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="IsRev items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/003.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2">
										<span className="sub block">
											Step 02
										</span>
										制作
									</h3>
									<p>デザインと開発を並行して進めます。</p>
								</div>
							</PanelItem>
							<PanelItem className="items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/004.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2">
										<span className="sub block">
											Step 03
										</span>
										納品
									</h3>
									<p>
										品質確認後、本番環境へデプロイします。
									</p>
								</div>
							</PanelItem>
						</Panel>
					</div>
				</section>

				{/* Stick + PathDraw + Cards */}
				<section className="" style={{} as CSSProperties}>
					<div
						className="Stick IsRev items-start"
						style={{} as CSSProperties}
					>
						<PathDraw className="StickItem sticky min-h-[100lvh] content-center">
							<svg
								viewBox="0 0 100 100"
								role="img"
								aria-label="プレースホルダーSVG"
							>
								<path
									d="M10,50 L90,50"
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
								<path
									d="M50,10 L50,90"
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
								<circle
									cx="50"
									cy="50"
									r="30"
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
							</svg>
						</PathDraw>
						<Cards
							className="StickScr col2"
							style={{} as CSSProperties}
						>
							<CardsItem>
								<Image
									image={getAssetPath(
										"/images/picsum/005.jpg",
									)}
								/>
							</CardsItem>
							<CardsItem>
								<Image
									image={getAssetPath(
										"/images/picsum/006.jpg",
									)}
								/>
							</CardsItem>
							<CardsItem>
								<Image
									image={getAssetPath(
										"/images/picsum/007.jpg",
									)}
								/>
							</CardsItem>
							<CardsItem>
								<Image
									image={getAssetPath(
										"/images/picsum/008.jpg",
									)}
								/>
							</CardsItem>
						</Cards>
					</div>
				</section>
			</main>

			<Footer />
		</>
	);
}

export default Playground;
