import { MULTIPLY_MORE_STYLES } from './multiply-more/multiplyMoreStyles';
import { useMultiplyMoreState } from './multiply-more/useMultiplyMoreState';
import { AffixesPanel } from './multiply-more/AffixesPanel';
import { CompoundsPanel } from './multiply-more/CompoundsPanel';

export default function MultiplyMore({ mode = 'affixes' }: { mode?: 'affixes' | 'compounds' }) {
  const state = useMultiplyMoreState(mode);

  return (
    <div className="multiply">
      <style>{MULTIPLY_MORE_STYLES}</style>
      {mode === 'affixes' && <AffixesPanel affix={state.affix} handleSpeak={state.handleSpeak} />}
      {mode === 'compounds' && <CompoundsPanel compound={state.compound} handleSpeak={state.handleSpeak} />}
    </div>
  );
}
