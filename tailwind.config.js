/** @type {import('tailwindcss').Config} */
/**
 * Arbitrary クラス `[prop:value]` の value に空白を含めるときは `_` で書く（JIT がソースを単語分割するため）。
 * 生成 CSS では `_` が空白に戻る。OKLCH は `[--x:oklch(0.06_0_0)]` のように書けば問題なく出力される。
 */
import plugin from "tailwindcss/plugin";

/** Default Tailwind font sizes as plain strings: only font-size, no line-height on text-* utilities. */
const fontSizeWithoutLineHeight = {
	xs: "0.75rem",
	sm: "0.875rem",
	base: "1rem",
	lg: "1.125rem",
	xl: "1.25rem",
	"2xl": "1.5rem",
	"3xl": "1.875rem",
	"4xl": "2.25rem",
	"5xl": "3rem",
	"6xl": "3.75rem",
	"7xl": "4.5rem",
	"8xl": "6rem",
	"9xl": "8rem",
};

const cssVarColor = (name) =>
	`color-mix(in srgb, transparent, var(--${name}) calc(<alpha-value> * 100%))`;

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		// Replaces default fontSize (which pairs each size with line-height). Strings → font-size only.
                fontSize: fontSizeWithoutLineHeight,
                // 文字列のみにする（オブジェクト形式を混ぜると max-md / min-* が無効になる）
		extend: {
			screens: {
				xs: "479px",
                        },
                        colors: {
                                MC: cssVarColor("MC"),
                                SC: cssVarColor("SC"),
                                AC: cssVarColor("AC"),
                                BC: cssVarColor("BC"),
                                TC: cssVarColor("TC"),
                                WH: cssVarColor("WH"),
                                BK: cssVarColor("BK"),
                                GR: cssVarColor("GR"),
                                primary: cssVarColor("primary"),
                                secondary: cssVarColor("secondary"),
                                accent: cssVarColor("accent"),
                                foreground: cssVarColor("foreground"),
                                muted: cssVarColor("muted"),
                                background: cssVarColor("background"),
                                border: cssVarColor("border"),
                                third: cssVarColor("third"),
                                fourth: cssVarColor("fourth"),
                                stage: cssVarColor("stage"),
                                rail: cssVarColor("rail"),
                                navy: cssVarColor("navy"),
                                wine: cssVarColor("wine"),
                                brown: cssVarColor("brown"),
                                forest: cssVarColor("forest"),
                        },
		},
	},
	plugins: [
		plugin(function ({ matchUtilities }) {
			// text-shadow with arbitrary value (CSS variable)
			matchUtilities(
				{
					"text-shadow": (value) => ({
						"text-shadow": value,
					}),
				},
				{ type: ["any"] },
			);

			// drop-shadow with arbitrary value
			matchUtilities(
				{
					"drop-shadow": (value) => ({
						filter: `drop-shadow(${value})`,
					}),
				},
				{ type: ["any"] },
			);

			// box-shadow with arbitrary value
			matchUtilities(
				{
					"box-shadow": (value) => ({
						"box-shadow": value,
					}),
				},
				{ type: ["any"] },
			);

			// webkit-text-stroke with arbitrary value
			matchUtilities(
				{
					"text-stroke": (value) => ({
						"-webkit-text-stroke": value,
					}),
				},
				{ type: ["any"] },
			);
		}),
	],
};
