import { useEffect, useRef, type ReactNode } from "react";

import {
	XIcon,
} from "@phosphor-icons/react";

export interface FullscreenDialogProps {
	id: string;
	open: boolean;
	/**
	 * `dialog` の `aria-label`。指定時は子の見出しに `id` を付けずに名前一意にできる。
	 * 指定がない場合のみ `ariaLabelledBy` / `ariaDescribedBy` を使う。
	 */
	dialogAriaLabel?: string;
	ariaLabelledBy?: string;
	ariaDescribedBy?: string;
	closeAriaLabel: string;
	children: ReactNode;
	onOpenChange: (open: boolean) => void;
}

export function FullscreenDialog({
	id,
	open,
	dialogAriaLabel,
	ariaLabelledBy,
	ariaDescribedBy,
	closeAriaLabel,
	children,
	onOpenChange,
}: FullscreenDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const previouslyFocusedRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (open) {
			previouslyFocusedRef.current =
				document.activeElement instanceof HTMLElement
					? document.activeElement
					: null;
			if (!dialog.open) {
				dialog.showModal();
			}
			dialog
				.querySelector<HTMLElement>("[data-dialog-initial-focus]")
				?.focus({ preventScroll: true });
			return;
		}

		if (dialog.open) {
			dialog.close();
		}
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		const handleClose = () => {
			onOpenChange(false);
			previouslyFocusedRef.current?.focus({ preventScroll: true });
			previouslyFocusedRef.current = null;
		};

		dialog.addEventListener("close", handleClose);
		return () => {
			dialog.removeEventListener("close", handleClose);
		};
	}, [onOpenChange]);

	const closeDialog = () => {
		onOpenChange(false);
	};

	return (
		<dialog
			ref={dialogRef}
			id={id}
			aria-label={dialogAriaLabel}
			aria-labelledby={
				dialogAriaLabel ? undefined : ariaLabelledBy
			}
			aria-describedby={
				dialogAriaLabel ? undefined : ariaDescribedBy
			}
			aria-modal="true"
			className="min-h-lvh  w-screen max-w-none overflow-y-auto overscroll-none bg-BC/90    outline-none "
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					closeDialog();
				}
			}}
		>
			<article className=" py-[--PX] into">
				<button
					type="button"
					className="textlink dsbc shrink-0 text-AC fixed top-[--PX] right-[--into] p-2  "
					onClick={closeDialog}
					data-dialog-initial-focus
					aria-label={closeAriaLabel}
				>
					Close<XIcon className="[--btnIFZ:1.25em]" weight="bold" />
				</button>
				{children}
			</article>
		</dialog>
	);
}
