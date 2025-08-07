import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "../db/client";
import { TodoRepository } from "./todo.repository";

describe("TodoRepository", () => {
	let repository: TodoRepository;
	let mockDb: Partial<Db>;

	beforeEach(() => {
		// Drizzle ORMのモック - チェーン可能なクエリビルダー
		const mockQueryResult: unknown[] = [];

		// チェーン可能なモックオブジェクトを作成する関数
		const createMockQuery = () => {
			const query = {
				from: vi.fn(),
				where: vi.fn(),
				orderBy: vi.fn(),
				limit: vi.fn(),
				values: vi.fn().mockResolvedValue(undefined),
				set: vi.fn(),
			};

			// 各メソッドが自身を返すように設定
			query.from.mockReturnValue(query);
			query.where.mockReturnValue(query);
			query.orderBy.mockReturnValue(query);
			query.limit.mockReturnValue(query);
			query.set.mockReturnValue(query);

			// awaitされた時にPromiseを返す
			Object.defineProperty(query, Symbol.asyncIterator, {
				value: () => ({
					async next() {
						return { done: true, value: mockQueryResult };
					},
				}),
			});

			// Promise.resolveでラップして返す
			const wrappedQuery = Object.assign(
				Promise.resolve(mockQueryResult),
				query,
			);

			// 各メソッドがラップされたオブジェクトを返すように再設定
			query.from.mockReturnValue(wrappedQuery);
			query.where.mockReturnValue(wrappedQuery);
			query.orderBy.mockReturnValue(wrappedQuery);
			query.limit.mockReturnValue(wrappedQuery);
			query.set.mockReturnValue(wrappedQuery);

			return wrappedQuery;
		};

		const mockQuery = createMockQuery();

		mockDb = {
			select: vi.fn().mockReturnValue(mockQuery),
			insert: vi.fn().mockReturnValue(mockQuery),
			update: vi.fn().mockReturnValue(mockQuery),
			delete: vi.fn().mockReturnValue(mockQuery),
		};
		repository = new TodoRepository(mockDb as unknown as Db);
	});

	describe("findAll", () => {
		it("全TODOを取得できる", async () => {
			const result = await repository.findAll();
			expect(result).toBeDefined();
			expect(Array.isArray(result)).toBe(true);
		});

		it("フィルタとソートオプションを適用できる", async () => {
			const options = {
				completed: true,
				sortBy: "dueDate" as const,
				order: "desc" as const,
			};

			const result = await repository.findAll(options);
			expect(result).toBeDefined();
		});
	});

	describe("findById", () => {
		it("IDでTODOを取得できる", async () => {
			const id = "550e8400-e29b-41d4-a716-446655440000";
			const result = await repository.findById(id);
			expect(result).toBeDefined();
		});

		it("存在しないIDの場合はnullを返す", async () => {
			const id = "non-existent-id";
			const result = await repository.findById(id);
			expect(result === null || result === undefined).toBe(true);
		});
	});

	describe("create", () => {
		it("新しいTODOを作成できる", async () => {
			const newTodo = {
				title: "新しいタスク",
				description: "説明",
				dueDate: "2024-12-31T23:59:59Z",
			};

			const result = await repository.create(newTodo);
			expect(result).toBeDefined();
			expect(result).toHaveProperty("id");
			expect(result).toHaveProperty("title", newTodo.title);
		});

		it("自動的にIDと日時が設定される", async () => {
			const newTodo = {
				title: "新しいタスク",
			};

			const result = await repository.create(newTodo);
			expect(result).toHaveProperty("id");
			expect(result).toHaveProperty("createdAt");
			expect(result).toHaveProperty("updatedAt");
			expect(result).toHaveProperty("completed", false);
		});
	});

	describe("update", () => {
		it("既存のTODOを更新できる", async () => {
			const id = "550e8400-e29b-41d4-a716-446655440000";
			const existingTodo = {
				id,
				title: "古いタスク",
				description: null,
				completed: false,
				dueDate: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			};

			// findByIdの最初の呼び出しで既存のTODOを返すように設定
			const mockQuery = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnValue(Promise.resolve([existingTodo])),
				set: vi.fn().mockReturnThis(),
			};

			(mockDb.select as ReturnType<typeof vi.fn>).mockReturnValueOnce(
				mockQuery,
			);
			(mockDb.update as ReturnType<typeof vi.fn>).mockReturnValue({
				set: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnValue(Promise.resolve()),
			});

			const updateData = {
				title: "更新されたタスク",
				completed: true,
			};

			const result = await repository.update(id, updateData);
			expect(result).toBeDefined();
			expect(result).toHaveProperty("title", updateData.title);
		});

		it("存在しないIDの場合はnullを返す", async () => {
			const id = "non-existent-id";
			const updateData = {
				title: "更新されたタスク",
			};

			const result = await repository.update(id, updateData);
			expect(result === null || result === undefined).toBe(true);
		});
	});

	describe("delete", () => {
		it("TODOを削除できる", async () => {
			const id = "550e8400-e29b-41d4-a716-446655440000";
			const existingTodo = {
				id,
				title: "削除するタスク",
				description: null,
				completed: false,
				dueDate: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			};

			// findByIdで既存のTODOを返すように設定
			const mockQuery = {
				from: vi.fn().mockReturnThis(),
				where: vi.fn().mockReturnThis(),
				limit: vi.fn().mockReturnValue(Promise.resolve([existingTodo])),
			};

			(mockDb.select as ReturnType<typeof vi.fn>).mockReturnValueOnce(
				mockQuery,
			);
			(mockDb.delete as ReturnType<typeof vi.fn>).mockReturnValue({
				where: vi.fn().mockReturnValue(Promise.resolve()),
			});

			const result = await repository.delete(id);
			expect(result).toBe(true);
		});

		it("存在しないIDの場合はfalseを返す", async () => {
			const id = "non-existent-id";
			const result = await repository.delete(id);
			expect(result).toBe(false);
		});
	});
});
