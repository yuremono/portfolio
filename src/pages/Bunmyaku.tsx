// ルール: src/pages/AGENTS.md。画像は public/images/。
import { useCallback, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { IntakePanel } from "./Bunmyaku/IntakePanel";
import { OutputPanel } from "./Bunmyaku/OutputPanel";
import { SideNav } from "./Bunmyaku/SideNav";
import { createInitialState } from "./Bunmyaku/data";
import { useDocumentState } from "./Bunmyaku/useDocumentState";

// PageRoot: 画面全体の寸法。子コンポーネントはこの変数を前提に組む。
const pageRootClass =
	"min-h-[100lvh] [--background:oklch(0.16_0.055_255)] [--foreground:oklch(0.91_0.02_235)] [--line:1px_solid_var(--WH20)]  [--line2:1px_solid_var(--WH30)]  overflow-clip  [--head:0px] [--sideW:clamp(10rem,17vw,15rem)] [--outW:clamp(18rem,28vw,25rem)] [--barH:3.25rem] [--wid:100%] [--PX:1.25em] [--PY:1.25em] [--gap:1em] [--MC:oklch(0.16_0.055_255)] [--SC:oklch(0.22_0.9_188)] [--AC:oklch(0.45_0.9_188)] [--BC:oklch(0.115_0.035_255)] [--TC:oklch(0.91_0.02_255)] [--GR:oklch(0.62_0.025_255)]  [--FZ:0.875rem] [--Eng:var(--Ship)] [--HFF:var(--Ship)] [--HFW:300]  [--h1FZ:clamp(1rem,2vw,1.25rem)] [--h2FZ:1.125em] [--h3FZ:1em] [--largeFZ:clamp(1.5rem,2vw,2.5rem)] [--LH:1.375] [--HLH:1.2] [--LS:0.025em]  [--rad:0.375rem]";

// main: SideNav と作業領域の外枠。main>* の既定スタイルを受けないよう直下で制御する。
const mainClass =
	"min-h-[100lvh] !max-w-none !w-full !px-0 grid grid-cols-1 lg:h-[100lvh] lg:min-h-0 lg:overflow-clip lg:grid-cols-[var(--sideW)_minmax(0,1fr)]";

const workspaceClass =
	"relative mt-0 grid min-h-0 grid-cols-1 lg:h-[100lvh] lg:grid-cols-[minmax(0,1fr)_clamp(var(--sideW),var(--outW),50%)] lg:overflow-hidden";

const resizeHandleClass =
	"BorderXY group absolute bottom-0 right-[clamp(var(--sideW),var(--outW),50%)] top-0 z-20 hidden w-3 translate-x-1/2 cursor-col-resize items-center justify-center bg-MC/40 transition hover:bg-SC/30 focus-visible:bg-SC/30 focus-visible:outline focus-visible:outline-1 focus-visible:outline-AC lg:flex";

// slots: 子コンポーネントの配置調整は親から渡せるようにする。
const sideNavClass = "min-h-0";
const intakePanelClass = "min-h-0";
const outputPanelClass = "min-h-0";

function Bunmyaku() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	const workspaceRef = useRef<HTMLDivElement>(null);
	const [outputWidth, setOutputWidth] = useState<string | null>(null);
	const documentState = useDocumentState(createInitialState);

	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	const resizeOutputPanel = useCallback((clientX: number) => {
		const workspace = workspaceRef.current;
		if (!workspace) return;

		const workspaceRight = workspace.getBoundingClientRect().right;
		setOutputWidth(`${workspaceRight - clientX}px`);
	}, []);

	const handleResizePointerDown = useCallback((event: PointerEvent<HTMLButtonElement>) => {
		event.currentTarget.setPointerCapture(event.pointerId);
		resizeOutputPanel(event.clientX);
	}, [resizeOutputPanel]);

	const handleResizePointerMove = useCallback((event: PointerEvent<HTMLButtonElement>) => {
		if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

		resizeOutputPanel(event.clientX);
	}, [resizeOutputPanel]);

	const mainStyle = outputWidth ? ({ "--outW": outputWidth } as CSSProperties) : undefined;

	return (
		<PageRoot ref={pageRootRef} className={pageRootClass}>
			<main data-l="DocumentMain" className={mainClass} style={mainStyle}>
				{/* 左カラム: プロンプトとパーツのナビゲーション */}
				<SideNav className={sideNavClass} state={documentState} />

				<div ref={workspaceRef} data-l="DocumentWorkspace" className={workspaceClass}>
					{/* 中央カラム: 出力形式ごとに切り替わるヒアリング入力UI */}
					<IntakePanel className={intakePanelClass} state={documentState} />

					<button
						aria-label="アウトプットパネルの幅を変更"
						aria-orientation="vertical"
						className={resizeHandleClass}
						onPointerDown={handleResizePointerDown}
						onPointerMove={handleResizePointerMove}
						role="separator"
						type="button"
					>
						<span className="block h-10 w-px bg-WH/40 transition group-hover:bg-WH/70 group-focus-visible:bg-WH/70" />
					</button>

					{/* 右カラム: 生成されるMarkdown本文またはプロンプト本文 */}
					<OutputPanel className={outputPanelClass} state={documentState} />
				</div>
			</main>
		</PageRoot>
	);
}

export default Bunmyaku;
