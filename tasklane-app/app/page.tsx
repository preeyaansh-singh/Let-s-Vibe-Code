// app/page.tsx
'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import RightRail from '@/components/layout/RightRail'
import ListView from '@/components/views/ListView'
import KanbanView from '@/components/views/KanbanView'
import CalendarView from '@/components/views/CalendarView'
import ProgressRing from '@/components/progress/ProgressRing'
import CommandPalette from '@/components/common/CommandPalette'

export default function Dashboard() {
  const [view, setView] = useState<'list' | 'kanban' | 'calendar'>('list')
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  // Handle global keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setShowCommandPalette(true)
    }
  }

  return (
    <div className="flex h-screen bg-bg" onKeyDown={handleKeyDown}>
      {/* Left Sidebar */}
      <Sidebar onViewChange={setView} currentView={view} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Content Area with Hero Progress */}
        <div className="flex-1 flex overflow-hidden">
          {/* Central Hero & Task Area */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Hero Progress Ring */}
            <div className="p-8 border-b border-border bg-surface">
              <ProgressRing />
            </div>

            {/* Task Views */}
            <div className="flex-1 overflow-y-auto p-8">
              {view === 'list' && <ListView />}
              {view === 'kanban' && <KanbanView />}
              {view === 'calendar' && <CalendarView />}
            </div>
          </div>

          {/* Right Rail */}
          <RightRail />
        </div>
      </div>

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
    </div>
  )
}
