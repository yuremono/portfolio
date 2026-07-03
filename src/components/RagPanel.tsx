import { PaperPlaneRight } from "@phosphor-icons/react";
import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";

interface RagPanelProps {
	className?: string;
}

interface ChatMessage {
	id: number;
	role: "user" | "assistant";
	text: ReactNode;
	status?: "streaming" | "error";
	sources?: string[];
}

const API_URL = import.meta.env.VITE_RAG_API_URL ?? "";
const MODEL_OPTIONS = [
	{ value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
];

// 開いた時点でアシスタントの注釈が表示されている状態にする。段落ごとにDOM要素として編集する
const INTRO_MESSAGE: ChatMessage = {
	id: 0,
	role: "assistant",
	text: (
		<>
			私は制作者のRAGチャット秘書です。<br/>
			経歴・考え方・制作物についてご質問にお答えします。<br/>
			AWS上の生成AIとRAG(検索拡張生成)を使って回答する、実験的な機能です。<br/>
			用意している情報の範囲を超えるご質問には、十分にお答えできない場合がございます。<br/>
			お答えしづらいご質問には、秘書として回答を控えさせていただく場合がございます。<br/>
			1人あたり2問/2日までとさせていただいております。<br/>
		</>
	),
};

function TranscriptMessage({ item }: { item: ChatMessage }) {
	const isUser = item.role === "user";
	const isError = item.status === "error";
	const label = isUser ? "You" : isError ? "Error" : "Assistant";
	const bubbleClass = isUser
		? "RagPanelBubble IsUser"
		: isError
			? "RagPanelBubble IsError"
			: "RagPanelBubble IsAssistant";

	return (
		<article
			className={`RagPanelItem ${isUser ? "IsUser" : "IsAssistant"}`}
		>
			<p className="RagPanelLabel">{label}</p>
			<div className={bubbleClass}>
				{item.text || (item.status === "streaming" ? "…" : "")}
			</div>
			{item.sources && item.sources.length > 0 ? (
				<ul className="RagPanelSources">
					{item.sources.map((url) => (
						<li key={url}>
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
							>
								{url}
							</a>
						</li>
					))}
				</ul>
			) : null}
		</article>
	);
}

const RagPanel = ({ className }: RagPanelProps) => {
	const [transcript, setTranscript] = useState<ChatMessage[]>([
		INTRO_MESSAGE,
	]);
	const [input, setInput] = useState("");
	const [selectedModel] = useState(MODEL_OPTIONS[0].value);
	const [loading, setLoading] = useState(false);
	const nextIdRef = useRef(1);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const transcriptViewportRef = useRef<HTMLDivElement>(null);
	const stickToBottomRef = useRef(true);

	const canSubmit = input.trim().length > 0 && !loading;

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		const question = input.trim();
		if (!question || loading) return;

		const userMsg: ChatMessage = {
			id: nextIdRef.current++,
			role: "user",
			text: question,
		};
		setTranscript((prev) => [...prev, userMsg]);
		setInput("");
		setLoading(true);

		try {
			const res = await fetch(`${API_URL}/ask`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question }),
			});
			const data = await res.json();

			if (res.status === 429) {
				setTranscript((prev) => [
					...prev,
					{
						id: nextIdRef.current++,
						role: "assistant",
						status: "error",
						text:
							data.error ??
							"質問の上限に達しました。また後日お試しください。",
					},
				]);
				return;
			}
			if (!res.ok) {
				setTranscript((prev) => [
					...prev,
					{
						id: nextIdRef.current++,
						role: "assistant",
						status: "error",
						text: data.error ?? "回答の取得に失敗しました。",
					},
				]);
				return;
			}

			setTranscript((prev) => [
				...prev,
				{
					id: nextIdRef.current++,
					role: "assistant",
					text: data.answer ?? "",
					sources: data.sources ?? [],
				},
			]);
		} catch {
			setTranscript((prev) => [
				...prev,
				{
					id: nextIdRef.current++,
					role: "assistant",
					status: "error",
					text: "通信エラーが発生しました。時間をおいてお試しください。",
				},
			]);
		} finally {
			setLoading(false);
		}
	}

	function handleTranscriptScroll(event: React.UIEvent<HTMLDivElement>) {
		const node = event.currentTarget;
		const distanceFromBottom =
			node.scrollHeight - node.scrollTop - node.clientHeight;
		stickToBottomRef.current = distanceFromBottom < 24;
	}

	function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			void handleSubmit(event as unknown as React.FormEvent);
		}
	}

	useEffect(() => {
		const node = transcriptViewportRef.current;
		if (!node || !stickToBottomRef.current) return;
		const frame = window.requestAnimationFrame(() => {
			node.scrollTop = node.scrollHeight;
		});
		return () => window.cancelAnimationFrame(frame);
	}, [transcript, loading]);

	useLayoutEffect(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	}, [input]);

	const showComposerHint = input.trim().length === 0;

	return (
		<div className={`RagPanelInner [--wid:960px] ${className ?? ""}`}>
			<div className="RagPanelRail">
				<section
					ref={transcriptViewportRef}
					className="RagPanelScroll"
					aria-label="Conversation transcript"
					aria-live="polite"
					aria-relevant="additions text"
					onScroll={handleTranscriptScroll}
					role="log"
				>
					<div className="RagPanelViewport">
						<div className="RagPanelList">
							{transcript.map((item) => (
								<TranscriptMessage item={item} key={item.id} />
							))}
							{loading ? (
								<TranscriptMessage
									item={{
										id: -1,
										role: "assistant",
										status: "streaming",
										text: "",
									}}
								/>
							) : null}
						</div>
					</div>
				</section>
			</div>

			<section className="RagPanelDock w-full rounded-[38px] border border-TC/10 bg-WH/70 px-5 py-2 text-TC shadow-[0_22px_72px_var(--TC10)] backdrop-blur-[28px]">
				<form
					className="flex items-center gap-2 max-md:flex-wrap"
					onSubmit={handleSubmit}
				>
					<div className="RagPanelField relative flex-1 min-w-0">
						<textarea
							aria-label="質問を入力"
							ref={textareaRef}
							className="RagPanelInput block w-full resize-none overflow-hidden border-0 bg-transparent px-1 py-2 outline-none"
							onChange={(event) => setInput(event.target.value)}
							onKeyDown={onKeyDown}
							placeholder=""
							rows={1}
							value={input}
							disabled={loading}
						/>
						{showComposerHint ? (
							<div className="w-full text-GR pointer-events-none absolute left-1 top-0 h-full flex flex-wrap items-center gap-1 px-1 leading-7">
								<span>制作者について質問できます&nbsp;</span>
							</div>
						) : null}
					</div>

					<label className="RagPanelModel relative inline-flex items-center">
						{/* <span className="sr-only">モデルを選択</span>
						<select
							aria-label="モデルを選択"
							className="RagPanelSelect appearance-none rounded-full border border-[rgba(38,27,18,0.12)] bg-white/76 min-h-10 pl-4 pr-10 text-sm text-[#1d1712] outline-none transition focus:border-[rgba(33,77,102,0.2)] focus:bg-white"
							value={selectedModel}
							onChange={(event) => setSelectedModel(event.target.value)}
						>
							{MODEL_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select> */}
						<span className="ml-auto text-GR leading-none">
							Model:{selectedModel}
						</span>
						{/* <CaretDown
							aria-hidden="true"
							className="pointer-events-none absolute right-3 text-SC"
							size={16}
							weight="bold"
						/> */}
					</label>

					<button
						aria-label="送信"
						className="RagPanelSend inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-MC text-WH transition  disabled:cursor-progress disabled:opacity-65"
						disabled={!canSubmit}
						title="送信"
						type="submit"
					>
						<PaperPlaneRight size={18} weight="fill" />
					</button>
				</form>
			</section>
		</div>
	);
};

export default RagPanel;
