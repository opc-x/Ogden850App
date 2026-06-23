import { useRef, useState, type ReactNode } from 'react';
import { Camera, Check, Pencil, RotateCcw, X } from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { compressAvatarFile } from '../../lib/avatarImage';
import { isLegacyDefaultAvatar } from '../../lib/defaultAvatar';
import type { UserProfile } from '../../types/auth';

interface EditableProfileIdentityProps {
  profile: UserProfile;
  onSave: (patch: { displayName?: string; avatarUrl?: string | null }) => Promise<void>;
  meta?: ReactNode;
}

export function EditableProfileIdentity({ profile, onSave, meta }: EditableProfileIdentityProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.displayName ?? '学习者');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasCustomAvatar = profile.avatarUrl && !isLegacyDefaultAvatar(profile.avatarUrl);
  const displayName = profile.displayName ?? '学习者';

  async function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === displayName) {
      setEditingName(false);
      setNameDraft(displayName);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({ displayName: trimmed });
      setEditingName(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setBusy(false);
    }
  }

  async function handleAvatarFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await compressAvatarFile(file);
      await onSave({ avatarUrl: dataUrl });
    } catch (e) {
      setError(e instanceof Error ? e.message : '头像上传失败');
    } finally {
      setBusy(false);
    }
  }

  async function resetAvatar() {
    setBusy(true);
    setError(null);
    try {
      await onSave({ avatarUrl: null });
    } catch (e) {
      setError(e instanceof Error ? e.message : '恢复默认失败');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <button
          type="button"
          data-testid="profile-avatar-edit"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:opacity-60"
          aria-label="更换头像"
        >
          <UserAvatar profile={profile} size="lg" className="border-2 border-white shadow-md ring-2 ring-emerald-100/80" />
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#2f7d4f] text-white shadow-sm">
            <Camera className="h-3.5 w-3.5" />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void handleAvatarFile(file);
          }}
        />
      </div>

      {hasCustomAvatar && (
        <button
          type="button"
          data-testid="profile-avatar-reset"
          disabled={busy}
          onClick={() => void resetAvatar()}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-[#2f7d4f] disabled:opacity-50"
        >
          <RotateCcw className="h-3 w-3" />
          恢复默认头像
        </button>
      )}

      <div className="mt-3 w-full">
        {editingName ? (
          <div className="mx-auto w-full max-w-[16rem] space-y-2">
            <input
              data-testid="profile-name-input"
              value={nameDraft}
              maxLength={24}
              disabled={busy}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void saveName();
                if (e.key === 'Escape') {
                  setEditingName(false);
                  setNameDraft(displayName);
                }
              }}
              className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-center text-lg font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-400/40"
              autoFocus
            />
            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                data-testid="profile-name-save"
                disabled={busy || !nameDraft.trim()}
                onClick={() => void saveName()}
                className="rounded-xl bg-emerald-50 p-2 text-[#2f7d4f] hover:bg-emerald-100 disabled:opacity-50"
                aria-label="保存昵称"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setEditingName(false);
                  setNameDraft(displayName);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/80 disabled:opacity-50"
                aria-label="取消"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            data-testid="profile-name-edit"
            disabled={busy}
            onClick={() => {
              setNameDraft(displayName);
              setEditingName(true);
            }}
            className="group w-full disabled:opacity-60"
          >
            <span className="grid w-full grid-cols-[1fr_auto_1fr] items-center">
              <span aria-hidden />
              <span className="max-w-[min(100%,16rem)] truncate text-center text-xl font-black text-slate-800">
                {displayName}
              </span>
              <span className="flex items-center justify-start pl-1.5">
                <Pencil className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-[#2f7d4f]" />
              </span>
            </span>
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

      {meta && <div className="mt-4 w-full">{meta}</div>}
    </div>
  );
}
