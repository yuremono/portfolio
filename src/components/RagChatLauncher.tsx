import { useCallback, useState } from "react";
import { ChatCircleDotsIcon } from "@phosphor-icons/react";
import RagChat from "./RagChat";

interface RagChatLauncherProps {
	className?: string;
}

const RAG_CHAT_PANEL_ID = "rag-chat-panel";

export default function RagChatLauncher({ className }: RagChatLauncherProps) {
	const [open, setOpen] = useState(false);
	const panelId = RAG_CHAT_PANEL_ID;

	const togglePanel = useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	return (
		<>
			<div
				className={["RagChatLauncher", className].filter(Boolean).join(" ")}
			>
				<button
					type="button"
					className="RagChatLauncherBtn"
					aria-expanded={open}
					aria-controls={panelId}
					aria-label={open ? "チャットを閉じる" : "本人について質問する"}
					onClick={togglePanel}
				>
					<ChatCircleDotsIcon
						className="RagChatLauncherIcon scale-x-[-1]"
						weight="light"
						aria-hidden
					/>
					<span className="RagChatLauncherAnnotation WTS text-BC">
						{open ? "Close Chat" : "Open Chat"}
					</span>
				</button>
			</div>
			<div
				id={panelId}
				className={`RagChatPanel  [--wid:960px] ${open ? "IsOpen" : ""}`}
				aria-label="本人について質問できるチャット"
				aria-hidden={!open}
			>
				<RagChat className="RagChatPanelBody" />
			</div>
		</>
	);
}
