#!/usr/bin/env node
// ブラスコンパス形状の Lottie JSON を生成する。
// 参考画像: public/images/common/aozora/ChatGPT Image 2026年4月24日 19_52_31.webp
//   - 600x800 PNG。画面中央に真鍮色のドラフティングコンパス。
//   - 上部キャップ、ヒンジ、水平調整ネジ、2本脚、脚先ノブ、先端ピン。
// 出力先: public/lottie/brass-compass.json
// 書き出したあとに MCP (lottiefiles-creator) で読み込み直して磨き上げる想定。

import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FRAME_RATE = 30;
const TOTAL_FRAMES = 180; // 6 秒ループ
const WIDTH = 600;
const HEIGHT = 800;

const BRASS_LIGHT = [0.98, 0.85, 0.45, 1];
const BRASS_MID = [0.86, 0.65, 0.22, 1];
const BRASS_DEEP = [0.58, 0.40, 0.10, 1];
const BRASS_SHADOW = [0.32, 0.22, 0.06, 1];
const NIB = [0.22, 0.17, 0.09, 1];
const HIGHLIGHT = [1, 0.97, 0.85, 1];
const GROUND = [0.05, 0.05, 0.08, 1];

/** Lottie の "ty: gr" を作るユーティリティ。 */
function group(name, items, transform = identityTransform()) {
	return {
		ty: "gr",
		nm: name,
		np: items.length + 1,
		it: [...items, transform],
	};
}

function identityTransform(overrides = {}) {
	return {
		ty: "tr",
		nm: overrides.nm ?? "Transform",
		p: { a: 0, k: overrides.p ?? [0, 0] },
		a: { a: 0, k: overrides.a ?? [0, 0] },
		s: { a: 0, k: overrides.s ?? [100, 100] },
		r: overrides.r ?? { a: 0, k: 0 },
		o: { a: 0, k: overrides.o ?? 100 },
		sk: { a: 0, k: 0 },
		sa: { a: 0, k: 0 },
	};
}

function ellipse(name, cx, cy, w, h) {
	return {
		ty: "el",
		nm: name,
		d: 1,
		p: { a: 0, k: [cx, cy] },
		s: { a: 0, k: [w, h] },
	};
}

function rect(name, cx, cy, w, h, r = 0) {
	return {
		ty: "rc",
		nm: name,
		d: 1,
		p: { a: 0, k: [cx, cy] },
		s: { a: 0, k: [w, h] },
		r: { a: 0, k: r },
	};
}

function fill(color, opacity = 100) {
	return {
		ty: "fl",
		nm: "Fill",
		c: { a: 0, k: color },
		o: { a: 0, k: opacity },
		r: 1,
		bm: 0,
	};
}

function stroke(color, width = 2, opacity = 100) {
	return {
		ty: "st",
		nm: "Stroke",
		c: { a: 0, k: color },
		o: { a: 0, k: opacity },
		w: { a: 0, k: width },
		lc: 2,
		lj: 2,
		ml: 4,
		bm: 0,
	};
}

function path(name, vertices, closed = true) {
	// bezier 制御点は直線用に 0 ベクトルで固定。
	const zeros = vertices.map(() => [0, 0]);
	return {
		ty: "sh",
		nm: name,
		d: 1,
		ks: {
			a: 0,
			k: {
				c: closed,
				v: vertices,
				i: zeros,
				o: zeros,
			},
		},
	};
}

/** ±度数でゆっくり揺れるキーフレーム。 */
function rockingRotation(amplitude, periodFrames) {
	const steps = 8;
	const keyframes = [];
	for (let i = 0; i <= steps; i += 1) {
		const t = i / steps;
		const frame = Math.round(t * periodFrames);
		const angle = Math.sin(t * Math.PI * 2) * amplitude;
		keyframes.push({
			t: frame,
			s: [angle],
			i: { x: [0.45], y: [1] },
			o: { x: [0.55], y: [0] },
		});
	}
	return { a: 1, k: keyframes };
}

