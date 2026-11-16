import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Rock Paper Scissors', () => {
  it('ends a mystery challenge only after reaching its hidden win goal', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.99)
      .mockReturnValueOnce(0.99);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Mystery Challenge' }));

    expect(screen.queryByText(/goal was 3 wins/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Play Rock' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play Rock' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play Rock' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play Rock' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'You reached the mystery goal! It was 3 wins.'
    );
    expect(screen.getByText('4 rounds played')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play Rock' })).toBeDisabled();
  });

  it('starts a new game in the selected mode', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(0.99);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Mystery Challenge' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play Rock' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play Rock' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play Rock' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));

    expect(screen.getByText('0 rounds played')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play Rock' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Mystery Challenge' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
