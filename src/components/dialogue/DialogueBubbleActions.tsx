import type { MouseEvent } from 'react';
import { Volume2, Languages } from 'lucide-react';

export interface DialogueBubbleActionsProps {
  onSpeak?: () => void;
  speakLabel?: string;
  zh?: string;
  zhVisible?: boolean;
  onToggleZh?: (e: MouseEvent) => void;
  className?: string;
}

/** 对话气泡内朗读 + 中文切换，与 AI 陪练样式一致 */
export function DialogueBubbleActions({
  onSpeak,
  speakLabel = '朗读',
  zh,
  zhVisible = false,
  onToggleZh,
  className = '',
}: DialogueBubbleActionsProps) {
  if (!onSpeak && !zh) return null;

  return (
    <span
      className={`ml-2.5 inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full border border-slate-100/90 bg-slate-50/70 px-1 py-0.5 ${className}`}
    >
      {onSpeak ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSpeak();
          }}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-white/80 hover:text-slate-600 active:scale-95"
          title={speakLabel}
          aria-label={speakLabel}
        >
          <Volume2 className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      ) : null}
      {zh && onToggleZh ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleZh(e);
          }}
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full active:scale-95 ${
            zhVisible
              ? 'text-slate-500 hover:bg-white/80'
              : 'text-slate-300 hover:bg-white/80 hover:text-slate-500'
          }`}
          title={zhVisible ? '隐藏中文' : '看中文'}
          aria-pressed={zhVisible}
          aria-label={zhVisible ? '隐藏中文' : '看中文'}
        >
          <Languages className="h-3 w-3" strokeWidth={2.25} />
        </button>
      ) : null}
    </span>
  );
}
