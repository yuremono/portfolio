import { describe, expect, it } from "vitest"
import { initSpanWrap } from "./spanWrap"

describe("initSpanWrap", () => {
	it("テキストノード内の < をエスケープし、新たな要素として解釈されない", () => {
		document.body.innerHTML = ""
		const wrap = document.createElement("div");
		const p = document.createElement("p")
		p.className = "JsLetter";
		p.appendChild(document.createTextNode('<img src=x onerror=alert(1)>'))
		wrap.appendChild(p)
		document.body.appendChild(wrap)

		initSpanWrap(document.body)
		const el = document.querySelector(".JsLetter")!;
		expect(el.querySelector("img")).toBeNull()
		expect(el.innerHTML).toContain("&lt;")
		expect(el.innerHTML).not.toMatch(/<img[^>]*onerror/i)
	})

	it("通常の文字は JsLetter 直下の span に分割される", () => {
		document.body.innerHTML = '<div><p class="JsLetter">ab</p></div>';
		initSpanWrap(document.body);
		const spans = document.querySelectorAll(".JsLetter > span");
		expect(spans).toHaveLength(2);
		expect(spans[0]?.textContent).toBe("a");
		expect(spans[0]?.getAttribute("style")).toBe(
			"transition-delay:calc(var(--first-delay) + 0 * var(--letter-delay))",
		);
		expect(spans[1]?.textContent).toBe("b");
		expect(spans[1]?.getAttribute("style")).toBe(
			"transition-delay:calc(var(--first-delay) + 1 * var(--letter-delay))",
		);
	});

	it("許可したインラインタグ内の文字も分割し、直下の文字から連番を継続する", () => {
		document.body.innerHTML =
			'<div><p class="JsLetter">make<span>Web</span><strong>site</strong></p></div>';
		initSpanWrap(document.body);

		const letters = document.querySelectorAll(".JsLetter span[style]");
		expect(Array.from(letters, (letter) => letter.textContent).join("")).toBe(
			"makeWebsite",
		);
		expect(letters[4]?.textContent).toBe("W");
		expect(letters[4]?.getAttribute("style")).toBe(
			"transition-delay:calc(var(--first-delay) + 4 * var(--letter-delay))",
		);
		expect(letters[7]?.textContent).toBe("s");
		expect(letters[7]?.getAttribute("style")).toBe(
			"transition-delay:calc(var(--first-delay) + 7 * var(--letter-delay))",
		);
	});

	it("ディレイカウンタは段落ごとに0から始まる", () => {
		document.body.innerHTML =
			'<div><p class="JsLetter">ab</p><p class="JsLetter">cd</p></div>';
		initSpanWrap(document.body)
		const paragraphs = document.querySelectorAll(".JsLetter");
		expect(
			paragraphs[0]?.querySelector("span")?.getAttribute("style"),
		).toBe(
			"transition-delay:calc(var(--first-delay) + 0 * var(--letter-delay))",
		);
		expect(
			paragraphs[1]?.querySelector("span")?.getAttribute("style"),
		).toBe(
			"transition-delay:calc(var(--first-delay) + 0 * var(--letter-delay))",
		);
	})

	it("brはspan化せずそのまま残す", () => {
		document.body.innerHTML = '<div><p class="JsLetter">a<br>b</p></div>';
		initSpanWrap(document.body)
		const inner = document.querySelector(".JsLetter")!.innerHTML;
		expect(inner).toContain("<br>")
		expect(document.querySelectorAll(".JsLetter > span")).toHaveLength(2);
	})
})
