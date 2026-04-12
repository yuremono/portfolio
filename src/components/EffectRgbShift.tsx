interface RgbShiftProps {
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const RgbShift = ({ className = "", style, children }: RgbShiftProps) => {
	return (
		<div className={`RgbShift ${className}`} style={style}>
			{children}
		</div>
	);
}

export { RgbShift };