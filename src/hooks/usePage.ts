import { useCallback, useEffect, useRef, useState } from "react";
import { initMindMapRuntime } from "../lib/effects/mindMapRuntime";

const STORAGE_KEY = "theme-mode";

export function usePage() {
	const ref = useRef<HTMLDivElement>(null);
	const [dark, setDark] = useState(() => {
		try {
			return localStorage.getItem(STORAGE_KEY) === "dark";
		} catch {
			return false;
		}
	});

	const toggleTheme = useCallback(() => {
		setDark((prev) => {
			const next = !prev;
			try {
				localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
			} catch {
				/* ignore */
			}
			return next;
		});
	}, []);

	/** テーマは Fragment 不可のためラッパーではなく html に付与（他ページへはアンマウントで解除） */
	useEffect(() => {
		document.documentElement.classList.toggle("dark", dark);
		return () => {
			document.documentElement.classList.remove("dark");
		};
	}, [dark]);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const disconnectMind = initMindMapRuntime(el);
		return () => {
			disconnectMind();
		};
	}, []);

	return { ref, dark, toggleTheme };
}
