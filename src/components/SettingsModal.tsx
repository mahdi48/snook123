import React from 'react';
import { X, Settings, Volume2, VolumeX, Smartphone, RotateCcw, Shield, SlidersHorizontal, Check } from 'lucide-react';
import { MatchSettings } from '../types';
import { toPersianDigits } from '../utils/persian';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MatchSettings;
  onUpdateSettings: (newSettings: Partial<MatchSettings>) => void;
  onResetCurrentFrame: () => void;
  onResetFullMatch: () => void;
  onOpenAndroidGuide: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetCurrentFrame,
  onResetFullMatch,
  onOpenAndroidGuide,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">تنظیمات مسابقه و برنامه</h3>
              <p className="text-xs text-slate-400">شخصی‌سازی قوانین، صدا و پیکربندی بازی</p>
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
          {/* Rule Mode: Custom (Red = 10) vs Official (Red = 1) */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              حالت محاسبه امتیاز توپ قرمز (Red Ball Mode):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClickSound();
                  onUpdateSettings({ redPoints: 10 });
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  settings.redPoints === 10
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-sm font-bold">حالت پیش‌فرض (+۱۰)</span>
                <span className="text-[11px] text-slate-400 mt-0.5">قرمز = ۱۰ امتیاز</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClickSound();
                  onUpdateSettings({ redPoints: 1 });
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                  settings.redPoints === 1
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span className="text-sm font-bold">قوانین رسمی مسابقات (+۱)</span>
                <span className="text-[11px] text-slate-400 mt-0.5">قرمز = ۱ امتیاز رسمی</span>
              </button>
            </div>
          </div>

          {/* Total Red Balls on Table: 15, 10, or 6 */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              تعداد توپ‌های قرمز میز:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[15, 10, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    soundManager.playClickSound();
                    onUpdateSettings({ totalReds: num });
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    settings.totalReds === num
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {toPersianDigits(num)} توپ قرمز
                </button>
              ))}
            </div>
          </div>

          {/* Best of Frames Target */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              تعداد فریم مسابقه (Best of Frames):
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 3, 5, 7, 9].map((frames) => (
                <button
                  key={frames}
                  type="button"
                  onClick={() => {
                    soundManager.playClickSound();
                    onUpdateSettings({ bestOfFrames: frames });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    settings.bestOfFrames === frames
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {toPersianDigits(frames)} فریم
                </button>
              ))}
            </div>
          </div>

          {/* Audio Sound Effects Toggle */}
          <div className="flex items-center justify-between bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">افکت‌های صوتی طبیعی</span>
                <span className="text-[11px] text-slate-400">صدای برخورد توپ‌ها، پاکت، و بوق خطا</span>
              </div>
            </div>
            <input
              type="checkbox"
              id="sound-sfx-toggle"
              checked={settings.soundEnabled}
              onChange={(e) => {
                const enabled = e.target.checked;
                soundManager.setSoundEnabled(enabled);
                onUpdateSettings({ soundEnabled: enabled });
                if (enabled) soundManager.playTurnSound();
              }}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Android APK Build Guide Button */}
          <button
            type="button"
            id="open-android-guide-btn"
            onClick={() => {
              soundManager.playClickSound();
              onOpenAndroidGuide();
            }}
            className="w-full flex items-center justify-between bg-gradient-to-r from-emerald-900/40 to-teal-900/40 hover:from-emerald-900/60 hover:to-teal-900/60 border border-emerald-500/40 p-3 rounded-2xl text-emerald-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="text-xs font-bold block">راهنمای خروجی فایل APK اندروید</span>
                <span className="text-[10px] text-emerald-400/80">
                  فایل‌های کامل Gradle، مانیفست و دستورات کامپایل
                </span>
              </div>
            </div>
            <span className="text-xs bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/40 font-bold">
              مشاهده فایل‌ها ➔
            </span>
          </button>

          {/* Reset Actions */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <button
              type="button"
              id="reset-frame-btn"
              onClick={() => {
                if (window.confirm('آیا مایل به بازنشانی فریم فعلی هستید؟')) {
                  soundManager.playClickSound();
                  onResetCurrentFrame();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی امتیازات فریم جاری (صفر کردن امتیازات)</span>
            </button>

            <button
              type="button"
              id="reset-full-match-btn"
              onClick={() => {
                if (window.confirm('آیا مایل به شروع بازی کاملاً جدید و پاک کردن تمام آمار هستید؟')) {
                  soundManager.playClickSound();
                  onResetFullMatch();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-bold border border-rose-800/50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>شروع مسابقه جدید (پاکسازی کامل بازی)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md cursor-pointer"
          >
            تأیید و بازگشت به بازی
          </button>
        </div>
      </div>
    </div>
  );
};
