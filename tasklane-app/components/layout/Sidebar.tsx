// components/layout/Sidebar.tsx
'use client'

import { useState } from 'react'
import { WORK_TYPES } from '@/lib/constants'
import { 
  ListTodo, 
  Kanban, 
  Calendar as CalendarIcon, 
  BarChart3, 
  CheckCircle2, 
  CalendarClock, 
  AlertTriangle, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Command,
  Sun,
  Moon,
  FolderDot
} from 'lucide-react'

interface SidebarProps {
  onViewChange: (view: 'list' | 'kanban' | 'calendar' | 'insights') => void
  currentView: 'list' | 'kanban' | 'calendar' | 'insights'
  activeFilter?: string
  onFilterChange?: (filter: string) => void
  onOpenCommandPalette?: () => void
}

export default function Sidebar({ 
  onViewChange, 
  currentView, 
  activeFilter = 'all', 
  onFilterChange,
  onOpenCommandPalette 
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (typeof document !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark')
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.setAttribute('data-theme', 'light')
      }
    }
  }

  const views = [
    { id: 'list', label: 'List View', icon: ListTodo, shortcut: '1' },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban, shortcut: '2' },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon, shortcut: '3' },
    { id: 'insights', label: 'Insights & Analytics', icon: BarChart3, shortcut: '4' },
  ]

  const smartLists = [
    { id: 'all', label: 'All Tasks', icon: FolderDot, count: 8 },
    { id: 'today', label: 'Today', icon: CheckCircle2, count: 5, color: 'text-emerald-500' },
    { id: 'upcoming', label: 'Upcoming', icon: CalendarClock, count: 3, color: 'text-blue-500' },
    { id: 'overdue', label: 'Overdue', icon: AlertTriangle, count: 1, color: 'text-rose-500' },
  ]

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-surface border-r border-border flex flex-col transition-all duration-300 select-none z-20 shrink-0 h-screen`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-white shadow-glow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-primary flex items-center gap-1.5">
                Tasklane
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                  Pro
                </span>
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-white shadow-glow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition"
          aria-label="Toggle sidebar"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Search Shortcut */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <button
            onClick={onOpenCommandPalette}
            className="w-full px-3 py-2 rounded-lg bg-bg border border-border/80 text-secondary hover:text-primary hover:border-accent/40 transition flex items-center justify-between text-xs group"
          >
            <span className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
              Quick Command
            </span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-secondary">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Views */}
        <div>
          {!collapsed && (
            <p className="px-2 text-[11px] font-semibold tracking-wider uppercase text-muted mb-1.5">
              Views
            </p>
          )}
          <div className="space-y-1">
            {views.map((v) => {
              const Icon = v.icon
              const isActive = currentView === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => onViewChange(v.id as any)}
                  title={collapsed ? v.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-accent text-white shadow-sm font-semibold'
                      : 'text-secondary hover:text-primary hover:bg-surface-hover'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white' : 'group-hover:scale-110'}`} />
                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{v.label}</span>
                  )}
                  {!collapsed && (
                    <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-white/20 text-white' : 'text-muted'}`}>
                      {v.shortcut}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Smart Lists */}
        <div>
          {!collapsed && (
            <p className="px-2 text-[11px] font-semibold tracking-wider uppercase text-muted mb-1.5">
              Smart Filters
            </p>
          )}
          <div className="space-y-1">
            {smartLists.map((item) => {
              const Icon = item.icon
              const isActive = activeFilter === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onFilterChange?.(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                    isActive
                      ? 'bg-surface-active text-primary font-medium border border-border'
                      : 'text-secondary hover:text-primary hover:bg-surface-hover'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${item.color || 'text-secondary'} group-hover:scale-110 transition-transform`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      <span className="text-xs text-muted font-mono">{item.count}</span>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Work Types */}
        {!collapsed && (
          <div>
            <div className="px-2 flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-muted">
                Work Categories
              </p>
            </div>
            <div className="space-y-1">
              {WORK_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onFilterChange?.(type.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-hover transition-colors group"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="flex-1 text-left truncate">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary hover:text-primary hover:bg-surface-hover transition"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
          )}
          {!collapsed && (
            <span className="text-xs font-medium">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        <div className="pt-2 border-t border-border/50 flex items-center gap-3 px-2 py-1">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              HS
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary truncate">Hukum Singh</p>
              <p className="text-[11px] text-muted truncate">Focus Session: Ready</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
