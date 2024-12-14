import { readFile, writeFile } from 'fs/promises';
import { db } from './db/database';
import { GetTodos, TodosTable } from './db/types';

const getAllData = async () => {
  const todos = await db
    .selectFrom('todos')
    .selectAll()
    .limit(10000)
    .orderBy('created_at asc')
    .execute();

  await writeFile('./data.json', JSON.stringify(todos), 'utf-8');
};

const deleteAllData = async () => {
  await db.deleteFrom('todos').execute();
};

const insertData = async () => {
  const data = JSON.parse(await readFile('./data.json', 'utf-8')) as GetTodos[];
  const insertData = data.map((todo) => ({
    title: todo.title,
    content: todo.content,
    text_vector: todo.text_vector,
  }));
  await db.insertInto('todos').values(insertData).execute();
};

insertData();
