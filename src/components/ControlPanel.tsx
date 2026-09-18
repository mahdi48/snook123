import React from 'react';
import { CheckCircle2, XCircle, AlertOctagon, RotateCcw, ArrowRightLeft, Flag } from 'lucide-react';
import { ActionMode, BallConfig } from '../types';
import { SnookerBallButton } from './SnookerBallButton';
import { soundManager } from '../utils/audio';

interface ControlPanelProps {
  actionMode: ActionMode;
  onChangeActionMode: (mode: ActionMode) => void;
  balls: BallConfig[];
  onBallClick: (ball: BallConfig) => void;
  onOpenFoulModal: () => void;
  onNextTurn: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onFinishFrame: () => void;
  remainingReds: number;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  actionMode,
  onChangeActionMode,
  balls,
  onBallClick,
  onOpenFoulModal,
  onNextTurn,
  onUndo,
  canUndo,
  onFinishFrame,
  remainingReds,
}) => {
  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
      {/* 3 Mode Toggles */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        {/* Pot (+) Mode */}
        <button
          type="button"
          id="mode-pot-btn"
          onClick={() => {
            soundManager.playClickSound();
            onChangeActionMode('pot');
          }}
          className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-150 cursor-pointer ${
            actionMode === 'pot'
              ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/50 scale-[1.02]'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
          <span>پاکت (+)</span>
        </button>

        {/* Miss (-) Mode */}
        <button
          type="button"
          id="mode-miss-btn"
          onClick={() => {
            soundManager.playClickSound();
            onChangeActionMode('miss');
          }}
          className={`flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-150 cursor-pointer ${
            actionMode === 'miss'
              ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.35)] ring-2 ring-rose-400/50 scale-[1.02]'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
          }`}
        >
          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
          <span>عدم پاکت (-)</span>
        </button>

        {/* Foul Mode Button */}
        <button
          type="button"
          id="mode-foul-btn"
          onClick={() => {
            soundManager.playFoulSound();
            onOpenFoulModal();
          }}
          className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl font-bold text-sm sm:text-base bg-amber-600/90 hover:bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)] border border-amber-500/50 active:scale-95 transition-all cursor-pointer"
        >
          <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
          <span>ثبت خطا (Foul)</span>
        </button>
      </div>

      {/* 7 Tactile 3D Billiard Balls Grid */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 sm:p-4 mb-4 shadow-inner">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-slate-400">
            {actionMode === 'pot'
              ? 'توپ پاکت‌شده را انتخاب کنید:'
              : 'توپ از دست رفته (کسر امتیاز):'}
          </span>
          <span className="text-xs text-emerald-400 font-medium">
            {remainingReds === 0 ? 'فاز رنگ‌ها (Endgame)' : `توپ قرمز باقی‌مانده: ${remainingReds}`}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3 place-items-center">
          {balls.map((ball) => {
            const isRedDisabled = ball.id === 'red' && remainingReds <= 0 && actionMode === 'pot';
            return (
              <SnookerBallButton
                key={ball.id}
                ball={ball}
                actionMode={actionMode}
                disabled={isRedDisabled}
                onClick={onBallClick}
              />
            );
          })}
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Next Turn */}
        <button
          type="button"
          id="next-turn-btn"
          onClick={() => {
            soundManager.playTurnSound();
            onNextTurn();
          }}
          className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-3 rounded-xl font-bold text-sm sm:text-base bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-lg border border-indigo-500/40 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>نوبت بعدی ➔</span>
        </button>

        {/* Undo */}
        <button
          type="button"
          id="undo-btn"
          onClick={() => {
            soundManager.playClickSound();
            onUndo();
          }}
          disabled={!canUndo}
          className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-3 rounded-xl font-semibold text-sm sm:text-base bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>بازگشت (Undo)</span>
        </button>

        {/* Finish Frame */}
        <button
          type="button"
          id="finish-frame-btn"
          onClick={() => {
            soundManager.playClickSound();
            onFinishFrame();
          }}
          className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-3 rounded-xl font-bold text-sm sm:text-base bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-600/40 active:scale-95 transition-all cursor-pointer"
        >
          <Flag className="w-4 h-4 text-emerald-300" />
          <span>پایان فریم</span>
        </button>
      </div>
    </div>
  );
};
