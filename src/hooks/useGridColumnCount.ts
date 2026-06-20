import { useEffect, useState } from 'react';

/** 与 BrowserView 词卡 grid 断点一致：1 / sm:2 / md:3 / lg:4 */
export function useGridColumnCount(): number {
  const [columnCount, setColumnCount] = useState(() => resolveColumnCount());

  useEffect(() => {
    const onResize = () => setColumnCount(resolveColumnCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return columnCount;
}

function resolveColumnCount(): number {
  if (typeof window === 'undefined') return 1;
  const w = window.innerWidth;
  if (w >= 1024) return 4;
  if (w >= 768) return 3;
  if (w >= 640) return 2;
  return 1;
}
