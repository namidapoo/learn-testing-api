import { describe, expect, it } from "vitest";
import { createDb } from "./client";

describe("D1データベースクライアント", () => {
	it("createDb関数が定義されている", () => {
		expect(createDb).toBeDefined();
		expect(typeof createDb).toBe("function");
	});

	it("createDbはD1Databaseを引数に取る", () => {
		// モックD1Databaseオブジェクト
		const mockD1 = {
			prepare: () => ({}),
			batch: () => Promise.resolve([]),
			exec: () => Promise.resolve({}),
			dump: () => Promise.resolve(new ArrayBuffer(0)),
		} as unknown as D1Database;

		const db = createDb(mockD1);
		expect(db).toBeDefined();
		expect(db.select).toBeDefined();
		expect(db.insert).toBeDefined();
		expect(db.update).toBeDefined();
		expect(db.delete).toBeDefined();
	});
});
