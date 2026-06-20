import { useCallback, useMemo, useState } from 'react';
import { speakText } from '../../data/speak';
import { VALID_COMBOS } from './wordMachineData';

export function useWordMachineState() {
  const [activeOp, setActiveOp] = useState('get');
  const [activeDir, setActiveDir] = useState('up');

  const comboKey = `${activeOp} ${activeDir}`;
  const validCombo = VALID_COMBOS[comboKey];

  const handleSpeak = useCallback(() => {
    void speakText(validCombo ? validCombo.result : comboKey);
  }, [validCombo, comboKey]);

  const invalidExplanation = useMemo(() => {
    if (validCombo) return null;

    const isAuxiliary = ['may', 'will'].includes(activeOp);
    if (isAuxiliary) {
      return `🚫 辅助动词无法与物理方向拼装：\n辅助算子 "${activeOp}" 仅用于调节时态和可能性，其本身没有物理空间运动属性，因此无法与方向介词 "${activeDir}" 进行空间组装。`;
    }
    const isStative = ['be', 'have', 'seem'].includes(activeOp);
    if (isStative) {
      return `🚫 静态/状态动词无法与该物理方向拼装：\n状态词 "${activeOp}" 表达的是存在或持有关系，并非物理位移。在 Ogden 的系统里，它们不能与大部分空间介词组装。已有的极少数习惯用法如 "be back" (回来了) 或 "have on" (穿着)。`;
    }
    const validDirs = Object.keys(VALID_COMBOS)
      .filter((k) => k.startsWith(`${activeOp} `))
      .map((k) => k.replace(`${activeOp} `, ''))
      .join(', ');
    return `🚫 非标准短语动词：\n虽然动作词 "${activeOp}" 和方向介词 "${activeDir}" 都在 850 词表中，但它们拼装出的 "${activeOp} ${activeDir}" 并不是标准英语已接受的习惯用法。请选择此动作词的其他合规拼接方向（例如：${validDirs}）。`;
  }, [activeOp, activeDir, validCombo]);

  return {
    activeOp,
    setActiveOp,
    activeDir,
    setActiveDir,
    comboKey,
    validCombo,
    handleSpeak,
    invalidExplanation,
  };
}
