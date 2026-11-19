import { describe, expect, it } from 'vitest';
import {
  ELEMENTS,
  EMPTY_ELEMENT_COUNTS,
  getElementFrequency,
  getEclipseOutcome,
  getTopOpponentElement
} from './eclipse';

describe('ECLIPSE matchups', () => {
  it('gives each element one win, one loss, and one distinct-element draw', () => {
    for (const element of ELEMENTS) {
      expect(getEclipseOutcome(element.id, element.beats)).toBe('win');
      expect(getEclipseOutcome(element.id, element.losesTo)).toBe('loss');
      expect(getEclipseOutcome(element.id, element.drawsWith)).toBe('draw');
      expect(getEclipseOutcome(element.id, element.id)).toBe('draw');
    }
  });

  it('tracks the opponent most-used element and reports its frequency', () => {
    const counts = { ...EMPTY_ELEMENT_COUNTS, fire: 3, water: 1 };

    expect(getTopOpponentElement(counts)).toBe('fire');
    expect(getElementFrequency(counts, 'fire')).toBe(75);
    expect(getTopOpponentElement(EMPTY_ELEMENT_COUNTS)).toBeNull();
  });
});
