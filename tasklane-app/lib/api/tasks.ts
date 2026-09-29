// lib/api/tasks.ts
import { supabase } from '@/lib/auth/client'
import type { Task } from '@prisma/client'

export async function getTasks(filters?: {
  status?: string
  work_type_id?: string
  priority?: string
}) {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.work_type_id) {
    query = query.eq('work_type_id', filters.work_type_id)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Task[]
}

export async function getTask(id: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Task
}

export async function createTask(task: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function completeTask(id: string) {
  return updateTask(id, {
    status: 'done',
    completed_at: new Date(),
  })
}

export async function duplicateTask(id: string) {
  const task = await getTask(id)
  const { id: _, created_at, updated_at, completed_at, ...rest } = task
  return createTask({
    ...rest,
    title: `${task.title} (copy)`,
  })
}
