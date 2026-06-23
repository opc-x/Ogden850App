import { useCallback, useEffect, useState } from 'react';
import {
  detectIosBrowser,
  detectPwaPlatform,
  isAndroid,
  isFirstHomeVisitThisSession,
  isInAppBrowser,
  isIosDevice,
  isPwaInstalled,
  markHomeVisitedThisSession,
  shouldOfferPwaInstall,
  type IosBrowser,
  type PwaPlatform,
} from '../lib/pwaInstall';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function usePwaInstallPrompt(activeTab: string) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [platform, setPlatform] = useState<PwaPlatform>('desktop-manual');
  const [waitingForPrompt, setWaitingForPrompt] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      setDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    setPlatform(detectPwaPlatform(Boolean(deferredPrompt)));
    if (deferredPrompt) setWaitingForPrompt(false);
  }, [deferredPrompt]);

  useEffect(() => {
    if (!isAndroid() || isInAppBrowser() || deferredPrompt || isPwaInstalled()) {
      setWaitingForPrompt(false);
      return;
    }
    setWaitingForPrompt(true);
    const timer = window.setTimeout(() => setWaitingForPrompt(false), 2500);
    return () => window.clearTimeout(timer);
  }, [deferredPrompt]);

  useEffect(() => {
    if (dismissed || isPwaInstalled()) {
      setVisible(false);
      return;
    }

    if (!shouldOfferPwaInstall(activeTab)) {
      setVisible(false);
      return;
    }

    if (activeTab === 'home' && isFirstHomeVisitThisSession()) {
      markHomeVisitedThisSession();
    }

    const timer = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(timer);
  }, [activeTab, dismissed, deferredPrompt]);

  const dismiss = useCallback(() => setDismissed(true), []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setVisible(false);
    }
  }, [deferredPrompt]);

  const iosBrowser: IosBrowser | null = isIosDevice() ? detectIosBrowser() : null;

  return {
    visible,
    dismiss,
    install,
    platform,
    iosBrowser,
    waitingForPrompt,
    canNativeInstall: platform === 'native' && Boolean(deferredPrompt),
  };
}
