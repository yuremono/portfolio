import type { ReactNode } from "react";

const futureNoticeText = "Implemented someday...";

// 未実装機能を実装したら、このFutureNotice wrapperを外して注釈表示も削除する。
export function FutureNotice({
	children,
	placement = "bottom",
}: {
	children: ReactNode;
	placement?: "top" | "bottom";
}) {
	return (
		<div className="group/future relative">
			{children}
			<span
				className={[
					"hidden lg:block duration-500 pointer-events-none absolute left-1/2 z-40 w-max max-w-48 -translate-x-1/2 BabelRightDown bg-WH px-2 py-1 text-center text-[0.625rem] leading-tight text-MC opacity-0   group-hover/future:opacity-100 ",
					placement === "top" ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]",
				].join(" ")}
				role="note"
			>
				{futureNoticeText}
			</span>
		</div>
	);
}
