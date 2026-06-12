import type { Todo } from './todo.schema.js';

export const todos: Todo[] = [
  { id: '1', title: 'Build something cool', done: false, createdAt: new Date().toISOString() },
];

let nextId = 2;

export function addTodo(title: string): Todo {
  const todo: Todo = { id: String(nextId++), title, done: false, createdAt: new Date().toISOString() };
  todos.push(todo);
  return todo;
}

export function patchTodo(id: string, done: boolean): Todo | null {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return null;
  todo.done = done;
  return todo;
}
