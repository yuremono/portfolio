import { 
        // CaretRightIcon, 
        ArrowSquareOutIcon

 } from "@phosphor-icons/react";
import { useSectionCanvas } from "./useSectionCanvas";

interface FrontEndSectionProps {
	className?: string;
}

export function FrontEndSection({ className }: FrontEndSectionProps) {
	const { rootRef, canvasRef } = useSectionCanvas({
		text: "FrontEnd",
		fontSize: 192,
		detailed: false,
		fillOpacity: 0.5,
	});

	return (
		<section
			ref={rootRef}
			data-l="FrontEndSection"
			className={className}
		>
			<div className="relative  [grid-area:1/1]  w-full mx-auto">
				<div className="sticky  top-0   grid  place-items-center ">
					<canvas
						ref={canvasRef}
						className="block  w-full "
						aria-hidden
					/>
				</div>
			</div>
			<div className="WTS [--WTS:var(--tsw)_var(--background)] relative z-10  PX [grid-area:1/1]  max-w-[48em] mx-auto">
				<div className="[--LS:0.1em]   ">
					<h2 className=" h2FZ JsRight font-normal">
						## FrontEnd - Application Development
					</h2>
					<div className="BudouxScroll mx-auto my-[3rem] md:text-xl">
						### React / TypeScript
						<br />
                                                <br />
                                                Cursor使用開始時に
							<a
								href="https://github.com/yuremono/next.js.cms"
                                                        className=" md:text-xl hover:text-AC border-b border-b-current leading-none px-1"
                                                        target="_blank" rel="noopener noreferrer"
							>
								Next.Js でCMS
								<ArrowSquareOutIcon className=" align-middle ml-1 mb-1" />
                                                </a>
                                                を開発しました。
                                                <br />
                                                web AI 統合chrome拡張機能
							<a
								href="https://github.com/yuremono/chatKanban"
                                                        className=" md:text-xl hover:text-AC border-b border-b-current leading-none px-1"
                                                        target="_blank" rel="noopener noreferrer"
                                                        
							>
								Chat Canban
								<ArrowSquareOutIcon className=" align-middle ml-1 mb-1" />
                                                </a>
                                                を開発しました。
                                                <br />
                                                このポートフォリオはReact SPA (Vite) で制作しています。
                                                <br />
                                                その他には
							<a
								href="https://github.com/yuremono/agent-relay"
                                                        className=" md:text-xl hover:text-AC border-b border-b-current leading-none px-1"
                                                        target="_blank" rel="noopener noreferrer"
							>
								VScode ターミナル間連絡ツール
								<ArrowSquareOutIcon className=" align-middle ml-1 mb-1" />
                                                </a>
							<a
								href="/bbox"
								className=" md:text-xl hover:text-AC border-b border-b-current leading-none px-1"
							>
								デザインの座標とサイズを抽出するUI
                                                </a>
							<a
								href="https://github.com/yuremono/agent-driven-CMS"
                                                        className=" md:text-xl hover:text-AC border-b border-b-current leading-none px-1"
                                                        target="_blank" rel="noopener noreferrer"
							>
								Codex/ClaudeCodeの権限をブラウザ上で表示
								<ArrowSquareOutIcon className=" align-middle ml-1 mb-1" />
                                                </a>
							<a
								href="/rects"
								className=" md:text-xl hover:text-AC border-b border-b-current leading-none px-1"
							>
								図形をもとにインラインSVGを作成するツール
                                                </a>
							<a
								href="/bunmyaku"
								className=" md:text-xl hover:text-AC border-b border-b-current leading-none px-1"
							>
								エージェント用ドキュメント作成UI
                                                </a>
							<a
								href="https://github.com/yuremono/headless-CMS"
                                                        className=" md:text-xl hover:text-AC border-b border-b-current leading-none px-1"
                                                        target="_blank" rel="noopener noreferrer"
							>
								JSONデータをWEBやアプリで呼び出すヘッドレスCMS
								<ArrowSquareOutIcon className=" align-middle ml-1 mb-1" />
                                                </a>
                                                <br />
                                                などを開発してきました。
					</div>
				</div>
			</div>
		</section>
	);
}
