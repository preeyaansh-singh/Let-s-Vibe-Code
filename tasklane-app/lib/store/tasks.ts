// lib/store/tasks.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task } from '@prisma/client'

interface TasksStore {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  completeTask: (id: string) => void
  undoStack: Task[][]
  pushUndo: (tasks: Task[]) => void
  undo: () => void
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      undoStack: [],

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [task, ...state.tasks],
          undoStack: [state.tasks, ...state.undoStack].slice(0, 20),
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
          undoStack: [state.tasks, ...state.undoStack].slice(0, 20),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          undoStack: [state.tasks, ...state.undoStack].slice(0, 20),
        })),

      completeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status: 'done', completed_at: new Date() } : t
          ),
          undoStack: [state.tasks, ...state.undoStack].slice(0, 20),
        })),

      pushUndo: (tasks) =>
        set((state) => ({
          undoStack: [tasks, ...state.undoStack].slice(0, 20),
        })),

      undo: () => {
        const state = get()
        if (state.undoStack.length > 0) {
          const [previousState, ...rest] = state.undoStack
          set({
            tasks: previousState,
            undoStack: rest,
          })
        }
      },
    }),
    {
      name: 'tasklane-tasks',
      version: 1,
    }
  )
)
