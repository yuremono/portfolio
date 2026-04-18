import { useEffect, useRef, type ReactNode } from "react";

import {
	XIcon,
} from "@phosphor-icons/react";
export interface FullscreenDialogProps {
	id: string;
	open: boolean;
	title: string;
	description?: string;
	children: ReactNode;
	onOpenChange: (open: boolean) => void;
}

export function FullscreenDialog({
	id,
	open,
	title,
	description,
	children,
	onOpenChange,
}: FullscreenDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const previouslyFocusedRef = useRef<HTMLElement | null>(null);
	const titleId = `${id}-title`;
	const descriptionId = description ? `${id}-description` : undefined;

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
			aria-labelledby={titleId}
			aria-describedby={descriptionId}
			aria-modal="true"
			className="min-h-lvh  w-screen max-w-none overflow-y-auto overscroll-none bg-BC/90    outline-none "
			onClick={(event) => {
				if (event.target === event.currentTarget) {
					closeDialog();
				}
			}}
		>
			<article className=" py-[--PX] into">
				<header className="flex items-start justify-between gap-[--gap] BorderB pb-4">
					<div>
						<p className=" text-sm  font-bold text-AC">
							Details
						</p>
						<h2 id={titleId} className="font-medium text-GR">
							{title}
						</h2>
						{description ? (
							<p id={descriptionId} className="mt-2 leading-[--LH]">
								{description}
							</p>
						) : null}
					</div>
					<button
						type="button"
						className="textlink dsbc shrink-0 text-AC fixed top-[--PX] right-[--into] p-2  "
						onClick={closeDialog}
						data-dialog-initial-focus
						aria-label={`${title}を閉じる`}
					>
						Close<XIcon className="[--btnIFZ:1.25em]" weight="bold" />
					</button>
				</header>
				{children}
			</article>
		</dialog>
	);
}
