import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { createTodoRoutes } from "./api/routes/todos";

export type Env = {
	Bindings: CloudflareBindings;
};

const app = new OpenAPIHono<Env>();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

// APIルートを統合
const todoRoutes = createTodoRoutes();
app.route("/", todoRoutes);

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
			url: "https://learn-testing-api.namidapoo.workers.dev",
			description: "Production",
		},
		{
			url: "http://localhost:8787",
			description: "Local Development",
		},
	],
});

export default app;
