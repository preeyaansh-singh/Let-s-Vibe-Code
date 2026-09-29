// components/layout/Sidebar.tsx
'use client'

import { useState } from 'react'
import { WORK_TYPES } from '@/lib/constants'

interface SidebarProps {
  onViewChange: (view: 'list' | 'kanban' | 'calendar') => void
  currentView: 'list' | 'kanban' | 'calendar'
}

export default function Sidebar({ onViewChange, currentView }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const views = [
    { id: 'list', label: 'List', icon: '☰' },
    { id: 'kanban', label: 'Kanban', icon: '⊞' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
  ]

  const smartLists = [
    { id: 'today', label: 'Today', icon: '✓' },
    { id: 'upcoming', label: 'Upcoming', icon: '→' },
    { id: 'overdue', label: 'Overdue', icon: '⚠' },
  ]

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-72'
      } bg-surface border-r border-border flex flex-col transition-all duration-200`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <h1 className="font-display text-2xl font-bold text-accent">Tasklane</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-border rounded"
          aria-label="Toggle sidebar"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Views */}
        <div className="mb-6">
          {!collapsed && <p className="text-xs font-semibold uppercase text-secondary mb-2">Views</p>}
          <div className="space-y-1">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id as 'list' | 'kanban' | 'calendar')}
                className={`w-full px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentView === view.id
                    ? 'bg-accent text-white'
                    : 'hover:bg-border text-primary'
                }`}
              >
                <span className="mr-2">{view.icon}</span>
                {!collapsed && view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Lists */}
        <div className="mb-6">
          {!collapsed && <p className="text-xs font-semibold uppercase text-secondary mb-2">Lists</p>}
          <div className="space-y-1">
            {smartLists.map((list) => (
              <button
                key={list.id}
                className="w-full px-3 py-2 rounded-md text-sm hover:bg-border text-primary transition"
              >
                <span className="mr-2">{list.icon}</span>
                {!collapsed && list.label}
              </button>
            ))}
          </div>
        </div>

        {/* Work Types */}
        {!collapsed && (
          <div>
            <p className="text-xs font-semibold uppercase text-secondary mb-2">Types</p>
            <div className="space-y-1">
              {WORK_TYPES.map((type) => (
                <button
                  key={type.id}
                  className="w-full px-3 py-2 rounded-md text-sm hover:bg-border text-primary transition flex items-center"
                >
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: type.color }}
                  />
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-border">
        <button className="w-full px-3 py-2 rounded-md text-sm hover:bg-border text-primary transition">
          {!collapsed ? '⚙ Settings' : '⚙'}
        </button>
      </div>
    </aside>
  )
}
