interface CardsItemProps {
	className?: string
	children?: React.ReactNode
}

const CardsItem = ({
        className = "",
        children
}: CardsItemProps) => {
	return (
		<div className={`item ${className}`}>
			{children}
		</div>
	)
}

interface CardsProps {
	className?: string
	style?: React.CSSProperties
	children: React.ReactNode
}

const Cards = ({ className = "", style, children }: CardsProps) => {
	return (
		<div className={`Cards ${className}`} style={style}>
			{children}
		</div>
	)
}

export { Cards, CardsItem }
