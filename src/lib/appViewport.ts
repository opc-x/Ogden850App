import { isPwaInstalled } from './pwaInstall';

/**
 * PWA standalone: 切 class + 虚拟键盘弹出时缩高。
 * 默认高度走 CSS --app-height: 100svh，不用 JS 覆盖。
 * 浏览器标签页同上。
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
