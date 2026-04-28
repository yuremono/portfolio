/** グループ追加ドラフト意図をリロード〜初回画像読込まで復元するためのキー（session + local で同一キー） */
export const BBOX_PENDING_PARENT_DRAFT_KEY = "bbox-pending-parent-draft";

export function setPendingParentDraftStorage(): void {
	try {
		sessionStorage.setItem(BBOX_PENDING_PARENT_DRAFT_KEY, "1");
	} catch {
		/* 不可時は無視 */
	}
	try {
		localStorage.setItem(BBOX_PENDING_PARENT_DRAFT_KEY, "1");
	} catch {
		/* 不可時は無視 */
	}
}

export function clearPendingParentDraftStorage(): void {
	try {
		sessionStorage.removeItem(BBOX_PENDING_PARENT_DRAFT_KEY);
	} catch {
		/* 不可時は無視 */
	}
	try {
		localStorage.removeItem(BBOX_PENDING_PARENT_DRAFT_KEY);
	} catch {
		/* 不可時は無視 */
	}
}

/** session または local のいずれかにフラグがあれば true */
export function readPendingParentDraftStorage(): boolean {
	try {
		if (sessionStorage.getItem(BBOX_PENDING_PARENT_DRAFT_KEY) === "1") return true;
	} catch {
		/* 不可時は無視 */
	}
	try {
		if (localStorage.getItem(BBOX_PENDING_PARENT_DRAFT_KEY) === "1") return true;
	} catch {
		/* 不可時は無視 */
	}
	return false;
}
