const EDITABLE_SELECTOR = ".editable, .header_logo, main h2, main h3, main code, .sections_title,.sections_desc, .adjective_item, .design_dl>*";
const varOverrides = new Map();// 編集された変数（書き出し時に:rootとしてCSSへ反映）
const OVERRIDE_MARK = "/* ==== edited variable overrides ==== */";// 保存済みCSSから旧追記を剥がすための目印
let dirHandle = null;// ソースに保存の書き込み先（セッション中は使い回す）

const README = `# Brand Guideline

- index.htmlをブラウザで開くと閲覧・編集できます（見出し・変数名・値・リストをクリックして直接編集。変数は即時反映）
- 「HTMLをコピー」「ZIPをダウンロード」による再書き出しは、file://で直接開くと動きません（fetch制限）。ローカルサーバーで開いてください
- 「ソースに保存」（index.html/style.cssの直接上書き）はChrome / Edge対応です（File System Access API）。Braveは brave://flags/#file-system-access-api を Enabled にして再起動すると使えます

\`\`\`
python3 -m http.server 5173
open http://localhost:5173/index.html
\`\`\`
`;

document.addEventListener("DOMContentLoaded", () => {// 初期化
	document.querySelectorAll(EDITABLE_SELECTOR).forEach((el) => {// 編集可能化（属性はJSで付与しソースHTMLは汚さない）
		el.setAttribute("contenteditable", "plaintext-only");
	});

	document.querySelectorAll(".variable_item").forEach(setupVarSync);// 変数の即時反映

	let addCounter = 0;// 追加された変数の連番（--new1, --new2...）
	document.querySelectorAll('[data-action="add-variable"]').forEach((btn) => {
		btn.addEventListener("click", () => {
			addCounter += 1;
			const kind = btn.dataset.kind;// "size" | "color"
			const name = `--new${addCounter}`;
			const value = kind === "color" ? "oklch(0.5 0.1 0)" : "1rem";
			const li = document.createElement("li");
			li.className = "variable_item";
			li.innerHTML = kind === "color"
				? `<div class="variable_label"><h3>新しい色</h3><code>${name}</code><code>${value}</code></div><div class="swatch is_color" style="background: var(${name})"></div>`
				: `<div class="variable_label"><h3>新しい余白</h3><code>${name}</code><code>${value}</code></div><div class="swatch is_size" style="width: var(${name})"></div>`;
			btn.closest(".variable_item").before(li);// is_addタイルは末尾に残す
			li.querySelectorAll("h3, code").forEach((el) => el.setAttribute("contenteditable", "plaintext-only"));
			document.documentElement.style.setProperty(name, value);
			varOverrides.set(name, value);
			setupVarSync(li);
		});
	});

	document.querySelectorAll('[data-action="add-section"]').forEach((btn) => {
		btn.addEventListener("click", () => {
			const li = document.createElement("li");
			li.className = "sections_item BorderXY";
			li.innerHTML = `<h3 class="sections_title">新しいセクション</h3><div class="sections_desc">Description</div>`;
			li.querySelectorAll("h3, div").forEach((el) => el.setAttribute("contenteditable", "plaintext-only"));
			btn.closest("li").before(li);
		});
	});

	document.querySelectorAll('[data-action="add-adjective"]').forEach((btn) => {
		btn.addEventListener("click", () => {
			const li = document.createElement("li");
			li.className = "adjective_item";
			li.textContent = "新しい形容詞";
			li.setAttribute("contenteditable", "plaintext-only");
			btn.closest("li").before(li);
		});
	});

	document.querySelectorAll('[data-action="add-design"]').forEach((btn) => {
		btn.addEventListener("click", () => {
			const dt = document.createElement("dt");
			dt.className = "design_dt";
			dt.textContent = "新しいルール";
			dt.setAttribute("contenteditable", "plaintext-only");
			const dd = document.createElement("dd");
			dd.className = "design_dd";
			dd.textContent = "説明";
			dd.setAttribute("contenteditable", "plaintext-only");
			btn.closest(".design_add").before(dt, dd);
		});
	});

	const manual = document.getElementById("manual");// マニュアルの開閉
	const manualBtn = document.querySelector('[data-action="toggle-manual"][aria-expanded]');
	const toggleManual = (force) => {
		const open = manual.classList.toggle("is_open", force);
		manualBtn.setAttribute("aria-expanded", String(open));
	};
	document.querySelectorAll('[data-action="toggle-manual"]').forEach((btn) => {
		btn.addEventListener("click", () => toggleManual());
	});
	manual.addEventListener("click", (e) => {// コンテナの外側（オーバーレイ）クリックで閉じる
		if (e.target === manual) toggleManual(false);
	});
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") toggleManual(false);
	});

	document.querySelector('[data-action="save-source"]').addEventListener("click", async (e) => {// File System Access APIでソースを直接上書き（Chrome/Edge）
		const btn = e.currentTarget;
		if (!window.showDirectoryPicker) {
			const isBrave = (await navigator.brave?.isBrave?.()) === true;// BraveはAPIを既定で無効化しているがflagsで有効化できる
			alert(isBrave
				? "BraveはFile System Access APIが既定で無効です。brave://flags/#file-system-access-api を Enabled にして再起動すると使えます"
				: "このブラウザは非対応です。Chrome / Edge で開いてください");
			return;
		}
		try {
			dirHandle ??= await window.showDirectoryPicker({ mode: "readwrite" });
			const html = buildSourceHtml();// 書き込み開始前に両方の内容を確定する
			const css = (await fetchBaseCss()) + overrideCss();
			await Promise.all([// 直列だと開発サーバーのライブリロードに2つ目の書き込みが割り込まれうるため並列
				writeTo(dirHandle, "style.css", css),
				writeTo(dirHandle, "index.html", html),
			]);
			flashLabel(btn, "保存しました");
		} catch (err) {
			if (err.name === "AbortError") return;// フォルダ選択キャンセル
			dirHandle = null;// 権限切れ等に備えて次回は選び直す
			alert(`保存に失敗しました: ${err.message}`);
		}
	});

	document.querySelector('[data-action="copy-html"]').addEventListener("click", async () => {// クリーン単一HTMLをコピー
		const html = await buildCleanHtml();
		await navigator.clipboard.writeText(html);
	});

	document.querySelector('[data-action="download-html"]').addEventListener("click", async () => {// 編集可能版一式をZIPでダウンロード
		const [css, js] = await Promise.all([
			fetchBaseCss(),
			fetch("./script.js", { cache: "no-store" }).then((res) => res.text()),
		]);
		const blob = buildZip([
			{ name: "brand-guideline/index.html", text: buildSourceHtml() },
			{ name: "brand-guideline/style.css", text: css + overrideCss() },
			{ name: "brand-guideline/script.js", text: js },
			{ name: "brand-guideline/README.md", text: README },
		]);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "brand-guideline.zip";
		a.click();
		URL.revokeObjectURL(url);
	});
});

