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
  const dim = size === 'sm' ? 'w-8 h-8 text-[15px]' : 'w-9 h-9 text-[17px]';

  return (
    <div
      className={`shrink-0 ${dim} rounded-full flex items-center justify-center leading-none select-none transition-all duration-300 bg-white border border-slate-100 ${
        isSelf ? 'ring-1 ring-[#2f7d4f]/25' : ''
      } ${
        speaking ? 'scale-110 ring-2 ring-slate-200 shadow-sm animate-pulse' : ''
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
  speakingRole = null,
}: {
  characters: { A: SceneCharacter; B: SceneCharacter };
  compact?: boolean;
  speakingRole?: 'A' | 'B' | null;
}) {
  return (
    <div className={`flex items-center justify-center gap-4 ${compact ? 'py-1' : 'py-2'}`}>
      {(['A', 'B'] as const).map((role) => {
        const speaking = speakingRole === role;
        return (
          <div
            key={role}
            className={`flex items-center gap-1.5 min-w-0 rounded-full border px-2 py-0.5 transition-all duration-300 ${
              speaking
                ? 'border-amber-300 bg-amber-50 shadow-[0_0_0_2px_rgba(251,191,36,0.3)] animate-pulse'
                : 'border-transparent'
            }`}
          >
            <CharacterAvatar
              speaker={role}
              character={characters[role]}
              size="sm"
              speaking={speaking}
            />
            <span className="text-[11px] font-semibold text-slate-600 truncate">
              {characters[role].name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
