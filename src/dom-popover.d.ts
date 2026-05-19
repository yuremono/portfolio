/** Popover anchor positioning（showPopover の source オプション） */
interface ShowPopoverOptions {
	source?: Element;
}

interface HTMLElement {
	showPopover(options?: ShowPopoverOptions): void;
}
