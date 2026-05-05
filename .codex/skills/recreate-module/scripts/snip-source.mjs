#!/usr/bin/env node
import { promises as fs } from "node:fs";

function usage() {
  console.log(`Usage:
  node snip-source.mjs <file> <term> [--before 1200] [--after 2400] [--all] [--ignore-case]

Example:
  node snip-source.mjs tmp/recreate-module/example.com/files/helpers.bundle.js GeometryWaveEffect --before 1600 --after 4200`);
}

function parseArgs(argv) {
  const args = {
    file: "",
    term: "",
    before: 1200,
    after: 2400,
    all: false,
    ignoreCase: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--help" || value === "-h") {
      usage();
      process.exit(0);
    }
    if (value === "--before") {
      args.before = Number.parseInt(argv[++index] || "1200", 10);
    } else if (value === "--after") {
      args.after = Number.parseInt(argv[++index] || "2400", 10);
    } else if (value === "--all") {
      args.all = true;
    } else if (value === "--ignore-case") {
      args.ignoreCase = true;
    } else if (!args.file) {
      args.file = value;
    } else if (!args.term) {
      args.term = value;
    }
  }

  if (!args.file || !args.term) {
    usage();
    process.exit(1);
  }

  args.before = Number.isFinite(args.before) ? Math.max(0, args.before) : 1200;
  args.after = Number.isFinite(args.after) ? Math.max(0, args.after) : 2400;
  return args;
}

function lineNumberAt(text, offset) {
  return text.slice(0, offset).split(/\r?\n/).length;
}

function findOffsets(text, term, ignoreCase) {
  const haystack = ignoreCase ? text.toLowerCase() : text;
  const needle = ignoreCase ? term.toLowerCase() : term;
  const offsets = [];
  let offset = 0;

  while ((offset = haystack.indexOf(needle, offset)) !== -1) {
    offsets.push(offset);
    offset += needle.length || 1;
  }

  return offsets;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const text = await fs.readFile(args.file, "utf8");
  const offsets = findOffsets(text, args.term, args.ignoreCase);

  if (offsets.length === 0) {
    console.error(`No match: ${args.term}`);
    process.exit(2);
  }

  const selected = args.all ? offsets : offsets.slice(0, 1);
  selected.forEach((offset, index) => {
    const start = Math.max(0, offset - args.before);
    const end = Math.min(text.length, offset + args.term.length + args.after);
    const line = lineNumberAt(text, offset);
    if (index > 0) console.log("\n---\n");
    console.log(`file: ${args.file}`);
    console.log(`term: ${args.term}`);
    console.log(`line: ${line}`);
    console.log(`offset: ${offset}`);
    console.log("");
    console.log(text.slice(start, end));
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
