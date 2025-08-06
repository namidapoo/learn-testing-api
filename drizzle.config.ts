import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
		databaseId: "1f0b0db9-3466-4059-8afc-25f637c76b73",
		token: process.env.CLOUDFLARE_D1_TOKEN || "",
	},
});
