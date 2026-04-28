import {
	useCallback,
	useEffect,
	useReducer,
	useRef,
	useState,
	type MouseEvent as ReactMouseEvent,
	type PointerEvent as ReactPointerEvent,
} from "react";
import { PageRoot } from "../components/PageRoot";
import { useClientRuntime } from "../hooks/useClientRuntime";
import {
	redrawAnnotatorCanvas,
	resolveAnnotatorCanvasColors,
	syncAnnotatorCanvasLayout,
} from "../lib/annotatorCanvas";
import { HISTORY_MAX, MIN_BOX } from "../lib/annotatorConstants";
import {
	clampAllChildren,
	clampBox,
	childAbs,
	clampChildInParent,
	clampChildTranslateInParent,
	cursorForHandle,
	findBoxById,
	ensureParentBounds,
	getPrimarySelectedChildAbs,
	handleAt,
	hitTestChildAbs,
	nextChildLabel,
	parentAbsRect,
	pointInParent,
	snapVal,
} from "../lib/annotatorGeometry";
import { formatOutputText } from "../lib/annotatorOutput";
import {
	takeAnnotatorSnapshot,
} from "../lib/annotatorSnapshot";
import type { AnnotatorGroup, AnnotatorRect } from "../lib/annotatorTypes";
import BboxSidebar from "./Bbox/BboxSidebar";
import BboxStage from "./Bbox/BboxStage";
import BboxToolbar from "./Bbox/BboxToolbar";
import {
	applySnapshotToMutable,
	createInitialMutableState,
	type DragStartGroupMove,
	type DragStartResize,
	IMAGE_INPUT_ACCEPT,
	initialParentHeightPx,
	isSelectableImageFile,
	type MutableState,
	shouldIgnoreGlobalAnnotatorShortcuts,
} from "./Bbox/bboxPageModel";
import { rootClasses } from "./Bbox/bboxRootClasses";
import { BBOX_DEMO_IMAGE_SRC, seedBboxDemoLayout } from "./Bbox/bboxDemoSeed";
import {
	clearPendingParentDraftStorage,
	readPendingParentDraftStorage,
} from "./Bbox/bboxPendingParentDraft";
import {
	blobToBase64Png,
	postBboxLocalBatchExport,
} from "./Bbox/bboxLocalBatchApi";
import { captureParentRegionToPngBlob } from "./Bbox/bboxParentRegionCapture";

/** 開発サーバーのみローカル出力可能（本番ビルドでは UI のみ）。 */
const BBOX_LOCAL_BATCH_EXPORT_ENABLED = import.meta.env.DEV;

/** サイドバー幅（ドラッグで変更・localStorage に保存）。最大はメイン行の 50% とステージ最小幅の両方を満たす値。 */
const BBOX_SIDEBAR_WIDTH_LS_KEY = "bbox-sidebar-width-px";
const BBOX_SIDEBAR_W_DEFAULT = 340;
const BBOX_SIDEBAR_W_MIN = 220;
const BBOX_STAGE_COL_MIN_PX = 160;

/** メイン行幅に対するサイドバー上限（px）：50% と「ステージ最小幅」を確保できる幅の小さい方 */
function bboxMaxSidebarPxForMainRow(mainRowWidthPx: number): number {
	if (!Number.isFinite(mainRowWidthPx) || mainRowWidthPx <= 0) return BBOX_SIDEBAR_W_DEFAULT;
	return Math.min(
		Math.floor(mainRowWidthPx * 0.5),
		Math.max(0, mainRowWidthPx - BBOX_STAGE_COL_MIN_PX),
	);
}

function clampBboxSidebarWidthPx(w: number, containerWidth?: number): number {
	const v = Math.round(w);
	if (containerWidth == null || !Number.isFinite(containerWidth) || containerWidth <= 0) {
		return Math.max(BBOX_SIDEBAR_W_MIN, v);
	}
	const maxSidebar = bboxMaxSidebarPxForMainRow(containerWidth);
	const lo = Math.min(BBOX_SIDEBAR_W_MIN, maxSidebar);
	const hi = maxSidebar;
	return Math.max(lo, Math.min(v, hi));
}

function readInitialBboxSidebarWidthPx(): number {
	if (typeof window === "undefined") return BBOX_SIDEBAR_W_DEFAULT;
	const vp = window.innerWidth;
	try {
		const raw = localStorage.getItem(BBOX_SIDEBAR_WIDTH_LS_KEY);
		if (raw == null) {
			return clampBboxSidebarWidthPx(BBOX_SIDEBAR_W_DEFAULT, vp);
		}
		const n = Number.parseInt(raw, 10);
		if (!Number.isFinite(n)) {
			return clampBboxSidebarWidthPx(BBOX_SIDEBAR_W_DEFAULT, vp);
		}
		return clampBboxSidebarWidthPx(n, vp);
	} catch {
		return clampBboxSidebarWidthPx(BBOX_SIDEBAR_W_DEFAULT, vp);
	}
}

/** TWonly の BBox 注釈ページ。ロジックは本ファイル・UI は `./Bbox/*` に分割 */

