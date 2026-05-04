#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".frag",
  ".glsl",
  ".html",
  ".js",
  ".json",
  ".map",
  ".mjs",
  ".svg",
  ".ts",
  ".txt",
  ".vert",
  ".wgsl",
]);

const DEFAULT_TERMS = [
  "canvas",
  "mousemove",
  "mouseover",
  "mouseenter",
  "mouseleave",
  "WebGLRenderer",
  "ShaderMaterial",
  "vertexShader",
  "fragmentShader",
  "gsap",
  "ScrollTrigger",
];

function usage() {
  console.log(`Usage:
  node extract-sources.mjs <url> [--contains term1,term2] [--out tmp/recreate-module] [--depth 1] [--max 120]

Examples:
  node extract-sources.mjs https://example.com/ --contains '#awards_content,GeometryWaveEffect,uOffset'
  node extract-sources.mjs https://example.com/ --out tmp/recreate-module/example --depth 2 --max 80`);
}

function parseArgs(argv) {
  const args = {
    url: "",
    contains: [],
    out: "tmp/recreate-module",
    depth: 1,
    max: 120,
    timeout: 15000,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--help" || value === "-h") {
      usage();
      process.exit(0);
    }
    if (value === "--contains") {
      args.contains.push(...splitTerms(argv[++index] || ""));
    } else if (value === "--out") {
      args.out = argv[++index] || args.out;
    } else if (value === "--depth") {
      args.depth = Number.parseInt(argv[++index] || "1", 10);
    } else if (value === "--max") {
      args.max = Number.parseInt(argv[++index] || "120", 10);
    } else if (value === "--timeout") {
      args.timeout = Number.parseInt(argv[++index] || "15000", 10);
    } else if (!args.url) {
      args.url = value;
    } else {
      args.contains.push(...splitTerms(value));
    }
  }

  if (!args.url) {
    usage();
    process.exit(1);
  }

  args.depth = Number.isFinite(args.depth) ? Math.max(0, args.depth) : 1;
  args.max = Number.isFinite(args.max) ? Math.max(1, args.max) : 120;
  args.timeout = Number.isFinite(args.timeout) ? Math.max(1000, args.timeout) : 15000;
  args.contains = unique([...args.contains, ...DEFAULT_TERMS].filter(Boolean));
  return args;
}

function splitTerms(value) {
  return value
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values)];
}

function hash(value) {
  return createHash("sha1").update(value).digest("hex").slice(0, 8);
}

function resolveUrl(raw, baseUrl) {
  try {
    if (!raw || raw.startsWith("data:") || raw.startsWith("blob:") || raw.startsWith("mailto:") || raw.startsWith("tel:")) {
      return "";
    }
    return new URL(raw, baseUrl).href;
  } catch {
    return "";
  }
}

function withoutHash(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.href;
}

function safeName(url, fallbackExtension = ".txt") {
  const parsed = new URL(url);
  const pathname = parsed.pathname === "/" ? "/index.html" : parsed.pathname;
  const extension = path.extname(pathname) || fallbackExtension;
  const body = `${parsed.hostname}${pathname}`
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 140);
  return `${body}_${hash(url)}${body.endsWith(extension) ? "" : extension}`;
}

function isLikelyText(url, contentType) {
  const parsed = new URL(url);
  const extension = path.extname(parsed.pathname.replace(/\.gz$/, ""));
  return (
    contentType.includes("text/") ||
    contentType.includes("javascript") ||
    contentType.includes("json") ||
    contentType.includes("xml") ||
    contentType.includes("svg") ||
    TEXT_EXTENSIONS.has(extension) ||
    parsed.pathname.endsWith(".gz")
  );
}

async function fetchBuffer(url, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "recreate-module-source-extractor/1.0",
        accept: "*/*",
      },
    });
    const arrayBuffer = await response.arrayBuffer();
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url || url,
      contentType: response.headers.get("content-type") || "",
      buffer: Buffer.from(arrayBuffer),
    };
  } finally {
    clearTimeout(timer);
  }
}

function decodeText(url, buffer, contentType) {
  let body = buffer;
  if (body.length > 2 && body[0] === 0x1f && body[1] === 0x8b) {
    body = gunzipSync(body);
  }
  if (!isLikelyText(url, contentType)) {
    return null;
  }
  const text = body.toString("utf8");
  if (text.includes("\u0000")) {
    return null;
  }
  return text;
}

