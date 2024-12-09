import {
  Generated,
  ColumnType,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely';

// テーブル定義のモデル
export interface TodosTable {
  id: Generated<string>; // UUID型。デフォルト値が生成される
  title: string; // 必須のTEXT型
  content: string; // 必須のTEXT型
  text_vector: Float32Array; // VECTOR(1024)型
  created_at: ColumnType<Date, never, Date>; // デフォルトで現在時刻
  updated_at: ColumnType<Date, never, Date>; // デフォルトで現在時刻
}

export type GetTodos = Selectable<TodosTable>;
export type NewTodos = Insertable<TodosTable>;
export type UpdateTodos = Updateable<TodosTable>;

export interface Database {
  todos: TodosTable;
}
