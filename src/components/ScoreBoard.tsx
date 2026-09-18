import React from 'react';
import { Trophy, Flame, Target, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { Player } from '../types';
import { toPersianDigits, formatPersianScore, formatPercentage } from '../utils/persian';
import { soundManager } from '../utils/audio';

interface ScoreBoardProps {
  players: Player[];
  activePlayerIndex: number;
  onSelectActivePlayer: (index: number) => void;
  pointsOnTable: number;
  leaderScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  activePlayerIndex,
  onSelectActivePlayer,
  pointsOnTable,
  leaderScore,
}) => {
  // Sort players by score for ranking badges
  const sortedPlayersWithRanks = [...players]
    .map((p, originalIdx) => ({ player: p, originalIdx }))
    .sort((a, b) => {
      if (b.player.currentScore !== a.player.currentScore) {
        return b.player.currentScore - a.player.currentScore;
      }
      if (b.player.frameWins !== a.player.frameWins) {
        return b.player.frameWins - a.player.frameWins;
      }
      return b.player.matchHighestBreak - a.player.matchHighestBreak;
    });

  const rankMap = new Map<string, number>();
  sortedPlayersWithRanks.forEach((item, index) => {
    rankMap.set(item.player.id, index + 1);
  });

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded-full text-xs font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>رتبه ۱</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center gap-1 bg-slate-400/20 text-slate-300 border border-slate-400/40 px-2 py-0.5 rounded-full text-xs font-semibold">
            <span>رتبه ۲</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center gap-1 bg-amber-800/20 text-amber-600 border border-amber-700/40 px-2 py-0.5 rounded-full text-xs font-semibold">
            <span>رتبه ۳</span>
          </div>
        );
      default:
        return (
          <div className="text-slate-500 text-xs px-2 py-0.5 font-medium">
            رتبه {toPersianDigits(rank)}
          </div>
        );
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {players.map((player, idx) => {
        const isActive = idx === activePlayerIndex;
        const rank = rankMap.get(player.id) || 1;
        const { text: formattedScore, isNegative } = formatPersianScore(player.currentScore);
        const totalAttempts = player.potsCount + player.missesCount;
        const accuracy = formatPercentage(player.potsCount, totalAttempts);

        // Snookers needed calculation
        const deficit = leaderScore - player.currentScore;
        const snookersNeeded =
          deficit > pointsOnTable ? Math.ceil((deficit - pointsOnTable) / 4) : 0;

        return (
          <div
            key={player.id}
            id={`player-card-${player.id}`}
            onClick={() => {
              if (!isActive) {
                soundManager.playTurnSound();
                onSelectActivePlayer(idx);
              }
            }}
            className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-200 border cursor-pointer ${
              isActive
                ? 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900/90 border-emerald-500/80 shadow-[0_0_24px_rgba(16,185,129,0.22)] ring-2 ring-emerald-500/40'
                : 'bg-slate-900/70 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700/80'
            }`}
          >
            {/* Active Cue Glow bar across top edge */}
            {isActive && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />
            )}

            {/* Header: Player Name, Color Dot, Rank, Active Turn Tag */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 shrink-0"
                  style={{ backgroundColor: player.color || '#10b981' }}
                />
                <h2 className="text-base sm:text-lg font-bold text-white truncate">
                  {player.name}
                </h2>
                {isActive && (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md text-xs font-semibold shrink-0 animate-pulse">
                    <UserCheck className="w-3 h-3 text-emerald-400" />
                    <span>نوبت بازی</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {getRankBadge(rank)}
              </div>
            </div>

            {/* Main Score Display */}
            <div className="flex items-baseline justify-between py-2 border-y border-slate-800/60 my-2">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-400">امتیاز فریم جاری</span>
                {/* Break in-progress indicator */}
                {isActive && player.currentBreak > 0 && (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    <Flame className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                    <span>بریک جاری: +{toPersianDigits(player.currentBreak)}</span>
                  </div>
                )}
              </div>

              {/* Big Numerical Score with explicit negative handling */}
              <div className="flex items-center gap-1">
                <span
                  className={`text-4xl sm:text-5xl font-black tracking-tight ${
                    isNegative
                      ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                      : 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]'
                  }`}
                  dir="ltr"
                >
                  {formattedScore}
                </span>
                {isNegative && (
                  <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded text-center font-bold">
                    منفی
                  </span>
                )}
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-4 gap-1.5 text-center mt-3 pt-1">
              <div className="bg-slate-800/40 rounded-lg p-1.5 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 font-medium">فریم‌های برده</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  {toPersianDigits(player.frameWins)}
                </div>
              </div>

              <div className="bg-slate-800/40 rounded-lg p-1.5 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 font-medium">بیشترین بریک</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">
                  {toPersianDigits(player.matchHighestBreak || player.highestBreakInFrame || 0)}
                </div>
              </div>

              <div className="bg-slate-800/40 rounded-lg p-1.5 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 font-medium">دقت پاکت</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5 flex items-center justify-center gap-0.5">
                  <Target className="w-3 h-3 text-sky-400/80" />
                  <span>{accuracy}</span>
                </div>
              </div>

              <div className="bg-slate-800/40 rounded-lg p-1.5 border border-slate-800/60">
                <div className="text-[11px] text-slate-400 font-medium">خطا و عدم‌پاکت</div>
                <div className="text-sm font-bold text-rose-400 mt-0.5">
                  {toPersianDigits(player.missesCount + player.foulsCount)}
                </div>
              </div>
            </div>

            {/* Snookers Required Notice */}
            {snookersNeeded > 0 && (
              <div className="mt-2.5 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1 text-xs text-amber-300">
                <div className="flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>نیاز به اسنوکر (اختلاف {toPersianDigits(deficit)} امتیاز)</span>
                </div>
                <span className="bg-amber-500/20 px-2 py-0.5 rounded font-bold text-amber-200">
                  {toPersianDigits(snookersNeeded)} اسنوکر
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
