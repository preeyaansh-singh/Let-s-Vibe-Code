// components/insights/Dashboard.tsx
'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface InsightsData {
  completionByDay: Array<{ date: string; count: number }>
  focusByType: Array<{ type: string; minutes: number }>
  onTimeRate: number
  overdueCount: number
  progressEntries: Array<{ date: string; completed_tasks: number }>
  currentStreak: number
}

export default function InsightsDashboard() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  async function fetchInsights() {
    try {
      const response = await fetch('/api/insights?days=30')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading insights...</div>
  }

  if (!data) {
    return <div className="text-center py-12">Failed to load insights</div>
  }

  const workTypeColors = {
    'deep-work': '#06b6d4',
    'meetings': '#f59e0b',
    'errands': '#ef4444',
    'learning': '#8b5cf6',
    'personal': '#ec4899',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-primary font-display">Insights</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-6">
          <p className="text-xs text-secondary mb-2">On-Time Rate</p>
          <p className="text-3xl font-bold text-accent">{Math.round(data.onTimeRate)}%</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6">
          <p className="text-xs text-secondary mb-2">Overdue Tasks</p>
          <p className="text-3xl font-bold text-error">{data.overdueCount}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6">
          <p className="text-xs text-secondary mb-2">Current Streak</p>
          <p className="text-3xl font-bold text-success">{data.currentStreak} days 🔥</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6">
          <p className="text-xs text-secondary mb-2">This Month</p>
          <p className="text-3xl font-bold text-primary">
            {data.progressEntries.reduce((sum, e) => sum + e.completed_tasks, 0)} tasks
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-8">
        {/* Tasks Completed Per Day */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Tasks Completed</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.completionByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e3" />
              <XAxis dataKey="date" stroke="#78716c" />
              <YAxis stroke="#78716c" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e7e5e3',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Focus Time by Type */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Focus Time by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.focusByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e3" />
              <XAxis dataKey="type" stroke="#78716c" />
              <YAxis stroke="#78716c" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e7e5e3',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="minutes" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                {data.focusByType.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={workTypeColors[entry.type as keyof typeof workTypeColors] || '#7c3aed'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 12-Week Heatmap */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">12-Week Activity</h2>
        <div className="grid grid-cols-12 gap-1">
          {data.progressEntries.map((entry, idx) => (
            <div
              key={idx}
              className="w-full aspect-square rounded-sm"
              style={{
                backgroundColor:
                  entry.completed_tasks === 0
                    ? '#e7e5e3'
                    : entry.completed_tasks < 3
                    ? '#bfdbfe'
                    : entry.completed_tasks < 5
                    ? '#7c3aed'
                    : '#5b21b6',
              }}
              title={`${entry.date}: ${entry.completed_tasks} tasks`}
            />
          ))}
        </div>
        <div className="mt-4 flex gap-2 text-xs">
          <span className="text-secondary">Less</span>
          <div className="w-4 h-4 rounded-sm bg-gray-200" />
          <div className="w-4 h-4 rounded-sm bg-blue-200" />
          <div className="w-4 h-4 rounded-sm bg-purple-500" />
          <div className="w-4 h-4 rounded-sm bg-purple-900" />
          <span className="text-secondary">More</span>
        </div>
      </div>
    </div>
  )
}
