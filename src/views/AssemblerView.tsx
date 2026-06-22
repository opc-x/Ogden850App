import { useState } from 'react';
import { SceneDialoguePanel } from '../components/assembler/SceneDialoguePanel';

interface AssemblerViewProps {
  onWordClick?: (wordId: string) => void;
  onSceneDetailChange?: (open: boolean) => void;
}

export function AssemblerView({ onWordClick, onSceneDetailChange }: AssemblerViewProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  const handleDetailChange = (open: boolean) => {
    setDetailOpen(open);
    onSceneDetailChange?.(open);
  };

  return (
    <div className={`w-full ${detailOpen ? 'h-full min-h-0 flex flex-col' : 'pb-2'}`}>
      <SceneDialoguePanel onWordClick={onWordClick} onSceneDetailChange={handleDetailChange} />
    </div>
  );
}

export default AssemblerView;
