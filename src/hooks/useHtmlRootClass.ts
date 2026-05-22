import { useEffect } from "react";

/**
 * Mount 時に `document.documentElement` にクラスを付与し、Unmount で除去する。
 * `className` が空または空白のみのときは何もしない。
 */
export function useHtmlRootClass(className = ""): void {
	useEffect(() => {
		const classNames = className.trim().split(/\s+/).filter(Boolean);
		if (classNames.length === 0) return;
		const root = document.documentElement;
		root.classList.add(...classNames);
		return () => {
			root.classList.remove(...classNames);
		};
	}, [className]);
}
