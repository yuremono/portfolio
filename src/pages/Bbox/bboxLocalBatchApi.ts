/** 開発サーバー専用: Vite middleware への一括出力（本番ビルドではフェッチしない）。 */

export const BBOX_LOCAL_BATCH_EXPORT_PATH = "/__bbox_local_batch__/export";

export interface BboxLocalBatchPngPayload {
	readonly filename: string;
	readonly base64: string;
}

export async function blobToBase64Png(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const fr = new FileReader();
		fr.onload = () => {
			const s = fr.result as string;
			const i = s.indexOf("base64,");
			resolve(i >= 0 ? s.slice(i + 7) : "");
		};
		fr.onerror = () => reject(fr.error);
		fr.readAsDataURL(blob);
	});
}

export async function postBboxLocalBatchExport(payload: {
	readonly md: string;
	readonly pngs: readonly BboxLocalBatchPngPayload[];
}): Promise<
	| { ok: true; relative: string }
	| { ok: false; error?: string }
> {
	let res: Response;
	try {
		res = await fetch(BBOX_LOCAL_BATCH_EXPORT_PATH, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
	} catch (e) {
		return { ok: false, error: String(e) };
	}
	let data: unknown;
	try {
		data = await res.json();
	} catch {
		return { ok: false, error: "Invalid JSON response" };
	}
	if (
		data &&
		typeof data === "object" &&
		"ok" in data &&
		(data as { ok: unknown }).ok === true &&
		"relative" in data &&
		typeof (data as { relative: unknown }).relative === "string"
	) {
		return { ok: true, relative: (data as { relative: string }).relative };
	}
	const err =
		data &&
		typeof data === "object" &&
		"error" in data &&
		typeof (data as { error: unknown }).error === "string"
			? (data as { error: string }).error
			: `HTTP ${res.status}`;
	return { ok: false, error: err };
}
