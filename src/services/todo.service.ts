import type {
	CreateTodoData,
	TodoFilter,
	TodoRepository,
	UpdateTodoData,
} from "../repositories/todo.repository";

export class TodoService {
	constructor(private repository: TodoRepository) {}

	async getTodos(filter?: TodoFilter) {
		return await this.repository.findAll(filter);
	}

	async getTodoById(id: string) {
		const todo = await this.repository.findById(id);
		if (!todo) {
			throw new Error("Todo not found");
		}
		return todo;
	}

	async createTodo(data: CreateTodoData) {
		if (!data.title || data.title.trim() === "") {
			throw new Error("Title is required");
		}
		return await this.repository.create(data);
	}

	async updateTodo(id: string, data: UpdateTodoData) {
		if (data.title !== undefined && data.title.trim() === "") {
			throw new Error("Title cannot be empty");
		}
		const updatedTodo = await this.repository.update(id, data);
		if (!updatedTodo) {
			throw new Error("Todo not found");
		}
		return updatedTodo;
	}

	async deleteTodo(id: string) {
		const success = await this.repository.delete(id);
		if (!success) {
			throw new Error("Todo not found");
		}
	}
}
