// components/views/ListView.tsx
'use client'

import { useState } from 'react'
import TaskCard from '@/components/tasks/TaskCard'
import QuickAdd from '@/components/tasks/QuickAdd'

interface Task {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done'
  due_date?: string
  work_type_id: string
  estimated_minutes?: number
}

export default function ListView() {
  // Sample tasks for demo
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Design new landing page',
      priority: 'high',
      status: 'in_progress',
      work_type_id: 'deep-work',
      due_date: new Date().toISOString(),
      estimated_minutes: 120,
    },
    {
      id: '2',
      title: 'Team standup',
      priority: 'medium',
      status: 'todo',
      work_type_id: 'meetings',
      due_date: new Date().toISOString(),
      estimated_minutes: 30,
    },
    {
      id: '3',
      title: 'Grocery shopping',
      priority: 'low',
      status: 'todo',
      work_type_id: 'errands',
      estimated_minutes: 45,
    },
  ])

  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all')
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'manual'>('due_date')

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    if (sortBy === 'due_date' && a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    return 0
  })

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quick Add */}
      <QuickAdd onAdd={(task) => setTasks([task, ...tasks])} />

      {/* Filters & Sort */}
      <div className="flex gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All Tasks</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
          <option value="manual">Manual Order</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary text-lg mb-2">No tasks yet</p>
            <p className="text-secondary text-sm">Create your first task to get started</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => {
                setTasks(
                  tasks.map((t) =>
                    t.id === task.id ? { ...t, status: 'done' } : t
                  )
                )
              }}
              onDelete={() => {
                setTasks(tasks.filter((t) => t.id !== task.id))
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
