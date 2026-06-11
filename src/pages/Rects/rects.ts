/**
 * 親を 100%×100% とみなし、矩形をすべて % で乱数生成する（px は使わない）。
 * left/top は中心位置（CSS で translate(-50%, -50%) する前提）。
 */

/** 1 個の矩形（left/top/width は親に対する %。height は aspectRatio で決める） */
export type Rect = {
	left: number;
	top: number;
	width: number;
	aspectRatio: readonly [number, number];
};

/** 作る矩形の個数 */
const COUNT = 6;

/** 1 個の矩形を置くとき、重なったらやり直す最大回数（この回数で置けなければその個はスキップ） */
const MAX_TRY = 6;

/**
 * ランダム時に等確率で選ぶ [横, 縦]（`itemAspect` 未指定時）
 */
const RATIOS: readonly (readonly [number, number])[] = [
	[1, 1],
	[2, 3],
	[3, 2],
	[16, 9],
	[9, 16],
	[4, 3],
	[3, 4],
	[2, 1],
	[1, 2],
	[16, 10],
	[10, 16],
	[3, 1],
	[1, 3],
];

/** UI チェックの初期オン（`RATIOS` の先頭 3 要素と対応） */
const DEFAULT_ASPECT_CHECK_IDS = new Set(["1-1", "2-3", "3-2"]);

/** UI のセレクト用（ラベルと固定比。`aspect` が null のときはランダム＝`RATIOS`） */
export const ITEM_ASPECT_OPTIONS: readonly {
	id: string;
	label: string;
	aspect: readonly [number, number] | null;
}[] = [
	{ id: "random", label: "ランダム（混在）", aspect: null },
	{ id: "1-1", label: "1:1", aspect: [1, 1] },
	{ id: "2-3", label: "2:3", aspect: [2, 3] },
	{ id: "3-2", label: "3:2", aspect: [3, 2] },
	{ id: "16-9", label: "16:9", aspect: [16, 9] },
	{ id: "9-16", label: "9:16", aspect: [9, 16] },
	{ id: "4-3", label: "4:3", aspect: [4, 3] },
	{ id: "3-4", label: "3:4", aspect: [3, 4] },
	{ id: "2-1", label: "2:1", aspect: [2, 1] },
	{ id: "1-2", label: "1:2", aspect: [1, 2] },
	{ id: "16-10", label: "16:10", aspect: [16, 10] },
	{ id: "10-16", label: "10:16", aspect: [10, 16] },
	{ id: "3-1", label: "3:1", aspect: [3, 1] },
	{ id: "1-3", label: "1:3", aspect: [1, 3] },
];

/** UI 用: チェックボックス初期値（`DEFAULT_ASPECT_CHECK_IDS` のみオン） */
export function defaultAspectChecks(): Record<string, boolean> {
	return Object.fromEntries(
		ITEM_ASPECT_OPTIONS.filter((o) => o.aspect).map((o) => [
			o.id,
			DEFAULT_ASPECT_CHECK_IDS.has(o.id),
		]),
	) as Record<string, boolean>;
}

/** チェック状態から `rects` の `itemAspectPool` 用の配列を作る */
export function itemAspectPoolFromChecks(
	checks: Record<string, boolean>,
): readonly (readonly [number, number])[] {
	return ITEM_ASPECT_OPTIONS.filter((o) => o.aspect && checks[o.id]).map(
		(o) => o.aspect!,
	);
}

/** `rects` の `baseWidthPct` / `widthRandomPct` を省略したときの既定値 */
export const DEFAULT_RECT_BASE_WIDTH_PCT = 20;
export const DEFAULT_RECT_WIDTH_RANDOM_PCT = 10;

/** 内部計算の分解能（1000 = 100.0%） */
const U = 1000;

/** 親の幅に対する % を 0.1% 単位の整数（0〜1000）に変換 */
function pctToWidthU(pct: number): number {
	const raw = Number(pct);
	const v = Number.isFinite(raw) ? raw : 0;
	return Math.round(Math.min(100, Math.max(0, v)) * 10);
}

type Opt = {
	n?: number;
	/** 親コンテナの幅:高さ（重なり判定のため。プレビュー枠の aspect-ratio と合わせる） */
	parentAspect?: readonly [number, number];
	/**
	 * 親の幅に対する矩形の幅 % の基準値。未指定時は `DEFAULT_RECT_BASE_WIDTH_PCT`。
	 */
	baseWidthPct?: number;
	/**
	 * 基準に加える幅の乱数（0〜この値まで、親幅に対する %）。未指定時は `DEFAULT_RECT_WIDTH_RANDOM_PCT`。
	 * 各矩形ごとに `baseWidthPct + random[0, widthRandomPct]`（0.1% 刻み）で決定。
	 */
	widthRandomPct?: number;
	/**
	 * 各矩形の [横, 縦] を固定する。指定時は `itemAspectPool` より優先。
	 */
	itemAspect?: readonly [number, number];
	/**
	 * 各矩形ごとに、この配列から等確率で [横, 縦] を選ぶ。
	 * 未指定・空配列のときは `RATIOS` から選ぶ（`itemAspect` 未指定時のみ）。
	 */
	itemAspectPool?: readonly (readonly [number, number])[];
	/**
	 * true のとき既存矩形との重なりを許可する（重なり判定を行わない）。未指定時は false。
	 */
	allowOverlap?: boolean;
};

