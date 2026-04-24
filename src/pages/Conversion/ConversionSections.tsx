type SectionId =
	| "night-transfer"
	| "afterimage"
	| "city-loop"
	| "soft-noise"
	| "drift-system";

interface MetricItem {
	label: string;
	value: string;
}

interface SectionContent {
	id: SectionId;
	index: string;
	eyebrow: string;
	title: string;
	description: string;
	lead: string;
	metrics: MetricItem[];
}

const sectionContents: SectionContent[] = [
	{
		id: "night-transfer",
		index: "01",
		eyebrow: "arrival corridor",
		title: "Night transfer",
		description:
			"到着直後の速度感をそのまま受け止める導入区画。Hero の光量を少しだけ落として、後から駅構内や移動導線のビジュアルを重ねやすい面に整理している。",
		lead: "Transit layer prepared for photo or loop insert.",
		metrics: [
			{ label: "flow", value: "22:30 / inbound" },
			{ label: "surface", value: "wide light band" },
			{ label: "swap", value: "still / motion" },
		],
	},
	{
		id: "afterimage",
		index: "02",
		eyebrow: "residual glow",
		title: "Afterimage",
		description:
			"輪郭よりも残像を見せるための、余白が主体のセクション。文字量を抑え、あとからフェードや反射を足しても破綻しないように左右の密度差を残している。",
		lead: "Text stays calm so the trailing light can grow later.",
		metrics: [
			{ label: "echo", value: "soft copy" },
			{ label: "depth", value: "split haze" },
			{ label: "motion", value: "fade ready" },
		],
	},
	{
		id: "city-loop",
		index: "03",
		eyebrow: "circulation map",
		title: "City loop",
		description:
			"都市を周回するリズムを、反復するラインと細い情報帯で受ける章。見た目は整理しつつ、反復感だけは残すことで Hero からのテンションを切らさない。",
		lead: "Repeating tracks hold the rhythm without adding noise.",
		metrics: [
			{ label: "route", value: "inner / outer" },
			{ label: "tempo", value: "looping grid" },
			{ label: "media", value: "map / aerial" },
		],
	},
	{
		id: "soft-noise",
		index: "04",
		eyebrow: "texture field",
		title: "Soft noise",
		description:
			"粒子感や拡散光を受けるための、静かなテクスチャ区画。装飾をコンポーネント内に閉じ込めず、背景素材と前景テキストをあとで別々に差し替えられる構造にしている。",
		lead: "A controlled grain field leaves room for texture assets.",
		metrics: [
			{ label: "grain", value: "low contrast" },
			{ label: "glow", value: "diffused edge" },
			{ label: "asset", value: "bg separated" },
		],
	},
	{
		id: "drift-system",
		index: "05",
		eyebrow: "release state",
		title: "Drift system",
		description:
			"最後は情報を締め切らず、少し浮遊したまま次の導線へ渡す終端。CTA や補助コピーを後から足しても窮屈にならないよう、着地点の余白を広めに残している。",
		lead: "The ending stays open so the next action can land cleanly.",
		metrics: [
			{ label: "exit", value: "gentle handoff" },
			{ label: "space", value: "wide footer gap" },
			{ label: "cta", value: "anchor ready" },
		],
	},
];

interface VisualBlockProps {
	item: SectionContent;
}

