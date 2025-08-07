import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TodoRepository } from "../repositories/todo.repository";
import { TodoService } from "./todo.service";

describe("TodoService", () => {
	let service: TodoService;
	let mockRepository: Partial<TodoRepository>;

	beforeEach(() => {
		mockRepository = {
			findAll: vi.fn(),
			findById: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		};
		service = new TodoService(mockRepository as TodoRepository);
	});

	describe("getTodos", () => {
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
				{
					id: "2",
					title: "テストTODO2",
					description: "説明",
					completed: true,
					dueDate: "2024-12-31T23:59:59Z",
					createdAt: "2024-01-01T00:00:00Z",
					updatedAt: "2024-01-01T00:00:00Z",
				},
			];

			(mockRepository.findAll as ReturnType<typeof vi.fn>).mockResolvedValue(
				mockTodos,
			);

			const result = await service.getTodos();

			expect(result).toEqual(mockTodos);
			expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
		});

		it("フィルタ条件を渡すことができる", async () => {
			const filter = {
				completed: true,
				sortBy: "dueDate" as const,
				order: "desc" as const,
			};

			(mockRepository.findAll as ReturnType<typeof vi.fn>).mockResolvedValue(
				[],
			);

			await service.getTodos(filter);

			expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
		});
	});

	describe("getTodoById", () => {
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

			(mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
				mockTodo,
			);

			const result = await service.getTodoById("1");

			expect(result).toEqual(mockTodo);
			expect(mockRepository.findById).toHaveBeenCalledWith("1");
		});

		it("存在しないIDの場合はエラーを投げる", async () => {
			(mockRepository.findById as ReturnType<typeof vi.fn>).mockResolvedValue(
				null,
			);

			await expect(service.getTodoById("non-existent")).rejects.toThrow(
				"Todo not found",
			);
		});
	});

	describe("createTodo", () => {
		it("新しいTODOを作成できる", async () => {
			const createData = {
				title: "新しいTODO",
				description: "説明",
				dueDate: "2024-12-31T23:59:59Z",
			};

			const mockCreatedTodo = {
				id: "1",
				...createData,
				completed: false,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			};

			(mockRepository.create as ReturnType<typeof vi.fn>).mockResolvedValue(
				mockCreatedTodo,
			);

			const result = await service.createTodo(createData);

			expect(result).toEqual(mockCreatedTodo);
			expect(mockRepository.create).toHaveBeenCalledWith(createData);
		});

		it("タイトルが空の場合はエラーを投げる", async () => {
			const createData = {
				title: "",
				description: "説明",
			};

			await expect(service.createTodo(createData)).rejects.toThrow(
				"Title is required",
			);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});
	});

	describe("updateTodo", () => {
		it("既存のTODOを更新できる", async () => {
			const updateData = {
				title: "更新されたTODO",
				completed: true,
			};

			const mockUpdatedTodo = {
				id: "1",
				title: "更新されたTODO",
				description: null,
				completed: true,
				dueDate: null,
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-02T00:00:00Z",
			};

			(mockRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(
				mockUpdatedTodo,
			);

			const result = await service.updateTodo("1", updateData);

			expect(result).toEqual(mockUpdatedTodo);
			expect(mockRepository.update).toHaveBeenCalledWith("1", updateData);
		});

		it("存在しないIDの場合はエラーを投げる", async () => {
			(mockRepository.update as ReturnType<typeof vi.fn>).mockResolvedValue(
				null,
			);

			await expect(
				service.updateTodo("non-existent", { title: "test" }),
			).rejects.toThrow("Todo not found");
		});

		it("空のタイトルで更新しようとするとエラーを投げる", async () => {
			const updateData = {
				title: "",
			};

			await expect(service.updateTodo("1", updateData)).rejects.toThrow(
				"Title cannot be empty",
			);
			expect(mockRepository.update).not.toHaveBeenCalled();
		});
	});

	describe("deleteTodo", () => {
		it("TODOを削除できる", async () => {
			(mockRepository.delete as ReturnType<typeof vi.fn>).mockResolvedValue(
				true,
			);

			await service.deleteTodo("1");

			expect(mockRepository.delete).toHaveBeenCalledWith("1");
		});

		it("存在しないIDの場合はエラーを投げる", async () => {
			(mockRepository.delete as ReturnType<typeof vi.fn>).mockResolvedValue(
				false,
			);

			await expect(service.deleteTodo("non-existent")).rejects.toThrow(
				"Todo not found",
			);
		});
	});
});
