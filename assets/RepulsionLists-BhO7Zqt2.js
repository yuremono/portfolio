import{a as R,j as s,L as St}from"./maskMosaique-VSg3ctID.js";import{s as bt,i as Et}from"./useClientRuntime-CxNkt1Yl.js";const ot=(n,i=0)=>{const e=Math.sin(n*12.9898+i*78.233)*43758.5453;return e-Math.floor(e)},D=n=>`${n.toFixed(2)}px`,rt=n=>n.toFixed(2),V=1.4,lt=.7,Lt=400,wt=275,It=80,Tt=-15,Rt=15,at=1,_t=.4,jt=80,ct=400,O=50,q=300,ut=3,Nt=2,Pt=.5,At=2,Mt=600,pt=1181,dt=100,Ct=32,mt=1e3,H=(n,i)=>{const e=i.x-n.x,t=i.y-n.y;return Math.sqrt(e*e+t*t)},U=n=>({x:n.left+n.width/2,y:n.top+n.height/2}),X=n=>{const i=new Map;return n.querySelectorAll("[data-repulsion-list-chip]").forEach(e=>{if(!(e instanceof HTMLElement))return;const t=e.getBoundingClientRect(),o=e.getAttribute("data-repulsion-list-item-id");!o||t.width<=0||t.height<=0||i.set(o,{id:o,point:U(t),element:e,jitterX:Number(e.getAttribute("data-jitter-x")||"0"),jitterY:Number(e.getAttribute("data-jitter-y")||"0")})}),i},Ot=(n,i)=>{const e=Math.atan2(i.y-n.y,i.x-n.x);return e<0?e+Math.PI*2:e},Ut=n=>{const i=[],e=new Set;return n.forEach((t,o)=>{const l="point"in t?t.point:t,d=[];n.forEach((h,m)=>{if(o===m)return;const p="point"in h?h.point:h;d.push({id:m,point:p,distance:H(l,p),angle:Ot(l,p)})});const w=Math.PI*2/ut;for(let h=0;h<ut;h+=1){const m=h*w,p=(h+1)*w,x=d.filter(y=>p>Math.PI*2?y.angle>=m||y.angle<p-Math.PI*2:y.angle>=m&&y.angle<p);x.sort((y,v)=>y.distance-v.distance);const a=x[0];if(!a)continue;const f=o<a.id?`${o}-${a.id}`:`${a.id}-${o}`;e.has(f)||(e.add(f),i.push({id:f,from:l,to:a.point}))}}),i},kt=n=>{const i=new Map;n.forEach((t,o)=>i.set(o,{deltaX:0,deltaY:0}));const e=Array.from(n.entries());for(let t=0;t<e.length;t+=1)for(let o=t+1;o<e.length;o+=1){const[l,d]=e[t],[w,h]=e[o];if(H(d.point,h.point)>=q)continue;const m=d.element.querySelector(".repulsion-list-chip-label"),p=h.element.querySelector(".repulsion-list-chip-label");if(!m||!p)continue;const x=m.getBoundingClientRect(),a=p.getBoundingClientRect(),f=i.get(l),y=i.get(w);if(!f||!y)continue;const v={left:x.left+f.deltaX,right:x.right+f.deltaX,top:x.top+f.deltaY,bottom:x.bottom+f.deltaY,centerX:x.left+x.width/2+f.deltaX,centerY:x.top+x.height/2+f.deltaY},I={left:a.left+y.deltaX,right:a.right+y.deltaX,top:a.top+y.deltaY,bottom:a.bottom+y.deltaY,centerX:a.left+a.width/2+y.deltaX,centerY:a.top+a.height/2+y.deltaY};if(!!(v.right+O<I.left||v.left-O>I.right||v.bottom+O<I.top||v.top-O>I.bottom))continue;const j=Math.min(v.right,I.right)-Math.max(v.left,I.left)+O,P=Math.min(v.bottom,I.bottom)-Math.max(v.top,I.top)+O,C=v.centerX<I.centerX?-1:1,E=v.centerY<I.centerY?-1:1;P>=j?(f.deltaX+=j/2*C,y.deltaX-=j/2*C):(f.deltaY+=P/2*E,y.deltaY-=P/2*E)}return i},Xt=(n,i)=>{const e=new Map;return n.querySelectorAll("[data-repulsion-list-chip]").forEach(t=>{if(!(t instanceof HTMLElement))return;const o=t.getBoundingClientRect(),l=t.getAttribute("data-repulsion-list-item-id");if(!l||o.width<=0||o.height<=0)return;const d=U(o);e.set(l,{x:d.x-i.left,y:d.y-i.top})}),e},Yt=(n,i)=>({x:Math.max(-1,Math.min(1,(n-.5)*2))*Tt,y:Math.max(-1,Math.min(1,(i-.5)*2))*Rt}),Dt=(n,i)=>{const e=new Map;return n.forEach((t,o)=>{const l=H(i,t.point),d=Math.min(l/Lt,1),w=V-(V-lt)*d,h=at-(at-_t)*d;e.set(o,{baseScale:w,visualScale:Math.max(lt,Math.min(V,w)),visualOpacity:Math.max(0,Math.min(1,h)),distance:l})}),e},Bt=(n,i)=>{const e=new Map;return n.forEach((t,o)=>{let l=0,d=0;n.forEach((w,h)=>{if(o===h)return;const m=i.get(h);if(!m||m.baseScale<=1)return;const p=t.point.x-w.point.x,x=t.point.y-w.point.y,a=Math.sqrt(p*p+x*x);if(a>ct||a===0)return;const f=jt*(m.baseScale-1)*Math.max(0,1-a/ct);l+=p/a*f,d+=x/a*f}),e.set(o,{x:l,y:d})}),e},Ft=n=>{const i=new Map;return n.forEach((e,t)=>{i.set(t,{x:e.point.x,y:e.point.y})}),i},ht=(n,i,e)=>{const t=n.querySelector(".is-initial");if(!(t instanceof HTMLElement))return U(e);const o=t.getAttribute("data-repulsion-list-item-id");return o?i.get(o)?.point??U(e):U(e)},zt=(n,i)=>{if(!i||i.size===0)return!1;let e=0;return n.forEach((t,o)=>{const l=i.get(o);l&&(e=Math.max(e,Math.abs(t.x-l.x),Math.abs(t.y-l.y)))}),e<Pt},$t=(n,i,e)=>{R.useEffect(()=>{const t=n.current;if(!t)return;const o=e.current;let l=null,d=null,w=null,h=!1,m=0,p=0,x=0,a=window.innerWidth,f=(mt+dt*2-window.innerWidth)/2,y=0,v=0,I=0,N=!1,j=Et();const P=()=>{const r=t.getBoundingClientRect();return a=window.innerWidth,f=(mt+dt*2-window.innerWidth)/2,r},C=(r,c)=>{const g=i.current;if(!g||r.width<=0||r.height<=0)return;const S=`0 0 ${r.width} ${r.height}`;if(g.getAttribute("viewBox")!==S&&g.setAttribute("viewBox",S),c.size===0)return;const _=new Map;g.querySelectorAll("line[data-connection-id]").forEach(u=>{if(!(u instanceof SVGLineElement))return;const b=u.getAttribute("data-connection-id");b&&_.set(b,u)}),Ut(c).forEach(u=>{let b=_.get(u.id);b||(b=document.createElementNS("http://www.w3.org/2000/svg","line"),b.setAttribute("data-connection-id",u.id),b.setAttribute("stroke","#D7D7CF"),b.setAttribute("stroke-width","1"),b.setAttribute("stroke-opacity","0.8"),b.style.transition="x1 300ms ease-out, y1 300ms ease-out, x2 300ms ease-out, y2 300ms ease-out",g.appendChild(b)),b.setAttribute("x1",u.from.x.toString()),b.setAttribute("y1",u.from.y.toString()),b.setAttribute("x2",u.to.x.toString()),b.setAttribute("y2",u.to.y.toString()),_.delete(u.id)}),_.forEach(u=>u.remove())},E=(r,c)=>{const g=U(r);c.forEach((S,_)=>{const u=t.querySelector(`[data-repulsion-list-item-id="${_}"]`);if(!(u instanceof HTMLElement))return;const b=S.point.x<g.x,T=S.point.y<g.y;u.style.setProperty("--popup-top",T?"98%":"0%"),u.style.setProperty("--popup-left",b?"0%":"98%"),u.style.setProperty("--popup-translate-y",T?"0%":"-98%"),u.style.setProperty("--popup-translate-x",b?"0%":"-98%"),u.style.setProperty("--popup-origin-y",T?"top":"bottom"),u.style.setProperty("--popup-border-top",T?"1px solid #434343":"0"),u.style.setProperty("--popup-border-bottom",T?"0":"1px solid #434343"),u.style.setProperty("--popup-opens-down",T?"1.3":"0")})},L=(r,c,g=new Map)=>{const S=X(t),_=Dt(S,r),u=Bt(S,_);S.forEach(T=>{const k=_.get(T.id);if(!k)return;const st=u.get(T.id)??{x:0,y:0},nt=g.get(T.id)??{deltaX:0,deltaY:0},yt=c.x+st.x+T.jitterX/100*wt+nt.deltaX,vt=c.y+st.y+T.jitterY/100*It+nt.deltaY;T.element.style.transform=`translate(${D(yt)}, ${D(vt)})`,T.element.style.setProperty("--repulsion-list-chip-dynamic-scale",rt(k.visualScale)),T.element.style.setProperty("--repulsion-list-chip-dynamic-opacity",rt(k.visualOpacity));const it=T.element.getAttribute("data-state");k.distance<q&&it==="idle"&&T.element.setAttribute("data-state","proximity"),k.distance>=q&&it==="proximity"&&T.element.setAttribute("data-state","idle")});const b=t.getBoundingClientRect();return C(b,Xt(t,b)),S},W=()=>{const r=P();if(r.width<=0||r.height<=0)return;const c=X(t),g=kt(c);E(r,c),L(ht(t,c,r),{x:0,y:0},g)},M=()=>{d!==null&&cancelAnimationFrame(d),d=null,w=null,v=0,I=0},B=()=>{l!==null&&(cancelAnimationFrame(l),l=null),M()},F=(r=!0)=>{!N||!j||z(r)},z=(r=!0)=>{if(!N||!j)return;M(),P();const c=performance.now(),g=()=>{if(!N||!j){M();return}if(performance.now()-c>Mt){r&&W(),M();return}const S=P();if(S.width<=0||S.height<=0){d=requestAnimationFrame(g);return}if(I+=1,I>=Nt){const u=X(t);L(ht(t,u,S),{x:0,y:0}),I=0}const _=Ft(X(t));if(zt(_,w)){if(v+=1,v>=At){r&&W(),M();return}}else v=0;w=_,d=requestAnimationFrame(g)};d=requestAnimationFrame(g)},ft=(r,c)=>{l===null&&(l=requestAnimationFrame(()=>{L(r,c),l=null}))},G=r=>{const c=t.getBoundingClientRect(),g=(r.clientX-c.left)/c.width,S=(r.clientY-c.top)/c.height;ft({x:r.clientX,y:r.clientY},Yt(g,S))},J=()=>{l!==null&&(cancelAnimationFrame(l),l=null),z(!1)},K=r=>{const c=r.detail;c&&L({x:c.x,y:c.y},{x:0,y:0})},Z=()=>{window.innerWidth!==a&&(p=0,t.style.transform="",N&&j?z(!0):M())},Q=r=>{a>=pt||(h=!0,m=r.touches[0].clientX,x=p)},tt=r=>{if(!h)return;const c=x+r.touches[0].clientX-m;if(Math.abs(c)>f)return;p=c,t.style.transform=`translateX(${c}px)`;const g=performance.now();if(g-y>=Ct){y=g;const S=P();L({x:a/2,y:S.top+S.height/2},{x:0,y:0})}},Y=()=>{if(h){const r=P();L({x:a/2,y:r.top+r.height/2},{x:0,y:0})}h=!1},et=r=>{if(a>=pt)return;const c=r.detail,g=X(t),S=c?.tagId?g.get(c.tagId):void 0;if(!S)return;const _=Math.max(-f,Math.min(f,a/2-S.point.x+p));p=_,t.style.transform=`translateX(${_}px)`;const u=P();L({x:a/2,y:u.top+u.height/2},{x:0,y:0})},gt="60% 0px 60% 0px",$=typeof IntersectionObserver>"u"?null:new IntersectionObserver(r=>{const c=r[0],g=c.isIntersecting||c.intersectionRatio>0;if(N=g,g&&j){F(!0);return}B()},{root:null,rootMargin:gt,threshold:0});$?.observe(t),$||(N=!0),N&&j&&F(!0);const xt=bt(r=>{if(j=r,!r){B();return}N&&F(!0)});return t.addEventListener("repulsion-list-chip:focus",K),t.addEventListener("repulsion-list-chip:activate",et),t.addEventListener("mouseenter",M),t.addEventListener("mousemove",G),t.addEventListener("mouseleave",J),window.addEventListener("resize",Z),o?.addEventListener("touchstart",Q,{passive:!0}),o?.addEventListener("touchmove",tt,{passive:!0}),o?.addEventListener("touchend",Y,{passive:!0}),o?.addEventListener("touchcancel",Y,{passive:!0}),()=>{xt(),$?.disconnect(),B(),t.removeEventListener("mousemove",G),t.removeEventListener("mouseleave",J),t.removeEventListener("mouseenter",M),t.removeEventListener("repulsion-list-chip:focus",K),t.removeEventListener("repulsion-list-chip:activate",et),window.removeEventListener("resize",Z),o?.removeEventListener("touchstart",Q),o?.removeEventListener("touchmove",tt),o?.removeEventListener("touchend",Y),o?.removeEventListener("touchcancel",Y)}},[n,i,e])};function A({title:n,to:i,href:e,index:t=0,className:o,active:l=!1,onActivate:d,onClose:w,children:h}){const m=R.useRef(null),p=R.useRef(null),x=R.useRef(null),a=R.useRef(null),f=`repulsion-list-item-${t}`,y=R.useMemo(()=>{const E=ot(t,1),L=ot(t,2);return{x:(E-.5)*-10,y:(L-.5)*-10}},[t]),v=()=>{x.current!==null&&window.clearTimeout(x.current),a.current!==null&&window.clearTimeout(a.current),x.current=null,a.current=null},I=()=>{const E=m.current;E&&(v(),d?.(f),E.dispatchEvent(new CustomEvent("repulsion-list-chip:activate",{bubbles:!0,detail:{tagId:f}})))},N=()=>{v(),w?.(f)},j=()=>{v(),x.current=window.setTimeout(()=>{I(),x.current=null},50)},P=()=>{const E=m.current;if(!E)return;const L=E.getBoundingClientRect();E.dispatchEvent(new CustomEvent("repulsion-list-chip:focus",{bubbles:!0,detail:{x:L.left+L.width/2,y:L.top+L.height/2}}))};R.useEffect(()=>{const E=m.current,L=p.current;if(!(!E||!L)){if(l){v(),E.setAttribute("data-state","active"),L.style.setProperty("--repulsion-list-chip-grid-rows","1fr");return}E.getAttribute("data-state")==="active"&&(v(),E.setAttribute("data-state","closing"),L.style.setProperty("--repulsion-list-chip-grid-rows","0fr"),a.current=window.setTimeout(()=>{E.setAttribute("data-state","idle"),L.style.removeProperty("--repulsion-list-chip-grid-rows"),a.current=null},400))}},[l]),R.useEffect(()=>v,[]);const C={onFocus:()=>{P(),I()},onBlur:N};return s.jsx("li",{ref:m,"data-repulsion-list-chip":"true","data-repulsion-list-item-id":f,"data-state":"idle","data-jitter-x":y.x.toFixed(2),"data-jitter-y":y.y.toFixed(2),className:["repulsion-list-chip relative list-none bg-WH",o].filter(Boolean).join(" "),style:{transform:`translate(${D(y.x*10)}, ${D(y.y*0)})`},onMouseEnter:j,onMouseLeave:N,children:s.jsxs("div",{className:"repulsion-list-chip-control",children:[i?s.jsx(St,{to:i,...C,children:s.jsx("div",{className:"repulsion-list-chip-content [font-size:clamp(2rem,_5vw,_5rem)] font-light",children:s.jsx("span",{className:"repulsion-list-chip-label block mx-auto p-4 whitespace-nowrap text-center bg-[repultion-list-light]",children:n})})}):e?s.jsx("a",{href:e,target:"_blank",rel:"noopener noreferrer",...C,children:s.jsx("div",{className:"repulsion-list-chip-content [font-size:clamp(2rem,_5vw,_5rem)] font-light",children:s.jsx("span",{className:"repulsion-list-chip-label block mx-auto p-4 whitespace-nowrap text-center bg-[repultion-list-light] ",children:n})})}):s.jsx("span",{className:" font-thin  z-10 leading-[1.25em] [font-size:calc(var(--mmFZ)*4)]",children:n}),s.jsx("div",{ref:p,className:"repulsion-list-chip-popup",children:h})]})})}const Vt=`
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
`;function qt({activeId:n,children:i,onActivate:e,onClose:t}){return R.Children.map(i,(o,l)=>{if(!R.isValidElement(o))return o;const d=`repulsion-list-item-${l}`;return R.cloneElement(o,{index:l,active:n===d,onActivate:e,onClose:t})})}function Gt({className:n}){const i=R.useRef(null),e=R.useRef(null),t=R.useRef(null),[o,l]=R.useState(null);$t(i,e,t);const d=R.useCallback(m=>{l(m)},[]),w=R.useCallback(m=>{l(p=>p===m?null:p)},[]),h=R.useCallback(()=>{l(null)},[]);return s.jsxs("section",{className:["",n].filter(Boolean).join(" "),children:[s.jsx("style",{children:Vt}),s.jsx("div",{ref:t,id:"repulsion-lists-horizontal-scroll-container",className:"repulsion-lists-viewport",onPointerLeave:h,onBlur:m=>{const p=m.relatedTarget;(!(p instanceof Node)||!m.currentTarget.contains(p))&&h()},children:s.jsxs("div",{ref:i,id:"repulsion-lists-card-container",children:[s.jsx("svg",{ref:e,className:"repulsion-lists-lines",viewBox:"0 0 0 0",preserveAspectRatio:"none","data-connection-lines":"true","aria-hidden":"true"}),s.jsx("ul",{className:"repulsion-lists-list","aria-label":"Repulsion list",children:s.jsxs(qt,{activeId:o,onActivate:d,onClose:w,children:[s.jsx(A,{title:"Pages and Tools",className:"is-initial pointer-events-none mr-4 -mt-4 bg-transparent"}),s.jsxs(A,{title:"Random Generator",to:"/rects",className:"mt-4 ",children:[s.jsx("p",{children:"コントローラー付きのランダム図形配置ジェネレーター"}),s.jsxs("details",{className:"Toggle IsSmall font-normal ",children:[s.jsx("summary",{className:"Eng",children:"SVG..."}),s.jsx("div",{children:"セル数、コンテナを埋める方向性、図形の種類(正方形、三角形、星、十字)、角度などを調整。rect,circle等SVGタグのスニペットをコピペできる。"})]}),s.jsxs("details",{className:"Toggle IsSmall font-normal ",children:[s.jsx("summary",{className:"Eng",children:"Rects..."}),s.jsx("div",{children:"divタグの大きさ、個数、角丸、重なり可否などを指定。いいバランスの時にコピーして画像配置などでそのまま使う想定。SVG出力も可。"})]})]}),s.jsxs(A,{title:"Agent Driven CMS",to:"/donut",className:"",children:[s.jsx("p",{children:"Codex または Claude Code を Next.js Node runtimeで中継。ローカルブラウザでエージェントに直接ソースコードを編集させるCMS"}),s.jsxs("details",{className:"Toggle IsSmall font-normal ",children:[s.jsx("summary",{className:"Eng",children:"Thinking..."}),s.jsxs("div",{children:["- 「チャットで編集できるCMS」より先に「ブラウザ直接操作」ができるようになっている",s.jsx("br",{}),"- それが現実的になる前の実験プロジェクト",s.jsx("br",{}),"- フロントエンド以外は全て仕様駆動。",s.jsx("br",{}),"考察： リテラシーの高いクライアント＆十分な初期サポートという条件は必須と考えていたし、体験としては面白いが、エージェントの行動への責任は「サポート」ではカバーできないことを実感した。ここまでやるならCursor、Codex等の使い方自体をサポートした方が現実的。と考えました。"]})]})]}),s.jsx(A,{title:"Shuffle Divide",to:"/shuffleDivide",children:s.jsx("p",{children:"制作サイトの部分再現です。"})}),s.jsx(A,{title:"Glitch",to:"/glitch",children:s.jsx("p",{children:"制作サイトの部分再現です。"})}),s.jsx(A,{title:"Grid Carousel",to:"/grid-carousel",className:"mt-4",children:s.jsx("p",{children:"グリッドカルーセルです。"})}),s.jsx(A,{title:"Bounding Box On Design",to:"/bbox",className:"",children:s.jsx("p",{children:"AI生成のLPデザインにバウンディングボックスを配置し、画像+構造化データをエージェントに渡すツールです。"})}),s.jsx(A,{title:"Activity",to:"/activity",className:"",children:s.jsx("p",{children:"職務要約と活動記録を書いています。"})}),s.jsx(A,{title:"Chat Canban",href:"https://chat-kanban.vercel.app/",className:"-mt-8",children:s.jsxs("p",{children:["ローカル環境の特定ブラウザ(Chromium系)に拡張機能をインストールし、ChatGPTやGeminiにチャット履歴を送信するためのUIを設置。特定のurlでまとめて閲覧。ムーバブルサイドバー機能付き。",s.jsx("br",{}),"＊デモページ。当サイトに統合していません。"]})}),s.jsx(A,{title:"NextJs CMS",href:"https://cms0505.vercel.app/editor",className:"mt-4",children:s.jsx("p",{children:"AI駆動開発最初の制作物。実務で経験できないシステム設計、データ管理、React、TypeScriptを学ぶため、単一ページ専用CMSを作成。閲覧pass: view"})}),s.jsx(A,{title:"WP-Izakaya",href:"https://yuremono.com/izakaya",className:"-mt-4",children:s.jsx("p",{children:"過去に構築した居酒屋サイトの静的htmlからWordPressテーマを作成。 全肯定をSKILL化しつつ、wpの概念と作法を学びました。"})})]})})]})})]})}export{Gt as R};
