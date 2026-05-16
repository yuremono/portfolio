// 文脈: 入力状態の更新、Markdown生成、コピーとダウンロードをまとめるhook。
import { useCallback, useMemo, useState } from "react";
import {
	outputOptions,
	outputQuestionSections,
	parts,
	questions,
	type AnswerVolume,
	type DocumentDraftState,
	type DocumentState,
	type OutputType,
	type QuestionCard,
	type QuestionOption,
} from "./data";

type Initializer = () => DocumentDraftState;

const getDefaultPartIds = (outputType: OutputType) =>
	parts.filter((part) => part.outputType === outputType).map((part) => part.id);

const getCurrentOutput = (outputType: OutputType) => {
	const currentOutput = outputOptions.find((option) => option.id === outputType);
	if (!currentOutput) {
		throw new Error(`Unsupported output type: ${outputType}`);
	}
	return currentOutput;
};

const getSectionIndex = (outputType: OutputType, section: string) => {
	const sections = outputQuestionSections[outputType];
	const sectionIndex = sections.indexOf(section);

	return sectionIndex === -1 ? sections.length : sectionIndex;
};

const getVisibleQuestions = (outputType: OutputType, answerVolume: AnswerVolume) =>
	questions
		.filter((question) => question.outputType === outputType && question.volume.includes(answerVolume))
		.sort((current, next) => getSectionIndex(outputType, current.section) - getSectionIndex(outputType, next.section));

const getSelectedOptions = (question: QuestionCard, selectedOptionIds: string[]) =>
	selectedOptionIds
		.map((optionId) => question.options.find((option) => option.id === optionId))
		.filter((option): option is QuestionOption => Boolean(option));

const uniqueIds = (ids: string[]) => Array.from(new Set(ids));

const getPartIdsFromQuestion = (question: QuestionCard, selectedOptionIds: string[]) =>
	getSelectedOptions(question, selectedOptionIds).flatMap((option) => option.partIds ?? []);

const stripQuestionNumber = (title: string) => title.replace(/^\d+\.\s*/, "");

const formatSectionAnswer = (question: QuestionCard, state: DocumentDraftState, index: number) => {
	const answer = state.answers[question.id];
	if (!answer) return "";

	const selectedOptions = getSelectedOptions(question, answer.selectedOptionIds);
	const freeText = answer.freeText.trim();
	const selectedText = selectedOptions.map((option) => option.label).join("、");
	const answerText = [selectedText, freeText ? `補足: ${freeText}` : ""].filter(Boolean).join(" / ") || "未選択";
	const hasAnswer = selectedOptions.length > 0 || freeText.length > 0;
	const questionNumber = String(index + 1).padStart(2, "0");
	const questionText = stripQuestionNumber(question.title);

	if (!hasAnswer && !state.showUnansweredAnswers) return "";

	return state.outputType === "AGENTS" || state.outputType === "SPEC"
		? `- ${questionText}: ${answerText}`
		: `${questionNumber}. ${questionText}: ${answerText}`;
};

const buildAnswerSections = (state: DocumentDraftState, visibleQuestions: QuestionCard[]) => {
	const sectionEntries = visibleQuestions.reduce<Map<string, QuestionCard[]>>((entries, question) => {
		const questions = entries.get(question.section) ?? [];
		entries.set(question.section, [...questions, question]);
		return entries;
	}, new Map<string, QuestionCard[]>());

	return outputQuestionSections[state.outputType]
		.map((section) => {
			const answers = (sectionEntries.get(section) ?? [])
				.map((question, index) => formatSectionAnswer(question, state, index))
				.filter((answer) => answer.length > 0);

			return [`## ${section}`, ...answers].join("\n");
		})
		.join("\n\n");
};

const buildMarkdown = (state: DocumentDraftState, visibleQuestions: QuestionCard[]) => {
	const currentOutput = getCurrentOutput(state.outputType);
	const globalFreeText = state.globalFreeText.trim();
	const answerSections = buildAnswerSections(state, visibleQuestions);

	const blocks = [
		`# ${currentOutput.label}`,
		globalFreeText,
		answerSections,
	].filter((block) => block.length > 0);

	return `${blocks.join("\n\n")}\n`;
};

