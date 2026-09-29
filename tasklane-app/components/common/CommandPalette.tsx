// components/common/CommandPalette.tsx
'use client'

import { useEffect, useState } from 'react'

interface CommandPaletteProps {
  onClose: () => void
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const commands = [
    { label: 'New Task', shortcut: 'N', action: () => {} },
    { label: 'Search Tasks', shortcut: '/', action: () => {} },
    { label: 'View Today', shortcut: 'T', action: () => {} },
    { label: 'Focus Mode', shortcut: 'F', action: () => {} },
    { label: 'Settings', shortcut: 'S', action: () => {} },
    { label: 'Keyboard Shortcuts', shortcut: '?', action: () => {} },
  ]

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-lg shadow-lg w-96 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command..."
          className="w-full px-4 py-3 bg-surface border-b border-border focus:outline-none text-primary"
        />

        <div className="max-h-96 overflow-y-auto">
          {filtered.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => {
                cmd.action()
                onClose()
              }}
              className="w-full px-4 py-3 text-left hover:bg-bg transition flex items-center justify-between"
            >
              <span className="text-primary">{cmd.label}</span>
              <span className="text-xs text-secondary bg-border px-2 py-1 rounded">
                {cmd.shortcut}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
