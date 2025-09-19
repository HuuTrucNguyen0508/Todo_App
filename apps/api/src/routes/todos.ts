import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateTodoSchema } from '../types/todo';
import { db } from '../lib/db';
import {
  httpRequestsTotal,
  httpRequestDuration,
  todosCreatedTotal,
  todosCompletedTotal,
  todosDeletedTotal,
} from '../lib/metrics';
import { logger } from '../lib/logger';

export async function todosRoutes(fastify: FastifyInstance) {
  // Middleware to track HTTP metrics
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    (request as any).startTime = Date.now();
  });

  fastify.addHook(
    'onResponse',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const duration = (Date.now() - (request as any).startTime) / 1000;
      const route = request.routerPath || request.url;

      httpRequestsTotal.inc({
        method: request.method,
        route,
        status_code: reply.statusCode.toString(),
      });

      httpRequestDuration.observe(
        {
          method: request.method,
          route,
          status_code: reply.statusCode.toString(),
        },
        duration
      );
    }
  );

  // GET /todos - List all todos
  fastify.get('/todos', async () => {
      try {
        const todos = await db.todo.findMany({
          orderBy: { createdAt: 'desc' },
        });

        logger.info({ count: todos.length }, 'Retrieved todos');
        return todos;
      } catch (error) {
        logger.error(error, 'Failed to retrieve todos');
        throw error;
      }
    }
  );

  // POST /todos - Create a new todo
  fastify.post(
    '/todos',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 255 },
          },
          required: ['title'],
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { title: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { title } = CreateTodoSchema.parse(request.body);

        const todo = await db.todo.create({
          data: {
            title: title.trim(),
          },
        });

        todosCreatedTotal.inc();
        logger.info({ todoId: todo.id, title }, 'Created new todo');

        return reply.status(201).send(todo);
      } catch (error) {
        logger.error(error, 'Failed to create todo');
        throw error;
      }
    }
  );

  // PATCH /todos/:id/toggle - Toggle todo completion
  fastify.patch(
    '/todos/:id/toggle',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;

        // First, get the current todo to determine the new state
        const existingTodo = await db.todo.findUnique({
          where: { id },
        });

        if (!existingTodo) {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Todo not found',
          });
        }

        const newCompletedState = !existingTodo.completed;

        const todo = await db.todo.update({
          where: { id },
          data: {
            completed: newCompletedState,
          },
        });

        if (newCompletedState) {
          todosCompletedTotal.inc();
        }

        logger.info(
          { todoId: id, completed: todo.completed },
          'Toggled todo completion'
        );

        return todo;
      } catch (error) {
        logger.error(error, 'Failed to toggle todo');
        throw error;
      }
    }
  );

  // DELETE /todos/:id - Delete a todo
  fastify.delete(
    '/todos/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
    async (
      request: FastifyRequest<{
        Params: { id: string };
      }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;

        await db.todo.delete({
          where: { id },
        });

        todosDeletedTotal.inc();
        logger.info({ todoId: id }, 'Deleted todo');

        return reply.status(204).send();
      } catch (error) {
        if ((error as any).code === 'P2025') {
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Todo not found',
          });
        }

        logger.error(error, 'Failed to delete todo');
        throw error;
      }
    }
  );
}
