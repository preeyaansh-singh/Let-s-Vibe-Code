import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ELEMENTS,
  EMPTY_ELEMENT_COUNTS,
  getElement,
  getElementFrequency,
  getEclipseOutcome,
  getOpponentPick,
  getTopOpponentElement,
  type ElementCounts,
  type ElementId
} from './eclipse';

type EclipseMode = 'duel' | 'survival' | 'mind';
type PowerId = 'inferno' | 'reversal' | 'fortress';

type GameScore = {
  player: number;
  opponent: number;
  draws: number;
  rounds: number;
};

type RoundResult = {
  player: ElementId;
  opponent: ElementId;
  outcome: 'win' | 'loss' | 'draw';
  message: string;
};

type EclipseGameProps = {
  onBack: () => void;
};

const WIN_TARGET = 5;
const STARTING_LIVES = 3;
const ENERGY_TO_UNLOCK = 3;
const EMPTY_SCORE: GameScore = { player: 0, opponent: 0, draws: 0, rounds: 0 };

const MODES: { id: EclipseMode; label: string; detail: string }[] = [
  { id: 'duel', label: 'Quick Duel', detail: 'First to five points' },
  { id: 'survival', label: 'Survival', detail: 'Three lives. Hold on.' },
  { id: 'mind', label: 'Mind Games', detail: 'Read the pattern for bonus points' }
];

const POWERS: { id: PowerId | 'regrowth'; element: ElementId }[] = [
  { id: 'inferno', element: 'fire' },
  { id: 'reversal', element: 'water' },
  { id: 'regrowth', element: 'nature' },
  { id: 'fortress', element: 'metal' }
];

const ELEMENT_STYLES: Record<ElementId, { border: string; text: string; glow: string }> = {
  fire: {
    border: 'border-rose-400/40 hover:border-rose-300',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_26px_rgba(251,113,133,0.12)]'
  },
  water: {
    border: 'border-sky-400/40 hover:border-sky-300',
    text: 'text-sky-300',
    glow: 'shadow-[0_0_26px_rgba(56,189,248,0.12)]'
  },
  nature: {
    border: 'border-emerald-400/40 hover:border-emerald-300',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_26px_rgba(52,211,153,0.12)]'
  },
  metal: {
    border: 'border-slate-300/40 hover:border-slate-200',
    text: 'text-slate-200',
    glow: 'shadow-[0_0_26px_rgba(203,213,225,0.12)]'
  }
};

