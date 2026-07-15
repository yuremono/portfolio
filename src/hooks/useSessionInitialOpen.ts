import { useEffect, useState } from "react";

/**
 * セッション初回マウント時のみ true を返す。
 * 同一タブでの再訪問（2回目以降のマウント）では false になるため、
 * マニュアルモーダル等の「初回アクセス時だけ開いておく」制御に使う。
 */
export function useSessionInitialOpen(storageKey: string): boolean {
	const [initialOpen] = useState(() => {
		try {
			return sessionStorage.getItem(storageKey) == null;
		} catch {
			return false;
		}
	});

	useEffect(() => {
		try {
			sessionStorage.setItem(storageKey, "1");
		} catch {// sessionStorage が使えない環境では自動表示しない
		}
	}, [storageKey]);

	return initialOpen;
}
