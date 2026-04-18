import type { ReactNode } from "react";
import styled from "styled-components";

interface ButtonProps {
	className?: string;
	href?: string;
	/** 新しいタブで開く（`target="_blank"` + `rel="noopener noreferrer"`） */
	external?: boolean;
	children?: ReactNode;
}

const Button = ({
	className = "",
	href = "",
	external = false,
	children,
}: ButtonProps) => {
	const externalAttrs = external
		? { target: "_blank" as const, rel: "noopener noreferrer" as const }
		: {};

                return (
                        <StyledLink
                          className={className}
                          href={href}
                          {...externalAttrs}
                        >
                          <span>{children}</span>
                        </StyledLink>
                      );
};

const StyledLink = styled.a`

         position: relative;
         min-height: var(--btnH);
         min-width: var(--btnW);
         line-height:1;
         padding: 0 1em;
         border: 1px solid var(--cur);
         font-family: inherit;
         display:inline-block;
      
        &:before, &:after {
         content: "";
         position: absolute;
         background: var(--background);
         transition: all .2s linear;
        }
      
        &:before {
         width: calc(100% + 2px);
         height: calc(100% - 16px);
         top: 8px;
         left: -1px;
        }
      
        &:after {
         width: calc(100% - 16px);
         height: calc(100% + 2px);
         top: -1px;
         left: 8px;
        }
      
      
      
       & :active {
         transform: scale(0.96);
        }
      
       &:hover {
         color: var(--AC);
        }
        &:hover:before {
         height: calc(0px);
         top: 50%;
        }
      
        &:hover:after {
         width: calc(0px);
         left: 50%;
        }
      
        & >span {
         z-index: 10;
         position:absolute;inset:0;
         text-align:center;align-content:center;
        }
   `;

export default Button;
