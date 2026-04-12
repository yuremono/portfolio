interface WrapProps {
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const Wrap = ({ className = "", style, children }: WrapProps) => {
	return (
		<div className={`Wrap ${className}`} style={style}>
			{children}
		</div>
	);
};

export { Wrap };