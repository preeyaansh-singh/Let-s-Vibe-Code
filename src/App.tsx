import { useState } from 'react';

type ChoiceId = 'rock' | 'paper' | 'scissors';
type Mode = 'classic' | 'mystery';
type Outcome = 'win' | 'loss' | 'draw';

type Choice = {
  id: ChoiceId;
  label: string;
  symbol: string;
  beats: ChoiceId;
};

type Round = {
  player: Choice;
  computer: Choice;
  outcome: Outcome;
};

const CHOICES: Choice[] = [
  { id: 'rock', label: 'Rock', symbol: '✊', beats: 'scissors' },
  { id: 'paper', label: 'Paper', symbol: '✋', beats: 'rock' },
  { id: 'scissors', label: 'Scissors', symbol: '✌️', beats: 'paper' }
];
const CLASSIC_TARGET = 3;
const MIN_MYSTERY_TARGET = 3;
const MAX_MYSTERY_TARGET = 7;

function chooseMysteryTarget(): number {
  return (
    Math.floor(Math.random() * (MAX_MYSTERY_TARGET - MIN_MYSTERY_TARGET + 1)) +
    MIN_MYSTERY_TARGET
  );
}

function getOutcome(player: Choice, computer: Choice): Outcome {
  if (player.id === computer.id) {
    return 'draw';
  }

  return player.beats === computer.id ? 'win' : 'loss';
}

function App() {
  const [mode, setMode] = useState<Mode>('classic');
  const [targetWins, setTargetWins] = useState(CLASSIC_TARGET);
  const [score, setScore] = useState({ player: 0, computer: 0, draws: 0, rounds: 0 });
  const [lastRound, setLastRound] = useState<Round | null>(null);

  const gameOver =
    mode === 'mystery'
      ? score.player >= targetWins
      : score.player >= CLASSIC_TARGET || score.computer >= CLASSIC_TARGET;
  const playerWon = score.player >= (mode === 'mystery' ? targetWins : CLASSIC_TARGET);

  const selectMode = (nextMode: Mode) => {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setTargetWins(nextMode === 'mystery' ? chooseMysteryTarget() : CLASSIC_TARGET);
    setScore({ player: 0, computer: 0, draws: 0, rounds: 0 });
    setLastRound(null);
  };

  const startNewGame = () => {
    setTargetWins(mode === 'mystery' ? chooseMysteryTarget() : CLASSIC_TARGET);
    setScore({ player: 0, computer: 0, draws: 0, rounds: 0 });
    setLastRound(null);
  };

  const play = (playerChoice: Choice) => {
    if (gameOver) {
      return;
    }

    const computerChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const outcome = getOutcome(playerChoice, computerChoice);

    setLastRound({ player: playerChoice, computer: computerChoice, outcome });
    setScore((current) => ({
      player: current.player + Number(outcome === 'win'),
      computer: current.computer + Number(outcome === 'loss'),
      draws: current.draws + Number(outcome === 'draw'),
      rounds: current.rounds + 1
    }));
  };

  const statusMessage = () => {
    if (gameOver && mode === 'mystery') {
      return `You reached the mystery goal! It was ${targetWins} wins.`;
    }
    if (gameOver && playerWon) {
      return 'You won the match!';
    }
    if (gameOver) {
      return 'The computer won the match. Give it another try!';
    }
    if (!lastRound) {
      return 'Choose your move to start the match.';
    }
    if (lastRound.outcome === 'draw') {
      return 'It is a draw. No points this round.';
    }
    return lastRound.outcome === 'win' ? 'You win this round!' : 'The computer wins this round.';
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 text-slate-100 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_55%)]" />
      <div className="relative mx-auto max-w-3xl">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            The ultimate showdown
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
            Rock <span className="text-cyan-300">Paper</span> Scissors
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
            Read the moment, pick your move, and see if you can outsmart the computer.
          </p>
        </header>

        <section
          aria-label="Game mode"
          className="mx-auto mt-8 grid max-w-md grid-cols-2 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5"
        >
          <button
            type="button"
            aria-pressed={mode === 'classic'}
            onClick={() => selectMode('classic')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'classic'
                ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Classic Match
          </button>
          <button
            type="button"
            aria-pressed={mode === 'mystery'}
            onClick={() => selectMode('mystery')}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              mode === 'mystery'
                ? 'bg-violet-400 text-slate-950 shadow-lg shadow-violet-950/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mystery Challenge
          </button>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-slate-900/70 p-5 text-center shadow-2xl shadow-black/20 sm:p-7">
          {mode === 'classic' ? (
            <p className="text-sm text-slate-300">
              First to {CLASSIC_TARGET} wins takes the match.
            </p>
          ) : (
            <p className="text-sm text-violet-200">
              Reach a secret number of wins. Losses and ties never end your run.
            </p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-5">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-2 py-4 sm:px-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                You
              </p>
              <p className="mt-1 text-4xl font-black tabular-nums text-white" aria-label="Your wins">
                {score.player}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-2 py-4 sm:px-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Draws
              </p>
              <p className="mt-1 text-4xl font-black tabular-nums text-slate-200">{score.draws}</p>
            </div>
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 px-2 py-4 sm:px-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-200">
                Computer
              </p>
              <p
                className="mt-1 text-4xl font-black tabular-nums text-white"
                aria-label="Computer wins"
              >
                {score.computer}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">{score.rounds} rounds played</p>

          <div
            role="status"
            aria-live="polite"
            className={`mt-6 min-h-14 rounded-2xl border px-4 py-3 text-sm font-medium ${
              gameOver
                ? playerWon
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                  : 'border-rose-400/30 bg-rose-400/10 text-rose-200'
                : 'border-white/10 bg-slate-950/50 text-slate-300'
            }`}
          >
            {statusMessage()}
          </div>

          {lastRound && (
            <div className="mt-5 flex items-center justify-center gap-5 text-sm" aria-label="Last round">
              <p>
                You: <span className="font-semibold text-white">{lastRound.player.label}</span>
              </p>
              <span className="text-slate-600" aria-hidden="true">
                vs
              </span>
              <p>
                Computer:{' '}
                <span className="font-semibold text-white">{lastRound.computer.label}</span>
              </p>
            </div>
          )}

          <div className="mt-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Choose your move
            </p>
            <div className="grid grid-cols-3 gap-3">
              {CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  aria-label={`Play ${choice.label}`}
                  disabled={gameOver}
                  onClick={() => play(choice)}
                  className="group rounded-2xl border border-white/10 bg-slate-950/70 px-2 py-4 transition hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:py-5"
                >
                  <span
                    className="block text-4xl transition group-hover:scale-110 sm:text-5xl"
                    aria-hidden="true"
                  >
                    {choice.symbol}
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-slate-200">
                    {choice.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {gameOver && (
            <button
              type="button"
              onClick={startNewGame}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              Play again
            </button>
          )}
        </section>
        <p className="mt-5 text-center text-xs text-slate-600">
          {mode === 'mystery'
            ? 'The mystery goal is randomly chosen for each new challenge.'
            : 'Rock beats scissors · Paper beats rock · Scissors beats paper'}
        </p>
      </div>
    </main>
  );
}

export default App;
