// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_WORK_TYPES = [
  { name: 'Deep work', color: '#06b6d4', icon: 'brain' },
  { name: 'Meetings', color: '#f59e0b', icon: 'users' },
  { name: 'Errands', color: '#ef4444', icon: 'shopping-cart' },
  { name: 'Learning', color: '#8b5cf6', icon: 'book-open' },
  { name: 'Personal', color: '#ec4899', icon: 'heart' },
]

async function main() {
  // Demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@tasklane.app' },
    update: {},
    create: {
      email: 'demo@tasklane.app',
      name: 'Demo User',
      timezone: 'UTC',
      pomodoro_work_mins: 25,
      pomodoro_break_mins: 5,
      daily_goal_minutes: 120,
      weekly_goal_minutes: 600,
    },
  })

  // Create default work types
  const workTypes = await Promise.all(
    DEFAULT_WORK_TYPES.map((type) =>
      prisma.workType.upsert({
        where: { user_id_name: { user_id: user.id, name: type.name } },
        update: {},
        create: {
          user_id: user.id,
          ...type,
          is_default: true,
        },
      })
    )
  )

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: { user_id: user.id, name: 'urgent', color: '#ef4444' },
    }),
    prisma.tag.create({
      data: { user_id: user.id, name: 'blocked', color: '#f59e0b' },
    }),
    prisma.tag.create({
      data: { user_id: user.id, name: 'review', color: '#3b82f6' },
    }),
  ])

  // Create sample tasks
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const sampleTasks = [
    {
      title: 'Design new landing page',
      notes: '# Design goals\n- Mobile first\n- Accessibility compliant (WCAG AA)\n- Load time < 2s',
      priority: 'high',
      status: 'in_progress',
      work_type_id: workTypes[0].id, // Deep work
      due_date: today,
      estimated_minutes: 120,
      tags: [],
    },
    {
      title: 'Team standup',
      notes: 'Discuss Q4 roadmap and blockers',
      priority: 'medium',
      status: 'todo',
      work_type_id: workTypes[1].id, // Meetings
      due_date: today,
      due_time: '10:00',
      estimated_minutes: 30,
      tags: [],
    },
    {
      title: 'Grocery shopping',
      notes: 'Milk, eggs, bread, vegetables',
      priority: 'low',
      status: 'todo',
      work_type_id: workTypes[2].id, // Errands
      due_date: tomorrow,
      estimated_minutes: 45,
      tags: [tags[0].id],
    },
    {
      title: 'Learn TypeScript generics',
      notes: 'Complete Chapter 5 of Advanced TypeScript',
      priority: 'medium',
      status: 'todo',
      work_type_id: workTypes[3].id, // Learning
      due_date: nextWeek,
      estimated_minutes: 90,
      tags: [],
    },
    {
      title: 'Code review for PR #234',
      notes: 'Check performance improvements, provide feedback',
      priority: 'high',
      status: 'done',
      work_type_id: workTypes[0].id, // Deep work
      due_date: today,
      completed_at: new Date(Date.now() - 3600000),
      estimated_minutes: 60,
      tags: [tags[2].id],
    },
    {
      title: 'Call with marketing',
      notes: 'Discuss campaign strategy for product launch',
      priority: 'high',
      status: 'todo',
      work_type_id: workTypes[1].id, // Meetings
      due_date: tomorrow,
      due_time: '14:00',
      estimated_minutes: 45,
      tags: [],
    },
    {
      title: 'Yoga class',
      notes: 'Morning power yoga session',
      priority: 'low',
      status: 'todo',
      work_type_id: workTypes[4].id, // Personal
      due_date: tomorrow,
      due_time: '07:00',
      estimated_minutes: 60,
      tags: [],
    },
    {
      title: 'Refactor auth module',
      notes: 'Improve error handling and logging, add tests',
      priority: 'high',
      status: 'todo',
      work_type_id: workTypes[0].id, // Deep work
      due_date: nextWeek,
      estimated_minutes: 180,
      tags: [tags[1].id],
    },
  ]

  for (const taskData of sampleTasks) {
    await prisma.task.create({
      data: {
        user_id: user.id,
        title: taskData.title,
        notes: taskData.notes,
        priority: taskData.priority,
        status: taskData.status,
        work_type_id: taskData.work_type_id,
        due_date: taskData.due_date,
        due_time: taskData.due_time,
        estimated_minutes: taskData.estimated_minutes,
        completed_at: taskData.completed_at,
        tags: {
          connect: taskData.tags.map((id) => ({ id })),
        },
      },
    })
  }

  // Create sample subtasks
  const deepWorkTask = await prisma.task.findFirst({
    where: { user_id: user.id, title: 'Design new landing page' },
  })

  if (deepWorkTask) {
    await prisma.subtask.createMany({
      data: [
        { task_id: deepWorkTask.id, title: 'Create wireframes', is_completed: true, order: 0 },
        { task_id: deepWorkTask.id, title: 'Design mockups in Figma', is_completed: false, order: 1 },
        { task_id: deepWorkTask.id, title: 'Get stakeholder feedback', is_completed: false, order: 2 },
      ],
    })
  }

  // Create sample focus sessions
  const completedTask = await prisma.task.findFirst({
    where: { user_id: user.id, title: 'Code review for PR #234' },
  })

  if (completedTask) {
    await prisma.focusSession.create({
      data: {
        user_id: user.id,
        task_id: completedTask.id,
        work_type_id: workTypes[0].id,
        duration_minutes: 55,
        started_at: new Date(Date.now() - 7200000),
        ended_at: new Date(Date.now() - 3600000),
        was_completed: true,
      },
    })
  }

  console.log('Seed completed successfully')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
