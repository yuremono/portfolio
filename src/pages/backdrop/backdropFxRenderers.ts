/**
 * バックドロップ用キャンバスFXのレンダラー群。
 * 各レンダラーは (グループ要素, 出力 canvas, 強度 t=0〜1, source プロバイダ) を受け取り 1 回描画する。
 * ピクセルの出所（scene 手描き / DOM 取り込み）は source が吸収するため、
 * ここでは加工アルゴリズムだけに集中する。静的コンテンツ前提（フレーム毎の処理は行わない）。
 */
import {
	colorToRgb,
	cssVar,
	lumOf,
	type SourceProvider,
} from "./backdropFxScene";

/** エフェクト種別（「未適用」は呼び出し側で扱う） */
export type BackdropFxMode =
	| "halftone"
	| "dither"
	| "glitch"
	| "posterize"
	| "pixelate"
	| "particle";

/** UI に並べる順 */
export const BACKDROP_FX_MODES: readonly BackdropFxMode[] = [
	"halftone",
	"dither",
	"glitch",
	"posterize",
	"pixelate",
	"particle",
];

export type BackdropFxRenderer = (
	group: HTMLElement,
	canvas: HTMLCanvasElement,
	t: number,
	source: SourceProvider,
) => void;

/** ハーフトーン＋デュオトーン: 紙=WH、シャドウ=MC・中間調=wine の 2 色刷り網点 */
const renderHalftone: BackdropFxRenderer = (group, canvas, t, source) => {
	const cell = Math.round(4 + t * 8);
	const off = source(group, 1 / cell);
	const offCtx = off?.getContext("2d");
	if (!off || !offCtx) return;
	const gw = off.width;
	const gh = off.height;
	const data = offCtx.getImageData(0, 0, gw, gh).data;
	canvas.width = gw * cell;
	canvas.height = gh * cell;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.fillStyle = cssVar("--WH");
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const shadowInk = cssVar("--MC");
	const midInk = cssVar("--wine");
	const gain = 0.5 + t * 0.4;
	for (let y = 0; y < gh; y++) {
		for (let x = 0; x < gw; x++) {
			const i = (y * gw + x) * 4;
			const lum =
				(0.2126 * data[i]! +
					0.7152 * data[i + 1]! +
					0.0722 * data[i + 2]!) /
				255;
			const r = (1 - lum) * cell * gain;
			if (r < 0.5) continue;
			ctx.fillStyle = lum < 0.35 ? shadowInk : midInk;
			ctx.beginPath();
			ctx.arc((x + 0.5) * cell, (y + 0.5) * cell, r, 0, Math.PI * 2);
			ctx.fill();
		}
	}
};

/** Bayer 4x4 の閾値行列（0..15） */
const BAYER4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
] as const;

/** ディザ: テーマ色パレットへ減色し、チャンキーピクセルで出力 */
const renderDither: BackdropFxRenderer = (group, canvas, t, source) => {
	const px = Math.max(2, Math.round(2 + t * 6));
	const off = source(group, 1 / px);
	const offCtx = off?.getContext("2d");
	if (!off || !offCtx) return;
	const gw = off.width;
	const gh = off.height;
	const image = offCtx.getImageData(0, 0, gw, gh);
	const data = image.data;
	// 明度順に並べたテーマ色パレット（暗→明）
	const palette = [
		"--navy",
		"--wine",
		"--forest",
		"--brown",
		"--brownLT",
		"--WH",
	]
		.map((n) => colorToRgb(cssVar(n)))
		.sort((a, b) => lumOf(a) - lumOf(b));
	const levels = palette.length - 1;
	for (let y = 0; y < gh; y++) {
		for (let x = 0; x < gw; x++) {
			const i = (y * gw + x) * 4;
			const lum =
				(0.2126 * data[i]! +
					0.7152 * data[i + 1]! +
					0.0722 * data[i + 2]!) /
				255;
			const th = (BAYER4[y % 4]![x % 4]! + 0.5) / 16 - 0.5;
			const idx = Math.min(
				levels,
				Math.max(0, Math.round(lum * levels + th * 1.5)),
			);
			const c = palette[idx]!;
			data[i] = c[0];
			data[i + 1] = c[1];
			data[i + 2] = c[2];
			data[i + 3] = 255;
		}
	}
	offCtx.putImageData(image, 0, 0);
	canvas.width = gw * px;
	canvas.height = gh * px;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
};

/** 疑似乱数（シード固定で再描画しても同じ結果になる） */
const fract = (v: number): number => v - Math.floor(v);
const seeded = (i: number, salt: number): number =>
	fract(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453);

/** グリッチ: RGB チャンネルずらし＋スライスずれ＋走査線（ピクセル走査なし） */
const renderGlitch: BackdropFxRenderer = (group, canvas, t, source) => {
	const base = source(group, 1);
	const bctx = base?.getContext("2d");
	if (!base || !bctx) return;
	const w = base.width;
	const h = base.height;
	// 横スライスを左右へずらす
	const slices = Math.round(t * 10);
	for (let i = 0; i < slices; i++) {
		const sy = Math.floor(seeded(i, 1) * h);
		const sh = Math.max(4, Math.floor(seeded(i, 2) * h * 0.05));
		const dx = Math.round((seeded(i, 3) - 0.5) * 2 * t * 48);
		bctx.drawImage(base, 0, sy, w, sh, dx, sy, w, sh);
	}
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	// RGB 分版（原色はチャンネル分解用でデザイン色ではない）
	const shift = Math.round(2 + t * 14);
	const channel = (color: string, dx: number) => {
		const c = document.createElement("canvas");
		c.width = w;
		c.height = h;
		const cc = c.getContext("2d")!;
		cc.drawImage(base, 0, 0);
		cc.globalCompositeOperation = "multiply";
		cc.fillStyle = color;
		cc.fillRect(0, 0, w, h);
		ctx.drawImage(c, dx, 0);
	};
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, w, h);
	ctx.globalCompositeOperation = "lighter";
	channel("#f00", -shift);
	channel("#0f0", 0);
	channel("#00f", shift);
	ctx.globalCompositeOperation = "source-over";
	// 走査線
	ctx.globalAlpha = 0.1 + t * 0.2;
	ctx.fillStyle = "#000";
	for (let y = 0; y < h; y += 3) {
		ctx.fillRect(0, y, w, 1);
	}
	ctx.globalAlpha = 1;
};

