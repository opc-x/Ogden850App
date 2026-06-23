import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getIosInstallGuide } from './iosInstallGuide';
import {
  detectIosBrowser,
  detectPwaPlatform,
  isFirstHomeVisitThisSession,
  isInAppBrowser,
  isIosDevice,
  isPwaInstalled,
  markHomeVisitedThisSession,
  shouldOfferPwaInstall,
} from './pwaInstall';

function mockUa(ua: string, platform = 'iPhone') {
  Object.defineProperty(window.navigator, 'userAgent', { configurable: true, value: ua });
  Object.defineProperty(window.navigator, 'platform', { configurable: true, value: platform });
  Object.defineProperty(window.navigator, 'maxTouchPoints', { configurable: true, value: 5 });
}

describe('pwaInstall', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockUa('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: undefined,
    });
  });

  it('detects installed standalone mode', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('standalone'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    expect(isPwaInstalled()).toBe(true);
  });

  it('tracks first home visit per session', () => {
    expect(isFirstHomeVisitThisSession()).toBe(true);
    markHomeVisitedThisSession();
    expect(isFirstHomeVisitThisSession()).toBe(false);
  });

  it('offers install on first home visit when not installed', () => {
    expect(shouldOfferPwaInstall('home')).toBe(true);
  });

  it('skips install prompt when already installed', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('standalone'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    expect(shouldOfferPwaInstall('home')).toBe(false);
  });

  it('skips install prompt on onboarding', () => {
    expect(shouldOfferPwaInstall('onboarding')).toBe(false);
  });
});

describe('iOS browser detection', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it('detects Safari on iPhone', () => {
    mockUa('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
    expect(isIosDevice()).toBe(true);
    expect(detectIosBrowser()).toBe('safari');
    expect(detectPwaPlatform(false)).toBe('ios');
  });

  it('detects Chrome on iPhone', () => {
    mockUa('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1');
    expect(detectIosBrowser()).toBe('chrome');
    expect(getIosInstallGuide('safari').step1Title).toContain('右下方');
    expect(getIosInstallGuide('chrome').step1Chip).toBe('分享');
  });

  it('detects Firefox on iPhone', () => {
    mockUa('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15');
    expect(detectIosBrowser()).toBe('firefox');
  });

  it('detects Edge on iPhone', () => {
    mockUa('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/120.0.2210.86 Version/17.0 Mobile/15E148 Safari/604.1');
    expect(detectIosBrowser()).toBe('edge');
  });

  it('detects WeChat in-app on iPhone', () => {
    mockUa('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.42(0x18002a2e) NetType/WIFI Language/zh_CN');
    expect(isInAppBrowser()).toBe(true);
    expect(detectIosBrowser()).toBe('in-app');
    expect(detectPwaPlatform(false)).toBe('in-app-browser');
    expect(getIosInstallGuide('in-app').step2Title).toContain('Safari');
  });

  it('detects iPadOS Safari', () => {
    mockUa('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15', 'MacIntel');
    Object.defineProperty(window.navigator, 'maxTouchPoints', { configurable: true, value: 5 });
    expect(isIosDevice()).toBe(true);
    expect(detectIosBrowser()).toBe('safari');
  });
});
