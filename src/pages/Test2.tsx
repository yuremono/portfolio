import type { CSSProperties } from "react";
import { Panel, PanelItem } from "../components/Panel";
import { Toggle, ToggleSummary, ToggleBody } from "../components/Toggle";
import { Image } from "../components/Image";
import { PathDraw } from "../components/PathDraw";
// import { RgbShift } from "../components/RgbShift";
import { LottieScroll } from "../components/LottieScroll";

import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { getAssetPath } from "../lib/assetPath";

function Test2() {
	useClientRuntime();

	return (
		<>
			<Header className="" />

			<main id="" className="test2Page min-h-screen  mt-[--head]">
				{/*Stick Lottie*/}
				<section className="out Stick [--shift:--scr] IsColumn">
					<LottieScroll
						src={getAssetPath("/lottie/untitled.lottie")}
						segmentStartRatio={0}
						segmentEndRatio={1}
						autoplayStopRatio={0.62}
						className=" [--canvasH:100lvh] StickItem h-[100lvh] "
						layout={{ fit: "cover", align: [0.5, 0.5] }}
						renderConfig={{ autoResize: true }}
					/>
					<div className="StickLetter StickScr   relative  h1FZ">
						<span className="  ">予</span>
						<span className="    ">撮</span>
						<span className="  ">予</span>
						<span className="   ">撮</span>
					</div>
				</section>
				{/* Hero - */}
				<section className="Hero out text-white ">
					<figure className="back">
						<img
							src={getAssetPath("/images/picsum/003.jpg")}
							alt=""
							loading="lazy"
						/>
					</figure>
					<div className="item text-shadow-[--tsbk]">
						<h1 className="font-bold  tracking-tight drop-shadow-lg Ser">
							小路のカフェへようこそ
						</h1>
						<p className="mt-4  font-light">
							自家焙煎のコーヒーと手作りパンで、ひとときを。
						</p>
					</div>
				</section>
				{/*Stick 、RGB*/}
				<section className="" style={{} as CSSProperties}>
					<Panel
						className=" img30 IsFlow img1-1 [--afterW:0]  BorderDraw IsDown"
						style={{} as CSSProperties}
					>
						<PanelItem className=" items-center BorderDraw">
							<Image
								image={getAssetPath("/images/picsum/010.jpg")}
							/>
							<div>
								<h3 className="font-bold mb-2 ">
									<span className="sub block ">Step 01</span>{" "}
									予約
								</h3>
								<p className="">
									Web または電話で希望日時を予約してください。
								</p>
							</div>
						</PanelItem>
						<PanelItem className="IsRev items-center BorderDraw">
							<Image
								image={getAssetPath("/images/picsum/011.jpg")}
							/>
							<div>
								<h3 className="font-bold mb-2 ">
									<span className="sub block ">Step 01</span>{" "}
									撮影
								</h3>
								<p className="">
									機材のセットアップから撮影まで、スタッフがサポートします。
								</p>
							</div>
						</PanelItem>
						<PanelItem className="items-center BorderDraw">
							<Image
								image={getAssetPath("/images/picsum/010.jpg")}
							/>
							<div>
								<h3 className="font-bold mb-2 ">
									<span className="sub block ">Step 01</span>{" "}
									予約
								</h3>
								<p className="">
									Web または電話で希望日時を予約してください。
								</p>
							</div>
						</PanelItem>
						<PanelItem className="IsRev items-center BorderDraw">
							<Image
								image={getAssetPath("/images/picsum/011.jpg")}
							/>
							<div>
								<h3 className="font-bold mb-2 ">
									<span className="sub block ">Step 01</span>{" "}
									撮影
								</h3>
								<p className="">
									機材のセットアップから撮影まで、スタッフがサポートします。
								</p>
							</div>
						</PanelItem>
					</Panel>
				</section>
				{/*Stick 、RGB*/}
				<section
					className="Wrap bg-[--TC] text-white"
					style={{} as CSSProperties}
				>
					<div
						className="Stick items-start "
						style={{} as CSSProperties}
					>
						{/* <RgbShift
							src={getAssetPath("/images/p-1.svg")}
							alt="説明"
							className="IsBeat StickItem sticky min-h-[100lvh] content-center"
						/> */}
						<Panel
							className="StickScr img40 IsFlow img1-1"
							style={{} as CSSProperties}
						>
							<PanelItem className=" items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/010.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										予約
									</h3>
									<p className="">
										Web
										または電話で希望日時を予約してください。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="IsRev items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/011.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										撮影
									</h3>
									<p className="">
										機材のセットアップから撮影まで、スタッフがサポートします。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/010.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										予約
									</h3>
									<p className="">
										Web
										または電話で希望日時を予約してください。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="IsRev items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/011.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										撮影
									</h3>
									<p className="">
										機材のセットアップから撮影まで、スタッフがサポートします。
									</p>
								</div>
							</PanelItem>
						</Panel>
					</div>
				</section>
				{/*Stick 、simulate Gsap*/}
				<section className="" style={{} as CSSProperties}>
					<div
						className="Stick IsRev out items-start "
						style={{} as CSSProperties}
					>
						<PathDraw className="StickItem sticky min-h-[100lvh] content-center ">
							<svg
								className=""
								viewBox="0 0 2448 2777.8"
								preserveAspectRatio="xMidYMid meet"
								role="img"
								aria-label="p-1.svg 抜粋（st0 1パス・Illustrator 座標系）"
							>
								<g>
									<path
										className=""
										d="M0,-496.3c3143.7-290.9,2482.7,366.2,2471.6,2554.6c-1.1,221.1-41.4,456.7-23.6,709.7c-32.9,0-56.1,6.5-57.7-34c-7.6-42.8-29.5-81.6-46.8-120.6c-46.4-129.3-88.3-261.9-159.1-381.8c-71.5-137.8-50.2-155.2-197.9-230.3c-75.9-36.2-166.1-49.8-249.1-63.5c-31.3-4.4-56.6-27.3-89.5-24.2c-47.4-0.9-82-37-129.4-39.8c-71.3-28.8,0.2-112.6,26.8-151.5c22.1-44.6,29.1-96.5,52-141.5c28-47.2,52.4-107.1,75-156.6c96.4-42.5,138.7-55.4,198.3-151.7c18.1-31,85.1-99.4,48-129.3c-110.1-46.4-99.8-60.7-80.4-172.2c42.3-37.4,20.4-77.1,18.6-126.7c-16.2-62.3,4.3-129.9-12.6-192.5c-7.5-18.9,17.4-4.6,8.5-20.6c-16.1-62.3-62.4-107.3-91.9-162.6c-8.7-31.3-24.2-60-32.2-89.3c-37.5-40.7-71.3-88.4-121.9-113.6c-46.2-16.6-77.6-61-126.8-68.3c-28.6-8.6-61.4-2.8-87.4-19.2c-42.6-23.3-93-7.2-139.1-7.2c-45.9-5.9-24.4-34.6-89.2-5.5c-42.9,14.9-93.5-14.5-129.6,24.4c-20.8,26.9-37.1,10.7-55.8,18.4"
									/>
									<path
										className=""
										d="M978.8,208.3c-11.2,17.1-25.9,27-47,25.5c-22.2,6.6-42.2,21.3-65.4,26.9c-87.9,25.5-80.4,101.6-137.1,138.3c-104.1,71.9-229,147.5-256.2,279.4c32-47.9,57.6-131.9,122.2-139.9c-6.1,52.5-59,94.5-80.8,142.4c1.2,15.5-17.1,21.3-18.5,34.4c-0.9,46.3-46.8,77.8-49.7,125.3c-41.7,126.1-59.3,258.3,4,380.6c3.6,13.6,11,23.9,24,30.6c27.2,23,44.5,56.7,71.9,80.3c24.5,23.1-2.5,22.2-15.8,29.7c45.3,12.9,55.8,72.4,47.5,115.7c0.2,13.5,19.9,16.9,19.7,32.8c3.5,12.9,3.6,13.2,16.4,13.9c54.7,37.3-41.5,52.3-71.2,45.9c38.6,24.1,103.4-39.4,96.3,4.6c-3.2,37.9,25.9,77,58.8,93.2c16.4-3,2.8,59.3,4.4,72.3c1.3,38.4-27.6,59.1-42.5,88.7c-3.6,18.4-17.9,23.3-31.9,29.1c-44.5,17.4-68.8,64-103.6,93.5c-33.4,21.4-57,54-88,77.9c-50,27.7-106.7,47-158.6,72.9c-56.9,35-112,73.4-173.1,100.9c-24.7,26.4-63.4,28.3-89,52.1C12.1,2259.7,7.8,2265.7,0,2263.2"
									/>

									<path
										className=""
										d="M1491.7,1824.2c-19.8-0.3-12.8-33.1-2.3-50.5c3.1-5.1-0.1-11.7-6-12.6c-15.8-2.5-33.1-0.2-48.5,2.2
                                c-48.7,8.3-219.8-20.1-256.7-5.8c-97.1,37.6-45.1-10.4,12.7-21.6c63.5-1.6,127.3-5.9,190.8-3.5c59,17.8,111.5-11.6,166.8-30.2
                                C1577.8,1701.8,1484.8,1796.1,1491.7,1824.2z"
									/>

									<path
										className=""
										d="M1472.7,1583.7c-58.1,2.6-98-50.6-157.6-35.4c-36.7,7.3-55.2-71.9-35.3-34.6c14.8,35.1,52.7,16,80.4,14.7
                                c39.8,3.5,71.4,35.9,112.9,32.8c24.4,4,48.2-3.2,70.6-11.3C1529.5,1571.8,1499,1582.8,1472.7,1583.7z"
									/>

									<path
										className=""
										d="M1831.3,1072.8c-1.4-79.3,40.9-151.8,49.9-230c7.8-67.6-0.6-145.7-16.1-212c-30.8-131.7-113.8-253-218.7-338.7 c-137.9-112.7-383.5-187.5-560.2-165c-225.3,28.7-422.5,128.4-568,295.2C472,475.3,363.5,642.9,371.4,687.8 C405,636.3,425.6,612,458,582.8c-55.4,63.3-81.1,196.8-91.6,263.8c-25.9,76.5-7.1,211,13,290c8.6,34.4,89.6,159.3,106,192.5 c16.4,33.2,51.3,93.3,60.5,112c9.6,19.5,30.3,52.7,21.5,80.8c-5.7,18.1-27.8,37-68.9,46.7c33,15.2,102.1,18.4,118,49.9 c19.2,38.1,47.4,53.9,57.6,62.1c71.7,58,17.8-187.7,27.2-221c-0.7-21.6,14.4-38.8,17.3-58.6c2.5-1.7,5.2,62.8,12.4,93.3 c13,149.2,80.8,269.3,199.1,361.5c68.8,74.4,147.4,187.2,259.9,174.9c40,8.2,73,3.1,108.2-14.3c28.4-16.2,73.3-2.7,80.1-43.1 c11.7,7.1,7.3,39.7,8.8,54.7c-7.7,76-15.9,154.2-36.7,227.7c-19.9,52.7-50.1,100.5-74.1,151.3c-25.4,45.2-84.1,61.3-103.8,110.5 c-15.3,75.6-92.5,19.5-139.4,16.2c24.9,19.7,62.1,22.3,88.8,40.4c1.4,0.9,0.7,2.1-0.1,3.2c-1.8,2.8,3.6,3.9,5.5,4.7 c34.9,2.8,20.8,31.7,25.1,55c7,11.6,30.5-3,5.3-1.8c-7.1-35.8,41.5-42.2,39.2-74.7c-7.8-58.7,55.3-74.2,86.5-110.7 c39-73.2,67.1-154.4,99.6-231.5c20.2-77.2,17.6-157.7,29.6-235.8c22.3-40.3,71.6-87.7,57.2-135.8c-23.3,49.8-51.1,101-111.4,110.3 c-51.2,12.2-95.9,53.3-150.8,35.9c-89.4,4.3-133.6-68.9-195.9-117.3c-90.5-75.9-177.8-160.2-217.8-274.5 c-37.8-77.9,8-175.5,5.1-255.7c17.9-57-3.6-115.9,6.9-172.8c14.4-24,25.7-45.4,28.6-73c30-30.8,76,17.9,101.9,36.8 c73,74,27.4,223.7,137.2,271.3c323,120.1,376.8-231.6,442.5-137c26.6,114.9,10.3,164.2,153.1,158.4c48-3.8,66.3-18.1,104.3-40.5 c67.8-61,129.4-139.8,160.2-226.1C1933.6,1119,1819.4,1121.6,1831.3,1072.8z"
									/>
									<path
										className=""
										d="M727.5,811.4c-18.1-6.1-9.5-131.7-18.9-135.5 c-13.8-5.6-58,164.3-73.5,188.6c-9.9-19.1-43.8-99.2-36.2-104.2c-16,10.5-12,116.6-23.5,136.9c-5.4,9.5-96-32.5-116.3,70.9 c21.7,139.3-28.6,251,102.5,355c126.6,91.7,116.9-31.3,131.8,178.8c1.3,18.1,14.3,105.5,2.8,121c-13,17.6-84.1-109.9-90.4-139.1 c-5.5-25.8-67.1-152.2-84.1-174.3c-24.6-32.1-88.8-157-93.9-175.9c-53.5-201.1-14.8-389.9,57.7-517 c90.9-159.5,207.3-269.6,281.3-318c82.8-54.1,216.2-103.5,312.9-124.2c102.2-21.9,221.4,7.4,321.2,38.4 c140.5,43.6,256.6,145.1,311.7,196.5c33.9,31.6,62.1,93.7,56.3,122.2c-6.5,31.9-19.6,64.1-39.4,90.2c8.9-11.7-26.9-75.3-35.7-83.8 c-2.6,11.1-2.8,144.4-20.7,125.5c-16.4-17.3-218-169.1-235.8-82c-2.9,14.2-7.8,28-8.5,42.4c-5.3,103.9-62.2-44-70.8-71.1 c-8-25.3-29.3-47.4-46.7-68.3c-38-46.7-77.3,13.9-131.5,61c-33,28.7-2.2-33.6-5.6-47.6c-14.7-59.1-87.7,63.6-90.8,77.4 C1068.7,639,972,739,928.6,735.9c-17.8-15.2-1.4-44.1-12.5-61.1C899,648.6,829.4,586.9,727.5,811.4z"
									/>
									<path
										className=""
										d="M493.4,1063.3 c3.4-46.9-33.6-141.6,41-143.7c54.9-3.9,49.5,115.6,49.9,154.1c-19.8,27.6-49.3,52.4-32.8,91.4c1.8,45,232.5,188.8,96.3,188.6 c-71.1-2.2-125.3-73.7-153.4-133.1C474,1169.3,495.3,1115.8,493.4,1063.3z M633.7,1212.6c-19.4-24.8-45.9-3.3-54.4-62.4 C601.5,1049.4,645,1173.4,633.7,1212.6z"
									/>
									<path
										className=""
										d="M1390.6,1271.8c-56.5,115.5-159.1,136.5-258.4,115.2c-63.4-3.9-109-53.4-99.7-117.7 c1.6-26.5,9.1-72.5,31.7-97.3c82.4-80.6,122-57.8,245.3-37.9C1413,1150.8,1437.1,1170.5,1390.6,1271.8z M1545,1153.5 c-57.4,19-108.4-22.3-160.3-40.3c-49.4-18.3-101.7-27.5-153.4-36.5c-110.8-27.9-266,4.3-337.7-101.4c-6.5-20.3,75.8-25.6,92.1-56.5 c21.1-24,49-39.7,73.4-59.7c17.8-12.4,61.7-65.1,29.2-5.3c-83.7,129.7-128.7,143.5,58.1,146.8c70.8-5.2,124.6,64.4,195.9,50 c31.9-26.1,65.1-51.1,101.1-70.9c-118.4,57.2-153.9,4.8-88.4-116.4c18.5-34.3,39.2-78.3,69.7-103c10.9,15.3-17.7,165.8-75.7,219.3 c20.3,2.9,150.8-43.4,217.4-111.6c4.1,16.4-62,106.4-23.4,88.6c34.7-14.9,146.1-88.2,155.4-101.2c-1.3,30-1.2,59.8,2.7,89.7 c59.9,94.4-106.3,61.8-129.3,131.7c-38.9,73.8-18.1,38.1,45.6,24.8c33.9-8,66.9-36.4,102.4-28.9c23.4,12.7,7.5,49.3-15.4,52.6 C1650.7,1129.3,1596.7,1135.9,1545,1153.5z M1843.7,1210.1c-28.8,127-118.1,182.4-212.5,182.2c-86.3,11.1-82-115.5-56.6-162.4 c16-18.8,23.6-33.3,53.4-44c39.5-14.3,78.5-24.6,138.1-16C1790.6,1172.6,1847.4,1183.2,1843.7,1210.1z"
									/>
								</g>
							</svg>
						</PathDraw>
						<Panel
							className="StickScr img40 IsFlow img1-1 "
							style={{} as CSSProperties}
						>
							<PanelItem className="items-center ">
								<Image
									image={getAssetPath(
										"/images/picsum/010.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										予約
									</h3>
									<p className="">
										Web
										または電話で希望日時を予約してください。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="IsRev items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/011.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										撮影
									</h3>
									<p className="">
										機材のセットアップから撮影まで、スタッフがサポートします。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/010.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										予約
									</h3>
									<p className="">
										Web
										または電話で希望日時を予約してください。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="IsRev items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/011.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										撮影
									</h3>
									<p className="">
										機材のセットアップから撮影まで、スタッフがサポートします。
									</p>
								</div>
							</PanelItem>
						</Panel>
					</div>
				</section>

				{/* Stick 、 */}
				<section className="" style={{} as CSSProperties}>
					<div
						className="Stick out items-start img1-1 [--item:50%] [--shift:25%]"
						style={{} as CSSProperties}
					>
						<h2 className=" StickItem  font-bold md:min-h-[100lvh] content-center">
							<span className="sub block mr-0">Flow</span>{" "}
							ご利用の流れ
						</h2>
						<Panel
							className="StickScr img40 IsFlow "
							style={{} as CSSProperties}
						>
							<PanelItem className="items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/010.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										予約
									</h3>
									<p className="">
										Web
										または電話で希望日時を予約してください。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="IsRev items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/011.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										撮影
									</h3>
									<p className="">
										機材のセットアップから撮影まで、スタッフがサポートします。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/010.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										予約
									</h3>
									<p className="">
										Web
										または電話で希望日時を予約してください。
									</p>
								</div>
							</PanelItem>
							<PanelItem className="IsRev items-center">
								<Image
									image={getAssetPath(
										"/images/picsum/011.jpg",
									)}
								/>
								<div>
									<h3 className="font-bold mb-2 ">
										<span className="sub block ">
											Step 01
										</span>{" "}
										撮影
									</h3>
									<p className="">
										機材のセットアップから撮影まで、スタッフがサポートします。
									</p>
								</div>
							</PanelItem>
						</Panel>
					</div>
				</section>

				{/* modules demo */}
				<section className="Wrap max-w-3xl mx-auto px-4 py-12 space-y-8  title1">
					<h2 className="text-xl font-bold">
						クライアント初期化（Budoux / SpanWrap / ScrollX /
						Video）
					</h2>
					<p className="budoux text-lg leading-relaxed">
						長い日本語の文章でも、文節の途中で改行されにくく表示を整えられます。デモ用のテキストです。
					</p>
					<div className="js-letter text-2xl font-bold">
						<span>表示のたびに一文字ずつspan化</span>
					</div>
					<div
						className="__scrollX flex gap-4 overflow-x-auto max-w-full border border-slate-200 p-2"
						style={{ scrollBehavior: "smooth" } as CSSProperties}
					>
						{Array.from({ length: 12 }, (_, i) => (
							<div
								key={i}
								className="shrink-0 w-40 h-24 bg-slate-200 rounded flex items-center justify-center text-sm"
							>
								{i + 1}
							</div>
						))}
					</div>
					<div className="video_container max-w-md">
						<video
							className="w-full rounded"
							controls
							muted
							playsInline
							preload="none"
							data-src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
						/>
					</div>
				</section>

				{/* FAQ - Toggle IsQa */}
				<section className="Wrap into ">
					<h2 className="text-center font-bold  mb-12">
						<span className="sub block mr-0">FAQ</span> よくある質問
					</h2>
					<div
						className="wid"
						style={{ "--wid": "720px" } as CSSProperties}
					>
						<Toggle className="IsQa">
							<ToggleSummary>
								初めてでも利用できますか？
							</ToggleSummary>
							<ToggleBody>
								<p className="">
									はい。機材の使い方やライティングのアドバイスも行っています。お気軽にご相談ください。
								</p>
							</ToggleBody>
						</Toggle>
						<Toggle className="IsQa">
							<ToggleSummary>
								機材の持ち込みは可能ですか？
							</ToggleSummary>
							<ToggleBody>
								<p className="">
									可能です。カメラ・レンズ・ストロボなど、ご自身の機材をお持ち込みいただけます。
								</p>
							</ToggleBody>
						</Toggle>
						<Toggle className="IsQa">
							<ToggleSummary>
								キャンセルポリシーは？
							</ToggleSummary>
							<ToggleBody>
								<p className="">
									前日まで：無料。当日：50%
									のキャンセル料が発生します。詳細は予約時にご確認ください。
								</p>
							</ToggleBody>
						</Toggle>
					</div>
				</section>
			</main>

			<Footer />
		</>
	);
}

export default Test2;