/** ポスタリゼーション＋グレイン: 階調を落として粒子ノイズを加えるヴィンテージ印刷風 */
const renderPosterize: BackdropFxRenderer = (group, canvas, t, source) => {
	const off = source(group, 1);
	const offCtx = off?.getContext("2d");
	if (!off || !offCtx) return;
	const w = off.width;
	const h = off.height;
	const image = offCtx.getImageData(0, 0, w, h);
	const data = image.data;
	const levels = Math.max(2, 7 - Math.round(t * 4));
	const step = 255 / (levels - 1);
	const amp = t * 36;
	for (let i = 0; i < data.length; i += 4) {
		const grain = (Math.random() - 0.5) * amp;
		for (let ch = 0; ch < 3; ch++) {
			const q = Math.round(data[i + ch]! / step) * step + grain;
			data[i + ch] = Math.min(255, Math.max(0, q));
		}
	}
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.putImageData(image, 0, 0);
};

/** ピクセレート: 縮小→拡大のみのモザイク（最軽量。トランジション向き） */
const renderPixelate: BackdropFxRenderer = (group, canvas, t, source) => {
	const block = Math.max(2, Math.round(2 + t * 30));
	const off = source(group, 1 / block);
	if (!off) return;
	const rect = group.getBoundingClientRect();
	canvas.width = Math.round(rect.width);
	canvas.height = Math.round(rect.height);
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
};

/** パーティクル: source をブロック格子へ分解し、各粒子を強度 t に比例してランダム方向へ拡散させる（t=0 で定位置に集合＝元画像のモザイク） */
const renderParticle: BackdropFxRenderer = (group, canvas, t, source) => {
	const rect = group.getBoundingClientRect();
	const w = Math.round(rect.width);
	const h = Math.round(rect.height);
	if (w === 0 || h === 0) return;
	// 画面全体でも粒子数が破綻しないよう、上限からブロックサイズを決める（最小 8px）
	const MAX_PARTICLES = 24000;
	let block = 4;
	if ((w / block) * (h / block) > MAX_PARTICLES) {
		block = Math.ceil(Math.sqrt((w * h) / MAX_PARTICLES));
	}
	const off = source(group, 1 / block);
	const offCtx = off?.getContext("2d");
	if (!off || !offCtx) return;
	const gw = off.width;
	const gh = off.height;
	if (gw === 0 || gh === 0) return;
	const data = offCtx.getImageData(0, 0, gw, gh).data;
	// grid をソースの実サイズに依存させず要素サイズへ比例マップ（取り込みが多少ずれても全面を覆う）
	const cellW = w / gw;
	const cellH = h / gh;
	const size = Math.ceil(Math.max(cellW, cellH));// t=0 で隙間なく敷き詰まるよう1粒子=1セル
	// t に比例した最大拡散量（対角の一定割合）。方向・距離は粒子ごとにシード固定で再描画しても暴れない
	const maxSpread = Math.hypot(w, h) * 0.2 * t;
	// 拡散ぶん canvas を外側へせり出させる（ラッパー枠外にも粒子が出せる。t=0 なら pad=0 で従来どおり）
	const pad = Math.ceil(maxSpread + size);
	canvas.width = w + pad * 2;
	canvas.height = h + pad * 2;
	// 描画バッファを広げたぶん、表示も負のオフセットで枠外へ広げる（他モードは CanvasFx 側で毎回リセット）
	canvas.style.left = `${-pad}px`;
	canvas.style.top = `${-pad}px`;
	canvas.style.width = `${canvas.width}px`;
	canvas.style.height = `${canvas.height}px`;
	// 既定の max-width:100% で幅が親幅に頭打ちになるのを解除（縦も保険で解除）
	canvas.style.maxWidth = "none";
	canvas.style.maxHeight = "none";
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	for (let gy = 0; gy < gh; gy++) {
		for (let gx = 0; gx < gw; gx++) {
			const idx = gy * gw + gx;
			const i = idx * 4;
			const a = data[i + 3]!;
			if (a === 0) continue;
			const angle = seeded(idx, 1) * Math.PI * 2;
			const dist = seeded(idx, 2) * maxSpread;
			const cx = pad + (gx + 0.5) * cellW + Math.cos(angle) * dist;
			const cy = pad + (gy + 0.5) * cellH + Math.sin(angle) * dist;
			ctx.fillStyle = `rgba(${data[i]},${data[i + 1]},${data[i + 2]},${a / 255})`;
			ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
		}
	}
};

export const BACKDROP_FX_RENDERERS: Record<BackdropFxMode, BackdropFxRenderer> =
	{
		halftone: renderHalftone,
		dither: renderDither,
		glitch: renderGlitch,
		posterize: renderPosterize,
		pixelate: renderPixelate,
		particle: renderParticle,
	};