/** 論理親サイズ上での AABB（重なり判定用） */
function bbox(
	centerLeftPct: number,
	centerTopPct: number,
	widthPct: number,
	aspect: readonly [number, number],
	parentW: number,
	parentH: number,
) {
	const [aw, ah] = aspect;
	const cw = (parentW * widthPct) / 100;
	const ch = cw * (ah / aw);
	const cx = (parentW * centerLeftPct) / 100;
	const cy = (parentH * centerTopPct) / 100;
	return {
		left: cx - cw / 2,
		right: cx + cw / 2,
		top: cy - ch / 2,
		bottom: cy + ch / 2,
	};
}

function overlaps(
	a: Rect,
	b: Rect,
	parentW: number,
	parentH: number,
): boolean {
	const A = bbox(a.left, a.top, a.width, a.aspectRatio, parentW, parentH);
	const B = bbox(b.left, b.top, b.width, b.aspectRatio, parentW, parentH);
	return A.left < B.right && A.right > B.left && A.top < B.bottom && A.bottom > B.top;
}

function anyOverlapWith(
	candidate: Rect,
	placed: Rect[],
	parentW: number,
	parentH: number,
): boolean {
	for (const p of placed) {
		if (overlaps(candidate, p, parentW, parentH)) {
			return true;
		}
	}
	return false;
}

/** 内部整数（0〜1000 = 0〜100%）をそのままのスケールの Rect に（中心座標・幅・アスペクト比） */
function toRect(
	centerLeftU: number,
	centerTopU: number,
	widthU: number,
	aspect: readonly [number, number],
): Rect {
	return {
		left: centerLeftU / 10,
		top: centerTopU / 10,
		width: widthU / 10,
		aspectRatio: aspect,
	};
}

/**
 * 親を幅 100%・高さ 100% としたときの矩形を乱数生成する。
 * - left/top は中心が親の 0〜100% の範囲に入るよう乱数（はみ出しは許容しないのは座標だけ）
 * - 幅は親の幅に対する % で、`baseWidthPct` に `widthRandomPct` 範囲の乱数を加えた値（アスペクト比とは独立）
 * - アスペクト比は `itemAspect` / `itemAspectPool` / `RATIOS` から選ぶ
 * - 重なりは親の実アスペクト比を使って判定（opt.parentAspect）。`allowOverlap` で無効化可
 */
export function rects(opt?: Opt): Rect[] {
	const n = opt?.n ?? COUNT;
	const [pW, pH] = opt?.parentAspect ?? [1, 1];
	const allowOverlap = opt?.allowOverlap ?? false;

	const baseU =
		opt?.baseWidthPct != null
			? pctToWidthU(opt.baseWidthPct)
			: pctToWidthU(DEFAULT_RECT_BASE_WIDTH_PCT);
	const randomSpanU =
		opt?.widthRandomPct != null
			? pctToWidthU(opt.widthRandomPct)
			: pctToWidthU(DEFAULT_RECT_WIDTH_RANDOM_PCT);

	const out: Rect[] = [];

	for (let i = 0; i < n; i++) {
		let placed = false;
		for (let t = 0; t < MAX_TRY && !placed; t++) {
			const pool =
				opt?.itemAspectPool && opt.itemAspectPool.length > 0
					? opt.itemAspectPool
					: RATIOS;
			const aspect =
				opt?.itemAspect ?? pool[Math.floor(Math.random() * pool.length)]!;
			/** 幅 %（0.1% 単位）: 基準 + [0, randomSpanU] */
			const rawWidthU = baseU + Math.floor(Math.random() * (randomSpanU + 1));
			const widthU = Math.min(U, Math.max(1, rawWidthU));

			/** 中心の left/top は親の内側（0〜100%）だけランダム */
			const centerLeftU = Math.floor(Math.random() * (U + 1));
			const centerTopU = Math.floor(Math.random() * (U + 1));

			const candidate = toRect(centerLeftU, centerTopU, widthU, aspect);
			if (
				!allowOverlap &&
				anyOverlapWith(candidate, out, pW, pH)
			) {
				continue;
			}

			out.push(candidate);
			placed = true;
		}
	}

	return out;
}
