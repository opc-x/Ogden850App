import { isPwaInstalled } from './pwaInstall';

/** PWA 独立模式用真实可视高度（px）；浏览器标签页仍用 CSS 100svh。 */
export function syncAppViewportHeight(): void {
  const root = document.documentElement;

  if (isPwaInstalled()) {
    root.classList.add('pwa-standalone');
    const height = Math.round(window.visualViewport?.height ?? window.innerHeight);
    root.style.setProperty('--app-height', `${height}px`);
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
  window.addEventListener('orientationchange', () => {
    window.setTimeout(syncAppViewportHeight, 120);
  });
}
