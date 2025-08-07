import { describe, expect, it } from "vitest";
import {
	CreateTodoSchema,
	TodoIdParamSchema,
	TodoQuerySchema,
	TodoSchema,
	UpdateTodoSchema,
} from "./todo";

describe("Zodスキーマ", () => {
	describe("TodoSchema", () => {
		it("有効なTodoオブジェクトを検証できる", () => {
			const validTodo = {
				id: "550e8400-e29b-41d4-a716-446655440000",
				title: "買い物に行く",
				description: "牛乳とパンを買う",
				completed: false,
				dueDate: "2024-12-31T23:59:59Z",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			};

			const result = TodoSchema.safeParse(validTodo);
			expect(result.success).toBe(true);
		});

		it("必須フィールドが欠けている場合はエラー", () => {
			const invalidTodo = {
				id: "550e8400-e29b-41d4-a716-446655440000",
				// titleが欠けている
				completed: false,
			};

			const result = TodoSchema.safeParse(invalidTodo);
			expect(result.success).toBe(false);
		});
	});

	describe("CreateTodoSchema", () => {
		it("有効な作成データを検証できる", () => {
			const validData = {
				title: "新しいタスク",
				description: "説明文",
				dueDate: "2024-12-31T23:59:59Z",
			};

			const result = CreateTodoSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("titleが空文字の場合はエラー", () => {
			const invalidData = {
				title: "",
			};

			const result = CreateTodoSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it("titleが100文字を超える場合はエラー", () => {
			const invalidData = {
				title: "a".repeat(101),
			};

			const result = CreateTodoSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe("UpdateTodoSchema", () => {
		it("部分更新データを検証できる", () => {
			const validData = {
				title: "更新されたタスク",
			};

			const result = UpdateTodoSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it("全フィールドがオプション", () => {
			const emptyData = {};

			const result = UpdateTodoSchema.safeParse(emptyData);
			expect(result.success).toBe(true);
		});
	});

	describe("TodoIdParamSchema", () => {
		it("有効なUUIDを検証できる", () => {
			const validParam = {
				id: "550e8400-e29b-41d4-a716-446655440000",
			};

			const result = TodoIdParamSchema.safeParse(validParam);
			expect(result.success).toBe(true);
		});

		it("無効なUUID形式はエラー", () => {
			const invalidParam = {
				id: "invalid-uuid",
			};

			const result = TodoIdParamSchema.safeParse(invalidParam);
			expect(result.success).toBe(false);
		});
	});

	describe("TodoQuerySchema", () => {
		it("有効なクエリパラメータを検証できる", () => {
			const validQuery = {
				completed: "true",
				sortBy: "dueDate",
				order: "asc",
			};

			const result = TodoQuerySchema.safeParse(validQuery);
			expect(result.success).toBe(true);
		});

		it("無効なcompletedフィルタはエラー", () => {
			const invalidQuery = {
				completed: "maybe",
			};

			const result = TodoQuerySchema.safeParse(invalidQuery);
			expect(result.success).toBe(false);
		});
	});
});
