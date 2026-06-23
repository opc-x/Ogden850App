/** 本地默认头像插画 — 戴耳麦沉浸式小绵羊 */
export const DEFAULT_AVATAR_URL = '/assets/avatars/default-sheep-avatar.png';

/** 未上传自定义头像，或仍为旧版 DiceBear 占位 */
export function isLegacyDefaultAvatar(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url === DEFAULT_AVATAR_URL) return true;
  return url.includes('dicebear.com');
}
