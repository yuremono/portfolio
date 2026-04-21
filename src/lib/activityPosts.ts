import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export interface ActivityPost {
	id: string;
	label: string;
	category?: string;
	title: string;
	/** `<time dateTime>` 用（ISO 形式を推奨）。表示もこの文字列をそのまま使う */
	dateTime: string;
	/** 左ペインの画像パス（`getAssetPath` を適用する前の生パス） */
	image?: string;
	/** 並び順の優先度。1 桁（0–9）。高いほど上に来る。省略時は 0 */
	priority: number;
	/** Markdown 本文（HTML 変換後、サニタイズ済み） */
	bodyHtml: string;
	/** `true` の場合はリスト・記事本体・アンカーリンクすべてから除外する */
	private?: boolean;
}

const rawModules = import.meta.glob("../content/activity/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
}) as Record<string, string>;

function parseFrontmatter(raw: string): {
	data: Record<string, string>;
	content: string;
} {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!match) return { data: {}, content: raw };
	const [, yaml, content] = match;
	const data: Record<string, string> = {};
	for (const line of yaml.split(/\r?\n/)) {
		const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
		if (!m) continue;
		let val = m[2].trim();
		if (
			(val.startsWith('"') && val.endsWith('"')) ||
			(val.startsWith("'") && val.endsWith("'"))
		) {
			val = val.slice(1, -1);
		}
		data[m[1]] = val;
	}
	return { data, content };
}

marked.setOptions({ breaks: true, gfm: true });

function parsePriority(raw: string | undefined): number {
	if (raw === undefined || raw === "") return 0;
	const n = Number.parseInt(raw, 10);
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(9, n));
}

function parseBoolean(raw: string | undefined): boolean {
	if (raw === undefined) return false;
	const v = raw.trim().toLowerCase();
	return v === "true" || v === "1" || v === "yes";
}

/**
 * Markdown 本文の前処理。
 * リストアイテム行（`- ` / `* ` / `+ ` / `1. ` など）同士の間に挟まった空行を、
 *   - 1 個         → 削除（tight list を維持）
 *   - N 個（N≥2）  → 直前の li 末尾に `<br>` を (N-1) 個追加し、空行は削除
 * に変換する。これによりリストは分断されず、空行数＝余白量として意図通りに描画される。
 * それ以外の場所の空行（段落間・連続空行）はそのまま維持する。
 */
function preprocessMarkdown(md: string): string {
	const lines = md.split("\n");
	const listItemRe = /^[ \t]*([-*+]|\d+\.)[ \t]+/;
	const out: string[] = [];
	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		if (line.trim() === "") {
			let j = i;
			while (j < lines.length && lines[j].trim() === "") j++;
			const blankCount = j - i;
			const prevLine = out[out.length - 1] ?? "";
			const nextLine = lines[j] ?? "";
			const betweenListItems =
				listItemRe.test(prevLine) && listItemRe.test(nextLine);
			if (betweenListItems) {
				if (blankCount >= 1) {
					const brs = "<br>".repeat(blankCount + 1);
					out[out.length - 1] = prevLine + brs;
				}
			} else {
				for (let k = 0; k < blankCount; k++) out.push("");
			}
			i = j;
			continue;
		}
		out.push(line);
		i++;
	}
	return out.join("\n");
}

export const POSTS: ActivityPost[] = Object.entries(rawModules)
	.map(([path, raw]) => {
		const { data, content } = parseFrontmatter(raw);
		const fallbackId = path
			.split("/")
			.pop()!
			.replace(/\.md$/, "");
		const html = marked.parse(preprocessMarkdown(content), {
			async: false,
		}) as string;
		return {
			id: data.id || fallbackId,
			label: data.label ?? "",
			category: data.category,
			title: data.title ?? "",
			dateTime: data.dateTime || "",
			image: data.image,
			priority: parsePriority(data.priority),
			bodyHtml: DOMPurify.sanitize(html),
			private: parseBoolean(data.private),
		} satisfies ActivityPost;
	})
	.filter((post) => !post.private)
	.sort((a, b) => {
		if (b.priority !== a.priority) return b.priority - a.priority;
		return b.dateTime.localeCompare(a.dateTime);
	});
