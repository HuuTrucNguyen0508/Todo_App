import { z } from 'zod';

export const CreateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
});

export const UpdateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title too long')
    .optional(),
  completed: z.boolean().optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
