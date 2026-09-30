// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import RightRail from '@/components/layout/RightRail'
import ListView from '@/components/views/ListView'
import KanbanView from '@/components/views/KanbanView'
import CalendarView from '@/components/views/CalendarView'
import InsightsDashboard from '@/components/insights/Dashboard'
import ProgressRing from '@/components/progress/ProgressRing'
import CommandPalette from '@/components/common/CommandPalette'
import { TaskItem } from '@/components/tasks/TaskCard'
import { X, Keyboard, Sparkles, CheckCircle2 } from 'lucide-react'
import { KEYBOARD_SHORTCUTS } from '@/lib/constants'

export default function Dashboard() {
  const [view, setView] = useState<'list' | 'kanban' | 'calendar' | 'insights'>('list')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [activeFocusTask, setActiveFocusTask] = useState('Architect premium dark theme & design system')

  // Shared interactive task state
  const [tasks, setTasks] = useState<TaskItem[]>([
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
    {
      id: '6',
      title: 'Configure automated database snapshots',
      priority: 'medium',
      status: 'done',
      work_type_id: 'deep-work',
      estimated_minutes: 35,
    },
    {
      id: '7',
      title: 'Draft quarterly product roadmap update',
      priority: 'high',
      status: 'done',
      work_type_id: 'deep-work',
      estimated_minutes: 90,
    },
    {
      id: '8',
      title: 'Sync with security team on OAuth tokens',
      priority: 'medium',
      status: 'done',
      work_type_id: 'meetings',
      estimated_minutes: 25,
    },
  ])

  // Global keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setShowCommandPalette((prev) => !prev)
      } else if (e.key === '?') {
        e.preventDefault()
        setShowShortcutsModal(true)
      } else if (e.key === '1') {
        setView('list')
      } else if (e.key === '2') {
        setView('kanban')
      } else if (e.key === '3') {
        setView('calendar')
      } else if (e.key === '4') {
        setView('insights')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const completedCount = tasks.filter((t) => t.status === 'done').length

  const handleAddTask = (newTask: any) => {
    setTasks([...tasks, newTask])
  }

  const handleCommandAction = (actionId: string) => {
    if (actionId === 'new-task') {
      setView('list')
    } else if (actionId === 'view-list') {
      setView('list')
    } else if (actionId === 'view-kanban') {
      setView('kanban')
    } else if (actionId === 'view-calendar') {
      setView('calendar')
    } else if (actionId === 'view-insights') {
      setView('insights')
    }
  }

  return (
    <div className="flex h-screen w-screen bg-bg text-primary overflow-hidden">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentView={view}
        onViewChange={setView}
        activeFilter={activeCategory}
        onFilterChange={setActiveCategory}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopBar
          currentView={view}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewTaskClick={() => setView('list')}
        />

        {/* Central Workspace & Right Companion */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Scrollable Center Column */}
          <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-8 space-y-6">
            {/* Hero Progress Bento - Featured on List View */}
            {view === 'list' && (
              <ProgressRing
                completedTasks={completedCount}
                totalTasks={tasks.length}
                focusMinutes={105}
                goalMinutes={120}
                streakDays={7}
              />
            )}

            {/* Dynamic Views */}
            <div className="pb-12">
              {view === 'list' && (
                <ListView
                  tasks={tasks}
                  onTasksChange={setTasks}
                  searchQuery={searchQuery}
                  activeCategory={activeCategory}
                  onStartFocus={(t) => setActiveFocusTask(t.title)}
                />
              )}
              {view === 'kanban' && (
                <KanbanView
                  tasks={tasks}
                  onTasksChange={setTasks}
                  onStartFocus={(t) => setActiveFocusTask(t.title)}
                />
              )}
              {view === 'calendar' && <CalendarView />}
              {view === 'insights' && <InsightsDashboard />}
            </div>
          </main>

          {/* Right Companion Rail (Timer & Momentum) */}
          <RightRail
            activeFocusTask={activeFocusTask}
            onOpenShortcuts={() => setShowShortcutsModal(true)}
            onOpenInsights={() => setView('insights')}
          />
        </div>
      </div>

      {/* Spotlight Command Palette (Cmd + K) */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onSelectAction={handleCommandAction}
        />
      )}

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6 ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-base text-primary">Keyboard Shortcuts</h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-muted hover:text-primary transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              {KEYBOARD_SHORTCUTS.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-bg transition"
                >
                  <span className="text-secondary">{item.action}</span>
                  <kbd className="font-mono text-[11px] bg-bg border border-border px-2 py-0.5 rounded text-primary font-semibold shadow-xs">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
