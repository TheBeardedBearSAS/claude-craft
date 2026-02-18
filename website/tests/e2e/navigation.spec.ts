import { test, expect } from '@playwright/test'

test.describe('Sidebar navigation', () => {
  test('EN has 6 sidebar groups', async ({ page }) => {
    await page.goto('en/getting-started/quickstart')
    const groups = page.locator('.VPSidebarItem.level-0 > .item > .text')
    const texts = await groups.allTextContents()
    expect(texts).toEqual(
      expect.arrayContaining(['Getting Started', 'Reference', 'Guides', 'Frameworks', 'More', 'Migration'])
    )
  })

  test('FR has 4 sidebar groups', async ({ page }) => {
    await page.goto('fr/getting-started/quickstart')
    const groups = page.locator('.VPSidebarItem.level-0 > .item > .text')
    const texts = await groups.allTextContents()
    expect(texts).toEqual(
      expect.arrayContaining(['Démarrage', 'Référence', 'Guides', 'Plus'])
    )
  })

  test('ES has 2 sidebar groups', async ({ page }) => {
    await page.goto('es/getting-started/quickstart')
    const groups = page.locator('.VPSidebarItem.level-0 > .item > .text')
    const texts = await groups.allTextContents()
    expect(texts).toEqual(
      expect.arrayContaining(['Inicio', 'Guías'])
    )
  })

  test('DE has 2 sidebar groups', async ({ page }) => {
    await page.goto('de/getting-started/quickstart')
    const groups = page.locator('.VPSidebarItem.level-0 > .item > .text')
    const texts = await groups.allTextContents()
    expect(texts).toEqual(
      expect.arrayContaining(['Erste Schritte', 'Anleitungen'])
    )
  })

  test('PT has 2 sidebar groups', async ({ page }) => {
    await page.goto('pt/getting-started/quickstart')
    const groups = page.locator('.VPSidebarItem.level-0 > .item > .text')
    const texts = await groups.allTextContents()
    expect(texts).toEqual(
      expect.arrayContaining(['Início', 'Guias'])
    )
  })
})
