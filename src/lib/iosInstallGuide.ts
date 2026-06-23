import type { IosBrowser } from './pwaInstall';

export type SharePlacement = 'bottom' | 'top-right' | 'menu';

export type IosInstallGuide = {
  browser: IosBrowser;
  browserLabel: string;
  step1Title: string;
  step1Chip: string;
  step1Extra?: string;
  step2Title: string;
  sharePlacement: SharePlacement;
  lookHint: string;
  arrow: 'down' | 'up';
};

const ADD_HOME_CHIP = '添加到主屏幕';

export function getIosInstallGuide(browser: IosBrowser): IosInstallGuide {
  switch (browser) {
    case 'safari':
      return {
        browser: 'safari',
        browserLabel: 'Safari',
        step1Title: '点屏幕最下面中间的「分享」',
        step1Chip: '分享',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
        sharePlacement: 'bottom',
        lookHint: '往屏幕最下方看',
        arrow: 'down',
      };
    case 'chrome':
      return {
        browser: 'chrome',
        browserLabel: 'Chrome',
        step1Title: '点地址栏右边的「分享」',
        step1Chip: '分享',
        step1Extra: '图标是方框 + 向上箭头',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
        sharePlacement: 'top-right',
        lookHint: '往屏幕右上方看',
        arrow: 'up',
      };
    case 'firefox':
      return {
        browser: 'firefox',
        browserLabel: 'Firefox',
        step1Title: '点右下角菜单 ≡，再点「分享」',
        step1Chip: '分享',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
        sharePlacement: 'menu',
        lookHint: '往屏幕右下角看',
        arrow: 'down',
      };
    case 'edge':
      return {
        browser: 'edge',
        browserLabel: 'Edge',
        step1Title: '点底部中间的「分享」',
        step1Chip: '分享',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
        sharePlacement: 'bottom',
        lookHint: '往屏幕最下方看',
        arrow: 'down',
      };
    case 'opera':
      return {
        browser: 'opera',
        browserLabel: 'Opera',
        step1Title: '点底部菜单，再点「分享」',
        step1Chip: '分享',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
        sharePlacement: 'menu',
        lookHint: '往屏幕底部看',
        arrow: 'down',
      };
    case 'in-app':
      return {
        browser: 'in-app',
        browserLabel: '当前应用',
        step1Title: '点右上角 「···」',
        step1Chip: '···',
        step2Title: '选「在 Safari 中打开」',
        sharePlacement: 'top-right',
        lookHint: '往屏幕右上方看',
        arrow: 'up',
      };
    default:
      return {
        browser: 'other',
        browserLabel: '浏览器',
        step1Title: '找到并点「分享」按钮',
        step1Chip: '分享',
        step1Extra: '一般在顶部或底部工具栏',
        step2Title: '在弹出菜单里点「添加到主屏幕」',
        sharePlacement: 'top-right',
        lookHint: '找分享按钮',
        arrow: 'up',
      };
  }
}

export function getIosInAppFollowUp(): Pick<IosInstallGuide, 'step1Title' | 'step2Title' | 'step1Chip'> {
  return {
    step1Chip: ADD_HOME_CHIP,
    step1Title: '用 Safari 打开后，点底部「分享」',
    step2Title: '再点「添加到主屏幕」就完成',
  };
}
