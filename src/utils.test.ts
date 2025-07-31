import { describe, expect, it } from "vitest";
import { add } from "./utils";

describe("サンプルテスト", () => {
	it("1 + 2 は 3 になるはず", () => {
		expect(add(1, 2)).toBe(3);
	});

	it("負の数の計算も正しく動作するはず", () => {
		expect(add(-1, -2)).toBe(-3);
	});
});
