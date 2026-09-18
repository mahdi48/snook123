import React, { useState } from 'react';
import { X, Trophy, Share2, Copy, Check, FileText } from 'lucide-react';
import { Player, MatchSettings } from '../types';
import { toPersianDigits, formatPercentage } from '../utils/persian';
import { soundManager } from '../utils/audio';

interface MatchSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  currentFrameNumber: number;
  settings: MatchSettings;
  winner: Player | null;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  isOpen,
  onClose,
  players,
  currentFrameNumber,
  settings,
  winner,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateSummaryText = () => {
    let text = `🎱 نتیجه مسابقه اسنوکر (اسنوکر پرو):\n`;
    if (winner) {
      text += `🏆 قهرمان: ${winner.name} (برد ${toPersianDigits(winner.frameWins)} فریم از ${toPersianDigits(settings.bestOfFrames)})\n\n`;
    } else {
      text += `⏱ فریم جاری: ${toPersianDigits(currentFrameNumber)} (از ${toPersianDigits(settings.bestOfFrames)} فریم)\n\n`;
    }

    text += `📊 نتایج بازیکنان:\n`;
    players.forEach((p, idx) => {
      const total = p.potsCount + p.missesCount;
      const acc = formatPercentage(p.potsCount, total);
      text += `${idx + 1}. ${p.name} | فریم‌های برده: ${toPersianDigits(p.frameWins)} | بیشترین بریک: ${toPersianDigits(p.matchHighestBreak)} | دقت پاکت: ${acc}\n`;
    });

    text += `\n📱 ثبت شده توسط نرم‌افزار اسنوکر پرو`;
    return text;
  };

  const handleCopy = async () => {
    soundManager.playClickSound();
    const text = generateSummaryText();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    soundManager.playClickSound();
    const text = generateSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'کارنامه مسابقه اسنوکر',
          text,
        });
      } catch {
        // User canceled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">کارنامه و آمار نهایی مسابقه</h3>
              <p className="text-xs text-slate-400">خلاصه کامل عملکرد بازیکنان و اشتراک‌گذاری</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-1">
          {winner && (
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 rounded-2xl p-3.5 text-center">
              <span className="text-xs font-semibold text-amber-300">برنده کل مسابقه:</span>
              <h4 className="text-xl font-black text-white mt-0.5">{winner.name}</h4>
              <span className="text-xs text-slate-300 mt-1 block">
                مجموع فریم‌های برده: {toPersianDigits(winner.frameWins)} از {toPersianDigits(settings.bestOfFrames)}
              </span>
            </div>
          )}

          {/* Players Statistics Cards */}
          <div className="space-y-3">
            {players.map((player) => {
              const total = player.potsCount + player.missesCount;
              const accuracy = formatPercentage(player.potsCount, total);
              return (
                <div
                  key={player.id}
                  className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-3.5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: player.color || '#10b981' }}
                      />
                      <span className="font-bold text-white text-base">{player.name}</span>
                    </div>
                    <span className="text-xs bg-slate-700 px-2.5 py-0.5 rounded-full text-amber-300 font-bold">
                      {toPersianDigits(player.frameWins)} فریم برده
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs mt-2 pt-2 border-t border-slate-700/50">
                    <div>
                      <span className="text-[10px] text-slate-400 block">بیشترین بریک</span>
                      <span className="font-bold text-emerald-400">
                        {toPersianDigits(player.matchHighestBreak)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">تعداد پاکت</span>
                      <span className="font-bold text-white">
                        {toPersianDigits(player.potsCount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">دقت ضربه</span>
                      <span className="font-bold text-sky-400">{accuracy}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">تعداد خطاها</span>
                      <span className="font-bold text-rose-400">
                        {toPersianDigits(player.foulsCount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            id="copy-summary-btn"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>کپی متن کارنامه</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="share-summary-btn"
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>اشتراک‌گذاری در پیام‌رسان</span>
          </button>
        </div>
      </div>
    </div>
  );
};
