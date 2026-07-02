import { CaretDownIcon } from "@phosphor-icons/react";

interface ToggleProps {
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const Toggle = ({ className = "", style, children }: ToggleProps) => {
	return (
		<details className={`Toggle ${className}`} style={style}>
			{children}
		</details>
	);
};

interface ToggleSummaryProps {
	children: React.ReactNode;
	className?: string;
}

const ToggleSummary = ({ children, className = "" }: ToggleSummaryProps) => {
	return (
		<summary className={`ToggleSummary ${className}`}>
			{children}
			<CaretDownIcon className="ToggleIcon" />
		</summary>
	);
};

interface ToggleBodyProps {
	children?: React.ReactNode;
	className?: string;
}

const ToggleBody = ({ children, className = "" }: ToggleBodyProps) => {
	return <div className={` ${className ?? ""}`}>{children}</div>;
};

export { Toggle, ToggleSummary, ToggleBody };
