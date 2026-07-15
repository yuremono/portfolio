import { useState } from "react";
import { useSessionInitialOpen } from "../../hooks/useSessionInitialOpen";
import BunmyakuManualDialog from "./BunmyakuManualDialog";
import { outputQuestionSections, type IntakePanelProps, type OutputType, type QuestionCard } from "./data";
import { FutureNotice } from "./FutureNotice";

// 回答量UIを再表示するときは Check import と answerVolumeLabels も戻す。
// const answerVolumeLabels = {
// 	quick: {
// 		label: "Quick",
// 		count: "5-8問",
// 		description: "最小限の指示文を素早く作る",
// 	},
// 	standard: {
// 		label: "Standard",
// 		count: "12-18問",
// 		description: "実用的な粒度の指示文を作る",
// 	},
// 	deep: {
// 		label: "Deep",
// 		count: "20-35問",
// 		description: "制約、判断基準、出力構成まで細かく指定する",
// 	},
// } as const;

const groupQuestions = (questions: QuestionCard[]) =>
	questions.reduce<Record<string, QuestionCard[]>>((groups, question) => {
		groups[question.section] = [...(groups[question.section] ?? []), question];
		return groups;
	}, {});

const getQuestionGroups = (outputType: OutputType, questions: QuestionCard[]) => {
	const groupedQuestions = groupQuestions(questions);
	const outputGroups = outputQuestionSections[outputType]
		.filter((section) => groupedQuestions[section])
		.map((section) => [section, groupedQuestions[section]] as const);
	const otherGroups = Object.entries(groupedQuestions).filter(
		([section]) => !outputQuestionSections[outputType].includes(section),
	);

	return [...outputGroups, ...otherGroups];
};

const stripQuestionNumber = (title: string) => title.replace(/^\d+\.\s*/, "");

const outputTypeJaLabels = {
	SPEC: "要件定義",
	DESIGN: "デザイン設計",
	AGENTS: "基本スキーマ",
	PROMPT: "プロンプト",
	PROMPT_FOR_SKILL: "スキル作成",
} as const;

// PROMPT / PROMPT_FOR_SKILL は未確認のため表示だけ隠す。機能実装時はこの除外を外す。
const hiddenOutputTypes: OutputType[] = ["PROMPT", "PROMPT_FOR_SKILL"];

