import { useCallback, useEffect, useRef, useState } from "react";
import { initBudoux } from "../lib/budoux";
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

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const budoux = initBudoux(el);
		const disconnectMind = initMindMapRuntime(el);
		return () => {
			budoux.disconnect();
			disconnectMind();
		};
	}, []);

	return { ref, dark, toggleTheme };
}
