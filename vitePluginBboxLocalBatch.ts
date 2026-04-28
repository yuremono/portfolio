import fs from "node:fs/promises";
import path from "node:path";

import type { Plugin } from "vite";

/** 日本時間・`YYYYMMDDHHmm`（12桁のみ、ハイフン・秒なし）。 */
function jstStamp12(): string {
	const d = new Date();
	const f = new Intl.DateTimeFormat("ja-JP", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	const parts = f.formatToParts(d);
	const g = (t: Intl.DateTimeFormatPart["type"]) =>
		parts.find((p) => p.type === t)?.value ?? "0";
	return `${g("year")}${g("month").padStart(2, "0")}${g("day").padStart(2, "0")}${g("hour").padStart(2, "0")}${g("minute").padStart(2, "0")}`;
}

/** 開発サーバー専用: BBox 一括生成の書き出し先パス（`configureServer` のみ）。 */
const BATCH_PATH = "/__bbox_local_batch__/export";

export function vitePluginBboxLocalBatch(projectRoot: string): Plugin {
	return {
		name: "vite-plugin-bbox-local-batch",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const url = req.url?.split("?")[0];
				if (url !== BATCH_PATH || req.method !== "POST") {
					next();
					return;
				}
				const chunks: Buffer[] = [];
				req.on("data", (chunk: Buffer) => {
					chunks.push(chunk);
				});
				req.on("end", async () => {
					try {
						const raw = Buffer.concat(chunks).toString("utf8");
						const body = JSON.parse(raw) as {
							md?: string;
							pngs?: readonly { filename: string; base64: string }[];
						};
						const md = body.md ?? "";
						const pngs = Array.isArray(body.pngs) ? body.pngs : [];
						const stamp = jstStamp12();
						const outRoot = path.resolve(
							projectRoot,
							"src/pages/Bbox",
							stamp,
						);
						await fs.mkdir(outRoot, { recursive: true });
						await fs.writeFile(path.join(outRoot, "clipboard.md"), md, "utf8");
						for (const p of pngs) {
							const name = path.basename(String(p.filename)).replace(
								/\.\./gu,
								"_",
							);
							if (!name.toLowerCase().endsWith(".png")) continue;
							if (/[/\\]/u.test(name) || name.length > 200) continue;
							await fs.writeFile(
								path.join(outRoot, name),
								Buffer.from(String(p.base64), "base64"),
							);
						}
						res.setHeader("Content-Type", "application/json; charset=utf-8");
						res.end(
							JSON.stringify({
								ok: true as const,
								relative: `src/pages/Bbox/${stamp}`,
							}),
						);
					} catch (e) {
						res.statusCode = 500;
						res.setHeader("Content-Type", "application/json; charset=utf-8");
						res.end(JSON.stringify({ ok: false as const, error: String(e) }));
					}
				});
				req.on("error", () => {
					res.statusCode = 400;
					res.end();
				});
			});
		},
	};
}
