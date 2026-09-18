import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Terminal,
  CheckCircle2,
  Download,
  Copy,
  Check,
  FileCode,
  Github,
  Zap,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidBuildModal: React.FC<AndroidBuildModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'methods' | 'commands'>('methods');
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall();

  if (!isOpen) return null;

  const copyCommand = (cmd: string, key: string) => {
    soundManager.playClickSound();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
      setCopiedCmd(key);
      setTimeout(() => setCopiedCmd(null), 2500);
    }
  };

  const buildCommands = [
    {
      key: 'sync',
      title: '۱. همگام‌سازی دارایی‌های وب با پروژه اندروید',
      command: 'npm run build && npx cap sync android',
    },
    {
      key: 'debug_apk',
      title: '۲. کامپایل مستقیم فایل دیباگ APK (app-debug.apk)',
      command: 'cd android && ./gradlew assembleDebug',
    },
    {
      key: 'release_apk',
      title: '۳. کامپایل فایل نهایی ریلیز امضا شده (Release APK)',
      command: 'cd android && ./gradlew assembleRelease',
    },
    {
      key: 'open_studio',
      title: '۴. باز کردن مستقیم در نرم‌افزار Android Studio',
      command: 'npx cap open android',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>راهنمای دریافت فایل app-debug.apk</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  اندروید
                </span>
              </h3>
              <p className="text-xs text-slate-400">سه روش آسان برای اجرا و دریافت فایل نصبی روی گوشی</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-3 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setActiveTab('methods');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'methods'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            روش‌های دریافت APK
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playClickSound();
              setActiveTab('commands');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'commands'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            دستورات ترمینال و فایل‌ها
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-4 my-3 overflow-y-auto pr-1 flex-1">
          {activeTab === 'methods' ? (
            <>
              {/* Direct WebAPK install if available */}
              {isInstallable && !isInstalled && (
                <div className="bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">نصب فوری و مستقیم روی گوشی (WebAPK)</h4>
                      <p className="text-xs text-slate-300">بدون نیاز به دانلود فایل APK یا کامپیوتر، با یک لمس روی صفحه اصلی بنشیند.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      soundManager.playClickSound();
                      await triggerInstall();
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>نصب فوری روی گوشی</span>
                  </button>
                </div>
              )}

              {/* Method 1: GitHub Actions (Automated Cloud Build) */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">
                    ۱
                  </div>
                  <Github className="w-4 h-4 text-slate-300" />
                  <span>روش ۱ (ساده‌ترین): ساخت اتوماتیک APK در گیت‌هاب (Cloud Build)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  گردش کار کامپایل اتوماتیک در فایل <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400" dir="ltr">.github/workflows/build-apk.yml</code> برای این پروژه ایجاد شد.
                </p>
                <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside pr-2 leading-relaxed">
                  <li>از منوی گوشه بالای صفحه گزینه <strong className="text-white">Export to GitHub</strong> را بزنید.</li>
                  <li>در مخزن گیت‌هاب وارد تب <strong className="text-emerald-400">Actions</strong> شوید.</li>
                  <li>گردش کار <strong className="text-white">Build Android Debug APK</strong> به‌طور خودکار آغاز شده و پس از حدود ۲ دقیقه فایل <code className="bg-slate-950 text-emerald-400 px-1 py-0.5 rounded" dir="ltr">app-debug.apk</code> را در بخش Artifacts برای دانلود مستقیم آماده می‌کند.</li>
                </ol>
              </div>

              {/* Method 2: Local Build with Android Studio / Terminal */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
                    ۲
                  </div>
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>روش ۲: کامپایل محلی در سیستم شخصی یا لپ‌تاپ</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  پروژه را با زدن دکمه <strong className="text-white">Export ZIP</strong> از منوی بالای صفحه دانلود کنید، از حالت فشرده خارج نمایید و سپس:
                </p>
                <div className="bg-slate-950 p-2.5 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto text-left" dir="ltr">
                  cd android && ./gradlew assembleDebug
                </div>
                <p className="text-[11px] text-slate-400">
                  فایل نهایی در آدرس زیر روی سیستم شما تولید می‌شود:
                  <br />
                  <code className="text-emerald-300 font-mono" dir="ltr">android/app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>

              {/* Method 3: Mobile PWA / Add to Home Screen */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                    ۳
                  </div>
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>روش ۳: استفاده مستقیم در گوشی اندروید به عنوان وب‌اپلیکیشن</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  لینک برنامه را در مرورگر <strong className="text-white">Google Chrome</strong> در گوشی اندروید باز کرده، منوی سه‌نقطه بالا را بزنید و گزینه <strong className="text-emerald-400">«افزودن به صفحه اصلی» (Install app / Add to Home screen)</strong> را انتخاب کنید. این کار دقیقاً رفتاری مشابه نصب فایل APK ایجاد می‌کند.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Files List */}
              <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/60">
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>فایل‌های اندروید آماده در ریشه پروژه:</span>
                </h4>
                <div className="text-xs space-y-1 text-slate-300 font-mono" dir="ltr">
                  <div className="bg-slate-900/80 px-2.5 py-1 rounded">.github/workflows/build-apk.yml (بیلد خودکار گیت‌هاب)</div>
                  <div className="bg-slate-900/80 px-2.5 py-1 rounded">android/build.gradle</div>
                  <div className="bg-slate-900/80 px-2.5 py-1 rounded">android/app/build.gradle (SDK 34)</div>
                  <div className="bg-slate-900/80 px-2.5 py-1 rounded">android/app/src/main/AndroidManifest.xml</div>
                  <div className="bg-slate-900/80 px-2.5 py-1 rounded">android/app/src/main/java/com/snookerpro/app/MainActivity.java</div>
                  <div className="bg-slate-900/80 px-2.5 py-1 rounded">capacitor.config.ts</div>
                </div>
              </div>

              {/* Terminal Commands */}
              <div className="space-y-2.5">
                {buildCommands.map((item) => (
                  <div
                    key={item.key}
                    className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-300">{item.title}</span>
                      <button
                        type="button"
                        onClick={() => copyCommand(item.command, item.key)}
                        className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded cursor-pointer"
                      >
                        {copiedCmd === item.key ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>کپی</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto text-left" dir="ltr">
                      {item.command}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 truncate">
            مسیر خروجی: <span className="text-emerald-400 font-mono" dir="ltr">.../app-debug.apk</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer shrink-0"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
