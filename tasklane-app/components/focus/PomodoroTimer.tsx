// components/focus/PomodoroTimer.tsx
'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'

interface PomodoroTimerProps {
  taskId?: string
  onComplete?: () => void
}

export default function PomodoroTimer({ taskId, onComplete }: PomodoroTimerProps) {
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  const focusMutation = useMutation({
    mutationFn: async (durationMinutes: number) => {
      const response = await fetch('/api/focus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          duration_minutes: durationMinutes,
          was_completed: true,
        }),
      })
      return response.json()
    },
    onSuccess: () => {
      onComplete?.()
    },
  })

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
          setIsRunning(false)

          if (mode === 'work') {
            // Log work session
            focusMutation.mutate(25)
            setSessionsCompleted((prev) => prev + 1)

            // Switch to break
            setMode('break')
            setTimeLeft(5 * 60)
          } else {
            // Break finished
            setMode('work')
            setTimeLeft(25 * 60)
          }

          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, mode, focusMutation])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const progressPercent = mode === 'work'
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100

  return (
    <div className="bg-surface border border-border rounded-lg p-8 text-center">
      <h2 className="text-lg font-semibold text-primary mb-2">
        {mode === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
      </h2>

      {/* Timer Display */}
      <div className="my-8">
        <div className="text-6xl font-mono font-bold text-accent mb-4">
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-border rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-100 ${
              mode === 'work' ? 'bg-accent' : 'bg-success'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center mb-6">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="px-6 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition font-medium"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => {
            setIsRunning(false)
            setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60)
          }}
          className="px-6 py-2 bg-border text-primary rounded-lg hover:bg-border/80 transition font-medium"
        >
          Reset
        </button>
      </div>

      {/* Sessions Counter */}
      <div className="text-xs text-secondary">
        <p>Sessions completed: {sessionsCompleted}</p>
        {sessionsCompleted >= 4 && (
          <p className="text-success font-semibold">Time for a long break! 🎉</p>
        )}
      </div>
    </div>
  )
}
