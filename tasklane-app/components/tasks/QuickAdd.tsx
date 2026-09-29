// components/tasks/QuickAdd.tsx
'use client'

import { useState } from 'react'
import { parseNaturalLanguage } from '@/lib/utils/nlp'

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
      id: Date.now().toString(),
      title: parsed.title,
      priority: parsed.priority || 'medium',
      status: 'todo',
      work_type_id: parsed.workType || 'deep-work',
      estimated_minutes: parsed.estimate,
    }

    onAdd(task)
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowHint(true)}
          onBlur={() => setShowHint(false)}
          placeholder="Add a task... Try: Design review tomorrow 3pm #meetings !high ~45m"
          className="w-full px-4 py-3 bg-surface border-2 border-border rounded-lg focus:outline-none focus:border-accent transition"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1 bg-accent text-white rounded hover:opacity-90 transition text-sm font-medium"
        >
          Add
        </button>
      </div>

      {showHint && (
        <div className="mt-2 p-3 bg-bg rounded-lg text-xs text-secondary">
          <p className="font-semibold mb-1">Natural language syntax:</p>
          <ul className="space-y-0.5">
            <li>📅 Date: "tomorrow", "next Monday", "3pm"</li>
            <li>🏷 Type: "#meetings", "#errands"</li>
            <li>⚡ Priority: "!high", "!!", "!!!"</li>
            <li>⏱ Estimate: "~45m", "~1h"</li>
          </ul>
        </div>
      )}
    </form>
  )
}
