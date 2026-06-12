import { useEffect, type RefObject } from "react";
import { fixed, px } from "./utils";
import {
	isDocumentVisible,
	subscribeDocumentVisibility,
} from "../../lib/pageVisibility";

interface RepulsionListsPoint {
	id: string;
	point: { x: number; y: number };
	element: HTMLElement;
	jitterX: number;
	jitterY: number;
}

interface RepulsionListsLine {
	id: string;
	from: { x: number; y: number };
	to: { x: number; y: number };
}

interface RepulsionListsVisualState {
	baseScale: number;
	visualScale: number;
	visualOpacity: number;
	distance: number;
}

const REPULSION_LISTS_SCALE_ACTIVE = 1.4;
const REPULSION_LISTS_SCALE_IDLE = 0.7;
const REPULSION_LISTS_INFLUENCE_DISTANCE = 400;
const REPULSION_LISTS_JITTER_X = 275;
const REPULSION_LISTS_JITTER_Y = 80;
const REPULSION_LISTS_PUSH_X = -15;
const REPULSION_LISTS_PUSH_Y = 15;
const REPULSION_LISTS_OPACITY_ACTIVE = 1;
const REPULSION_LISTS_OPACITY_IDLE = 0.4;
const REPULSION_LISTS_REPULSION = 80;
const REPULSION_LISTS_REPULSION_DISTANCE = 400;
const REPULSION_LISTS_COLLISION_PADDING = 50;
const REPULSION_LISTS_COLLISION_DISTANCE = 300;
const REPULSION_LISTS_LINE_SECTORS = 3;
const REPULSION_LISTS_SETTLE_EVERY_FRAMES = 2;
const REPULSION_LISTS_SETTLE_DELTA = 0.5;
const REPULSION_LISTS_SETTLE_STABLE_FRAMES = 2;
const REPULSION_LISTS_SETTLE_TIMEOUT = 600;
const REPULSION_LISTS_MOBILE_BREAKPOINT = 1181;
const REPULSION_LISTS_TOUCH_SIDE_PADDING = 100;
const REPULSION_LISTS_TOUCH_THROTTLE = 32;
const REPULSION_LISTS_CARD_WIDTH = 1000;

const distance = (
	from: { x: number; y: number },
	to: { x: number; y: number },
) => {
	const x = to.x - from.x;
	const y = to.y - from.y;
	return Math.sqrt(x * x + y * y);
};

const centerOf = (rect: DOMRect) => ({
	x: rect.left + rect.width / 2,
	y: rect.top + rect.height / 2,
});

const getRepulsionListsPoints = (container: HTMLElement) => {
	const points = new Map<string, RepulsionListsPoint>();
	container.querySelectorAll("[data-repulsion-list-chip]").forEach((node) => {
		if (!(node instanceof HTMLElement)) return;
		const rect = node.getBoundingClientRect();
		const id = node.getAttribute("data-repulsion-list-item-id");
		if (!id || rect.width <= 0 || rect.height <= 0) return;
		points.set(id, {
			id,
			point: centerOf(rect),
			element: node,
			jitterX: Number(node.getAttribute("data-jitter-x") || "0"),
			jitterY: Number(node.getAttribute("data-jitter-y") || "0"),
		});
	});
	return points;
};

const lineAngle = (
	from: { x: number; y: number },
	to: { x: number; y: number },
) => {
	const angle = Math.atan2(to.y - from.y, to.x - from.x);
	return angle < 0 ? angle + Math.PI * 2 : angle;
};

