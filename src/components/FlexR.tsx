interface FlexRProps {
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const FlexR = ({ className = "", style, children }: FlexRProps) => {
	return (
		<div className={`FlexR ${className}`} style={style}>
			{children}
		</div>
	);
};

export { FlexR };