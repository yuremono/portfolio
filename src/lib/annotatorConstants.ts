/** 注釈ツール定数（元 HTML の論理値を維持。レイアウト用 AGENTS 数値ルールとは別概念）。 */

export const HISTORY_MAX = 50;

export const HANDLE = 5;

export const MIN_BOX = 4;

/** グループ別描画色の CSS 変数名（値はページの PageRoot で [--annP*] 等として定義）。 */
export const ANNOTATOR_PALETTE_VAR_NAMES = [
	"--annP0",
	"--annP1",
	"--annP2",
	"--annP3",
	"--annP4",
	"--annP5",
] as const;

export const VAR_ANN_GUIDE = "--annG";
export const VAR_ANN_DRAFT_STROKE = "--annDS";
export const VAR_ANN_DRAFT_FILL = "--annDF";
export const VAR_ANN_HANDLE_FILL = "--annHF";
