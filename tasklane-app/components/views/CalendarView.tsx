// components/views/CalendarView.tsx
'use client'

import { useState } from 'react'
import { getDaysInMonth, startOfMonth, getDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react'

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8)) // September 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate())

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getDay(startOfMonth(currentDate))
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const tasksByDay: Record<number, Array<{ title: string; type: string; time: string; completed?: boolean }>> = {
    1: [{ title: 'Q3 Product Strategy Review', type: 'deep-work', time: '10:00 AM', completed: true }],
    5: [{ title: 'Sync with frontend lead', type: 'meetings', time: '02:30 PM', completed: true }],
    8: [{ title: 'System architecture review', type: 'deep-work', time: '11:00 AM' }],
    12: [{ title: 'Pick up office supplies', type: 'errands', time: '04:00 PM' }],
    15: [{ title: 'Deploy v1.2 Release build', type: 'deep-work', time: '01:00 PM' }],
    20: [{ title: 'Team retrospective & demos', type: 'meetings', time: '03:00 PM' }],
    22: [{ title: 'Deep learning paper seminar', type: 'learning', time: '05:00 PM' }],
    30: [
      { title: 'Tasklane UI Refactor & Theme polish', type: 'deep-work', time: '11:30 AM', completed: true },
      { title: 'Weekly sync & sprint review', type: 'meetings', time: '03:00 PM' },
    ],
  }

  const typeColors: Record<string, string> = {
    'deep-work': 'bg-cyan-500',
    'meetings': 'bg-amber-500',
    'errands': 'bg-rose-500',
    'learning': 'bg-purple-500',
  }

  const isToday = (day: number | null) => {
    if (!day) return false
    const now = new Date()
    return (
      day === now.getDate() &&
      currentDate.getMonth() === now.getMonth() &&
      currentDate.getFullYear() === now.getFullYear()
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary font-display">{monthName}</h2>
              <p className="text-xs text-secondary">Plan deadlines and time-blocked sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-bg border border-border rounded-xl">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                )
              }
              className="p-1.5 hover:bg-surface text-secondary hover:text-primary rounded-lg transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-xs font-semibold text-primary hover:bg-surface rounded-lg transition"
            >
              Today
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                )
              }
              className="p-1.5 hover:bg-surface text-secondary hover:text-primary rounded-lg transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold tracking-wider uppercase text-muted py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-[1.1] rounded-xl bg-transparent" />
            }

            const dayTasks = tasksByDay[day] || []
            const isCurrent = isToday(day)
            const isSelected = selectedDay === day

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`aspect-[1.1] p-2 rounded-xl border flex flex-col justify-between text-left transition-all relative group ${
                  isSelected
                    ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent'
                    : isCurrent
                    ? 'border-accent/40 bg-surface hover:border-accent'
                    : 'border-border/60 bg-bg hover:bg-surface hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                      isCurrent
                        ? 'bg-accent text-white font-bold'
                        : isSelected
                        ? 'text-accent font-bold'
                        : 'text-primary'
                    }`}
                  >
                    {day}
                  </span>

                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-mono text-muted">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Task dots */}
                <div className="flex items-center gap-1 mt-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((t, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        typeColors[t.type] || 'bg-accent'
                      }`}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[8px] text-muted font-mono">+</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Agenda View */}
      {selectedDay && (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            Agenda for {monthName.split(' ')[0]} {selectedDay}
          </h3>

          <div className="space-y-2">
            {(tasksByDay[selectedDay] || []).length === 0 ? (
              <p className="text-xs text-muted py-2">No tasks scheduled for this day.</p>
            ) : (
              (tasksByDay[selectedDay] || []).map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border/60"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        typeColors[t.type] || 'bg-accent'
                      }`}
                    />
                    <span className={`text-sm font-medium ${t.completed ? 'line-through text-muted' : 'text-primary'}`}>
                      {t.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{t.time}</span>
                    {t.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
