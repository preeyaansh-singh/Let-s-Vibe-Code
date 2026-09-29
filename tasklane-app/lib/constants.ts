// lib/constants.ts
export const WORK_TYPES = [
  {
    id: 'deep-work',
    name: 'Deep work',
    color: '#06b6d4',
    icon: 'brain',
  },
  {
    id: 'meetings',
    name: 'Meetings',
    color: '#f59e0b',
    icon: 'users',
  },
  {
    id: 'errands',
    name: 'Errands',
    color: '#ef4444',
    icon: 'shopping-cart',
  },
  {
    id: 'learning',
    name: 'Learning',
    color: '#8b5cf6',
    icon: 'book-open',
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#ec4899',
    icon: 'heart',
  },
]

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', order: 0 },
  { value: 'medium', label: 'Medium', order: 1 },
  { value: 'high', label: 'High', order: 2 },
  { value: 'urgent', label: 'Urgent', order: 3 },
]

export const TASK_STATUSES = [
  { value: 'todo', label: 'To do', icon: 'circle' },
  { value: 'in_progress', label: 'In progress', icon: 'circle-dashed' },
  { value: 'done', label: 'Done', icon: 'check-circle-2' },
]

export const KEYBOARD_SHORTCUTS = [
  { key: 'Cmd/Ctrl+K', action: 'Open command palette' },
  { key: 'N', action: 'New task' },
  { key: '/', action: 'Search tasks' },
  { key: 'E', action: 'Edit selected task' },
  { key: 'Space', action: 'Mark task complete' },
  { key: 'D', action: 'Delete task' },
  { key: '1-5', action: 'Filter by work type' },
  { key: '?', action: 'Show shortcuts' },
]

export const POMODORO_DEFAULTS = {
  workMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
}
