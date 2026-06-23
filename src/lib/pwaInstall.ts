const HOME_VISITED_KEY = 'ogden850_home_visited';

export type PwaPlatform = 'ios' | 'native' | 'android-fallback' | 'in-app-browser' | 'desktop-manual';

export type IosBrowser = 'safari' | 'chrome' | 'firefox' | 'edge' | 'opera' | 'in-app' | 'other';

const IN_APP_UA = /micromessenger|weibo|qq\/|mqqbrowser|dingtalk|feishu|lark|bytedance|toutiao|baiduboxapp|fbav|fban|instagram|line\//i;

const IOS_BROWSER_UA: Array<{ id: IosBrowser; pattern: RegExp }> = [
  { id: 'chrome', pattern: /CriOS/i },
  { id: 'firefox', pattern: /FxiOS/i },
  { id: 'edge', pattern: /EdgiOS/i },
  { id: 'opera', pattern: /OPiOS|OPT/i },
];

export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches
  );
}

export function isPageReload(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return nav?.type === 'reload';
}

export function isFirstHomeVisitThisSession(): boolean {
  if (typeof sessionStorage === 'undefined') return true;
  return sessionStorage.getItem(HOME_VISITED_KEY) !== 'true';
}

export function markHomeVisitedThisSession(): void {
  sessionStorage.setItem(HOME_VISITED_KEY, 'true');
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isAppleMobile = /iPad|iPhone|iPod/i.test(ua);
  const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return (isAppleMobile || isIpadOs) && !(window as Window & { MSStream?: unknown }).MSStream;
}

/** @deprecated use isIosDevice */
export function isIosSafari(): boolean {
  return isIosDevice();
}

export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return IN_APP_UA.test(navigator.userAgent);
}

export function detectIosBrowser(): IosBrowser {
  if (!isIosDevice()) return 'other';
  if (isInAppBrowser()) return 'in-app';

  const ua = navigator.userAgent;
  for (const { id, pattern } of IOS_BROWSER_UA) {
    if (pattern.test(ua)) return id;
  }

  if (/Safari/i.test(ua)) return 'safari';
  return 'other';
}

export function detectPwaPlatform(hasDeferredPrompt: boolean): PwaPlatform {
  if (isPwaInstalled()) return 'desktop-manual';
  if (isIosDevice() && isInAppBrowser()) return 'in-app-browser';
  if (isIosDevice()) return 'ios';
  if (isInAppBrowser()) return 'in-app-browser';
  if (hasDeferredPrompt) return 'native';
  if (isAndroid()) return 'android-fallback';
  return 'desktop-manual';
}

/** 未安装且满足：首次进首页，或整页刷新（非 onboarding） */
export function shouldOfferPwaInstall(activeTab: string): boolean {
  if (isPwaInstalled() || activeTab === 'onboarding') return false;

  const onHome = activeTab === 'home';
  const firstHome = onHome && isFirstHomeVisitThisSession();
  const reload = isPageReload();

  return firstHome || reload;
}
