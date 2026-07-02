import React from "react"
import { sanitizeSvgMarkup } from "../lib/sanitizeSvg"
import { assertSafeSvgAssetPath } from "../lib/svgAssetPath"

/** figure 直下に SVG を置く。public/images/svg/ のパスを指定するか、SVG 文字列を直接渡す。 */
interface FigureSvgProps {
	/** public/images/svg/ からの相対パス（例: "house-icon.svg"）または SVG 文字列 */
	src: string
	className?: string
}

const svgCache: Record<string, string> = {}

const FigureSvg = ({ src, className = "" }: FigureSvgProps) => {
	const [svg, setSvg] = React.useState<string | null>(svgCache[src] ?? null)

	React.useEffect(() => {
		if (svgCache[src]) {
			setSvg(svgCache[src])
			return
		}
		// SVG 文字列かアセットパスか判定（< で始まれば SVG 文字列）
		if (src.trimStart().startsWith("<")) {
			const safe = sanitizeSvgMarkup(src)
			if (!safe) {
				setSvg(null)
				return
			}
			svgCache[src] = safe
			setSvg(safe)
			return
		}
		const safePath = assertSafeSvgAssetPath(src)
		if (!safePath) {
			setSvg(null)
			return
		}
		const url = `${import.meta.env.BASE_URL}images/svg/${safePath}`
		fetch(url)
			.then((r) => {
				if (!r.ok) throw new Error("fetch failed")
				return r.text()
			})
			.then((text) => {
				const safe = sanitizeSvgMarkup(text)
				if (!safe) {
					setSvg(null)
					return
				}
				svgCache[src] = safe
				setSvg(safe)
			})
			.catch(() => setSvg(null))
	}, [src])

	if (!svg) return null
	return (
		<figure
			className={` ${className ?? ""}`}
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	);
}

export { FigureSvg }
