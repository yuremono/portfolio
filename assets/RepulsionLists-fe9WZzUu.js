import{a as T,j as s,L as ht}from"./maskMosaique-VSg3ctID.js";const tt=(n,i=0)=>{const e=Math.sin(n*12.9898+i*78.233)*43758.5453;return e-Math.floor(e)},k=n=>`${n.toFixed(2)}px`,et=n=>n.toFixed(2),B=1.4,st=.7,ft=400,xt=275,gt=80,yt=-15,vt=15,nt=1,St=.4,Et=80,it=400,M=50,D=300,ot=3,Lt=2,bt=.5,wt=2,It=600,rt=1181,lt=100,Tt=32,at=1e3,z=(n,i)=>{const e=i.x-n.x,t=i.y-n.y;return Math.sqrt(e*e+t*t)},O=n=>({x:n.left+n.width/2,y:n.top+n.height/2}),X=n=>{const i=new Map;return n.querySelectorAll("[data-repulsion-list-chip]").forEach(e=>{if(!(e instanceof HTMLElement))return;const t=e.getBoundingClientRect(),o=e.getAttribute("data-repulsion-list-item-id");!o||t.width<=0||t.height<=0||i.set(o,{id:o,point:O(t),element:e,jitterX:Number(e.getAttribute("data-jitter-x")||"0"),jitterY:Number(e.getAttribute("data-jitter-y")||"0")})}),i},Rt=(n,i)=>{const e=Math.atan2(i.y-n.y,i.x-n.x);return e<0?e+Math.PI*2:e},_t=n=>{const i=[],e=new Set;return n.forEach((t,o)=>{const r="point"in t?t.point:t,p=[];n.forEach((h,m)=>{if(o===m)return;const d="point"in h?h.point:h;p.push({id:m,point:d,distance:z(r,d),angle:Rt(r,d)})});const b=Math.PI*2/ot;for(let h=0;h<ot;h+=1){const m=h*b,d=(h+1)*b,x=p.filter(g=>d>Math.PI*2?g.angle>=m||g.angle<d-Math.PI*2:g.angle>=m&&g.angle<d);x.sort((g,y)=>g.distance-y.distance);const a=x[0];if(!a)continue;const f=o<a.id?`${o}-${a.id}`:`${a.id}-${o}`;e.has(f)||(e.add(f),i.push({id:f,from:r,to:a.point}))}}),i},jt=n=>{const i=new Map;n.forEach((t,o)=>i.set(o,{deltaX:0,deltaY:0}));const e=Array.from(n.entries());for(let t=0;t<e.length;t+=1)for(let o=t+1;o<e.length;o+=1){const[r,p]=e[t],[b,h]=e[o];if(z(p.point,h.point)>=D)continue;const m=p.element.querySelector(".repulsion-list-chip-label"),d=h.element.querySelector(".repulsion-list-chip-label");if(!m||!d)continue;const x=m.getBoundingClientRect(),a=d.getBoundingClientRect(),f=i.get(r),g=i.get(b);if(!f||!g)continue;const y={left:x.left+f.deltaX,right:x.right+f.deltaX,top:x.top+f.deltaY,bottom:x.bottom+f.deltaY,centerX:x.left+x.width/2+f.deltaX,centerY:x.top+x.height/2+f.deltaY},w={left:a.left+g.deltaX,right:a.right+g.deltaX,top:a.top+g.deltaY,bottom:a.bottom+g.deltaY,centerX:a.left+a.width/2+g.deltaX,centerY:a.top+a.height/2+g.deltaY};if(!!(y.right+M<w.left||y.left-M>w.right||y.bottom+M<w.top||y.top-M>w.bottom))continue;const P=Math.min(y.right,w.right)-Math.max(y.left,w.left)+M,C=Math.min(y.bottom,w.bottom)-Math.max(y.top,w.top)+M,j=y.centerX<w.centerX?-1:1,L=y.centerY<w.centerY?-1:1;C>=P?(f.deltaX+=P/2*j,g.deltaX-=P/2*j):(f.deltaY+=C/2*L,g.deltaY-=C/2*L)}return i},Nt=(n,i)=>{const e=new Map;return n.querySelectorAll("[data-repulsion-list-chip]").forEach(t=>{if(!(t instanceof HTMLElement))return;const o=t.getBoundingClientRect(),r=t.getAttribute("data-repulsion-list-item-id");if(!r||o.width<=0||o.height<=0)return;const p=O(o);e.set(r,{x:p.x-i.left,y:p.y-i.top})}),e},At=(n,i)=>({x:Math.max(-1,Math.min(1,(n-.5)*2))*yt,y:Math.max(-1,Math.min(1,(i-.5)*2))*vt}),Pt=(n,i)=>{const e=new Map;return n.forEach((t,o)=>{const r=z(i,t.point),p=Math.min(r/ft,1),b=B-(B-st)*p,h=nt-(nt-St)*p;e.set(o,{baseScale:b,visualScale:Math.max(st,Math.min(B,b)),visualOpacity:Math.max(0,Math.min(1,h)),distance:r})}),e},Ct=(n,i)=>{const e=new Map;return n.forEach((t,o)=>{let r=0,p=0;n.forEach((b,h)=>{if(o===h)return;const m=i.get(h);if(!m||m.baseScale<=1)return;const d=t.point.x-b.point.x,x=t.point.y-b.point.y,a=Math.sqrt(d*d+x*x);if(a>it||a===0)return;const f=Et*(m.baseScale-1)*Math.max(0,1-a/it);r+=d/a*f,p+=x/a*f}),e.set(o,{x:r,y:p})}),e},Mt=n=>{const i=new Map;return n.forEach((e,t)=>{i.set(t,{x:e.point.x,y:e.point.y})}),i},ct=(n,i,e)=>{const t=n.querySelector(".is-initial");if(!(t instanceof HTMLElement))return O(e);const o=t.getAttribute("data-repulsion-list-item-id");return o?i.get(o)?.point??O(e):O(e)},Ot=(n,i)=>{if(!i||i.size===0)return!1;let e=0;return n.forEach((t,o)=>{const r=i.get(o);r&&(e=Math.max(e,Math.abs(t.x-r.x),Math.abs(t.y-r.y)))}),e<bt},Ut=(n,i,e)=>{T.useEffect(()=>{const t=n.current;if(!t)return;const o=e.current;let r=null,p=null,b=null,h=!1,m=0,d=0,x=0,a=window.innerWidth,f=(at+lt*2-window.innerWidth)/2,g=0,y=0,w=0;const A=()=>{const l=t.getBoundingClientRect();return a=window.innerWidth,f=(at+lt*2-window.innerWidth)/2,l},P=(l,c)=>{const v=i.current;if(!v||l.width<=0||l.height<=0)return;const S=`0 0 ${l.width} ${l.height}`;if(v.getAttribute("viewBox")!==S&&v.setAttribute("viewBox",S),c.size===0)return;const _=new Map;v.querySelectorAll("line[data-connection-id]").forEach(u=>{if(!(u instanceof SVGLineElement))return;const E=u.getAttribute("data-connection-id");E&&_.set(E,u)}),_t(c).forEach(u=>{let E=_.get(u.id);E||(E=document.createElementNS("http://www.w3.org/2000/svg","line"),E.setAttribute("data-connection-id",u.id),E.setAttribute("stroke","#D7D7CF"),E.setAttribute("stroke-width","1"),E.setAttribute("stroke-opacity","0.8"),E.style.transition="x1 300ms ease-out, y1 300ms ease-out, x2 300ms ease-out, y2 300ms ease-out",v.appendChild(E)),E.setAttribute("x1",u.from.x.toString()),E.setAttribute("y1",u.from.y.toString()),E.setAttribute("x2",u.to.x.toString()),E.setAttribute("y2",u.to.y.toString()),_.delete(u.id)}),_.forEach(u=>u.remove())},C=(l,c)=>{const v=O(l);c.forEach((S,_)=>{const u=t.querySelector(`[data-repulsion-list-item-id="${_}"]`);if(!(u instanceof HTMLElement))return;const E=S.point.x<v.x,I=S.point.y<v.y;u.style.setProperty("--popup-top",I?"98%":"0%"),u.style.setProperty("--popup-left",E?"0%":"98%"),u.style.setProperty("--popup-translate-y",I?"0%":"-98%"),u.style.setProperty("--popup-translate-x",E?"0%":"-98%"),u.style.setProperty("--popup-origin-y",I?"top":"bottom"),u.style.setProperty("--popup-border-top",I?"1px solid #434343":"0"),u.style.setProperty("--popup-border-bottom",I?"0":"1px solid #434343"),u.style.setProperty("--popup-opens-down",I?"1.3":"0")})},j=(l,c,v=new Map)=>{const S=X(t),_=Pt(S,l),u=Ct(S,_);S.forEach(I=>{const U=_.get(I.id);if(!U)return;const K=u.get(I.id)??{x:0,y:0},Z=v.get(I.id)??{deltaX:0,deltaY:0},dt=c.x+K.x+I.jitterX/100*xt+Z.deltaX,mt=c.y+K.y+I.jitterY/100*gt+Z.deltaY;I.element.style.transform=`translate(${k(dt)}, ${k(mt)})`,I.element.style.setProperty("--repulsion-list-chip-dynamic-scale",et(U.visualScale)),I.element.style.setProperty("--repulsion-list-chip-dynamic-opacity",et(U.visualOpacity));const Q=I.element.getAttribute("data-state");U.distance<D&&Q==="idle"&&I.element.setAttribute("data-state","proximity"),U.distance>=D&&Q==="proximity"&&I.element.setAttribute("data-state","idle")});const E=t.getBoundingClientRect();return P(E,Nt(t,E)),S},L=()=>{const l=A();if(l.width<=0||l.height<=0)return;const c=X(t),v=jt(c);C(l,c),j(ct(t,c,l),{x:0,y:0},v)},R=()=>{p!==null&&cancelAnimationFrame(p),p=null,b=null,y=0,w=0},F=(l=!0)=>{R(),A();const c=performance.now(),v=()=>{if(performance.now()-c>It){l&&L(),R();return}const S=A();if(S.width<=0||S.height<=0){p=requestAnimationFrame(v);return}if(w+=1,w>=Lt){const u=X(t);j(ct(t,u,S),{x:0,y:0}),w=0}const _=Mt(X(t));if(Ot(_,b)){if(y+=1,y>=wt){l&&L(),R();return}}else y=0;b=_,p=requestAnimationFrame(v)};p=requestAnimationFrame(v)},ut=(l,c)=>{r===null&&(r=requestAnimationFrame(()=>{j(l,c),r=null}))},$=l=>{const c=t.getBoundingClientRect(),v=(l.clientX-c.left)/c.width,S=(l.clientY-c.top)/c.height;ut({x:l.clientX,y:l.clientY},At(v,S))},q=()=>{r!==null&&(cancelAnimationFrame(r),r=null),F(!1)},H=l=>{const c=l.detail;c&&j({x:c.x,y:c.y},{x:0,y:0})},W=()=>{window.innerWidth!==a&&(d=0,t.style.transform="",F(!0))},G=l=>{a>=rt||(h=!0,m=l.touches[0].clientX,x=d)},V=l=>{if(!h)return;const c=x+l.touches[0].clientX-m;if(Math.abs(c)>f)return;d=c,t.style.transform=`translateX(${c}px)`;const v=performance.now();if(v-g>=Tt){g=v;const S=A();j({x:a/2,y:S.top+S.height/2},{x:0,y:0})}},Y=()=>{if(h){const l=A();j({x:a/2,y:l.top+l.height/2},{x:0,y:0})}h=!1},J=l=>{if(a>=rt)return;const c=l.detail,v=X(t),S=c?.tagId?v.get(c.tagId):void 0;if(!S)return;const _=Math.max(-f,Math.min(f,a/2-S.point.x+d));d=_,t.style.transform=`translateX(${_}px)`;const u=A();j({x:a/2,y:u.top+u.height/2},{x:0,y:0})},pt=requestAnimationFrame(()=>F(!0));return t.addEventListener("repulsion-list-chip:focus",H),t.addEventListener("repulsion-list-chip:activate",J),t.addEventListener("mouseenter",R),t.addEventListener("mousemove",$),t.addEventListener("mouseleave",q),window.addEventListener("resize",W),o?.addEventListener("touchstart",G,{passive:!0}),o?.addEventListener("touchmove",V,{passive:!0}),o?.addEventListener("touchend",Y,{passive:!0}),o?.addEventListener("touchcancel",Y,{passive:!0}),()=>{cancelAnimationFrame(pt),r!==null&&cancelAnimationFrame(r),p!==null&&cancelAnimationFrame(p),t.removeEventListener("mousemove",$),t.removeEventListener("mouseleave",q),t.removeEventListener("mouseenter",R),t.removeEventListener("repulsion-list-chip:focus",H),t.removeEventListener("repulsion-list-chip:activate",J),window.removeEventListener("resize",W),o?.removeEventListener("touchstart",G),o?.removeEventListener("touchmove",V),o?.removeEventListener("touchend",Y),o?.removeEventListener("touchcancel",Y)}},[n,i,e])};function N({title:n,to:i,href:e,index:t=0,className:o,active:r=!1,onActivate:p,onClose:b,children:h}){const m=T.useRef(null),d=T.useRef(null),x=T.useRef(null),a=T.useRef(null),f=`repulsion-list-item-${t}`,g=T.useMemo(()=>{const L=tt(t,1),R=tt(t,2);return{x:(L-.5)*-10,y:(R-.5)*-10}},[t]),y=()=>{x.current!==null&&window.clearTimeout(x.current),a.current!==null&&window.clearTimeout(a.current),x.current=null,a.current=null},w=()=>{const L=m.current;L&&(y(),p?.(f),L.dispatchEvent(new CustomEvent("repulsion-list-chip:activate",{bubbles:!0,detail:{tagId:f}})))},A=()=>{y(),b?.(f)},P=()=>{y(),x.current=window.setTimeout(()=>{w(),x.current=null},50)},C=()=>{const L=m.current;if(!L)return;const R=L.getBoundingClientRect();L.dispatchEvent(new CustomEvent("repulsion-list-chip:focus",{bubbles:!0,detail:{x:R.left+R.width/2,y:R.top+R.height/2}}))};T.useEffect(()=>{const L=m.current,R=d.current;if(!(!L||!R)){if(r){y(),L.setAttribute("data-state","active"),R.style.setProperty("--repulsion-list-chip-grid-rows","1fr");return}L.getAttribute("data-state")==="active"&&(y(),L.setAttribute("data-state","closing"),R.style.setProperty("--repulsion-list-chip-grid-rows","0fr"),a.current=window.setTimeout(()=>{L.setAttribute("data-state","idle"),R.style.removeProperty("--repulsion-list-chip-grid-rows"),a.current=null},400))}},[r]),T.useEffect(()=>y,[]);const j={onFocus:()=>{C(),w()},onBlur:A};return s.jsx("li",{ref:m,"data-repulsion-list-chip":"true","data-repulsion-list-item-id":f,"data-state":"idle","data-jitter-x":g.x.toFixed(2),"data-jitter-y":g.y.toFixed(2),className:["repulsion-list-chip relative list-none bg-WH",o].filter(Boolean).join(" "),style:{transform:`translate(${k(g.x*10)}, ${k(g.y*0)})`},onMouseEnter:P,onMouseLeave:A,children:s.jsxs("div",{className:"repulsion-list-chip-control",children:[i?s.jsx(ht,{to:i,...j,children:s.jsx("div",{className:"repulsion-list-chip-content [font-size:clamp(2rem,_5vw,_5rem)] font-light",children:s.jsx("span",{className:"repulsion-list-chip-label block mx-auto p-4 whitespace-nowrap text-center bg-[repultion-list-light]",children:n})})}):e?s.jsx("a",{href:e,target:"_blank",rel:"noopener noreferrer",...j,children:s.jsx("div",{className:"repulsion-list-chip-content [font-size:clamp(2rem,_5vw,_5rem)] font-light",children:s.jsx("span",{className:"repulsion-list-chip-label block mx-auto p-4 whitespace-nowrap text-center bg-[repultion-list-light] ",children:n})})}):s.jsx("span",{className:" font-thin  z-10 leading-[1.25em] [font-size:calc(var(--mmFZ)*4.5)]",children:n}),s.jsx("div",{ref:d,className:"repulsion-list-chip-popup",children:h})]})})}const Xt=`
				.repulsion-lists-module {
					--repulsion-list-light: var(--WH);
					--repulsion-list-light-muted: var(--BC);
					--repulsion-list-dark: var(--TC);
					--repulsion-list-text-light: var(--WH);
				}
				.repulsion-lists-lines {
					position: absolute;
					inset: 0;
					overflow: visible;
					pointer-events: none;
                                        display:none;
				}
				.repulsion-lists-lines line {
					stroke-width: 1;
					stroke-opacity: .8;
					transition: x1 300ms ease-out, y1 300ms ease-out, x2 300ms ease-out, y2 300ms ease-out;
				}
				.repulsion-lists-list {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					width: 100%;
					height: 100%;
					margin: 0;
					padding: 0;
					list-style: none;

				}
				// .repulsion-list-chip {
					// transition: transform 400ms cubic-bezier(.34, 1.56, .64, 1);
				// }
				.repulsion-list-chip-control {
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
				.repulsion-list-chip-control a {
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
				.repulsion-list-chip-content::before {
					content: "";
					position: absolute;
					inset: -1.25rem;
				}
				// .repulsion-list-chip-label {
				// 	transition: min-width 50ms ease-out, background-color 50ms ease-out, color 50ms ease-out;
				// }
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
						// margin-inline: 100px;
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
`;function Yt({activeId:n,children:i,onActivate:e,onClose:t}){return T.Children.map(i,(o,r)=>{if(!T.isValidElement(o))return o;const p=`repulsion-list-item-${r}`;return T.cloneElement(o,{index:r,active:n===p,onActivate:e,onClose:t})})}function Ft({className:n}){const i=T.useRef(null),e=T.useRef(null),t=T.useRef(null),[o,r]=T.useState(null);Ut(i,e,t);const p=T.useCallback(m=>{r(m)},[]),b=T.useCallback(m=>{r(d=>d===m?null:d)},[]),h=T.useCallback(()=>{r(null)},[]);return s.jsxs("section",{className:["",n].filter(Boolean).join(" "),children:[s.jsx("style",{children:Xt}),s.jsx("div",{ref:t,id:"repulsion-lists-horizontal-scroll-container",className:"repulsion-lists-viewport",onPointerLeave:h,onBlur:m=>{const d=m.relatedTarget;(!(d instanceof Node)||!m.currentTarget.contains(d))&&h()},children:s.jsxs("div",{ref:i,id:"repulsion-lists-card-container",children:[s.jsx("svg",{ref:e,className:"repulsion-lists-lines",viewBox:"0 0 0 0",preserveAspectRatio:"none","data-connection-lines":"true","aria-hidden":"true"}),s.jsx("ul",{className:"repulsion-lists-list","aria-label":"Repulsion list",children:s.jsxs(Yt,{activeId:o,onActivate:p,onClose:b,children:[s.jsx(N,{title:"Other Works",className:"is-initial pointer-events-none mr-4 -mt-4 bg-transparent"}),s.jsxs(N,{title:"Random Generator",to:"/rects",className:"mt-4 ",children:[s.jsx("p",{children:"コントローラー付きのランダム図形配置ジェネレーター"}),s.jsxs("details",{className:"Toggle IsSmall font-normal ",children:[s.jsx("summary",{className:"Eng",children:"SVG..."}),s.jsx("div",{children:"セル数、コンテナを埋める方向性、図形の種類(正方形、三角形、星、十字)、角度などを調整。rect,circle等SVGタグのスニペットをコピペできる。"})]}),s.jsxs("details",{className:"Toggle IsSmall font-normal ",children:[s.jsx("summary",{className:"Eng",children:"Rects..."}),s.jsx("div",{children:"divタグの大きさ、個数、角丸、重なり可否などを指定。いいバランスの時にコピーして画像配置などでそのまま使う想定。SVG出力も可。"})]})]}),s.jsxs(N,{title:"Agent Driven CMS",to:"/donut",className:"",children:[s.jsx("p",{children:"Codex または Claude Code を Next.js Node runtimeで中継。ローカルブラウザでエージェントに直接ソースコードを編集させるCMS"}),s.jsxs("details",{className:"Toggle IsSmall font-normal ",children:[s.jsx("summary",{className:"Eng",children:"Detail..."}),s.jsxs("div",{children:["- AI時代では 「チャットで編集できるwebサイト」が求められると仮定する",s.jsx("br",{}),"- ローカル完結ならモデル性能依存を解消できる",s.jsx("br",{}),"- フロントエンド以外は全て仕様駆動。",s.jsx("br",{}),"考察： リテラシーの高いクライアント＆十分な初期サポートという条件は必須と考えていたし、体験としては有意義であるが、エージェントの行動への責任は「サポート」ではカバーできないことを実感した。ここまでやるならCursor、Codex等の使い方自体をサポートした方が無難。と考えました。"]})]})]}),s.jsx(N,{title:"Shuffle Divide",to:"/shuffleDivide",children:s.jsx("p",{children:"制作サイトの部分再現です。"})}),s.jsx(N,{title:"Glitch",to:"/glitch",children:s.jsx("p",{children:"制作サイトの部分再現です。"})}),s.jsx(N,{title:"Grid Carousel",to:"/grid-carousel",className:"mt-4",children:s.jsx("p",{children:"グリッドカルーセルです。"})}),s.jsx(N,{title:"Bounding Box On Design",to:"/bbox",className:"",children:s.jsx("p",{children:"AI生成のLPデザインにバウンディングボックスを配置し、画像+構造化データをエージェントに渡すツールです。"})}),s.jsx(N,{title:"Activity",to:"/activity",className:"",children:s.jsx("p",{children:"職務要約と活動記録を書いています。"})}),s.jsx(N,{title:"Chat Canban",href:"https://chat-kanban.vercel.app/",className:"-mt-8",children:s.jsxs("p",{children:["ローカル環境の特定ブラウザ(Chromium系)に拡張機能をインストールし、ChatGPTやGeminiにチャット履歴を送信するためのUIを設置。特定のurlでまとめて閲覧。ムーバブルサイドバー機能付き。",s.jsx("br",{}),"＊デモページ。当サイトに統合していません。"]})}),s.jsx(N,{title:"NextJs CMS",href:"https://cms0505.vercel.app/editor",className:"mt-4",children:s.jsx("p",{children:"AI駆動開発最初の制作物。実務で経験できないシステム設計、データ管理、React、TypeScriptを学ぶため、単一ページ専用CMSを作成。閲覧pass: view"})}),s.jsx(N,{title:"PortfolioWP",href:"https://yuremono.com/",className:"-mt-4",children:s.jsx("p",{children:"このページ (ReactSPA) をwordpressに移植しています。 実務で使用経験がないので概念を学びながら可能な限りエージェントに実装させています。"})})]})})]})})]})}export{Ft as R};
