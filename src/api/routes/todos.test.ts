import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TodoService } from "../../services/todo.service";
import { createTodoRoutes } from "./todos";

describe("TODO API Routes", () => {
	let app: any;
	let mockService: Partial<TodoService>;

	beforeEach(() => {
		mockService = {
			getTodos: vi.fn(),
			getTodoById: vi.fn(),
			createTodo: vi.fn(),
			updateTodo: vi.fn(),
			deleteTodo: vi.fn(),
		};
		app = createTodoRoutes(mockService as TodoService);
	});

	describe("GET /api/todos", () => {
		it("全TODOを取得できる", async () => {
			const mockTodos = [
				{
					id: "1",
					title: "テストTODO1",
					description: null,
					completed: false,
					dueDate: null,
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
			];

			(mockService.getTodos as ReturnType<typeof vi.fn>).mockResolvedValue(
				mockTodos,
			);

			const res = await app.request("/api/todos");
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data).toEqual(mockTodos);
			expect(mockService.getTodos).toHaveBeenCalledWith(undefined);
		});

		it("フィルタパラメータを渡すことができる", async () => {
			(mockService.getTodos as ReturnType<typeof vi.fn>).mockResolvedValue([]);

			const res = await app.request(
				"/api/todos?completed=true&sortBy=dueDate&order=desc",
			);

			expect(res.status).toBe(200);
			expect(mockService.getTodos).toHaveBeenCalledWith({
				completed: true,
				sortBy: "dueDate",
				order: "desc",
			});
		});
	});

	describe("POST /api/todos", () => {
		it("新しいTODOを作成できる", async () => {
			const newTodo = {
				title: "新しいTODO",
				description: "説明",
				dueDate: "2024-12-31T23:59:59Z",
			};

			const createdTodo = {
				id: "1",
				...newTodo,
				completed: false,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			};

			(mockService.createTodo as ReturnType<typeof vi.fn>).mockResolvedValue(
				createdTodo,
			);

			const res = await app.request("/api/todos", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newTodo),
			});
			const data = await res.json();

			expect(res.status).toBe(201);
			expect(data).toEqual(createdTodo);
			expect(mockService.createTodo).toHaveBeenCalledWith(newTodo);
		});

		it("バリデーションエラーで400を返す", async () => {
			const invalidTodo = {
				description: "タイトルなし",
			};

			const res = await app.request("/api/todos", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(invalidTodo),
			});

			expect(res.status).toBe(400);
			expect(mockService.createTodo).not.toHaveBeenCalled();
		});
	});

	describe("GET /api/todos/:id", () => {
		it("IDでTODOを取得できる", async () => {
			const mockTodo = {
				id: "1",
				title: "テストTODO",
				description: null,
				completed: false,
				dueDate: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			};

			(mockService.getTodoById as ReturnType<typeof vi.fn>).mockResolvedValue(
				mockTodo,
			);

			const res = await app.request("/api/todos/1");
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data).toEqual(mockTodo);
			expect(mockService.getTodoById).toHaveBeenCalledWith("1");
		});

		it("存在しないIDで404を返す", async () => {
			(mockService.getTodoById as ReturnType<typeof vi.fn>).mockRejectedValue(
				new Error("Todo not found"),
			);

			const res = await app.request("/api/todos/non-existent");

			expect(res.status).toBe(404);
		});
	});

	describe("PUT /api/todos/:id", () => {
		it("TODOを更新できる", async () => {
			const updateData = {
				title: "更新されたTODO",
				completed: true,
			};

			const updatedTodo = {
				id: "1",
				title: "更新されたTODO",
				description: null,
				completed: true,
				dueDate: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-02T00:00:00Z",
			};

			(mockService.updateTodo as ReturnType<typeof vi.fn>).mockResolvedValue(
				updatedTodo,
			);

			const res = await app.request("/api/todos/1", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data).toEqual(updatedTodo);
			expect(mockService.updateTodo).toHaveBeenCalledWith("1", updateData);
		});

		it("存在しないIDで404を返す", async () => {
			(mockService.updateTodo as ReturnType<typeof vi.fn>).mockRejectedValue(
				new Error("Todo not found"),
			);

			const res = await app.request("/api/todos/non-existent", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ title: "test" }),
			});

			expect(res.status).toBe(404);
		});
	});

	describe("DELETE /api/todos/:id", () => {
		it("TODOを削除できる", async () => {
			(mockService.deleteTodo as ReturnType<typeof vi.fn>).mockResolvedValue(
				undefined,
			);

			const res = await app.request("/api/todos/1", {
				method: "DELETE",
			});

			expect(res.status).toBe(204);
			expect(mockService.deleteTodo).toHaveBeenCalledWith("1");
		});

		it("存在しないIDで404を返す", async () => {
			(mockService.deleteTodo as ReturnType<typeof vi.fn>).mockRejectedValue(
				new Error("Todo not found"),
			);

			const res = await app.request("/api/todos/non-existent", {
				method: "DELETE",
			});

			expect(res.status).toBe(404);
		});
	});
});
