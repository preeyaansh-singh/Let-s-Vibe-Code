// app/api/focus/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { focusSessionSchema } from '@/lib/utils/validation'
import { getCurrentUser } from '@/lib/auth/server'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = focusSessionSchema.parse(body)

    const session = await prisma.focusSession.create({
      data: {
        user_id: user.id,
        started_at: new Date(),
        ended_at: new Date(Date.now() + (validated.duration_minutes || 25) * 60 * 1000),
        duration_minutes: validated.duration_minutes,
        work_type_id: validated.work_type_id,
        task_id: validated.task_id,
        was_completed: validated.was_completed,
      },
    })

    // Update progress entry
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.progressEntry.upsert({
      where: { user_id_date: { user_id: user.id, date: today } },
      create: {
        user_id: user.id,
        date: today,
        completed_minutes: validated.duration_minutes,
        goal_minutes: user.daily_goal_minutes,
      },
      update: {
        completed_minutes: {
          increment: validated.duration_minutes,
        },
      },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('POST /api/focus error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const since = new Date()
    since.setDate(since.getDate() - days)

    const sessions = await prisma.focusSession.findMany({
      where: {
        user_id: user.id,
        started_at: { gte: since },
      },
      include: {
        task: true,
      },
      orderBy: { started_at: 'desc' },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('GET /api/focus error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
