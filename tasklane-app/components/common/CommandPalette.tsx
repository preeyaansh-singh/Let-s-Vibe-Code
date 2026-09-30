// components/common/CommandPalette.tsx
'use client'

import { useEffect, useState } from 'react'
import { 
  Search, 
  Plus, 
  ListTodo, 
  Kanban, 
  Calendar, 
  BarChart3, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Flame, 
  X,
  Sparkles
} from 'lucide-react'

interface CommandPaletteProps {
  onClose: () => void
  onSelectAction?: (actionId: string) => void
}

export default function CommandPalette({ onClose, onSelectAction }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const commands = [
    { id: 'new-task', label: 'Create new task', icon: Plus, shortcut: 'N', category: 'Tasks' },
    { id: 'view-list', label: 'Switch to List view', icon: ListTodo, shortcut: '1', category: 'Navigation' },
    { id: 'view-kanban', label: 'Switch to Kanban Board', icon: Kanban, shortcut: '2', category: 'Navigation' },
    { id: 'view-calendar', label: 'Switch to Calendar view', icon: Calendar, shortcut: '3', category: 'Navigation' },
    { id: 'view-insights', label: 'Open Insights & Analytics', icon: BarChart3, shortcut: '4', category: 'Navigation' },
    { id: 'toggle-theme', label: 'Toggle Dark / Light Theme', icon: Sun, shortcut: 'T', category: 'Preferences' },
  ]

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1))
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault()
        onSelectAction?.(filtered[selectedIndex].id)
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, filtered, selectedIndex, onSelectAction])

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3">
          <Search className="w-5 h-5 text-accent shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command or search actions..."
            className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted hover:text-primary transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No matching commands found.
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon
              const isSelected = selectedIndex === idx
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onSelectAction?.(cmd.id)
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-primary hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-accent'}`} />
                    <span className="font-medium">{cmd.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-muted'}`}>
                      {cmd.category}
                    </span>
                    <kbd className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                      isSelected ? 'bg-white/20 border-white/30 text-white' : 'bg-bg border-border text-secondary'
                    }`}>
                      {cmd.shortcut}
                    </kbd>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-bg/50 flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-border">↑</kbd>
            <kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-border">↓</kbd>
            <span>Select:</span>
            <kbd className="font-mono bg-surface px-1 py-0.5 rounded border border-border">↵</kbd>
          </div>
          <span>Tasklane Fast Action</span>
        </div>
      </div>
    </div>
  )
}
