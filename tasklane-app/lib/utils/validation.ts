// lib/utils/validation.ts
import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title required').max(200),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  work_type_id: z.string(),
  due_date: z.string().datetime().optional().nullable(),
  due_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  estimated_minutes: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  recurrence: z.enum(['daily', 'weekly', 'custom']).optional(),
})

export const workTypeSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string().min(1),
})

export const focusSessionSchema = z.object({
  task_id: z.string().optional().nullable(),
  work_type_id: z.string().optional(),
  duration_minutes: z.number().int().positive(),
  was_completed: z.boolean().default(true),
})

export type Task = z.infer<typeof taskSchema>
export type WorkType = z.infer<typeof workTypeSchema>
export type FocusSession = z.infer<typeof focusSessionSchema>