export function IntakePanel({ state, className }: IntakePanelProps) {
	const manualInitialOpen = useSessionInitialOpen("bunmyaku_manual_auto_open");
	const [openFreeTextIds, setOpenFreeTextIds] = useState<Set<string>>(() => new Set());
	const questionGroups = getQuestionGroups(state.outputType, state.visibleQuestions);
	const visibleOutputOptions = state.outputOptions.filter(
		(format) => !hiddenOutputTypes.includes(format.id),
	);
	const toggleFreeText = (questionId: string, isOpen: boolean) => {
		setOpenFreeTextIds((current) => {
			const next = new Set(current);
			if (isOpen) {
				next.add(questionId);
			} else {
				next.delete(questionId);
				state.setQuestionFreeText(questionId, "");
			}
			return next;
		});
	};

	return (
		<section
			data-l="IntakePanel"
			className={[
				"mt-0 min-h-[100lvh] overflow-hidden BorderR PX  lg:h-[100lvh] lg:min-h-0",
				className,
			]
				.filter(Boolean)
				.join(" ")}
			aria-labelledby="intake-title"
		>
			{/* 中央カラム: 内側だけを独立スクロールにする */}
			<div data-l="IntakeFrame" className="mx-auto flex h-full w-full max-w-[--wid] flex-col overflow-hidden ">
				<header data-l="IntakeHeader" className="shrink-0   PY">
					<div data-l="HeaderRow" className="flex flex-col gap md:flex-row md:items-center md:justify-between">
						<div data-l="HeaderTitle">
							{/* <h1 id="intake-title" className=" leading-[--HLH] ">
								文脈を紡ぐ
							</h1> */}
						</div>
						<div data-l="HeaderActions" className="flex flex-wrap gap-2">
							<BunmyakuManualDialog initialOpen={manualInitialOpen} />
							<button
								aria-pressed={state.showUnansweredAnswers}
								className={[
									"BabelRightDown BorderXY px-3 py-2 text-xs",
									state.showUnansweredAnswers ? "bg-SC/70 hover:bg-AC/70" : "hover:bg-SC/20",
								].join(" ")}
								onClick={() => state.setShowUnansweredAnswers(!state.showUnansweredAnswers)}
								type="button"
							>
								未選択を出力
							</button>
							<FutureNotice>
								<button className="BabelRightDown BorderXY  px-3 py-2 text-xs " type="button">
									テンプレートから作成
								</button>
							</FutureNotice>
							<button className="BabelRightDown bg-SC/70 hover:bg-AC/70  px-3 py-2 text-xs " type="button">
								保存
							</button>
						</div>
					</div>
				</header>

				<div data-l="IntakeBody" className="flex min-h-0 flex-1 flex-col gap overflow-y-auto pr-[--gapH]">
					<section data-l="FormatSection" className="" aria-labelledby="output-format-title">
						<div data-l="SectionHeader1" className="flex items-center justify-between gap">
							<div data-l="SectionTitle1">
								<h2 id="output-format-title" className="flex items-baseline gap-2 leading-[--HLH]">
									{/* <span className="text-[0.625rem] font-bold text-AC">01</span> */}
									<span>出力形式</span>
								</h2>
							</div>
							<span className="text-xs ">Generate {state.currentOutput.label}</span>
						</div>
						<div data-l="FormatGrid" className="text-center text-xs mt-[--gap] grid overflow-hidden BabelRightDown BorderXY bg-MC/35 xs:grid-cols-3 ">
							{visibleOutputOptions.map((format, index) => {
								const isSelected = state.outputType === format.id;
								// const Icon = formatIcons[index] ?? FileText;

								return (
									<label
										className={[
											" group relative  min-h-12 cursor-pointer content-center gap-2 border-WH/20 p-1 transition ",
											index < visibleOutputOptions.length - 1 ? "border-b xs:border-b-0 xs:border-r" : "",
											index === visibleOutputOptions.length - 1 ? "xs:border-r-0" : "",
											isSelected ? "bg-SC/25 text-WH shadow-[inset_0_-3px_0_var(--AC)]" : "text-WH/65 hover:bg-SC/10 hover:text-WH",
										].join(" ")}
										key={format.id}
									>
										<input
											checked={isSelected}
											className="peer sr-only"
											name="output_format"
											onChange={() => state.setOutputType(format.id)}
											type="radio"
										/>
										{/* <span className="grid size-8 shrink-0 place-items-center md:size-7">
											<Icon aria-hidden="true" size={20} weight={isSelected ? "fill" : "duotone"} />
										</span> */}
										<span className="min-w-0 leading-none ">
											<span className="block truncate  font-bold leading-none ">
												{format.label}
											</span>
											<span className="mt-1 block truncate text-[0.75em] leading-none text-WH/55 group-hover:text-WH/70">
												{outputTypeJaLabels[format.id]}
											</span>
										</span>
									</label>
								);
							})}
						</div>
					</section>

					{/* 回答量UIは一時非表示。再表示するときはこのコメントアウトを外す。 */}
					{/* <section data-l="VolumeSection" className="BabelRightDown BorderXY  p-[--gap]" aria-labelledby="answer-volume-title">
						<h2 id="answer-volume-title" className=" leading-[--HLH] ">
							回答量
						</h2>
						<div data-l="VolumeGrid" className="mt-[--gap] grid gap sm:grid-cols-3">
							{Object.entries(answerVolumeLabels).map(([id, volume]) => {
								const isSelected = state.answerVolume === id;

								return (
									<label
										className={[
											"group cursor-pointer BabelRightDown BorderXY p-[--gap]",
											isSelected ? "bg-SC/20" : " hover:bg-SC/20",
										].join(" ")}
										key={id}
									>
										<input
											checked={isSelected}
											className="peer sr-only"
											name="answer_volume"
											onChange={() => state.setAnswerVolume(id as keyof typeof answerVolumeLabels)}
											type="radio"
										/>
										<span className="flex items-center justify-between gap-2">
											<span className="">{volume.label}</span>
											<span className="relative grid size-5 place-items-center BabelRightDown BorderXY bg-MC">
												{isSelected ? (
													<Check aria-hidden="true" className="text-AC" size={14} weight="bold" />
												) : (
													<Check
														aria-hidden="true"
														className="text-WH opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
														size={14}
														weight="bold"
													/>
												)}
											</span>
										</span>
										<span className="mt-2 block text-xs ">{volume.count}</span>
										<span className="mt-1 block text-xs leading-[--LH] ">{volume.description}</span>
									</label>
								);
							})}
						</div>
					</section> */}

					<section data-l="OverviewSection" className="BabelRightDown BorderXY  p-[--gap]" aria-labelledby="global-note-title">
						<label className="block" htmlFor="global-note">
							<span id="global-note-title" className="h2FZ Eng block  leading-[--HLH] ">
						{/* <span className="text-xs mr-1">03</span> */}
								概要（自由入力）
							</span>
						</label>
						<textarea
							className="mt-[--gap] min-h-20 w-full resize-y BabelRightDown BorderXY bg-background p-[--gap] leading-[--LH]  placeholder:text-GR focus:outline-none focus:border-WH/80"
							id="global-note"
							onChange={(event) => state.setGlobalFreeText(event.currentTarget.value)}
							placeholder="プロンプトの冒頭にそのまま入れたい概要、前提、目的、対象外にしたい条件など"
							value={state.globalFreeText}
						/>
					</section>

					<section data-l="QuestionsSection" className="BabelRightDown BorderXY  p-[--gap]" aria-labelledby="questions-title">
						<div data-l="SectionHeader2" className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
							<div data-l="SectionTitle2">
								<h2 id="questions-title" className=" leading-[--HLH] ">
								{/* <span className="text-xs mr-1">04</span> */}
									設問カード群
								</h2>
							</div>
							<p className="BabelRightDown bg-SC/70 px-3 py-2 text-xs ">{state.visibleQuestions.length}項目</p>
						</div>
						<div data-l="QuestionsGrid" className="[--HFF:--San] mt-[--gap] grid gap 2lg:grid-cols-2">
							{questionGroups.map(([groupName, questions], groupIndex) => (
								<section data-l={`QuestionGroup${groupIndex + 1}`} className="  bg-background " key={groupName}>
									<div data-l="GroupHeader" className="flex items-center justify-between gap-3 BorderB border-b-2 pb-2">
										<h3 className=" leading-[--HLH] ">{groupName}</h3>
										<span className="text-xs text-GR">{questions.length}</span>
									</div>
									<div data-l="QuestionList" className="mt-[--gap] flex flex-col ">
										{questions.map((question, questionIndex) => {
											const answer = state.answers[question.id];
											const questionNumber = String(questionIndex + 1).padStart(2, "0");

											return (
												<article
													data-l={`Question${questionNumber}`}
													className=" BorderB  PY"
													key={question.id}
												>
													<div data-l="QuestionHeader" className="flex items-start justify-between gap-3">
														<div data-l="QuestionTitle">
															<h4 className="leading-[--LH] ">
																{questionNumber}. {stripQuestionNumber(question.title)}
															</h4>
															{question.prompt ? (
																<p className="mt-1 text-xs leading-[--LH] text-GR">{question.prompt}</p>
															) : null}
														</div>
														<span className="shrink-0 BabelRightDown  px-2 py-1 text-xs ">
															{question.inputType === "multi" ? "複数" : "単一"}
														</span>
													</div>
													<div data-l="OptionList" className="mt-3 flex flex-wrap gap-1">
														{question.options.map((option) => {
															const isChecked = answer?.selectedOptionIds.includes(option.id) ?? false;

															return (
																<label
																	className={[
																		"group inline-flex max-w-full cursor-pointer items-start gap-1.5 BabelRightDown BorderXY px-2 py-1.5 text-xs leading-[--LH] transition",
																		isChecked ? "bg-SC/20" : "hover:bg-SC/20",
																	].join(" ")}
																	key={option.id}
																>
																	<input
																		checked={isChecked}
																		className="mt-[3px] shrink-0 accent-AC"
																		name={question.id}
																		onChange={() => state.toggleQuestionOption(question.id, option.id)}
																		type={question.inputType === "multi" ? "checkbox" : "radio"}
																	/>
																	<span className="min-w-0 overflow-wrap-anywhere">{option.label}</span>
																</label>
															);
														})}
														{(() => {
															const freeText = answer?.freeText ?? "";
															const isFreeTextOpen = openFreeTextIds.has(question.id) || freeText.length > 0;

															return (
																<label
																	className={[
																		"flex w-full flex-basis-full cursor-pointer flex-wrap items-start gap-1.5 px-0 py-1.5 text-xs leading-[--LH]",
																		isFreeTextOpen ? "" : "",
																	].join(" ")}
																	htmlFor={`${question.id}-free-toggle`}
																>
																	<span className="inline-flex items-start gap-1.5">
																		<input
																			checked={isFreeTextOpen}
																			className="mt-[3px] shrink-0 accent-AC"
																			id={`${question.id}-free-toggle`}
																			onChange={(event) => toggleFreeText(question.id, event.currentTarget.checked)}
																			type="checkbox"
																		/>
																		<span>{question.freeTextLabel}</span>
																	</span>
																	{isFreeTextOpen ? (
																		<textarea
																			className="mt-1 min-h-16 w-full flex-none resize-y BabelRightDown BorderXY bg-background p-2 leading-[--LH] placeholder:text-GR"
																			id={`${question.id}-free`}
																			onChange={(event) => state.setQuestionFreeText(question.id, event.currentTarget.value)}
																			placeholder="選択肢に収まらない補足、例外、固有名詞、判断基準など"
																			value={freeText}
																		/>
																	) : null}
																</label>
															);
														})()}
													</div>
												</article>
											);
										})}
									</div>
								</section>
							))}
						</div>
					</section>

					{/* <section data-l="ReviewSection" className="BabelRightDown BorderXY  p-[--gap] " aria-labelledby="review-title">
						<div data-l="ReviewGrid" className="grid gap md:grid-cols-[1fr_auto] md:items-center">
							<div data-l="ReviewTitle">
								<h2 id="review-title" className=" leading-[--HLH] ">
								<span className="text-xs mr-1">05</span>
									生成と確認
								</h2>
							</div>
							<div data-l="ReviewActions" className="flex flex-wrap gap-2 md:justify-end">
								<button className="BabelRightDown BorderXY  px-3 py-2 text-xs " type="button">
									未入力を確認
								</button>
								<button className="BabelRightDown bg-SC/70 hover:bg-AC/70  px-3 py-2 text-xs " onClick={state.copyMarkdown} type="button">
									Markdown Copy
								</button>
							</div>
						</div>
					</section> */}
				</div>
			</div>
		</section>
	);
}
