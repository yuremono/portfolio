import { describe, expect, it } from "vitest"
import { initSpanWrap } from "./spanWrap"

describe("initSpanWrap", () => {
	it("テキストノード内の < をエスケープし、新たな要素として解釈されない", () => {
		document.body.innerHTML = ""
		const wrap = document.createElement("div")
		wrap.className = "p-split"
		const p = document.createElement("p")
		p.appendChild(document.createTextNode('<img src=x onerror=alert(1)>'))
		wrap.appendChild(p)
		document.body.appendChild(wrap)

		initSpanWrap(document.body)
		const el = document.querySelector(".p-split p")!
		expect(el.querySelector("img")).toBeNull()
		expect(el.innerHTML).toContain("&lt;")
		expect(el.innerHTML).not.toMatch(/<img[^>]*onerror/i)
	})

	it("通常の文字は p 直下の span に分割される", () => {
		document.body.innerHTML = '<div class="p-split"><p>ab</p></div>'
		initSpanWrap(document.body)
		const spans = document.querySelectorAll(".p-split p > span")
		expect(spans).toHaveLength(2)
		expect(spans[0]?.textContent).toBe("a")
		expect(spans[0]?.getAttribute("style")).toBe(
			"transition-delay:calc(var(--bgTR) + 0s)",
		)
		expect(spans[1]?.textContent).toBe("b")
		expect(spans[1]?.getAttribute("style")).toBe(
			"transition-delay:calc(var(--bgTR) + 0.05s)",
		)
	})

	it("ディレイカウンタは段落ごとに0から始まる", () => {
		document.body.innerHTML =
			'<div class="p-split"><p>ab</p><p>cd</p></div>'
		initSpanWrap(document.body)
		const paragraphs = document.querySelectorAll(".p-split p")
		expect(paragraphs[0]?.querySelector("span")?.getAttribute("style")).toBe(
			"transition-delay:calc(var(--bgTR) + 0s)",
		)
		expect(paragraphs[1]?.querySelector("span")?.getAttribute("style")).toBe(
			"transition-delay:calc(var(--bgTR) + 0s)",
		)
	})

	it("brはspan化せずそのまま残す", () => {
		document.body.innerHTML = '<div class="p-split"><p>a<br>b</p></div>'
		initSpanWrap(document.body)
		const inner = document.querySelector(".p-split p")!.innerHTML
		expect(inner).toContain("<br>")
		expect(document.querySelectorAll(".p-split p > span")).toHaveLength(2)
	})
})
