# TODOアプリバックエンドAPI 実装計画書

## 1. 現在のプロジェクト状況

### 1.1 既存のセットアップ
- [x] Honoプロジェクトの基本構成
- [x] TypeScript設定済み
- [x] Vitest設定済み（カバレッジ設定含む）
- [x] Wrangler（Cloudflare Workers）設定済み
- [x] Biome（リンター/フォーマッター）設定済み
- [x] Lefthook（Git hooks）設定済み

### 1.2 追加で必要な依存関係
```bash
# Hono OpenAPI関連
bun add @hono/zod-openapi @hono/swagger-ui

# Drizzle ORM関連
bun add drizzle-orm
bun add -d drizzle-kit

# バリデーション
bun add zod

# ユーティリティ
bun add uuid
bun add -d @types/uuid
```

### 1.3 追加で必要な設定ファイル
- Drizzle設定（drizzle.config.ts）
- D1データベース設定（wrangler.jsoncに追加）

### 1.4 既存のコード構造
- `src/index.ts`: Honoアプリケーションのエントリーポイント
- `src/index.test.ts`: 既存のテスト（ルートパスのテスト含む）
- `src/utils.ts`, `src/utils.test.ts`: サンプルコード（削除予定）
- `wrangler.jsonc`: Cloudflare Workers設定（D1設定はコメントアウト状態）

## 2. TDDによる段階的実装

### フェーズ0: 依存関係インストールとD1セットアップ（30分）
1. [x] 必要なパッケージをインストール
2. [x] D1データベースを作成（`wrangler d1 create todo-db`）
3. [x] wrangler.jsoncのD1設定コメントを解除して設定を追加
4. [x] `bun run cf-typegen`を実行して型定義を自動生成
5. [x] Drizzle設定ファイルを作成

### フェーズ1: OpenAPIアプリケーション基盤（Day 1）

#### 2.1 OpenAPIHonoへの移行
**Red:**
- [x] OpenAPIHonoインスタンスのテストを作成
- [x] Swagger UIアクセスのテストを作成

**Green:**
- [x] 既存の`src/index.ts`をOpenAPIHonoに変更
- [x] Swagger UI設定を追加（/docエンドポイント）
- [x] OpenAPIドキュメント設定を追加

**Refactor:**
- [x] 既存のindex.test.tsを修正
- [x] utilsファイルを整理（必要に応じて削除）

#### 2.2 データベース基盤
**Red:**
- [ ] D1データベース接続のテストを作成
- [ ] スキーマ定義のテストを作成

**Green:**
- [ ] `src/db/schema.ts`を実装
- [ ] `src/db/client.ts`を実装
- [ ] 初期マイグレーションファイルを作成

**Refactor:**
- [ ] 型定義を最適化
- [ ] エクスポート構造を整理

### フェーズ2: スキーマとバリデーション（Day 2）

#### 2.3 Zodスキーマ定義
**Red:**
- [ ] TodoSchemaのバリデーションテストを作成
- [ ] CreateTodoSchemaのバリデーションテストを作成
- [ ] UpdateTodoSchemaのバリデーションテストを作成

**Green:**
- [ ] `src/api/schemas/todo.ts`を実装
- [ ] `src/types/todo.ts`を実装（型定義）

**Refactor:**
- [ ] スキーマの再利用性を向上
- [ ] エラーメッセージをカスタマイズ

### フェーズ3: リポジトリ層（Day 3）

#### 2.4 Todoリポジトリ
**Red:**
- [ ] findAllのテストを作成
- [ ] findByIdのテストを作成
- [ ] createのテストを作成
- [ ] updateのテストを作成
- [ ] deleteのテストを作成

**Green:**
- [ ] `src/repositories/todo.repository.ts`を実装
- [ ] `src/utils/id.ts`を実装（UUID生成）

**Refactor:**
- [ ] クエリビルダーを最適化
- [ ] エラーハンドリングを統一

### フェーズ4: サービス層（Day 4）

#### 2.5 Todoサービス
**Red:**
- [ ] getTodosのビジネスロジックテストを作成
- [ ] getTodoByIdのビジネスロジックテストを作成
- [ ] createTodoのビジネスロジックテストを作成
- [ ] updateTodoのビジネスロジックテストを作成
- [ ] deleteTodoのビジネスロジックテストを作成

**Green:**
- [ ] `src/services/todo.service.ts`を実装
- [ ] `src/utils/errors.ts`を実装

**Refactor:**
- [ ] データ変換ロジックを整理
- [ ] エラーハンドリングを改善

### フェーズ5: APIエンドポイント実装（Day 5-6）

#### 2.6 GET /api/todos（一覧取得）
**Red:**
- [ ] 正常系の統合テストを作成
- [ ] フィルタリングのテストを作成
- [ ] ソートのテストを作成

