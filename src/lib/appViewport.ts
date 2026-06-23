import { isPwaInstalled } from './pwaInstall';

/**
 * PWA standalone: viewport 单位不含状态栏，用 screen.height 撑满物理屏幕。
 * 虚拟键盘弹出时切到 visualViewport.height 缩高。
 * 浏览器标签页仍走 CSS --app-height: 100svh。
 */
export function syncAppViewportHeight(): void {
  const root = document.documentElement;

  if (isPwaInstalled()) {
    root.classList.add('pwa-standalone');
    const vv = window.visualViewport;
    if (vv && vv.height < window.innerHeight - 1) {
      root.style.setProperty('--app-height', `${Math.round(vv.height)}px`);
    } else {
      root.style.setProperty('--app-height', `${window.screen.height}px`);
    }
    return;
  }

  root.classList.remove('pwa-standalone');
  root.style.removeProperty('--app-height');
}

export function initAppViewport(): void {
  syncAppViewportHeight();

  window.visualViewport?.addEventListener('resize', syncAppViewportHeight);
  window.visualViewport?.addEventListener('scroll', syncAppViewportHeight);
  window.addEventListener('resize', syncAppViewportHeight);
  window.addEventListener('pageshow', syncAppViewportHeight);
  window.addEventListener('orientationchange', () => {
    window.setTimeout(syncAppViewportHeight, 150);
  });
}
