/* eslint-disable react-refresh/only-export-components */
// 文脈: このページで使うアイコンをPhosphor Icons中心に集約する。
import type { Icon, IconProps } from "@phosphor-icons/react";
import {
	BookmarkSimple,
	Cards,
	ChatCircleText,
	CheckSquare,
	ClipboardText,
	Copy,
	DotsThree,
	DownloadSimple,
	FileMd,
	FloppyDisk,
	Folder,
	GearSix,
	HouseSimple,
	MagnifyingGlass,
	Palette,
	PencilSimple,
	SquaresFour,
} from "@phosphor-icons/react";

export type DocumentIconKey = "spec" | "design" | "agents" | "prompt" | "promptForSkill";
export type ToolIconKey = "search" | "write" | "other" | "copy" | "download" | "save" | "template";
export type NavIconKey = "dashboard" | "library" | "history" | "settings" | "parts";

export const documentIcons = {
	spec: FileMd,
	design: Palette,
	agents: CheckSquare,
	prompt: ChatCircleText,
	promptForSkill: ClipboardText,
} satisfies Record<DocumentIconKey, Icon>;

export const toolIcons = {
	search: MagnifyingGlass,
	write: PencilSimple,
	other: DotsThree,
	copy: Copy,
	download: DownloadSimple,
	save: FloppyDisk,
	template: BookmarkSimple,
} satisfies Record<ToolIconKey, Icon>;

export const navIcons = {
	dashboard: HouseSimple,
	library: Folder,
	history: Cards,
	settings: GearSix,
	parts: SquaresFour,
} satisfies Record<NavIconKey, Icon>;

export function OtherMarkIcon({ size = 24, ...props }: IconProps) {
	const { weight, ...svgProps } = props;
	void weight;

	return (
		<svg
			viewBox="0 0 24 24"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.75"
			aria-hidden="true"
			{...svgProps}
		>
			<path d="M7 7h10" />
			<path d="M7 12h6" />
			<path d="M7 17h3" />
			<path d="M17 15v4" />
			<path d="M15 17h4" />
		</svg>
	);
}

export const iconImportMap = {
	spec: "FileMd",
	design: "Palette",
	agents: "CheckSquare",
	prompt: "ChatCircleText",
	promptForSkill: "ClipboardText",
	search: "MagnifyingGlass",
	write: "PencilSimple",
	other: "DotsThree",
	copy: "Copy",
	download: "DownloadSimple",
	save: "FloppyDisk",
	template: "BookmarkSimple",
	dashboard: "HouseSimple",
	library: "Folder",
	history: "Cards",
	settings: "GearSix",
	parts: "SquaresFour",
	checklist: "CheckSquare",
} as const;
