import { Todo } from '@/types/todo';
import { TodoItem } from './todo-item';
import { traceUserInteraction } from '@/lib/tracing';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const handleToggle = (id: string, onToggle: (id: string) => void) => {
  traceUserInteraction('toggle_todo', `todo-${id}`);
  onToggle(id);
};

const handleDelete = (id: string, onDelete: (id: string) => void) => {
  traceUserInteraction('delete_todo', `todo-${id}`);
  onDelete(id);
};

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No todos found. Create your first todo above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={(id) => handleToggle(id, onToggle)}
          onDelete={(id) => handleDelete(id, onDelete)}
        />
      ))}
    </div>
  );
}
