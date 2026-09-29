// components/views/KanbanView.tsx
'use client'

import { useState } from 'react'
import TaskCard from '@/components/tasks/TaskCard'

interface Task {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done'
  due_date?: string
  work_type_id: string
  estimated_minutes?: number
}

export default function KanbanView() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design new landing page',
      priority: 'high',
      status: 'in_progress',
      work_type_id: 'deep-work',
      estimated_minutes: 120,
    },
    {
      id: '2',
      title: 'Team standup',
      priority: 'medium',
      status: 'todo',
      work_type_id: 'meetings',
      estimated_minutes: 30,
    },
    {
      id: '3',
      title: 'Code review completed',
      priority: 'high',
      status: 'done',
      work_type_id: 'deep-work',
      estimated_minutes: 60,
    },
  ])

  const columns = [
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
  ]

  const getTasksByStatus = (status: string) =>
    tasks.filter((t) => t.status === status)

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {columns.map((column) => (
        <div key={column.id} className="flex flex-col bg-bg rounded-lg p-4">
          <h3 className="font-semibold text-primary mb-4">{column.label}</h3>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {getTasksByStatus(column.id).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={() => setTasks(tasks.filter((t) => t.id !== task.id))}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
