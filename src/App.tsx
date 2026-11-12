import { useEffect, useMemo, useState, type FormEvent } from 'react';

type Priority = 'P1' | 'P2' | 'P3' | 'P4';
type Filter = 'all' | 'today' | 'upcoming' | 'done';

type Task = {
  id: string;
  title: string;
  notes: string;
  project: string;
  area: string;
  status: 'todo' | 'done';
  dueDate: string | null;
  startDate: string | null;
  duration: number;
  priority: Priority;
  recurrence: string | null;
  tags: string[];
};

const STORAGE_KEY = 'tempo.tasks.v1';
const DEFAULT_PRIORITY: Priority = 'P3';

const starterTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Draft the launch brief',
    notes: 'Protect the core message and key proof points.',
    project: 'Product',
    area: 'Planning',
    status: 'todo',
    dueDate: formatIsoDate(addDays(new Date(), 1)),
    startDate: formatIsoDate(new Date()),
    duration: 90,
    priority: 'P1',
    recurrence: null,
    tags: ['strategy', 'launch']
  },
  {
    id: 'task-2',
    title: 'Inbox zero for design feedback',
    notes: 'Organize requests and trim the backlog.',
    project: 'Inbox',
    area: 'Operations',
    status: 'todo',
    dueDate: formatIsoDate(new Date()),
    startDate: null,
    duration: 45,
    priority: 'P2',
    recurrence: null,
    tags: ['admin']
  },
  {
    id: 'task-3',
    title: 'Review sprint health',
    notes: 'Check team velocity and highlight blockers.',
    project: 'Team',
    area: 'Leadership',
    status: 'done',
    dueDate: formatIsoDate(addDays(new Date(), -1)),
    startDate: formatIsoDate(addDays(new Date(), -2)),
    duration: 60,
    priority: 'P3',
    recurrence: null,
    tags: ['weekly']
  }
];

function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(source: Date, dayCount: number): Date {
  const next = new Date(source);
  next.setDate(next.getDate() + dayCount);
  return next;
}

function formatDisplayDate(value: string | null): string {
  if (!value) {
    return 'No date';
  }

  const formatter = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric'
  });

  return formatter.format(new Date(`${value}T12:00:00`));
}

function parseRelativeDate(input: string): string | null {
  const value = input.toLowerCase();
  if (value.includes('today')) {
    return formatIsoDate(new Date());
  }

  if (value.includes('tomorrow')) {
    return formatIsoDate(addDays(new Date(), 1));
  }

  const inDaysMatch = input.match(/in\s+(\d+)\s+days?/i);
  if (inDaysMatch) {
    return formatIsoDate(addDays(new Date(), Number(inDaysMatch[1])));
  }

  const nextWeekMatch = /next\s+week/i.test(input);
  if (nextWeekMatch) {
    return formatIsoDate(addDays(new Date(), 7));
  }

  const weekdayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  for (const [day, targetIndex] of Object.entries(weekdayMap)) {
    if (value.includes(day)) {
      const now = new Date();
      const current = now.getDay();
      const delta = (targetIndex - current + 7) % 7 || 7;
      return formatIsoDate(addDays(now, delta));
    }
  }

  return null;
}

function parseDuration(input: string): number {
  const match = input.match(/for\s+(\d+)\s*(m|min|h|hr|hrs|hours?)/i);
  if (!match) {
    return 45;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith('h')) {
    return value * 60;
  }

  return value;
}

