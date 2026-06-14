const PREFIX = "ogden-practice:";

export function markDone(module: string, lessonId: string): void {
  try {
    localStorage.setItem(`${PREFIX}${module}:${lessonId}`, "1");
  } catch {
    /* ignore */
  }
}

export function isDone(module: string, lessonId: string): boolean {
  try {
    return localStorage.getItem(`${PREFIX}${module}:${lessonId}`) === "1";
  } catch {
    return false;
  }
}

export function countDone(module: string, ids: string[]): number {
  return ids.filter((id) => isDone(module, id)).length;
}
