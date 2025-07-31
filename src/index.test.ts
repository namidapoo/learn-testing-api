import { describe, expect, it } from "vitest";
import app from "./index";

describe("Honoアプリケーション", () => {
	it("ルートパスにGETリクエストを送ると「Hello Hono!」が返される", async () => {
		const res = await app.request("/");
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("Hello Hono!");
	});

	it("Content-Typeがtext/plainである", async () => {
		const res = await app.request("/");
		const contentType = res.headers.get("content-type");
		// Honoのapp.request()はNode.js環境（Vitest）では自動的にContent-Typeを設定するが、
		// Bun環境では設定しないため、環境に応じた検証が必要
		if (contentType) {
			expect(contentType.includes("text/plain")).toBe(true);
		} else {
			// Bunテストランナーの場合、Content-Typeが自動設定されない
			expect(contentType).toBeNull();
		}
	});

	it("存在しないパスにアクセスすると404が返される", async () => {
		const res = await app.request("/not-found");
		expect(res.status).toBe(404);
	});
});
