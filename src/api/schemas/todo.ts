import { z } from "@hono/zod-openapi";

// 基本スキーマ
export const TodoSchema = z
	.object({
		id: z.string().uuid().openapi({
			example: "550e8400-e29b-41d4-a716-446655440000",
		}),
		title: z.string().min(1).max(100).openapi({
			example: "買い物に行く",
		}),
		description: z.string().max(500).optional().openapi({
			example: "牛乳とパンを買う",
		}),
		completed: z.boolean().openapi({
			example: false,
		}),
		createdAt: z.string().datetime().openapi({
			example: "2024-01-01T00:00:00Z",
		}),
		updatedAt: z.string().datetime().openapi({
			example: "2024-01-01T00:00:00Z",
		}),
	})
	.openapi("Todo");

// 作成用スキーマ
export const CreateTodoSchema = z
	.object({
		title: z.string().min(1).max(100),
		description: z.string().max(500).optional(),
	})
	.openapi("CreateTodo");

// 更新用スキーマ
export const UpdateTodoSchema = z
	.object({
		title: z.string().min(1).max(100).optional(),
		description: z.string().max(500).optional(),
		completed: z.boolean().optional(),
	})
	.openapi("UpdateTodo");

// パラメータスキーマ
export const TodoIdParamSchema = z.object({
	id: z
		.string()
		.uuid()
		.openapi({
			param: {
				name: "id",
				in: "path",
			},
			example: "550e8400-e29b-41d4-a716-446655440000",
		}),
});

// クエリパラメータスキーマ
export const TodoQuerySchema = z
	.object({
		completed: z.enum(["true", "false"]).optional().openapi({
			description: "完了状態でフィルタリング（true: 完了済み, false: 未完了）",
			example: "false",
		}),
		sortBy: z.enum(["createdAt"]).optional().openapi({
			example: "createdAt",
		}),
		order: z.enum(["asc", "desc"]).optional().openapi({
			example: "asc",
		}),
	})
	.openapi("TodoQuery");