const getConnectionLines = (
	points: Map<string, RepulsionListsPoint | { x: number; y: number }>,
) => {
	const lines: RepulsionListsLine[] = [];
	const seen = new Set<string>();
	points.forEach((point, id) => {
		const currentPoint = "point" in point ? point.point : point;
		const neighbors: Array<{
			id: string;
			point: { x: number; y: number };
			distance: number;
			angle: number;
		}> = [];
		points.forEach((neighbor, neighborId) => {
			if (id === neighborId) return;
			const neighborPoint = "point" in neighbor ? neighbor.point : neighbor;
			neighbors.push({
				id: neighborId,
				point: neighborPoint,
				distance: distance(currentPoint, neighborPoint),
				angle: lineAngle(currentPoint, neighborPoint),
			});
		});

		const sectorSize = (Math.PI * 2) / REPULSION_LISTS_LINE_SECTORS;
		for (let sector = 0; sector < REPULSION_LISTS_LINE_SECTORS; sector += 1) {
			const start = sector * sectorSize;
			const end = (sector + 1) * sectorSize;
			const sectorNeighbors = neighbors.filter((neighbor) =>
				end > Math.PI * 2
					? neighbor.angle >= start || neighbor.angle < end - Math.PI * 2
					: neighbor.angle >= start && neighbor.angle < end,
			);
			sectorNeighbors.sort((a, b) => a.distance - b.distance);
			const nearest = sectorNeighbors[0];
			if (!nearest) continue;
			const lineId = id < nearest.id ? `${id}-${nearest.id}` : `${nearest.id}-${id}`;
			if (seen.has(lineId)) continue;
			seen.add(lineId);
			lines.push({
				id: lineId,
				from: currentPoint,
				to: nearest.point,
			});
		}
	});
	return lines;
};

const getCollisionOffsets = (points: Map<string, RepulsionListsPoint>) => {
	const offsets = new Map<string, { deltaX: number; deltaY: number }>();
	points.forEach((_, id) => offsets.set(id, { deltaX: 0, deltaY: 0 }));
	const entries = Array.from(points.entries());

	for (let i = 0; i < entries.length; i += 1) {
		for (let j = i + 1; j < entries.length; j += 1) {
			const [leftId, leftPoint] = entries[i];
			const [rightId, rightPoint] = entries[j];
			if (distance(leftPoint.point, rightPoint.point) >= REPULSION_LISTS_COLLISION_DISTANCE) {
				continue;
			}

			const leftLabel = leftPoint.element.querySelector(".repulsion-list-chip-label");
			const rightLabel = rightPoint.element.querySelector(".repulsion-list-chip-label");
			if (!leftLabel || !rightLabel) continue;

			const leftRect = leftLabel.getBoundingClientRect();
			const rightRect = rightLabel.getBoundingClientRect();
			const leftOffset = offsets.get(leftId);
			const rightOffset = offsets.get(rightId);
			if (!leftOffset || !rightOffset) continue;

			const leftBox = {
				left: leftRect.left + leftOffset.deltaX,
				right: leftRect.right + leftOffset.deltaX,
				top: leftRect.top + leftOffset.deltaY,
				bottom: leftRect.bottom + leftOffset.deltaY,
				centerX: leftRect.left + leftRect.width / 2 + leftOffset.deltaX,
				centerY: leftRect.top + leftRect.height / 2 + leftOffset.deltaY,
			};
			const rightBox = {
				left: rightRect.left + rightOffset.deltaX,
				right: rightRect.right + rightOffset.deltaX,
				top: rightRect.top + rightOffset.deltaY,
				bottom: rightRect.bottom + rightOffset.deltaY,
				centerX: rightRect.left + rightRect.width / 2 + rightOffset.deltaX,
				centerY: rightRect.top + rightRect.height / 2 + rightOffset.deltaY,
			};
			const intersects = !(
				leftBox.right + REPULSION_LISTS_COLLISION_PADDING < rightBox.left ||
				leftBox.left - REPULSION_LISTS_COLLISION_PADDING > rightBox.right ||
				leftBox.bottom + REPULSION_LISTS_COLLISION_PADDING < rightBox.top ||
				leftBox.top - REPULSION_LISTS_COLLISION_PADDING > rightBox.bottom
			);
			if (!intersects) continue;

			const overlapX =
				Math.min(leftBox.right, rightBox.right) -
				Math.max(leftBox.left, rightBox.left) +
				REPULSION_LISTS_COLLISION_PADDING;
			const overlapY =
				Math.min(leftBox.bottom, rightBox.bottom) -
				Math.max(leftBox.top, rightBox.top) +
				REPULSION_LISTS_COLLISION_PADDING;

			const directionX = leftBox.centerX < rightBox.centerX ? -1 : 1;
			const directionY = leftBox.centerY < rightBox.centerY ? -1 : 1;
			if (overlapY >= overlapX) {
				leftOffset.deltaX += (overlapX / 2) * directionX;
				rightOffset.deltaX -= (overlapX / 2) * directionX;
			} else {
				leftOffset.deltaY += (overlapY / 2) * directionY;
				rightOffset.deltaY -= (overlapY / 2) * directionY;
			}
		}
	}

	return offsets;
};

