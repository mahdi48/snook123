import React, { useState } from 'react';
import { X, AlertTriangle, UserMinus, UserPlus, ShieldAlert, Check } from 'lucide-react';
import { Player, FoulPenaltyAction } from '../types';
import { SNOOKER_FOUL_REASONS, toPersianDigits } from '../utils/persian';
import { soundManager } from '../utils/audio';

interface FoulModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  activePlayerIndex: number;
  onApplyFoul: (params: {
    offendingPlayerIndex: number;
    penaltyPoints: number;
    reasonTitle: string;
    penaltyAction: FoulPenaltyAction;
    switchTurn: boolean;
  }) => void;
}

export const FoulModal: React.FC<FoulModalProps> = ({
  isOpen,
  onClose,
  players,
  activePlayerIndex,
  onApplyFoul,
}) => {
  const [selectedOffenderIndex, setSelectedOffenderIndex] = useState<number>(activePlayerIndex);
  const [penaltyPoints, setPenaltyPoints] = useState<number>(4);
  const [selectedReasonId, setSelectedReasonId] = useState<string>('in_off');
  const [penaltyAction, setPenaltyAction] = useState<FoulPenaltyAction>('awardOpponent');
  const [switchTurn, setSwitchTurn] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentReason = SNOOKER_FOUL_REASONS.find((r) => r.id === selectedReasonId);

  const handleReasonSelect = (reasonId: string, defaultPenalty: number) => {
    setSelectedReasonId(reasonId);
    setPenaltyPoints(defaultPenalty);
    soundManager.playClickSound();
  };

  const handleConfirm = () => {
    soundManager.playFoulSound();
    onApplyFoul({
      offendingPlayerIndex: selectedOffenderIndex,
      penaltyPoints,
      reasonTitle: currentReason ? currentReason.titleFa : 'خطای عمومی',
      penaltyAction,
      switchTurn,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">ثبت خطای اسنوکر (Foul)</h3>
              <p className="text-xs text-slate-400">جریمه خطا و تعیین امتیازات</p>
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

        <div className="space-y-4 my-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Offending Player Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              بازیکن خطاکار:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {players.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedOffenderIndex(idx)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                    selectedOffenderIndex === idx
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-400'
                      : 'bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: p.color || '#ef4444' }}
                  />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Penalty Points Selector (4, 5, 6, 7) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              میزان جریمه خطا (امتیاز):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 5, 6, 7].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => {
                    soundManager.playClickSound();
                    setPenaltyPoints(pts);
                  }}
                  className={`py-2 rounded-xl text-base font-extrabold border transition-all cursor-pointer ${
                    penaltyPoints === pts
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {toPersianDigits(pts)} امتیاز
                </button>
              ))}
            </div>
          </div>

          {/* Foul Penalty Behavior Option */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              نحوه اعمال جریمه:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPenaltyAction('awardOpponent')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  penaltyAction === 'awardOpponent'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>اضافه به حریف (رسمی)</span>
              </button>

              <button
                type="button"
                onClick={() => setPenaltyAction('deductPlayer')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  penaltyAction === 'deductPlayer'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>کسر از خطاکار (منفی)</span>
              </button>

              <button
                type="button"
                onClick={() => setPenaltyAction('both')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  penaltyAction === 'both'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>هر دو حالت</span>
              </button>
            </div>
          </div>

          {/* Standard Foul Reasons List */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              علت خطا:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SNOOKER_FOUL_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => handleReasonSelect(reason.id, reason.defaultPenalty)}
                  className={`text-right p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedReasonId === reason.id
                      ? 'bg-slate-800 border-amber-500/70 text-white ring-1 ring-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{reason.titleFa}</span>
                    <span className="text-[11px] font-semibold text-amber-400">
                      {toPersianDigits(reason.defaultPenalty)} امتیاز
                    </span>
                  </div>
                  {reason.descriptionFa && (
                    <p className="text-[10px] text-slate-500 mt-1 truncate">
                      {reason.descriptionFa}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Switch Turn Checkbox */}
          <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">تغییر نوبت به بازیکن بعدی</span>
              <span className="text-[11px] text-slate-400">طبق قوانین اسنوکر نوبت واگذار می‌شود</span>
            </div>
            <input
              type="checkbox"
              id="switch-turn-toggle"
              checked={switchTurn}
              onChange={(e) => setSwitchTurn(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            id="confirm-foul-btn"
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>ثبت خطای {toPersianDigits(penaltyPoints)} امتیازی</span>
          </button>
        </div>
      </div>
    </div>
  );
};
