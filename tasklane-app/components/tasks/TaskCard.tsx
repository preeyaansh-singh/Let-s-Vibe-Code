// components/tasks/TaskCard.tsx
'use client'

import { useState } from 'react'
import { WORK_TYPES } from '@/lib/constants'
import { 
  Check, 
  Clock, 
  Calendar as CalendarIcon, 
  Trash2, 
  Play, 
  MoreHorizontal,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export interface TaskItem {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done'
  due_date?: string
  work_type_id: string
  estimated_minutes?: number
}

interface TaskCardProps {
  task: TaskItem
  onComplete?: () => void
  onDelete?: () => void
  onStartFocus?: (task: TaskItem) => void
}

export default function TaskCard({ task, onComplete, onDelete, onStartFocus }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isDone = task.status === 'done'
  const workType = WORK_TYPES.find((t) => t.id === task.work_type_id)

  const priorityStyles = {
    urgent: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    high: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  }

  const priorityDots = {
    urgent: 'bg-rose-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-500',
    low: 'bg-emerald-500',
  }

  // Format date display
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    if (isToday) return 'Today'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-surface border rounded-2xl p-4 transition-all duration-200 select-none ${
        isDone
          ? 'opacity-60 bg-surface/50 border-border/50'
          : 'border-border hover:border-accent/50 hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Custom Interactive Checkbox */}
        <button
          onClick={onComplete}
          aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5 ${
            isDone
              ? 'bg-accent border-accent text-white shadow-md'
              : 'border-border hover:border-accent/70 hover:bg-accent/5'
          }`}
        >
          {isDone && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Content Title & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2.5 flex-wrap">
            <h3
              className={`text-base font-medium transition-all flex-1 ${
                isDone
                  ? 'line-through text-muted'
                  : 'text-primary'
              }`}
            >
              {task.title}
            </h3>

            {/* Priority Pill */}
            {task.priority && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${
                  priorityStyles[task.priority] || priorityStyles.medium
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${priorityDots[task.priority] || 'bg-blue-500'}`} />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}
          </div>

          {/* Meta Info Row */}
          <div className="flex items-center gap-4 text-sm text-secondary flex-wrap">
            {/* Work Category Badge */}
            {workType && (
              <div className="inline-flex items-center gap-2 text-xs font-medium">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: workType.color }}
                />
                <span className="text-secondary">{workType.name}</span>
              </div>
            )}

            {/* Time Estimate */}
            {task.estimated_minutes && (
              <div className="inline-flex items-center gap-1.5 text-xs text-muted">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">{task.estimated_minutes}m</span>
              </div>
            )}

            {/* Due Date */}
            {task.due_date && (
              <div className="inline-flex items-center gap-1.5 text-xs text-muted">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="font-medium">{formatDueDate(task.due_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls on Hover */}
        <div className="flex items-center gap-2 shrink-0">
          {!isDone && (
            <button
              onClick={() => onStartFocus?.(task)}
              className={`p-2 rounded-lg text-secondary hover:text-accent hover:bg-accent/10 transition-all ${
                isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-50'
              }`}
              title="Focus on this task"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={onDelete}
            className={`p-2 rounded-lg text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-all ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
