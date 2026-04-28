import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DialogFull } from "./DialogFull";

(
	globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

interface RenderDialogOptions {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
}

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

function renderDialog({ open, onOpenChange = vi.fn() }: RenderDialogOptions) {
	const container = document.createElement("div");
	document.body.appendChild(container);
	const root = createRoot(container);

	act(() => {
		root.render(
			<DialogFull
				id="test-dialog"
				open={open}
				dialogAriaLabel="Test Dialog"
				closeAriaLabel="Test Dialogを閉じる"
				onOpenChange={onOpenChange}
			>
				<div>
					<h2>Test Dialog</h2>
					<p>Dialog description</p>
				</div>
				<p>Dialog body</p>
			</DialogFull>,
		);
	});

	return { container, onOpenChange, root };
}

function unmount(root: Root) {
	act(() => {
		root.unmount();
	});
}

beforeEach(() => {
	document.body.innerHTML = "";
	document.body.style.overflow = "";
	HTMLDialogElement.prototype.showModal = function showModal() {
		this.setAttribute("open", "");
	};
	HTMLDialogElement.prototype.close = function close() {
		this.removeAttribute("open");
		this.dispatchEvent(new Event("close"));
	};
});

afterEach(() => {
	HTMLDialogElement.prototype.showModal = originalShowModal;
	HTMLDialogElement.prototype.close = originalClose;
});

describe("DialogFull", () => {
	it("open=trueでdialogを開き、アクセシビリティ属性を付与する", () => {
		const { container, root } = renderDialog({ open: true });
		const dialog = container.querySelector("dialog");

		expect(dialog?.hasAttribute("open")).toBe(true);
		expect(dialog?.getAttribute("aria-modal")).toBe("true");
		expect(dialog?.getAttribute("aria-label")).toBe("Test Dialog");
		expect(dialog?.querySelector("h2")?.textContent).toBe("Test Dialog");

		unmount(root);
	});

	it("closeボタンで閉じる状態を通知する", () => {
		const onOpenChange = vi.fn();
		const { container, root } = renderDialog({ open: true, onOpenChange });
		const closeButton = container.querySelector<HTMLButtonElement>(
			'button[aria-label="Test Dialogを閉じる"]',
		);

		act(() => {
			closeButton?.click();
		});

		expect(onOpenChange).toHaveBeenCalledWith(false);

		unmount(root);
	});

	it("初期フォーカスでスクロールさせない", () => {
		const focusSpy = vi.fn();
		const originalFocus = HTMLElement.prototype.focus;
		HTMLElement.prototype.focus = function focus(options?: FocusOptions) {
			if (
				this instanceof HTMLButtonElement &&
				this.textContent === "Close"
			) {
				focusSpy(options);
			}
		};

		const { root } = renderDialog({ open: true });

		expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });

		HTMLElement.prototype.focus = originalFocus;
		unmount(root);
	});

	it("復帰フォーカスでスクロールさせない", () => {
		const trigger = document.createElement("button");
		trigger.type = "button";
		trigger.textContent = "Open";
		document.body.appendChild(trigger);
		trigger.focus();
		trigger.focus = vi.fn();

		const onOpenChange = vi.fn();
		const { container, root } = renderDialog({ open: true, onOpenChange });
		const dialog = container.querySelector("dialog");

		act(() => {
			dialog?.close();
		});

		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(trigger.focus).toHaveBeenCalledWith({ preventScroll: true });

		unmount(root);
	});
});
