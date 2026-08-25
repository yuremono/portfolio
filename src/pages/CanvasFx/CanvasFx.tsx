import { useEffect, useRef, useState, type RefObject } from "react";
import {
	BACKDROP_FX_MODES,
	BACKDROP_FX_RENDERERS,
	type BackdropFxMode,
} from "../backdrop/backdropFxRenderers";
import { primeImages } from "../backdrop/backdropFxScene";
import {
	createCaptureController,
	type CaptureController,
} from "./captureSource";

/** 「未適用」を含む表示モード */
type ViewMode = BackdropFxMode | "raw";

interface CanvasFxProps {
	/** 対象を探す起点。省略時は document 全体。ページ内に限定するなら PageRoot の ref を渡す */
	rootRef?: RefObject<HTMLElement | null>;
	/** 対象要素のマーカークラス。これが付いた要素すべてが対象になる（付ける/外すだけで増減） */
	selector?: string;
	className?: string;
}

/** 対象マーカー: この class を要素に付けるとエフェクト対象になる（連番・ref 不要） */
const DEFAULT_SELECTOR = ".CanvasFx";

/** 注入する canvas のクラス（対象内で最前面・操作不可） */
const FX_CANVAS_CLASS =
	"absolute inset-0 z-10 h-full w-full pointer-events-none";

/** スライダー連続操作での再計算をまとめる */
const RENDER_DEBOUNCE_MS = 150;

/**
 * キャンバスFXコントローラー（DOM取り込み方式 / html-to-image）。
 * マーカークラスの付いた要素「全体」をそれぞれ1枚のビットマップに取り込み、その1枚へエフェクトを適用する。
 * モード切替＋強度スライダーは全対象へグローバルに効く。scene 手描き版は ../backdrop。
 */
export function CanvasFx({
	rootRef,
	selector = DEFAULT_SELECTOR,
	className,
}: CanvasFxProps) {
	const [mode, setMode] = useState<ViewMode>("raw");
	const [intensity, setIntensity] = useState(30);
	// 取り込みキャッシュを再レンダー間で保持する（強度変更で再取得しないため）
	const controllerRef = useRef<CaptureController | null>(null);

	useEffect(() => {// マーカー要素へ canvas を注入し、モード・強度に応じて再描画する
		const scope = (): ParentNode => rootRef?.current ?? document;
		/** マーカークラスの付いた対象を毎回集め直す（クラスの付け外しに追従） */
		const collect = (): HTMLElement[] =>
			Array.from(scope().querySelectorAll<HTMLElement>(selector));
		if (!controllerRef.current) {
			controllerRef.current = createCaptureController();
		}
		const ctl = controllerRef.current;
		/** 対象直下に FX canvas を1枚だけ用意する（HMR 等での DOM 再生成に追従） */
		const ensureCanvas = (target: HTMLElement): HTMLCanvasElement => {
			let cv = target.querySelector<HTMLCanvasElement>(
				":scope > canvas[data-fx]",
			);
			if (!cv) {
				cv = document.createElement("canvas");
				cv.dataset.fx = "";
				cv.className = FX_CANVAS_CLASS;
				cv.setAttribute("aria-hidden", "true");
				cv.hidden = true;
				target.append(cv);
			}
			return cv;
		};
		let alive = true;
		let imgCleanup: (() => void) | null = null;
		let timer: ReturnType<typeof setTimeout> | null = null;
		const schedule = (delay: number) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(run, delay);
		};
		const run = async () => {
			imgCleanup?.();
			const targets = collect();
			if (mode === "raw") {// 対象の canvas を隠すだけ（取り込みは走らせない）
				targets.forEach((t) => {
					const cv = t.querySelector<HTMLCanvasElement>(
						":scope > canvas[data-fx]",
					);
					if (cv) cv.hidden = true;
				});
				return;
			}
			if (targets.length === 0) return;
			const render = BACKDROP_FX_RENDERERS[mode];
			const canvases = targets.map((t) => ensureCanvas(t));
			const imgs = targets.flatMap((t) =>
				Array.from(t.querySelectorAll<HTMLImageElement>("img")),
			);
			const primed = primeImages(imgs, () => {// 後から読み込まれた画像で取り込み直す
				ctl.invalidate();
				schedule(RENDER_DEBOUNCE_MS);
			});
			imgCleanup = primed.cleanup;
			await primed.ready;
			if (!alive) return;
			await ctl.prime(targets);// 対象ごとに並列取り込み（内部で Promise.all）
			if (!alive) return;
			const t0 = performance.now();
			targets.forEach((t, i) => {
				const cv = canvases[i]!;
				// 前モードが付けた出力ジオメトリ（particle のせり出し等）を毎回消してから描く（クラス既定へ戻す）
				cv.removeAttribute("style");
				render(t, cv, intensity / 100, ctl.provider);
			});
			canvases.forEach((cv) => {
				cv.hidden = false;
			});
			console.info(
				`[CanvasFx] ${mode} ×${targets.length} 取込 ${ctl.lastCaptureMs.toFixed(1)}ms + 描画 ${(performance.now() - t0).toFixed(1)}ms`,
			);
		};
		timer = setTimeout(run, RENDER_DEBOUNCE_MS);
		const onResize = () => {// サイズが変わると取り込みも無効になるため破棄して撮り直す
			ctl.invalidate();
			schedule(200);
		};
		window.addEventListener("resize", onResize);
		const observer = new MutationObserver((mutations) => {// 自前の canvas 注入は無視し、それ以外の DOM 変化（対象の増減含む）で取り込み直す
			const external = mutations.some((m) =>
				[...m.addedNodes, ...m.removedNodes].some(
					(n) =>
						!(
							n instanceof HTMLCanvasElement &&
							n.dataset.fx !== undefined
						),
				),
			);
			if (external) {
				ctl.invalidate();
				schedule(RENDER_DEBOUNCE_MS);
			}
		});
		observer.observe(rootRef?.current ?? document.body, {
			childList: true,
			subtree: true,
		});
		return () => {
			alive = false;
			imgCleanup?.();
			observer.disconnect();
			if (timer) clearTimeout(timer);
			window.removeEventListener("resize", onResize);
		};
	}, [intensity, mode, rootRef, selector]);

	useEffect(() => {// アンマウント時に注入した canvas を全対象から除去する
		return () => {
			(rootRef?.current ?? document)
				.querySelectorAll("canvas[data-fx]")
				.forEach((cv) => cv.remove());
		};
	}, [rootRef]);

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
