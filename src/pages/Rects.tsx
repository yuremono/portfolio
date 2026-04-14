import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowClockwiseIcon, CopyIcon } from "@phosphor-icons/react";

import { Footer } from "../components/Footer";
import { Toggle, ToggleSummary, ToggleBody } from "../components/Toggle";
import { useClientRuntime } from "../hooks/useClientRuntime";
import {
	type RectsGeneratorMode,
	type RectsOutputMode,
	type SvgMarkupVariant,
	useRectsTweakpane,
} from "../hooks/useRectsTweakpane";
import {
	buildListFromParams,
	buildRandomGridCopyMarkup,
	buildRandomGridLines,
	buildRandomRectsMarkup,
	fmtPct,
	GRID_LINE_STROKE_WIDTH,
	GRID_VIEWBOX_WIDTH,
	RANDOM_RECTS_WRAP_CLASS,
	rectPreviewStyle,
	rectToGridBox,
	rectToSvgGeometry,
	rectToSvgPathD,
	RECT_ITEM_ROUNDED_100_CLASS,
	SVG_RANDOM_RECTS_WRAP_CLASS,
} from "../lib/generator/rectsPageMarkup";
import {
	gridShapePathD,
	gridShapeUsesPath,
	gridShapeUsesPlusLines,
	gridViewBoxHeightForSquareCells,
	type GridRandomMode,
	type GridShapeId,
} from "../lib/generator/randomGrid";
import type { Rect } from "../lib/generator/rects";
import {
	clampGridShapeRotationDeg,
	clampWrapperHeightPct,
	loadTweakParams,
	normalizeTweakParamsInPlace,
	saveTweakParams,
	type RectsTweakParams,
} from "../lib/generator/rectsTweakParams";

/** Tweakpane の連続操作時に localStorage への同期書き込みをまとめる（メインスレッドの負荷軽減） */
const PERSIST_DEBOUNCE_MS = 280;

/** Rects タブのコピー用 `<pre>` は行数・個数が大きいと重いため、連続操作ではデバウンスする */
const COPY_MARKUP_DEBOUNCE_MS = 400;



function sameGridLayoutSnapshot(
	a: {
		rows: number;
		cols: number;
		cellFillPercent: number;
		gridRandomMode: GridRandomMode;
	},
	b: typeof a,
): boolean {
	return (
		a.rows === b.rows &&
		a.cols === b.cols &&
		a.cellFillPercent === b.cellFillPercent &&
		a.gridRandomMode === b.gridRandomMode
	);
}

function computeCopyMarkupText(args: {
	generatorMode: RectsGeneratorMode;
	effectiveOutputMode: RectsOutputMode;
	svgMarkupVariant: SvgMarkupVariant;
	list: Rect[];
	rectsItemRounded100Pct: boolean;
	rectsWrapperHeightPct: number;
	appliedGridRows: number;
	appliedGridCols: number;
	gridShapeId: GridShapeId;
	gridItemRounded100Pct: boolean;
	gridStrokeWidth: number;
	gridShapeRotationDeg: number;
}): string {
	if (args.generatorMode === "grid") {
		if (args.list.length === 0) {
			return "<!-- 図形がまだありません -->";
		}
		return buildRandomGridCopyMarkup({
			list: args.list,
			rows: args.appliedGridRows,
			cols: args.appliedGridCols,
			shapeId: args.gridShapeId,
			itemRounded100Pct: args.gridItemRounded100Pct,
			strokeWidth: args.gridStrokeWidth,
			shapeRotationDeg: args.gridShapeRotationDeg,
		});
	}
	return buildRandomRectsMarkup(
		args.effectiveOutputMode,
		args.svgMarkupVariant,
		args.list,
		args.rectsItemRounded100Pct,
		args.rectsWrapperHeightPct,
	);
}

