import { useEffect, useMemo, useRef, useState } from "react";
import { Image } from "../components/Image";

import Header from "../components/Header";
import { PageRoot } from "../components/PageRoot";
import { Footer } from "../components/Footer";
import { useClientRuntime } from "../hooks/useClientRuntime";
import { useHtmlRootClass } from "../hooks/useHtmlRootClass";
import { getAssetPath } from "../lib/assetPath";
import { POSTS } from "../lib/activityPosts";

const DEFAULT_IMAGE = "/images/picsum/019.jpg";

/* ==========================================================================
 * ナビゲーション（左ペイン）のカテゴリ振り分け設定
 *   1 つ目の UL（PRIMARY）が必ず上、2 つ目の UL（SECONDARY）が下に並ぶ。
 *   PRIMARY に列挙したカテゴリ以外（未登録カテゴリ含む）は自動的に SECONDARY に入る。
 *   SECONDARY を明示したいカテゴリだけで制限したい場合は、配列に値を入れる。
 *   各 UL 内は `priority` 降順 → `dateTime` 降順でソート済み（POSTS の順）。
 *   UL をまたいでのソートは行わない。
 * ========================================================================== */
/** 1 つ目の UL に集めるカテゴリ */
const NAV_CATEGORIES_PRIMARY = ["職務要約"] as const;
/** 2 つ目の UL に集めるカテゴリ。空配列の場合は PRIMARY 以外すべてが対象 */
const NAV_CATEGORIES_SECONDARY = [] as const satisfies readonly string[];

/** `--head` の算出 px 値を取得（4.5rem のような単位でも対応） */
function measureHeadPx(): number {
	if (typeof window === "undefined") return 0;
	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue("--head")
		.trim();
	if (!raw) return 0;
	const probe = document.createElement("div");
	probe.style.cssText = `position:absolute;visibility:hidden;height:${raw};pointer-events:none;`;
	document.body.appendChild(probe);
	const px = probe.getBoundingClientRect().height;
	probe.remove();
	return px;
}

