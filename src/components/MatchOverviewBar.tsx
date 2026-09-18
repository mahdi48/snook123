import React from 'react';
import { Plus, Minus, Hash, CircleDot, AlertCircle, Award } from 'lucide-react';
import { toPersianDigits } from '../utils/persian';
import { soundManager } from '../utils/audio';

interface MatchOverviewBarProps {
  remainingReds: number;
  totalReds: number;
  pointsOnTable: number;
  currentFrameNumber: number;
  bestOfFrames: number;
  scoreDifference: number;
  leaderName: string;
  snookersRequired: number;
  onIncrementReds: () => void;
  onDecrementReds: () => void;
}

export const MatchOverviewBar: React.FC<MatchOverviewBarProps> = ({
  remainingReds,
  totalReds,
  pointsOnTable,
  currentFrameNumber,
  bestOfFrames,
  scoreDifference,
  leaderName,
  snookersRequired,
  onIncrementReds,
  onDecrementReds,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-md backdrop-blur-md">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
        {/* Remaining Red Balls Counter */}
        <div className="flex items-center justify-between bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">قرمزهای باقی‌مانده</span>
              <span className="text-base font-bold text-white">
                {toPersianDigits(remainingReds)} / {toPersianDigits(totalReds)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                soundManager.playClickSound();
                onDecrementReds();
              }}
              disabled={remainingReds <= 0}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              aria-label="کاهش توپ قرمز"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playClickSound();
                onIncrementReds();
              }}
              disabled={remainingReds >= totalReds}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              aria-label="افزایش توپ قرمز"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Remaining Points On Table */}
        <div className="flex items-center gap-2.5 bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CircleDot className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">امتیاز باقی روی میز</span>
            <span className="text-base font-bold text-emerald-400">
              {toPersianDigits(pointsOnTable)} امتیاز
            </span>
          </div>
        </div>

        {/* Frame Progress (e.g., Frame 1 of 5) */}
        <div className="flex items-center gap-2.5 bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">وضعیت مسابقه</span>
            <span className="text-sm font-bold text-amber-300">
              فریم {toPersianDigits(currentFrameNumber)} (از {toPersianDigits(bestOfFrames)})
            </span>
          </div>
        </div>

        {/* Score Gap / Snookers Required Status */}
        <div className="flex items-center gap-2.5 bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-700/50">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              snookersRequired > 0
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
            }`}
          >
            {snookersRequired > 0 ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Hash className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">
              {snookersRequired > 0 ? 'نیاز به اسنوکر' : 'اختلاف امتیاز'}
            </span>
            <span
              className={`text-sm font-bold truncate ${
                snookersRequired > 0 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {snookersRequired > 0
                ? `${toPersianDigits(snookersRequired)} اسنوکر (${toPersianDigits(scoreDifference)} پ)`
                : scoreDifference > 0
                ? `${toPersianDigits(scoreDifference)} امتیاز (${leaderName})`
                : 'برابر'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