function setupVarSync(item) {// 変数名・値のcodeを編集したら:rootへ即反映する
	const codes = item.querySelectorAll(".variable_label code");
	if (codes.length < 2) return;
	const [nameCode, valueCode] = codes;
	let prevName = nameCode.textContent.trim();

	const apply = () => {
		const name = nameCode.textContent.trim();
		const value = valueCode.textContent.trim();
		if (!name.startsWith("--")) return;
		if (name !== prevName) {// 変数名の変更：旧上書きを消し、swatchのvar()参照を付け替える
			document.documentElement.style.removeProperty(prevName);
			varOverrides.delete(prevName);
			item.querySelectorAll(".swatch[style]").forEach((swatch) => {
				swatch.setAttribute("style", swatch.getAttribute("style").replaceAll(`var(${prevName})`, `var(${name})`));
			});
			prevName = name;
		}
		document.documentElement.style.setProperty(name, value);
		varOverrides.set(name, value);
	};
	nameCode.addEventListener("input", apply);
	valueCode.addEventListener("input", apply);
}

function overrideCss() {// 編集された変数を:rootブロックに整形（無編集なら空文字）
	return varOverrides.size
		? `\n${OVERRIDE_MARK}\n:root {\n${[...varOverrides].map(([name, value]) => `\t${name}: ${value};`).join("\n")}\n}\n`
		: "";
}

async function fetchBaseCss() {// 「ソースに保存」で追記済みの上書きブロックを剥がし、二重追記を防ぐ
	const css = await fetch("./style.css", { cache: "no-store" }).then((res) => res.text());// 保存直後でも古いキャッシュを掴まない
	return css.split(OVERRIDE_MARK)[0];
}

