// components/layout/TopBar.tsx
'use client'

import { useState } from 'react'

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="h-16 bg-surface border-b border-border px-8 flex items-center justify-between">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search tasks... (or press /)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-8">
        <button
          className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
          aria-label="Create new task"
        >
          + New Task
        </button>
        <button
          className="w-10 h-10 rounded-full bg-bg hover:bg-border transition"
          aria-label="User profile"
        >
          👤
        </button>
      </div>
    </header>
  )
}
