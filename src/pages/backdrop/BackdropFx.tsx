import { useEffect, useState, type RefObject } from "react";
import {
	BACKDROP_FX_MODES,
	BACKDROP_FX_RENDERERS,
	type BackdropFxMode,
} from "./backdropFxRenderers";
import { createSceneProvider, primeImages } from "./backdropFxScene";

/** 「未適用」を含む表示モード */
type ViewMode = BackdropFxMode | "raw";

interface BackdropFxProps {
	/** エフェクト対象（グループ要素を内包するラッパー）への ref */
	targetRef: RefObject<HTMLElement | null>;
	/** 対象グループのセレクタ */
	groupSelector?: string;
	/** 縞パターンに使う CSS 変数名（DOM 側の --BGgrad と同じ配色にする） */
	patternVars?: readonly string[];
	className?: string;
}

const DEFAULT_PATTERN_VARS = ["--wine", "--forest", "--brownLT"] as const;

/** 注入する canvas のクラス（グループ内で最前面・操作不可） */
const FX_CANVAS_CLASS =
	"absolute inset-0 z-10 h-full w-full pointer-events-none";

/** スライダー連続操作での再計算をまとめる */
const RENDER_DEBOUNCE_MS = 150;

/**
 * バックドロップのキャンバスFXコントローラー。
 * 対象内の各グループへ canvas を注入し、モードボタンと強度スライダーで描画を切り替える。
 */
export function BackdropFx({
	targetRef,
	groupSelector = ".RandomRects",
	patternVars = DEFAULT_PATTERN_VARS,
	className,
}: BackdropFxProps) {
	const [mode, setMode] = useState<ViewMode>("raw");
	const [intensity, setIntensity] = useState(50);

	useEffect(() => {// canvas を注入し、モード・強度に応じて再描画する
		const target = targetRef.current;
		if (!target) return;
		/** グループを毎回取り直し、canvas が無ければ注入する（HMR 等での DOM 再生成に追従） */
		const ensureCanvases = (): Array<[HTMLElement, HTMLCanvasElement]> =>
			Array.from(
				target.querySelectorAll<HTMLElement>(groupSelector),
			).map((g) => {
				let cv = g.querySelector<HTMLCanvasElement>(
					":scope > canvas[data-fx]",
				);
				if (!cv) {
					cv = document.createElement("canvas");
					cv.dataset.fx = "";
					cv.className = FX_CANVAS_CLASS;
					cv.setAttribute("aria-hidden", "true");
					cv.hidden = true;
					g.append(cv);
				}
				return [g, cv];
			});
		if (mode === "raw") {
			ensureCanvases().forEach(([, cv]) => {
				cv.hidden = true;
			});
			return;
		}
		let alive = true;
		let imgCleanup: (() => void) | null = null;
		const render = BACKDROP_FX_RENDERERS[mode];
		// scene を毎回描き直す source（従来方式）
		const source = createSceneProvider(patternVars);
		const run = async () => {
			imgCleanup?.();
			const imgs = Array.from(
				target.querySelectorAll<HTMLImageElement>("img"),
			);
			const primed = primeImages(imgs, () => schedule(RENDER_DEBOUNCE_MS));
			imgCleanup = primed.cleanup;
			await primed.ready;
			if (!alive) return;
			const t0 = performance.now();
			ensureCanvases().forEach(([g, cv]) => {
				render(g, cv, intensity / 100, source);
				cv.hidden = false;
			});
			console.info(
				`[BackdropFx:scene] ${mode} 描画 ${(performance.now() - t0).toFixed(1)}ms`,
			);
		};
		let timer: ReturnType<typeof setTimeout> | null = setTimeout(
			run,
			RENDER_DEBOUNCE_MS,
		);
		const schedule = (delay: number) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(run, delay);
		};
		const onResize = () => {// リサイズはデバウンスして getImageData の連発を防ぐ
			schedule(200);
		};
		window.addEventListener("resize", onResize);
		const observer = new MutationObserver((mutations) => {// 自前の canvas 注入は無視し、それ以外の DOM 変化で再描画
			const external = mutations.some((m) =>
				[...m.addedNodes, ...m.removedNodes].some(
					(n) =>
						!(
							n instanceof HTMLCanvasElement &&
							n.dataset.fx !== undefined
						),
				),
			);
			if (external) schedule(RENDER_DEBOUNCE_MS);
		});
		observer.observe(target, { childList: true, subtree: true });
		return () => {
			alive = false;
			imgCleanup?.();
			observer.disconnect();
			if (timer) clearTimeout(timer);
			window.removeEventListener("resize", onResize);
		};
	}, [groupSelector, intensity, mode, patternVars, targetRef]);

	useEffect(() => {// アンマウント時に注入した canvas を除去する
		const target = targetRef.current;
		return () => {
			target
				?.querySelectorAll("canvas[data-fx]")
				.forEach((cv) => cv.remove());
		};
	}, [targetRef]);

	return (
		<div
			className={`flex flex-wrap items-center justify-end gap-2 ${className ?? ""}`}
		>
			<input
				type="range"
				min={0}
				max={100}
				value={intensity}
				disabled={mode === "raw"}
				aria-label="エフェクト強度"
				onChange={(e) => setIntensity(Number(e.target.value))}
				className="w-24 accent-MC"
			/>
			{(["raw", ...BACKDROP_FX_MODES] as const).map((m) => (
				<button
					key={m}
					type="button"
					aria-pressed={mode === m}
					onClick={() => setMode(m)}
					className={`btn min-w-0 px-2 py-0.5 text-xs ${mode === m ? "" : "opacity-60"}`}
				>
					{m}
				</button>
			))}
		</div>
	);
}
