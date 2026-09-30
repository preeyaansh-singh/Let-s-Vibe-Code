// components/layout/RightRail.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BarChart3, 
  Keyboard, 
  Sliders, 
  Coffee,
  Target
} from 'lucide-react'

interface RightRailProps {
  onOpenShortcuts?: () => void
  onOpenInsights?: () => void
  activeFocusTask?: string
}

export default function RightRail({
  onOpenShortcuts,
  onOpenInsights,
  activeFocusTask = 'Architect premium dark theme & design system'
}: RightRailProps) {
  const [mode, setMode] = useState<'work' | 'break'>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(3)

  const totalTime = mode === 'work' ? 25 * 60 : 5 * 60
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false)
          if (mode === 'work') {
            setSessionsCompleted((s) => s + 1)
            setMode('break')
            return 5 * 60
          } else {
            setMode('work')
            return 25 * 60
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, mode])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleReset = () => {
    setIsActive(false)
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60)
  }

  return (
    <aside className="w-80 bg-surface border-l border-border flex flex-col shrink-0 overflow-y-auto h-screen select-none">
      {/* Focus Timer Section */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-accent/10 text-accent">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
              Focus Companion
            </h2>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-0.5 bg-bg border border-border rounded-lg text-[11px] font-semibold">
            <button
              onClick={() => {
                setMode('work')
                setIsActive(false)
                setTimeLeft(25 * 60)
              }}
              className={`px-2 py-0.5 rounded-md transition ${
                mode === 'work'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => {
                setMode('break')
                setIsActive(false)
                setTimeLeft(5 * 60)
              }}
              className={`px-2 py-0.5 rounded-md transition ${
                mode === 'break'
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Break
            </button>
          </div>
        </div>

        {/* Timer Display Card */}
        <div className="relative bg-bg border border-border/80 rounded-2xl p-5 text-center overflow-hidden">
          {/* Subtle Ambient Glow */}
          {isActive && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
          )}

          {activeFocusTask && (
            <div className="mb-3 px-2 py-1 rounded-lg bg-surface border border-border/60 text-[11px] text-secondary truncate flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              <span className="truncate">{activeFocusTask}</span>
            </div>
          )}

          <div className="text-4xl font-mono font-bold tracking-tight text-primary mb-3">
            {formatTime(timeLeft)}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface border border-border/60 rounded-full h-1.5 mb-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                mode === 'work' ? 'bg-accent shadow-glow-sm' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all shadow-sm ${
                isActive
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-accent hover:bg-accent-hover shadow-glow-sm'
              }`}
            >
              {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isActive ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-secondary hover:text-primary transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-secondary">
          <span>{sessionsCompleted} completed today</span>
          <span className="text-muted">Target: 4 sessions</span>
        </div>
      </div>

      {/* Daily Momentum Section */}
      <div className="p-5 border-b border-border space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
          Daily Momentum
        </h2>

        <div className="space-y-2.5">
          <div className="p-3 bg-bg/60 border border-border/70 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-secondary">Completed</p>
                <p className="text-sm font-bold text-primary">5 of 8</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-500">63%</span>
          </div>

          <div className="p-3 bg-bg/60 border border-border/70 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-secondary">Focused</p>
                <p className="text-sm font-bold text-primary">1h 45m</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-accent">87%</span>
          </div>

          <div className="p-3 bg-bg/60 border border-border/70 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-secondary">Streak</p>
                <p className="text-sm font-bold text-emerald-500">7 Days</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-500">🔥 Top 5%</span>
          </div>
        </div>
      </div>

      {/* Quick Utilities Section */}
      <div className="p-5 flex-1 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
          Workspace Actions
        </h2>

        <button
          onClick={onOpenInsights}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-bg hover:bg-surface-hover border border-border text-xs text-secondary hover:text-primary transition group"
        >
          <span className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-accent group-hover:scale-110 transition-transform" />
            Detailed Insights
          </span>
          <span className="text-[10px] text-muted">View →</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-bg hover:bg-surface-hover border border-border text-xs text-secondary hover:text-primary transition group"
        >
          <span className="flex items-center gap-2">
            <Keyboard className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
            Keyboard Shortcuts
          </span>
          <kbd className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border text-muted">
            ?
          </kbd>
        </button>
      </div>
    </aside>
  )
}