**Green:**
- [ ] ルート定義を実装
- [ ] ハンドラーを実装

**Refactor:**
- [ ] レスポンス形式を最適化

#### 2.7 POST /api/todos（作成）
**Red:**
- [ ] 正常系の統合テストを作成
- [ ] バリデーションエラーのテストを作成

**Green:**
- [ ] ルート定義を実装
- [ ] ハンドラーを実装

**Refactor:**
- [ ] バリデーションメッセージを改善

#### 2.8 GET /api/todos/:id（詳細取得）
**Red:**
- [ ] 正常系の統合テストを作成
- [ ] 404エラーのテストを作成

**Green:**
- [ ] ルート定義を実装
- [ ] ハンドラーを実装

**Refactor:**
- [ ] エラーレスポンスを統一

#### 2.9 PUT /api/todos/:id（更新）
**Red:**
- [ ] 正常系の統合テストを作成
- [ ] 部分更新のテストを作成
- [ ] 404エラーのテストを作成

**Green:**
- [ ] ルート定義を実装
- [ ] ハンドラーを実装

**Refactor:**
- [ ] 更新ロジックを最適化

#### 2.10 DELETE /api/todos/:id（削除）
**Red:**
- [ ] 正常系の統合テストを作成
- [ ] 404エラーのテストを作成

**Green:**
- [ ] ルート定義を実装
- [ ] ハンドラーを実装

**Refactor:**
- [ ] レスポンス処理を整理

### フェーズ6: 最終統合（Day 7）

#### 2.11 Swagger UI統合
**Red:**
- [ ] Swagger UIアクセスのテストを作成
- [ ] OpenAPIドキュメント生成のテストを作成

**Green:**
- [ ] Swagger UIミドルウェアを設定
- [ ] OpenAPIドキュメントエンドポイントを実装

**Refactor:**
- [ ] ドキュメント情報を充実

#### 2.12 最終確認
- [ ] すべてのVitestテストが通ることを確認
- [ ] すべてのBunテストが通ることを確認
- [ ] テストカバレッジが80%以上であることを確認

## 3. テスト戦略

### 3.1 テストファイル構成
```
tests/
├── unit/
│   ├── schemas/
│   │   └── todo.test.ts
│   ├── services/
│   │   └── todo.service.test.ts
│   └── repositories/
│       └── todo.repository.test.ts
├── integration/
│   └── api/
│       ├── todos.test.ts
│       └── swagger.test.ts
├── fixtures/
│   └── todos.ts
└── helpers/
    ├── db.ts           # テスト用DB設定
    └── app.ts          # テスト用アプリ設定
```

### 3.2 Bunテストの並行実装
**重要**: 各フェーズでVitestのテストを作成後、同じテストをBunテスト形式でも作成する

```typescript
// Vitestの例: src/api/schemas/todo.test.ts
import { describe, it, expect } from 'vitest';

// Bunテストの例: src/api/schemas/todo.bun.test.ts  
import { describe, it, expect } from 'bun:test';
```

### 3.3 テストデータ
```typescript
// tests/fixtures/todos.ts
export const validTodo = {
  title: 'テストTODO',
  description: 'テスト用の説明',
  dueDate: '2024-12-31T23:59:59Z'
};

export const invalidTodo = {
  title: '', // 空のタイトル
  description: 'a'.repeat(501), // 文字数超過
};
```

## 4. 実装時の注意点

### 4.1 TDD原則の遵守
- 必ず失敗するテストから開始
- テストが通る最小限の実装
- グリーンになってからリファクタリング

### 4.2 コミット戦略
- Red/Green/Refactorの各段階でコミット
- コミットメッセージにTDDフェーズを明記
  - `test(red): Add failing test for todo creation`
  - `feat(green): Implement todo creation to pass test`
  - `refactor: Optimize todo creation logic`

### 4.3 並行テストの管理
- VitestとBunテストで同じテストケースを実装
- テストファイル名で区別
  - Vitest: `*.test.ts`
  - Bun: `*.bun.test.ts`
- テスト実行コマンド
  - Vitest: `bun test` または `bun test:watch`
  - Bun: `bun test:bun` （package.jsonに追加が必要）

## 5. 完了条件

### 5.1 機能要件
- [ ] すべてのCRUD操作が正常に動作
- [ ] バリデーションが適切に機能
- [ ] エラーハンドリングが統一されている

### 5.2 テスト要件
- [ ] テストカバレッジ80%以上
- [ ] VitestとBunの両方でテストが通る
- [ ] 統合テストがすべて成功

### 5.3 ドキュメント要件
- [ ] Swagger UIでAPIが確認できる
- [ ] OpenAPI仕様が自動生成される
- [ ] エンドポイントの説明が充実している
