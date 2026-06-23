import { getIosInAppFollowUp, type IosInstallGuide } from '../../lib/iosInstallGuide';

function IosInstallHint({ guide }: { guide: IosInstallGuide }) {
  switch (guide.browser) {
    case 'safari':
    case 'edge':
      return (
        <>
          点底部 <b>分享</b>，再选「添加到主屏幕」。
        </>
      );
    case 'chrome':
      return (
        <>
          点地址栏右侧 <b>分享</b>，选「添加到主屏幕」。
        </>
      );
    case 'firefox':
      return (
        <>
          点右下角 <b>···</b>，再点 <b>分享</b>，选「添加到主屏幕」。
        </>
      );
    case 'opera':
      return (
        <>
          点底部菜单，再点 <b>分享</b>，选「添加到主屏幕」。
        </>
      );
    case 'in-app':
      return (
        <>
          点右上角 <b>···</b>，选「在 Safari 中打开」。
        </>
      );
    default:
      return (
        <>
          点屏幕右下方 <b>···</b>，选「添加到主屏幕」。
        </>
      );
  }
}

type IosInstallStepsProps = {
  guide: IosInstallGuide;
  inAppFollowUp?: boolean;
};

export function IosInstallSteps({ guide, inAppFollowUp }: IosInstallStepsProps) {
  const followUp = inAppFollowUp ? getIosInAppFollowUp() : null;

  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-600 font-medium leading-relaxed">
        <IosInstallHint guide={guide} />
      </p>
      {followUp && (
        <p className="text-xs text-emerald-700 font-medium leading-relaxed">
          Safari 打开后：点底部 <b>分享</b>，再选「添加到主屏幕」。
        </p>
      )}
    </div>
  );
}
