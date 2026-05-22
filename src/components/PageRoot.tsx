import { forwardRef, type ReactNode } from "react";

export interface PageRootProps {
	className?: string;
	children: ReactNode;
}

/**
 * ルート単位の DOM スコープ（ref）とレイアウトの外枠。
 * Header / main / Footer の並びは子で受け取り、例外レイアウトも children で差し替える。
 */
export const PageRoot = forwardRef<HTMLDivElement, PageRootProps>(
	function PageRoot({ className, children }, ref) {
		return (
			<div
				ref={ref}
				className={["PageRoot", className].filter(Boolean).join(" ")}
			>
				{children}
			</div>
		);
	},
);
