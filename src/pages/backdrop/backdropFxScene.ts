/**
 * バックドロップ用キャンバスFXの共通描画。
 * 対象グループ内の縞パターン・画像・ボーダーを縮尺付きで canvas に写す。
 * 使用側: backdrop/BackdropFx.tsx（レンダラーは backdropFxRenderers.ts）
 */

/**
 * グループ 1 つ分の素材を指定縮尺の canvas に用意して返すプロバイダ。
 * 実装差（scene の手描き再構築か DOM 取り込みか）をここで吸収し、
 * レンダラーはピクセルの出所を問わず同じアルゴリズムで加工できる。
 */
export type SourceProvider = (
	group: HTMLElement,
	scale: number,
) => HTMLCanvasElement | null;

/** :root の CSS 変数から色文字列を読む（JS 側に色の実値を持たないため） */
export const cssVar = (name: string): string =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** 色文字列を RGB 値へ変換（oklch も canvas 経由で解決。減色パレット用） */
export function colorToRgb(color: string): [number, number, number] {
	const c = document.createElement("canvas");
	c.width = 1;
	c.height = 1;
	const ctx = c.getContext("2d")!;
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	const d = ctx.getImageData(0, 0, 1, 1).data;
	return [d[0]!, d[1]!, d[2]!];
}

/** RGB の相対輝度（0〜255） */
export const lumOf = (c: [number, number, number]): number =>
	0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

/** object-fit: cover 相当で img を切り抜いて描く */
export function drawCover(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	x: number,
	y: number,
	w: number,
	h: number,
) {
	const ar = w / h;
	const iar = img.naturalWidth / img.naturalHeight;
	let sx = 0;
	let sy = 0;
	let sw = img.naturalWidth;
	let sh = img.naturalHeight;
	if (iar > ar) {
		sw = sh * ar;
		sx = (img.naturalWidth - sw) / 2;
	} else {
		sh = sw / ar;
		sy = (img.naturalHeight - sh) / 2;
	}
	ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/** グループ 1 つ分の素材（縞パターン＋各画像＋ボーダー）を縮尺付きで canvas に描く */
export function drawScene(
	ctx: CanvasRenderingContext2D,
	group: HTMLElement,
	scale: number,
	patternVars: readonly string[],
) {
	const rect = group.getBoundingClientRect();
	const w = rect.width * scale;
	const h = rect.height * scale;
	// DOM 側の --BGgrad と同じ配色の 45° 縞を canvas 側でも再現する
	const stripes = patternVars.map((n) => cssVar(n));
	const sw = Math.max(2, 32 * scale);
	const diag = Math.hypot(w, h);
	ctx.save();
	ctx.translate(w / 2, h / 2);
	ctx.rotate(-Math.PI / 4);
	for (let y = -diag / 2, i = 0; y < diag / 2; y += sw, i++) {
		ctx.fillStyle = stripes[i % stripes.length]!;
		ctx.fillRect(-diag / 2, y, diag, sw + 1);
	}
	ctx.restore();
	group.querySelectorAll<HTMLElement>(".item").forEach((item) => {// 実 DOM の位置・ボーダー色をそのまま写す
		const r = item.getBoundingClientRect();
		const x = (r.left - rect.left) * scale;
		const y = (r.top - rect.top) * scale;
		const iw = r.width * scale;
		const ih = r.height * scale;
		const img = item.querySelector("img");
		if (img && img.naturalWidth > 0) {
			drawCover(ctx, img, x, y, iw, ih);
		}
		const cs = getComputedStyle(item);
		const bw = parseFloat(cs.borderTopWidth) * scale;
		if (bw > 0) {
			ctx.strokeStyle = cs.borderTopColor;
			ctx.lineWidth = bw;
			ctx.strokeRect(x + bw / 2, y + bw / 2, iw - bw, ih - bw);
		}
	});
}

/**
 * 描画前に画像を準備する。画面外の遅延読み込み画像は即時取得へ切り替え、
 * 取得が長引いても描画を止めない（decode が永久に pending でも打ち切る）。
 * 後から読み込まれた画像は onLate で再描画を促す。listener は cleanup で解除する。
 */
export function primeImages(
	imgs: HTMLImageElement[],
	onLate: () => void,
): { ready: Promise<void>; cleanup: () => void } {
	const cleanups: Array<() => void> = [];
	const ready = Promise.all(
		imgs.map((im) => {
			if (im.complete && im.naturalWidth > 0) return undefined;
			if (im.loading === "lazy") im.loading = "eager";// 遅延読み込みを解除して取得を促す
			const onLoad = () => onLate();
			im.addEventListener("load", onLoad, { once: true });
			cleanups.push(() => im.removeEventListener("load", onLoad));
			return new Promise<void>((res) => {
				let done = false;
				const finish = () => {
					if (!done) {
						done = true;
						res();
					}
				};
				im.decode().then(finish, finish);
				setTimeout(finish, 600);// 取得が長引いても描画をブロックしない
			});
		}),
	).then(() => undefined);
	return { ready, cleanup: () => cleanups.forEach((c) => c()) };
}

/** scene を毎回描き直す source プロバイダ（従来のバックドロップ実装用） */
export function createSceneProvider(
	patternVars: readonly string[],
): SourceProvider {
	return (group, scale) => {
		const rect = group.getBoundingClientRect();
		const off = document.createElement("canvas");
		off.width = Math.max(1, Math.round(rect.width * scale));
		off.height = Math.max(1, Math.round(rect.height * scale));
		const ctx = off.getContext("2d");
		if (!ctx) return null;
		drawScene(ctx, group, off.width / rect.width, patternVars);
		return off;
	};
}
