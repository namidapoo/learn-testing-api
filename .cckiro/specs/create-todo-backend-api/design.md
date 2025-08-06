# TODOアプリバックエンドAPI 設計書

## 1. アーキテクチャ概要

### 1.1 レイヤー構成
```
┌─────────────────────────────────────┐
│         API Layer (Hono)            │
│  - Routes (OpenAPI定義)             │
│  - Validation (Zod)                 │
│  - Error Handling                   │
├─────────────────────────────────────┤
│       Service Layer                 │
│  - Business Logic                   │
│  - Data Transformation              │
├─────────────────────────────────────┤
│     Repository Layer                │
│  - Database Access (Drizzle)        │
│  - Query Building                   │
├─────────────────────────────────────┤
│        Data Layer                   │
│  - D1 Database                      │
│  - Schema Definition                │
└─────────────────────────────────────┘
```

### 1.2 ディレクトリ構成
```
src/
├── api/
│   ├── routes/
│   │   └── todos.ts          # TODOエンドポイント定義
│   ├── schemas/
│   │   └── todo.ts           # Zodスキーマ定義
│   └── openapi.ts            # OpenAPI設定
├── services/
│   └── todo.service.ts       # ビジネスロジック
├── repositories/
│   └── todo.repository.ts    # データアクセス層
├── db/
│   ├── schema.ts             # Drizzleスキーマ
│   ├── client.ts             # データベースクライアント設定
│   └── migrations/           # マイグレーション
├── types/
│   └── todo.ts               # TypeScript型定義
├── utils/
│   ├── errors.ts             # エラーハンドリング
│   └── id.ts                 # ID生成ユーティリティ
├── app.ts                    # アプリケーションエントリーポイント
└── index.ts                  # サーバー起動
```

## 2. データベース設計

### 2.1 データベースクライアント設定
```typescript
// src/db/client.ts
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Db = ReturnType<typeof createDb>;
```

### 2.2 テーブル定義（Drizzle Schema）
```typescript
// src/db/schema.ts
import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const todos = sqliteTable('todos', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  dueDate: text('due_date'), // ISO 8601形式
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});
```

## 3. API設計詳細

### 3.1 Zodスキーマ定義
```typescript
// src/api/schemas/todo.ts
import { z } from '@hono/zod-openapi';

// 基本スキーマ
export const TodoSchema = z.object({
  id: z.string().uuid().openapi({
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
  title: z.string().min(1).max(100).openapi({
    example: '買い物に行く',
  }),
  description: z.string().max(500).optional().openapi({
    example: '牛乳とパンを買う',
  }),
  completed: z.boolean().openapi({
    example: false,
  }),
  dueDate: z.string().datetime().optional().openapi({
    example: '2024-12-31T23:59:59Z',
  }),
  createdAt: z.string().datetime().openapi({
    example: '2024-01-01T00:00:00Z',
  }),
  updatedAt: z.string().datetime().openapi({
    example: '2024-01-01T00:00:00Z',
  }),
}).openapi('Todo');

// 作成用スキーマ
export const CreateTodoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  dueDate: z.string().datetime().optional(),
}).openapi('CreateTodo');

// 更新用スキーマ
export const UpdateTodoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().datetime().optional(),
}).openapi('UpdateTodo');

// パラメータスキーマ
export const TodoIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '550e8400-e29b-41d4-a716-446655440000',
  }),
});

// クエリパラメータスキーマ
export const TodoQuerySchema = z.object({
  completed: z.enum(['true', 'false']).optional().openapi({
    example: 'false',
  }),
  sortBy: z.enum(['dueDate', 'createdAt']).optional().openapi({
    example: 'dueDate',
  }),
  order: z.enum(['asc', 'desc']).optional().openapi({
    example: 'asc',
  }),
}).openapi('TodoQuery');
```

### 3.2 エンドポイント定義
```typescript
// src/api/routes/todos.ts
import { createRoute } from '@hono/zod-openapi';

// GET /api/todos
export const getTodosRoute = createRoute({
  method: 'get',
  path: '/api/todos',
  request: {
    query: TodoQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(TodoSchema),
        },
      },
      description: 'TODO一覧の取得成功',
    },
  },
});

// GET /api/todos/:id
export const getTodoRoute = createRoute({
  method: 'get',
  path: '/api/todos/{id}',
  request: {
    params: TodoIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TodoSchema,
        },
      },
      description: 'TODO詳細の取得成功',
    },
    404: {
      description: 'TODOが見つかりません',
    },
  },
});

// POST /api/todos
export const createTodoRoute = createRoute({
  method: 'post',
  path: '/api/todos',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateTodoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: TodoSchema,
        },
      },
      description: 'TODO作成成功',
    },
    400: {
      description: 'バリデーションエラー',
    },
  },
});

// PUT /api/todos/:id
export const updateTodoRoute = createRoute({
  method: 'put',
  path: '/api/todos/{id}',
  request: {
    params: TodoIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: UpdateTodoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TodoSchema,
        },
      },
      description: 'TODO更新成功',
    },
    404: {
      description: 'TODOが見つかりません',
    },
    400: {
      description: 'バリデーションエラー',
    },
  },
});

// DELETE /api/todos/:id
export const deleteTodoRoute = createRoute({
  method: 'delete',
  path: '/api/todos/{id}',
  request: {
    params: TodoIdParamSchema,
  },
  responses: {
    204: {
      description: 'TODO削除成功',
    },
    404: {
      description: 'TODOが見つかりません',
    },
  },
});
```

## 4. エラーハンドリング設計

### 4.1 エラーレスポンス形式
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 4.2 エラーコード体系
- `VALIDATION_ERROR`: バリデーションエラー
- `NOT_FOUND`: リソースが見つからない
- `DATABASE_ERROR`: データベースエラー
- `INTERNAL_ERROR`: 内部エラー

## 5. テスト設計

### 5.1 テスト構成
```
tests/
├── unit/
│   ├── services/
│   │   └── todo.service.test.ts
│   └── repositories/
│       └── todo.repository.test.ts
├── integration/
│   └── api/
│       └── todos.test.ts
└── fixtures/
    └── todos.ts
```

### 5.2 テストシナリオ
1. **単体テスト**
   - サービス層のビジネスロジック
   - リポジトリ層のクエリ生成
   - バリデーションロジック

2. **統合テスト**
   - APIエンドポイントの動作確認
   - エラーハンドリング
   - データベースとの連携

### 5.3 TDDサイクル
1. 失敗するテストを書く（Red）
2. テストを通す最小限の実装（Green）
3. リファクタリング（Refactor）

## 6. 実装の優先順位
1. データベーススキーマとマイグレーション
2. Zodスキーマ定義
3. GET /api/todos（一覧取得）
4. POST /api/todos（作成）
5. GET /api/todos/:id（詳細取得）
6. PUT /api/todos/:id（更新）
7. DELETE /api/todos/:id（削除）
8. Swagger UI統合
