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
    <main className="min-h-screen px-4 py-8 text-stone-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl">
        <header className="mb-7 text-center sm:mb-9">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-orange-200/20 bg-orange-300/10 text-2xl shadow-inner">
            🦊
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-orange-200/70">
            A little friendly game
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#fff5e6] sm:text-5xl">
            Rock, Paper <span className="text-[#e7a260]">&amp;</span> Scissors
          </h1>
          <p className="mt-2 text-sm text-stone-400">Come in, take a seat, and play a round.</p>
        </header>

        <nav
          aria-label="Game mode"
          className="mx-auto mb-4 grid max-w-sm grid-cols-2 rounded-xl border border-white/[0.07] bg-[#252522] p-1"
        >
          <button
            type="button"
            aria-pressed={mode === 'classic'}
            onClick={() => selectMode('classic')}
            className={`rounded-lg px-3 py-2.5 text-sm transition ${
              mode === 'classic'
                ? 'bg-[#e7a260] font-semibold text-[#30231a] shadow-sm'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            Classic Match
          </button>
          <button
            type="button"
            aria-pressed={mode === 'mystery'}
            onClick={() => selectMode('mystery')}
            className={`rounded-lg px-3 py-2.5 text-sm transition ${
              mode === 'mystery'
                ? 'bg-[#e7a260] font-semibold text-[#30231a] shadow-sm'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            Mystery Challenge
          </button>
        </nav>

        <section className="rounded-[1.75rem] border border-[#fff7e8]/10 bg-[#302e2a] p-5 text-center text-[#f3eadc] shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-8">
          <p className="text-sm text-[#b8aa98]">
            {mode === 'classic'
              ? `First to ${CLASSIC_TARGET} wins takes the match.`
              : 'Reach a secret number of wins. Losses and ties never end your run.'}
          </p>

          <div className="mt-5 grid grid-cols-3 divide-x divide-[#49443d] rounded-2xl border border-[#49443d] bg-[#272623] py-3">
            <div className="px-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d89a61]">
                You
              </p>
              <p className="mt-1 font-serif text-3xl tabular-nums text-[#fff3e3]" aria-label="Your wins">
                {score.player}
              </p>
            </div>
            <div className="px-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a99c8b]">
                Ties
              </p>
              <p className="mt-1 font-serif text-3xl tabular-nums text-[#e2d6c6]">{score.draws}</p>
            </div>
            <div className="px-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d89a61]">
                Friend
              </p>
              <p
                className="mt-1 font-serif text-3xl tabular-nums text-[#fff3e3]"
                aria-label="Computer wins"
              >
                {score.computer}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-[#a99c8b]">
            {score.rounds} {score.rounds === 1 ? 'round' : 'rounds'} played
          </p>

          <div
            role="status"
            aria-live="polite"
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              gameOver
                ? playerWon
                  ? 'border-[#a9b79a] bg-[#e7eddf] text-[#48593d]'
                  : 'border-[#996b57] bg-[#49362f] text-[#edc0a9]'
                : 'border-[#514a40] bg-[#39362f] text-[#c7bba9]'
            }`}
          >
            {statusMessage()}
          </div>

          <div className="my-5 flex items-center justify-center gap-4 sm:gap-8" aria-label="Last round">
            <div className="min-w-[5.5rem]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#554c40] bg-[#39352f] text-4xl shadow-sm sm:h-20 sm:w-20 sm:text-5xl">
                {lastRound?.player.symbol ?? '☕'}
              </div>
              <p className="mt-2 text-xs text-[#b8aa98]">You</p>
            </div>
            <span className="font-serif text-sm italic text-[#b09b83]" aria-hidden="true">
              {lastRound ? 'and' : 'ready?'}
            </span>
            <div className="min-w-[5.5rem]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#554c40] bg-[#39352f] text-4xl shadow-sm sm:h-20 sm:w-20 sm:text-5xl">
                {lastRound?.computer.symbol ?? '🦊'}
              </div>
              <p className="mt-2 text-xs text-[#b8aa98]">Your friend</p>
            </div>
          </div>

          {lastRound && (
            <p className="mb-4 text-xs text-[#b8aa98]">
              {lastRound.player.label} against {lastRound.computer.label}
            </p>
          )}

          <div className="border-t border-[#49443d] pt-5">
            <p className="mb-3 font-serif text-lg text-[#f0dfc8]">What will it be?</p>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  aria-label={`Play ${choice.label}`}
                  disabled={gameOver}
                  onClick={() => play(choice)}
                  className="group rounded-2xl border border-[#514a40] bg-[#39362f] px-2 py-3 transition hover:-translate-y-0.5 hover:border-[#d99a5c] hover:bg-[#443d33] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:py-4"
                >
                  <span className="block text-3xl transition-transform group-hover:scale-105 sm:text-4xl" aria-hidden="true">
                    {choice.symbol}
                  </span>
                  <span className="mt-1.5 block text-sm font-medium text-[#e4d6c4]">
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
              className="mt-5 rounded-xl bg-[#c7773d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ae6331] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c7773d] focus-visible:ring-offset-2"
            >
              Let&apos;s play again
            </button>
          )}
        </section>
        <p className="mt-5 text-center text-xs text-stone-500">
          {mode === 'mystery'
            ? 'A new secret goal is picked every time you start over.'
            : 'Rock beats scissors · Paper beats rock · Scissors beats paper'}
        </p>
      </div>
    </main>
  );
}

export default App;
