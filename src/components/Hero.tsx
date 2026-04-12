interface HeroProps {
	className?: string;
	style?: React.CSSProperties;
	children?: React.ReactNode;
}

const Hero = ({ className = "", style, children }: HeroProps) => {
	return (
		<div className={`Hero ${className}`} style={style}>
			{children}
		</div>
	);
};

export { Hero };