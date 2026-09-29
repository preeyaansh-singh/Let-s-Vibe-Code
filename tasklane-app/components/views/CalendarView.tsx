// components/views/CalendarView.tsx
'use client'

import { useState } from 'react'
import { getDaysInMonth, getFirstDayOfMonth } from 'date-fns'

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8)) // September 2026

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const tasksByDay: Record<number, number> = {
    1: 3,
    5: 2,
    8: 5,
    12: 1,
    15: 4,
    20: 3,
    22: 2,
    29: 1,
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface border border-border rounded-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-primary">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                )
              }
              className="px-4 py-2 bg-bg hover:bg-border rounded-lg transition"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 bg-bg hover:bg-border rounded-lg transition"
            >
              Today
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                )
              }
              className="px-4 py-2 bg-bg hover:bg-border rounded-lg transition"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-secondary p-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, idx) => (
            <div
              key={idx}
              className={`aspect-square p-2 rounded-lg border border-border flex flex-col items-center justify-center text-sm ${
                day === null
                  ? 'bg-transparent'
                  : day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth()
                  ? 'bg-accent text-white font-bold'
                  : 'bg-bg hover:bg-border cursor-pointer transition'
              }`}
            >
              {day && (
                <>
                  <div className="font-semibold">{day}</div>
                  {tasksByDay[day] && (
                    <div className="text-xs mt-1 text-accent font-bold">
                      {tasksByDay[day]} tasks
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-bg rounded-lg text-sm text-secondary">
          <p className="font-semibold mb-2">Drag tasks here to reschedule</p>
          <p>Click a day to see or add tasks</p>
        </div>
      </div>
    </div>
  )
}
