// components/views/KanbanView.tsx
'use client'

import { useState } from 'react'
import TaskCard, { TaskItem } from '@/components/tasks/TaskCard'
import { Plus, CheckCircle2, Clock, CircleDot, MoreHorizontal } from 'lucide-react'

interface KanbanViewProps {
  tasks?: TaskItem[]
  onTasksChange?: (tasks: TaskItem[]) => void
  onStartFocus?: (task: TaskItem) => void
}

export default function KanbanView({ 
  tasks: propTasks, 
  onTasksChange,
  onStartFocus 
}: KanbanViewProps) {
  const [internalTasks, setInternalTasks] = useState<TaskItem[]>([
    {
      id: '1',
      title: 'Design high-converting landing page',
      priority: 'high',
      status: 'in_progress',
      work_type_id: 'deep-work',
      estimated_minutes: 120,
    },
    {
      id: '2',
      title: 'Engineering sync & sprint retro',
      priority: 'medium',
      status: 'todo',
      work_type_id: 'meetings',
      estimated_minutes: 30,
    },
    {
      id: '3',
      title: 'Configure automated DB backups & SSL',
      priority: 'urgent',
      status: 'done',
      work_type_id: 'deep-work',
      estimated_minutes: 45,
    },
    {
      id: '4',
      title: 'Review user feedback on new command palette',
      priority: 'medium',
      status: 'todo',
      work_type_id: 'learning',
      estimated_minutes: 30,
    }
  ])

  const tasks = propTasks || internalTasks
  const updateTasks = (newTasks: TaskItem[]) => {
    if (onTasksChange) {
      onTasksChange(newTasks)
    } else {
      setInternalTasks(newTasks)
    }
  }

  const columns = [
    { 
      id: 'todo', 
      label: 'To Do', 
      color: 'bg-blue-500', 
      icon: CircleDot, 
      border: 'border-blue-500/20' 
    },
    { 
      id: 'in_progress', 
      label: 'In Progress', 
      color: 'bg-amber-500', 
      icon: Clock, 
      border: 'border-amber-500/20' 
    },
    { 
      id: 'done', 
      label: 'Done', 
      color: 'bg-emerald-500', 
      icon: CheckCircle2, 
      border: 'border-emerald-500/20' 
    },
  ]

  const moveTask = (taskId: string, targetStatus: 'todo' | 'in_progress' | 'done') => {
    updateTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
    )
  }

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
        {columns.map((column) => {
          const colTasks = tasks.filter((t) => t.status === column.id)
          const Icon = column.icon

          return (
            <div
              key={column.id}
              className="flex flex-col bg-surface/70 border border-border rounded-2xl p-4 shadow-sm min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-sm text-primary">{column.label}</h3>
                  <span className="text-xs font-mono text-muted bg-surface-active px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => {
                    const title = prompt(`Add a new task to ${column.label}:`)
                    if (title && title.trim()) {
                      updateTasks([
                        {
                          id: Date.now().toString(),
                          title: title.trim(),
                          priority: 'medium',
                          status: column.id as any,
                          work_type_id: 'deep-work',
                          estimated_minutes: 30,
                        },
                        ...tasks,
                      ])
                    }
                  }}
                  className="p-1 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition"
                  title="Add task to column"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="border border-dashed border-border/70 rounded-xl p-8 text-center text-xs text-muted">
                    No tasks in {column.label}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} className="relative group/card">
                      <TaskCard
                        task={task}
                        onStartFocus={onStartFocus}
                        onComplete={() => {
                          const nextStatus = task.status === 'done' ? 'todo' : 'done'
                          moveTask(task.id, nextStatus)
                        }}
                        onDelete={() => {
                          updateTasks(tasks.filter((t) => t.id !== task.id))
                        }}
                      />

                      {/* Quick Move Buttons on Hover */}
                      <div className="hidden group-hover/card:flex items-center justify-end gap-1 mt-1 px-1">
                        {column.id !== 'todo' && (
                          <button
                            onClick={() => moveTask(task.id, 'todo')}
                            className="text-[10px] text-muted hover:text-primary px-1.5 py-0.5 rounded bg-surface border border-border"
                          >
                            ← To Do
                          </button>
                        )}
                        {column.id !== 'in_progress' && (
                          <button
                            onClick={() => moveTask(task.id, 'in_progress')}
                            className="text-[10px] text-muted hover:text-primary px-1.5 py-0.5 rounded bg-surface border border-border"
                          >
                            In Progress
                          </button>
                        )}
                        {column.id !== 'done' && (
                          <button
                            onClick={() => moveTask(task.id, 'done')}
                            className="text-[10px] text-muted hover:text-emerald-500 px-1.5 py-0.5 rounded bg-surface border border-border"
                          >
                            Done →
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
