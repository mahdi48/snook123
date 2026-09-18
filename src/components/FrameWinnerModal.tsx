import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, ArrowLeft, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { Player } from '../types';
import { toPersianDigits, formatPersianScore } from '../utils/persian';
import { soundManager } from '../utils/audio';

interface FrameWinnerModalProps {
  isOpen: boolean;
  winner: Player | null;
  players: Player[];
  frameNumber: number;
  bestOfFrames: number;
  isMatchFinished: boolean;
  onNextFrame: () => void;
  onClose: () => void;
  onOpenMatchSummary: () => void;
}

export const FrameWinnerModal: React.FC<FrameWinnerModalProps> = ({
  isOpen,
  winner,
  players,
  frameNumber,
  bestOfFrames,
  isMatchFinished,
  onNextFrame,
  onClose,
  onOpenMatchSummary,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playFanfare();

      // Launch Confetti
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'],
        });
      } catch {
        // Fallback if canvas confetti fails
      }
    }
  }, [isOpen]);

  if (!isOpen || !winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl p-6 shadow-2xl text-center overflow-hidden"
        dir="rtl"
      >
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Trophy Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.5)] mb-4 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-1 text-amber-400 font-extrabold text-sm mb-1">
          <Sparkles className="w-4 h-4" />
          <span>{isMatchFinished ? 'پایان مسابقه و قهرمان نهایی' : `پایان فریم ${toPersianDigits(frameNumber)}`}</span>
          <Sparkles className="w-4 h-4" />
        </div>

        <h3 className="text-2xl font-black text-white mb-2">
          {winner.name} برنده شد!
        </h3>

        {/* Frame / Match Score status */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 my-4">
          <span className="text-xs text-slate-400 font-semibold block mb-2">
            نتیجه فریم‌های برده (از {toPersianDigits(bestOfFrames)} فریم)
          </span>
          <div className="flex items-center justify-center gap-4 text-xl font-black text-white">
            {players.map((p, idx) => (
              <React.Fragment key={p.id}>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400 font-normal">{p.name}</span>
                  <span className="text-2xl font-extrabold text-amber-400 mt-0.5">
                    {toPersianDigits(p.frameWins)}
                  </span>
                </div>
                {idx < players.length - 1 && (
                  <span className="text-slate-600 text-lg">-</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Current Frame Final Points */}
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-around text-xs">
            {players.map((p) => {
              const { text } = formatPersianScore(p.currentScore);
              return (
                <div key={p.id} className="text-slate-300">
                  <span className="text-slate-400">{p.name}: </span>
                  <span className="font-bold text-white">{text} امتیاز</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {!isMatchFinished ? (
            <button
              type="button"
              id="next-frame-confirm-btn"
              onClick={() => {
                soundManager.playClickSound();
                onNextFrame();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <span>شروع فریم بعدی</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundManager.playClickSound();
                onOpenMatchSummary();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-base shadow-lg shadow-amber-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <Award className="w-5 h-5" />
              <span>مشاهده کارنامه نهایی و اشتراک‌گذاری</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            مشاهده میز و بازگشت به فریم
          </button>
        </div>
      </div>
    </div>
  );
};
