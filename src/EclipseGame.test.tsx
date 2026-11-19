import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EclipseGame from './EclipseGame';

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function finishReveal() {
  for (let step = 0; step < 3; step += 1) {
    await act(async () => {
      await vi.advanceTimersToNextTimerAsync();
    });
  }
}

describe('ECLIPSE game modes', () => {
  it('awards a bonus point for countering a predicted opponent move in Mind Games', async () => {
    render(<EclipseGame onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Mind Games/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Choose Water' }));
    await finishReveal();
    fireEvent.click(screen.getByRole('button', { name: 'Choose Water' }));
    await finishReveal();

    expect(screen.getByRole('status')).toHaveTextContent('A perfect read! You earn a bonus point.');
    expect(screen.getByText('3', { exact: true })).toBeInTheDocument();
  });

  it('ends a Survival run after three losses', async () => {
    render(<EclipseGame onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Survival/i }));

    for (let round = 0; round < 3; round += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Choose Nature' }));
      await finishReveal();
    }

    expect(screen.getByRole('status')).toHaveTextContent('Your run lasted 3 rounds.');
    expect(screen.getByRole('button', { name: 'Rise again' })).toBeInTheDocument();
  });

  it('spends three energy to activate Regrowth in a duel', async () => {
    render(<EclipseGame onBack={vi.fn()} />);

    for (let round = 0; round < 3; round += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Choose Water' }));
      await finishReveal();
    }

    fireEvent.click(screen.getByRole('button', { name: /Choose a power/i }));
    fireEvent.click(screen.getByRole('button', { name: /Regrowth/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Regrowth restores your strength. +1 point.');
    expect(screen.getByText('4', { exact: true })).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('turns the next loss into a draw when Reversal is armed', async () => {
    const random = vi.spyOn(Math, 'random');
    render(<EclipseGame onBack={vi.fn()} />);

    for (let round = 0; round < 3; round += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Choose Water' }));
      await finishReveal();
    }

    random.mockReturnValueOnce(0.99).mockReturnValueOnce(0.99);
    fireEvent.click(screen.getByRole('button', { name: /Choose a power/i }));
    fireEvent.click(screen.getByRole('button', { name: /Reversal/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Choose Water' }));
    await finishReveal();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Aqua reversed the loss into a draw.'
    );
  });
});
