/**
 * クライアント側の DOM 初期化を一括実行（フレームワーク非依存）
 */

import { initBorderDraw } from "./effects/initBorderDraw";
import { initBudoux } from "./budoux";
import { initBudouxScroll } from "./budouxScroll";
import { initBudouxShow } from "./budouxShow";
import { initHeader } from "./header";
import { initHeaderTrans } from "./headerTrans";
import { initIntersectionShow } from "./effects/intersectionShow";
import { initScrollX } from "./scrollX";
import { initSpanWrap } from "./spanWrap";
import { initVideo } from "./video";
import { setupRgbShift } from "./effects/rgbShift";
import { initMaskMosaique } from "./effects/maskMosaique";

export type RuntimeDisconnect = { disconnect: () => void };

/**
 * @param root 走査ルート。省略時は document（従来の全体初期化に近い）
 */
export function initClientRuntime(
	root: Document | Element = document,
): RuntimeDisconnect {
	const intersectionShow = initIntersectionShow(root);
	const spanWrap = initSpanWrap(root);
	const budoux = initBudoux(root);
	const budouxScroll = initBudouxScroll(root);
	const budouxShow = initBudouxShow(root);
	const headerTrans = initHeaderTrans(root);
	const video = initVideo(root);
	const scrollX = initScrollX(root);
	const header = initHeader(root);
	const borderDraw = initBorderDraw(root, { frameStride: 1 });
	const maskMosaique = initMaskMosaique(root);
	setupRgbShift();

	return {
		disconnect: () => {
			intersectionShow.disconnect();
			spanWrap.disconnect();
			budoux.disconnect();
			budouxScroll.disconnect();
			budouxShow.disconnect();
			headerTrans.disconnect();
			video.disconnect();
			scrollX.disconnect();
			header.disconnect();
			borderDraw.disconnect();
			maskMosaique.disconnect();
		},
	};
}
