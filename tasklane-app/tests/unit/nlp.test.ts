// tests/unit/nlp.test.ts
import { describe, it, expect } from 'vitest'
import { parseNaturalLanguage } from '@/lib/utils/nlp'

describe('Natural Language Parsing', () => {
  it('parses task title', () => {
    const result = parseNaturalLanguage('Design review')
    expect(result.title).toBe('Design review')
  })

  it('parses priority', () => {
    const result = parseNaturalLanguage('Design review !high')
    expect(result.priority).toBe('high')
  })

  it('parses work type', () => {
    const result = parseNaturalLanguage('Design review #meetings')
    expect(result.workType).toBe('meetings')
  })

  it('parses estimate', () => {
    const result = parseNaturalLanguage('Design review ~45m')
    expect(result.estimate).toBe(45)
  })

  it('parses hour estimate', () => {
    const result = parseNaturalLanguage('Design review ~1h')
    expect(result.estimate).toBe(60)
  })

  it('parses date', () => {
    const result = parseNaturalLanguage('Design review tomorrow')
    expect(result.dateTime?.date).toBeDefined()
  })

  it('parses time', () => {
    const result = parseNaturalLanguage('Design review 3pm')
    expect(result.dateTime?.time).toBe('15:00')
  })

  it('parses complete task', () => {
    const result = parseNaturalLanguage('Design review tomorrow 3pm #meetings !high ~45m')
    expect(result.title).toBe('Design review')
    expect(result.priority).toBe('high')
    expect(result.workType).toBe('meetings')
    expect(result.estimate).toBe(45)
    expect(result.dateTime).toBeDefined()
  })

  it('handles urgent priority', () => {
    const result1 = parseNaturalLanguage('Task !!!!')
    expect(result1.priority).toBe('urgent')

    const result2 = parseNaturalLanguage('Task !urgent')
    expect(result2.priority).toBe('urgent')
  })
})
