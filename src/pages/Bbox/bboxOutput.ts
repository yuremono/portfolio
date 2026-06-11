/** グループ・親子矩形を JSON / Markdown テキストに整形（丸めは HTML 版と同じ）。Markdown は全グループを1表にまとめ親子行＋区切り行。 */

import type { AnnotatorGroup, OutputFormat } from "./bboxTypes";

/** 「123px / 12.5%」形式の軸ごとの書き出し文字列。 */
export interface StageDims {
	x: string;
	y: string;
	w: string;
	h: string;
}

/**
 * ステージ座標を「選択コンテナ幅」基準の px と % に換算する。
 * canvas の論理幅 sw と出力基準 containerW を `sx = containerW / sw` で結ぶ（HTML 版と同じ）。
 */
export function toOutputFromStageRect(
	rx: number,
	ry: number,
	rw: number,
	rh: number,
	sw: number,
	containerW: number,
): StageDims {
	if (!sw || !containerW) {
		return {
			x: "0px / 0%",
			y: "0px / 0%",
			w: "0px / 0%",
			h: "0px / 0%",
		};
	}
	const sx = containerW / sw;
	const fmt = (v: number) => {
		const pxPart = Math.round(v * sx);
		const pctNum = ((v * sx) / containerW) * 100;
		return `${pxPart}px / ${pctNum.toFixed(1)}%`;
	};
	return {
		x: fmt(rx),
		y: fmt(ry),
		w: fmt(rw),
		h: fmt(rh),
	};
}

/** JSON または Markdown でグループ・親子矩形を書き出す。 */
export function formatOutputText(
	outputFormat: OutputFormat,
	groups: AnnotatorGroup[],
	containerW: number,
	canvasW: number,
	canvasH: number,
): string {
	if (!groups.length) {
		return "";
	}

	if (outputFormat === "json") {
		const obj = {
			container: { width: containerW, unit: "px" },
			groups: groups.map((g) => {
				const po = toOutputFromStageRect(
					g.px,
					g.py,
					g.pw,
					g.ph,
					canvasW,
					containerW,
				);
				const groupObj: Record<string, unknown> = {
					label: g.label,
					parent: { x: po.x, y: po.y, w: po.w, h: po.h },
					boxes: g.boxes.map((b) => {
						const o = toOutputFromStageRect(
							b.x,
							b.y,
							b.w,
							b.h,
							canvasW,
							containerW,
						);
						const boxObj: Record<string, unknown> = {
							label: b.label,
							x: o.x,
							y: o.y,
							w: o.w,
							h: o.h,
						};
						const bc = b.comment?.trim();
						if (bc) boxObj.comment = bc;
						return boxObj;
					}),
				};
				const gc = g.comment?.trim();
				if (gc) groupObj.comment = gc;
				return groupObj;
			}),
		};
		return JSON.stringify(obj, null, 2);
	}

	/** Markdown テーブルセル内の `\|` と改行をエスケープ・潰す。 */
	const mdCell = (raw: string) =>
		raw.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

	const sepRow =
		"| ― | ― | ― | ― | ― | ― | ― | ― |";

	const parts: string[] = [];
	parts.push("全グループ（親→子）。子の座標は親左上からの相対・コンテナ幅基準換算。");
	parts.push("");
	parts.push(
		"| 種別 | グループ | label | x | y | w | h | コメント |",
	);
	parts.push(
		"|------|----------|-------|---|----|----|----|----------|",
	);

	groups.forEach((g, gi) => {
		if (gi > 0) {
			parts.push(sepRow);
		}
		const grpLabel = mdCell(g.label || "(無名)");
		const po = toOutputFromStageRect(
			g.px,
			g.py,
			g.pw,
			g.ph,
			canvasW,
			containerW,
		);
		const pn = g.comment?.trim()
			? mdCell(g.comment.trim())
			: "";
		parts.push(
			`| 親 | ${grpLabel} | — | ${po.x} | ${po.y} | ${po.w} | ${po.h} | ${pn} |`,
		);
		g.boxes.forEach((b) => {
			const o = toOutputFromStageRect(
				b.x,
				b.y,
				b.w,
				b.h,
				canvasW,
				containerW,
			);
			const bn = b.comment?.trim() ? mdCell(b.comment.trim()) : "";
			const bl = mdCell(String(b.label || b.id));
			parts.push(
				`| 子 | ${grpLabel} | ${bl} | ${o.x} | ${o.y} | ${o.w} | ${o.h} | ${bn} |`,
			);
		});
	});

	parts.push("");
	parts.push(
		`> container: ${containerW}px 基準 / 表示キャンバス: ${canvasW} × ${canvasH} px`,
	);
	return parts.join("\n");
}
