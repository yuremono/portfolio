/** 親BBox矩形で画像と注釈キャンバスを合成した PNG Blob（スクショボタン・ローカル一括生成）。 */

import type { AnnotatorGroup } from "./bboxTypes";

/**
 * `imgEl` と `canvasEl` は画像・キャンバス論理座標が一致している前提。
 * `g` の親矩形が画像の外側に出ないよう既存スクショ処理と同一にクランプ。
 */
export function captureParentRegionToPngBlob(
	imgEl: HTMLImageElement,
	canvasEl: HTMLCanvasElement,
	g: AnnotatorGroup,
): Promise<Blob | null> {
	const iw = imgEl.naturalWidth;
	const ih = imgEl.naturalHeight;
	if (!iw || !ih) return Promise.resolve(null);

	let sx = Math.round(g.px);
	let sy = Math.round(g.py);
	let sw = Math.max(1, Math.round(g.pw));
	let sh = Math.max(1, Math.round(g.ph));
	sx = Math.max(0, Math.min(sx, iw - 1));
	sy = Math.max(0, Math.min(sy, ih - 1));
	sw = Math.min(sw, iw - sx);
	sh = Math.min(sh, ih - sy);
	if (sw < 1 || sh < 1) return Promise.resolve(null);

	const out = document.createElement("canvas");
	out.width = sw;
	out.height = sh;
	const ctx = out.getContext("2d");
	if (!ctx) return Promise.resolve(null);
	try {
		ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, sw, sh);
		ctx.drawImage(canvasEl, sx, sy, sw, sh, 0, 0, sw, sh);
	} catch {
		return Promise.resolve(null);
	}
	return new Promise((resolve) => {
		out.toBlob((blob) => resolve(blob), "image/png");
	});
}
