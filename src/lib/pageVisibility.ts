export function isDocumentVisible() {
	return typeof document === "undefined" ? true : !document.hidden;
}

export function subscribeDocumentVisibility(
	onChange: (isVisible: boolean) => void,
) {
	if (typeof document === "undefined") {
		return () => {};
	}

	const handleVisibilityChange = () => {
		onChange(!document.hidden);
	};

	document.addEventListener("visibilitychange", handleVisibilityChange);

	return () => {
		document.removeEventListener("visibilitychange", handleVisibilityChange);
	};
}