function extractHtmlAssets(html, baseUrl) {
  const found = [];
  const add = (kind, raw) => {
    const href = resolveUrl(raw, baseUrl);
    if (href) found.push({ href: withoutHash(href), kind });
  };

  for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    add("script", match[1]);
  }
  for (const match of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const tag = match[0].toLowerCase();
    if (tag.includes("stylesheet") || tag.includes("modulepreload") || tag.includes("preload")) {
      add("link", match[1]);
    }
  }
  for (const match of html.matchAll(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    add("iframe", match[1]);
  }

  return found;
}

function extractInlineBlocks(html, baseUrl) {
  const blocks = [];
  let index = 0;
  for (const match of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (match[1].trim()) {
      blocks.push({
        href: `${baseUrl}#inline-script-${index}`,
        kind: "inline-script",
        text: match[1],
        filename: `inline-script-${index}.js`,
      });
      index += 1;
    }
  }
  index = 0;
  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    if (match[1].trim()) {
      blocks.push({
        href: `${baseUrl}#inline-style-${index}`,
        kind: "inline-style",
        text: match[1],
        filename: `inline-style-${index}.css`,
      });
      index += 1;
    }
  }
  return blocks;
}

function extractNestedUrls(text, baseUrl) {
  const found = [];
  const add = (raw, kind) => {
    const href = resolveUrl(raw, baseUrl);
    if (href) found.push({ href: withoutHash(href), kind });
  };

  for (const match of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    add(match[1], "css-url");
  }
  for (const match of text.matchAll(/["']([^"']+\.(?:css|frag|glsl|js|json|map|mjs|svg|vert|wasm|wgsl|gz)(?:\?[^"']*)?)["']/gi)) {
    add(match[1], "text-url");
  }
  for (const match of text.matchAll(/[#@]\s*sourceMappingURL=([^\s*]+)/g)) {
    add(match[1], "source-map");
  }

  return found;
}

function searchTerms(text, terms) {
  const matches = [];
  const lines = text.split(/\r?\n/);
  const singleLine = lines.length === 1;

  for (const term of terms) {
    if (!term) continue;
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    let offset = 0;
    let count = 0;
    while ((offset = lowerText.indexOf(lowerTerm, offset)) !== -1 && count < 20) {
      if (singleLine) {
        matches.push({
          term,
          line: 1,
          snippet: snippet(text, offset, term.length),
        });
      } else {
        const before = text.slice(0, offset);
        const lineNumber = before.split(/\r?\n/).length;
        const line = lines[lineNumber - 1] || "";
        matches.push({
          term,
          line: lineNumber,
          snippet: line.trim().slice(0, 220),
        });
      }
      offset += lowerTerm.length;
      count += 1;
    }
  }

  return matches;
}

function snippet(text, offset, length) {
  const start = Math.max(0, offset - 90);
  const end = Math.min(text.length, offset + length + 130);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function detectHints(resources) {
  const combined = resources
    .filter((resource) => resource.text)
    .map((resource) => resource.text)
    .join("\n");
  const hints = [];
  const patterns = [
    ["WebGL", /WebGLRenderer|ShaderMaterial|vertexShader|fragmentShader|uniform/i],
    ["Canvas", /getContext\(["']2d|requestAnimationFrame|canvas/i],
    ["GSAP", /gsap|ScrollTrigger|quickTo|timeline/i],
    ["Three.js", /THREE\.|from ["']three["']|TextureLoader|PlaneGeometry/i],
    ["Source maps", /sourceMappingURL/i],
    ["Image loading", /imagesLoaded|crossOrigin|TextureLoader|srcset/i],
  ];
  for (const [label, regex] of patterns) {
    if (regex.test(combined)) hints.push(label);
  }
  return hints;
}

async function writeText(file, text) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text);
}

function reportMarkdown({ startUrl, outDir, terms, resources }) {
  const matched = resources
    .filter((resource) => resource.matches?.length)
    .sort((a, b) => b.matches.length - a.matches.length);
  const hints = detectHints(resources);
  const lines = [
    `# Recreate Module Source Report`,
    ``,
    `- URL: ${startUrl}`,
    `- Output: ${outDir}`,
    `- Text resources: ${resources.filter((resource) => resource.text).length}`,
    `- Match terms: ${terms.join(", ")}`,
    hints.length ? `- Detected hints: ${hints.join(", ")}` : "",
    ``,
    `## Likely Source Files`,
    ``,
  ].filter(Boolean);

  if (matched.length === 0) {
    lines.push(`No term matches were found. Add more specific --contains values from the observed DOM or inline scripts.`, ``);
  } else {
    for (const resource of matched.slice(0, 30)) {
      lines.push(`- ${resource.file || "(inline)"}: ${resource.matches.length} match(es)`);
      lines.push(`  - ${resource.href}`);
    }
    lines.push(``);
  }

  lines.push(`## Matches`, ``);
  for (const resource of matched.slice(0, 30)) {
    lines.push(`### ${resource.file || resource.href}`);
    lines.push(``);
    lines.push(`Source: ${resource.href}`);
    lines.push(``);
    for (const match of resource.matches.slice(0, 30)) {
      lines.push(`- ${match.term} line ${match.line}: ${match.snippet}`);
    }
    lines.push(``);
  }

  lines.push(`## All Fetched Text Resources`, ``);
  for (const resource of resources.filter((item) => item.text)) {
    lines.push(`- ${resource.file || "(inline)"} [${resource.kind}] ${resource.href}`);
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const startUrl = new URL(args.url).href;
  const hostDir = new URL(startUrl).hostname.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const outDir = path.join(args.out, hostDir);
  const filesDir = path.join(outDir, "files");
  const queue = [{ href: startUrl, kind: "document", depth: 0 }];
  const seen = new Set();
  const resources = [];

  await fs.mkdir(filesDir, { recursive: true });

  while (queue.length && seen.size < args.max) {
    const item = queue.shift();
    const href = withoutHash(item.href);
    if (seen.has(href)) continue;
    seen.add(href);

    try {
      const fetched = await fetchBuffer(href, args.timeout);
      const text = decodeText(fetched.finalUrl, fetched.buffer, fetched.contentType);
      const resource = {
        href,
        finalUrl: fetched.finalUrl,
        kind: item.kind,
        status: fetched.status,
        ok: fetched.ok,
        contentType: fetched.contentType,
        depth: item.depth,
        text: text || "",
        matches: [],
        file: "",
      };

      if (text !== null) {
        const extension = item.kind === "document" ? ".html" : ".txt";
        const filename = safeName(fetched.finalUrl, extension);
        const file = path.join(filesDir, filename);
        resource.file = path.relative(outDir, file);
        resource.matches = searchTerms(text, args.contains);
        await writeText(file, text);

        if (item.kind === "document") {
          queue.push(...extractHtmlAssets(text, fetched.finalUrl).filter((entry) => !seen.has(entry.href)));
          for (const block of extractInlineBlocks(text, fetched.finalUrl)) {
            const inlineFile = path.join(filesDir, block.filename);
            const inlineResource = {
              href: block.href,
              finalUrl: block.href,
              kind: block.kind,
              status: 200,
              ok: true,
              contentType: block.kind === "inline-style" ? "text/css" : "text/javascript",
              depth: item.depth,
              text: block.text,
              matches: searchTerms(block.text, args.contains),
              file: path.relative(outDir, inlineFile),
            };
            await writeText(inlineFile, block.text);
            resources.push(inlineResource);
            if (item.depth < args.depth) {
              queue.push(...extractNestedUrls(block.text, fetched.finalUrl).filter((entry) => !seen.has(entry.href)));
            }
          }
        }

        if (item.depth < args.depth) {
          queue.push(...extractNestedUrls(text, fetched.finalUrl).filter((entry) => !seen.has(entry.href)));
        }
      }

      resources.push(resource);
    } catch (error) {
      resources.push({
        href,
        finalUrl: href,
        kind: item.kind,
        status: 0,
        ok: false,
        contentType: "",
        depth: item.depth,
        text: "",
        matches: [],
        file: "",
        error: error.message,
      });
    }
  }

  const serializable = resources.map((resource) => ({
    ...resource,
    text: resource.text ? `[saved text: ${resource.text.length} chars]` : "",
  }));
  await writeText(path.join(outDir, "sources.json"), `${JSON.stringify(serializable, null, 2)}\n`);
  await writeText(path.join(outDir, "report.md"), reportMarkdown({
    startUrl,
    outDir,
    terms: args.contains,
    resources,
  }));

  const matches = resources.reduce((total, resource) => total + (resource.matches?.length || 0), 0);
  console.log(`Fetched ${resources.length} resources with ${matches} match(es).`);
  console.log(`Report: ${path.join(outDir, "report.md")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
