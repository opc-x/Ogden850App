/** 有限并发 worker 池 — 审计/生成批次共用 */

export async function runPool<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(Math.max(1, concurrency), items.length) }, () => worker()),
  );
  return results;
}

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** 429 / RESOURCE_EXHAUSTED 指数退避重试 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxAttempts?: number; baseDelayMs?: number; label?: string } = {},
): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 4;
  const baseDelayMs = opts.baseDelayMs ?? 2000;
  let lastErr: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const retryable =
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('rate') ||
        msg.includes('quota');
      if (!retryable || attempt === maxAttempts) throw err;
      const delay = baseDelayMs * 2 ** (attempt - 1);
      if (opts.label) {
        console.warn(`  [retry ${attempt}/${maxAttempts - 1}] ${opts.label}: ${msg.slice(0, 80)}… wait ${delay}ms`);
      }
      await sleep(delay);
    }
  }
  throw lastErr;
}
