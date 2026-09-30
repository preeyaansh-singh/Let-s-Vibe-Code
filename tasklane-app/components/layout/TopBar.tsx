// components/layout/TopBar.tsx
'use client'

import { Search, Plus, Sparkles, Bell, SlidersHorizontal } from 'lucide-react'

interface TopBarProps {
  onNewTaskClick?: () => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  currentView?: string
}

export default function TopBar({ 
  onNewTaskClick, 
  searchQuery = '', 
  onSearchChange,
  currentView = 'list'
}: TopBarProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })

  const viewTitles: Record<string, string> = {
    list: 'My Tasks',
    kanban: 'Workflow Board',
    calendar: 'Schedule & Calendar',
    insights: 'Analytics & Rhythm'
  }

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border px-6 flex items-center justify-between gap-4 shrink-0 z-10">
      {/* View Title & Date */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-primary tracking-tight">
            {viewTitles[currentView] || 'Tasks'}
          </h2>
          <p className="text-xs text-secondary font-medium">
            {currentDate}
          </p>
        </div>
      </div>

      {/* Global Search Input */}
      <div className="flex-1 max-w-lg mx-4">
        <div className="relative group">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-accent" />
          <input
            type="text"
            placeholder="Search tasks, tags, or type / to filter..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-9 pr-14 py-2 bg-bg border border-border rounded-xl text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent/80 focus:ring-2 focus:ring-accent/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls & Quick Add */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewTaskClick}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold shadow-glow-sm hover:shadow-glow transition-all active:scale-[0.98]"
          title="Create task (Shortcut: N)"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
          <kbd className="text-[10px] font-mono px-1 py-0.2 bg-white/20 rounded">N</kbd>
        </button>

        <button 
          className="p-2 text-secondary hover:text-primary hover:bg-surface-hover rounded-xl border border-border transition relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
        </button>
      </div>
    </header>
  )
}
