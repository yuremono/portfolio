/**
 * DOM 取り込み方式の source プロバイダ。
 * 指定要素の「実際のレンダリング結果」を html-to-image でビットマップ化してキャッシュし、
 * レンダラーへは縮尺付きの複製を渡す。取り込みが重い処理なので DOM 変化時のみ再取得する。
 * html-to-image は SVG foreignObject 経由でブラウザ自身に描かせるため、対象要素そのものを撮れば
 * 背景グラデーション（縞）・画像・角丸・corner-shape・グラデボーダーまで丸ごとエフェクト対象になる。
 * 使用側: CanvasFx/CanvasFx.tsx（レンダラーは ../backdrop/backdropFxRenderers）
 */
import { toCanvas } from "html-to-image";
import type { SourceProvider } from "../backdrop/backdropFxScene";

export interface CaptureController {
	/** 未キャッシュの対象だけ html-to-image で取り込む（重い処理はここに集約） */
	prime: (targets: HTMLElement[]) => Promise<void>;
	/** キャッシュ済みビットマップを縮尺付きの新規 canvas へ複製して返す */
	provider: SourceProvider;
	/** DOM 変化・リサイズ時にキャッシュを破棄する */
	invalidate: () => void;
	/** 直近 prime の取り込み総ミリ秒（計測用） */
	lastCaptureMs: number;
}

/** DOM 取り込みとキャッシュを管理するコントローラを作る */
export function createCaptureController(): CaptureController {
	const cache = new Map<HTMLElement, HTMLCanvasElement>();
	const ctl: CaptureController = {
		lastCaptureMs: 0,
		invalidate() {
			cache.clear();
		},
		async prime(targets) {
			const t0 = performance.now();
			await Promise.all(
				targets.map(async (el) => {
					if (cache.has(el)) return;
					// 対象要素そのものをブラウザにネイティブ描画させるので背景の縞まで含まれる
					const shot = await toCanvas(el, {
						pixelRatio: 1,// scene 方式と揃え、Retina での過大サイズ化も防ぐ
						skipFonts: true,// 対象にテキストは無い。外部フォントCSSの読込は不要で CORS エラーも避ける
						// 対象が絶対配置(top/left/transform)だと html-to-image が位置オフセットも複製へ写して中身がずれる。取り込みでは無効化する
						style: {
							position: "static",
							top: "auto",
							left: "auto",
							right: "auto",
							bottom: "auto",
							margin: "0",
							transform: "none",
						},
						filter: (node) =>
							!(
								node instanceof HTMLCanvasElement &&
								node.dataset.fx !== undefined
							),
					});
					cache.set(el, shot);
				}),
			);
			ctl.lastCaptureMs = performance.now() - t0;
		},
		provider(group, scale) {
			const cached = cache.get(group);
			if (!cached) return null;
			const off = document.createElement("canvas");
			off.width = Math.max(1, Math.round(cached.width * scale));
			off.height = Math.max(1, Math.round(cached.height * scale));
			const ctx = off.getContext("2d");
			if (!ctx) return null;
			ctx.imageSmoothingEnabled = scale < 1;// 縮小取得時のみ平滑化
			ctx.drawImage(cached, 0, 0, off.width, off.height);
			return off;
		},
	};
	return ctl;
}
