import { useCallback, useState } from "react";
import { ChatCircleDotsIcon } from "@phosphor-icons/react";
import RagPanel from "./RagPanel";

interface RagChatProps {
	className?: string;
}

const RAG_PANEL_ID = "rag-panel";

export default function RagChat({ className }: RagChatProps) {
	const [open, setOpen] = useState(false);
	const panelId = RAG_PANEL_ID;

	const togglePanel = useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	return (
		<>
			<div className={["RagLauncher", className].filter(Boolean).join(" ")}>
				<button
					type="button"
					className="RagLauncherBtn"
					aria-expanded={open}
					aria-controls={panelId}
					aria-label={open ? "チャットを閉じる" : "本人について質問する"}
					onClick={togglePanel}
				>
					<ChatCircleDotsIcon
						className="RagLauncherIcon scale-x-[-1]"
						weight="light"
						aria-hidden
					/>
					<span className="RagLauncherAnnotation WTS text-BC">
						{open ? "Close Chat" : "Open Chat"}
					</span>
				</button>
			</div>
			<div
				id={panelId}
				className={`RagPanel  [--wid:960px] ${open ? "IsOpen" : ""}`}
				aria-label="本人について質問できるチャット"
				aria-hidden={!open}
			>
				<RagPanel className="RagPanelBody" />
			</div>
		</>
	);
}
