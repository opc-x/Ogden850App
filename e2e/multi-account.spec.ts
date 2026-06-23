import { expect, test, type Page } from '@playwright/test';

async function getSupabaseUserId(page: Page): Promise<string> {
  return page.evaluate(() => {
    const tokenKey = Object.keys(localStorage).find((k) => k.endsWith('-auth-token'));
    if (!tokenKey) return '';
    const raw = localStorage.getItem(tokenKey);
    if (!raw) return '';
    const parsed = JSON.parse(raw) as {
      user?: { id?: string };
      currentSession?: { user?: { id?: string } };
    };
    return parsed.user?.id ?? parsed.currentSession?.user?.id ?? '';
  });
}

async function readScopedLearningStatus(page: Page, userId: string) {
  return page.evaluate((uid) => {
    const raw = localStorage.getItem(`ogden850_learning_status:${uid}`);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  }, userId);
}

async function startAsGuest(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('ogden850_mock_guest_auth', 'true');
  });
  await page.goto('/');
  await page.getByTestId('landing-start').click();
  await page.waitForURL('**/home', { timeout: 60_000 });
  const userId = await getSupabaseUserId(page);
  expect(userId, '访客登录后应有 Supabase user id').toBeTruthy();
  return userId;
}

test.describe('多账号身份与进度隔离', () => {
  test('两个独立 Browser Context 获得不同访客身份与进度', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    const userA = await startAsGuest(pageA);
    const userB = await startAsGuest(pageB);
    expect(userA).not.toBe(userB);

    await pageA.evaluate(
      ({ uid }) => {
        localStorage.setItem(`ogden850_learning_status:${uid}`, JSON.stringify({ hand: 'mastered' }));
      },
      { uid: userA },
    );
    await pageB.evaluate(
      ({ uid }) => {
        localStorage.setItem(`ogden850_learning_status:${uid}`, JSON.stringify({ warm: 'learning' }));
      },
      { uid: userB },
    );

    const progressA = await readScopedLearningStatus(pageA, userA);
    const progressB = await readScopedLearningStatus(pageB, userB);

    expect(progressA).toEqual({ hand: 'mastered' });
    expect(progressB).toEqual({ warm: 'learning' });
    expect(progressA).not.toEqual(progressB);

    await contextA.close();
    await contextB.close();
  });

  test('刷新页面后保持同一访客 userId', async ({ page }) => {
    const firstUser = await startAsGuest(page);
    await page.reload();
    await page.waitForURL('**/home', { timeout: 60_000 });
    const afterReload = await getSupabaseUserId(page);
    expect(afterReload).toBe(firstUser);
  });

  test('退出后再次开始体验会恢复同一访客身份', async ({ page }) => {
    const firstUser = await startAsGuest(page);
    const deviceIdBefore = await page.evaluate(() => localStorage.getItem('ogden850_device_id'));
    expect(deviceIdBefore).toBeTruthy();

    await page.getByTestId('header-user').click();
    await page.waitForURL('**/profile');
    await page.getByTestId('profile-sign-out').click();

    await page.goto('/');
    // 退出后本机凭证仍在：可能自动恢复 session 直达 /home，否则再点「开始体验」
    const reachedHome = await page
      .waitForURL('**/home', { timeout: 8_000 })
      .then(() => true)
      .catch(() => false);
    if (!reachedHome) {
      await page.getByTestId('landing-start').click();
      await page.waitForURL('**/home', { timeout: 60_000 });
    }
    const secondUser = await getSupabaseUserId(page);
    expect(secondUser).toBeTruthy();
    expect(secondUser).toBe(firstUser);

    const deviceIdAfter = await page.evaluate(() => localStorage.getItem('ogden850_device_id'));
    expect(deviceIdAfter).toBe(deviceIdBefore);
  });
});