function EclipseGame({ onBack }: EclipseGameProps) {
  const [mode, setMode] = useState<EclipseMode>('duel');
  const [score, setScore] = useState<GameScore>(EMPTY_SCORE);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [energy, setEnergy] = useState(0);
  const [opponentCounts, setOpponentCounts] = useState<ElementCounts>(EMPTY_ELEMENT_COUNTS);
  const [armedPower, setArmedPower] = useState<PowerId | null>(null);
  const [showPowers, setShowPowers] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundContext = useRef<AudioContext | null>(null);
  const [pendingMove, setPendingMove] = useState<{ element: ElementId; count: number } | null>(
    null
  );
  const [lastRound, setLastRound] = useState<RoundResult | null>(null);

  const gameOver =
    mode === 'survival'
      ? lives <= 0
      : score.player >= WIN_TARGET || score.opponent >= WIN_TARGET;
  const playerWon = mode !== 'survival' && score.player >= WIN_TARGET;
  const totalOpponentMoves = useMemo(
    () => Object.values(opponentCounts).reduce((sum, count) => sum + count, 0),
    [opponentCounts]
  );
  const predictedElement = getTopOpponentElement(opponentCounts);
  const counterPrediction = predictedElement
    ? ELEMENTS.find((element) => element.beats === predictedElement)
    : null;

  const playSound = useCallback((kind: 'select' | 'win' | 'loss' | 'draw') => {
    if (!soundEnabled || typeof window.AudioContext === 'undefined') {
      return;
    }

    const context = soundContext.current ?? new window.AudioContext();
    soundContext.current = context;
    if (context.state === 'suspended') {
      void context.resume();
    }

    const frequencies = {
      select: 440,
      win: 660,
      loss: 220,
      draw: 330
    };
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[kind], now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.23);
  }, [soundEnabled]);

  useEffect(
    () => () => {
      if (soundContext.current && soundContext.current.state !== 'closed') {
        void soundContext.current.close();
      }
    },
    []
  );

  const resetGame = (nextMode: EclipseMode = mode) => {
    setMode(nextMode);
    setScore(EMPTY_SCORE);
    setLives(STARTING_LIVES);
    setEnergy(0);
    setOpponentCounts(EMPTY_ELEMENT_COUNTS);
    setArmedPower(null);
    setShowPowers(false);
    setPendingMove(null);
    setLastRound(null);
  };

  const resolveRound = useCallback((playerId: ElementId) => {
    const opponentId = getOpponentPick(opponentCounts);
    const playerElement = getElement(playerId);
    const rawOutcome = getEclipseOutcome(playerId, opponentId);
    let outcome = rawOutcome;
    let powerUsed: PowerId | null = null;
    let infernoBonus = 0;
    let predictionBonus = 0;
    let lifeChange = 0;

    if (armedPower === 'inferno' && playerId === 'fire') {
      powerUsed = 'inferno';
      infernoBonus = outcome === 'win' ? 1 : 0;
    } else if (armedPower === 'reversal') {
      powerUsed = 'reversal';
      if (outcome === 'loss') {
        outcome = 'draw';
      }
    } else if (armedPower === 'fortress') {
      powerUsed = 'fortress';
      if (outcome === 'loss') {
        outcome = 'draw';
      }
    }

    if (
      mode === 'mind' &&
      predictedElement === opponentId &&
      playerElement.beats === opponentId
    ) {
      predictionBonus = 1;
    }

    if (outcome === 'loss' && mode === 'survival') {
      lifeChange = -1;
    }

    const pointsEarned =
      (outcome === 'win' ? 1 : 0) + infernoBonus + predictionBonus;
    const energyEarned = outcome === 'win' ? 1 : 0;
    const nextCounts = { ...opponentCounts, [opponentId]: opponentCounts[opponentId] + 1 };
    const nextLives = Math.max(0, Math.min(STARTING_LIVES, lives + lifeChange));

    setScore((current) => ({
      player: current.player + pointsEarned,
      opponent: current.opponent + Number(outcome === 'loss'),
      draws: current.draws + Number(outcome === 'draw'),
      rounds: current.rounds + 1
    }));
    setLives(nextLives);
    setEnergy((current) => current + energyEarned);
    setOpponentCounts(nextCounts);

    if (powerUsed) {
      setArmedPower(null);
    }

    const resultText =
      outcome === 'draw'
        ? rawOutcome === 'loss'
          ? powerUsed === 'reversal'
            ? 'Aqua reversed the loss into a draw.'
            : 'Ferrum blocked the loss. It’s a draw.'
          : 'The elements meet as equals. It’s a draw.'
        : outcome === 'win'
          ? predictionBonus > 0
            ? 'A perfect read! You earn a bonus point.'
            : infernoBonus > 0
              ? 'Inferno surges! Your win earns a bonus point.'
              : `${playerElement.name} prevails. You win the round.`
          : mode === 'survival'
            ? `${getElement(opponentId).name} prevails. You lose a life.`
            : `${getElement(opponentId).name} prevails. Your rival earns a point.`;

    setLastRound({
      player: playerId,
      opponent: opponentId,
      outcome,
      message: resultText
    });
    playSound(outcome);
  }, [armedPower, lives, mode, opponentCounts, predictedElement, playSound]);

  useEffect(() => {
    if (!pendingMove) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (pendingMove.count > 1) {
        setPendingMove((current) =>
          current ? { ...current, count: current.count - 1 } : null
        );
        return;
      }

      resolveRound(pendingMove.element);
      setPendingMove(null);
    }, 480);

    return () => window.clearTimeout(timer);
  }, [pendingMove, resolveRound]);

  const chooseElement = (element: ElementId) => {
    if (gameOver || pendingMove) {
      return;
    }

    playSound('select');
    setPendingMove({ element, count: 3 });
  };

  const activatePower = (powerId: PowerId | 'regrowth') => {
    if (energy < ENERGY_TO_UNLOCK || gameOver || pendingMove) {
      return;
    }

    if (powerId === 'regrowth') {
      if (mode === 'survival' && lives >= STARTING_LIVES) {
        return;
      }

      setEnergy((current) => current - ENERGY_TO_UNLOCK);
      if (mode === 'survival') {
        setLives((current) => Math.min(STARTING_LIVES, current + 1));
        setLastRound({
          player: 'nature',
          opponent: 'nature',
          outcome: 'draw',
          message: 'Regrowth restores one life.'
        });
      } else {
        setScore((current) => ({ ...current, player: current.player + 1 }));
        setLastRound({
          player: 'nature',
          opponent: 'nature',
          outcome: 'win',
          message: 'Regrowth restores your strength. +1 point.'
        });
      }
      setShowPowers(false);
      return;
    }

    setEnergy((current) => current - ENERGY_TO_UNLOCK);
    setArmedPower(powerId);
    setShowPowers(false);
  };

  const modeDescription =
    mode === 'duel'
      ? 'Be the first to five points.'
      : mode === 'survival'
        ? 'You have three lives. Wins earn Eclipse energy.'
        : 'Counter the opponent’s most-used element for a bonus point.';

  const statusText = gameOver
    ? mode === 'survival'
      ? `Your run lasted ${score.rounds} rounds.`
      : playerWon
        ? 'The eclipse is yours. You win!'
        : 'The forces prevail. Try another duel?'
    : pendingMove
      ? 'The forces are gathering…'
      : lastRound?.message ?? 'Choose an element to begin.';

  return (
    <main className="min-h-screen bg-[#111217] px-4 py-7 text-slate-100 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="mb-4 text-xs text-slate-400 transition hover:text-white"
            >
              ← Back to the other games
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-300">
              Four forces · Infinite possibilities
            </p>
            <h1 className="mt-1 font-serif text-4xl font-semibold tracking-[0.08em] text-white sm:text-5xl">
              ECLIPSE
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">{modeDescription}</p>
          </div>
          <div className="flex items-start gap-2">
            <button
              type="button"
              aria-pressed={soundEnabled}
              onClick={() => setSoundEnabled((current) => !current)}
              className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs text-slate-400 transition hover:text-white"
            >
              Sound {soundEnabled ? 'on' : 'off'}
            </button>
            <div className="hidden rounded-2xl border border-violet-300/15 bg-violet-300/[0.06] px-4 py-3 text-right sm:block">
              <p className="text-[10px] uppercase tracking-[0.18em] text-violet-200/70">
                Eclipse energy
              </p>
              <p className="mt-1 font-serif text-2xl text-violet-100">{energy}</p>
            </div>
          </div>
        </header>

        <nav aria-label="Eclipse game mode" className="mb-5 grid grid-cols-3 gap-2">
          {MODES.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={mode === option.id}
              onClick={() => resetGame(option.id)}
              className={`rounded-xl border px-3 py-3 text-left transition sm:px-4 ${
                mode === option.id
                  ? 'border-violet-300/40 bg-violet-300/10 text-white'
                  : 'border-white/[0.08] bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="mt-0.5 hidden text-[11px] text-slate-500 sm:block">
                {option.detail}
              </span>
            </button>
          ))}
        </nav>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(270px,0.8fr)]">
          <section className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#191a20] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.32)] sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/[0.06] blur-3xl" />

            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {mode === 'survival' ? 'Survival run' : 'First to five'}
                </p>
                <p className="mt-1 font-serif text-2xl text-white">
                  {mode === 'survival' ? `${lives} ${lives === 1 ? 'life' : 'lives'} left` : 'The duel'}
                </p>
              </div>
              {mode === 'survival' ? (
                <div className="flex gap-1.5" aria-label={`${lives} lives remaining`}>
                  {Array.from({ length: STARTING_LIVES }, (_, index) => (
                    <span
                      key={index}
                      className={`text-xl ${index < lives ? 'text-rose-300' : 'text-slate-700'}`}
                      aria-hidden="true"
                    >
                      ♥
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2">
                  <span className="text-center">
                    <span className="block text-[9px] uppercase tracking-[0.15em] text-slate-500">
                      You
                    </span>
                    <span className="font-serif text-xl text-white">{score.player}</span>
                  </span>
                  <span className="text-xs text-slate-600">:</span>
                  <span className="text-center">
                    <span className="block text-[9px] uppercase tracking-[0.15em] text-slate-500">
                      Rival
                    </span>
                    <span className="font-serif text-xl text-white">{score.opponent}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="relative my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-white/[0.07] bg-black/20 px-3 py-4 sm:px-5">
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">You</p>
                <div
                  key={`player-${score.rounds}`}
                  className={`mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-4xl sm:h-20 sm:w-20 sm:text-5xl ${lastRound ? ELEMENT_STYLES[lastRound.player].glow : ''}`}
                  data-reveal={lastRound ? 'player' : undefined}
                >
                  {pendingMove
                    ? '✦'
                    : lastRound
                      ? getElement(lastRound.player).symbol
                      : '？'}
                </div>
              </div>
              <div className="text-center">
                <span className="font-serif text-sm italic text-violet-200/70">versus</span>
                <p className="mt-1 text-[10px] text-slate-600">
                  {score.rounds} {score.rounds === 1 ? 'round' : 'rounds'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">Rival</p>
                <div
                  key={`opponent-${score.rounds}`}
                  className={`mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-4xl sm:h-20 sm:w-20 sm:text-5xl ${lastRound ? ELEMENT_STYLES[lastRound.opponent].glow : ''}`}
                  data-reveal={lastRound ? 'opponent' : undefined}
                >
                  {pendingMove
                    ? '✦'
                    : lastRound
                      ? getElement(lastRound.opponent).symbol
                      : '☾'}
                </div>
              </div>
              {pendingMove && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#111217]/90">
                  <span
                    key={pendingMove.count}
                    className="animate-eclipse-count font-serif text-5xl text-violet-100"
                    aria-live="polite"
                  >
                    {pendingMove.count}
                  </span>
                </div>
              )}
            </div>

            <div
              role="status"
              aria-live="polite"
              className={`relative rounded-xl border px-4 py-3 text-center text-sm ${
                gameOver
                  ? playerWon
                    ? 'border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-200'
                    : 'border-rose-300/25 bg-rose-300/[0.07] text-rose-200'
                  : 'border-white/[0.07] bg-white/[0.025] text-slate-300'
              }`}
            >
              {statusText}
            </div>

            <div className="relative mt-5 border-t border-white/[0.07] pt-5">
              <p className="mb-3 text-center font-serif text-lg text-slate-200">
                Choose your force
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {ELEMENTS.map((element) => {
                  const styles = ELEMENT_STYLES[element.id];
                  return (
                    <button
                      key={element.id}
                      type="button"
                      aria-label={`Choose ${element.title}`}
                      disabled={gameOver || pendingMove !== null}
                      onClick={() => chooseElement(element.id)}
                      className={`rounded-2xl border bg-black/20 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white/[0.045] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 sm:p-4 ${styles.border}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-3xl" aria-hidden="true">
                          {element.symbol}
                        </span>
                        <span>
                          <span className={`block text-[10px] uppercase tracking-[0.16em] ${styles.text}`}>
                            {element.name}
                          </span>
                          <span className="block text-sm font-medium text-slate-100">
                            {element.title}
                          </span>
                        </span>
                      </span>
                      <span className="mt-2 block text-[10px] leading-4 text-slate-500">
                        Beats {getElement(element.beats).title} · draws with{' '}
                        {getElement(element.drawsWith).title}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-600">
                        Power: {element.ability}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {gameOver && (
              <button
                type="button"
                onClick={() => resetGame()}
                className="relative mt-5 w-full rounded-xl bg-violet-300 px-4 py-3 text-sm font-semibold text-[#17151d] transition hover:bg-violet-200"
              >
                {mode === 'survival' ? 'Rise again' : 'Rematch'}
              </button>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-violet-200/10 bg-[#191a20] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-violet-200/70">
                    Eclipse energy
                  </p>
                  <p className="mt-1 font-serif text-3xl text-white">{energy}</p>
                </div>
                <span className="text-3xl" aria-hidden="true">✦</span>
              </div>
              <div
                className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]"
                role="progressbar"
                aria-label="Energy toward next power"
                aria-valuemin={0}
                aria-valuemax={ENERGY_TO_UNLOCK}
                aria-valuenow={energy % ENERGY_TO_UNLOCK}
              >
                <div
                  className="h-full rounded-full bg-violet-300 transition-all duration-500"
                  style={{ width: `${((energy % ENERGY_TO_UNLOCK) / ENERGY_TO_UNLOCK) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Win rounds to earn energy. Spend {ENERGY_TO_UNLOCK} to use a force power.
              </p>
              {armedPower && (
                <p className="mt-3 rounded-lg border border-violet-300/20 bg-violet-300/[0.07] px-3 py-2 text-xs text-violet-100">
                  {armedPower === 'inferno'
                    ? 'Inferno is ready. Choose Fire to unleash it.'
                    : armedPower === 'reversal'
                      ? 'Reversal is ready for your next choice.'
                      : 'Fortress is ready to block your next loss.'}
                </p>
              )}
              {energy >= ENERGY_TO_UNLOCK && !gameOver && (
                <button
                  type="button"
                  aria-expanded={showPowers}
                  onClick={() => setShowPowers((current) => !current)}
                  disabled={pendingMove !== null}
                  className="mt-4 w-full rounded-xl border border-violet-300/25 bg-violet-300/10 px-3 py-2.5 text-sm font-medium text-violet-100 transition hover:bg-violet-300/15 disabled:opacity-50"
                >
                  {showPowers ? 'Hide powers' : 'Choose a power · 3 energy'}
                </button>
              )}
              {showPowers && (
                <div className="mt-3 space-y-2">
                  {POWERS.map(({ id, element: elementId }) => {
                    const element = getElement(elementId);
                    const unusableRegrowth =
                      id === 'regrowth' && mode === 'survival' && lives >= STARTING_LIVES;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={unusableRegrowth}
                        onClick={() => activatePower(id)}
                        className="w-full rounded-xl border border-white/[0.08] bg-black/20 p-3 text-left transition hover:border-violet-200/30 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-semibold ${ELEMENT_STYLES[elementId].text}`}>
                            {element.symbol} {element.ability}
                          </span>
                          <span className="text-[10px] text-slate-600">{element.name}</span>
                        </span>
                        <span className="mt-1 block text-[11px] leading-4 text-slate-400">
                          {element.abilityDescription}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/[0.08] bg-[#191a20] p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Opponent intelligence
                  </p>
                  <p className="mt-1 font-serif text-lg text-slate-100">
                    {totalOpponentMoves === 0
                      ? 'The pattern is hidden'
                      : `${totalOpponentMoves} ${totalOpponentMoves === 1 ? 'move' : 'moves'} observed`}
                  </p>
                </div>
                {mode === 'mind' && (
                  <span className="rounded-full border border-amber-200/15 bg-amber-200/[0.06] px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-amber-100/80">
                    Mind Games
                  </span>
                )}
              </div>
              {ELEMENTS.map((element) => (
                <div key={element.id} className="mt-3">
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className={ELEMENT_STYLES[element.id].text}>
                      {element.symbol} {element.name}
                    </span>
                    <span className="text-slate-500">
                      {getElementFrequency(opponentCounts, element.id)}%
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        element.id === 'fire'
                          ? 'bg-rose-300'
                          : element.id === 'water'
                            ? 'bg-sky-300'
                            : element.id === 'nature'
                              ? 'bg-emerald-300'
                              : 'bg-slate-300'
                      }`}
                      style={{
                        width: `${getElementFrequency(opponentCounts, element.id)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 rounded-xl border border-white/[0.06] bg-black/20 p-3">
                {predictedElement && counterPrediction ? (
                  <p className="text-xs leading-5 text-slate-400">
                    Most-used move:{' '}
                    <span className={ELEMENT_STYLES[predictedElement].text}>
                      {getElement(predictedElement).name}
                    </span>
                    . Counter with{' '}
                    <span className={ELEMENT_STYLES[counterPrediction.id].text}>
                      {counterPrediction.name}
                    </span>
                    .
                    {mode === 'mind' && (
                      <span className="mt-1 block text-amber-100/80">
                        Read their next move correctly for a bonus point.
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-xs leading-5 text-slate-500">
                    Play a few rounds to reveal your rival’s habits.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.08] bg-[#191a20] p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                The elemental chart
              </p>
              <div className="mt-3 space-y-2">
                {ELEMENTS.map((element) => (
                  <p key={element.id} className="text-[11px] leading-5 text-slate-400">
                    <span className={ELEMENT_STYLES[element.id].text}>
                      {element.symbol} {element.name}
                    </span>{' '}
                    beats {getElement(element.beats).name}, loses to{' '}
                    {getElement(element.losesTo).name}, and draws with{' '}
                    {getElement(element.drawsWith).name}.
                  </p>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default EclipseGame;
