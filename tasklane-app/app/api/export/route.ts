// app/api/export/route.ts
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
    const format = searchParams.get('format') || 'json' // 'json' or 'csv'

    // Fetch all user data
    const tasks = await prisma.task.findMany({
      where: { user_id: user.id, is_deleted: false },
      include: { subtasks: true, tags: true, work_type: true },
    })

    const workTypes = await prisma.workType.findMany({
      where: { user_id: user.id },
    })

    const focusSessions = await prisma.focusSession.findMany({
      where: { user_id: user.id },
    })

    if (format === 'csv') {
      // Export as CSV
      const headers = ['ID', 'Title', 'Status', 'Priority', 'Type', 'Due Date', 'Estimated Minutes', 'Completed At']
      const rows = tasks.map((t) => [
        t.id,
        `"${t.title}"`,
        t.status,
        t.priority,
        t.work_type.name,
        t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '',
        t.estimated_minutes || '',
        t.completed_at ? new Date(t.completed_at).toISOString().split('T')[0] : '',
      ])

      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="tasklane-export.csv"',
        },
      })
    } else {
      // Export as JSON
      const data = {
        export_date: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
        },
        tasks,
        work_types: workTypes,
        focus_sessions: focusSessions,
      }

      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="tasklane-export.json"',
        },
      })
    }
  } catch (error) {
    console.error('GET /api/export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const content = await file.text()
    const data = JSON.parse(content)

    // Import work types
    for (const type of data.work_types || []) {
      await prisma.workType.upsert({
        where: { user_id_name: { user_id: user.id, name: type.name } },
        update: { color: type.color, icon: type.icon },
        create: {
          user_id: user.id,
          name: type.name,
          color: type.color,
          icon: type.icon,
        },
      })
    }

    // Import tasks
    let importedCount = 0
    for (const task of data.tasks || []) {
      try {
        await prisma.task.create({
          data: {
            user_id: user.id,
            title: task.title,
            notes: task.notes,
            status: task.status,
            priority: task.priority,
            work_type_id: task.work_type_id,
            due_date: task.due_date ? new Date(task.due_date) : null,
            estimated_minutes: task.estimated_minutes,
          },
        })
        importedCount++
      } catch (e) {
        console.error('Failed to import task:', task.title, e)
      }
    }

    return NextResponse.json({ imported: importedCount })
  } catch (error) {
    console.error('POST /api/export error:', error)
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
  }
}
