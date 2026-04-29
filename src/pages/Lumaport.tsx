// ルール: src/pages/AGENTS.md。画像は public/images/。
import { useRef } from "react";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import CitySection from "./Lumaport/CitySection";
import LumaHeader from "./Lumaport/LumaHeader";
import LumaFooter from "./Lumaport/LumaFooter";
import HeroSection from "./Lumaport/HeroSection";
import { PlanSection } from "./Lumaport/PlanSection";
import SafeSection from "./Lumaport/SafeSection";



// PageRoot: デザイン再現のために変数を上書きする。--headは必須。hero高さが計算できないのでpyでヘッダー高さを決めない。
const pageRootClass =
	"[--WTS:6px_oklch(0.22_0.08_205)] [--line:2px_solid_var(--AC)] [--background:--WH] [--PX:clamp(1rem,3vw,2rem)] [--wid:92rem] [--head:4.5rem] md:[--head:6rem] [--mvH:calc(100lvh_-_var(--head))] [--MC:oklch(0.22_0.08_205)] [--AC:oklch(0.86_0.12_165)] [--SC:oklch(0.88_0.16_92)] [--third:--MC] [--fourth:--AC] [--MY:5rem] md:[--MY:8rem] [--gap:2rem]";

const mainClass = "min-h-[100lvh] px-0";

function Lumaport() {
	const pageRootRef = useRef<HTMLDivElement>(null);

	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
                <PageRoot ref={pageRootRef} className={pageRootClass}>
                        <LumaHeader />
                        <main className={mainClass}>
                                <div data-l="BgFix" className="w-full h-[100lvh] bg-BK z-[0] fixed [background:url(/images/lumaport/hero/bg01.png)_no-repeat_0_0/cover]"></div>
				{/* ヒーロー: ヘッダーとファーストビューをまとめる。 */}
				<HeroSection />
				{/* プラン: 待ち時間から寄り道を組み立てる導入。 */}
				<PlanSection />
				{/* セーフティ: 搭乗時刻から逆算する安心設計。 */}
				<SafeSection />
				{/* シティ: 空港外の小さな目的地を見せる。 */}
				<CitySection />
				{/* フッター: 最終CTAとナビゲーション。 */}
			</main>
			<LumaFooter />
		</PageRoot>
	);
}

export default Lumaport;