function parseQuickAdd(text: string): Partial<Task> | null {
  const input = text.trim();
  if (!input) {
    return null;
  }

  const priorityMatch = input.match(/\b(p1|p2|p3|p4)\b/i);
  const priority: Priority = (priorityMatch?.[1].toUpperCase() as Priority) ?? DEFAULT_PRIORITY;

  const tags = Array.from(input.matchAll(/#([a-z0-9_-]+)/gi)).map((match) => match[1].toLowerCase());
  const projectMatch = Array.from(input.matchAll(/@([a-z0-9_-]+)/gi)).map((match) => match[1]);
  const project = projectMatch[0] ?? 'Inbox';
  const dueDate = parseRelativeDate(input);
  const duration = parseDuration(input);
  const recurrence = /every weekday/i.test(input) ? 'Every weekday' : null;

  const cleanTitle = input
    .replace(/\b(p1|p2|p3|p4)\b/gi, '')
    .replace(/#[a-z0-9_-]+/gi, '')
    .replace(/@[a-z0-9_-]+/gi, '')
    .replace(/for\s+\d+\s*(m|min|h|hr|hrs|hours?)/gi, '')
    .replace(/every weekday/gi, '')
    .replace(/tomorrow/gi, '')
    .replace(/today/gi, '')
    .replace(/next week/gi, '')
    .replace(/in\s+\d+\s+days?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    title: cleanTitle || 'Untitled task',
    project,
    area: 'General',
    status: 'todo',
    notes: '',
    dueDate,
    startDate: dueDate ?? null,
    duration,
    priority,
    recurrence,
    tags
  };
}

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return starterTasks;
    }

    try {
      const parsed = JSON.parse(saved) as Task[];
      return parsed.length ? parsed : starterTasks;
    } catch {
      return starterTasks;
    }
  });

  const [quickAdd, setQuickAdd] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [formState, setFormState] = useState({
    title: '',
    project: 'Inbox',
    area: 'General',
    dueDate: '',
    priority: 'P3' as Priority,
    duration: '45'
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const today = formatIsoDate(new Date());

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase();

    return tasks
      .filter((task) => {
        const matchesFilter = (() => {
          if (filter === 'done') {
            return task.status === 'done';
          }

          if (filter === 'today') {
            return task.dueDate === today || task.startDate === today;
          }

          if (filter === 'upcoming') {
            return task.dueDate && task.dueDate >= today && task.status !== 'done';
          }

          return true;
        })();

        const matchesQuery =
          !query ||
          task.title.toLowerCase().includes(query) ||
          task.project.toLowerCase().includes(query) ||
          task.tags.some((tag) => tag.toLowerCase().includes(query));

        return matchesFilter && matchesQuery;
      })
      .sort((left, right) => {
        if (left.status !== right.status) {
          return left.status === 'todo' ? -1 : 1;
        }

        const leftDate = left.dueDate ?? '9999-12-31';
        const rightDate = right.dueDate ?? '9999-12-31';
        return leftDate.localeCompare(rightDate);
      });
  }, [filter, search, tasks, today]);

  const summary = useMemo(() => {
    const open = tasks.filter((task) => task.status === 'todo').length;
    const done = tasks.filter((task) => task.status === 'done').length;
    const dueToday = tasks.filter((task) => task.dueDate === today && task.status === 'todo').length;

    return { open, done, dueToday };
  }, [tasks, today]);

  const handleQuickAdd = () => {
    const parsed = parseQuickAdd(quickAdd);
    if (!parsed || !parsed.title) {
      return;
    }

    const nextTask: Task = {
      id: crypto.randomUUID(),
      title: parsed.title ?? 'Untitled task',
      notes: parsed.notes ?? '',
      project: parsed.project ?? 'Inbox',
      area: parsed.area ?? 'General',
      status: parsed.status ?? 'todo',
      dueDate: parsed.dueDate ?? null,
      startDate: parsed.startDate ?? null,
      duration: parsed.duration ?? 45,
      priority: parsed.priority ?? DEFAULT_PRIORITY,
      recurrence: parsed.recurrence ?? null,
      tags: parsed.tags ?? []
    };

    setTasks((current) => [nextTask, ...current]);
    setQuickAdd('');
  };

  const handleManualAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = formState.title.trim();
    if (!title) {
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      notes: '',
      project: formState.project,
      area: formState.area,
      status: 'todo',
      dueDate: formState.dueDate || null,
      startDate: formState.dueDate || null,
      duration: Number(formState.duration) || 45,
      priority: formState.priority,
      recurrence: null,
      tags: []
    };

    setTasks((current) => [newTask, ...current]);
    setFormState({
      title: '',
      project: 'Inbox',
      area: 'General',
      dueDate: '',
      priority: 'P3',
      duration: '45'
    });
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, status: task.status === 'todo' ? 'done' : 'todo' } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Local-first planning</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Tempo</h1>
          </div>
          <div className="flex gap-3 text-sm text-slate-300">
            <div className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5">
              {summary.open} open
            </div>
            <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5">
              {summary.done} done
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
              <h2 className="text-lg font-semibold text-white">Quick stats</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-800 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Open</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{summary.open}</p>
                </div>
                <div className="rounded-2xl bg-slate-800 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Done</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{summary.done}</p>
                </div>
                <div className="rounded-2xl bg-slate-800 p-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Today</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{summary.dueToday}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
              <h2 className="text-lg font-semibold text-white">Add a task</h2>
              <form className="mt-4 space-y-3" onSubmit={handleManualAdd}>
                <label className="block text-sm text-slate-300">
                  Title
                  <input
                    aria-label="Task title"
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, title: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-cyan-400"
                    placeholder="Write project brief"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-slate-300">
                    Project
                    <input
                      aria-label="Project"
                      value={formState.project}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, project: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Area
                    <input
                      aria-label="Area"
                      value={formState.area}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, area: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-slate-300">
                    Due date
                    <input
                      aria-label="Due date"
                      type="date"
                      value={formState.dueDate}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, dueDate: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                    />
                  </label>
                  <label className="block text-sm text-slate-300">
                    Duration (min)
                    <input
                      aria-label="Duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formState.duration}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, duration: event.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                    />
                  </label>
                </div>

                <label className="block text-sm text-slate-300">
                  Priority
                  <select
                    aria-label="Priority"
                    value={formState.priority}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        priority: event.target.value as Priority
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                  >
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                    <option value="P4">P4</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Add task
                </button>
              </form>
            </section>
          </aside>

          <main className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
              <label className="block text-sm text-slate-300">
                Quick add task
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <input
                    aria-label="Quick add task"
                    value={quickAdd}
                    onChange={(event) => setQuickAdd(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleQuickAdd();
                      }
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                    placeholder="Write report tomorrow 3pm for 90m #Work @deep p1"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    className="rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
                  >
                    Add
                  </button>
                </div>
              </label>
              <p className="mt-2 text-xs text-slate-400">
                Quick patterns: &quot;tomorrow&quot;, &quot;every weekday&quot;, &quot;#Work&quot;, &quot;@deep&quot;, &quot;p1&quot;, and &quot;for 90m&quot;
              </p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {(['all', 'today', 'upcoming', 'done'] as Filter[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFilter(option)}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        filter === option
                          ? 'bg-cyan-500 text-slate-950'
                          : 'border border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-500/60'
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>

                <label className="block w-full max-w-xs text-sm text-slate-300">
                  <span className="sr-only">Search tasks</span>
                  <input
                    aria-label="Search tasks"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                    placeholder="Search work, tags, project"
                  />
                </label>
              </div>

              <div className="mt-5 space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-sm text-slate-400">
                    No tasks match the current view.
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/40"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-3">
                          <input
                            aria-label={`Toggle ${task.title}`}
                            type="checkbox"
                            checked={task.status === 'done'}
                            onChange={() => toggleTaskStatus(task.id)}
                            className="mt-1 h-5 w-5 rounded border-slate-600 bg-slate-900 text-cyan-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3
                                className={`text-lg font-medium ${
                                  task.status === 'done'
                                    ? 'text-slate-500 line-through'
                                    : 'text-white'
                                }`}
                              >
                                {task.title}
                              </h3>
                              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-cyan-200">
                                {task.priority}
                              </span>
                            </div>
                            {task.notes ? <p className="mt-1 text-sm text-slate-400">{task.notes}</p> : null}
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                              <span className="rounded-full bg-slate-800 px-2 py-1">{task.project}</span>
                              <span className="rounded-full bg-slate-800 px-2 py-1">{task.area}</span>
                              <span className="rounded-full bg-slate-800 px-2 py-1">{task.duration} min</span>
                              {task.dueDate ? (
                                <span className="rounded-full bg-slate-800 px-2 py-1">
                                  {formatDisplayDate(task.dueDate)}
                                </span>
                              ) : null}
                              {task.recurrence ? (
                                <span className="rounded-full bg-violet-500/10 px-2 py-1 text-violet-200">
                                  {task.recurrence}
                                </span>
                              ) : null}
                            </div>
                            {task.tags.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-cyan-200">
                                {task.tags.map((tag) => (
                                  <span key={`${task.id}-${tag}`} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