const getRelativeRepulsionListsPoints = (
	container: HTMLElement,
	containerRect: DOMRect,
) => {
	const points = new Map<string, { x: number; y: number }>();
	container.querySelectorAll("[data-repulsion-list-chip]").forEach((node) => {
		if (!(node instanceof HTMLElement)) return;
		const rect = node.getBoundingClientRect();
		const id = node.getAttribute("data-repulsion-list-item-id");
		if (!id || rect.width <= 0 || rect.height <= 0) return;
		const center = centerOf(rect);
		points.set(id, {
			x: center.x - containerRect.left,
			y: center.y - containerRect.top,
		});
	});
	return points;
};

const getPushOffset = (xRatio: number, yRatio: number) => ({
	x: Math.max(-1, Math.min(1, (xRatio - 0.5) * 2)) * REPULSION_LISTS_PUSH_X,
	y: Math.max(-1, Math.min(1, (yRatio - 0.5) * 2)) * REPULSION_LISTS_PUSH_Y,
});

const getVisualStates = (
	points: Map<string, RepulsionListsPoint>,
	origin: { x: number; y: number },
) => {
	const states = new Map<string, RepulsionListsVisualState>();
	points.forEach((point, id) => {
		const itemDistance = distance(origin, point.point);
		const mix = Math.min(itemDistance / REPULSION_LISTS_INFLUENCE_DISTANCE, 1);
		const baseScale =
			REPULSION_LISTS_SCALE_ACTIVE -
			(REPULSION_LISTS_SCALE_ACTIVE - REPULSION_LISTS_SCALE_IDLE) * mix;
		const baseOpacity =
			REPULSION_LISTS_OPACITY_ACTIVE -
			(REPULSION_LISTS_OPACITY_ACTIVE - REPULSION_LISTS_OPACITY_IDLE) * mix;
		states.set(id, {
			baseScale,
			visualScale: Math.max(
				REPULSION_LISTS_SCALE_IDLE,
				Math.min(REPULSION_LISTS_SCALE_ACTIVE, baseScale),
			),
			visualOpacity: Math.max(0, Math.min(1, baseOpacity)),
			distance: itemDistance,
		});
	});
	return states;
};

const getRepulsionOffsets = (
	points: Map<string, RepulsionListsPoint>,
	states: Map<string, RepulsionListsVisualState>,
) => {
	const offsets = new Map<string, { x: number; y: number }>();
	points.forEach((point, id) => {
		let x = 0;
		let y = 0;
		points.forEach((neighbor, neighborId) => {
			if (id === neighborId) return;
			const state = states.get(neighborId);
			if (!state || state.baseScale <= 1) return;
			const deltaX = point.point.x - neighbor.point.x;
			const deltaY = point.point.y - neighbor.point.y;
			const itemDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			if (itemDistance > REPULSION_LISTS_REPULSION_DISTANCE || itemDistance === 0) return;
			const strength =
				REPULSION_LISTS_REPULSION *
				(state.baseScale - 1) *
				Math.max(0, 1 - itemDistance / REPULSION_LISTS_REPULSION_DISTANCE);
			x += (deltaX / itemDistance) * strength;
			y += (deltaY / itemDistance) * strength;
		});
		offsets.set(id, { x, y });
	});
	return offsets;
};

