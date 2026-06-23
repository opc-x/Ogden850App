import { beforeEach, describe, expect, it, vi } from 'vitest';
import { syncAppViewportHeight } from './appViewport';

describe('appViewport', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.documentElement.style.removeProperty('--app-height');
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('standalone'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 812 });
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 812, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    });
  });

  it('uses screen.height as --app-height when keyboard is hidden', () => {
    Object.defineProperty(window.screen, 'height', { configurable: true, value: 852 });
    syncAppViewportHeight();
    expect(document.documentElement.classList.contains('pwa-standalone')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--app-height')).toBe('852px');
  });

  it('sets --app-height when virtual keyboard shrinks viewport', () => {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 400, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    });
    syncAppViewportHeight();
    expect(document.documentElement.classList.contains('pwa-standalone')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--app-height')).toBe('400px');
  });

  it('clears standalone sizing in browser mode', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    document.documentElement.classList.add('pwa-standalone');
    document.documentElement.style.setProperty('--app-height', '812px');

    syncAppViewportHeight();

    expect(document.documentElement.classList.contains('pwa-standalone')).toBe(false);
    expect(document.documentElement.style.getPropertyValue('--app-height')).toBe('');
  });
});
