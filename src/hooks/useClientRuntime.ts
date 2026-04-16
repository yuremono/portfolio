import { useEffect, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { initClientRuntime } from "../lib/initClientRuntime";

export interface UseClientRuntimeOptions {
	rootRef?: RefObject<Element | null>;
	enabled?: boolean;
}

/**
 * ルート変更時に DOM 初期化をやり直す（同一ページ内の再マウント対策で先に disconnect）。
 * rootRef を渡すとその要素配下のみ走査。省略時は document（後方互換）。
 */
export function useClientRuntime(options: UseClientRuntimeOptions = {}) {
	const { rootRef, enabled = true } = options;
	const location = useLocation();

	useEffect(() => {
		if (!enabled) return;
		if (rootRef && !rootRef.current) return;
		const root = rootRef?.current ?? document;
		const { disconnect } = initClientRuntime(root);
		return disconnect;
	}, [enabled, location.pathname, rootRef]);
}