function Activity() {
	const pageRootRef = useRef<HTMLDivElement>(null);
	useClientRuntime({ rootRef: pageRootRef });
	useHtmlRootClass("[--head:6rem]");

	// const [activeId, setActiveId] = useState(POSTS[0]?.id ?? "");
	// const active = POSTS.find((p) => p.id === activeId) ?? POSTS[0];

	const [activeIndex, setActiveIndex] = useState(0);
	const articleRefs = useRef<Array<HTMLElement | null>>([]);

	const currentImage = useMemo(() => {
		const post = POSTS[activeIndex];
		return post?.image ?? DEFAULT_IMAGE;
	}, [activeIndex]);

	const primaryPosts = useMemo(
		() =>
			POSTS.filter((p) =>
				(NAV_CATEGORIES_PRIMARY as readonly string[]).includes(
					p.category ?? "",
				),
			),
		[],
	);
	const secondaryPosts = useMemo(() => {
		const secondary = NAV_CATEGORIES_SECONDARY as readonly string[];
		const primary = NAV_CATEGORIES_PRIMARY as readonly string[];
		return POSTS.filter((p) => {
			if (primary.includes(p.category ?? "")) return false;
			if (secondary.length === 0) return true;
			return secondary.includes(p.category ?? "");
		});
	}, []);

	useEffect(() => {
		const els = articleRefs.current.filter(
			(el): el is HTMLElement => el !== null,
		);
		if (!els.length) return;

		let observer: IntersectionObserver | null = null;

		const build = () => {
			const headPx = measureHeadPx();
			const vh = window.innerHeight;
			const bottom = Math.max(0, vh - headPx);
			observer?.disconnect();
			observer = new IntersectionObserver(
				(entries) => {
					const hits = entries
						.filter((e) => e.isIntersecting)
						.map((e) => els.indexOf(e.target as HTMLElement))
						.filter((i) => i !== -1);
					if (hits.length === 0) return;
					const next = Math.max(...hits);
					setActiveIndex((prev) => (prev === next ? prev : next));
				},
				{
					rootMargin: `-${headPx}px 0px -${bottom}px 0px`,
					threshold: 0,
				},
			);
			els.forEach((el) => observer!.observe(el));
		};

		build();

		const onResize = () => build();
		window.addEventListener("resize", onResize);

		return () => {
			observer?.disconnect();
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return (
		<PageRoot ref={pageRootRef} className="[--HFF:--Ship] ">
			<Header className="LinkShadow UpInit " />

			<main
				id="main-activity"
				className="min-h-screen mt-[--head] pb-[--MY]"
			>
				<section className="Stick out [--scr:100%] [--shift:100%] PX bp-lg [--wid:clamp(36em,50%,720px)] ">
					<div className="StickItem Cards col2 lg:[--gap:--wid] top-[--head] text-left lg:text-right lg:h-[calc(100lvh-var(--head)-var(--PX))]">
						<div
							className="item p-[--PX] bg-[--WH] BorderXY rounded-[--btnRad] content-center"
							aria-label="記事の切り替え"
						>
							<h1 className="h3FZ mb-4">職務要約と活動記録</h1>
							<nav className="italic  ">
								{/* 1 つ目の UL（必ず上に表示。カテゴリは NAV_CATEGORIES_PRIMARY で設定） */}
								<ul className="space-x-3">
									{primaryPosts.map((p) => (
										<li className="inline-block" key={p.id}>
											<a
												href={`#panel-${p.id}`}
												id={`tab-${p.id}`}
												className="text-lg font-medium  underline"
											>
												{p.label}
											</a>
										</li>
									))}
								</ul>
								{/* 2 つ目の UL（下に表示。カテゴリは NAV_CATEGORIES_SECONDARY で設定） */}
								<ul className="space-x-3">
									{secondaryPosts.map((p) => (
										<li className="inline-block " key={p.id}>
											<a
												href={`#panel-${p.id}`}
												id={`tab-${p.id}`}
												className="   underline"
											>
												{p.label}
											</a>
										</li>
									))}
								</ul>
							</nav>
						</div>
						<Image
							className="item content-center"
							image={getAssetPath(currentImage)}
							alt=""
						/>
					</div>
					<div className="StickScr  [--h3FZ:1.25em] pointer-events-none">
						<div className=" w-[--wid]   mx-auto p-4 lg:p-0 pointer-events-auto">
							{POSTS.map((post, i) => (
								<article
									key={post.id}
									ref={(el) => {
										articleRefs.current[i] = el;
									}}
									id={`panel-${post.id}`}
									className="   scroll-mt-[--head] BorderB"
									aria-labelledby={`tab-${post.id}`}
								>
									<header className="sticky top-[--head] z-10 px-8  py-8 rounded-t-[--btnRad] bg-[--BC80] backdrop-blur-sm">
										<p className="mb-2 text-sm sub">
											<time dateTime={post.dateTime}>
												{post.dateTime}
											</time>
										</p>
										<h2 className="h3FZ text-[--MC]">
											{post.title}
										</h2>
									</header>
									<div
										className="px-8 pb-12 space-y-3 leading-relaxed MarkDown"
										dangerouslySetInnerHTML={{
											__html: post.bodyHtml,
										}}
									/>
								</article>
							))}
						</div>
					</div>
				</section>

                                {/* tab version */}
				{/* <section className="out PX MY">
					<h1 className="h2FZ mb-6">職務要約と活動記録</h1>

					<div className="Flex37 bp-sm  [--gap:1em]">
						<div
							className="p-[--PX] bg-[--WH] BorderXY rounded-[--btnRad]  Cards col3 items-start [--btnW:--itemW]"
							role="tablist"
							aria-label="記事の切り替え"
						>
							{POSTS.map((p) => (
								<button
									key={p.id}
									type="button"
									role="tab"
									id={`tab-${p.id}`}
									aria-selected={activeId === p.id}
									aria-controls={`panel-${p.id}`}
									className={[
										"textlink",
										activeId === p.id ? "__bc" : "",
									]
										.filter(Boolean)
										.join(" ")}
									onClick={() => setActiveId(p.id)}
								>
									{p.label}
								</button>
							))}
						</div>

						<article
							className="BorderXY  rounded-[--btnRad] p-6 bg-[--WH50]"
							role="tabpanel"
							id={`panel-${active?.id}`}
							aria-labelledby={
								active ? `tab-${active.id}` : undefined
							}
						>
							{active ? (
								<>
									<p className="mb-2 text-sm opacity-75">
										<time dateTime={active.dateTime}>
											{active.dateTime}
										</time>
									</p>
									<h2 className="h3FZ mb-4 text-[--MC]">
										{active.title}
									</h2>
									<div
										className="space-y-3 leading-relaxed"
										dangerouslySetInnerHTML={{
											__html: active.bodyHtml,
										}}
									/>
								</>
							) : null}
						</article>
					</div>
				</section> */}
			</main>

			<Footer />
		</PageRoot>
	);
}

export default Activity;
