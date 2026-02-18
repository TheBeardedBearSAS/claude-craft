import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./')
  })

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Claude Craft/)
  })

  test('has all 6 sections', async ({ page }) => {
    for (const id of ['features', 'tools', 'quickstart', 'install', 'technologies', 'agents']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
    }
  })

  test('has nav and footer', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('has main landmark', async ({ page }) => {
    await expect(page.locator('main')).toBeAttached()
  })

  test('stats grid has 6 values', async ({ page }) => {
    const stats = page.locator('.stats-grid > div')
    await expect(stats).toHaveCount(6)
  })

  test('stats grid uses dl element', async ({ page }) => {
    await expect(page.locator('dl.stats-grid')).toBeAttached()
  })

  test('language switcher has 5 options', async ({ page }) => {
    const select = page.locator('select[aria-label="Select language"]')
    await expect(select).toBeVisible()
    const options = select.locator('option')
    await expect(options).toHaveCount(5)
  })

  test('CTA links are present', async ({ page }) => {
    await expect(page.locator('a[href="#quickstart"]')).toBeVisible()
    await expect(page.locator('a[href*="getting-started/quickstart"]')).toBeVisible()
  })

  test('GitHub link has accessible name', async ({ page }) => {
    const ghLinks = page.locator('a[aria-label="GitHub repository"]')
    expect(await ghLinks.count()).toBeGreaterThanOrEqual(1)
  })

  test('no Tailwind CDN script', async ({ page }) => {
    const tailwindScript = await page.locator('script[src*="tailwindcss"]').count()
    expect(tailwindScript).toBe(0)
  })

  test('responsive CSS classes exist', async ({ page }) => {
    await expect(page.locator('.stats-grid')).toBeAttached()
    await expect(page.locator('.grid-3col').first()).toBeAttached()
    await expect(page.locator('.grid-2col').first()).toBeAttached()
    await expect(page.locator('.mobile-menu-btn')).toBeAttached()
  })
})
