// components/tasks/QuickAdd.tsx
'use client'

import { useState } from 'react'
import { parseNaturalLanguage } from '@/lib/utils/nlp'
import { Plus, CornerDownLeft, Sparkles, Hash, Zap, Clock, Calendar } from 'lucide-react'

interface QuickAddProps {
  onAdd: (task: any) => void
}

export default function QuickAdd({ onAdd }: QuickAddProps) {
  const [input, setInput] = useState('')
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const parsed = parseNaturalLanguage(input)
    const task = {
      id: `task-${Date.now()}`,
      title: parsed.title || input.trim(),
      priority: parsed.priority || 'medium',
      status: 'todo',
      work_type_id: parsed.workType || 'deep-work',
      estimated_minutes: parsed.estimate || 30,
      due_date: parsed.dateTime?.date || new Date().toISOString().split('T')[0],
    }

    onAdd(task)
    setInput('')
    setShowHint(false)
  }

  const appendToken = (token: string) => {
    setInput((prev) => `${prev.trim()} ${token} `)
  }

  return (
    <div className="relative mb-8">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="flex items-center bg-surface border border-border rounded-2xl shadow-md group-focus-within:border-accent group-focus-within:ring-2 group-focus-within:ring-accent/30 transition-all p-2">
          <div className="p-3 text-muted group-focus-within:text-accent transition-colors">
            <Plus className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setShowHint(true)}
            onBlur={() => setTimeout(() => setShowHint(false), 200)}
            onKeyDown={(e) => e.key === 'Escape' && setShowHint(false)}
            placeholder="Add a new task... e.g. Finish Q4 slides tomorrow 3pm #meetings !high ~45m"
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none"
            autoComplete="off"
          />

          <div className="flex items-center gap-2 pr-2">
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold disabled:opacity-40 disabled:hover:bg-accent transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <span>Add</span>
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Interactive Helper Chips */}
      {showHint && (
        <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-surface border border-border rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 z-30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-secondary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Smart Parsing Shortcuts:
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); appendToken('tomorrow 3pm'); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg hover:bg-surface-hover border border-border text-xs text-secondary hover:text-primary transition"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>tomorrow 3pm</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); appendToken('!high'); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg hover:bg-surface-hover border border-border text-xs text-secondary hover:text-primary transition"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>!high</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); appendToken('~45m'); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg hover:bg-surface-hover border border-border text-xs text-secondary hover:text-primary transition"
            >
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              <span>~45m</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); appendToken('#deep-work'); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg hover:bg-surface-hover border border-border text-xs text-secondary hover:text-primary transition"
            >
              <Hash className="w-3.5 h-3.5 text-cyan-500" />
              <span>#deep-work</span>
            </button>

            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); appendToken('#meetings'); }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg hover:bg-surface-hover border border-border text-xs text-secondary hover:text-primary transition"
            >
              <Hash className="w-3.5 h-3.5 text-amber-500" />
              <span>#meetings</span>
            </button>
          </div>

          <p className="text-xs text-muted mt-3 pt-3 border-t border-border">
            💡 Try: <code className="bg-bg px-1.5 py-0.5 rounded text-xs font-mono">finish report tomorrow 2pm !high ~90m #deep-work</code>
          </p>
        </div>
      )}
    </div>
  )
}