function VisualBlock({ item }: VisualBlockProps) {
	return (
		<div className="relative min-h-[18rem] overflow-hidden rounded-[1.75rem] border border-[color:var(--TC)]/10 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--WH)_74%,transparent)_0%,color-mix(in_oklch,var(--BC)_88%,transparent)_100%)] p-4 shadow-[0_24px_70px_-50px_color-mix(in_oklch,var(--BK)_65%,transparent)] sm:min-h-[22rem] sm:p-5">
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--MC)_18%,transparent)_0%,transparent_42%),radial-gradient(circle_at_bottom_right,color-mix(in_oklch,var(--SC)_16%,transparent)_0%,transparent_38%)]"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-x-[8%] top-[18%] h-px bg-[linear-gradient(90deg,transparent_0%,color-mix(in_oklch,var(--TC)_28%,transparent)_18%,color-mix(in_oklch,var(--TC)_6%,transparent)_100%)]"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-x-[16%] top-[34%] h-px bg-[linear-gradient(90deg,color-mix(in_oklch,var(--MC)_22%,transparent)_0%,transparent_100%)]"
			/>
			<div
				aria-hidden="true"
				className="absolute left-[12%] top-[22%] h-[42%] w-[42%] rounded-full border border-[color:var(--TC)]/10 bg-[radial-gradient(circle,color-mix(in_oklch,var(--WH)_44%,transparent)_0%,transparent_72%)] blur-[1px]"
			/>
			<div
				aria-hidden="true"
				className="absolute bottom-[12%] right-[10%] h-[44%] w-[44%] rounded-[1.5rem] border border-[color:var(--TC)]/10 bg-[linear-gradient(135deg,color-mix(in_oklch,var(--SC)_14%,transparent)_0%,transparent_70%)]"
			/>

			<div className="relative flex h-full flex-col justify-between gap-10">
				<div className="flex items-start justify-between gap-4">
					<p className="text-[0.68rem] uppercase tracking-[0.46em] text-[--GR]">
						{item.index}
					</p>
					<p className="max-w-[18ch] text-right text-[0.68rem] uppercase tracking-[0.34em] text-[--GR]">
						{item.lead}
					</p>
				</div>

				<div className="grid gap-3 sm:grid-cols-3">
					{item.metrics.map((metric) => (
						<div
							key={metric.label}
							className="rounded-[1.2rem] border border-[color:var(--TC)]/10 bg-[color-mix(in_oklch,var(--WH)_56%,transparent)] px-4 py-3 backdrop-blur-sm"
						>
							<p className="text-[0.62rem] uppercase tracking-[0.38em] text-[--GR]">
								{metric.label}
							</p>
							<p className="mt-3 text-sm uppercase tracking-[0.12em] text-[--TC]">
								{metric.value}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function SectionPanel({ item }: { item: SectionContent }) {
	return (
		<section
			id={item.id}
			aria-labelledby={`${item.id}-title`}
			className="relative isolate overflow-hidden rounded-[2rem] border border-[color:var(--TC)]/10 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--WH)_68%,transparent)_0%,color-mix(in_oklch,var(--BC)_90%,transparent)_100%)] px-[clamp(1.25rem,3vw,2.5rem)] py-[clamp(1.5rem,4vw,3rem)] shadow-[0_26px_90px_-60px_color-mix(in_oklch,var(--BK)_70%,transparent)]"
		>
			<div
				aria-hidden="true"
				className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,transparent_0%,color-mix(in_oklch,var(--MC)_6%,transparent)_48%,transparent_100%)]"
			/>

			<div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(19rem,1.1fr)] lg:items-center">
				<div className="max-w-xl">
					<div className="flex flex-wrap items-center gap-4">
						<p className="text-[0.68rem] uppercase tracking-[0.48em] text-[--SC]">
							{item.eyebrow}
						</p>
						<div className="h-px min-w-20 flex-1 bg-[linear-gradient(90deg,color-mix(in_oklch,var(--TC)_28%,transparent)_0%,transparent_100%)]" />
						<p className="text-[0.68rem] uppercase tracking-[0.42em] text-[--GR]">
							{item.index}
						</p>
					</div>

					<h2
						id={`${item.id}-title`}
						className="mt-5 max-w-[10ch] text-[clamp(2.25rem,5vw,4.8rem)] font-semibold uppercase leading-[0.88] tracking-[-0.08em] text-[--TC]"
					>
						{item.title}
					</h2>

					<p className="mt-5 text-sm leading-7 text-[--TC] sm:text-base">
						{item.description}
					</p>

					<p className="mt-6 text-[0.7rem] uppercase tracking-[0.34em] text-[--GR]">
						Placeholder structure kept open for image, canvas, or caption overlays.
					</p>
				</div>

				<VisualBlock item={item} />
			</div>
		</section>
	);
}

export function ConversionSections() {
	return (
		<div className="space-y-6 sm:space-y-8">
			{sectionContents.map((item) => (
				<SectionPanel key={item.id} item={item} />
			))}
		</div>
	);
}
