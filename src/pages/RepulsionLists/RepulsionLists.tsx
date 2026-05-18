import {
	Children,
	cloneElement,
	isValidElement,
	useCallback,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { useRepulsionListsLayout } from "./layout";
import { RepulsionListChip } from "./RepulsionListChip";
import { repulsionListsStyles } from "./styles";

interface RepulsionListsProps {
	className?: string;
}

interface RepulsionListItemsProps {
	activeId: string | null;
	children: ReactNode;
	onActivate: (id: string) => void;
	onClose: (id: string) => void;
}

interface RepulsionListItemInjectedProps {
	index?: number;
	active?: boolean;
	onActivate?: (id: string) => void;
	onClose?: (id: string) => void;
}

function RepulsionListItems({
	activeId,
	children,
	onActivate,
	onClose,
}: RepulsionListItemsProps) {
	return Children.map(children, (child, index) => {
		if (!isValidElement<RepulsionListItemInjectedProps>(child)) return child;
		const id = `repulsion-list-item-${index}`;
		return cloneElement(child, {
			index,
			active: activeId === id,
			onActivate,
			onClose,
		});
	});
}

export function RepulsionLists({ className }: RepulsionListsProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const touchRef = useRef<HTMLDivElement>(null);
	const [activeRepulsionItemId, setActiveRepulsionItemId] = useState<
		string | null
	>(null);
	useRepulsionListsLayout(cardRef, svgRef, touchRef);

	const activateRepulsionItem = useCallback((id: string) => {
		setActiveRepulsionItemId(id);
	}, []);

	const closeRepulsionItem = useCallback((id: string) => {
		setActiveRepulsionItemId((currentId) =>
			currentId === id ? null : currentId,
		);
	}, []);

	const closeAllRepulsionItems = useCallback(() => {
		setActiveRepulsionItemId(null);
	}, []);

	return (
		<section
			className={["", className]
				.filter(Boolean)
				.join(" ")}
		>
			<style>{repulsionListsStyles}</style>
			<div
				ref={touchRef}
				id="repulsion-lists-horizontal-scroll-container"
				className="repulsion-lists-viewport"
				onPointerLeave={closeAllRepulsionItems}
				onBlur={(event) => {
					const nextTarget = event.relatedTarget;
					if (
						!(nextTarget instanceof Node) ||
						!event.currentTarget.contains(nextTarget)
					) {
						closeAllRepulsionItems();
					}
				}}
			>
				<div ref={cardRef} id="repulsion-lists-card-container">
					<svg
						ref={svgRef}
						className="repulsion-lists-lines"
						viewBox="0 0 0 0"
						preserveAspectRatio="none"
						data-connection-lines="true"
						aria-hidden="true"
					/>
					<ul
						className="repulsion-lists-list"
						aria-label="Repulsion list"
					>
						<RepulsionListItems
							activeId={activeRepulsionItemId}
							onActivate={activateRepulsionItem}
							onClose={closeRepulsionItem}
						>
							<RepulsionListChip
								title="Other Works"
								className="is-initial pointer-events-none mr-4 -mt-4 bg-transparent"
                                                        />
                                                        <RepulsionListChip
								title="Random Generator"
                                                                to="/rects"
								className="mt-4 "
							>
							<p>
								コントローラー付きのランダム図形配置ジェネレーター
							</p>
							<details className="Toggle IsSmall font-normal ">
								<summary className="Eng">SVG...</summary>
								<div>
									セル数、コンテナを埋める方向性、図形の種類(正方形、三角形、星、十字)、角度などを調整。rect,circle等SVGタグのスニペットをコピペできる。
								</div>
							</details>
							<details className="Toggle IsSmall font-normal ">
								<summary className="Eng">Rects...</summary>
								<div>
									divタグの大きさ、個数、角丸、重なり可否などを指定。いいバランスの時にコピーして画像配置などでそのまま使う想定。SVG出力も可。
								</div>
							</details>
						</RepulsionListChip>
							<RepulsionListChip
								title="Agent Driven CMS"
								to="/donut"
								className=""
							>
							<p>
								Codex または Claude Code を Next.js Node
								runtimeで中継。ローカルブラウザでエージェントに直接ソースコードを編集させるCMS
							</p>
							<details className="Toggle IsSmall font-normal ">
								<summary className="Eng">Detail...</summary>
								<div>
									- AI時代では
									「チャットで編集できるwebサイト」が求められると仮定する
									<br />
									- ローカル完結ならモデル性能依存を解消できる
									<br />
									- フロントエンド以外は全て仕様駆動。
									<br />
									考察：
									リテラシーの高いクライアント＆十分な初期サポートという条件は必須と考えていたし、体験としては有意義であるが、エージェントの行動への責任は「サポート」ではカバーできないことを実感した。ここまでやるならCursor、Codex等の使い方自体をサポートした方が無難。と考えました。
								</div>
							</details>
						</RepulsionListChip>
							
							<RepulsionListChip
								title="Shuffle Divide"
								to="/shuffleDivide"
							>
							<p>
								制作サイトの部分再現です。
							</p>
						</RepulsionListChip>
							<RepulsionListChip
								title="Glitch"
								to="/glitch"
							>
							<p>
                                                        制作サイトの部分再現です。
							</p>
						</RepulsionListChip>
							<RepulsionListChip
								title="Grid Carousel"
								to="/grid-carousel"
							>
							<p>グリッドカルーセルです。</p>
						</RepulsionListChip>
							<RepulsionListChip
								title="Bounding Box On Design"
                                                                to="/bbox"
                                                                className="-mb-4"
                                                                
							>
							<p>
								AI生成のLPデザインにバウンディングボックスを配置し、画像+構造化データをエージェントに渡すツールです。
							</p>
						</RepulsionListChip>
							<RepulsionListChip
								title="Activity"
								to="/activity"
							>
							<p>職務要約と活動記録を書いています。</p>
						</RepulsionListChip>
							<RepulsionListChip
								title="Chat Canban"
                                                                href="https://chat-kanban.vercel.app/"
                                                                className="mb-4"
                                                                
							>
							<p>
								ローカル環境の特定ブラウザ(Chromium系)に拡張機能をインストールし、ChatGPTやGeminiにチャット履歴を送信するためのUIを設置。特定のurlでまとめて閲覧。ムーバブルサイドバー機能付き。
								<br />
								＊デモページ。当サイトに統合していません。
							</p>
						</RepulsionListChip>
							<RepulsionListChip
								title="NextJs CMS"
								href="https://cms0505.vercel.app/editor"
							>
							<p>
								AI駆動開発最初の制作物。実務で経験できないシステム設計、データ管理、React、TypeScriptを学ぶため、単一ページ専用CMSを作成。閲覧pass: view
							</p>
						</RepulsionListChip>
							{/* <RepulsionListChip
								title="/Clone Modules"
                                                                to="/examples"
                                                                className="mb-4"

							>
							<p>
                                                                `ai-website-cloner`では再現できないサイトを部分的に忠実に再現するスキルを使用します。
                                                                最先端モデルでも(こそ)言うこと聞かないので大抵2ターン以上かかります。
                                                                新規ページのExampleページと併用している為散らかってますがおまけページです。
							</p>
							</RepulsionListChip> */}
						</RepulsionListItems>
					</ul>
				</div>
			</div>
		</section>
	);
}
