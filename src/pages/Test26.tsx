// ルール: src/pages/AGENTS.md。画像は public/images/。
import { useRef } from "react";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";



// PageRoot: テーマ・寸法の塊。特殊レイアウトのまとまり。
const pageRootClass =" [--head:3.5rem] md:[--head:4.5rem] [--mvH:calc(100lvh_-_var(--head))]";

const mainClass = "min-h-[100lvh] ";

function Test26() {
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

export default Test26;
