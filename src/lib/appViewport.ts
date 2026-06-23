import { isPwaInstalled } from './pwaInstall';

/**
 * PWA standalone: CSS 用 --app-height:100dvh 撑满全屏，
 * 这里只切 class + 虚拟键盘弹出时用像素值覆盖 --app-height 缩高。
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
      root.style.removeProperty('--app-height');
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
