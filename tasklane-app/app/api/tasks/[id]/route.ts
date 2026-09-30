// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { taskSchema } from '@/lib/utils/validation'
import { getCurrentUser } from '@/lib/auth/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findUniqueOrThrow({
      where: { id },
      include: {
        subtasks: true,
        tags: true,
        work_type: true,
        focus_sessions: true,
      },
    })

    // Check ownership
    if (task.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const existing = await prisma.task.findUniqueOrThrow({
      where: { id },
    })

    if (existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = taskSchema.partial().parse(body)

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: validated.title,
        notes: validated.notes,
        status: validated.status,
        priority: validated.priority,
        due_date: validated.due_date,
        due_time: validated.due_time,
        estimated_minutes: validated.estimated_minutes,
        recurrence: validated.recurrence,
      },
      include: {
        subtasks: true,
        tags: true,
        work_type: true,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const task = await prisma.task.findUniqueOrThrow({
      where: { id },
    })

    if (task.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete
    await prisma.task.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

