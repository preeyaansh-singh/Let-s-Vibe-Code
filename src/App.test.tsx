import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

describe('Tempo app', () => {
  it('adds a task from the quick add bar', () => {
    render(<App />);

    const input = screen.getByRole('textbox', { name: /quick add task/i });
    fireEvent.change(input, {
      target: { value: 'Write report tomorrow for 90m #Work p1' }
    });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(screen.getByText('Write report')).toBeInTheDocument();
    expect(screen.getAllByText('P1').length).toBeGreaterThan(0);
  });
});
