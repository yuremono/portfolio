import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { getAssetPath } from "../lib/assetPath";
import { Image } from "../components/Image";
import { Cards, CardsItem } from "../components/Cards";
import { Panel, PanelItem } from "../components/Panel";
import { ImgText } from "../components/ImgText";
import { RgbShift } from "../components/EffectRgbShift";
import { BorderDraw } from "../components/EffectBorderDraw";

function Test3() {
	useClientRuntime();

	return (
		<>
			<Header />

			<main className="mt-[--head]">
				{/* Hero Section - Full width with layered content & RgbShift effect */}
				<section className="Hero out bg-[--TC]">
					<RgbShift className="IsBeat">
						<figure className="back">
							<img
								src={getAssetPath("/images/picsum/001.jpg")}
								alt=""
								className="opacity-30"
							/>
						</figure>
					</RgbShift>
					<div className="item text-white text-center" role="banner" aria-label="メインヒーローセクション">
						<p className="text-sm tracking-[0.3em] uppercase mb-4 opacity-70 animate-pulse">
							Awards Showcase
						</p>
						<h1 className="text-[clamp(36px,8vw,72px)] font-bold leading-none mb-8">
							Design<br />Excellence
						</h1>
						<p className="max-w-md mx-auto text-lg opacity-90">
							クリエイティブと技術の融合が生む、次世代のデジタル体験を体感してください。
						</p>
					</div>
				</section>

				{/* Stats Section - Asymmetric Grid */}
				<section className="Wrap into mt-[--MY]" aria-labelledby="stats-heading">
					<div className="Flex82 [--few:45%]">
						<div className="text-white bg-[--AC] p-12 flex items-center justify-center min-h-[300px] relative overflow-hidden group">
							<div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 transition-transform duration-700 group-hover:scale-110"></div>
							<div className="relative z-10">
								<p className="text-[clamp(48px,10vw,96px)] font-bold leading-none">
									12
								</p>
								<p className="text-sm tracking-wider uppercase mt-2 opacity-80">
									Years of Excellence
								</p>
							</div>
						</div>
						<div className="bg-[--BC] p-12 flex flex-col justify-center">
							<h2 id="stats-heading" className="text-[clamp(24px,4vw,40px)] font-bold mb-6">
								Award Winning
							</h2>
							<p className="text-[--GR] leading-relaxed">
								国際的なデザインコンペティションで数々の賞を受賞。
								革新的なアプローチと卓越した実行力で、業界の標準を常に高め続けています。
							</p>
						</div>
					</div>
				</section>

				{/* Featured Works - Cards with IsLayer & BorderDraw */}
				<section className="Wrap into mt-[--MY]" aria-labelledby="works-heading">
					<div className="mb-12">
						<p className="text-sm tracking-[0.3em] uppercase text-[--AC] mb-2">
							Portfolio
						</p>
						<h2 id="works-heading" className="text-[clamp(28px,5vw,48px)] font-bold">
							Featured Works
						</h2>
					</div>
					<Cards className="col3 IsLayer" style={{ gap: "2rem" }}>
						<CardsItem className="bg-[--BK] text-white overflow-hidden group">
							<div className="aspect-[4/5] overflow-hidden relative">
								<div className="absolute inset-0 bg-[--MC]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
								<img
									src={getAssetPath("/images/picsum/004.jpg")}
									alt="Neo Tokyo - Brand Identity"
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
							</div>
							<div className="p-6">
								<p className="text-xs tracking-wider opacity-60 mb-2">
									Brand Identity
								</p>
								<h3 className="text-xl font-bold">Neo Tokyo</h3>
							</div>
						</CardsItem>
						<CardsItem className="bg-[--BK] text-white overflow-hidden group">
							<div className="aspect-[4/5] overflow-hidden relative">
								<div className="absolute inset-0 bg-[--SC]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
								<img
									src={getAssetPath("/images/picsum/005.jpg")}
									alt="Prism Digital - Web Design"
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
							</div>
							<div className="p-6">
								<p className="text-xs tracking-wider opacity-60 mb-2">
									Web Design
								</p>
								<h3 className="text-xl font-bold">Prism Digital</h3>
							</div>
						</CardsItem>
						<CardsItem className="bg-[--BK] text-white overflow-hidden group">
							<div className="aspect-[4/5] overflow-hidden relative">
								<div className="absolute inset-0 bg-[--AC]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
								<img
									src={getAssetPath("/images/picsum/006.jpg")}
									alt="Flow State - Motion Design"
									className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
								/>
							</div>
							<div className="p-6">
								<p className="text-xs tracking-wider opacity-60 mb-2">
									Motion Design
								</p>
								<h3 className="text-xl font-bold">Flow State</h3>
							</div>
						</CardsItem>
					</Cards>
				</section>

				{/* Process - Panel with IsFlow & BorderDraw */}
				<section className="out bg-[--BC] mt-[--MY]" aria-labelledby="process-heading">
					<div className="Wrap into py-20">
						<div className="mb-16">
							<p className="text-sm tracking-[0.3em] uppercase text-[--AC] mb-2">
								Process
							</p>
							<h2 id="process-heading" className="text-[clamp(28px,5vw,48px)] font-bold">
								How We Work
							</h2>
						</div>
						<Panel className="img30 IsFlow">
							<BorderDraw className="IsDown">
								<PanelItem>
									<Image
										image={getAssetPath("/images/picsum/007.jpg")}
										className="aspect-square"
										alt="Discover phase"
									/>
									<div className="p-8">
										<span className="text-[length:var(--h3FZ)] font-bold text-[--AC]">
											01
										</span>
										<h3 className="text-2xl font-bold mt-2 mb-4">Discover</h3>
										<p className="text-[--GR]">
											クライアントのビジョンを深く理解し、プロジェクトの核心を捉えます。
											徹底的なリサーチと共創セッションにより、
											共有されるゴールを設定します。
										</p>
									</div>
								</PanelItem>
							</BorderDraw>
							<BorderDraw className="IsDown">
								<PanelItem className="IsRev">
									<Image
										image={getAssetPath("/images/picsum/008.jpg")}
										className="aspect-square"
										alt="Design phase"
									/>
									<div className="p-8">
										<span className="text-[length:var(--h3FZ)] font-bold text-[--AC]">
											02
										</span>
										<h3 className="text-2xl font-bold mt-2 mb-4">Design</h3>
										<p className="text-[--GR]">
											戦略的思考と創造的表現の融合。
											各要素に意味を持たせ、
											美しさと機能性を両立したソリューションを設計します。
										</p>
									</div>
								</PanelItem>
							</BorderDraw>
							<BorderDraw className="IsDown">
								<PanelItem>
									<Image
										image={getAssetPath("/images/picsum/009.jpg")}
										className="aspect-square"
										alt="Deliver phase"
									/>
									<div className="p-8">
										<span className="text-[length:var(--h3FZ)] font-bold text-[--AC]">
											03
										</span>
										<h3 className="text-2xl font-bold mt-2 mb-4">Deliver</h3>
										<p className="text-[--GR]">
											品質と细节へのこだわり。
											最新技術とベストプラクティスを駆使し、
											卓越したデジタル体験を実現します。
										</p>
									</div>
								</PanelItem>
							</BorderDraw>
						</Panel>
					</div>
				</section>

				{/* Philosophy - ImgText with asymmetric layout */}
				<section className="Wrap into mt-[--MY]" aria-labelledby="philosophy-heading">
					<div className="mb-12">
						<p className="text-sm tracking-[0.3em] uppercase text-[--AC] mb-2">
							Philosophy
						</p>
						<h2 id="philosophy-heading" className="text-[clamp(28px,5vw,48px)] font-bold">
							Our Approach
						</h2>
					</div>
					<ImgText className="img40">
						<div className="overflow-hidden group">
							<Image
								image={getAssetPath("/images/picsum/010.jpg")}
								className="aspect-[3/4] transition-transform duration-700 group-hover:scale-105"
								alt="Design philosophy visual"
							/>
						</div>
						<div className="p-8 flex flex-col justify-center">
							<h3 className="text-3xl font-bold mb-6">
								Design with Purpose
							</h3>
							<p className="text-[--GR] leading-relaxed mb-6">
								美しいデザインだけでなく、意味のあるデザインを。
								ビジネス目標とユーザー体験の完璧なバランスを追求し、
								測定可能な成果を生み出すソリューションを提供します。
							</p>
							<p className="text-[--GR] leading-relaxed">
								私たちはデザイナーであり、戦略家であり、
								テクノロジストです。この多様な視点が、
								唯一無二の価値を創造します。
							</p>
						</div>
					</ImgText>
				</section>

				{/* Services - Cards with enhanced hover effects */}
				<section className="out bg-[--BK] text-white mt-[--MY]" aria-labelledby="services-heading">
					<div className="Wrap into py-20">
						<div className="mb-16">
							<p className="text-sm tracking-[0.3em] uppercase text-[--AC] mb-2">
								Services
							</p>
							<h2 id="services-heading" className="text-[clamp(28px,5vw,48px)] font-bold">
								What We Do
							</h2>
						</div>
						<Cards className="col2" style={{ gap: "1px" }}>
							<CardsItem className="bg-[--BK] p-10 hover:bg-[--GR20] transition-all duration-500 group cursor-default">
								<p className="text-[length:var(--h3FZ)] font-bold text-[--AC] mb-4 group-hover:scale-110 transition-transform origin-left">
									01
								</p>
								<h3 className="text-2xl font-bold mb-4">Brand Strategy</h3>
								<p className="opacity-70">
									ブランドの本質を抽出し、
									一貫性のあるストーリーを構築。
									デジタルとオフラインを繋ぐ統合的なブランディングを提供します。
								</p>
							</CardsItem>
							<CardsItem className="bg-[--BK] p-10 hover:bg-[--GR20] transition-all duration-500 group cursor-default">
								<p className="text-[length:var(--h3FZ)] font-bold text-[--AC] mb-4 group-hover:scale-110 transition-transform origin-left">
									02
								</p>
								<h3 className="text-2xl font-bold mb-4">Digital Design</h3>
								<p className="opacity-70">
									ウェブサイト、アプリ、インタラクティブ体験。
									最新技術と洗練されたデザインで、
									印象的なデジタル製品を創造します。
								</p>
							</CardsItem>
							<CardsItem className="bg-[--BK] p-10 hover:bg-[--GR20] transition-all duration-500 group cursor-default">
								<p className="text-[length:var(--h3FZ)] font-bold text-[--AC] mb-4 group-hover:scale-110 transition-transform origin-left">
									03
								</p>
								<h3 className="text-2xl font-bold mb-4">Motion & Visual</h3>
								<p className="opacity-70">
									動きと静止画の調和。
									モーショングラフィックス、3Dビジュアライゼーション、
									ビデオプロダクションで物語を紡ぎます。
								</p>
							</CardsItem>
							<CardsItem className="bg-[--BK] p-10 hover:bg-[--GR20] transition-all duration-500 group cursor-default">
								<p className="text-[length:var(--h3FZ)] font-bold text-[--AC] mb-4 group-hover:scale-110 transition-transform origin-left">
									04
								</p>
								<h3 className="text-2xl font-bold mb-4">Creative Technology</h3>
								<p className="opacity-70">
									アイデアを具現化するテクノロジー。
									WebGL、インタラクティブインスタレーション、
									実験的プロトタイピングを駆使します。
								</p>
							</CardsItem>
						</Cards>
					</div>
				</section>

				{/* Contact CTA - Enhanced with animation */}
				<section className="Wrap into mt-[--MY] text-center" aria-labelledby="cta-heading">
					<div className="bg-[--AC] text-white p-16 md:p-24 relative overflow-hidden group">
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
						<p className="text-sm tracking-[0.3em] uppercase opacity-70 mb-4 relative z-10">
							Let's Create Together
						</p>
						<h2 id="cta-heading" className="text-[clamp(32px,6vw,64px)] font-bold mb-8 relative z-10">
							Start Your Project
						</h2>
						<p className="max-w-xl mx-auto mb-10 opacity-90 relative z-10">
							次のプロジェクトで、一緒に素晴らしいものを創りませんか。
							お気軽にお問い合わせください。
						</p>
						<a
							href="#contact"
							className="inline-block bg-white text-[--TC] px-10 py-4 font-bold hover:bg-[--BC] transition-all duration-300 hover:scale-105 hover:shadow-2xl relative z-10"
							aria-label="お問い合わせフォームへ"
						>
							Contact Us
						</a>
					</div>
				</section>
			</main>

			<Footer />
		</>
	);
}

export default Test3;