export default function Bbox() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	const stateRef = useRef<MutableState>(createInitialMutableState());
	const [renderGen, bump] = useReducer((n: number) => n + 1, 0);

	const imgRef = useRef<HTMLImageElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const groupTreeRef = useRef<HTMLDivElement>(null);
	const mainRowRef = useRef<HTMLElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const labelBlurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const copyFlashResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [imgUrl, setImgUrl] = useState<string | null>(
		() => BBOX_DEMO_IMAGE_SRC,
	);
	const [labelDraft, setLabelDraft] = useState("");
	const [copyFlash, setCopyFlash] = useState(false);
	const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
	const [sidebarWidthPx, setSidebarWidthPx] = useState(
		readInitialBboxSidebarWidthPx,
	);
	const [mainRowInnerWidthPx, setMainRowInnerWidthPx] = useState<number>(() =>
		typeof window !== "undefined" ? window.innerWidth : 1200,
	);

	const sidebarResizeRef = useRef<{
		readonly startX: number;
		readonly startW: number;
	} | null>(null);
	const sidebarResizeActiveRef = useRef(false);
	const latestSidebarPxRef = useRef(BBOX_SIDEBAR_W_DEFAULT);

	const prevParentDraftNumRef = useRef<number | null | undefined>(undefined);

	useClientRuntime({ rootRef: pageRootRef });

	useEffect(() => {
		const el = mainRowRef.current;
		if (!el) return;
		const sync = () => {
			const w = el.getBoundingClientRect().width;
			setMainRowInnerWidthPx(w);
			setSidebarWidthPx((prev) => clampBboxSidebarWidthPx(prev, w));
		};
		sync();
		const ro = new ResizeObserver(sync);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const st = stateRef.current;

	latestSidebarPxRef.current = sidebarWidthPx;

	useEffect(() => {
		const cur = stateRef.current.parentDraftNum;
		const prev = prevParentDraftNumRef.current;
		if (prev !== undefined && prev !== null && cur === null) {
			clearPendingParentDraftStorage();
		}
		prevParentDraftNumRef.current = cur;
	}, [renderGen]);

	const redraw = useCallback(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		const root = pageRootRef.current;
		if (!canvas || !ctx || !root) return;
		const s = stateRef.current;
		redrawAnnotatorCanvas({
			ctx,
			canvasW: canvas.width,
			canvasH: canvas.height,
			groups: s.groups,
			activeGroupId: s.activeGroupId,
			selectedBoxIds: s.selectedBoxIds,
			interactionMode: s.interactionMode,
			columns: s.columns,
			currentRect: s.currentRect,
			colors: resolveAnnotatorCanvasColors(root),
		});
	}, []);

	const updateStageCursor = useCallback((px: number, py: number) => {
		const stage = stageRef.current;
		const s = stateRef.current;
		if (!stage) return;
		if (!s.hasImage) {
			stage.style.cursor = "default";
			return;
		}
		if (s.parentDraftNum != null) {
			stage.style.cursor = "crosshair";
			return;
		}
		if (s.drawing) {
			stage.style.cursor = "crosshair";
			return;
		}
		if (s.dragMode === "groupMove" || s.dragMode === "move") {
			stage.style.cursor = "grabbing";
			return;
		}
		if (s.dragMode === "parentResize" || s.dragMode === "resize") {
			stage.style.cursor =
				cursorForHandle(s.dragHandle) || "default";
			return;
		}

		const gAct = s.activeGroupId
			? s.groups.find((x) => x.id === s.activeGroupId)
			: null;

		if (s.interactionMode === "parent" && gAct) {
			const pr = parentAbsRect(gAct);
			const hc = handleAt(px, py, pr);
			const c = cursorForHandle(hc);
			if (c) {
				stage.style.cursor = c;
				return;
			}
			if (pointInParent(gAct, px, py)) {
				stage.style.cursor = "move";
				return;
			}
		}

		if (s.interactionMode === "child" && gAct) {
			const prim = getPrimarySelectedChildAbs(
				s.groups,
				s.interactionMode,
				s.selectedBoxIds,
			);
			if (prim) {
				const hc = handleAt(px, py, prim.abs);
				const c = cursorForHandle(hc);
				if (c) {
					stage.style.cursor = c;
					return;
				}
			}
			if (hitTestChildAbs(s.groups, px, py, null)) {
				stage.style.cursor = "pointer";
				return;
			}
		}

		if (
			s.interactionMode === "drawChild" &&
			gAct &&
			pointInParent(gAct, px, py)
		) {
			stage.style.cursor = "crosshair";
			return;
		}

		stage.style.cursor = "default";
	}, []);

	const updateUndoRedoUi = useCallback(() => {
		bump();
	}, [bump]);

	const pushHistory = useCallback(() => {
		const s = stateRef.current;
		if (s.historySuspended) return;
		const snap = takeAnnotatorSnapshot(
			s.groups,
			s.activeGroupId,
			s.selectedBoxIds,
			s.interactionMode,
			s.parentDraftNum,
			s.nextGroupId,
			s.nextBoxId,
		);
		if (s.historyIndex < s.history.length - 1)
			s.history = s.history.slice(0, s.historyIndex + 1);
		s.history.push(snap);
		if (s.history.length > HISTORY_MAX) s.history.shift();
		s.historyIndex = s.history.length - 1;
		updateUndoRedoUi();
	}, [updateUndoRedoUi]);

	const initHistory = useCallback(() => {
		const s = stateRef.current;
		s.history = [
			takeAnnotatorSnapshot(
				s.groups,
				s.activeGroupId,
				s.selectedBoxIds,
				s.interactionMode,
				s.parentDraftNum,
				s.nextGroupId,
				s.nextBoxId,
			),
		];
		s.historyIndex = 0;
		updateUndoRedoUi();
	}, [updateUndoRedoUi]);

	const commitAction = useCallback(() => {
		pushHistory();
		requestAnimationFrame(() => redraw());
	}, [pushHistory, redraw]);

	const undo = useCallback(() => {
		const s = stateRef.current;
		if (s.historyIndex <= 0) return;
		s.historySuspended = true;
		s.historyIndex--;
		applySnapshotToMutable(s, s.history[s.historyIndex]);
		s.historySuspended = false;
		s.labelEditTarget = null;
		setEditingGroupId(null);
		bump();
		requestAnimationFrame(() => redraw());
	}, [bump, redraw]);

	const redo = useCallback(() => {
		const s = stateRef.current;
		if (s.historyIndex >= s.history.length - 1) return;
		s.historySuspended = true;
		s.historyIndex++;
		applySnapshotToMutable(s, s.history[s.historyIndex]);
		s.historySuspended = false;
		s.labelEditTarget = null;
		setEditingGroupId(null);
		bump();
		requestAnimationFrame(() => redraw());
	}, [bump, redraw]);

	const syncCanvasSize = useCallback(() => {
		const canvas = canvasRef.current;
		const s = stateRef.current;
		if (!canvas) return;
		syncAnnotatorCanvasLayout({
			canvas,
			hasImage: s.hasImage,
			naturalW: s.naturalW,
			naturalH: s.naturalH,
		});
	}, []);

	const hideLabelEditor = useCallback(() => {
		stateRef.current.labelEditTarget = null;
		setLabelDraft("");
		bump();
	}, [bump]);

	const blurGroupTreeContentEditable = useCallback(() => {
		const ae = document.activeElement;
		if (
			ae &&
			groupTreeRef.current?.contains(ae) &&
			ae instanceof HTMLElement &&
			ae.isContentEditable
		) {
			ae.blur();
		}
	}, []);

	const getPos = useCallback((clientX: number, clientY: number) => {
		const stage = stageRef.current;
		const canvas = canvasRef.current;
		if (!stage || !canvas) return { x: 0, y: 0 };
		const rect = stage.getBoundingClientRect();
		const sw = canvas.width;
		const sh = canvas.height;
		return {
			x: Math.max(0, Math.min(clientX - rect.left, sw)),
			y: Math.max(0, Math.min(clientY - rect.top, sh)),
		};
	}, []);

	useEffect(() => {
		initHistory();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- マウント時のみ
	}, []);

	useEffect(() => {
		return () => {
			if (imgUrl && imgUrl.startsWith("blob:"))
				URL.revokeObjectURL(imgUrl);
		};
	}, [imgUrl]);

	useEffect(() => {
		return () => {
			if (labelBlurTimeoutRef.current != null) {
				clearTimeout(labelBlurTimeoutRef.current);
				labelBlurTimeoutRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		return () => {
			if (copyFlashResetRef.current != null) {
				clearTimeout(copyFlashResetRef.current);
				copyFlashResetRef.current = null;
			}
		};
	}, []);

	const handleCopyOutput = useCallback(async () => {
		const s = stateRef.current;
		const text = formatOutputText(
			s.outputFormat,
			s.groups,
			s.containerW,
			s.naturalW,
			s.naturalH,
		);
		try {
			await navigator.clipboard.writeText(s.groups.length ? text : "");
			setCopyFlash(true);
			if (copyFlashResetRef.current != null)
				clearTimeout(copyFlashResetRef.current);
			copyFlashResetRef.current = window.setTimeout(() => {
				setCopyFlash(false);
				copyFlashResetRef.current = null;
			}, 1200);
		} catch {
			/* Clipboard API 不可時は無視 */
		}
	}, []);

	/** 親BBoxと一致する矩形で画像＋注釈キャンバスを合成し PNG ダウンロードする（ブラウザ描画ベース）。 */
	const handleParentRegionScreenshot = useCallback((groupId: string) => {
		const imgEl = imgRef.current;
		const canv = canvasRef.current;
		const s = stateRef.current;
		const g = s.groups.find((gr) => gr.id === groupId);
		if (!imgEl || !canv || !g || !s.hasImage) return;
		void captureParentRegionToPngBlob(imgEl, canv, g).then((blob) => {
			if (!blob) return;
			const base =
				(g.label || "group")
					.replace(/[<>:"/\\|?*]/g, "_")
					.trim()
					.slice(0, 48) || "group";
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${base}-parent.png`;
			a.click();
			URL.revokeObjectURL(url);
		});
	}, []);

	/** 開発サーバー限定: Copy 相当の md + 各親領域PNGを `src/pages/Bbox/<YYYYMMDDHHmm>/`（日本時間12桁）へ（Vite middleware）。 */
	const handleLocalBatchExport = useCallback(async () => {
		if (!BBOX_LOCAL_BATCH_EXPORT_ENABLED) return;
		const img = imgRef.current;
		const canv = canvasRef.current;
		const s = stateRef.current;
		const text = formatOutputText(
			s.outputFormat,
			s.groups,
			s.containerW,
			s.naturalW,
			s.naturalH,
		);
		const pngs: { filename: string; base64: string }[] = [];
		if (img && canv && s.hasImage && s.groups.length > 0) {
			let i = 0;
			for (const g of s.groups) {
				i += 1;
				const blob = await captureParentRegionToPngBlob(img, canv, g);
				if (!blob) continue;
				const b64 = await blobToBase64Png(blob);
				const base =
					(g.label || "group")
						.replace(/[<>:"/\\|?*]/g, "_")
						.trim()
						.slice(0, 40) || `group-${i}`;
				const filename = `${String(i).padStart(2, "0")}-${base}-parent.png`;
				pngs.push({ filename, base64: b64 });
			}
		}
		const result = await postBboxLocalBatchExport({ md: text, pngs });
		if (result.ok) {
			console.info("[bbox] local batch export:", result.relative);
		} else {
			console.warn("[bbox] local batch export failed:", result.error);
		}
	}, []);

	const positionLabelEditor = useCallback(
		(x: number, y: number, w: number, h: number) => {
			const el = document.getElementById("annotator-label-editor");
			const stage = stageRef.current;
			if (!el || !stage) return;
			const sw = stage.clientWidth;
			const sh = stage.clientHeight;
			const targetW = Math.round(
				Math.min(Math.max(180, w * 0.88), Math.min(340, sw - 16)),
			);
			el.style.width = `${targetW}px`;
			el.style.transform = "translate(-50%, -50%)";
			let cx = x + w / 2;
			let cy = y + h / 2;
			const half = targetW / 2;
			cx = Math.max(half + 8, Math.min(cx, sw - half - 8));
			cy = Math.max(28, Math.min(cy, sh - 28));
			el.style.left = `${cx}px`;
			el.style.top = `${cy}px`;
		},
		[],
	);

	const showLabelEditorForEdit = useCallback(
		(boxId: string) => {
			const s = stateRef.current;
			const found = findBoxById(s.groups, boxId);
			if (!found) return;
			s.labelEditTarget = boxId;
			setLabelDraft(found.box.label);
			const abs = childAbs(found.group, found.box);
			bump();
			requestAnimationFrame(() => {
				positionLabelEditor(abs.x, abs.y, abs.w, abs.h);
				const el = document.getElementById(
					"annotator-label-editor",
				) as HTMLInputElement | null;
				el?.focus();
				el?.select();
			});
		},
		[bump, positionLabelEditor],
	);

	const loadImageFile = useCallback((file: File | undefined) => {
		if (!isSelectableImageFile(file)) return;
		const url = URL.createObjectURL(file!);
		setImgUrl((prev) => {
			if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
			return url;
		});
		const s = stateRef.current;
		const hadImage = s.hasImage;
		s.parentDraftNum = null;
		if (hadImage) clearPendingParentDraftStorage();
		s.selectedBoxIds = [];
		s.interactionMode = "parent";
		s.labelEditTarget = null;
		bump();
	}, [bump]);

	const handleCanvasSectionDragOver = useCallback(
		(e: React.DragEvent<HTMLElement>) => {
			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = "copy";
		},
		[],
	);

	const handleCanvasSectionDrop = useCallback(
		(e: React.DragEvent<HTMLElement>) => {
			e.preventDefault();
			e.stopPropagation();
			loadImageFile(e.dataTransfer.files[0]);
		},
		[loadImageFile],
	);

	const handleToolbarImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			loadImageFile(e.target.files?.[0]);
			e.target.value = "";
		},
		[loadImageFile],
	);

	const onImageLoad = useCallback(() => {
		const img = imgRef.current;
		const s = stateRef.current;
		if (!img) return;
		s.naturalW = img.naturalWidth;
		s.naturalH = img.naturalHeight;
		s.hasImage = true;

		const src = img.currentSrc || img.src || "";
		const isUserBlob = src.startsWith("blob:");

		if (isUserBlob) {
			const ph0 = initialParentHeightPx(s.naturalW, s.naturalH);
			s.groups.forEach((g) => {
				g.boxes = [];
				g.px = 0;
				g.py = 0;
				g.pw = s.naturalW;
				g.ph = ph0;
				g.childSeq = 1;
			});
		} else if (!s.groups.length) {
			seedBboxDemoLayout(s);
		} else {
			s.groups.forEach((g) => {
				ensureParentBounds(g, s.naturalW, s.naturalH);
				clampAllChildren(g);
			});
		}

		s.selectedBoxIds = [];
		s.interactionMode = "parent";

		const restorePending =
			readPendingParentDraftStorage() && Boolean(s.naturalW && s.naturalH);

		s.parentDraftNum = restorePending ? s.nextGroupId : null;
		s.drawing = false;
		s.currentRect = null;
		if (restorePending) {
			s.labelEditTarget = null;
			setLabelDraft("");
		}

		s.historySuspended = true;
		initHistory();
		s.historySuspended = false;
		syncCanvasSize();
		bump();
		requestAnimationFrame(() => redraw());
	}, [initHistory, syncCanvasSize, bump, redraw]);

	const endDragCommit = useCallback(() => {
		const s = stateRef.current;
		if (
			s.dragMode === "move" ||
			s.dragMode === "resize" ||
			s.dragMode === "groupMove" ||
			s.dragMode === "parentResize"
		) {
			s.dragMode = null;
			s.dragHandle = null;
			s.dragStart = null;
			s.dragBoxesSnapshot = null;
			s.dragParent0 = null;
			commitAction();
		}
	}, [commitAction]);

	useEffect(() => {
		const onMove = (e: MouseEvent) => {
			const s = stateRef.current;
			if (!s.hasImage) return;
			const p = getPos(e.clientX, e.clientY);
			const px = snapVal(p.x, s.snapSize);
			const py = snapVal(p.y, s.snapSize);
			const canvas = canvasRef.current;
			if (!canvas) return;
			const sw = canvas.width;
			const sh = canvas.height;
			const gAct = s.activeGroupId
				? s.groups.find((x) => x.id === s.activeGroupId)
				: null;

			if (s.dragMode === "groupMove" && s.dragStart && "groupId" in s.dragStart) {
				const ds = s.dragStart as DragStartGroupMove;
				const g = s.groups.find((x) => x.id === ds.groupId);
				if (!g) {
					updateStageCursor(px, py);
					return;
				}
				const dx = px - ds.x;
				const dy = py - ds.y;
				let npx = snapVal(ds.px0 + dx, s.snapSize);
				let npy = snapVal(ds.py0 + dy, s.snapSize);
				npx = Math.max(0, Math.min(npx, sw - g.pw));
				npy = Math.max(0, Math.min(npy, sh - g.ph));
				g.px = npx;
				g.py = npy;
				redraw();
				updateStageCursor(px, py);
				return;
			}

			if (
				s.dragMode === "parentResize" &&
				s.dragStart &&
				s.dragHandle &&
				s.dragParent0
			) {
				const g = s.groups.find((x) => x.id === s.activeGroupId);
				if (!g) {
					updateStageCursor(px, py);
					return;
				}
				let x0 = s.dragParent0.px;
				let y0 = s.dragParent0.py;
				let x1 = s.dragParent0.px + s.dragParent0.pw;
				let y1 = s.dragParent0.py + s.dragParent0.ph;
				const h = s.dragHandle;
				if (h === "e" || h === "ne" || h === "se") x1 = px;
				if (h === "w" || h === "nw" || h === "sw") x0 = px;
				if (h === "s" || h === "se" || h === "sw") y1 = py;
				if (h === "n" || h === "ne" || h === "nw") y0 = py;
				x0 = snapVal(x0, s.snapSize);
				x1 = snapVal(x1, s.snapSize);
				y0 = snapVal(y0, s.snapSize);
				y1 = snapVal(y1, s.snapSize);
				const rx = Math.min(x0, x1);
				const ry = Math.min(y0, y1);
				const rw = Math.abs(x1 - x0);
				const rh = Math.abs(y1 - y0);
				const c = clampBox({ x: rx, y: ry, w: rw, h: rh }, sw, sh);
				g.px = c.x;
				g.py = c.y;
				g.pw = c.w;
				g.ph = c.h;
				clampAllChildren(g);
				redraw();
				updateStageCursor(px, py);
				return;
			}

			if (s.dragMode === "move" && s.dragStart && s.dragBoxesSnapshot) {
				const ds = s.dragStart;
				const dx = px - ds.x;
				const dy = py - ds.y;
				s.selectedBoxIds.forEach((sid) => {
					const f = findBoxById(s.groups, sid);
					const snap0 = s.dragBoxesSnapshot![sid];
					if (!f || !snap0) return;
					f.box.x = snapVal(snap0.x + dx, s.snapSize);
					f.box.y = snapVal(snap0.y + dy, s.snapSize);
					clampChildTranslateInParent(f.group, f.box);
				});
				redraw();
				updateStageCursor(px, py);
				return;
			}

			if (
				s.dragMode === "resize" &&
				s.dragStart &&
				s.dragHandle &&
				"boxRel" in s.dragStart
			) {
				const b0 = (s.dragStart as DragStartResize).boxRel;
				const prim = getPrimarySelectedChildAbs(
					s.groups,
					s.interactionMode,
					s.selectedBoxIds,
				);
				if (!prim) {
					updateStageCursor(px, py);
					return;
				}
				const G = prim.group;
				let x0 = b0.x;
				let y0 = b0.y;
				let x1 = b0.x + b0.w;
				let y1 = b0.y + b0.h;
				const rx = px - G.px;
				const ry = py - G.py;
				const h = s.dragHandle;
				if (h === "e" || h === "ne" || h === "se") x1 = rx;
				if (h === "w" || h === "nw" || h === "sw") x0 = rx;
				if (h === "s" || h === "se" || h === "sw") y1 = ry;
				if (h === "n" || h === "ne" || h === "nw") y0 = ry;
				x0 = snapVal(x0, s.snapSize);
				x1 = snapVal(x1, s.snapSize);
				y0 = snapVal(y0, s.snapSize);
				y1 = snapVal(y1, s.snapSize);
				const rx0 = Math.min(x0, x1);
				const ry0 = Math.min(y0, y1);
				const rw = Math.abs(x1 - x0);
				const rh = Math.abs(y1 - y0);
				const c = clampBox({ x: rx0, y: ry0, w: rw, h: rh }, G.pw, G.ph);
				Object.assign(prim.box, c);
				redraw();
				updateStageCursor(px, py);
				return;
			}

			if (!s.drawing) {
				updateStageCursor(px, py);
				return;
			}

			const x2 = px;
			const y2 = py;
			let r: AnnotatorRect = {
				x: Math.min(s.startX, x2),
				y: Math.min(s.startY, y2),
				w: Math.abs(x2 - s.startX),
				h: Math.abs(y2 - s.startY),
			};
			if (s.interactionMode === "drawChild" && gAct) {
				const ix = Math.max(r.x, gAct.px);
				const iy = Math.max(r.y, gAct.py);
				const ix2 = Math.min(r.x + r.w, gAct.px + gAct.pw);
				const iy2 = Math.min(r.y + r.h, gAct.py + gAct.ph);
				r = { x: ix, y: iy, w: Math.max(0, ix2 - ix), h: Math.max(0, iy2 - iy) };
			} else if (s.parentDraftNum != null) {
				r = clampBox(
					{
						x: r.x,
						y: r.y,
						w: Math.max(MIN_BOX, r.w),
						h: Math.max(MIN_BOX, r.h),
					},
					sw,
					sh,
				);
			}
			s.currentRect = r;
			redraw();
			updateStageCursor(px, py);
		};

		const onUp = () => {
			const s = stateRef.current;
			if (!s.hasImage) return;
			if (s.dragMode) {
				endDragCommit();
				return;
			}
			if (!s.drawing) return;
			s.drawing = false;
			const canvas = canvasRef.current;
			if (!canvas) return;
			const sw = canvas.width;
			const sh = canvas.height;

			if (s.parentDraftNum != null) {
				if (s.currentRect && s.currentRect.w > MIN_BOX && s.currentRect.h > MIN_BOX) {
					const c = clampBox(
						{
							x: snapVal(s.currentRect.x, s.snapSize),
							y: snapVal(s.currentRect.y, s.snapSize),
							w: Math.max(MIN_BOX, snapVal(s.currentRect.w, s.snapSize)),
							h: Math.max(MIN_BOX, snapVal(s.currentRect.h, s.snapSize)),
						},
						sw,
						sh,
					);
					const n = s.parentDraftNum;
					s.parentDraftNum = null;
					const g: AnnotatorGroup = {
						id: `g${n}`,
						label: `Parent ${n}`,
						collapsed: false,
						childSeq: 1,
						px: c.x,
						py: c.y,
						pw: c.w,
						ph: c.h,
						boxes: [],
					};
					s.groups.push(g);
					s.nextGroupId = n + 1;
					s.activeGroupId = g.id;
					s.interactionMode = "parent";
					s.selectedBoxIds = [];
					s.currentRect = null;
					commitAction();
					return;
				}
				s.currentRect = null;
				redraw();
				bump();
				return;
			}

			if (
				s.currentRect &&
				s.currentRect.w > MIN_BOX &&
				s.currentRect.h > MIN_BOX &&
				s.activeGroupId &&
				s.interactionMode === "drawChild"
			) {
				const g = s.groups.find((x) => x.id === s.activeGroupId);
				if (g) {
					const ix = Math.max(s.currentRect.x, g.px);
					const iy = Math.max(s.currentRect.y, g.py);
					const ix2 = Math.min(
						s.currentRect.x + s.currentRect.w,
						g.px + g.pw,
					);
					const iy2 = Math.min(
						s.currentRect.y + s.currentRect.h,
						g.py + g.ph,
					);
					const iw = ix2 - ix;
					const ih = iy2 - iy;
					if (iw > MIN_BOX && ih > MIN_BOX) {
						const bid = `b${s.nextBoxId++}`;
						const lab = nextChildLabel(g);
						const box = {
							id: bid,
							label: lab,
							x: ix - g.px,
							y: iy - g.py,
							w: iw,
							h: ih,
						};
						clampChildInParent(g, box);
						s.historySuspended = true;
						g.boxes.push(box);
						s.selectedBoxIds = [];
						s.historySuspended = false;
						commitAction();
						return;
					}
				}
			}
			s.currentRect = null;
			redraw();
		};

		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
		return () => {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
		};
	}, [
		getPos,
		redraw,
		updateStageCursor,
		endDragCommit,
		commitAction,
		bump,
	]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const s = stateRef.current;
			const ae = document.activeElement;
			const skipGlobal = shouldIgnoreGlobalAnnotatorShortcuts(ae);
			const mod = e.metaKey || e.ctrlKey;
			if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
				if (skipGlobal) return;
				e.preventDefault();
				undo();
				return;
			}
			if (mod && e.key.toLowerCase() === "z" && e.shiftKey) {
				if (skipGlobal) return;
				e.preventDefault();
				redo();
				return;
			}
			if (e.key === "Backspace") {
				if (skipGlobal) return;
				if (s.interactionMode !== "child" || !s.selectedBoxIds.length)
					return;
				e.preventDefault();
				const ids = new Set(s.selectedBoxIds);
				s.groups.forEach((g) => {
					g.boxes = g.boxes.filter((b) => !ids.has(b.id));
				});
				s.selectedBoxIds = [];
				commitAction();
				return;
			}
			if (e.key === "Escape") {
				if (skipGlobal) return;
				if (s.labelEditTarget) {
					hideLabelEditor();
					return;
				}
				s.drawing = false;
				s.currentRect = null;
				s.parentDraftNum = null;
				s.selectedBoxIds = [];
				s.interactionMode = "parent";
				bump();
				redraw();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [undo, redo, commitAction, hideLabelEditor, bump, redraw]);

	const onCanvasPointerDown = (e: ReactMouseEvent<HTMLElement>) => {
		if (e.button !== 0) return;
		const s = stateRef.current;
		if (!s.hasImage) return;

		if ((e.target as HTMLElement).closest("#annotator-label-editor")) return;

		blurGroupTreeContentEditable();

		const le = document.getElementById("annotator-label-editor");
		if (
			le &&
			(le as HTMLElement).style.display !== "none" &&
			e.target !== le
		) {
			(le as HTMLInputElement).blur();
		}

		const p = getPos(e.clientX, e.clientY);
		const canvas = canvasRef.current;
		if (!canvas) return;
		const px = snapVal(p.x, s.snapSize);
		const py = snapVal(p.y, s.snapSize);
		const gAct = s.activeGroupId
			? s.groups.find((x) => x.id === s.activeGroupId)
			: null;

		if (s.parentDraftNum != null) {
			s.drawing = true;
			s.startX = px;
			s.startY = py;
			s.currentRect = null;
			e.preventDefault();
			updateStageCursor(px, py);
			return;
		}

		if (s.interactionMode === "child" && gAct) {
			const prim = getPrimarySelectedChildAbs(
				s.groups,
				s.interactionMode,
				s.selectedBoxIds,
			);
			if (prim) {
				const h = handleAt(px, py, prim.abs);
				if (h) {
					s.dragMode = "resize";
					s.dragHandle = h;
					s.dragStart = { x: px, y: py, boxRel: { ...prim.box } };
					e.preventDefault();
					updateStageCursor(px, py);
					return;
				}
			}
			const hit = hitTestChildAbs(s.groups, px, py, null);
			if (hit) {
				const id = hit.box.id;
				if (e.shiftKey) {
					if (s.selectedBoxIds.includes(id))
						s.selectedBoxIds = s.selectedBoxIds.filter((x) => x !== id);
					else s.selectedBoxIds = [...s.selectedBoxIds, id];
				} else if (!s.selectedBoxIds.includes(id)) {
					s.selectedBoxIds = [id];
				}
				s.dragMode = "move";
				s.dragStart = { x: px, y: py };
				s.dragBoxesSnapshot = {};
				s.selectedBoxIds.forEach((sid) => {
					const f = findBoxById(s.groups, sid);
					if (f) s.dragBoxesSnapshot![sid] = { ...f.box };
				});
				redraw();
				e.preventDefault();
				updateStageCursor(px, py);
				return;
			}
			s.interactionMode = "parent";
			s.selectedBoxIds = [];
			bump();
			redraw();
			e.preventDefault();
			updateStageCursor(px, py);
			return;
		}

		if (s.interactionMode === "drawChild" && gAct) {
			if (hitTestChildAbs(s.groups, px, py, s.activeGroupId)) {
				e.preventDefault();
				updateStageCursor(px, py);
				return;
			}
			if (!pointInParent(gAct, px, py)) {
				e.preventDefault();
				updateStageCursor(px, py);
				return;
			}
			s.drawing = true;
			s.startX = px;
			s.startY = py;
			s.currentRect = null;
			e.preventDefault();
			updateStageCursor(px, py);
			return;
		}

		if (s.interactionMode === "parent" && gAct) {
			const pr = parentAbsRect(gAct);
			const ph = handleAt(px, py, pr);
			if (ph) {
				s.dragMode = "parentResize";
				s.dragHandle = ph;
				s.dragParent0 = {
					px: gAct.px,
					py: gAct.py,
					pw: gAct.pw,
					ph: gAct.ph,
				};
				s.dragStart = { x: px, y: py };
				e.preventDefault();
				updateStageCursor(px, py);
				return;
			}
			if (pointInParent(gAct, px, py)) {
				s.dragMode = "groupMove";
				s.dragStart = {
					x: px,
					y: py,
					px0: gAct.px,
					py0: gAct.py,
					groupId: gAct.id,
				};
				e.preventDefault();
				updateStageCursor(px, py);
				return;
			}
		}

		e.preventDefault();
		updateStageCursor(px, py);
	};

	const outputBody = formatOutputText(
		st.outputFormat,
		st.groups,
		st.containerW,
		st.naturalW,
		st.naturalH,
	);

	const undoDisabled = st.historyIndex <= 0;
	const redoDisabled = st.historyIndex >= st.history.length - 1;

	const persistSidebarWidth = useCallback((px: number) => {
		try {
			localStorage.setItem(BBOX_SIDEBAR_WIDTH_LS_KEY, String(px));
		} catch {
			/* 不可時は無視 */
		}
	}, []);

	const finishSidebarResize = useCallback(() => {
		if (!sidebarResizeActiveRef.current) return;
		sidebarResizeActiveRef.current = false;
		sidebarResizeRef.current = null;
		persistSidebarWidth(latestSidebarPxRef.current);
	}, [persistSidebarWidth]);

	const onStageSidebarSeparatorPointerDown = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			e.preventDefault();
			sidebarResizeActiveRef.current = true;
			sidebarResizeRef.current = {
				startX: e.clientX,
				startW: sidebarWidthPx,
			};
			latestSidebarPxRef.current = sidebarWidthPx;
			e.currentTarget.setPointerCapture(e.pointerId);
		},
		[sidebarWidthPx],
	);

	const onStageSidebarSeparatorPointerMove = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			if (!sidebarResizeActiveRef.current || !sidebarResizeRef.current) return;
			const d = sidebarResizeRef.current;
			const delta = e.clientX - d.startX;
			const containerW = mainRowRef.current?.getBoundingClientRect().width;
			const next = clampBboxSidebarWidthPx(
				d.startW - delta,
				containerW && containerW > 0 ? containerW : undefined,
			);
			latestSidebarPxRef.current = next;
			setSidebarWidthPx(next);
		},
		[],
	);

	const onStageSidebarSeparatorPointerUp = useCallback(
		(e: ReactPointerEvent<HTMLDivElement>) => {
			finishSidebarResize();
			if (e.currentTarget.hasPointerCapture(e.pointerId)) {
				e.currentTarget.releasePointerCapture(e.pointerId);
			}
		},
		[finishSidebarResize],
	);

	const onStageSidebarSeparatorLostCapture = useCallback(() => {
		finishSidebarResize();
	}, [finishSidebarResize]);

	const sidebarAriaMax = bboxMaxSidebarPxForMainRow(mainRowInnerWidthPx);
	const sidebarAriaMin = Math.min(BBOX_SIDEBAR_W_MIN, sidebarAriaMax);

	return (
		<PageRoot ref={pageRootRef} className={rootClasses}>
			<BboxToolbar
				fileInputRef={fileInputRef}
				st={st}
				stateRef={stateRef}
				bump={bump}
				redraw={redraw}
				undo={undo}
				redo={redo}
				undoDisabled={undoDisabled}
				redoDisabled={redoDisabled}
				handleToolbarImageChange={handleToolbarImageChange}
				IMAGE_INPUT_ACCEPT={IMAGE_INPUT_ACCEPT}
				onLocalBatchExport={handleLocalBatchExport}
				localBatchExportActive={BBOX_LOCAL_BATCH_EXPORT_ENABLED}
			/>
			<main
				data-l="EditorMain"
				ref={mainRowRef}
				className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden px-0"
			>
				<BboxStage
					stageRef={stageRef}
					imgRef={imgRef}
					canvasRef={canvasRef}
					labelBlurTimeoutRef={labelBlurTimeoutRef}
					st={st}
					stateRef={stateRef}
					bump={bump}
					redraw={redraw}
					imgUrl={imgUrl}
					labelDraft={labelDraft}
					setLabelDraft={setLabelDraft}
					getPos={getPos}
					handleCanvasSectionDragOver={handleCanvasSectionDragOver}
					handleCanvasSectionDrop={handleCanvasSectionDrop}
					onCanvasPointerDown={onCanvasPointerDown}
					onImageLoad={onImageLoad}
					showLabelEditorForEdit={showLabelEditorForEdit}
					hideLabelEditor={hideLabelEditor}
					commitAction={commitAction}
				/>
				<div
					data-l="SidebarSplit"
					role="separator"
					aria-orientation="vertical"
					aria-valuemin={sidebarAriaMin}
					aria-valuemax={sidebarAriaMax}
					aria-valuenow={sidebarWidthPx}
					className="w-1 shrink-0 cursor-col-resize touch-none select-none bg-GR/35 hover:bg-accent/40 mt-0"
					onPointerDown={onStageSidebarSeparatorPointerDown}
					onPointerMove={onStageSidebarSeparatorPointerMove}
					onPointerUp={onStageSidebarSeparatorPointerUp}
					onLostPointerCapture={onStageSidebarSeparatorLostCapture}
				/>
				<BboxSidebar
					sidebarWidthPx={sidebarWidthPx}
					groupTreeRef={groupTreeRef}
					st={st}
					stateRef={stateRef}
					bump={bump}
					redraw={redraw}
					commitAction={commitAction}
					hideLabelEditor={hideLabelEditor}
					editingGroupId={editingGroupId}
					setEditingGroupId={setEditingGroupId}
					outputBody={outputBody}
					copyFlash={copyFlash}
					handleCopyOutput={handleCopyOutput}
					onParentRegionScreenshot={handleParentRegionScreenshot}
				/>
			</main>
		</PageRoot>
	);
}
