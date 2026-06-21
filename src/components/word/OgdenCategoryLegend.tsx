import { CATEGORY_LABELS, OGDEN_CATEGORY_ORDER } from '../../types/word';

type LegendVariant = 'grid' | 'inline';

/** 850 六类色标 — grid 用于词典；inline 用于场景开场提示 */
export function OgdenCategoryLegend({
  className = '',
  variant = 'grid',
}: {
  className?: string;
  variant?: LegendVariant;
}) {
  if (variant === 'inline') {
    return (
      <div
        className={`flex shrink-0 flex-nowrap items-center gap-1 ${className}`}
        aria-label="850 词分类色标"
      >
        {OGDEN_CATEGORY_ORDER.map((key) => {
          const cat = CATEGORY_LABELS[key];
          return (
            <span
              key={key}
              title={cat.zh}
              className={`h-1.5 w-1.5 shrink-0 rounded-[1px] ${cat.dot}`}
              aria-label={cat.zh}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-3 gap-x-2 gap-y-1.5 sm:grid-cols-6 sm:gap-x-3 ${className}`}
      aria-label="850 词分类色标"
    >
      {OGDEN_CATEGORY_ORDER.map((key) => {
        const cat = CATEGORY_LABELS[key];
        return (
          <span key={key} className="inline-flex min-w-0 items-center gap-1.5">
            <span className={`h-2 w-2 shrink-0 rounded-[2px] ${cat.dot}`} aria-hidden />
            <span className="truncate text-[10px] leading-tight text-slate-600">{cat.zh}</span>
          </span>
        );
      })}
    </div>
  );
}
