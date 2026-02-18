import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test('Ctrl+K opens search dialog', async ({ page }) => {
    await page.goto('en/getting-started/quickstart')

    // Open search via keyboard shortcut
    await page.keyboard.press('Control+k')

    // VitePress search modal should appear
    const searchModal = page.locator('.VPLocalSearchBox, #local-search, [role="dialog"]')
    await expect(searchModal.first()).toBeVisible({ timeout: 5000 })
  })
})
