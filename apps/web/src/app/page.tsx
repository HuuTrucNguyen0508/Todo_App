'use client';

import { useState, useEffect } from 'react';
import { TodoList } from '@/components/todo-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Circle, List } from 'lucide-react';
import { Todo } from '@/types/todo';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/metrics';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const data = await api.getTodos();
      setTodos(data);
      trackEvent('todos_loaded', { count: data.length });
    } catch (error) {
      console.error('Failed to load todos:', error);
      trackEvent('todos_load_error');
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const optimisticTodo: Todo = {
      id: `temp-${Date.now()}`,
      title: newTodoTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update
    setTodos((prev) => [optimisticTodo, ...prev]);
    setNewTodoTitle('');

    try {
      const newTodo = await api.createTodo(newTodoTitle.trim());
      setTodos((prev) =>
        prev.map((todo) => (todo.id === optimisticTodo.id ? newTodo : todo))
      );
      trackEvent('todo_created');
    } catch (error) {
      console.error('Failed to create todo:', error);
      setTodos((prev) => prev.filter((todo) => todo.id !== optimisticTodo.id));
      trackEvent('todo_create_error');
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const updatedTodo = await api.toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));
      trackEvent('todo_toggled', { completed: !todo.completed });
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      // Revert optimistic update
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: todo.completed } : t))
      );
      trackEvent('todo_toggle_error');
    }
  };

  const deleteTodo = async (id: string) => {
    const todoToDelete = todos.find((t) => t.id === id);
    if (!todoToDelete) return;

    // Create a copy of current todos for optimistic update
    const currentTodos = [...todos];
    const updatedTodos = currentTodos.filter((t) => t.id !== id);

    // Optimistic update
    setTodos(updatedTodos);

    try {
      await api.deleteTodo(id);
      trackEvent('todo_deleted');
    } catch (error) {
      console.error('Failed to delete todo:', error);
      // Revert optimistic update
      setTodos(currentTodos);
      trackEvent('todo_delete_error');
    }
  };

  const filteredTodos = todos.filter((todo) => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cursor Todo</h1>
          <p className="text-gray-600">Stay organized with style</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Your Tasks
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {activeCount} active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={createTodo} className="flex gap-2">
              <Input
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </form>

            <Tabs
              value={filter}
              onValueChange={(value) => setFilter(value as any)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  All ({todos.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  Active ({activeCount})
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Completed ({todos.length - activeCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="mt-4">
                <TodoList
                  todos={filteredTodos}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