const writeClipboard = async (text: string) => {
	if (typeof navigator === "undefined" || !navigator.clipboard) return;
	await navigator.clipboard.writeText(text);
};

const downloadText = (fileName: string, text: string) => {
	if (typeof document === "undefined") return;

	const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");

	anchor.href = url;
	anchor.download = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
	anchor.style.display = "none";
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
};

export const useDocumentState = (initializer: Initializer): DocumentState => {
	const [draftState, setDraftState] = useState<DocumentDraftState>(initializer);

	const currentOutput = useMemo(() => getCurrentOutput(draftState.outputType), [draftState.outputType]);
	const visibleQuestions = useMemo(
		() => getVisibleQuestions(draftState.outputType, draftState.answerVolume),
		[draftState.outputType, draftState.answerVolume],
	);
	const selectedParts = useMemo(
		() =>
			parts.filter((part) => part.outputType === draftState.outputType && draftState.selectedPartIds.includes(part.id)),
		[draftState.outputType, draftState.selectedPartIds],
	);
	const generatedMarkdown = useMemo(
		() => buildMarkdown(draftState, visibleQuestions),
		[draftState, visibleQuestions],
	);

	const setOutputType = useCallback((outputType: OutputType) => {
		setDraftState((current) => ({
			 ...current,
			outputType,
			selectedPartIds: getDefaultPartIds(outputType),
		}));
	}, []);

	const setAnswerVolume = useCallback((answerVolume: AnswerVolume) => {
		setDraftState((current) => ({
			...current,
			answerVolume,
		}));
	}, []);

	const setShowUnansweredAnswers = useCallback((value: boolean) => {
		setDraftState((current) => ({
			...current,
			showUnansweredAnswers: value,
		}));
	}, []);

	const setGlobalFreeText = useCallback((value: string) => {
		setDraftState((current) => ({
			...current,
			globalFreeText: value,
		}));
	}, []);

	const setQuestionFreeText = useCallback((questionId: string, value: string) => {
		setDraftState((current) => ({
			...current,
			answers: {
				...current.answers,
				[questionId]: {
					selectedOptionIds: current.answers[questionId]?.selectedOptionIds ?? [],
					freeText: value,
				},
			},
		}));
	}, []);

	const toggleQuestionOption = useCallback((questionId: string, optionId: string) => {
		setDraftState((current) => {
			const question = questions.find((item) => item.id === questionId);
			if (!question) return current;

			const answer = current.answers[questionId] ?? { selectedOptionIds: [], freeText: "" };
			const selectedOptionIds =
				question.inputType === "single"
					? answer.selectedOptionIds.includes(optionId)
						? []
						: [optionId]
					: answer.selectedOptionIds.includes(optionId)
						? answer.selectedOptionIds.filter((id) => id !== optionId)
						: [...answer.selectedOptionIds, optionId];
			const partIds = getPartIdsFromQuestion(question, selectedOptionIds);

			return {
				...current,
				answers: {
					...current.answers,
					[questionId]: {
						...answer,
						selectedOptionIds,
					},
				},
				selectedPartIds: uniqueIds([...current.selectedPartIds, ...partIds]),
			};
		});
	}, []);

	const togglePart = useCallback((partId: string) => {
		setDraftState((current) => ({
			...current,
			selectedPartIds: current.selectedPartIds.includes(partId)
				? current.selectedPartIds.filter((id) => id !== partId)
				: [...current.selectedPartIds, partId],
		}));
	}, []);

	const copyMarkdown = useCallback(async () => {
		await writeClipboard(generatedMarkdown);
	}, [generatedMarkdown]);

	const downloadMarkdown = useCallback(() => {
		downloadText(currentOutput.fileName, generatedMarkdown);
	}, [currentOutput.fileName, generatedMarkdown]);

	return {
		...draftState,
		generatedMarkdown,
		outputOptions,
		questions,
		visibleQuestions,
		parts,
		selectedParts,
		currentOutput,
		setOutputType,
		setAnswerVolume,
		setShowUnansweredAnswers,
		setGlobalFreeText,
		setQuestionFreeText,
		toggleQuestionOption,
		togglePart,
		copyMarkdown,
		downloadMarkdown,
	};
};
