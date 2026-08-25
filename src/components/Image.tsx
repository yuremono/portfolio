import React from "react"
import { sanitizeSvgMarkup } from "../lib/sanitizeSvg"
import { assertSafeSvgAssetPath } from "../lib/svgAssetPath"

interface ImageProps {
	/** 単一、または同じ `figure` 内に並べる複数 `src`（各要素は解決済みの URL/パス） */
	image?: string | string[]
	/** `<figure>` 用。`className` と結合して適用 */
	className?: string
	figureClassName?: string
	/** 各 `<img>` に共通で付与 */
	imgClassName?: string
	style?: React.CSSProperties
	alt?: string
}

interface ImageSvgProps {
	/** public/images/svg/ からの相対パス（例: "house-icon.svg"）または SVG 文字列 */
	svg: string
	className?: string
	style?: React.CSSProperties
}

const svgCache: Record<string, string> = {}

/** 通常画像用 */
const Image = ({
	image,
	style,
	className = "",
	figureClassName = "w-full h-full",
	imgClassName = "",
	alt = "",
}: ImageProps) => {
	const srcs = !image
		? []
		: Array.isArray(image)
			? image
			: [image]
	const figureCls = [className, figureClassName].filter(Boolean).join(" ")
	return (
		<figure className={` ${figureCls}`} style={style}>
			{srcs.map((src) => (
				<img
					key={src}
					className={imgClassName || undefined}
					src={src}
					alt={alt}
					loading="lazy"
				/>
			))}
		</figure>
	)
}

/** SVG インライン展開用 */
const ImageSvg = ({ svg, style, className = "" }: ImageSvgProps) => {
	const [svgContent, setSvgContent] = React.useState<string | null>(
		svgCache[svg] ?? null,
	)

	React.useEffect(() => {
		if (svgCache[svg]) {
			setSvgContent(svgCache[svg])
			return
		}
		// SVG 文字列かアセットパスか判定（< で始まれば SVG 文字列）
		if (svg.trimStart().startsWith("<")) {
			const safe = sanitizeSvgMarkup(svg)
			if (!safe) {
				setSvgContent(null)
				return
			}
			svgCache[svg] = safe
			setSvgContent(safe)
			return
		}
		const safePath = assertSafeSvgAssetPath(svg)
		if (!safePath) {
			setSvgContent(null)
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
					setSvgContent(null)
					return
				}
				svgCache[svg] = safe
				setSvgContent(safe)
			})
			.catch(() => setSvgContent(null))
	}, [svg])

	if (!svgContent) return null
	return (
		<figure
			className={` ${className ?? ""}`}
			style={style}
			dangerouslySetInnerHTML={{ __html: svgContent }}
		/>
	);
}

export { Image, ImageSvg }
