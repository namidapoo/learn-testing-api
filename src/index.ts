import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";

export type Env = {
	Bindings: CloudflareBindings;
};

const app = new OpenAPIHono<Env>();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

// Swagger UI
app.get("/doc", swaggerUI({ url: "/openapi.json" }));

// OpenAPI spec
app.doc("/openapi.json", {
	openapi: "3.0.0",
	info: {
		title: "TODO API",
		version: "1.0.0",
		description: "TODOアプリケーションのRESTful API",
	},
	servers: [
		{
			url: "http://localhost:8787",
			description: "開発サーバー",
		},
	],
});

// APIルートをファクトリー関数で統合
app.use("/api/*", async (c) => {
	const { createDb } = await import("./db/client");
	const { TodoRepository } = await import("./repositories/todo.repository");
	const { TodoService } = await import("./services/todo.service");
	const { createTodoRoutes } = await import("./api/routes/todos");

	const db = createDb(c.env.DB);
	const repository = new TodoRepository(db);
	const service = new TodoService(repository);
	const todoApp = createTodoRoutes(service);

	// ルートハンドラーを実行
	return todoApp.fetch(c.req.raw, c.env, c.executionCtx);
});

export default app;
