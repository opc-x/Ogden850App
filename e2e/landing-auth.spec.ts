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

async function gotoLanding(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('landing-start')).toBeVisible({ timeout: 60_000 });
}

test.describe('Landing 三按钮（真实 Supabase）', () => {
  test('开始体验 → ensureGuestSession → /home', async ({ page }) => {
    await gotoLanding(page);
    await page.getByTestId('landing-start').click();
    await page.waitForURL('**/home', { timeout: 60_000 });
    const userId = await getSupabaseUserId(page);
    expect(userId, '访客应有 session user id').toBeTruthy();
  });

  test('邮箱注册 → /home', async ({ page }) => {
    const email = `e2e+${Date.now()}@example.com`;
    const password = 'TestPass1!';

    await gotoLanding(page);
    await page.getByTestId('landing-email').click();
    await page.getByPlaceholder('邮箱地址').fill(email);
    await page.getByPlaceholder('密码（至少 6 位）').fill(password);
    await page.getByTestId('email-submit').click();
    await page.waitForURL('**/home', { timeout: 60_000 });

    const userId = await getSupabaseUserId(page);
    expect(userId).toBeTruthy();
  });

  test('谷歌登录发起 OAuth（redirect 含 localhost）', async ({ page }) => {
    await gotoLanding(page);
    await page.getByTestId('landing-google').click();
    await page.waitForURL(/\/auth\/v1\/authorize/, { timeout: 15_000 });
    const url = decodeURIComponent(page.url());
    expect(url).toContain('provider=google');
    expect(url).toMatch(/localhost(:\d+)?/);
  });
});
