// components/views/ListView.tsx
'use client'

import { useState } from 'react'
import TaskCard, { TaskItem } from '@/components/tasks/TaskCard'
import QuickAdd from '@/components/tasks/QuickAdd'
import { CheckCircle2, SlidersHorizontal, ArrowUpDown, Inbox, Sparkles } from 'lucide-react'

interface ListViewProps {
  tasks?: TaskItem[]
  onTasksChange?: (tasks: TaskItem[]) => void
  searchQuery?: string
  activeCategory?: string
  onStartFocus?: (task: TaskItem) => void
}

export default function ListView({ 
  tasks: propTasks, 
  onTasksChange, 
  searchQuery = '', 
  activeCategory = 'all',
  onStartFocus 
}: ListViewProps) {
  // Demo default tasks if none passed
  const [internalTasks, setInternalTasks] = useState<TaskItem[]>([
    {
      id: '1',
      title: 'Architect premium dark theme & design system',
      priority: 'urgent',
      status: 'in_progress',
      work_type_id: 'deep-work',
      due_date: new Date().toISOString(),
      estimated_minutes: 120,
    },
    {
      id: '2',
      title: 'Product sync & weekly team standup',
      priority: 'high',
      status: 'todo',
      work_type_id: 'meetings',
      due_date: new Date().toISOString(),
      estimated_minutes: 30,
    },
    {
      id: '3',
      title: 'Review pull requests & merge focus mode enhancements',
      priority: 'medium',
      status: 'done',
      work_type_id: 'deep-work',
      due_date: new Date().toISOString(),
      estimated_minutes: 45,
    },
    {
      id: '4',
      title: 'Grocery shopping & replenish espresso beans',
      priority: 'low',
      status: 'todo',
      work_type_id: 'errands',
      estimated_minutes: 40,
    },
    {
      id: '5',
      title: 'Read 2 chapters of Designing Data-Intensive Applications',
      priority: 'medium',
      status: 'in_progress',
      work_type_id: 'learning',
      estimated_minutes: 60,
    },
  ])

  const tasks = propTasks || internalTasks
  const updateTasks = (newTasks: TaskItem[]) => {
    if (onTasksChange) {
      onTasksChange(newTasks)
    } else {
      setInternalTasks(newTasks)
    }
  }

  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all')
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'estimate'>('priority')

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    // Status filter
    if (filter !== 'all' && task.status !== filter) return false
    
    // Category / smart filter
    if (activeCategory && activeCategory !== 'all') {
      if (activeCategory === 'today') {
        // match today
      } else if (activeCategory === 'overdue') {
        if (task.status === 'done') return false
      } else if (task.work_type_id !== activeCategory) {
        return false
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(q)
      const matchesType = task.work_type_id.toLowerCase().includes(q)
      const matchesPriority = task.priority.toLowerCase().includes(q)
      if (!matchesTitle && !matchesType && !matchesPriority) return false
    }

    return true
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
    }
    if (sortBy === 'estimate') {
      return (b.estimated_minutes || 0) - (a.estimated_minutes || 0)
    }
    if (sortBy === 'due_date' && a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    }
    return 0
  })

  const completedCount = tasks.filter((t) => t.status === 'done').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quick Add Form */}
      <QuickAdd onAdd={(newTask) => updateTasks([...tasks, newTask])} />

      {/* Control Bar: Status Filter Tabs & Sorter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl">
          {[
            { id: 'all', label: 'All', count: tasks.length },
            { id: 'todo', label: 'To Do', count: tasks.filter(t => t.status === 'todo').length },
            { id: 'in_progress', label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
            { id: 'done', label: 'Done', count: completedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filter === tab.id ? 'bg-white/20 text-white' : 'bg-surface-active text-muted'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
            <span>Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-medium text-primary focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="priority">Priority</option>
            <option value="due_date">Due Date</option>
            <option value="estimate">Duration</option>
          </select>
        </div>
      </div>

      {/* Task List Items */}
      <div className="space-y-2.5">
        {sortedTasks.length === 0 ? (
          <div className="bg-surface border border-border border-dashed rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-primary mb-1">No tasks in this view</h4>
            <p className="text-xs text-secondary max-w-xs mx-auto">
              All tasks in this filter have been completed or none match your query. Add a task above to keep going!
            </p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStartFocus={onStartFocus}
              onComplete={() => {
                updateTasks(
                  tasks.map((t) =>
                    t.id === task.id
                      ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
                      : t
                  )
                )
              }}
              onDelete={() => {
                updateTasks(tasks.filter((t) => t.id !== task.id))
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}
