import { useEffect, useState } from 'react';

/** 与 BrowserView 词卡 grid 断点一致，检测实际容器宽度 */
export function useGridColumnCount(): number {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const container = document.querySelector('.max-w-\\[430px\\]') || document.body;

    const resolveColumns = (width: number) => {
      if (width >= 1024) return 4;
      if (width >= 768) return 3;
      if (width >= 640) return 2;
      return 1;
    };

    // Initial check
    setColumnCount(resolveColumns(container.clientWidth));

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setColumnCount(resolveColumns(entry.contentRect.width || container.clientWidth));
        }
      });
      observer.observe(container);
      return () => observer.disconnect();
    } else {
      const onResize = () => setColumnCount(resolveColumns(container.clientWidth));
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  return columnCount;
}
