import { useCallback, useMemo, useState } from 'react';
import { speakText } from '../../data/speak';
import { BYPASS_CASES, COMPOUNDS_DB, VALID_AFFIXES } from './multiplyMoreData';

const AFFIX_ROOTS = ['work', 'play', 'quick', 'happy', 'stop', 'change', 'safe', 'sad', 'open', 'close', 'fold'] as const;
const AFFIXES = ['-S', '-ER', '-ING', '-ED', '-LY', 'UN-'] as const;

export function useMultiplyMoreState(mode: 'affixes' | 'compounds') {
  const [activeRoot, setActiveRoot] = useState('work');
  const [activeAffix, setActiveAffix] = useState('-ER');
  const [bypassIdx, setBypassIdx] = useState(0);
  const [activeA, setActiveA] = useState('milk');
  const [activeB, setActiveB] = useState('man');

  const affixKey = `${activeRoot} ${activeAffix}`;
  const validAffixEntry = VALID_AFFIXES[affixKey];

  const wordAList = useMemo(
    () => Array.from(new Set(COMPOUNDS_DB.map((c) => c.a))).sort(),
    [],
  );
  const wordBList = useMemo(
    () => Array.from(new Set(COMPOUNDS_DB.map((c) => c.b))).sort(),
    [],
  );

  const selectedCompound = useMemo(
    () => COMPOUNDS_DB.find((c) => c.a === activeA && c.b === activeB),
    [activeA, activeB],
  );

  const handleSpeak = useCallback((text: string) => {
    void speakText(text);
  }, []);

  const invalidAffixDetails = useMemo(() => {
    const isQuality = ['quick', 'happy', 'sad', 'safe'].includes(activeRoot);
    if (isQuality && (activeAffix === '-ER' || activeAffix === '-ED' || activeAffix === '-ING' || activeAffix === '-S')) {
      return `⚠️ 不合规派生：\n性质词（形容词如 "${activeRoot}"）不支持动作专属后缀（-ER/-ED/-ING/-S）。在基本英语中，性质词的比较级禁止加 -er/-est，必须在词前添加 More/Most 表示（例如：more ${activeRoot}），以维持规则高度一致。`;
    }
    if (activeRoot === 'quick' && activeAffix === 'UN-') {
      return `⚠️ 不合规派生：\n性质词 quick 在官方词表中对应的反义词直接收录为 slow，因此严禁派生 unquick。`;
    }
    return `⚠️ 组合不合法：\n词根 "${activeRoot}" 无法与词缀 "${activeAffix}" 进行形态拼装。请参照法定派生机制选择合规组合。`;
  }, [activeRoot, activeAffix]);

  const invalidCompoundDetails = useMemo(
    () =>
      `🚫 非标准复合词：\n虽然 "${activeA}" 和 "${activeB}" 都是 Basic English 850 词表中的单词，但它们拼接成的 "${activeA}${activeB}" 并不属于标准英语已接受的熟词。基本英语禁止捏造自定义词汇，必须是标准字典里已广泛使用的复合词（例如：bedroom, raincoat, input）。`,
    [activeA, activeB],
  );

  return {
    mode,
    affix: {
      roots: AFFIX_ROOTS,
      affixes: AFFIXES,
      activeRoot,
      setActiveRoot,
      activeAffix,
      setActiveAffix,
      validAffixEntry,
      bypassIdx,
      setBypassIdx,
      bypassCases: BYPASS_CASES,
      invalidAffixDetails,
    },
    compound: {
      wordAList,
      wordBList,
      activeA,
      setActiveA,
      activeB,
      setActiveB,
      selectedCompound,
      invalidCompoundDetails,
    },
    handleSpeak,
  };
}
