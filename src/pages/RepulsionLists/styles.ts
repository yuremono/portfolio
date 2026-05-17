export const repulsionListsStyles = `
				.repulsion-lists-module {
					--repulsion-list-light: var(--WH);
					--repulsion-list-light-muted: var(--BC);
					--repulsion-list-dark: var(--TC);
					--repulsion-list-text-light: var(--WH);
				}
				.repulsion-lists-module .repulsion-lists-lines {
					position: absolute;
					inset: 0;
					overflow: visible;
					pointer-events: none;
                                        display:none;
				}
				.repulsion-lists-module .repulsion-lists-lines line {
					stroke-width: 1;
					stroke-opacity: .8;
					transition: x1 300ms ease-out, y1 300ms ease-out, x2 300ms ease-out, y2 300ms ease-out;
				}
				.repulsion-lists-module .repulsion-lists-list {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					width: 100%;
					height: 100%;
					margin: 0;
					padding: 0;
					list-style: none;

				}
				.repulsion-lists-module .repulsion-list-chip {
					position: relative;
					list-style: none;
					transition: transform 400ms cubic-bezier(.34, 1.56, .64, 1);
                                        background: var(--WH);
				}
				.repulsion-lists-module .repulsion-list-chip-control {
					display: block;
					width: 100%;
                                        height:100%;
                                        align-content:center;
					padding: 0;
					border: 0;
					background: transparent;
					cursor: pointer;
					color: inherit;
					text-decoration: none;
					position: relative;
					transform-origin: center;
					scale: .65625;
					transform: scale(var(--repulsion-list-chip-dynamic-scale, 1));
					transition: transform var(--btnTR) cubic-bezier(.5, 1.25, .64, 1);
					// transition: transform 500ms cubic-bezier(0, 1, 0.75, 1);
					opacity: var(--repulsion-list-chip-dynamic-opacity, .5);
				}
				.repulsion-lists-module .repulsion-list-chip-control a {
					color: inherit;
					text-decoration: none;
				}
				.repulsion-list-chip-content {
					position: relative;
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: .625rem;
					min-width: 18.75rem;
					margin-inline: auto;
					color: var(--repulsion-list-dark);
					line-height: 1;
					letter-spacing: -.05em;
					text-wrap: pretty;
					user-select: none;
					transition: background-color 200ms ease-out, min-width 200ms ease-out;
				}
				@media (min-width: 58.75rem) {
					.repulsion-list-chip-content {
						font-size: clamp(2rem, 5vw, 5rem);
					}
				}
				.repulsion-list-chip-content::before {
					content: "";
					position: absolute;
					inset: -1.25rem;
				}
				.repulsion-lists-module .repulsion-list-chip-label {
					display: block;
					min-width: 0;
					margin-inline: auto;
					padding: 1rem;
					white-space: nowrap;
					text-align: center;
					background: var(--repulsion-list-light);
					transition: min-width 50ms ease-out, background-color 50ms ease-out, color 50ms ease-out;
				}
				.repulsion-lists-module .emojis,
				.repulsion-lists-module .counter {
					position: absolute;
					left: .25rem;
					width: 2.5rem;
					height: 2.5rem;
					pointer-events: none;
				}
				.repulsion-lists-module .emojis > div {
					position: relative;
					width: 2.5rem;
					height: 2.5rem;
				}
				.repulsion-lists-module .emoji {
					position: absolute;
					width: 2.5rem;
					height: 2.5rem;
					pointer-events: none;
				}
				.repulsion-lists-module .counter {
					display: none;
					align-items: center;
					justify-content: center;
					gap: .25rem;
					color: var(--repulsion-list-light-muted);
					font-size: .875rem;
					opacity: 0;
					scale: 0;
					transition: opacity 200ms ease-out, scale 200ms ease-out;
				}
				.repulsion-lists-module .repulsion-list-chip-popup {
					position: absolute;
					z-index: 20;
					top: var(--popup-top, 100%);
					left: var(--popup-left, 0%);
					width: 100%;
					display: grid;
					grid-template-rows: var(--repulsion-list-chip-grid-rows, 0fr);
					background: var(--repulsion-list-dark);
					color: var(--repulsion-list-text-light);
					text-align: left;
					opacity: 0;
					pointer-events: none;
					transform: translate(var(--popup-translate-x, 0%), var(--popup-translate-y, 0%));
					transform-origin: center var(--popup-origin-y, top);
					border-top: var(--popup-border-top);
					border-bottom: var(--popup-border-bottom);
					transition: grid-template-rows 300ms cubic-bezier(.34, 1.56, .64, 1), opacity 0ms linear 50ms;
                                        overflow: hidden;
                                        padding: 1rem 1rem .625rem;
                                        cursor: default;
				}
				.repulsion-lists-module .repulsion-list-chip-popup p {
					margin: 0 0 .625rem;
					font-size: 1rem;
				}
				.repulsion-lists-module .repulsion-list-chip-popup span {
					color: var(--repulsion-list-light-muted);
					font-size: .8rem;
				}
				.repulsion-lists-module [data-state="proximity"] .counter,
				.repulsion-lists-module [data-state="active"] .counter,
				.repulsion-lists-module [data-state="closing"] .counter {
					display: flex;
					opacity: 1;
					scale: 1;
				}
				.repulsion-lists-module [data-state="active"],
				.repulsion-lists-module [data-state="closing"] {
					z-index: 10;
				}
				.repulsion-lists-module [data-state="active"] .repulsion-list-chip-label,
				.repulsion-lists-module [data-state="closing"] .repulsion-list-chip-label {
					color: var(--repulsion-list-text-light);
					background: var(--repulsion-list-dark);
					min-width: 18.75rem;
				}
				.repulsion-lists-module [data-state="active"] .repulsion-list-chip-control {
					--repulsion-list-chip-dynamic-scale: 1.4;
					--repulsion-list-chip-dynamic-opacity: 1;
				}
				.repulsion-lists-module [data-state="active"] .repulsion-list-chip-popup {
					pointer-events: auto;
					opacity: 1;
				}
				.repulsion-lists-module [data-state="closing"] .repulsion-list-chip-popup {
					pointer-events: none;
					opacity: 0;
				}
				.repulsion-lists-module [data-state="active"] .emoji {
					animation: repulsion_lists_emoji_rise var(--random-duration, 5s) ease-out var(--random-delay, 0s) forwards;
				}
				@keyframes repulsion_lists_emoji_rise {
					0% {
						transform: translate(-50%) translateY(0) scale(var(--random-scale, 1));
						opacity: 1;
					}
					70% {
						opacity: 1;
					}
					100% {
						transform: translate(-50%) translateY(-200px) scale(var(--random-scale, 1));
						opacity: 0;
					}
				}
				@media (min-width: 1181px) {
					.repulsion-lists-module .repulsion-lists-viewport {
						display: block;
					}
					.repulsion-lists-module #repulsion-lists-card-container {
						width: 100%;
						height: auto;
						margin-inline: 0;
					}
				}
				@media (max-width: 767px) {
					.repulsion-lists-module {
						width: 100vw;
						max-width: none;
						margin-inline: calc(50% - 50vw);
					}
					.repulsion-lists-module .repulsion-lists-intro h3 {
						font-size: clamp(2.6rem, 16vw, 5rem);
					}
					.repulsion-lists-module .repulsion-lists-viewport {
						justify-content: flex-start;
						// overflow: hidden;
						padding-block: 3rem;
					}
					.repulsion-lists-module #repulsion-lists-card-container {
						width: 1000px;
						// height: 500px;
						margin-inline: 100px;
					}
				}
				@media (prefers-reduced-motion: reduce) {
					.repulsion-lists-module *,
					.repulsion-lists-module *::before,
					.repulsion-lists-module *::after {
						animation: none !important;
						transition-duration: 0ms !important;
					}
				}
`;
