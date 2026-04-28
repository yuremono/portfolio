/** 初回表示用: デモ画像＋親1（全面）・子3（設計座標から実寸へスケール）。 */

import { getAssetPath } from "../../lib/assetPath";
import { clampChildTranslateInParent } from "../../lib/annotatorGeometry";
import type { AnnotatorGroup } from "../../lib/annotatorTypes";
import { initialParentHeightPx, type MutableState } from "./bboxPageModel";

/** `public/images/bbox_demo.jpg`（実寸がステージ論理ピクセル。設計基準は下定数）。 */
export const BBOX_DEMO_IMAGE_SRC = getAssetPath("/images/bbox_demo.jpg");

/** JSON 出力の px 基準と一致させる設計キャンバス（親全面・子座標はこの空間で定義）。 */
export const BBOX_DEMO_DESIGN_W = 1920;
export const BBOX_DEMO_DESIGN_H = 1081;

/** 設計座標（親左上相対）で定義した 3 子。 */
const BBOX_DEMO_BOXES_DESIGN: readonly {
	readonly id: string;
	readonly label: string;
	readonly x: number;
	readonly y: number;
	readonly w: number;
	readonly h: number;
}[] = [
	{ id: "b1", label: "Child A", x: 266, y: 304, w: 504, h: 561 },
	{ id: "b2", label: "Child B", x: 1768, y: 0, w: 152, h: 190 },
	{ id: "b3", label: "Child C", x: 1654, y: 846, w: 266, h: 235 },
];

function scaleDesignRectToParent(
	parentW: number,
	parentH: number,
	d: { x: number; y: number; w: number; h: number },
): { x: number; y: number; w: number; h: number } {
	return {
		x: Math.round((d.x * parentW) / BBOX_DEMO_DESIGN_W),
		y: Math.round((d.y * parentH) / BBOX_DEMO_DESIGN_H),
		w: Math.round((d.w * parentW) / BBOX_DEMO_DESIGN_W),
		h: Math.round((d.h * parentH) / BBOX_DEMO_DESIGN_H),
	};
}

/**
 * `naturalW` / `naturalH` がセット済みであること（画像の実寸＝ステージ論理サイズ）。
 * 親は上端に置き、初期高さは `initialParentHeightPx(W,H)`（幅基準の 16:9）。子は 1920×1081 設計座標から親領域へ線形スケール。
 */
export function seedBboxDemoLayout(s: MutableState): void {
	const W = s.naturalW;
	const H = s.naturalH;
	if (!W || !H) return;
	const parentH = initialParentHeightPx(W, H);

	const g: AnnotatorGroup = {
		id: "g1",
		label: "Demo parent",
		collapsed: false,
		px: 0,
		py: 0,
		pw: W,
		ph: parentH,
		childSeq: 4,
		boxes: [],
	};

	for (const d of BBOX_DEMO_BOXES_DESIGN) {
		const r = scaleDesignRectToParent(W, parentH, d);
		const box = { id: d.id, label: d.label, ...r };
		g.boxes.push(box);
		clampChildTranslateInParent(g, box);
	}

	s.groups = [g];
	s.activeGroupId = g.id;
	s.nextGroupId = 2;
	s.nextBoxId = 4;
	s.interactionMode = "parent";
	s.selectedBoxIds = [];
}
