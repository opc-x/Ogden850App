import type { IosBrowser } from './pwaInstall';

export type IosInstallGuide = {
  browser: IosBrowser;
  browserLabel: string;
  step1Title: string;
  step1Chip: string;
  step1Extra?: string;
  step2Title: string;
};

const ADD_HOME_CHIP = '添加到主屏幕';

export function getIosInstallGuide(browser: IosBrowser): IosInstallGuide {
  switch (browser) {
    case 'safari':
      return {
        browser: 'safari',
        browserLabel: 'Safari',
        step1Title: '点底部「分享」',
        step1Chip: '分享',
        step1Extra: '图标是方框 + 向上箭头',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
      };
    case 'chrome':
      return {
        browser: 'chrome',
        browserLabel: 'Chrome',
        step1Title: '点地址栏右边的「分享」',
        step1Chip: '分享',
        step1Extra: '图标是方框 + 向上箭头',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
      };
    case 'firefox':
      return {
        browser: 'firefox',
        browserLabel: 'Firefox',
        step1Title: '点右下角「···」，再点「分享」',
        step1Chip: '···',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
      };
    case 'edge':
      return {
        browser: 'edge',
        browserLabel: 'Edge',
        step1Title: '点底部「分享」',
        step1Chip: '分享',
        step1Extra: '图标是方框 + 向上箭头',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
      };
    case 'opera':
      return {
        browser: 'opera',
        browserLabel: 'Opera',
        step1Title: '点底部菜单，再点「分享」',
        step1Chip: '分享',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
      };
    case 'in-app':
      return {
        browser: 'in-app',
        browserLabel: '当前应用',
        step1Title: '点右上角「···」',
        step1Chip: '···',
        step2Title: '选「在 Safari 中打开」',
      };
    default:
      return {
        browser: 'other',
        browserLabel: '浏览器',
        step1Title: '点屏幕右下方「···」',
        step1Chip: '···',
        step1Extra: '找不到就试顶部或底部的「分享」',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
      };
  }
}

export function getIosInAppFollowUp(): Pick<IosInstallGuide, 'step1Title' | 'step2Title' | 'step1Chip'> {
  return {
    step1Chip: ADD_HOME_CHIP,
    step1Title: 'Safari 打开后，点底部「分享」',
    step2Title: '再点「添加到主屏幕」',
  };
}
