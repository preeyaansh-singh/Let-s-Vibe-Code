// app/api/insights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { getCurrentUser } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Tasks completed per day
    const completionByDay = await prisma.task.groupBy({
      by: ['completed_at'],
      where: {
        user_id: user.id,
        status: 'done',
        completed_at: { gte: since },
      },
      _count: true,
    })

    // Focus time by work type
    const focusByType = await prisma.focusSession.groupBy({
      by: ['work_type_id'],
      where: {
        user_id: user.id,
        started_at: { gte: since },
      },
      _sum: { duration_minutes: true },
    })

    // On-time vs overdue
    const allTasks = await prisma.task.findMany({
      where: {
        user_id: user.id,
        status: 'done',
        completed_at: { gte: since },
      },
    })

    const onTime = allTasks.filter((t) => {
      if (!t.due_date || !t.completed_at) return false
      return t.completed_at <= t.due_date
    }).length

    const overdue = allTasks.length - onTime

    // Progress entries for heatmap (12 weeks)
    const progressEntries = await prisma.progressEntry.findMany({
      where: {
        user_id: user.id,
        date: { gte: new Date(Date.now() - 84 * 24 * 60 * 60 * 1000) }, // 12 weeks
      },
      orderBy: { date: 'asc' },
    })

    // Streak
    const streak = await prisma.progressEntry.findMany({
      where: { user_id: user.id },
      orderBy: { date: 'desc' },
      take: 1,
    })

    return NextResponse.json({
      completionByDay,
      focusByType,
      onTimeRate: allTasks.length > 0 ? (onTime / allTasks.length) * 100 : 0,
      overdueCount: overdue,
      progressEntries,
      currentStreak: streak[0]?.streak_days || 0,
    })
  } catch (error) {
    console.error('GET /api/insights error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
