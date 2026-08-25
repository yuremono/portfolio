// ルール: src/pages/AGENTS.md。画像は public/images/。
import { useRef } from "react";
// import { Panel, PanelItem } from "../components/Panel";
// import { Toggle, ToggleSummary, ToggleBody } from "../components/Toggle";
import { Image } from "../components/Image";
// import { PathDraw } from "../components/PathDraw";
// import { LottieScroll } from "../components/LottieScroll";

// import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { CanvasFx } from "./CanvasFx";
// import { Footer } from "../components/Footer";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";

function Test9() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	// CanvasFx の対象は「CanvasFx クラスを付けた要素」。増減はクラスの付け外しだけ（ref・連番は不要）
	return (
		<PageRoot ref={pageRootRef} className="[--head:3.5rem] md:[--head:4.5rem] [--wid:840px] [--line:0.5rem_solid_var(--AC)] [--BGgrad:repeating-linear-gradient(45deg,var(--wine)_0_2rem,var(--forest)_2rem_4rem,var(--brownLT)_4rem_6rem)]">
			<main className="relative py-[--head]">
				<div className=" absolute inset-0 w-full">
					<div className=" BGgrad RandomRects relative min-h-[100svh]">
						<div className=" BorderXY item bg-[--GR] left-[8%] top-[79.3%] w-[20.3%] aspect-[2/3]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/003.jpg",
								)}
							/>
						</div>
						<div className="JsParticle item  left-[81.5%] top-[25.8%] w-[21.6%] aspect-[3/2]">
							<Image
								figureClassName="BabelRightDown [--rad:3rem] overflow-clip BorderXY border-GR "
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/011.jpg",
								)}
							/></div>
						<div className="CanvasFx overflow-visible item  left-[15.6%] top-[26%] w-[26.3%] aspect-[3/2]">
							<Image
								figureClassName="ScoopRightDown [--rad:3rem]   BorderXY border-WH"
								imgClassName="w-full h-full object-cover "
								image={getAssetPath(
									"/images/picsum/007.jpg",
								)}
							/></div>
						<div className=" rounded-[3rem] overflow-clip BorderXY border-SC item bg-[--GR] left-[82.4%] top-[90.8%] w-[23.2%] aspect-[3/2]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/019.jpg",
								)}
							/></div>
					</div>
					<div className=" RandomRects relative min-h-[100svh]">
						<div className=" BorderXY border-TC item bg-[--GR] left-[1.9%] top-[79.3%] w-[28.2%] aspect-[3/2]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/002.jpg",
								)}
							/></div>
						<div className="BorderXY item bg-[--GR] left-[94.5%] top-[87.6%] w-[26.6%] aspect-[2/3]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/014.jpg",
								)}
							/></div>
						<div className="BorderXY border-MC item bg-[--GR] left-[56.7%] top-[99.2%] w-[24.3%] aspect-[1/1]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/006.jpg",
								)}
							/></div>
						<div className="BorderXY item bg-[--GR] left-[69.2%] top-[37.6%] w-[21.2%] aspect-[1/1]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/017.jpg",
								)}
							/></div>
					</div>
					<div className="RandomRects relative min-h-[100svh]">
						<div className="BorderXY item bg-[--GR] left-[41.9%] top-[92.2%] w-[23.6%] aspect-[1/1]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/009.jpg",
								)}
							/></div>
						<div className="BorderXY border-SC item bg-[--GR] left-[83.1%] top-[85.7%] w-[23.1%] aspect-[3/2]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/020.jpg",
								)}
							/></div>
						<div className="BorderXY item bg-[--GR] left-[18.6%] top-[5.5%] w-[21.9%] aspect-[1/1]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/004.jpg",
								)}
							/></div>
						<div className="BorderXY item bg-[--GR] left-[60.1%] top-[18.6%] w-[28.7%] aspect-[2/3]">
							<Image
								figureClassName="w-full h-full"
								imgClassName="w-full h-full object-cover"
								image={getAssetPath(
									"/images/picsum/012.jpg",
								)}
							/></div>
					</div>
				</div>
				<div data-role="content" className="mt-0 text-WH WTS relative z-10 space-y-10">
					<h1 className="">Scattered Landscapes</h1>

					<p className="">
						広大な自然のなかに身を置くとき、人はいつも何かを思い出す。遠い記憶の断片が、風の匂いとともに戻ってくる。旅の始まりはいつも唐突で、終わりはいつも曖昧だ。それでも、踏み出す一歩に意味がないわけではない。
					</p>

					<p className="">
						山の稜線が夕暮れに染まる頃、谷あいから霧が這い上がってくる。音のない世界で、自分の呼吸だけが確かな存在の証になる。都市の喧騒から遠ざかるほど、思考は澄んでいく。余計なものが削ぎ落とされて、本当に大切なものだけが残る。
					</p>

					<p className="">
						海岸線を歩いていると、波が繰り返し砂浜を洗い流すのに気づく。何度も何度も、飽きることなく。そのリズムに合わせて歩いていると、時間の感覚がゆるやかに溶けていく。過去も未来もなく、ただこの瞬間だけがある。
					</p>

					<p className="">
						森の奥では、陽光が木々の隙間をぬって地面に模様を描いている。その光の斑点は風が吹くたびに形を変え、同じ模様は二度と現れない。変化を受け入れることが、自然の中では当たり前のことになる。抵抗せずに流れに乗る、そのことの難しさと美しさ。
					</p>

					<p className="">
						高原の朝は冷たく、草が露を帯びている。地平線まで広がる牧草地に、朝靄がたなびいている。遠くで牛の鳴き声がして、それだけで世界が動いていると分かる。静寂と生命の声が、ここでは自然に混ざり合っている。
					</p>

					<p className="">
						砂漠の夜は驚くほど寒い。昼間の熱が嘘のように消えて、空に満天の星が広がる。砂の上に横たわると、自分がいかに小さいかを思い知る。それは恐怖ではなく、むしろ解放感だった。広大な宇宙の中の一点として、ただ存在していること。
					</p>

					<p className="">
						川の源流を求めて山を登った。下るにつれて川幅が広がり、流れが穏やかになっていく。小さな滝が大きな川へ。支流が集まって大きな流れになる。すべてがつながっているという感覚が、この旅の中で最も強く感じられた瞬間だった。
					</p>

					<p className="">
						風景は記憶に刻まれ、言葉になる前に感情として残る。カメラのシャッターを切っても、あの光の加減は再現できない。あの空気の重さも、足の裏に感じた土の柔らかさも。それでも旅に出る理由は、そうした体験を積み重ねることにあるのかもしれない。
					</p>
					<p className="">
						広大な自然のなかに身を置くとき、人はいつも何かを思い出す。遠い記憶の断片が、風の匂いとともに戻ってくる。旅の始まりはいつも唐突で、終わりはいつも曖昧だ。それでも、踏み出す一歩に意味がないわけではない。
					</p>

					<p className="">
						山の稜線が夕暮れに染まる頃、谷あいから霧が這い上がってくる。音のない世界で、自分の呼吸だけが確かな存在の証になる。都市の喧騒から遠ざかるほど、思考は澄んでいく。余計なものが削ぎ落とされて、本当に大切なものだけが残る。
					</p>

					<p className="">
						海岸線を歩いていると、波が繰り返し砂浜を洗い流すのに気づく。何度も何度も、飽きることなく。そのリズムに合わせて歩いていると、時間の感覚がゆるやかに溶けていく。過去も未来もなく、ただこの瞬間だけがある。
					</p>

					<p className="">
						森の奥では、陽光が木々の隙間をぬって地面に模様を描いている。その光の斑点は風が吹くたびに形を変え、同じ模様は二度と現れない。変化を受け入れることが、自然の中では当たり前のことになる。抵抗せずに流れに乗る、そのことの難しさと美しさ。
					</p>

					<p className="">
						高原の朝は冷たく、草が露を帯びている。地平線まで広がる牧草地に、朝靄がたなびいている。遠くで牛の鳴き声がして、それだけで世界が動いていると分かる。静寂と生命の声が、ここでは自然に混ざり合っている。
					</p>

					<p className="">
						砂漠の夜は驚くほど寒い。昼間の熱が嘘のように消えて、空に満天の星が広がる。砂の上に横たわると、自分がいかに小さいかを思い知る。それは恐怖ではなく、むしろ解放感だった。広大な宇宙の中の一点として、ただ存在していること。
					</p>

					<p className="">
						川の源流を求めて山を登った。下るにつれて川幅が広がり、流れが穏やかになっていく。小さな滝が大きな川へ。支流が集まって大きな流れになる。すべてがつながっているという感覚が、この旅の中で最も強く感じられた瞬間だった。
					</p>

					<p className="">
						風景は記憶に刻まれ、言葉になる前に感情として残る。カメラのシャッターを切っても、あの光の加減は再現できない。あの空気の重さも、足の裏に感じた土の柔らかさも。それでも旅に出る理由は、そうした体験を積み重ねることにあるのかもしれない。
					</p>
					<p className="">
						広大な自然のなかに身を置くとき、人はいつも何かを思い出す。遠い記憶の断片が、風の匂いとともに戻ってくる。旅の始まりはいつも唐突で、終わりはいつも曖昧だ。それでも、踏み出す一歩に意味がないわけではない。
					</p>

					<p className="">
						山の稜線が夕暮れに染まる頃、谷あいから霧が這い上がってくる。音のない世界で、自分の呼吸だけが確かな存在の証になる。都市の喧騒から遠ざかるほど、思考は澄んでいく。余計なものが削ぎ落とされて、本当に大切なものだけが残る。
					</p>

					<p className="">
						海岸線を歩いていると、波が繰り返し砂浜を洗い流すのに気づく。何度も何度も、飽きることなく。そのリズムに合わせて歩いていると、時間の感覚がゆるやかに溶けていく。過去も未来もなく、ただこの瞬間だけがある。
					</p>

					<p className="">
						森の奥では、陽光が木々の隙間をぬって地面に模様を描いている。その光の斑点は風が吹くたびに形を変え、同じ模様は二度と現れない。変化を受け入れることが、自然の中では当たり前のことになる。抵抗せずに流れに乗る、そのことの難しさと美しさ。
					</p>

					<p className="">
						高原の朝は冷たく、草が露を帯びている。地平線まで広がる牧草地に、朝靄がたなびいている。遠くで牛の鳴き声がして、それだけで世界が動いていると分かる。静寂と生命の声が、ここでは自然に混ざり合っている。
					</p>

					<p className="">
						砂漠の夜は驚くほど寒い。昼間の熱が嘘のように消えて、空に満天の星が広がる。砂の上に横たわると、自分がいかに小さいかを思い知る。それは恐怖ではなく、むしろ解放感だった。広大な宇宙の中の一点として、ただ存在していること。
					</p>

					<p className="">
						川の源流を求めて山を登った。下るにつれて川幅が広がり、流れが穏やかになっていく。小さな滝が大きな川へ。支流が集まって大きな流れになる。すべてがつながっているという感覚が、この旅の中で最も強く感じられた瞬間だった。
					</p>

					<p className="">
						風景は記憶に刻まれ、言葉になる前に感情として残る。カメラのシャッターを切っても、あの光の加減は再現できない。あの空気の重さも、足の裏に感じた土の柔らかさも。それでも旅に出る理由は、そうした体験を積み重ねることにあるのかもしれない。
					</p>
					<p className="">
						広大な自然のなかに身を置くとき、人はいつも何かを思い出す。遠い記憶の断片が、風の匂いとともに戻ってくる。旅の始まりはいつも唐突で、終わりはいつも曖昧だ。それでも、踏み出す一歩に意味がないわけではない。
					</p>

					<p className="">
						山の稜線が夕暮れに染まる頃、谷あいから霧が這い上がってくる。音のない世界で、自分の呼吸だけが確かな存在の証になる。都市の喧騒から遠ざかるほど、思考は澄んでいく。余計なものが削ぎ落とされて、本当に大切なものだけが残る。
					</p>

					<p className="">
						海岸線を歩いていると、波が繰り返し砂浜を洗い流すのに気づく。何度も何度も、飽きることなく。そのリズムに合わせて歩いていると、時間の感覚がゆるやかに溶けていく。過去も未来もなく、ただこの瞬間だけがある。
					</p>

					<p className="">
						森の奥では、陽光が木々の隙間をぬって地面に模様を描いている。その光の斑点は風が吹くたびに形を変え、同じ模様は二度と現れない。変化を受け入れることが、自然の中では当たり前のことになる。抵抗せずに流れに乗る、そのことの難しさと美しさ。
					</p>

					<p className="">
						高原の朝は冷たく、草が露を帯びている。地平線まで広がる牧草地に、朝靄がたなびいている。遠くで牛の鳴き声がして、それだけで世界が動いていると分かる。静寂と生命の声が、ここでは自然に混ざり合っている。
					</p>

					<p className="">
						砂漠の夜は驚くほど寒い。昼間の熱が嘘のように消えて、空に満天の星が広がる。砂の上に横たわると、自分がいかに小さいかを思い知る。それは恐怖ではなく、むしろ解放感だった。広大な宇宙の中の一点として、ただ存在していること。
					</p>

					<p className="">
						川の源流を求めて山を登った。下るにつれて川幅が広がり、流れが穏やかになっていく。小さな滝が大きな川へ。支流が集まって大きな流れになる。すべてがつながっているという感覚が、この旅の中で最も強く感じられた瞬間だった。
					</p>

					<p className="">
						風景は記憶に刻まれ、言葉になる前に感情として残る。カメラのシャッターを切っても、あの光の加減は再現できない。あの空気の重さも、足の裏に感じた土の柔らかさも。それでも旅に出る理由は、そうした体験を積み重ねることにあるのかもしれない。
					</p>
				</div>
			</main>

			{/* キャンバスFXコントローラー（モード切替＋強度スライダー・全対象へグローバル適用） */}
			<CanvasFx
				rootRef={pageRootRef}
				className="fixed bottom-4 right-4 z-20 max-w-[70vw]"
			/>
		</PageRoot >
	);
}

export default Test9;
