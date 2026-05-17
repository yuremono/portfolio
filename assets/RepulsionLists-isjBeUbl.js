import{a as T,j as i,L as ht}from"./maskMosaique-VSg3ctID.js";const tt=(s,n=0)=>{const e=Math.sin(s*12.9898+n*78.233)*43758.5453;return e-Math.floor(e)},Y=s=>`${s.toFixed(2)}px`,et=s=>s.toFixed(2),B=1.4,st=.7,ft=400,gt=275,xt=80,yt=-15,vt=15,nt=1,St=.4,Et=80,it=400,M=50,D=300,ot=3,Lt=2,bt=.5,wt=2,It=600,rt=1181,lt=100,Tt=32,at=1e3,z=(s,n)=>{const e=n.x-s.x,t=n.y-s.y;return Math.sqrt(e*e+t*t)},O=s=>({x:s.left+s.width/2,y:s.top+s.height/2}),k=s=>{const n=new Map;return s.querySelectorAll("[data-repulsion-list-chip]").forEach(e=>{if(!(e instanceof HTMLElement))return;const t=e.getBoundingClientRect(),o=e.getAttribute("data-repulsion-list-item-id");!o||t.width<=0||t.height<=0||n.set(o,{id:o,point:O(t),element:e,jitterX:Number(e.getAttribute("data-jitter-x")||"0"),jitterY:Number(e.getAttribute("data-jitter-y")||"0")})}),n},Rt=(s,n)=>{const e=Math.atan2(n.y-s.y,n.x-s.x);return e<0?e+Math.PI*2:e},_t=s=>{const n=[],e=new Set;return s.forEach((t,o)=>{const r="point"in t?t.point:t,p=[];s.forEach((h,m)=>{if(o===m)return;const d="point"in h?h.point:h;p.push({id:m,point:d,distance:z(r,d),angle:Rt(r,d)})});const b=Math.PI*2/ot;for(let h=0;h<ot;h+=1){const m=h*b,d=(h+1)*b,g=p.filter(x=>d>Math.PI*2?x.angle>=m||x.angle<d-Math.PI*2:x.angle>=m&&x.angle<d);g.sort((x,y)=>x.distance-y.distance);const a=g[0];if(!a)continue;const f=o<a.id?`${o}-${a.id}`:`${a.id}-${o}`;e.has(f)||(e.add(f),n.push({id:f,from:r,to:a.point}))}}),n},jt=s=>{const n=new Map;s.forEach((t,o)=>n.set(o,{deltaX:0,deltaY:0}));const e=Array.from(s.entries());for(let t=0;t<e.length;t+=1)for(let o=t+1;o<e.length;o+=1){const[r,p]=e[t],[b,h]=e[o];if(z(p.point,h.point)>=D)continue;const m=p.element.querySelector(".repulsion-list-chip-label"),d=h.element.querySelector(".repulsion-list-chip-label");if(!m||!d)continue;const g=m.getBoundingClientRect(),a=d.getBoundingClientRect(),f=n.get(r),x=n.get(b);if(!f||!x)continue;const y={left:g.left+f.deltaX,right:g.right+f.deltaX,top:g.top+f.deltaY,bottom:g.bottom+f.deltaY,centerX:g.left+g.width/2+f.deltaX,centerY:g.top+g.height/2+f.deltaY},w={left:a.left+x.deltaX,right:a.right+x.deltaX,top:a.top+x.deltaY,bottom:a.bottom+x.deltaY,centerX:a.left+a.width/2+x.deltaX,centerY:a.top+a.height/2+x.deltaY};if(!!(y.right+M<w.left||y.left-M>w.right||y.bottom+M<w.top||y.top-M>w.bottom))continue;const P=Math.min(y.right,w.right)-Math.max(y.left,w.left)+M,C=Math.min(y.bottom,w.bottom)-Math.max(y.top,w.top)+M,j=y.centerX<w.centerX?-1:1,L=y.centerY<w.centerY?-1:1;C>=P?(f.deltaX+=P/2*j,x.deltaX-=P/2*j):(f.deltaY+=C/2*L,x.deltaY-=C/2*L)}return n},At=(s,n)=>{const e=new Map;return s.querySelectorAll("[data-repulsion-list-chip]").forEach(t=>{if(!(t instanceof HTMLElement))return;const o=t.getBoundingClientRect(),r=t.getAttribute("data-repulsion-list-item-id");if(!r||o.width<=0||o.height<=0)return;const p=O(o);e.set(r,{x:p.x-n.left,y:p.y-n.top})}),e},Nt=(s,n)=>({x:Math.max(-1,Math.min(1,(s-.5)*2))*yt,y:Math.max(-1,Math.min(1,(n-.5)*2))*vt}),Pt=(s,n)=>{const e=new Map;return s.forEach((t,o)=>{const r=z(n,t.point),p=Math.min(r/ft,1),b=B-(B-st)*p,h=nt-(nt-St)*p;e.set(o,{baseScale:b,visualScale:Math.max(st,Math.min(B,b)),visualOpacity:Math.max(0,Math.min(1,h)),distance:r})}),e},Ct=(s,n)=>{const e=new Map;return s.forEach((t,o)=>{let r=0,p=0;s.forEach((b,h)=>{if(o===h)return;const m=n.get(h);if(!m||m.baseScale<=1)return;const d=t.point.x-b.point.x,g=t.point.y-b.point.y,a=Math.sqrt(d*d+g*g);if(a>it||a===0)return;const f=Et*(m.baseScale-1)*Math.max(0,1-a/it);r+=d/a*f,p+=g/a*f}),e.set(o,{x:r,y:p})}),e},Mt=s=>{const n=new Map;return s.forEach((e,t)=>{n.set(t,{x:e.point.x,y:e.point.y})}),n},ct=(s,n,e)=>{const t=s.querySelector(".is-initial");if(!(t instanceof HTMLElement))return O(e);const o=t.getAttribute("data-repulsion-list-item-id");return o?n.get(o)?.point??O(e):O(e)},Ot=(s,n)=>{if(!n||n.size===0)return!1;let e=0;return s.forEach((t,o)=>{const r=n.get(o);r&&(e=Math.max(e,Math.abs(t.x-r.x),Math.abs(t.y-r.y)))}),e<bt},Ut=(s,n,e)=>{T.useEffect(()=>{const t=s.current;if(!t)return;const o=e.current;let r=null,p=null,b=null,h=!1,m=0,d=0,g=0,a=window.innerWidth,f=(at+lt*2-window.innerWidth)/2,x=0,y=0,w=0;const A=()=>{const l=t.getBoundingClientRect();return a=window.innerWidth,f=(at+lt*2-window.innerWidth)/2,l},P=(l,c)=>{const v=n.current;if(!v||l.width<=0||l.height<=0)return;const S=`0 0 ${l.width} ${l.height}`;if(v.getAttribute("viewBox")!==S&&v.setAttribute("viewBox",S),c.size===0)return;const _=new Map;v.querySelectorAll("line[data-connection-id]").forEach(u=>{if(!(u instanceof SVGLineElement))return;const E=u.getAttribute("data-connection-id");E&&_.set(E,u)}),_t(c).forEach(u=>{let E=_.get(u.id);E||(E=document.createElementNS("http://www.w3.org/2000/svg","line"),E.setAttribute("data-connection-id",u.id),E.setAttribute("stroke","#D7D7CF"),E.setAttribute("stroke-width","1"),E.setAttribute("stroke-opacity","0.8"),E.style.transition="x1 300ms ease-out, y1 300ms ease-out, x2 300ms ease-out, y2 300ms ease-out",v.appendChild(E)),E.setAttribute("x1",u.from.x.toString()),E.setAttribute("y1",u.from.y.toString()),E.setAttribute("x2",u.to.x.toString()),E.setAttribute("y2",u.to.y.toString()),_.delete(u.id)}),_.forEach(u=>u.remove())},C=(l,c)=>{const v=O(l);c.forEach((S,_)=>{const u=t.querySelector(`[data-repulsion-list-item-id="${_}"]`);if(!(u instanceof HTMLElement))return;const E=S.point.x<v.x,I=S.point.y<v.y;u.style.setProperty("--popup-top",I?"98%":"0%"),u.style.setProperty("--popup-left",E?"0%":"98%"),u.style.setProperty("--popup-translate-y",I?"0%":"-98%"),u.style.setProperty("--popup-translate-x",E?"0%":"-98%"),u.style.setProperty("--popup-origin-y",I?"top":"bottom"),u.style.setProperty("--popup-border-top",I?"1px solid #434343":"0"),u.style.setProperty("--popup-border-bottom",I?"0":"1px solid #434343"),u.style.setProperty("--popup-opens-down",I?"1.3":"0")})},j=(l,c,v=new Map)=>{const S=k(t),_=Pt(S,l),u=Ct(S,_);S.forEach(I=>{const U=_.get(I.id);if(!U)return;const K=u.get(I.id)??{x:0,y:0},Z=v.get(I.id)??{deltaX:0,deltaY:0},dt=c.x+K.x+I.jitterX/100*gt+Z.deltaX,mt=c.y+K.y+I.jitterY/100*xt+Z.deltaY;I.element.style.transform=`translate(${Y(dt)}, ${Y(mt)})`,I.element.style.setProperty("--repulsion-list-chip-dynamic-scale",et(U.visualScale)),I.element.style.setProperty("--repulsion-list-chip-dynamic-opacity",et(U.visualOpacity));const Q=I.element.getAttribute("data-state");U.distance<D&&Q==="idle"&&I.element.setAttribute("data-state","proximity"),U.distance>=D&&Q==="proximity"&&I.element.setAttribute("data-state","idle")});const E=t.getBoundingClientRect();return P(E,At(t,E)),S},L=()=>{const l=A();if(l.width<=0||l.height<=0)return;const c=k(t),v=jt(c);C(l,c),j(ct(t,c,l),{x:0,y:0},v)},R=()=>{p!==null&&cancelAnimationFrame(p),p=null,b=null,y=0,w=0},F=(l=!0)=>{R(),A();const c=performance.now(),v=()=>{if(performance.now()-c>It){l&&L(),R();return}const S=A();if(S.width<=0||S.height<=0){p=requestAnimationFrame(v);return}if(w+=1,w>=Lt){const u=k(t);j(ct(t,u,S),{x:0,y:0}),w=0}const _=Mt(k(t));if(Ot(_,b)){if(y+=1,y>=wt){l&&L(),R();return}}else y=0;b=_,p=requestAnimationFrame(v)};p=requestAnimationFrame(v)},ut=(l,c)=>{r===null&&(r=requestAnimationFrame(()=>{j(l,c),r=null}))},$=l=>{const c=t.getBoundingClientRect(),v=(l.clientX-c.left)/c.width,S=(l.clientY-c.top)/c.height;ut({x:l.clientX,y:l.clientY},Nt(v,S))},q=()=>{r!==null&&(cancelAnimationFrame(r),r=null),F(!1)},H=l=>{const c=l.detail;c&&j({x:c.x,y:c.y},{x:0,y:0})},W=()=>{window.innerWidth!==a&&(d=0,t.style.transform="",F(!0))},G=l=>{a>=rt||(h=!0,m=l.touches[0].clientX,g=d)},V=l=>{if(!h)return;const c=g+l.touches[0].clientX-m;if(Math.abs(c)>f)return;d=c,t.style.transform=`translateX(${c}px)`;const v=performance.now();if(v-x>=Tt){x=v;const S=A();j({x:a/2,y:S.top+S.height/2},{x:0,y:0})}},X=()=>{if(h){const l=A();j({x:a/2,y:l.top+l.height/2},{x:0,y:0})}h=!1},J=l=>{if(a>=rt)return;const c=l.detail,v=k(t),S=c?.tagId?v.get(c.tagId):void 0;if(!S)return;const _=Math.max(-f,Math.min(f,a/2-S.point.x+d));d=_,t.style.transform=`translateX(${_}px)`;const u=A();j({x:a/2,y:u.top+u.height/2},{x:0,y:0})},pt=requestAnimationFrame(()=>F(!0));return t.addEventListener("repulsion-list-chip:focus",H),t.addEventListener("repulsion-list-chip:activate",J),t.addEventListener("mouseenter",R),t.addEventListener("mousemove",$),t.addEventListener("mouseleave",q),window.addEventListener("resize",W),o?.addEventListener("touchstart",G,{passive:!0}),o?.addEventListener("touchmove",V,{passive:!0}),o?.addEventListener("touchend",X,{passive:!0}),o?.addEventListener("touchcancel",X,{passive:!0}),()=>{cancelAnimationFrame(pt),r!==null&&cancelAnimationFrame(r),p!==null&&cancelAnimationFrame(p),t.removeEventListener("mousemove",$),t.removeEventListener("mouseleave",q),t.removeEventListener("mouseenter",R),t.removeEventListener("repulsion-list-chip:focus",H),t.removeEventListener("repulsion-list-chip:activate",J),window.removeEventListener("resize",W),o?.removeEventListener("touchstart",G),o?.removeEventListener("touchmove",V),o?.removeEventListener("touchend",X),o?.removeEventListener("touchcancel",X)}},[s,n,e])};function N({title:s,to:n,href:e,index:t=0,className:o,active:r=!1,onActivate:p,onClose:b,children:h}){const m=T.useRef(null),d=T.useRef(null),g=T.useRef(null),a=T.useRef(null),f=`repulsion-list-item-${t}`,x=T.useMemo(()=>{const L=tt(t,1),R=tt(t,2);return{x:(L-.5)*-10,y:(R-.5)*-10}},[t]),y=()=>{g.current!==null&&window.clearTimeout(g.current),a.current!==null&&window.clearTimeout(a.current),g.current=null,a.current=null},w=()=>{const L=m.current;L&&(y(),p?.(f),L.dispatchEvent(new CustomEvent("repulsion-list-chip:activate",{bubbles:!0,detail:{tagId:f}})))},A=()=>{y(),b?.(f)},P=()=>{y(),g.current=window.setTimeout(()=>{w(),g.current=null},50)},C=()=>{const L=m.current;if(!L)return;const R=L.getBoundingClientRect();L.dispatchEvent(new CustomEvent("repulsion-list-chip:focus",{bubbles:!0,detail:{x:R.left+R.width/2,y:R.top+R.height/2}}))};T.useEffect(()=>{const L=m.current,R=d.current;if(!(!L||!R)){if(r){y(),L.setAttribute("data-state","active"),R.style.setProperty("--repulsion-list-chip-grid-rows","1fr");return}L.getAttribute("data-state")==="active"&&(y(),L.setAttribute("data-state","closing"),R.style.setProperty("--repulsion-list-chip-grid-rows","0fr"),a.current=window.setTimeout(()=>{L.setAttribute("data-state","idle"),R.style.removeProperty("--repulsion-list-chip-grid-rows"),a.current=null},400))}},[r]),T.useEffect(()=>y,[]);const j={onFocus:()=>{C(),w()},onBlur:A};return i.jsx("li",{ref:m,"data-repulsion-list-chip":"true","data-repulsion-list-item-id":f,"data-state":"idle","data-jitter-x":x.x.toFixed(2),"data-jitter-y":x.y.toFixed(2),className:["repulsion-list-chip",o].filter(Boolean).join(" "),style:{transform:`translate(${Y(x.x*10)}, ${Y(x.y*0)})`},onMouseEnter:P,onMouseLeave:A,children:i.jsxs("div",{className:"repulsion-list-chip-control",children:[n?i.jsx(ht,{to:n,...j,children:i.jsx("div",{className:"repulsion-list-chip-content",children:i.jsx("span",{className:"repulsion-list-chip-label",children:s})})}):e?i.jsx("a",{href:e,target:"_blank",rel:"noopener noreferrer",...j,children:i.jsx("div",{className:"repulsion-list-chip-content",children:i.jsx("span",{className:"repulsion-list-chip-label ",children:s})})}):i.jsx("span",{className:" font-thin   z-10 leading-[1.25em] [font-size:calc(var(--mmFZ)*4)]",children:s}),i.jsx("div",{ref:d,className:"repulsion-list-chip-popup",children:h})]})})}const kt=`
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
`;function Xt({activeId:s,children:n,onActivate:e,onClose:t}){return T.Children.map(n,(o,r)=>{if(!T.isValidElement(o))return o;const p=`repulsion-list-item-${r}`;return T.cloneElement(o,{index:r,active:s===p,onActivate:e,onClose:t})})}function Ft({className:s}){const n=T.useRef(null),e=T.useRef(null),t=T.useRef(null),[o,r]=T.useState(null);Ut(n,e,t);const p=T.useCallback(m=>{r(m)},[]),b=T.useCallback(m=>{r(d=>d===m?null:d)},[]),h=T.useCallback(()=>{r(null)},[]);return i.jsxs("section",{className:["",s].filter(Boolean).join(" "),children:[i.jsx("style",{children:kt}),i.jsx("div",{ref:t,id:"repulsion-lists-horizontal-scroll-container",className:"repulsion-lists-viewport",onPointerLeave:h,onBlur:m=>{const d=m.relatedTarget;(!(d instanceof Node)||!m.currentTarget.contains(d))&&h()},children:i.jsxs("div",{ref:n,id:"repulsion-lists-card-container",children:[i.jsx("svg",{ref:e,className:"repulsion-lists-lines",viewBox:"0 0 0 0",preserveAspectRatio:"none","data-connection-lines":"true","aria-hidden":"true"}),i.jsx("ul",{className:"repulsion-lists-list","aria-label":"Repulsion list",children:i.jsxs(Xt,{activeId:o,onActivate:p,onClose:b,children:[i.jsx(N,{title:"Other Works",className:"is-initial pointer-events-none mr-12 -mt-4"}),i.jsxs(N,{title:"Agent Driven CMS",to:"/donut",className:"",children:[i.jsx("p",{children:"Codex または Claude Code を Next.js Node runtimeで中継。ローカルブラウザでエージェントに直接ソースコードを編集させるCMS"}),i.jsxs("details",{className:"Toggle IsSmall font-normal ",children:[i.jsx("summary",{className:"Eng",children:"Detail..."}),i.jsxs("div",{children:["- AI時代では 「チャットで編集できるwebサイト」が求められると仮定する",i.jsx("br",{}),"- ローカル完結ならモデル性能依存を解消できる",i.jsx("br",{}),"- フロントエンド以外は全て仕様駆動。",i.jsx("br",{}),"考察： リテラシーの高いクライアント＆十分な初期サポートという条件は必須と考えていたし、体験としては有意義であるが、エージェントの行動への責任は「サポート」ではカバーできないことを実感した。ここまでやるならCursor、Codex等の使い方自体をサポートした方が無難。と考えました。"]})]})]}),i.jsxs(N,{title:"Random Generator",to:"/rects",className:"mt-4",children:[i.jsx("p",{children:"コントローラー付きのランダム図形配置ジェネレーター"}),i.jsxs("details",{className:"Toggle IsSmall font-normal ",children:[i.jsx("summary",{className:"Eng",children:"SVG..."}),i.jsx("div",{children:"セル数、コンテナを埋める方向性、図形の種類(正方形、三角形、星、十字)、角度などを調整。rect,circle等SVGタグのスニペットをコピペできる。"})]}),i.jsxs("details",{className:"Toggle IsSmall font-normal ",children:[i.jsx("summary",{className:"Eng",children:"Rects..."}),i.jsx("div",{children:"divタグの大きさ、個数、角丸、重なり可否などを指定。いいバランスの時にコピーして画像配置などでそのまま使う想定。SVG出力も可。"})]})]}),i.jsx(N,{title:"Shuffle Divide",to:"/shuffleDivide",children:i.jsx("p",{children:"制作サイトの部分再現です。"})}),i.jsx(N,{title:"Glitch",to:"/glitch",children:i.jsx("p",{children:"制作サイトの部分再現です。"})}),i.jsx(N,{title:"Grid Carousel",to:"/grid-carousel",children:i.jsx("p",{children:"グリッドカルーセルです。"})}),i.jsx(N,{title:"Bounding Box On Design",to:"/bbox",className:"-mb-4",children:i.jsx("p",{children:"AI生成のLPデザインにバウンディングボックスを配置し、画像+構造化データをエージェントに渡すツールです。"})}),i.jsx(N,{title:"Activity",to:"/activity",children:i.jsx("p",{children:"職務要約と活動記録を書いています。"})}),i.jsx(N,{title:"Chat Canban.app",href:"https://chat-kanban.vercel.app/",className:"mb-4",children:i.jsxs("p",{children:["ローカル環境の特定ブラウザ(Chromium系)に拡張機能をインストールし、ChatGPTやGeminiにチャット履歴を送信するためのUIを設置。特定のurlでまとめて閲覧。ムーバブルサイドバー機能付き。",i.jsx("br",{}),"＊デモページ。当サイトに統合していません。"]})})]})})]})})]})}export{Ft as R};
