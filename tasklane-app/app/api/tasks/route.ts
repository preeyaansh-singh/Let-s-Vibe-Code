// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { taskSchema } from '@/lib/utils/validation'
import { getCurrentUser } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const work_type_id = searchParams.get('work_type_id')

    const tasks = await prisma.task.findMany({
      where: {
        user_id: user.id,
        status: status || undefined,
        work_type_id: work_type_id || undefined,
        is_deleted: false,
      },
      include: {
        subtasks: true,
        tags: true,
        work_type: true,
      },
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        ...validated,
        user_id: user.id,
      },
      include: {
        subtasks: true,
        tags: true,
        work_type: true,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