function breathingOffsetY(amplitude, periodFrames) {
	const steps = 8;
	const keyframes = [];
	for (let i = 0; i <= steps; i += 1) {
		const t = i / steps;
		const frame = Math.round(t * periodFrames);
		const y = Math.sin(t * Math.PI * 2) * amplitude;
		keyframes.push({
			t: frame,
			s: [WIDTH / 2, HEIGHT / 2 + 20 + y],
			i: { x: [0.45, 0.45], y: [1, 1] },
			o: { x: [0.55, 0.55], y: [0, 0] },
		});
	}
	return { a: 1, k: keyframes };
}

function buildHeadAssembly() {
	// キャップ（頭頂）: 薄いシリンダーを楕円で表現
	const capTop = group("cap_top", [
		ellipse("cap_top_core", 300, 55, 58, 16),
		fill(BRASS_LIGHT),
	]);
	const capRim = group("cap_rim", [
		rect("cap_rim_core", 300, 70, 66, 16, 4),
		fill(BRASS_MID),
	]);
	const capHighlight = group("cap_highlight", [
		rect("cap_highlight_core", 288, 66, 20, 4, 2),
		fill(HIGHLIGHT, 90),
	]);
	const neckStem = group("neck", [
		rect("neck_core", 300, 115, 34, 70, 4),
		fill(BRASS_MID),
	]);
	const neckEdgeLight = group("neck_edge_light", [
		rect("neck_edge_core", 288, 115, 4, 64, 2),
		fill(HIGHLIGHT, 70),
	]);
	const neckEdgeShadow = group("neck_edge_shadow", [
		rect("neck_edge_shadow_core", 314, 115, 5, 64, 2),
		fill(BRASS_DEEP, 85),
	]);
	return group("head_assembly", [
		capHighlight,
		capTop,
		capRim,
		neckEdgeLight,
		neckEdgeShadow,
		neckStem,
	]);
}

function buildHinge() {
	const oval = group("hinge_oval", [
		ellipse("hinge_oval_core", 300, 175, 132, 160),
		fill(BRASS_MID),
	]);
	const ovalShadow = group("hinge_oval_shadow", [
		ellipse("hinge_oval_shadow_core", 316, 186, 118, 144),
		fill(BRASS_DEEP, 55),
	]);
	const ovalHighlight = group("hinge_oval_highlight", [
		ellipse("hinge_oval_highlight_core", 282, 160, 52, 90),
		fill(HIGHLIGHT, 60),
	]);
	const rivet = group("hinge_rivet", [
		ellipse("hinge_rivet_core", 300, 175, 18, 18),
		fill(BRASS_DEEP),
	]);
	const rivetGlint = group("hinge_rivet_glint", [
		ellipse("hinge_rivet_glint_core", 297, 172, 4, 4),
		fill(HIGHLIGHT, 90),
	]);
	return group("hinge", [
		rivetGlint,
		rivet,
		ovalHighlight,
		ovalShadow,
		oval,
	]);
}

