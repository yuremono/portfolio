/** PageRoot で使うクラス連結。** TWonly で `--ann*` とダークツール UI 用トークンを上書きする。
 * （注釈キャンバスの色は getComputedStyle で参照、JS に色文字列は置かない。）
 */
/** className は空白区切り。文字列結合時に `]…[` がくっつくと JIT が別クラスにできないので注意 */
export const annotatorCanvasRootVars =
	"[--annP0:oklch(0.93_0.16_115)] [--annP1:oklch(0.80_0.12_215)] [--annP2:oklch(0.72_0.18_15)] [--annP3:oklch(0.88_0.14_135)] [--annP4:oklch(0.82_0.15_55)] [--annP5:oklch(0.72_0.20_305)] [--annG:oklch(0.75_0.12_230_/_0.2)] [--annDS:oklch(0.93_0.18_115_/_0.8)] [--annDF:oklch(0.93_0.18_115_/_0.06)] [--annHF:oklch(100%_0_0)]";

/** 縦スクロール: ガター 8px、トラック透明（WebKit と Firefox での見た目） */
export const bboxScrollOverflowThumbClass =
	"[scrollbar-width:thin] [scrollbar-color:oklch(0.65_0_0_/_0.45)_transparent] " +
	"[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-GR/45";

export const rootClasses =
	"BBox flex min-h-0 h-[100dvh] flex-col overflow-hidden [--head:3rem] md:[--head:4em] [--FF:ui-monospace] [--bdc:--WH] [--line:1px_solid_var(--GR)] bg-BC text-TC " +
	"[--TC:oklch(0.88_0_0)] [--BC:oklch(0.14_0_0)] [--GR:oklch(0.65_0_0)] [--AC:oklch(0.93_0.16_115)] [--background:oklch(0.22_0_0)] " +
	"[--third:oklch(0.72_0.06_145)] [--fourth:oklch(0.63_0.22_25)] [--stage:oklch(0.08_0_0)] [--rail:oklch(0.12_0_0)] " +
	`${annotatorCanvasRootVars} `;
