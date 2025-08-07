import { asc, desc, eq } from "drizzle-orm";
import type { Db } from "../db/client";
import { todos } from "../db/schema";
import { generateId } from "../utils/id";

export interface TodoFilter {
	completed?: boolean;
	sortBy?: "dueDate" | "createdAt";
	order?: "asc" | "desc";
}

export interface CreateTodoData {
	title: string;
	description?: string;
	dueDate?: string;
}

export interface UpdateTodoData {
	title?: string;
	description?: string;
	completed?: boolean;
	dueDate?: string;
}

export class TodoRepository {
	constructor(private db: Db) {}

	async findAll(filter?: TodoFilter) {
		let query = this.db.select().from(todos);

		// フィルタリング
		if (filter?.completed !== undefined) {
			query = query.where(
				eq(todos.completed, filter.completed),
			) as typeof query;
		}

		// ソート
		if (filter?.sortBy) {
			const column =
				filter.sortBy === "dueDate" ? todos.dueDate : todos.createdAt;
			const orderFunc = filter.order === "desc" ? desc : asc;
			query = query.orderBy(orderFunc(column)) as typeof query;
		}

		return await query;
	}

	async findById(id: string) {
		const result = await this.db
			.select()
			.from(todos)
			.where(eq(todos.id, id))
			.limit(1);

		return result[0] || null;
	}

	async create(data: CreateTodoData) {
		const id = generateId();
		const now = new Date().toISOString();

		const newTodo = {
			id,
			title: data.title,
			description: data.description || null,
			completed: false,
			dueDate: data.dueDate || null,
			createdAt: now,
			updatedAt: now,
		};

		await this.db.insert(todos).values(newTodo);

		return newTodo;
	}

	async update(id: string, data: UpdateTodoData) {
		// 既存のTODOを確認
		const existing = await this.findById(id);
		if (!existing) {
			return null;
		}

		const updatedTodo = {
			...existing,
			...data,
			updatedAt: new Date().toISOString(),
		};

		await this.db.update(todos).set(updatedTodo).where(eq(todos.id, id));

		return updatedTodo;
	}

	async delete(id: string) {
		// 既存のTODOを確認
		const existing = await this.findById(id);
		if (!existing) {
			return false;
		}

		await this.db.delete(todos).where(eq(todos.id, id));

		return true;
	}
}
