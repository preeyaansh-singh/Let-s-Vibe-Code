// components/layout/RightRail.tsx
'use client'

import { useState, useEffect } from 'react'

export default function RightRail() {
  const [focusTime, setFocusTime] = useState(0)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setFocusTime((t) => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <aside className="w-80 bg-surface border-l border-border flex flex-col overflow-y-auto">
      {/* Focus Timer */}
      <div className="p-6 border-b border-border">
        <h2 className="text-sm font-semibold text-secondary mb-4">Focus Timer</h2>

        <div className="bg-bg rounded-lg p-6 text-center mb-4">
          <div className="text-5xl font-mono font-bold text-accent mb-4">
            {formatTime(focusTime)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
            >
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={() => setFocusTime(0)}
              className="flex-1 px-4 py-2 bg-border text-primary rounded-lg hover:bg-border/80 transition text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="text-xs text-secondary space-y-1">
          <p>Session: 25 min work</p>
          <p>Break: 5 min rest</p>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="p-6 border-b border-border">
        <h2 className="text-sm font-semibold text-secondary mb-4">Today</h2>

        <div className="space-y-3">
          <div className="bg-bg rounded-lg p-3">
            <div className="text-xs text-secondary mb-1">Tasks Completed</div>
            <div className="text-2xl font-bold text-primary">5 of 8</div>
          </div>

          <div className="bg-bg rounded-lg p-3">
            <div className="text-xs text-secondary mb-1">Focus Time</div>
            <div className="text-2xl font-bold text-accent">1h 45m</div>
          </div>

          <div className="bg-bg rounded-lg p-3">
            <div className="text-xs text-secondary mb-1">Streak</div>
            <div className="text-2xl font-bold text-success">7 days 🔥</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6">
        <h2 className="text-sm font-semibold text-secondary mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-bg hover:bg-border rounded-lg text-sm text-primary transition">
            📊 View Insights
          </button>
          <button className="w-full px-4 py-2 bg-bg hover:bg-border rounded-lg text-sm text-primary transition">
            ⚙ Settings
          </button>
          <button className="w-full px-4 py-2 bg-bg hover:bg-border rounded-lg text-sm text-primary transition">
            ✓ Mark Day Complete
          </button>
        </div>
      </div>
    </aside>
  )
}
