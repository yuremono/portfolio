import { afterEach, describe, expect, it } from "vitest";

import {
	PARAMS_STORAGE_KEY,
	defaultTweakParamValues,
	loadTweakParams,
	saveTweakParams,
} from "./rectsTweakParams";

describe("loadTweakParams", () => {
	afterEach(() => {
		localStorage.removeItem(PARAMS_STORAGE_KEY);
	});

	it("保存データの generatorMode に関係なく grid を使う", () => {
		const d = defaultTweakParamValues();
		localStorage.setItem(
			PARAMS_STORAGE_KEY,
			JSON.stringify({
				generatorMode: "rects",
				rects: d.rects,
				grid: d.grid,
			}),
		);
		const p = loadTweakParams();
		expect(p.generatorMode).toBe(d.generatorMode);
	});
});

describe("saveTweakParams", () => {
	afterEach(() => {
		localStorage.removeItem(PARAMS_STORAGE_KEY);
	});

	it("保存時の generatorMode は常に grid にする", () => {
		const p = defaultTweakParamValues();
		p.generatorMode = "rects";
		saveTweakParams(p);
		const raw = localStorage.getItem(PARAMS_STORAGE_KEY);
		expect(raw).not.toBeNull();
		expect(JSON.parse(raw!).generatorMode).toBe("grid");
	});
});
