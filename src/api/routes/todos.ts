import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import type { TodoService } from "../../services/todo.service";
import {
	CreateTodoSchema,
	TodoSchema,
	UpdateTodoSchema,
} from "../schemas/todo";

const ParamsSchema = z.object({
	id: z.string(),
});

const QuerySchema = z.object({
	completed: z
		.string()
		.optional()
		.transform((val) =>
			val === "true" ? true : val === "false" ? false : undefined,
		),
	sortBy: z.enum(["dueDate", "createdAt"]).optional(),
	order: z.enum(["asc", "desc"]).optional(),
});

export function createTodoRoutes() {
	const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>();

	// GET /api/todos - 一覧取得
	const getTodosRoute = createRoute({
		method: "get",
		path: "/api/todos",
		request: {
			query: QuerySchema,
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: z.array(TodoSchema),
					},
				},
				description: "TODOリストを返す",
			},
		},
	});

	app.openapi(getTodosRoute, async (c) => {
		// サービスを動的に取得
		const { createDb } = await import("../../db/client");
		const { TodoRepository } = await import(
			"../../repositories/todo.repository"
		);
		const { TodoService } = await import("../../services/todo.service");

		const db = createDb(c.env.DB);
		const repository = new TodoRepository(db);
		const service = new TodoService(repository);

		const query = c.req.valid("query");
		const filter = {
			completed: query.completed,
			sortBy: query.sortBy,
			order: query.order,
		};
		const todos = await service.getTodos(
			Object.values(filter).some((v) => v !== undefined) ? filter : undefined,
		);
		// null値をundefinedに変換
		const formattedTodos = todos.map((todo) => ({
			...todo,
			description: todo.description ?? undefined,
			dueDate: todo.dueDate ?? undefined,
		}));
		return c.json(formattedTodos);
	});

	// POST /api/todos - 作成
	const createTodoRoute = createRoute({
		method: "post",
		path: "/api/todos",
		request: {
			body: {
				content: {
					"application/json": {
						schema: CreateTodoSchema,
					},
				},
			},
		},
		responses: {
			201: {
				content: {
					"application/json": {
						schema: TodoSchema,
					},
				},
				description: "作成されたTODOを返す",
			},
			400: {
				description: "バリデーションエラー",
			},
		},
	});

	app.openapi(createTodoRoute, async (c) => {
		// サービスを動的に取得
		const { createDb } = await import("../../db/client");
		const { TodoRepository } = await import(
			"../../repositories/todo.repository"
		);
		const { TodoService } = await import("../../services/todo.service");

		const db = createDb(c.env.DB);
		const repository = new TodoRepository(db);
		const service = new TodoService(repository);

		const data = c.req.valid("json");
		const todo = await service.createTodo(data);
		const formattedTodo = {
			...todo,
			description: todo.description ?? undefined,
			dueDate: todo.dueDate ?? undefined,
		};
		return c.json(formattedTodo, 201);
	});

	// GET /api/todos/:id - 詳細取得
	const getTodoRoute = createRoute({
		method: "get",
		path: "/api/todos/{id}",
		request: {
			params: ParamsSchema,
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: TodoSchema,
					},
				},
				description: "TODOを返す",
			},
			404: {
				description: "TODOが見つからない",
			},
		},
	});

	app.openapi(getTodoRoute, async (c) => {
		// サービスを動的に取得
		const { createDb } = await import("../../db/client");
		const { TodoRepository } = await import(
			"../../repositories/todo.repository"
		);
		const { TodoService } = await import("../../services/todo.service");

		const db = createDb(c.env.DB);
		const repository = new TodoRepository(db);
		const service = new TodoService(repository);

		const { id } = c.req.valid("param");
		try {
			const todo = await service.getTodoById(id);
			const formattedTodo = {
				...todo,
				description: todo.description ?? undefined,
				dueDate: todo.dueDate ?? undefined,
			};
			return c.json(formattedTodo);
		} catch (_error) {
			return c.json({ error: "Todo not found" }, 404);
		}
	});

	// PUT /api/todos/:id - 更新
	const updateTodoRoute = createRoute({
		method: "put",
		path: "/api/todos/{id}",
		request: {
			params: ParamsSchema,
			body: {
				content: {
					"application/json": {
						schema: UpdateTodoSchema,
					},
				},
			},
		},
		responses: {
			200: {
				content: {
					"application/json": {
						schema: TodoSchema,
					},
				},
				description: "更新されたTODOを返す",
			},
			404: {
				description: "TODOが見つからない",
			},
		},
	});

	app.openapi(updateTodoRoute, async (c) => {
		// サービスを動的に取得
		const { createDb } = await import("../../db/client");
		const { TodoRepository } = await import(
			"../../repositories/todo.repository"
		);
		const { TodoService } = await import("../../services/todo.service");

		const db = createDb(c.env.DB);
		const repository = new TodoRepository(db);
		const service = new TodoService(repository);

		const { id } = c.req.valid("param");
		const data = c.req.valid("json");
		try {
			const todo = await service.updateTodo(id, data);
			const formattedTodo = {
				...todo,
				description: todo.description ?? undefined,
				dueDate: todo.dueDate ?? undefined,
			};
			return c.json(formattedTodo);
		} catch (_error) {
			return c.json({ error: "Todo not found" }, 404);
		}
	});

	// DELETE /api/todos/:id - 削除
	const deleteTodoRoute = createRoute({
		method: "delete",
		path: "/api/todos/{id}",
		request: {
			params: ParamsSchema,
		},
		responses: {
			204: {
				description: "TODOを削除した",
			},
			404: {
				description: "TODOが見つからない",
			},
		},
	});

	app.openapi(deleteTodoRoute, async (c) => {
		// サービスを動的に取得
		const { createDb } = await import("../../db/client");
		const { TodoRepository } = await import(
			"../../repositories/todo.repository"
		);
		const { TodoService } = await import("../../services/todo.service");

		const db = createDb(c.env.DB);
		const repository = new TodoRepository(db);
		const service = new TodoService(repository);

		const { id } = c.req.valid("param");
		try {
			await service.deleteTodo(id);
			return c.body(null, 204);
		} catch (_error) {
			return c.json({ error: "Todo not found" }, 404);
		}
	});

	return app;
}
