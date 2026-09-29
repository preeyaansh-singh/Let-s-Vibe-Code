// components/tasks/TaskCard.tsx
'use client'

import { useState } from 'react'
import { WORK_TYPES } from '@/lib/constants'

interface TaskCardProps {
  task: {
    id: string
    title: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: 'todo' | 'in_progress' | 'done'
    due_date?: string
    work_type_id: string
    estimated_minutes?: number
  }
  onComplete?: () => void
  onDelete?: () => void
}

const priorityColors = {
  low: '#22c55e',
  medium: '#3b82f6',
  high: '#f59e0b',
  urgent: '#ef4444',
}

export default function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const workType = WORK_TYPES.find((t) => t.id === task.work_type_id)

  return (
    <div
      className="bg-surface border border-border rounded-lg p-4 hover:shadow-md transition"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        {/* Status Checkbox */}
        <button
          onClick={onComplete}
          className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${
            task.status === 'done'
              ? 'bg-success border-success'
              : 'border-border hover:border-accent'
          }`}
          aria-label="Mark task complete"
        >
          {task.status === 'done' && <span className="text-white text-sm">✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3
              className={`font-medium text-primary ${
                task.status === 'done' ? 'line-through text-secondary' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.priority !== 'medium' && (
              <span
                className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                style={{ backgroundColor: priorityColors[task.priority] }}
              >
                {task.priority}
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-secondary">
            {workType && (
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: workType.color }}
                />
                {workType.name}
              </div>
            )}
            {task.estimated_minutes && (
              <span>~{task.estimated_minutes}m</span>
            )}
            {task.due_date && (
              <span>
                {new Date(task.due_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        {isHovered && (
          <div className="flex gap-2">
            <button
              className="p-1 hover:bg-bg rounded transition"
              aria-label="Edit task"
            >
              ✎
            </button>
            <button
              onClick={onDelete}
              className="p-1 hover:bg-error/10 rounded transition text-error"
              aria-label="Delete task"
            >
              🗑
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
