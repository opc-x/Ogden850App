import { Copy, Download, ExternalLink, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { getIosInstallGuide } from '../../lib/iosInstallGuide';
import type { IosBrowser, PwaPlatform } from '../../lib/pwaInstall';
import { IosInstallSteps } from './IosInstallSteps';

type PwaInstallBannerProps = {
  visible: boolean;
  platform: PwaPlatform;
  iosBrowser: IosBrowser | null;
  canNativeInstall: boolean;
  waitingForPrompt: boolean;
  onDismiss: () => void;
  onInstall: () => void;
};

export function PwaInstallBanner({
  visible,
  platform,
  iosBrowser,
  canNativeInstall,
  waitingForPrompt,
  onDismiss,
  onInstall,
}: PwaInstallBannerProps) {
  const [copied, setCopied] = useState(false);

  const iosGuide = useMemo(
    () => (iosBrowser ? getIosInstallGuide(iosBrowser) : null),
    [iosBrowser],
  );

  const copyLink = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('复制此链接，粘贴到 Safari 地址栏打开：', url);
    }
  }, []);

  const openInChrome = useCallback(() => {
    const url = window.location.href;
    const intent = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intent;
  }, []);

  if (!visible) return null;

  const isIosBrowser = platform === 'ios' && iosGuide;
  const isIosInApp = platform === 'in-app-browser' && iosBrowser === 'in-app' && iosGuide;
  const isAndroidInApp = platform === 'in-app-browser' && iosBrowser !== 'in-app';
  const isAndroidFallback = platform === 'android-fallback';
  const showNativeButton = canNativeInstall;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`absolute left-3 right-3 z-50 bg-white/98 backdrop-blur-xl rounded-3xl border shadow-2xl border-indigo-200 ${
          isIosBrowser || isIosInApp ? 'bottom-[5.5rem] p-4 pt-5' : 'bottom-24 p-5'
        }`}
      >
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600"
          aria-label="关闭安装提示"
        >
          <X className="w-5 h-5" />
        </button>

        {isIosBrowser && <IosInstallSteps guide={iosGuide} />}

        {isIosInApp && (
          <>
            <IosInstallSteps guide={iosGuide} inAppFollowUp />
            <button
              type="button"
              onClick={() => void copyLink()}
              className="mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Copy className="w-4 h-4" /> {copied ? '已复制链接' : '复制链接 · 到 Safari 粘贴打开'}
            </button>
          </>
        )}

        {!isIosBrowser && !isIosInApp && (
          <>
            <div className="flex gap-4">
              <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
                <img src="/ogden-192.png" className="w-8 h-8 rounded-lg" alt="Ogden 850" />
              </div>
              <div className="space-y-1 pr-6">
                <h4 className="font-black text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  安装 Ogden 850
                </h4>
                {isAndroidInApp ? (
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    微信等内置浏览器无法安装，请用 Chrome 打开此页面。
                  </p>
                ) : showNativeButton ? (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">点击下方按钮，确认后即可安装到桌面。</p>
                ) : waitingForPrompt && isAndroidFallback ? (
                  <p className="text-xs text-slate-500 font-medium mt-0.5">正在准备安装…</p>
                ) : isAndroidFallback ? (
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    请用 Chrome 打开本站；若已安装 Chrome，可在菜单中选择「安装应用」或「添加到主屏幕」。
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    点击地址栏右侧 <b>安装</b> 图标，或菜单中的「安装 Ogden 850」。
                  </p>
                )}
              </div>
            </div>

            {showNativeButton && (
              <button
                type="button"
                onClick={onInstall}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" /> 一键安装到桌面
              </button>
            )}

            {isAndroidInApp && (
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={openInChrome}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl flex justify-center items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-5 h-5" /> 在 Chrome 中打开
                </button>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl flex justify-center items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> {copied ? '已复制链接' : '复制链接到 Chrome 打开'}
                </button>
              </div>
            )}
          </>
        )}

        {(isIosBrowser || isIosInApp) && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white drop-shadow-md" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
