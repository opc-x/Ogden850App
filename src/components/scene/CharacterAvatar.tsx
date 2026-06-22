import type { SceneCharacter } from '../../types/scene';

interface CharacterAvatarProps {
  speaker: 'A' | 'B';
  character: Pick<SceneCharacter, 'name' | 'emoji'>;
  isSelf?: boolean;
  speaking?: boolean;
  size?: 'sm' | 'md';
}

export function CharacterAvatar({
  speaker,
  character,
  isSelf,
  speaking = false,
  size = 'md',
}: CharacterAvatarProps) {
  const isA = speaker === 'A';
  const dim = size === 'sm' ? 'w-8 h-8 text-[15px]' : 'w-9 h-9 text-[17px]';

  return (
    <div
      className={`shrink-0 ${dim} rounded-full flex items-center justify-center leading-none select-none transition-all duration-300 ${
        isA
          ? 'bg-cyan-100 ring-2 ring-cyan-200/80'
          : 'bg-emerald-100 ring-2 ring-emerald-200/80'
      } ${isSelf ? 'ring-[#2f7d4f] ring-offset-1' : ''} ${
        speaking ? 'scale-110 ring-amber-400 ring-offset-2 shadow-[0_0_12px_rgba(251,191,36,0.45)] animate-pulse' : ''
      }`}
      title={isSelf ? `你 · ${character.name}` : character.name}
      aria-label={character.name}
    >
      {character.emoji}
    </div>
  );
}

export function fallbackCharacter(speaker: 'A' | 'B'): SceneCharacter {
  return speaker === 'A'
    ? { name: '甲', emoji: '👤' }
    : { name: '乙', emoji: '👥' };
}

export function SceneCharacterStrip({
  characters,
  compact = false,
}: {
  characters: { A: SceneCharacter; B: SceneCharacter };
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center justify-center gap-4 ${compact ? 'py-1' : 'py-2'}`}>
      {(['A', 'B'] as const).map((role) => (
        <div key={role} className="flex items-center gap-1.5 min-w-0">
          <CharacterAvatar speaker={role} character={characters[role]} size="sm" />
          <span className="text-[11px] font-semibold text-slate-600 truncate">{characters[role].name}</span>
        </div>
      ))}
    </div>
  );
}
