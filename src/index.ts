import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";

const app = new OpenAPIHono();

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
		description: "TODO管理API",
	},
});

export default app;