function buildAdjustmentBar() {
	const bar = group("adjust_bar", [
		rect("adjust_bar_core", 300, 405, 220, 10, 4),
		fill(BRASS_MID),
	]);
	const barShadow = group("adjust_bar_shadow", [
		rect("adjust_bar_shadow_core", 300, 411, 220, 4, 2),
		fill(BRASS_DEEP, 80),
	]);
	const barHighlight = group("adjust_bar_highlight", [
		rect("adjust_bar_highlight_core", 300, 400, 200, 2, 1),
		fill(HIGHLIGHT, 75),
	]);

	// 調整ネジ中央のノッチ
	const centerScrew = group("adjust_center_screw", [
		ellipse("adjust_center_screw_core", 300, 405, 30, 30),
		fill(BRASS_LIGHT),
	]);
	const centerScrewRings = group("adjust_center_screw_rings", [
		ellipse("adjust_center_screw_rings_core", 300, 405, 26, 26),
		stroke(BRASS_DEEP, 1.5, 90),
	]);
	const centerScrewShadow = group("adjust_center_screw_shadow", [
		ellipse("adjust_center_screw_shadow_core", 300, 409, 24, 24),
		fill(BRASS_DEEP, 45),
	]);

	// 両端の knurled knob
	const leftKnob = group("adjust_knob_L", [
		ellipse("adjust_knob_L_core", 220, 405, 34, 28),
		fill(BRASS_LIGHT),
	]);
	const leftKnobShadow = group("adjust_knob_L_shadow", [
		ellipse("adjust_knob_L_shadow_core", 222, 411, 30, 20),
		fill(BRASS_DEEP, 55),
	]);
	const rightKnob = group("adjust_knob_R", [
		ellipse("adjust_knob_R_core", 380, 405, 34, 28),
		fill(BRASS_LIGHT),
	]);
	const rightKnobShadow = group("adjust_knob_R_shadow", [
		ellipse("adjust_knob_R_shadow_core", 382, 411, 30, 20),
		fill(BRASS_DEEP, 55),
	]);

	// knurling 風の縦線
	const leftKnurl = group(
		"adjust_knob_L_knurl",
		[
			rect("L_knurl_1", 212, 405, 1.6, 24, 0.8),
			rect("L_knurl_2", 217, 405, 1.6, 24, 0.8),
			rect("L_knurl_3", 222, 405, 1.6, 24, 0.8),
			rect("L_knurl_4", 227, 405, 1.6, 24, 0.8),
			fill(BRASS_DEEP, 60),
		],
	);
	const rightKnurl = group(
		"adjust_knob_R_knurl",
		[
			rect("R_knurl_1", 372, 405, 1.6, 24, 0.8),
			rect("R_knurl_2", 377, 405, 1.6, 24, 0.8),
			rect("R_knurl_3", 382, 405, 1.6, 24, 0.8),
			rect("R_knurl_4", 387, 405, 1.6, 24, 0.8),
			fill(BRASS_DEEP, 60),
		],
	);

	return group("adjustment_bar", [
		centerScrewRings,
		centerScrewShadow,
		centerScrew,
		leftKnurl,
		rightKnurl,
		leftKnobShadow,
		leftKnob,
		rightKnobShadow,
		rightKnob,
		barHighlight,
		barShadow,
		bar,
	]);
}

function buildLeg(side) {
	const sign = side === "L" ? -1 : 1;
	const hingeBottomX = 300;
	const hingeBottomY = 250;
	const tipX = 300 + sign * 115;
	const tipY = 690;
	const dx = tipX - hingeBottomX;
	const dy = tipY - hingeBottomY;
	const angleDeg = (Math.atan2(dx, dy) * 180) / Math.PI * -1;
	// 脚は縦長矩形を回転させて配置。
	const legLength = Math.hypot(dx, dy);
	const legWidth = 26;
	const leg = group(`${side}_leg_body`, [
		rect(`${side}_leg_core`, 0, legLength / 2, legWidth, legLength, 6),
		fill(BRASS_MID),
	]);
	const legHighlight = group(`${side}_leg_highlight`, [
		rect(`${side}_leg_highlight_core`, -6, legLength / 2, 4, legLength - 20, 2),
		fill(HIGHLIGHT, 55),
	]);
	const legShadow = group(`${side}_leg_shadow`, [
		rect(`${side}_leg_shadow_core`, 6, legLength / 2, 6, legLength - 20, 3),
		fill(BRASS_DEEP, 70),
	]);

	const tipKnob = group(`${side}_tip_knob`, [
		ellipse(`${side}_tip_knob_core`, 0, legLength - 10, 34, 22),
		fill(BRASS_LIGHT),
	]);
	const tipKnobShadow = group(`${side}_tip_knob_shadow`, [
		ellipse(`${side}_tip_knob_shadow_core`, 2, legLength - 6, 30, 16),
		fill(BRASS_DEEP, 55),
	]);
	const tipKnurl = group(`${side}_tip_knurl`, [
		rect(`${side}_knurl_1`, -8, legLength - 10, 1.4, 14, 0.8),
		rect(`${side}_knurl_2`, -3, legLength - 10, 1.4, 14, 0.8),
		rect(`${side}_knurl_3`, 3, legLength - 10, 1.4, 14, 0.8),
		rect(`${side}_knurl_4`, 8, legLength - 10, 1.4, 14, 0.8),
		fill(BRASS_DEEP, 65),
	]);

	// 先端の尖ったピン。
	const tipPoint = group(
		`${side}_tip_point`,
		[
			path(`${side}_tip_point_path`, [
				[-2.5, legLength + 4],
				[2.5, legLength + 4],
				[0, legLength + 32],
			]),
			fill(NIB),
		],
	);

	return group(
		`${side}_leg_assembly`,
		[
			tipPoint,
			tipKnurl,
			tipKnobShadow,
			tipKnob,
			legHighlight,
			legShadow,
			leg,
		],
		identityTransform({
			nm: `${side}_leg_transform`,
			p: [hingeBottomX, hingeBottomY],
			a: [0, 0],
			r: { a: 0, k: angleDeg },
		}),
	);
}