const getPointSnapshot = (points: Map<string, RepulsionListsPoint>) => {
	const snapshot = new Map<string, { x: number; y: number }>();
	points.forEach((point, id) => {
		snapshot.set(id, { x: point.point.x, y: point.point.y });
	});
	return snapshot;
};

const getInitialFocusPoint = (
	card: HTMLElement,
	points: Map<string, RepulsionListsPoint>,
	rect: DOMRect,
) => {
	const focusElement = card.querySelector(".is-initial");
	if (!(focusElement instanceof HTMLElement)) return centerOf(rect);
	const id = focusElement.getAttribute("data-repulsion-list-item-id");
	if (!id) return centerOf(rect);
	return points.get(id)?.point ?? centerOf(rect);
};

const hasSettled = (
	current: Map<string, { x: number; y: number }>,
	previous: Map<string, { x: number; y: number }> | null,
) => {
	if (!previous || previous.size === 0) return false;
	let maxDelta = 0;
	current.forEach((point, id) => {
		const last = previous.get(id);
		if (!last) return;
		maxDelta = Math.max(
			maxDelta,
			Math.abs(point.x - last.x),
			Math.abs(point.y - last.y),
		);
	});
	return maxDelta < REPULSION_LISTS_SETTLE_DELTA;
};

export const useRepulsionListsLayout = (
	cardRef: RefObject<HTMLDivElement | null>,
	svgRef: RefObject<SVGSVGElement | null>,
	touchRef: RefObject<HTMLDivElement | null>,
) => {
	useEffect(() => {
		const card = cardRef.current;
		if (!card) return;
		const touchTarget = touchRef.current;
		let moveFrame: number | null = null;
		let settleFrame: number | null = null;
		let previousSnapshot: Map<string, { x: number; y: number }> | null = null;
		let touchActive = false;
		let touchStartX = 0;
		let currentTranslate = 0;
		let startTranslate = 0;
		let cachedWindowWidth = window.innerWidth;
		let maxMobileTranslate =
			(REPULSION_LISTS_CARD_WIDTH + REPULSION_LISTS_TOUCH_SIDE_PADDING * 2 - window.innerWidth) /
			2;
		let lastTouchLayout = 0;
		let stableFrames = 0;
		let settleTicks = 0;
		let isNearViewport = false;
		let isPageVisible = isDocumentVisible();

		const measure = () => {
			const rect = card.getBoundingClientRect();
			cachedWindowWidth = window.innerWidth;
			maxMobileTranslate =
				(REPULSION_LISTS_CARD_WIDTH + REPULSION_LISTS_TOUCH_SIDE_PADDING * 2 - window.innerWidth) /
				2;
			return rect;
		};

		const drawLines = (
			rect: DOMRect,
			points: Map<string, { x: number; y: number }>,
		) => {
			const svg = svgRef.current;
			if (!svg || rect.width <= 0 || rect.height <= 0) return;
			const viewBox = `0 0 ${rect.width} ${rect.height}`;
			if (svg.getAttribute("viewBox") !== viewBox) {
				svg.setAttribute("viewBox", viewBox);
			}
			if (points.size === 0) return;
			const existing = new Map<string, SVGLineElement>();
			svg.querySelectorAll("line[data-connection-id]").forEach((line) => {
				if (!(line instanceof SVGLineElement)) return;
				const id = line.getAttribute("data-connection-id");
				if (id) existing.set(id, line);
			});

			getConnectionLines(points).forEach((line) => {
				let element = existing.get(line.id);
				if (!element) {
					element = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"line",
					);
					element.setAttribute("data-connection-id", line.id);
					element.setAttribute("stroke", "#D7D7CF");
					element.setAttribute("stroke-width", "1");
					element.setAttribute("stroke-opacity", "0.8");
					element.style.transition =
						"x1 300ms ease-out, y1 300ms ease-out, x2 300ms ease-out, y2 300ms ease-out";
					svg.appendChild(element);
				}
				element.setAttribute("x1", line.from.x.toString());
				element.setAttribute("y1", line.from.y.toString());
				element.setAttribute("x2", line.to.x.toString());
				element.setAttribute("y2", line.to.y.toString());
				existing.delete(line.id);
			});
			existing.forEach((line) => line.remove());
		};

		const positionPopups = (rect: DOMRect, points: Map<string, RepulsionListsPoint>) => {
			const cardCenter = centerOf(rect);
			points.forEach((point, id) => {
				const element = card.querySelector(`[data-repulsion-list-item-id="${id}"]`);
				if (!(element instanceof HTMLElement)) return;
				const opensLeft = point.point.x < cardCenter.x;
				const opensDown = point.point.y < cardCenter.y;
				element.style.setProperty("--popup-top", opensDown ? "98%" : "0%");
				element.style.setProperty("--popup-left", opensLeft ? "0%" : "98%");
				element.style.setProperty("--popup-translate-y", opensDown ? "0%" : "-98%");
				element.style.setProperty("--popup-translate-x", opensLeft ? "0%" : "-98%");
				element.style.setProperty("--popup-origin-y", opensDown ? "top" : "bottom");
				element.style.setProperty(
					"--popup-border-top",
					opensDown ? "1px solid #434343" : "0",
				);
				element.style.setProperty(
					"--popup-border-bottom",
					opensDown ? "0" : "1px solid #434343",
				);
				element.style.setProperty("--popup-opens-down", opensDown ? "1.3" : "0");
			});
		};

		const applyLayout = (
			pointer: { x: number; y: number },
			push: { x: number; y: number },
			collisionOffsets = new Map<string, { deltaX: number; deltaY: number }>(),
		) => {
			const points = getRepulsionListsPoints(card);
			const states = getVisualStates(points, pointer);
			const repulsionOffsets = getRepulsionOffsets(points, states);

			points.forEach((point) => {
				const state = states.get(point.id);
				if (!state) return;
				const repulsion = repulsionOffsets.get(point.id) ?? { x: 0, y: 0 };
				const collision = collisionOffsets.get(point.id) ?? {
					deltaX: 0,
					deltaY: 0,
				};
				const x =
					push.x +
					repulsion.x +
					(point.jitterX / 100) * REPULSION_LISTS_JITTER_X +
					collision.deltaX;
				const y =
					push.y +
					repulsion.y +
					(point.jitterY / 100) * REPULSION_LISTS_JITTER_Y +
					collision.deltaY;
				point.element.style.transform = `translate(${px(x)}, ${px(y)})`;
				point.element.style.setProperty(
					"--repulsion-list-chip-dynamic-scale",
					fixed(state.visualScale),
				);
				point.element.style.setProperty(
					"--repulsion-list-chip-dynamic-opacity",
					fixed(state.visualOpacity),
				);
				const currentState = point.element.getAttribute("data-state");
				if (state.distance < REPULSION_LISTS_COLLISION_DISTANCE && currentState === "idle") {
					point.element.setAttribute("data-state", "proximity");
				}
				if (
					state.distance >= REPULSION_LISTS_COLLISION_DISTANCE &&
					currentState === "proximity"
				) {
					point.element.setAttribute("data-state", "idle");
				}
			});

			const rect = card.getBoundingClientRect();
			drawLines(rect, getRelativeRepulsionListsPoints(card, rect));
			return points;
		};

		const settleOnce = () => {
			const rect = measure();
			if (rect.width <= 0 || rect.height <= 0) return;
			const points = getRepulsionListsPoints(card);
			const collisionOffsets = getCollisionOffsets(points);
			positionPopups(rect, points);
			applyLayout(getInitialFocusPoint(card, points, rect), { x: 0, y: 0 }, collisionOffsets);
		};

		const stopSettle = () => {
			if (settleFrame !== null) cancelAnimationFrame(settleFrame);
			settleFrame = null;
			previousSnapshot = null;
			stableFrames = 0;
			settleTicks = 0;
		};

		const stopMotion = () => {
			if (moveFrame !== null) {
				cancelAnimationFrame(moveFrame);
				moveFrame = null;
			}
			stopSettle();
		};

		const maybeStartSettle = (finalize = true) => {
			if (!isNearViewport || !isPageVisible) return;
			runSettle(finalize);
		};

		const runSettle = (finalize = true) => {
			if (!isNearViewport || !isPageVisible) return;
			stopSettle();
			measure();
			const startedAt = performance.now();
			const step = () => {
				if (!isNearViewport || !isPageVisible) {
					stopSettle();
					return;
				}
				if (performance.now() - startedAt > REPULSION_LISTS_SETTLE_TIMEOUT) {
					if (finalize) settleOnce();
					stopSettle();
					return;
				}
				const rect = measure();
				if (rect.width <= 0 || rect.height <= 0) {
					settleFrame = requestAnimationFrame(step);
					return;
				}
				settleTicks += 1;
				if (settleTicks >= REPULSION_LISTS_SETTLE_EVERY_FRAMES) {
					const points = getRepulsionListsPoints(card);
					applyLayout(getInitialFocusPoint(card, points, rect), { x: 0, y: 0 });
					settleTicks = 0;
				}
				const snapshot = getPointSnapshot(getRepulsionListsPoints(card));
				if (hasSettled(snapshot, previousSnapshot)) {
					stableFrames += 1;
					if (stableFrames >= REPULSION_LISTS_SETTLE_STABLE_FRAMES) {
						if (finalize) settleOnce();
						stopSettle();
						return;
					}
				} else {
					stableFrames = 0;
				}
				previousSnapshot = snapshot;
				settleFrame = requestAnimationFrame(step);
			};
			settleFrame = requestAnimationFrame(step);
		};

		const schedulePointerLayout = (
			pointer: { x: number; y: number },
			push: { x: number; y: number },
		) => {
			if (moveFrame !== null) return;
			moveFrame = requestAnimationFrame(() => {
				applyLayout(pointer, push);
				moveFrame = null;
			});
		};

		const handleMove = (event: MouseEvent) => {
			const rect = card.getBoundingClientRect();
			const xRatio = (event.clientX - rect.left) / rect.width;
			const yRatio = (event.clientY - rect.top) / rect.height;
			schedulePointerLayout(
				{ x: event.clientX, y: event.clientY },
				getPushOffset(xRatio, yRatio),
			);
		};
		const handleLeave = () => {
			if (moveFrame !== null) {
				cancelAnimationFrame(moveFrame);
				moveFrame = null;
			}
			runSettle(false);
		};
		const handleRepulsionListChipFocus = (event: Event) => {
			const detail = (event as CustomEvent<{ x: number; y: number }>).detail;
			if (!detail) return;
			applyLayout({ x: detail.x, y: detail.y }, { x: 0, y: 0 });
		};
		const handleResize = () => {
			if (window.innerWidth !== cachedWindowWidth) {
				currentTranslate = 0;
				card.style.transform = "";
				if (isNearViewport && isPageVisible) {
					runSettle(true);
				} else {
					stopSettle();
				}
			}
		};
		const handleTouchStart = (event: TouchEvent) => {
			if (cachedWindowWidth >= REPULSION_LISTS_MOBILE_BREAKPOINT) return;
			touchActive = true;
			touchStartX = event.touches[0].clientX;
			startTranslate = currentTranslate;
		};
		const handleTouchMove = (event: TouchEvent) => {
			if (!touchActive) return;
			const nextTranslate = startTranslate + event.touches[0].clientX - touchStartX;
			if (Math.abs(nextTranslate) > maxMobileTranslate) return;
			currentTranslate = nextTranslate;
			card.style.transform = `translateX(${nextTranslate}px)`;
			const now = performance.now();
			if (now - lastTouchLayout >= REPULSION_LISTS_TOUCH_THROTTLE) {
				lastTouchLayout = now;
				const rect = measure();
				applyLayout({ x: cachedWindowWidth / 2, y: rect.top + rect.height / 2 }, { x: 0, y: 0 });
			}
		};
		const handleTouchEnd = () => {
			if (touchActive) {
				const rect = measure();
				applyLayout({ x: cachedWindowWidth / 2, y: rect.top + rect.height / 2 }, { x: 0, y: 0 });
			}
			touchActive = false;
		};
		const handleRepulsionListChipActivate = (event: Event) => {
			if (cachedWindowWidth >= REPULSION_LISTS_MOBILE_BREAKPOINT) return;
			const detail = (event as CustomEvent<{ tagId: string }>).detail;
			const points = getRepulsionListsPoints(card);
			const point = detail?.tagId ? points.get(detail.tagId) : undefined;
			if (!point) return;
			const nextTranslate = Math.max(
				-maxMobileTranslate,
				Math.min(
					maxMobileTranslate,
					cachedWindowWidth / 2 - point.point.x + currentTranslate,
				),
			);
			currentTranslate = nextTranslate;
			card.style.transform = `translateX(${nextTranslate}px)`;
			const rect = measure();
			applyLayout({ x: cachedWindowWidth / 2, y: rect.top + rect.height / 2 }, { x: 0, y: 0 });
		};

		const viewportMargin = "60% 0px 60% 0px";
		const viewportObserver =
			typeof IntersectionObserver === "undefined"
				? null
				: new IntersectionObserver(
						(entries) => {
							const entry = entries[0];
							const nextNearViewport =
								entry.isIntersecting || entry.intersectionRatio > 0;
							isNearViewport = nextNearViewport;
							if (nextNearViewport && isPageVisible) {
								maybeStartSettle(true);
								return;
							}
							stopMotion();
						},
						{
							root: null,
							rootMargin: viewportMargin,
							threshold: 0,
						},
					);
		viewportObserver?.observe(card);
		if (!viewportObserver) {
			isNearViewport = true;
		}
		if (isNearViewport && isPageVisible) {
			maybeStartSettle(true);
		}
		const disconnectVisibility = subscribeDocumentVisibility((visible) => {
			isPageVisible = visible;
			if (!visible) {
				stopMotion();
				return;
			}
			if (isNearViewport) {
				maybeStartSettle(true);
			}
		});

		card.addEventListener("repulsion-list-chip:focus", handleRepulsionListChipFocus);
		card.addEventListener("repulsion-list-chip:activate", handleRepulsionListChipActivate);
		card.addEventListener("mouseenter", stopSettle);
		card.addEventListener("mousemove", handleMove);
		card.addEventListener("mouseleave", handleLeave);
		window.addEventListener("resize", handleResize);
		touchTarget?.addEventListener("touchstart", handleTouchStart, {
			passive: true,
		});
		touchTarget?.addEventListener("touchmove", handleTouchMove, {
			passive: true,
		});
		touchTarget?.addEventListener("touchend", handleTouchEnd, {
			passive: true,
		});
		touchTarget?.addEventListener("touchcancel", handleTouchEnd, {
			passive: true,
		});

		return () => {
			disconnectVisibility();
			viewportObserver?.disconnect();
			stopMotion();
			card.removeEventListener("mousemove", handleMove);
			card.removeEventListener("mouseleave", handleLeave);
			card.removeEventListener("mouseenter", stopSettle);
			card.removeEventListener("repulsion-list-chip:focus", handleRepulsionListChipFocus);
			card.removeEventListener("repulsion-list-chip:activate", handleRepulsionListChipActivate);
			window.removeEventListener("resize", handleResize);
			touchTarget?.removeEventListener("touchstart", handleTouchStart);
			touchTarget?.removeEventListener("touchmove", handleTouchMove);
			touchTarget?.removeEventListener("touchend", handleTouchEnd);
			touchTarget?.removeEventListener("touchcancel", handleTouchEnd);
		};
	}, [cardRef, svgRef, touchRef]);
};
