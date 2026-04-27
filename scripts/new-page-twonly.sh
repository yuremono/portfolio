#!/usr/bin/env bash
# 新規ページ（src/pages + TWonly 独立エントリ + App ルート + Vite MPA input）を一括追加する。
# 使い方: ./scripts/new-page-twonly.sh PageName
#         ./scripts/new-page-twonly.sh pagename   （先頭のみ大文字化 → PageName）
# 制約: 名前は英数字のみ（例 Foo42）。ハイフンやスペースは未対応。

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

die() {
	echo "new-page-twonly: $*" >&2
	exit 1
}

[[ $# -eq 1 ]] || die "引数にページ名を1つ指定してください（例: PageName または pagename）"

RAW="$1"
[[ "$RAW" =~ ^[A-Za-z][A-Za-z0-9]*$ ]] || die "名前は英字で始まる英数字のみにしてください: $RAW"

FIRST="$(printf '%s' "${RAW:0:1}" | tr '[:lower:]' '[:upper:]')"
REST="${RAW:1}"
PASCAL="${FIRST}${REST}"
LOWER="$(printf '%s' "$PASCAL" | tr '[:upper:]' '[:lower:]')"

PAGE_TSX="src/pages/${PASCAL}.tsx"
TW_TSX="TWonly/${PASCAL}.tsx"
TW_HTML="TWonly/${LOWER}.html"
APP_TSX="src/App.tsx"
VITE_CONFIG="vite.config.ts"

[[ -f "$PAGE_TSX" ]] && die "既に存在します: $PAGE_TSX"
[[ -f "$TW_TSX" ]] && die "既に存在します: $TW_TSX"
[[ -f "$TW_HTML" ]] && die "既に存在します: $TW_HTML"

grep -q "pages/${PASCAL}" "$APP_TSX" 2>/dev/null && die "App.tsx に既に ${PASCAL} 参照があります"
grep -q "twonly${PASCAL}" "$VITE_CONFIG" 2>/dev/null && die "vite.config.ts に既に twonly${PASCAL} があります"

# --- src/pages/${PASCAL}.tsx
cat > "$PAGE_TSX" <<EOF
// ルール: src/pages/AGENTS.md。画像は public/images/。
import { useRef } from "react";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";



// PageRoot: テーマ・寸法の塊。特殊レイアウトのまとまり。
const pageRootClass =" [--head:3.5rem] md:[--head:4.5rem] [--mvH:calc(100lvh_-_var(--head))]";

const mainClass = "min-h-[100lvh] ";

function ${PASCAL}() {
	const pageRootRef = useRef<HTMLDivElement>(null);

	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass();

	return (
		<PageRoot ref={pageRootRef} className={pageRootClass}>
			<main className={mainClass}>
				
			</main>
		</PageRoot>
	);
}

export default ${PASCAL};
EOF

# --- TWonly/${PASCAL}.tsx
cat > "$TW_TSX" <<EOF
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./tailwind-only.scss";
import ${PASCAL} from "../src/pages/${PASCAL}";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<${PASCAL} />
		</BrowserRouter>
	</StrictMode>,
);
EOF

# --- TWonly/${LOWER}.html
cat > "$TW_HTML" <<EOF
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TWonly / ${PASCAL}</title>
    <meta name="robots" content="noindex" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;700;900&family=Yomogi&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./${PASCAL}.tsx"></script>
  </body>
</html>
EOF

# --- App.tsx: lazy import を ShuffleDivide の直前に、Route を shuffle-divide の直前に挿入
awk -v p="$PASCAL" '
/^const ShuffleDivide = lazy/ {
	print "const " p " = lazy(() => import(\"./pages/" p "\"));"
}
{ print }
' "$APP_TSX" > "$APP_TSX.tmp" && mv "$APP_TSX.tmp" "$APP_TSX"

awk -v p="$PASCAL" '
/<Route path="\/shuffle-divide"/ {
	print "\t\t\t\t\t<Route path=\"/" p "\" element={<" p " />} />"
}
{ print }
' "$APP_TSX" > "$APP_TSX.tmp" && mv "$APP_TSX.tmp" "$APP_TSX"

# --- vite.config.ts: input に twonly{Pascal}: TWonly/{lower}.html を追加（twonlyPageName の後に挿入）
awk -v p="$PASCAL" -v l="$LOWER" '
/twonlyPageName:/ {
	print $0
	print "\t\t\t\ttwonly" p ": path.resolve(__dirname, \"TWonly/" l ".html\"),"
	next
}
{ print }
' "$VITE_CONFIG" > "$VITE_CONFIG.tmp" && mv "$VITE_CONFIG.tmp" "$VITE_CONFIG"

echo "作成・更新しました:"
echo "  $PAGE_TSX"
echo "  $TW_TSX"
echo "  $TW_HTML"
echo "  $APP_TSX (lazy + Route /${PASCAL})"
echo "  $VITE_CONFIG (build.rollupOptions.input.twonly${PASCAL})"
