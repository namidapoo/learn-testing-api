# TODO API

TODO アプリケーションの RESTful API です。Cloudflare Workers 上で動作します。

## デモ

- **Swagger UI**: https://learn-testing-api.namidapoo.workers.dev/doc
- **API エンドポイント**: https://learn-testing-api.namidapoo.workers.dev

## 機能

- TODO アイテムの CRUD 操作
- 完了状態でのフィルタリング
- 作成日時でのソート
- OpenAPI 仕様の自動生成
- Swagger UI による API ドキュメント

## 技術スタック

- **ランタイム**: Cloudflare Workers
- **フレームワーク**: Hono
- **ORM**: Drizzle ORM
- **データベース**: Cloudflare D1 (SQLite)
- **バリデーション**: Zod
- **API 仕様**: OpenAPI 3.0
- **テスト**: Vitest
- **パッケージマネージャー**: Bun

## セットアップ

### 必要な環境

- Node.js 18 以上
- Bun
- Wrangler CLI

### インストール

```bash
bun install
```

### 開発サーバーの起動

```bash
bun run dev
```

開発サーバーは http://localhost:8787 で起動します。

### データベースのセットアップ

1. D1 データベースを作成:

```bash
wrangler d1 create todo-db
```

2. `wrangler.toml`にデータベースの ID を設定

3. マイグレーションを実行:

```bash
wrangler d1 execute todo-db --local --file=./drizzle/0000_slim_butterfly.sql
```

## API エンドポイント

### TODO 一覧取得

```
GET /api/todos?completed=true&sortBy=createdAt&order=desc
```

### TODO 作成

```
POST /api/todos
Content-Type: application/json

{
  "title": "買い物に行く",
  "description": "牛乳とパンを買う"
}
```

### TODO 取得

```
GET /api/todos/{id}
```

### TODO 更新

```
PUT /api/todos/{id}
Content-Type: application/json

{
  "title": "買い物完了",
  "completed": true
}
```

### TODO 削除

```
DELETE /api/todos/{id}
```

## テスト

```bash
# テストを実行
bun test

# ウォッチモードでテストを実行
bun run test:watch
```

## OpenAPI 仕様の生成

開発サーバーを起動してから、以下のコマンドを実行:

```bash
# JSON形式とYAML形式の両方を生成
bun run openapi:generate

# JSON形式のみ
bun run openapi:json

# YAML形式のみ（JSONから変換）
bun run openapi:yml
```

## デプロイ

Cloudflare Workers にデプロイ:

```bash
bun run deploy
```

## その他のコマンド

```bash
# 型定義を生成
bun run cf-typegen

# コードフォーマット
bun run format

# リント
bun run lint

# リント修正
bun run lint:fix

# 全体チェック（フォーマット + リント）
bun run check
```

## プロジェクト構造

```
learn-testing-api/
├── src/
│   ├── api/
│   │   ├── routes/      # APIルート定義
│   │   └── schemas/      # Zodスキーマ定義
│   ├── db/
│   │   ├── client.ts     # データベースクライアント
│   │   └── schema.ts     # Drizzleスキーマ
│   ├── repositories/     # データアクセス層
│   ├── services/         # ビジネスロジック層
│   └── index.ts          # アプリケーションエントリーポイント
├── drizzle/              # データベースマイグレーション
├── openapi.json          # OpenAPI仕様（JSON）
├── openapi.yml           # OpenAPI仕様（YAML）
└── wrangler.toml         # Cloudflare Workers設定
```

## アーキテクチャ

レイヤードアーキテクチャを採用しています：

1. **Routes 層**: HTTP リクエスト/レスポンスの処理
2. **Service 層**: ビジネスロジックの実装
3. **Repository 層**: データベースアクセスの抽象化
4. **Database 層**: Drizzle ORM を使用したデータベース操作
