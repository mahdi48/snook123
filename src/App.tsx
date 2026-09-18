import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Trophy,
  Settings as SettingsIcon,
  Users,
  FileText,
  Volume2,
  VolumeX,
  RotateCcw,
  Smartphone,
  Sparkles,
  History,
  CircleDot,
  Share2,
} from 'lucide-react';
import {
  Player,
  BallConfig,
  ActionMode,
  MatchSettings,
  ActionHistorySnapshot,
  FoulPenaltyAction,
} from './types';
import {
  getBallConfigs,
  calculateRemainingPointsOnTable,
  calculateSnookersRequired,
} from './utils/snookerCalc';
import { soundManager } from './utils/audio';
import { toPersianDigits } from './utils/persian';

import { ScoreBoard } from './components/ScoreBoard';
import { MatchOverviewBar } from './components/MatchOverviewBar';
import { ControlPanel } from './components/ControlPanel';
import { FoulModal } from './components/FoulModal';
import { SettingsModal } from './components/SettingsModal';
import { PlayerModal } from './components/PlayerModal';
import { FrameWinnerModal } from './components/FrameWinnerModal';
import { MatchSummaryModal } from './components/MatchSummaryModal';
import { AndroidBuildModal } from './components/AndroidBuildModal';

const STORAGE_KEY = 'snooker_pro_match_data_v1';

const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'بازیکن ۱ (حسین)',
    currentScore: 0,
    frameWins: 0,
    currentBreak: 0,
    highestBreakInFrame: 0,
    matchHighestBreak: 0,
    potsCount: 0,
    missesCount: 0,
    foulsCount: 0,
    color: '#10b981',
  },
  {
    id: 'p2',
    name: 'بازیکن ۲ (علی)',
    currentScore: 0,
    frameWins: 0,
    currentBreak: 0,
    highestBreakInFrame: 0,
    matchHighestBreak: 0,
    potsCount: 0,
    missesCount: 0,
    foulsCount: 0,
    color: '#3b82f6',
  },
];

const INITIAL_SETTINGS: MatchSettings = {
  redPoints: 10, // Default requested +10, switchable to official +1
  totalReds: 15,
  bestOfFrames: 5,
  foulRule: 'awardOpponent',
  soundEnabled: true,
  hapticEnabled: true,
};

