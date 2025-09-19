import { Todo } from '@/types/todo';
import { traceAsyncOperation, SpanKind } from './tracing';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4003';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options?.method || 'GET';

    return traceAsyncOperation(
      {
        operation: `http.${method.toLowerCase()}`,
        attributes: {
          'http.method': method,
          'http.url': url,
          'http.target': endpoint,
          component: 'api-client',
        },
        kind: SpanKind.CLIENT,
      },
      async () => {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
          ...options,
        });

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status} ${response.statusText}`
          );
        }

        return response.json();
      }
    );
  }

  async getTodos(): Promise<Todo[]> {
    return this.request<Todo[]>('/todos');
  }

  async createTodo(title: string): Promise<Todo> {
    return this.request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async toggleTodo(id: string): Promise<Todo> {
    return this.request<Todo>(`/todos/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async deleteTodo(id: string): Promise<void> {
    await this.request(`/todos/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();