async function writeTo(dir, name, text) {// File System Access APIでファイルを上書き
	const handle = await dir.getFileHandle(name, { create: true });
	const writable = await handle.createWritable();
	await writable.write(text);
	await writable.close();
}

function flashLabel(btn, text) {// ボタン末尾のテキストを一時的に差し替えて結果を知らせる
	const node = btn.lastChild;
	const original = node.textContent;
	node.textContent = ` ${text}`;
	setTimeout(() => { node.textContent = original; }, 2000);
}

async function buildCleanHtml() {// 閲覧用：CSSインライン・JSなしの単一HTML
	const css = await fetchBaseCss();
	const clone = document.body.cloneNode(true);
	clone.querySelectorAll("[data-export-exclude]").forEach((el) => el.remove());
	clone.querySelectorAll("[contenteditable]").forEach((el) => el.removeAttribute("contenteditable"));
	clone.querySelectorAll("script, style").forEach((el) => el.remove());// styleはブラウザ拡張の注入分（このページのソースは<style>を持たない）
	return `<!doctype html>\n<html lang="ja">\n<head>\n<meta charset="UTF-8">\n<style>\n${css}${overrideCss()}\n</style>\n</head>\n<body>\n${clone.innerHTML}\n</body>\n</html>\n`;
}

function buildSourceHtml() {// ZIP同梱用：編集後のDOMを、link/script参照を保ったまま書き出す
	const clone = document.documentElement.cloneNode(true);
	clone.removeAttribute("style");// 変数の上書きはstyle.css側へ追記するため
	clone.querySelectorAll("[contenteditable]").forEach((el) => el.removeAttribute("contenteditable"));
	clone.querySelectorAll("style").forEach((el) => el.remove());// ブラウザ拡張が注入した<style>を除去（このページのソースは<style>を持たない）
	clone.querySelector(".manual")?.classList.remove("is_open");// マニュアルは閉じた状態で書き出す
	clone.querySelector('[data-action="toggle-manual"][aria-expanded]')?.setAttribute("aria-expanded", "false");
	return `<!doctype html>\n${clone.outerHTML}\n`;
}

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		table[i] = c >>> 0;
	}
	return table;
})();

function crc32(bytes) {
	let c = 0xffffffff;
	for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

function buildZip(files) {// 無圧縮(stored)ZIPを自前生成。依存ライブラリを持ち込まないため
	const encoder = new TextEncoder();
	const now = new Date();
	const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
	const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
	const locals = [];
	const centrals = [];
	let offset = 0;

	for (const file of files) {
		const name = encoder.encode(file.name);
		const data = encoder.encode(file.text);
		const crc = crc32(data);

		const local = new DataView(new ArrayBuffer(30));// ローカルファイルヘッダ
		local.setUint32(0, 0x04034b50, true);
		local.setUint16(4, 20, true);
		local.setUint16(6, 0x0800, true);// UTF-8ファイル名フラグ
		local.setUint16(8, 0, true);// 無圧縮
		local.setUint16(10, dosTime, true);
		local.setUint16(12, dosDate, true);
		local.setUint32(14, crc, true);
		local.setUint32(18, data.length, true);
		local.setUint32(22, data.length, true);
		local.setUint16(26, name.length, true);
		local.setUint16(28, 0, true);
		locals.push(local.buffer, name, data);

		const central = new DataView(new ArrayBuffer(46));// セントラルディレクトリエントリ
		central.setUint32(0, 0x02014b50, true);
		central.setUint16(4, 20, true);
		central.setUint16(6, 20, true);
		central.setUint16(8, 0x0800, true);
		central.setUint16(10, 0, true);
		central.setUint16(12, dosTime, true);
		central.setUint16(14, dosDate, true);
		central.setUint32(16, crc, true);
		central.setUint32(20, data.length, true);
		central.setUint32(24, data.length, true);
		central.setUint16(28, name.length, true);
		central.setUint32(42, offset, true);
		centrals.push(central.buffer, name);

		offset += 30 + name.length + data.length;
	}

	const centralSize = centrals.reduce((sum, part) => sum + part.byteLength, 0);
	const end = new DataView(new ArrayBuffer(22));// 終端レコード
	end.setUint32(0, 0x06054b50, true);
	end.setUint16(8, files.length, true);
	end.setUint16(10, files.length, true);
	end.setUint32(12, centralSize, true);
	end.setUint32(16, offset, true);

	return new Blob([...locals, ...centrals, end.buffer], { type: "application/zip" });
}
