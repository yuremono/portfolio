/**
 * ヘッダー変形: #Header:not(.UpInit) はページ先頭からのスクロール量（IO センチネル）
 * #Header.UpInit はスクロール方向
 * 元: js/function.js 220–269 行
 */

/** CSS: `:root { --transH: … }`（単位は任意。センチネルの height にそのまま使う） */
const TRANS_H_VAR = "--transH";
const TRANS_H_FALLBACK = "100px";

/** .UpInit: 直前位置との差がこの値を超えたときだけ方向を更新 */
const SCROLL_DIRECTION_THRESHOLD = 20;

function readTransH(doc: Document): string {
	const raw = getComputedStyle(doc.documentElement)
		.getPropertyValue(TRANS_H_VAR)
		.trim();
	return raw || TRANS_H_FALLBACK;
}

export type RuntimeDisconnect = { disconnect: () => void };

export function initHeaderTrans(
	root: Document | Element = document,
): RuntimeDisconnect {
	const doc = root instanceof Document ? root : root.ownerDocument!;

	// --- #Header:not(.UpInit) 用: ビューポート先頭から「まだページ上部」とみなす帯を IO で監視 ---
	// センチネルがビューポートと交差している = まだ閾値以内のスクロール → .trans を外す
	// 交差しない = その帯が上に抜けた = 閾値以上スクロールした → .trans を付ける
	// （スクロールイベントで毎回 scrollTop を読まない）
	const headerIO = doc.querySelector("#Header:not(.UpInit)");

	// --- #Header.UpInit 用: スクロール方向で .trans を付け外し（従来どおり rAF + scroll） ---
	const headerScroll = doc.querySelector("#Header.UpInit");

	const sentinelHost = root instanceof Document ? doc.body : root;
	let sentinelEl: HTMLDivElement | null = null;
	let observerH: IntersectionObserver | null = null;

	if (headerIO && sentinelHost) {
		// センチネル: ドキュメント先頭に「高さ --transH の帯」があるとみなす（初期化時に 1 回だけ読む）。
		// height:0 の親の中に absolute だけ置くと、IO が交差 0 と判定して常に !isIntersecting になり
		// .trans が常時オンになることがあるため、通常フローで高さを持たせる。
		// margin-bottom を負にして後続コンテンツを引き上げ、見た目のレイアウトはほぼ変えない。
		const transH = readTransH(doc);
		sentinelEl = doc.createElement("div");
		sentinelEl.setAttribute("aria-hidden", "true");
		sentinelEl.setAttribute("data-header-trans-sentinel", "");
		sentinelEl.style.cssText = [
			"width:1px",
			`height:${transH}`,
			"margin:0",
			`margin-bottom:calc(0px - ${transH})`,
			"padding:0",
			"border:0",
			"flex-shrink:0",
			"pointer-events:none",
			"visibility:hidden",
		].join(";");
		sentinelHost.insertBefore(sentinelEl, sentinelHost.firstChild);

		observerH = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!headerIO) continue;
					if (entry.isIntersecting) {
						headerIO.classList.remove("trans");
					} else {
						headerIO.classList.add("trans");
					}
				}
			},
			{ threshold: 0 },
		);
		observerH.observe(sentinelEl);
	}

	let lastScroll = 0;
	let ticking = false;

	const onScroll = () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				const currentScroll =
					window.pageYOffset || doc.documentElement.scrollTop;
				const scrollDiff = currentScroll - lastScroll;

				// 微小なスクロールでは lastScroll を更新しない（ジャッタ抑制）
				if (Math.abs(scrollDiff) > SCROLL_DIRECTION_THRESHOLD) {
					if (scrollDiff > 0) {
						headerScroll?.classList.add("trans");
					} else {
						headerScroll?.classList.remove("trans");
					}
					lastScroll = currentScroll;
				}
				ticking = false;
			});
			ticking = true;
		}
	};

	// UpInit 時のみ headerScroll が存在するので、実質そこだけが反応する
	window.addEventListener("scroll", onScroll, { passive: true });

	return {
		disconnect: () => {
			observerH?.disconnect();
			sentinelEl?.remove();
			window.removeEventListener("scroll", onScroll);
		},
	};
}