function buildGroundShadow() {
	return group("ground_shadow", [
		ellipse("ground_shadow_core", 300, 735, 260, 28),
		fill(GROUND, 18),
	]);
}

function buildCompassLayer() {
	const layerShapes = [
		// 前面 → 背面の順で並べる。
		buildAdjustmentBar(),
		buildHinge(),
		buildLeg("L"),
		buildLeg("R"),
		buildHeadAssembly(),
		buildGroundShadow(),
	];

	return {
		ddd: 0,
		ind: 1,
		ty: 4,
		nm: "brass_compass",
		sr: 1,
		ks: {
			o: { a: 0, k: 100 },
			r: rockingRotation(2.5, TOTAL_FRAMES),
			p: { a: 0, k: [WIDTH / 2, HEIGHT / 2 + 20, 0] },
			a: { a: 0, k: [WIDTH / 2, HEIGHT / 2 + 20, 0] },
			s: { a: 0, k: [100, 100, 100] },
		},
		ao: 0,
		shapes: layerShapes,
		ip: 0,
		op: TOTAL_FRAMES,
		st: 0,
		bm: 0,
	};
}

function buildFloatingShadowLayer() {
	// 接地影だけ微妙にスケールして揺らす。レイヤー全体を breathing で上下。
	return {
		ddd: 0,
		ind: 2,
		ty: 4,
		nm: "ground_ambient",
		sr: 1,
		ks: {
			o: { a: 0, k: 60 },
			r: { a: 0, k: 0 },
			p: { a: 0, k: [0, 0, 0] },
			a: { a: 0, k: [0, 0, 0] },
			s: { a: 0, k: [100, 100, 100] },
		},
		ao: 0,
		shapes: [
			group("ground_ambient_shape", [
				ellipse("ground_ambient_core", WIDTH / 2, HEIGHT - 90, 320, 34),
				fill(GROUND, 20),
			]),
		],
		ip: 0,
		op: TOTAL_FRAMES,
		st: 0,
		bm: 0,
	};
}

function buildComposition() {
	return {
		v: "5.7.14",
		meta: {
			g: "aozora-local",
			a: "0413portfolio",
			k: "brass,compass,socratic",
			d: "Brass drafting compass rocking in place — starting point for MCP refinement.",
			tc: "#0b0f1a",
		},
		fr: FRAME_RATE,
		ip: 0,
		op: TOTAL_FRAMES,
		w: WIDTH,
		h: HEIGHT,
		nm: "Aozora Brass Compass",
		ddd: 0,
		assets: [],
		layers: [buildCompassLayer(), buildFloatingShadowLayer()],
		markers: [],
	};
}

async function main() {
	const here = dirname(fileURLToPath(import.meta.url));
	const outPath = resolve(here, "../public/lottie/brass-compass.json");
	await mkdir(dirname(outPath), { recursive: true });
	const json = buildComposition();
	await writeFile(outPath, JSON.stringify(json, null, 2), "utf8");
	console.log(`Wrote Lottie: ${outPath}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