export default function App() {
  // State initialization with localStorage fallback
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_players`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_PLAYERS;
  });

  const [settings, setSettings] = useState<MatchSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_SETTINGS;
  });

  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activeIdx`);
      if (saved) return parseInt(saved, 10) || 0;
    } catch {
      // Fallback
    }
    return 0;
  });

  const [remainingReds, setRemainingReds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_reds`);
      if (saved !== null) return parseInt(saved, 10);
    } catch {
      // Fallback
    }
    return INITIAL_SETTINGS.totalReds;
  });

  const [currentFrameNumber, setCurrentFrameNumber] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_frameNum`);
      if (saved) return parseInt(saved, 10) || 1;
    } catch {
      // Fallback
    }
    return 1;
  });

  const [history, setHistory] = useState<ActionHistorySnapshot[]>([]);
  const [actionMode, setActionMode] = useState<ActionMode>('pot');

  // Modals state
  const [isFoulModalOpen, setIsFoulModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isFrameWinnerModalOpen, setIsFrameWinnerModalOpen] = useState<boolean>(false);
  const [frameWinner, setFrameWinner] = useState<Player | null>(null);
  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);

  // Sync settings with audio manager
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
    soundManager.setHapticEnabled(settings.hapticEnabled);
  }, [settings.soundEnabled, settings.hapticEnabled]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_players`, JSON.stringify(players));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_activeIdx`, activePlayerIndex.toString());
      localStorage.setItem(`${STORAGE_KEY}_reds`, remainingReds.toString());
      localStorage.setItem(`${STORAGE_KEY}_frameNum`, currentFrameNumber.toString());
    } catch {
      // Ignore storage write issues
    }
  }, [players, settings, activePlayerIndex, remainingReds, currentFrameNumber]);

  // Ball configurations dynamically tailored by red points
  const balls = useMemo(() => getBallConfigs(settings.redPoints), [settings.redPoints]);

  // Remaining Points on Table calculation
  const pointsOnTable = useMemo(
    () => calculateRemainingPointsOnTable(remainingReds, settings.redPoints),
    [remainingReds, settings.redPoints]
  );

  // Leader calculations
  const leader = useMemo(() => {
    return [...players].reduce((prev, curr) =>
      curr.currentScore > prev.currentScore ? curr : prev, players[0]
    );
  }, [players]);

  const secondLeaderScore = useMemo(() => {
    if (players.length < 2) return 0;
    const sorted = [...players].sort((a, b) => b.currentScore - a.currentScore);
    return sorted[1]?.currentScore || 0;
  }, [players]);

  const scoreDifference = useMemo(() => {
    return leader.currentScore - secondLeaderScore;
  }, [leader, secondLeaderScore]);

  // Snookers required for active player
  const activePlayer = players[activePlayerIndex] || players[0];
  const { snookersNeeded } = useMemo(() => {
    return calculateSnookersRequired(leader.currentScore, activePlayer.currentScore, pointsOnTable);
  }, [leader.currentScore, activePlayer.currentScore, pointsOnTable]);

  // Snapshot recording for undo capability
  const saveSnapshot = useCallback(
    (actionDescription: string) => {
      setHistory((prev) => {
        const snap: ActionHistorySnapshot = {
          players: JSON.parse(JSON.stringify(players)),
          activePlayerIndex,
          remainingReds,
          currentFrameNumber,
          actionDescriptionFa: actionDescription,
          timestamp: Date.now(),
        };
        // Keep max 40 actions
        return [snap, ...prev.slice(0, 39)];
      });
    },
    [players, activePlayerIndex, remainingReds, currentFrameNumber]
  );

  // Undo action
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const [lastSnap, ...rest] = history;
    setPlayers(lastSnap.players);
    setActivePlayerIndex(lastSnap.activePlayerIndex);
    setRemainingReds(lastSnap.remainingReds);
    setCurrentFrameNumber(lastSnap.currentFrameNumber);
    setHistory(rest);
  }, [history]);

  // Next Turn / switch active player
  const handleNextTurn = useCallback(() => {
    saveSnapshot(`پایان نوبت ${activePlayer.name}`);
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === activePlayerIndex) {
          // Finalize current break
          const updatedBreakInFrame = Math.max(p.highestBreakInFrame, p.currentBreak);
          const updatedMatchBreak = Math.max(p.matchHighestBreak, p.currentBreak);
          return {
            ...p,
            currentBreak: 0,
            highestBreakInFrame: updatedBreakInFrame,
            matchHighestBreak: updatedMatchBreak,
          };
        }
        return p;
      })
    );
    setActivePlayerIndex((prev) => (prev + 1) % players.length);
  }, [activePlayer, activePlayerIndex, players.length, saveSnapshot]);

  // Handle Ball Click (Pot (+) or Miss (-))
  const handleBallClick = useCallback(
    (ball: BallConfig) => {
      const isPot = actionMode === 'pot';
      const isRed = ball.id === 'red';

      if (isPot) {
        saveSnapshot(`پاکت ${ball.nameFa} (+${ball.points}) توسط ${activePlayer.name}`);

        setPlayers((prev) =>
          prev.map((p, idx) => {
            if (idx === activePlayerIndex) {
              const newScore = p.currentScore + ball.points;
              const newBreak = p.currentBreak + ball.points;
              const newFrameBreak = Math.max(p.highestBreakInFrame, newBreak);
              const newMatchBreak = Math.max(p.matchHighestBreak, newBreak);

              // Fanfare for high break or century break
              if (newBreak >= 50 && newBreak - ball.points < 50) {
                soundManager.playFanfare();
              } else if (newBreak >= 100 && newBreak - ball.points < 100) {
                soundManager.playFanfare();
              }

              return {
                ...p,
                currentScore: newScore,
                currentBreak: newBreak,
                highestBreakInFrame: newFrameBreak,
                matchHighestBreak: newMatchBreak,
                potsCount: p.potsCount + 1,
              };
            }
            return p;
          })
        );

        // If a red ball was potted, decrement remaining reds
        if (isRed && remainingReds > 0) {
          setRemainingReds((prev) => Math.max(0, prev - 1));
        }
      } else {
        // Miss (-) Mode: deduct points from active player and switch turn
        // Support negative scores: 0 - 10 = -10, then -10 + 10 = 0!
        saveSnapshot(`عدم پاکت ${ball.nameFa} (-${ball.points}) توسط ${activePlayer.name}`);

        setPlayers((prev) =>
          prev.map((p, idx) => {
            if (idx === activePlayerIndex) {
              const newScore = p.currentScore - ball.points;
              const newFrameBreak = Math.max(p.highestBreakInFrame, p.currentBreak);
              const newMatchBreak = Math.max(p.matchHighestBreak, p.currentBreak);

              return {
                ...p,
                currentScore: newScore, // negative score supported!
                currentBreak: 0,
                highestBreakInFrame: newFrameBreak,
                matchHighestBreak: newMatchBreak,
                missesCount: p.missesCount + 1,
              };
            }
            return p;
          })
        );

        // Switch turn automatically on miss
        setActivePlayerIndex((prev) => (prev + 1) % players.length);
        // Switch back to Pot mode for next turn
        setActionMode('pot');
      }
    },
    [actionMode, activePlayer, activePlayerIndex, players.length, remainingReds, saveSnapshot]
  );

  // Apply Foul from Modal
  const handleApplyFoul = useCallback(
    ({
      offendingPlayerIndex,
      penaltyPoints,
      reasonTitle,
      penaltyAction,
      switchTurn,
    }: {
      offendingPlayerIndex: number;
      penaltyPoints: number;
      reasonTitle: string;
      penaltyAction: FoulPenaltyAction;
      switchTurn: boolean;
    }) => {
      const offender = players[offendingPlayerIndex];
      saveSnapshot(`خطای ${reasonTitle} (${penaltyPoints} امتیاز) توسط ${offender.name}`);

      setPlayers((prev) =>
        prev.map((p, idx) => {
          let updatedScore = p.currentScore;
          let updatedFouls = p.foulsCount;

          if (idx === offendingPlayerIndex) {
            updatedFouls += 1;
            if (penaltyAction === 'deductPlayer' || penaltyAction === 'both') {
              // Deduct points from offender (support negative numbers)
              updatedScore -= penaltyPoints;
            }
            return {
              ...p,
              currentScore: updatedScore,
              currentBreak: 0,
              highestBreakInFrame: Math.max(p.highestBreakInFrame, p.currentBreak),
              matchHighestBreak: Math.max(p.matchHighestBreak, p.currentBreak),
              foulsCount: updatedFouls,
            };
          } else {
            // Opponent(s)
            if (penaltyAction === 'awardOpponent' || penaltyAction === 'both') {
              updatedScore += penaltyPoints;
            }
            return {
              ...p,
              currentScore: updatedScore,
            };
          }
        })
      );

      if (switchTurn) {
        setActivePlayerIndex((prev) => (prev + 1) % players.length);
      }
    },
    [players, saveSnapshot]
  );

  // Finish Frame
  const handleFinishFrame = useCallback(() => {
    // Determine frame winner
    const topScorer = [...players].reduce((prev, curr) =>
      curr.currentScore > prev.currentScore ? curr : prev, players[0]
    );

    setFrameWinner(topScorer);

    // Increment frame wins for winner
    const targetWins = Math.ceil(settings.bestOfFrames / 2);
    const updatedWins = topScorer.frameWins + 1;
    const matchWon = updatedWins >= targetWins;

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === topScorer.id) {
          return {
            ...p,
            frameWins: p.frameWins + 1,
            highestBreakInFrame: Math.max(p.highestBreakInFrame, p.currentBreak),
            matchHighestBreak: Math.max(p.matchHighestBreak, p.currentBreak),
            currentBreak: 0,
          };
        }
        return {
          ...p,
          highestBreakInFrame: Math.max(p.highestBreakInFrame, p.currentBreak),
          matchHighestBreak: Math.max(p.matchHighestBreak, p.currentBreak),
          currentBreak: 0,
        };
      })
    );

    setIsMatchFinished(matchWon);
    setIsFrameWinnerModalOpen(true);
  }, [players, settings.bestOfFrames]);

  // Start Next Frame
  const handleStartNextFrame = useCallback(() => {
    saveSnapshot(`شروع فریم ${currentFrameNumber + 1}`);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        currentScore: 0,
        currentBreak: 0,
        highestBreakInFrame: 0,
      }))
    );
    setRemainingReds(settings.totalReds);
    setCurrentFrameNumber((prev) => prev + 1);
    setActivePlayerIndex(0);
    setIsFrameWinnerModalOpen(false);
    setActionMode('pot');
  }, [currentFrameNumber, saveSnapshot, settings.totalReds]);

  // Reset Current Frame only
  const handleResetCurrentFrame = useCallback(() => {
    saveSnapshot(`بازنشانی فریم ${currentFrameNumber}`);
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        currentScore: 0,
        currentBreak: 0,
        highestBreakInFrame: 0,
      }))
    );
    setRemainingReds(settings.totalReds);
    setActionMode('pot');
  }, [currentFrameNumber, saveSnapshot, settings.totalReds]);

  // Reset Full Match
  const handleResetFullMatch = useCallback(() => {
    setPlayers(
      INITIAL_PLAYERS.map((p) => ({
        ...p,
        currentScore: 0,
        frameWins: 0,
        currentBreak: 0,
        highestBreakInFrame: 0,
        matchHighestBreak: 0,
        potsCount: 0,
        missesCount: 0,
        foulsCount: 0,
      }))
    );
    setRemainingReds(settings.totalReds);
    setCurrentFrameNumber(1);
    setActivePlayerIndex(0);
    setHistory([]);
    setIsMatchFinished(false);
    setFrameWinner(null);
    setActionMode('pot');
  }, [settings.totalReds]);

  // Quick increment/decrement red balls
  const handleIncrementReds = useCallback(() => {
    setRemainingReds((prev) => Math.min(settings.totalReds, prev + 1));
  }, [settings.totalReds]);

  const handleDecrementReds = useCallback(() => {
    setRemainingReds((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <div
      className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center select-none"
      dir="rtl"
    >
      {/* Top App Bar with Persian Brand & Navigation */}
      <header className="w-full max-w-5xl px-3 sm:px-6 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-lg sticky top-0 z-30">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center font-black text-emerald-400 text-sm">
              🎱
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              <span>اسنوکر پرو</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded-full font-bold">
                نسخه مسابقاتی
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">داوری حرفه‌ای و لیدربورد زنده</p>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            id="header-sound-btn"
            onClick={() => {
              const next = !settings.soundEnabled;
              soundManager.setSoundEnabled(next);
              setSettings((prev) => ({ ...prev, soundEnabled: next }));
              if (next) soundManager.playClickSound();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={settings.soundEnabled ? 'قطع صدا' : 'وصل صدا'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Players Modal */}
          <button
            type="button"
            id="header-players-btn"
            onClick={() => {
              soundManager.playClickSound();
              setIsPlayerModalOpen(true);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="مدیریت بازیکنان"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* Match Summary */}
          <button
            type="button"
            id="header-summary-btn"
            onClick={() => {
              soundManager.playClickSound();
              setIsSummaryModalOpen(true);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="کارنامه و اشتراک‌گذاری"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* Android APK Button */}
          <button
            type="button"
            id="header-apk-btn"
            onClick={() => {
              soundManager.playClickSound();
              setIsAndroidModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            title="راهنمای دریافت فایل APK و نصب اندروید"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline sm:inline">دریافت APK</span>
            <span className="xs:hidden sm:hidden">APK</span>
          </button>

          {/* Settings Modal */}
          <button
            type="button"
            id="header-settings-btn"
            onClick={() => {
              soundManager.playClickSound();
              setIsSettingsModalOpen(true);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="تنظیمات"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-5xl px-3 sm:px-6 py-3 space-y-3.5 flex-1 pb-16">
        {/* Match Overview Bar */}
        <MatchOverviewBar
          remainingReds={remainingReds}
          totalReds={settings.totalReds}
          pointsOnTable={pointsOnTable}
          currentFrameNumber={currentFrameNumber}
          bestOfFrames={settings.bestOfFrames}
          scoreDifference={scoreDifference}
          leaderName={leader.name}
          snookersRequired={snookersNeeded}
          onIncrementReds={handleIncrementReds}
          onDecrementReds={handleDecrementReds}
        />

        {/* Live Dynamic Leaderboard & Scoreboard */}
        <ScoreBoard
          players={players}
          activePlayerIndex={activePlayerIndex}
          onSelectActivePlayer={(idx) => {
            saveSnapshot(`انتخاب ${players[idx].name} به عنوان بازیکن نوبت`);
            setActivePlayerIndex(idx);
          }}
          pointsOnTable={pointsOnTable}
          leaderScore={leader.currentScore}
        />

        {/* Interactive Control Panel with 3D Balls */}
        <ControlPanel
          actionMode={actionMode}
          onChangeActionMode={setActionMode}
          balls={balls}
          onBallClick={handleBallClick}
          onOpenFoulModal={() => setIsFoulModalOpen(true)}
          onNextTurn={handleNextTurn}
          onUndo={handleUndo}
          canUndo={history.length > 0}
          onFinishFrame={handleFinishFrame}
          remainingReds={remainingReds}
        />

        {/* Recent History Accordion Drawer */}
        <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span>تاریخچه ضربات اخیر ({toPersianDigits(history.length)} حرکت)</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">
              {showHistoryDrawer ? 'بستن ▲' : 'مشاهده ▼'}
            </span>
          </button>

          {showHistoryDrawer && (
            <div className="p-3 pt-0 border-t border-slate-800/80 max-h-48 overflow-y-auto space-y-1.5">
              {history.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-3">
                  هنوز ضربه‌ای ثبت نشده است. با کلیک روی توپ‌ها شروع کنید.
                </p>
              ) : (
                history.map((snap, i) => (
                  <div
                    key={snap.timestamp + i}
                    className="flex items-center justify-between bg-slate-950/60 px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <span className="text-slate-300 font-medium">{snap.actionDescriptionFa}</span>
                    <span className="text-[10px] text-slate-500">حرکت #{toPersianDigits(history.length - i)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <FoulModal
        isOpen={isFoulModalOpen}
        onClose={() => setIsFoulModalOpen(false)}
        players={players}
        activePlayerIndex={activePlayerIndex}
        onApplyFoul={handleApplyFoul}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onResetCurrentFrame={handleResetCurrentFrame}
        onResetFullMatch={handleResetFullMatch}
        onOpenAndroidGuide={() => {
          setIsSettingsModalOpen(false);
          setIsAndroidModalOpen(true);
        }}
      />

      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        players={players}
        onSavePlayers={(updated) => setPlayers(updated)}
      />

      <FrameWinnerModal
        isOpen={isFrameWinnerModalOpen}
        winner={frameWinner}
        players={players}
        frameNumber={currentFrameNumber}
        bestOfFrames={settings.bestOfFrames}
        isMatchFinished={isMatchFinished}
        onNextFrame={handleStartNextFrame}
        onClose={() => setIsFrameWinnerModalOpen(false)}
        onOpenMatchSummary={() => setIsSummaryModalOpen(true)}
      />

      <MatchSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        players={players}
        currentFrameNumber={currentFrameNumber}
        settings={settings}
        winner={frameWinner}
      />

      <AndroidBuildModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
}
