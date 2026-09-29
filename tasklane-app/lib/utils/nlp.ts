// lib/utils/nlp.ts
// Natural language parsing for quick add feature

export interface ParsedTask {
  title: string
  dateTime?: { date: string; time?: string }
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  workType?: string
  estimate?: number
  tags?: string[]
}

const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'urgent'> = {
  '!': 'high',
  '!!': 'urgent',
  '!!!': 'urgent',
  '!high': 'high',
  '!medium': 'medium',
  '!low': 'low',
  '!urgent': 'urgent',
}

const datePatterns = {
  tomorrow: { days: 1 },
  today: { days: 0 },
  'next week': { days: 7 },
  'next monday': { days: 1, dow: 1 },
  'next tuesday': { days: 1, dow: 2 },
  'next wednesday': { days: 1, dow: 3 },
  'next thursday': { days: 1, dow: 4 },
  'next friday': { days: 1, dow: 5 },
  'next saturday': { days: 1, dow: 6 },
  'next sunday': { days: 1, dow: 0 },
}

export function parseNaturalLanguage(input: string): ParsedTask {
  const text = input.trim()
  const tokens = text.split(/\s+/)

  let title = ''
  let dateTime: { date: string; time?: string } | undefined
  let priority: 'low' | 'medium' | 'high' | 'urgent' | undefined
  let workType: string | undefined
  let estimate: number | undefined
  let tags: string[] = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    // Priority: !high, !!, !!!
    if (token.startsWith('!')) {
      priority = priorityMap[token] || 'high'
      continue
    }

    // Estimate: ~45m, ~1h
    if (token.startsWith('~')) {
      const match = token.match(/~(\d+)([mhd])?/)
      if (match) {
        let mins = parseInt(match[1])
        if (match[2] === 'h') mins *= 60
        if (match[2] === 'd') mins *= 480 // 8-hour workday
        estimate = mins
      }
      continue
    }

    // Work type: #meetings, #errands
    if (token.startsWith('#')) {
      workType = token.slice(1)
      continue
    }

    // Tags: included in workType pattern or custom
    if (token.startsWith('@')) {
      tags.push(token.slice(1))
      continue
    }

    // Time: 3pm, 14:30, 15:00
    if (/^\d{1,2}(:\d{2})?([ap]m)?$/.test(token) || /^\d{2}:\d{2}$/.test(token)) {
      // Parse time
      let hours = 0
      if (token.includes(':')) {
        const [h, m] = token.split(':').map(Number)
        hours = h
      } else {
        const match = token.match(/(\d{1,2})([ap]m)?/)
        if (match) {
          hours = parseInt(match[1])
          if (match[2] === 'pm' && hours < 12) hours += 12
          if (match[2] === 'am' && hours === 12) hours = 0
        }
      }
      dateTime = { ...dateTime, time: String(hours).padStart(2, '0') + ':00' }
      continue
    }

    // Date parsing
    const lower = token.toLowerCase()
    if (datePatterns[lower as keyof typeof datePatterns]) {
      const now = new Date()
      const pattern = datePatterns[lower as keyof typeof datePatterns]
      const date = new Date(now)
      date.setDate(date.getDate() + pattern.days)
      dateTime = {
        ...dateTime,
        date: date.toISOString().split('T')[0],
      }
      continue
    }

    // Accumulate title
    if (!token.startsWith('!') && !token.startsWith('~') && !token.startsWith('#') && !token.startsWith('@')) {
      title += (title ? ' ' : '') + token
    }
  }

  return {
    title: title.trim(),
    dateTime,
    priority,
    workType,
    estimate,
    tags: tags.length > 0 ? tags : undefined,
  }
}
