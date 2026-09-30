// components/progress/ProgressRing.tsx
'use client'

import { useState } from 'react'
import { Flame, Clock, Sparkles, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react'

interface ProgressRingProps {
  completedTasks?: number
  totalTasks?: number
  focusMinutes?: number
  goalMinutes?: number
  streakDays?: number
}

export default function ProgressRing({
  completedTasks = 5,
  totalTasks = 8,
  focusMinutes = 105,
  goalMinutes = 120,
  streakDays = 7,
}: ProgressRingProps) {
  const [collapsed, setCollapsed] = useState(false)
  
  const percentage = Math.round((completedTasks / totalTasks) * 100)
  const goalPercentage = Math.min(100, Math.round((focusMinutes / goalMinutes) * 100))

  // SVG circular calculation
  const size = 110
  const strokeWidth = 9
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm transition-all hover:border-border/80">
      {/* Header bar with toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary tracking-tight">Today&apos;s Rhythm</h2>
            <p className="text-xs text-secondary">Keep the momentum going</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {percentage}% Complete
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-secondary hover:text-primary hover:bg-surface-hover rounded-lg transition"
            aria-label="Toggle Progress Summary"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
          {/* Circular Visual Stat (Col 1-4) */}
          <div className="md:col-span-4 flex items-center justify-center sm:justify-start gap-4 p-3 bg-bg/50 border border-border/50 rounded-xl">
            <div className="relative shrink-0 flex items-center justify-center">
              <svg width={size} height={size} className="-rotate-90">
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  className="stroke-border/70"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  className="stroke-accent transition-all duration-1000 ease-out"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-xl font-bold text-primary tracking-tight">
                  {percentage}%
                </span>
                <span className="text-[10px] font-medium text-secondary">
                  Done
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-primary">
                {completedTasks} of {totalTasks} Tasks
              </p>
              <p className="text-xs text-secondary mt-0.5">
                {totalTasks - completedTasks} remaining today
              </p>
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-accent">
                <span>Great pacing</span>
              </div>
            </div>
          </div>

          {/* Categories Progress (Col 5-8) */}
          <div className="md:col-span-5 space-y-2.5 p-3 bg-bg/50 border border-border/50 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-primary">Work Distribution</span>
              <span className="text-secondary font-mono text-[11px]">Daily Goals</span>
            </div>

            {/* Deep Work */}
            <div>
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-secondary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-deep-work" />
                  Deep Work
                </span>
                <span className="text-primary font-mono">2 of 3</span>
              </div>
              <div className="w-full bg-surface-active rounded-full h-1.5 overflow-hidden">
                <div className="bg-deep-work h-full rounded-full transition-all duration-500" style={{ width: '67%' }} />
              </div>
            </div>

            {/* Meetings */}
            <div>
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-secondary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-meetings" />
                  Meetings
                </span>
                <span className="text-primary font-mono">1 of 2</span>
              </div>
              <div className="w-full bg-surface-active rounded-full h-1.5 overflow-hidden">
                <div className="bg-meetings h-full rounded-full transition-all duration-500" style={{ width: '50%' }} />
              </div>
            </div>

            {/* Errands */}
            <div>
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-secondary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-errands" />
                  Errands
                </span>
                <span className="text-primary font-mono">1 of 1</span>
              </div>
              <div className="w-full bg-surface-active rounded-full h-1.5 overflow-hidden">
                <div className="bg-errands h-full rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* Target & Streak Cards (Col 9-12) */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-1 gap-2.5">
            <div className="p-3 bg-bg/50 border border-border/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-secondary">Focus Time</p>
                <p className="text-sm font-bold text-primary mt-0.5">{focusMinutes} / {goalMinutes}m</p>
              </div>
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 bg-bg/50 border border-border/50 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-secondary">Streak</p>
                <p className="text-sm font-bold text-emerald-500 mt-0.5">{streakDays} Days</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Flame className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
