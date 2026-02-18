import { test, expect } from '@playwright/test'

const ALL_PAGES = [
  './',
  // EN
  'en/getting-started/quickstart', 'en/getting-started/installation',
  'en/getting-started/prerequisites', 'en/getting-started/configuration',
  'en/reference/cli', 'en/reference/commands-full', 'en/reference/commands',
  'en/reference/agents', 'en/reference/agents-full', 'en/reference/skills',
  'en/reference/mcp', 'en/reference/hooks', 'en/reference/makefile',
  'en/reference/scripts', 'en/reference/technologies',
  'en/guides/01-getting-started', 'en/guides/02-project-creation',
  'en/guides/03-feature-development', 'en/guides/04-bug-fixing',
  'en/guides/05-tools-reference', 'en/guides/06-troubleshooting',
  'en/guides/07-backlog-management', 'en/guides/08-setup-new-project',
  'en/guides/09-setup-existing-project', 'en/guides/10-complete-workflow',
  'en/frameworks/bmad-guide', 'en/frameworks/ralph-guide', 'en/frameworks/agent-teams',
  'en/faq', 'en/troubleshooting', 'en/architecture', 'en/changelog', 'en/contributing',
  'en/migration/', 'en/migration/v4', 'en/migration/v6', 'en/migration/v7',
  // FR
  'fr/getting-started/quickstart', 'fr/getting-started/prerequisites', 'fr/reference/cli',
  'fr/guides/01-getting-started', 'fr/guides/02-project-creation',
  'fr/guides/03-feature-development', 'fr/guides/04-bug-fixing',
  'fr/guides/05-tools-reference', 'fr/guides/06-troubleshooting',
  'fr/guides/07-backlog-management', 'fr/guides/08-setup-new-project',
  'fr/guides/09-setup-existing-project', 'fr/guides/10-complete-workflow',
  'fr/faq', 'fr/troubleshooting',
  // ES
  'es/getting-started/quickstart', 'es/getting-started/prerequisites',
  'es/guides/01-getting-started', 'es/guides/02-project-creation',
  'es/guides/03-feature-development', 'es/guides/04-bug-fixing',
  'es/guides/05-tools-reference', 'es/guides/06-troubleshooting',
  'es/guides/07-backlog-management', 'es/guides/08-setup-new-project',
  'es/guides/09-setup-existing-project', 'es/guides/10-complete-workflow',
  // DE
  'de/getting-started/quickstart', 'de/getting-started/prerequisites',
  'de/guides/01-getting-started', 'de/guides/02-project-creation',
  'de/guides/03-feature-development', 'de/guides/04-bug-fixing',
  'de/guides/05-tools-reference', 'de/guides/06-troubleshooting',
  'de/guides/07-backlog-management', 'de/guides/08-setup-new-project',
  'de/guides/09-setup-existing-project', 'de/guides/10-complete-workflow',
  // PT
  'pt/getting-started/quickstart', 'pt/getting-started/prerequisites',
  'pt/guides/01-getting-started', 'pt/guides/02-project-creation',
  'pt/guides/03-feature-development', 'pt/guides/04-bug-fixing',
  'pt/guides/05-tools-reference', 'pt/guides/06-troubleshooting',
  'pt/guides/07-backlog-management', 'pt/guides/08-setup-new-project',
  'pt/guides/09-setup-existing-project', 'pt/guides/10-complete-workflow',
]

test.describe('All pages load', () => {
  for (const path of ALL_PAGES) {
    test(`${path} returns 200 with content`, async ({ request }) => {
      const resp = await request.get(path)
      expect(resp.status()).toBe(200)

      const html = await resp.text()
      expect(html.length).toBeGreaterThan(500)
      expect(html).not.toContain('Page Not Found')
    })
  }
})

// Representative content checks (1 per locale + 1 reference page)
const SAMPLE_PAGES = [
  'en/getting-started/quickstart',
  'en/reference/commands-full',
  'fr/getting-started/quickstart',
  'es/getting-started/quickstart',
  'de/getting-started/quickstart',
  'pt/getting-started/quickstart',
]

test.describe('Doc pages have proper content', () => {
  for (const path of SAMPLE_PAGES) {
    test(`${path} has h1 and content`, async ({ page }) => {
      await page.goto(path)
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()

      const content = page.locator('.vp-doc')
      const text = await content.textContent()
      expect((text ?? '').length).toBeGreaterThan(100)
    })
  }
})

test('404 page works', async ({ page }) => {
  await page.goto('nonexistent-page')
  await expect(page.locator('h1')).toContainText('PAGE NOT FOUND')
  await expect(page).toHaveTitle(/404/)
})
