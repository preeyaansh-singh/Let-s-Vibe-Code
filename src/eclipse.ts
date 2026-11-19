export type ElementId = 'fire' | 'water' | 'nature' | 'metal';

export type EclipseElement = {
  id: ElementId;
  name: string;
  title: string;
  symbol: string;
  color: string;
  beats: ElementId;
  losesTo: ElementId;
  drawsWith: ElementId;
  ability: string;
  abilityDescription: string;
};

export const ELEMENTS: EclipseElement[] = [
  {
    id: 'fire',
    name: 'Ignis',
    title: 'Fire',
    symbol: '🔥',
    color: 'fire',
    beats: 'nature',
    losesTo: 'water',
    drawsWith: 'metal',
    ability: 'Inferno',
    abilityDescription: 'Your next Fire win earns a bonus point.'
  },
  {
    id: 'water',
    name: 'Aqua',
    title: 'Water',
    symbol: '💧',
    color: 'water',
    beats: 'fire',
    losesTo: 'metal',
    drawsWith: 'nature',
    ability: 'Reversal',
    abilityDescription: 'Your next loss becomes a draw.'
  },
  {
    id: 'nature',
    name: 'Terra',
    title: 'Nature',
    symbol: '🌿',
    color: 'nature',
    beats: 'metal',
    losesTo: 'fire',
    drawsWith: 'water',
    ability: 'Regrowth',
    abilityDescription: 'Recover a life in Survival or gain a point in a duel.'
  },
  {
    id: 'metal',
    name: 'Ferrum',
    title: 'Metal',
    symbol: '⚙️',
    color: 'metal',
    beats: 'water',
    losesTo: 'nature',
    drawsWith: 'fire',
    ability: 'Fortress',
    abilityDescription: 'Your next loss is blocked, regardless of your element.'
  }
];

export type EclipseOutcome = 'win' | 'loss' | 'draw';

export type ElementCounts = Record<ElementId, number>;

export const EMPTY_ELEMENT_COUNTS: ElementCounts = {
  fire: 0,
  water: 0,
  nature: 0,
  metal: 0
};

export function getElement(id: ElementId): EclipseElement {
  const element = ELEMENTS.find((item) => item.id === id);
  if (!element) {
    throw new Error(`Unknown Eclipse element: ${id}`);
  }

  return element;
}

export function getEclipseOutcome(player: ElementId, opponent: ElementId): EclipseOutcome {
  if (player === opponent) {
    return 'draw';
  }

  const playerElement = getElement(player);
  if (playerElement.beats === opponent) {
    return 'win';
  }
  if (playerElement.drawsWith === opponent) {
    return 'draw';
  }

  return 'loss';
}

export function getTopOpponentElement(counts: ElementCounts): ElementId | null {
  const total = ELEMENTS.reduce((sum, element) => sum + counts[element.id], 0);
  if (total === 0) {
    return null;
  }

  return ELEMENTS.reduce((top, element) =>
    counts[element.id] > counts[top.id] ? element : top
  ).id;
}

export function getOpponentPick(counts: ElementCounts): ElementId {
  const topPick = getTopOpponentElement(counts);
  const total = ELEMENTS.reduce((sum, element) => sum + counts[element.id], 0);

  if (topPick && total >= 3 && Math.random() < 0.6) {
    return topPick;
  }

  return ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)].id;
}

export function getElementFrequency(counts: ElementCounts, id: ElementId): number {
  const total = ELEMENTS.reduce((sum, element) => sum + counts[element.id], 0);
  return total === 0 ? 0 : Math.round((counts[id] / total) * 100);
}
