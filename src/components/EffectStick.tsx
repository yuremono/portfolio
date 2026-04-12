interface StickProps {
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const Stick = ({ className = "", style, children }: StickProps) => {
	return (
		<div className={`Stick ${className}`} style={style}>
			{children}
		</div>
	);
}

export { Stick };