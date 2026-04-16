import { useEffect } from "react";

/**
 * Mount 時に `document.documentElement` にクラスを付与し、Unmount で除去する。
 * `className` が空または空白のみのときは何もしない。
 */
export function useHtmlRootClass(className = ""): void {
	useEffect(() => {
		const trimmed = className.trim();
		if (!trimmed) return;
		const root = document.documentElement;
		root.classList.add(trimmed);
		return () => {
			root.classList.remove(trimmed);
		};
	}, [className]);
}
