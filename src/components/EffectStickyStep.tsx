interface StickyStepProps {
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const StickyStep = ({ className = "", style, children }: StickyStepProps) => {
	return (
		<div className={`StickyStep ${className}`} style={style}>
			{children}
		</div>
	);
}

export { StickyStep };