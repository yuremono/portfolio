import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface ScrollToTopProps {
	disabled?: boolean;
}

export function ScrollToTop({ disabled = false }: ScrollToTopProps) {
	const { pathname } = useLocation();

	useEffect(() => {
		if (disabled) {
			return;
		}

		window.scrollTo(0, 0);
	}, [disabled, pathname]);

	return null;
}
