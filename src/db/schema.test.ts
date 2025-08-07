import { describe, expect, it } from "vitest";
import { todos } from "./schema";

describe("Drizzleスキーマ", () => {
	describe("todosテーブル", () => {
		it("todosテーブルが定義されている", () => {
			expect(todos).toBeDefined();
			expect(todos.id).toBeDefined();
			expect(todos.title).toBeDefined();
			expect(todos.description).toBeDefined();
			expect(todos.completed).toBeDefined();
			expect(todos.createdAt).toBeDefined();
			expect(todos.updatedAt).toBeDefined();
		});

		it("各カラムの設定が正しい", () => {
			// ID: プライマリキー
			expect(todos.id.primary).toBe(true);

			// title: NOT NULL
			expect(todos.title.notNull).toBe(true);

			// completed: デフォルトfalse
			expect(todos.completed.notNull).toBe(true);
			expect(todos.completed.hasDefault).toBe(true);
		});
	});
});
