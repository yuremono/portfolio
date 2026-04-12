interface BorderDrawProps {
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const BorderDraw = ({ className = "", style, children }: BorderDrawProps) => {
	return (
		<div className={`BorderDraw ${className}`} style={style}>
			{children}
		</div>
	);
}

export { BorderDraw };