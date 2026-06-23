import { isPwaInstalled } from './pwaInstall';

/**
 * PWA standalone: CSS `position:fixed; inset:0` 自然撑满全屏，
 * 这里只负责切 class + 虚拟键盘弹出时缩高。
 * 浏览器标签页仍走 CSS --app-height: 100svh。
 */
export function syncAppViewportHeight(): void {
  const root = document.documentElement;

  if (isPwaInstalled()) {
    root.classList.add('pwa-standalone');
    // 虚拟键盘弹出时 visualViewport.height < innerHeight，用它缩高防内容被遮
    const vv = window.visualViewport;
    if (vv && vv.height < window.innerHeight - 1) {
      root.style.setProperty('--app-height', `${Math.round(vv.height)}px`);
      root.style.setProperty('height', `${Math.round(vv.height)}px`);
    } else {
      root.style.removeProperty('--app-height');
      root.style.removeProperty('height');
    }
    return;
  }

  root.classList.remove('pwa-standalone');
  root.style.removeProperty('--app-height');
  root.style.removeProperty('height');
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