function Rects() {
	/**
	 * localStorage から復元した初期パラメータ（lazy init で 1 回だけ読む）。
	 * render 中に ref.current を読むと ESLint 警告が出るため、
	 * 初期値は useState 経由で取得し、ref へは初期値として渡す。
	 */
	const [initialParams] = useState<RectsTweakParams>(() => {
		return {
			...loadTweakParams(),
			// 初回表示の Generator は常に Grid から開始する
			generatorMode: "grid",
		};
	});
	/** 初回マウントが Rects のときだけ、初期 `copyMarkupText` と重複するデバウンスを抑止 */
	const skipInitialRectCopyDebounceRef = useRef(
		initialParams.generatorMode === "rects",
	);

	const [generatorMode, setGeneratorMode] = useState<RectsGeneratorMode>(
		initialParams.generatorMode,
	);
	const [rectsWrapperHeightPct, setRectsWrapperHeightPct] = useState(
		initialParams.rects.wrapperHeightPct,
	);
	const [rectsItemRounded100Pct, setRectsItemRounded100Pct] = useState(
		initialParams.rects.itemRounded100Pct,
	);
	const [gridItemRounded100Pct, setGridItemRounded100Pct] = useState(
		initialParams.grid.itemRounded100Pct,
	);
	const [outputMode, setOutputMode] = useState<RectsOutputMode>(
		initialParams.rects.outputMode,
	);
	const [svgMarkupVariant, setSvgMarkupVariant] = useState<SvgMarkupVariant>(
		initialParams.svgMarkupVariant,
	);
	const [gridShapeId, setGridShapeId] = useState<GridShapeId>(
		initialParams.grid.shapeId,
	);
	const [showGridLines, setShowGridLines] = useState(
		initialParams.grid.showGridLines,
	);
	const [gridStrokeWidth, setGridStrokeWidth] = useState(
		initialParams.grid.strokeWidth,
	);
	const [gridShapeRotationDeg, setGridShapeRotationDeg] = useState(
		initialParams.grid.shapeRotationDeg,
	);
	const [appliedGridRows, setAppliedGridRows] = useState(
		initialParams.grid.rows,
	);
	const [appliedGridCols, setAppliedGridCols] = useState(
		initialParams.grid.cols,
	);

	/** Tweakpane と共有（バインド先。change で枠の高さを React と同期） */
	const tweakParamsRef = useRef<RectsTweakParams>(initialParams);
	const tweakpaneContainerRef = useRef<HTMLDivElement>(null);
	const appliedGridLayoutRef = useRef({
		rows: initialParams.grid.rows,
		cols: initialParams.grid.cols,
		cellFillPercent: initialParams.grid.cellFillPercent,
		gridRandomMode: initialParams.grid.gridRandomMode,
	});

	const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const schedulePersistTweakParams = useCallback((p: RectsTweakParams) => {
		if (persistTimerRef.current !== null) {
			clearTimeout(persistTimerRef.current);
		}
		persistTimerRef.current = setTimeout(() => {
			persistTimerRef.current = null;
			saveTweakParams(p);
		}, PERSIST_DEBOUNCE_MS);
	}, []);

	useEffect(() => {
		return () => {
			if (persistTimerRef.current !== null) {
				clearTimeout(persistTimerRef.current);
			}
			// tweakParamsRef は Tweakpane が書き込む params オブジェクト（DOM ではない）。アンマウント時の最新を保存。
			// eslint-disable-next-line react-hooks/exhaustive-deps -- 上記
			saveTweakParams(tweakParamsRef.current);
		};
	}, []);

	const [list, setList] = useState(() =>
		buildListFromParams(initialParams),
	);

	const syncAppliedGridLayout = useCallback((p: RectsTweakParams) => {
		appliedGridLayoutRef.current = {
			rows: p.grid.rows,
			cols: p.grid.cols,
			cellFillPercent: p.grid.cellFillPercent,
			gridRandomMode: p.grid.gridRandomMode,
		};
		setAppliedGridRows(p.grid.rows);
		setAppliedGridCols(p.grid.cols);
	}, []);

	const syncReactStateFromParams = useCallback(
		(p: RectsTweakParams) => {
			normalizeTweakParamsInPlace(p);
			schedulePersistTweakParams(p);
			setGeneratorMode(p.generatorMode);
			setRectsWrapperHeightPct(p.rects.wrapperHeightPct);
			setRectsItemRounded100Pct(p.rects.itemRounded100Pct);
			setGridItemRounded100Pct(p.grid.itemRounded100Pct);
			setOutputMode(p.rects.outputMode);
			setSvgMarkupVariant(p.svgMarkupVariant);
			setGridShapeId(p.grid.shapeId);
			setShowGridLines(p.grid.showGridLines);
			setGridStrokeWidth(p.grid.strokeWidth);
			setGridShapeRotationDeg(p.grid.shapeRotationDeg);
		},
		[schedulePersistTweakParams],
	);

	const flushSyncFromTweak = useCallback(() => {
		const p = tweakParamsRef.current;
		const prevMode = generatorMode;
		syncReactStateFromParams(p);
		if (p.generatorMode === "grid") {
			if (prevMode === "rects") {
				syncAppliedGridLayout(p);
				setList(buildListFromParams(p));
			} else {
				const curLayout = appliedGridLayoutRef.current;
				const nextLayout = {
					rows: p.grid.rows,
					cols: p.grid.cols,
					cellFillPercent: p.grid.cellFillPercent,
					gridRandomMode: p.grid.gridRandomMode,
				};
				if (!sameGridLayoutSnapshot(curLayout, nextLayout)) {
					syncAppliedGridLayout(p);
					setList(buildListFromParams(p));
				}
			}
		} else if (p.generatorMode === "rects" && prevMode === "grid") {
			setList(buildListFromParams(p));
			syncAppliedGridLayout(p);
		}
	}, [
		generatorMode,
		syncAppliedGridLayout,
		syncReactStateFromParams,
	]);

	const again = useCallback(() => {
		const p = tweakParamsRef.current;
		syncReactStateFromParams(p);
		const nextList = buildListFromParams(p);
		setList(nextList);
		syncAppliedGridLayout(p);
		if (p.generatorMode === "grid") {
			setCopyMarkupText(
				computeCopyMarkupText({
					generatorMode: "grid",
					effectiveOutputMode: "svg",
					svgMarkupVariant: p.svgMarkupVariant,
					list: nextList,
					rectsItemRounded100Pct: p.rects.itemRounded100Pct,
					rectsWrapperHeightPct: p.rects.wrapperHeightPct,
					appliedGridRows: p.grid.rows,
					appliedGridCols: p.grid.cols,
					gridShapeId: p.grid.shapeId,
					gridItemRounded100Pct: p.grid.itemRounded100Pct,
					gridStrokeWidth: p.grid.strokeWidth,
					gridShapeRotationDeg: p.grid.shapeRotationDeg,
				}),
			);
		}
	}, [syncAppliedGridLayout, syncReactStateFromParams]);

	const setSvgMarkupVariantAndPersist = useCallback(
		(next: SvgMarkupVariant) => {
			const p = tweakParamsRef.current;
			p.svgMarkupVariant = next;
			normalizeTweakParamsInPlace(p);
			saveTweakParams(p);
			setSvgMarkupVariant(p.svgMarkupVariant);
		},
		[],
	);

	const gridViewBoxHeight = useMemo(
		() => gridViewBoxHeightForSquareCells(appliedGridRows, appliedGridCols),
		[appliedGridCols, appliedGridRows],
	);
	const previewWrapperHeightPct =
		generatorMode === "grid"
			? gridViewBoxHeight
			: clampWrapperHeightPct(rectsWrapperHeightPct);
	const effectiveOutputMode: RectsOutputMode =
		generatorMode === "grid" ? "svg" : outputMode;

	const [copyMarkupText, setCopyMarkupText] = useState(() =>
		computeCopyMarkupText({
			generatorMode: initialParams.generatorMode,
			effectiveOutputMode:
				initialParams.generatorMode === "grid"
					? "svg"
					: initialParams.rects.outputMode,
			svgMarkupVariant: initialParams.svgMarkupVariant,
			list: buildListFromParams(initialParams),
			rectsItemRounded100Pct: initialParams.rects.itemRounded100Pct,
			rectsWrapperHeightPct: initialParams.rects.wrapperHeightPct,
			appliedGridRows: initialParams.grid.rows,
			appliedGridCols: initialParams.grid.cols,
			gridShapeId: initialParams.grid.shapeId,
			gridItemRounded100Pct: initialParams.grid.itemRounded100Pct,
			gridStrokeWidth: initialParams.grid.strokeWidth,
			gridShapeRotationDeg: initialParams.grid.shapeRotationDeg,
		}),
	);
	const [copyFeedback, setCopyFeedback] = useState<"idle" | "ok" | "err">(
		"idle",
	);

	const refreshGridCopyMarkup = useCallback(() => {
		if (generatorMode !== "grid") return;
		setCopyMarkupText(
			computeCopyMarkupText({
				generatorMode,
				effectiveOutputMode,
				svgMarkupVariant,
				list,
				rectsItemRounded100Pct,
				rectsWrapperHeightPct,
				appliedGridRows,
				appliedGridCols,
				gridShapeId,
				gridItemRounded100Pct,
				gridStrokeWidth,
				gridShapeRotationDeg,
			}),
		);
	}, [
		appliedGridCols,
		appliedGridRows,
		effectiveOutputMode,
		generatorMode,
		gridItemRounded100Pct,
		gridShapeId,
		gridShapeRotationDeg,
		gridStrokeWidth,
		list,
		rectsItemRounded100Pct,
		rectsWrapperHeightPct,
		svgMarkupVariant,
	]);

	const copyMarkupToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(copyMarkupText);
			setCopyFeedback("ok");
			window.setTimeout(() => setCopyFeedback("idle"), 2000);
		} catch {
			setCopyFeedback("err");
			window.setTimeout(() => setCopyFeedback("idle"), 3000);
		}
	}, [copyMarkupText]);

	useRectsTweakpane(
		tweakpaneContainerRef,
		tweakParamsRef,
		flushSyncFromTweak,
		again,
	);

	const [copyMarkupPending, setCopyMarkupPending] = useState(false);

	/** Rects タブ: パラメータ変更に合わせてコピー用 `<pre>` をデバウンス付きで自動更新 */
	useEffect(() => {
		if (generatorMode !== "rects") return;
		if (skipInitialRectCopyDebounceRef.current) {
			skipInitialRectCopyDebounceRef.current = false;
			return;
		}
		setCopyMarkupPending(true);
		const id = setTimeout(() => {
			setCopyMarkupText(
				computeCopyMarkupText({
					generatorMode,
					effectiveOutputMode,
					svgMarkupVariant,
					list,
					rectsItemRounded100Pct,
					rectsWrapperHeightPct,
					appliedGridRows,
					appliedGridCols,
					gridShapeId,
					gridItemRounded100Pct,
					gridStrokeWidth,
					gridShapeRotationDeg,
				}),
			);
			setCopyMarkupPending(false);
		}, COPY_MARKUP_DEBOUNCE_MS);
		return () => {
			clearTimeout(id);
		};
	}, [
		appliedGridCols,
		appliedGridRows,
		effectiveOutputMode,
		generatorMode,
		gridItemRounded100Pct,
		gridShapeId,
		gridShapeRotationDeg,
		gridStrokeWidth,
		list,
		rectsItemRounded100Pct,
		rectsWrapperHeightPct,
		svgMarkupVariant,
	]);

	/** Grid タブへ切り替えたときだけコピー用 `<pre>` を現在状態で同期（スライダー操作では自動更新しない） */
	useEffect(() => {
		if (generatorMode !== "grid") return;
		setCopyMarkupText(
			computeCopyMarkupText({
				generatorMode,
				effectiveOutputMode,
				svgMarkupVariant,
				list,
				rectsItemRounded100Pct,
				rectsWrapperHeightPct,
				appliedGridRows,
				appliedGridCols,
				gridShapeId,
				gridItemRounded100Pct,
				gridStrokeWidth,
				gridShapeRotationDeg,
			}),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Grid は generatorMode 切替時のみ
	}, [generatorMode]);

	const wrapperStyle = useMemo(() => {
		if (generatorMode === "grid") {
			/** セル正方形のとき外枠のアスペクト比は cols : rows（幅:高さ） */
			return {
				aspectRatio: `${appliedGridCols} / ${appliedGridRows}` as const,
			};
		}
		const x = clampWrapperHeightPct(rectsWrapperHeightPct);
		return { aspectRatio: `100 / ${x}` } as const;
	}, [
		appliedGridCols,
		appliedGridRows,
		generatorMode,
		rectsWrapperHeightPct,
	]);
	const gridLines = useMemo(
		() =>
			generatorMode === "grid" && showGridLines
				? buildRandomGridLines({
						rows: appliedGridRows,
						cols: appliedGridCols,
					})
				: [],
		[appliedGridCols, appliedGridRows, generatorMode, showGridLines],
	);
	const isSvgPathMarkup =
		generatorMode === "rects" &&
		outputMode === "svg" &&
		svgMarkupVariant === "path";
	const isSvgPreview = effectiveOutputMode === "svg";
	const gridUsesPath =
		generatorMode === "grid" && gridShapeUsesPath(gridShapeId);
	const gridUsesPlusLines =
		generatorMode === "grid" && gridShapeUsesPlusLines(gridShapeId);

	useClientRuntime();
	return (
		<>
			<header
				id="Header"
				className="Header pointer-events-none  [--innerBG:unset] [--head:120px] [--innerPX:0px] [--logoPX:--PX]"
			>
				<div className="HeaderInner items-start ">
					<div className="HeaderLogo Eng [--logoW:180px] dswh min-h-[--head] pointer-events-auto">
						<Link to="/">Brand Name</Link>
					</div>
					<div className="HeaderItems fix-tab pointer-events-auto">
						<div
							ref={tweakpaneContainerRef}
							className=" max-md:text-xs max-w-1/2 [&_.tp-dfwv]:max-w-full max-h-[100lvh] overflow-y-auto"
						/>
					</div>
				</div>
			</header>
			<main className=" bg-[--BC]   py-[--head] [--MY:1em] overflow-hidden [--head:120px] [--wid:100%]">
				<h1 className="mx-auto  h2FZ relative z-10 ">
					{generatorMode === "grid"
						? "Random Grid Generator"
						: "Random Rects Generator"}
					&nbsp;
				</h1>
				<span className="text-sm budoux">
					{generatorMode === "grid"
						? "SVG 専用です。セルは常に正方形（viewBox 高さは 100×行÷列）。スニペットはボタンで更新します。"
						: "いいバランスの時にコピーしてそのまま使う為の物です。left/top は中心。幅は%、高さはアスペクト比。重なる場合は数回リトライ失敗で中止。"}
				</span>

				<div
					className={
						isSvgPreview
							? SVG_RANDOM_RECTS_WRAP_CLASS
							: RANDOM_RECTS_WRAP_CLASS
					}
					style={wrapperStyle}
				>
					{isSvgPreview ? (
						<svg
							className={
								generatorMode === "grid"
									? "GeneratedShapes GeneratedSvg absolute inset-0 h-full w-full"
									: "GeneratedSvg absolute inset-0 h-full w-full"
							}
							style={
								generatorMode === "grid"
									? ({
											["--GSR" as string]: `${clampGridShapeRotationDeg(gridShapeRotationDeg)}deg`,
										} as CSSProperties)
									: undefined
							}
							fill={
								generatorMode === "grid"
									? gridUsesPlusLines
										? "none"
										: "var(--GR50)"
									: "var(--GR50)"
							}
							viewBox={`0 0 100 ${previewWrapperHeightPct}`}
							preserveAspectRatio="none"
							aria-hidden
						>
							{generatorMode === "grid" ? (
								<>
									{/* プレビューのみ：Grid 線は g に stroke を集約（コピー用 SVG には含めない） */}
									{gridLines.length > 0 ? (
										<g
											stroke="var(--GR50)"
											strokeWidth={GRID_LINE_STROKE_WIDTH}
											strokeDasharray="3 3"
										>
											{gridLines.map((line, index) => (
												<line
													key={`${line.x1}-${line.y1}-${index}`}
													x1={line.x1}
													y1={line.y1}
													x2={line.x2}
													y2={line.y2}
													vectorEffect="non-scaling-stroke"
												/>
											))}
										</g>
									) : null}
									{gridUsesPlusLines
										? list.map((r, i) => {
												const key = `${r.left}-${r.top}-${r.width}-${i}`;
												const box = rectToGridBox(
													r,
													previewWrapperHeightPct,
												);
												const cx = box.cx;
												const cy = box.cy;
												const half = box.size * 0.42;
												return [
													<line
														key={`${key}-v`}
														stroke="var(--TC)"
														strokeWidth={
															gridStrokeWidth
														}
														strokeLinecap="round"
														x1={cx}
														y1={cy - half}
														x2={cx}
														y2={cy + half}
														vectorEffect="non-scaling-stroke"
													/>,
													<line
														key={`${key}-h`}
														stroke="var(--TC)"
														strokeWidth={
															gridStrokeWidth
														}
														strokeLinecap="round"
														x1={cx - half}
														y1={cy}
														x2={cx + half}
														y2={cy}
														vectorEffect="non-scaling-stroke"
													/>,
												];
											})
										: list.map((r, i) => {
												const key = `${r.left}-${r.top}-${r.width}-${i}`;
												const box = rectToGridBox(
													r,
													previewWrapperHeightPct,
												);
												if (gridUsesPath) {
													return (
														<path
															key={key}
															d={gridShapePathD(
																gridShapeId,
																box,
																gridItemRounded100Pct,
															)}
														/>
													);
												}
												if (gridItemRounded100Pct) {
													return (
														<circle
															key={key}
															cx={box.cx}
															cy={box.cy}
															r={box.r}
														/>
													);
												}
												return (
													<rect
														key={key}
														x={box.x}
														y={box.y}
														width={box.size}
														height={box.size}
													/>
												);
											})}
								</>
							) : (
								list.map((r, i) => {
									const key = `${r.left}-${r.top}-${r.width}-${r.aspectRatio[0]}-${r.aspectRatio[1]}-${i}`;
									if (isSvgPathMarkup) {
										return (
											<path
												key={key}
												d={rectToSvgPathD(
													r,
													rectsItemRounded100Pct,
													previewWrapperHeightPct,
												)}
											/>
										);
									}
									const g = rectToSvgGeometry(
										r,
										previewWrapperHeightPct,
									);
									if (rectsItemRounded100Pct) {
										if (
											r.aspectRatio[0] ===
											r.aspectRatio[1]
										) {
											return (
												<circle
													key={key}
													cx={g.cx}
													cy={g.cy}
													r={g.rx}
												/>
											);
										}
										return (
											<ellipse
												key={key}
												cx={g.cx}
												cy={g.cy}
												rx={g.rx}
												ry={g.ry}
											/>
										);
									}
									return (
										<rect
											key={key}
											x={g.x}
											y={g.y}
											width={g.width}
											height={g.height}
										/>
									);
								})
							)}
						</svg>
					) : (
						list.map((r, i) => (
							<div
								key={`${r.left}-${r.top}-${r.width}-${r.aspectRatio[0]}-${r.aspectRatio[1]}-${i}`}
								className={
									rectsItemRounded100Pct
										? `item bg-[--GR50] ${RECT_ITEM_ROUNDED_100_CLASS}`
										: "item bg-[--GR50]"
								}
								style={rectPreviewStyle(r)}
							/>
						))
					)}
				</div>

				<Toggle className="bg-[--WH] mt-8">
					<ToggleSummary>
						{generatorMode === "grid"
							? `Grid SVG（viewBox 0 0 ${GRID_VIEWBOX_WIDTH} ${fmtPct(previewWrapperHeightPct)}）`
							: outputMode === "svg"
								? `${isSvgPathMarkup ? "SVG Path" : "SVG"}（viewBox 0 0 100 ${clampWrapperHeightPct(rectsWrapperHeightPct)}）`
								: "HTML（CustomClass設定済み）"}
					</ToggleSummary>
					<ToggleBody>
						{generatorMode === "rects" ? (
							<div className="mt-3 flex flex-wrap items-center gap-2">
								{outputMode === "svg" ? (
									<button
										type="button"
										role="switch"
										aria-checked={
											svgMarkupVariant === "path"
										}
										onClick={() =>
											setSvgMarkupVariantAndPersist(
												svgMarkupVariant === "path"
													? "primitives"
													: "path",
											)
										}
										className={`btn min-w-0  px-2 py-0.5 ${svgMarkupVariant === "path" ? "ring-1 ring-[--TC] ring-offset-1 ring-offset-[--WH]" : "opacity-60"}`}
									>
										path
									</button>
								) : null}
								<button
									type="button"
									onClick={copyMarkupToClipboard}
									className="btn min-w-0 inline-flex items-center justify-center text-xs px-2 py-0.5"
									aria-label="クリップボードにコピー"
								>
									<CopyIcon
										className="size-4 shrink-0"
										aria-hidden
									/>
								</button>
								{copyFeedback === "ok" ? (
									<span
										className="text-xs text-green-700"
										aria-live="polite"
									>
										コピーしました
									</span>
								) : null}
								{copyFeedback === "err" ? (
									<span
										className="text-xs text-red-600"
										aria-live="polite"
									>
										コピーに失敗しました
									</span>
								) : null}
							</div>
						) : null}
						{generatorMode === "grid" ? (
							<>
								<p className="text-sm text-neutral-600">
									{gridUsesPlusLines
										? "<!--grid タブは SVG 専用です。plus は縦横 2 本の line（stroke: --TC）です。-->"
										: gridUsesPath
											? "<!--grid タブは SVG 専用です。triangle / star は path 要素で出力します。-->"
											: gridItemRounded100Pct
												? "<!--grid タブは SVG 専用です。rect は circle 要素として出力します。-->"
												: "<!--grid タブは SVG 専用です。rect は rect 要素として出力します。-->"}
								</p>
								<div className="mt-3 flex flex-wrap items-center gap-2">
									<button
										type="button"
										onClick={refreshGridCopyMarkup}
										className="btn min-w-0 inline-flex items-center justify-center gap-1 text-xs px-2 py-0.5"
										aria-label="コピー用コードを更新"
									>
										更新
										<ArrowClockwiseIcon
											className="size-4 shrink-0"
											aria-hidden
										/>
									</button>
									<button
										type="button"
										onClick={copyMarkupToClipboard}
										className="btn min-w-0 text-xs px-2 py-0.5"
										aria-label="クリップボードにコピー"
									>
										<CopyIcon
											className="size-4 shrink-0"
											aria-hidden
										/>
									</button>
									{copyFeedback === "ok" ? (
										<span
											className="text-xs text-green-700"
											aria-live="polite"
										>
											コピーしました
										</span>
									) : null}
									{copyFeedback === "err" ? (
										<span
											className="text-xs text-red-600"
											aria-live="polite"
										>
											コピーに失敗しました
										</span>
									) : null}
								</div>
							</>
						) : null}
						{isSvgPathMarkup ? (
							<p className="mt-3 text-sm text-neutral-600">
								プレビューと出力文字列の両方を `path`
								要素で再構成しています。
							</p>
						) : null}
						{copyMarkupPending && generatorMode === "rects" ? (
							<p
								className="mt-3 text-xs text-neutral-500"
								aria-live="polite"
							>
								コピー用文字列を再計算中です（大量セルでは数秒かかることがあります）。
							</p>
						) : null}
						<pre
							className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-neutral-700"
							aria-busy={
								copyMarkupPending && generatorMode === "rects"
							}
						>
							{copyMarkupText}
						</pre>
					</ToggleBody>
				</Toggle>
			</main>
			<Footer />
		</>
	);
}

export default Rects;
