import { describe, expect, it } from "vitest";
import app from "../index";

describe("OpenAPI設定", () => {
	describe("Swagger UI", () => {
		it("/docにアクセスするとSwagger UIが表示される", async () => {
			const res = await app.request("/doc");
			expect(res.status).toBe(200);
			const contentType = res.headers.get("content-type");
			expect(contentType).toContain("text/html");
		});
	});

	describe("OpenAPIスペック", () => {
		it("/openapi.jsonでOpenAPI仕様が取得できる", async () => {
			const res = await app.request("/openapi.json");
			expect(res.status).toBe(200);
			const contentType = res.headers.get("content-type");
			expect(contentType).toContain("application/json");

			const spec = (await res.json()) as {
				openapi: string;
				info: { title: string; version: string };
			};
			expect(spec).toHaveProperty("openapi");
			expect(spec).toHaveProperty("info");
			expect(spec.info).toHaveProperty("title", "TODO API");
			expect(spec.info).toHaveProperty("version", "1.0.0");
		});
	});
});
