import { test, expect, type Page } from '@playwright/test';
import en from '../../../cli/kanban/client/src/lib/i18n/locales/en.js';
import fr from '../../../cli/kanban/client/src/lib/i18n/locales/fr.js';
import { VIEWS, DESKTOP, ZOOM400, READONLY_ORIGIN, openView, setTweaks, settingsButton, openMoveMenu } from './helpers';

// What axe does not see (audit K-16, K-17, K-24..K-32, K-34): motion, target size, focus after an action,
// duplicated or late live regions, headings, landmarks, language of the UI, text spacing, menu keyboard pattern.

const US = 'US-200';

/** The shared fixture server keeps state between specs: put US-200 back where it started. */
test.afterEach(async ({ page }) => {
  const origin = new URL(test.info().project.use.baseURL!).origin;
  await page.request.patch(`/api/stories/${US}/status`, {
    data: { status: 'in-progress' },
    headers: { Origin: origin },
  });
});

const activeIsBody = (page: Page) =>
  page.evaluate(() => !document.activeElement || document.activeElement === document.body);

// ---- K-31: motion ------------------------------------------------------------------------------------
test('motion: with prefers-reduced-motion, nothing animates forever (pseudo-elements included)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openView(page, 'kanban');
  await expect(page.locator('.live.live-on')).toBeVisible();
  const infinite = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.getComputedTiming().iterations === Infinity)
      .map((a) => `${(a as CSSAnimation).animationName} ${(a.effect as KeyframeEffect).pseudoElement ?? ''}`)
  );
  expect(infinite).toEqual([]);
});

// ---- K-31 / WCAG 2.5.8: target size --------------------------------------------------------------------
const SMALL_TARGETS = () =>
  [...document.querySelectorAll('button, a[href], input, select, summary, [role="menuitem"]')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') return false;
      if (el.closest('.sr-only, .md-body, .doc-paper, [inert]')) return false; // links inside prose (inline exception)
      if (el.closest('dialog:not([open])')) return false;
      return r.width < 24 || r.height < 24;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return `${el.tagName.toLowerCase()}.${(el as HTMLElement).className.split(' ')[0]} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`;
    });

for (const vp of [DESKTOP, ZOOM400]) {
  test(`targets: every control is at least 24x24 px on each view at ${vp.width}px`, async ({ page }) => {
    await page.setViewportSize(vp);
    const small: string[] = [];
    for (const v of VIEWS) {
      await openView(page, v.name);
      if (v.name === 'docs')
        await page.locator('details.docs-nav').evaluate((d) => ((d as HTMLDetailsElement).open = true));
      small.push(...(await page.evaluate(SMALL_TARGETS)).map((s) => `${v.name}: ${s}`));
    }
    await openView(page, 'kanban');
    await openMoveMenu(page, US);
    small.push(...(await page.evaluate(SMALL_TARGETS)).map((s) => `move-menu: ${s}`));
    await page.keyboard.press('Escape');
    await page.goto(`/#/kanban?story=${US}`);
    await expect(page.locator('dialog.modal[open]')).toBeVisible();
    small.push(...(await page.evaluate(SMALL_TARGETS)).map((s) => `detail: ${s}`));
    await page.keyboard.press('Escape');
    await settingsButton(page).click();
    small.push(...(await page.evaluate(SMALL_TARGETS)).map((s) => `settings: ${s}`));
    expect(small).toEqual([]);
  });
}

// ---- focus is never lost after an action ---------------------------------------------------------------
test('focus: cancelling the blocked-reason prompt returns focus to the Move button', async ({ page }) => {
  await openView(page, 'kanban');
  await page.locator(`[data-move-id="${US}"]`).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menu').locator('[aria-keyshortcuts="6"]').press('Enter');
  await expect(page.locator('dialog[open] #prompt-dialog-input')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator(`[data-move-id="${US}"]`)).toBeFocused();
});

test('focus: dismissing a toast from the keyboard does not drop focus to the page', async ({ page }) => {
  await page.goto('/#/kanban?story=US-NOPE-99'); // persistent error toast
  const close = page.locator('.toast.error .toast-close');
  await close.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.toast.error')).toHaveCount(0);
  expect(await activeIsBody(page)).toBe(false);
});

test('focus: "Clear filters" in the filter bar keeps focus on a control', async ({ page }) => {
  await page.goto('/#/kanban?prio=must');
  await page.locator('.fb-reset').focus();
  await page.keyboard.press('Enter');
  await expect(page).not.toHaveURL(/prio=/);
  expect(await activeIsBody(page)).toBe(false);
});

test('focus: "Clear filters" of the no-result state keeps focus on a control', async ({ page }) => {
  await page.goto('/#/kanban?q=zzzz-no-such-story');
  await page.locator('.board-empty button').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator(`[data-card-id="${US}"]`)).toBeVisible();
  expect(await activeIsBody(page)).toBe(false);
});

test('focus: every focused control shows a visible indicator (keyboard walk on each view)', async ({ page }) => {
  test.slow(); // 240 key presses
  const missing: string[] = [];
  for (const v of VIEWS) {
    await openView(page, v.name);
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const bad = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const ring = (e: Element) => {
          const cs = getComputedStyle(e);
          return (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== 'none';
        };
        const container = el.closest('.search');
        return ring(el) || (container && ring(container))
          ? null
          : `${el.tagName}.${el.className} "${(el.textContent || '').trim().slice(0, 20)}"`;
      });
      if (bad) missing.push(`${v.name}: ${bad}`);
    }
  }
  // Menu items, focused by the menu itself after Alt+M.
  await openView(page, 'kanban');
  await page.locator(`[data-card-id="${US}"]`).focus();
  await page.keyboard.press('Alt+m');
  const item = page.getByRole('menuitem').first();
  await expect(item).toBeFocused();
  const style = await item.evaluate((e) => getComputedStyle(e).outlineStyle + getComputedStyle(e).boxShadow);
  if (style === 'nonenone') missing.push('move-menu: menuitem');
  expect([...new Set(missing)]).toEqual([]);
});

// ---- K-26 / K-32: live regions -------------------------------------------------------------------------
test('live regions: a move is announced once (toast), not twice', async ({ page }) => {
  await openView(page, 'kanban');
  await openMoveMenu(page, US);
  await page.getByRole('menu').locator('[aria-keyshortcuts="6"]').click();
  await page.locator('dialog[open] #prompt-dialog-input').fill('waiting');
  await page.keyboard.press('Enter');
  await expect(page.locator('.toast.success')).toBeVisible();
  const regions = await page.evaluate(
    (id) =>
      [...document.querySelectorAll('[role="status"], [role="alert"], [aria-live]')]
        .filter((r) => !r.parentElement?.closest('[role="status"], [role="alert"], [aria-live]'))
        .filter((r) => (r.textContent || '').includes(id))
        .map((r) => r.textContent!.trim()),
    US
  );
  expect(regions).toHaveLength(1);
});

// A view (direct child of <main>) may mount with its initial state; after that, a message must land in a
// region that already exists (WCAG 4.1.3, ARIA22) — otherwise screen readers may say nothing.
test('live regions: inside a mounted view, no status/alert region is inserted together with its message', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const late: string[] = ((window as unknown as { lateRegions: string[] }).lateRegions = []);
    addEventListener('load', () =>
      setTimeout(() => {
        new MutationObserver((records) => {
          for (const r of records)
            for (const n of r.addedNodes) {
              if (!(n instanceof Element) || n.parentElement?.id === 'main') continue; // view mount
              const regions = [n, ...n.querySelectorAll('*')].filter((e) =>
                e.matches('[role="status"], [role="alert"], [aria-live]')
              );
              for (const e of regions)
                if ((e.textContent || '').trim())
                  late.push(`${e.getAttribute('role')}: ${e.textContent!.trim().slice(0, 40)}`);
            }
        }).observe(document.body, { childList: true, subtree: true });
      }, 1500)
    );
  });
  await openView(page, 'kanban');
  await page.waitForTimeout(1600);
  // Prompt: empty reason -> inline error.
  await openMoveMenu(page, US);
  await page.getByRole('menu').locator('[aria-keyshortcuts="6"]').click();
  await page.keyboard.press('Enter');
  await expect(page.locator('#prompt-dialog-error')).not.toBeEmpty();
  await page.keyboard.press('Escape');
  // Detail dialog: tasks loading.
  await page.locator(`[data-card-id="${US}"]`).click();
  await expect(page.locator('dialog.modal[open]')).toBeVisible();
  await page.keyboard.press('Escape');
  // Sprints: pick a sprint; Docs: pick a document.
  await page.getByRole('navigation').first().locator('a[href="#/sprints"]').click();
  await page.locator('.sprint-item').nth(1).click();
  await expect(page.locator('.sd-head')).toBeVisible();
  await page.getByRole('navigation').first().locator('a[href="#/docs"]').click();
  await page.locator('.docs-nav a.tree-item').first().click();
  await expect(page.locator('.doc-paper')).toBeVisible();
  const late = await page.evaluate(() => (window as unknown as { lateRegions: string[] }).lateRegions);
  expect(late).toEqual([]);
});

// ---- 2.5.3: the visible label of a control is part of its accessible name ------------------------------
const LABEL_NOT_IN_NAME = () => {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
  return [...document.querySelectorAll('button[aria-label], a[aria-label], [role="menuitem"][aria-label]')]
    .filter((el) => el.getClientRects().length && !el.closest('dialog:not([open])'))
    .filter((el) => {
      const visible = norm((el as HTMLElement).innerText || '');
      return visible && !norm(el.getAttribute('aria-label')!).includes(visible);
    })
    .map((el) => `"${(el as HTMLElement).innerText.trim()}" not in "${el.getAttribute('aria-label')}"`);
};

test('label in name: every labelled control keeps its visible text in its accessible name', async ({ page }) => {
  // Give a sprint story some tasks so the task toggles render (the fixture's task files carry none).
  await page.route(/\/api\/sprints\/[^/?]+$/, async (route) => {
    const res = await route.fetch();
    const body = await res.json();
    if (body.stories?.length) {
      const us_id = body.stories[0].id;
      body.tasks = [{ id: 'T-1', us_id, type: 'BE', status: 'done', estimation_hours: 1, actual_hours: 1 }];
    }
    await route.fulfill({ response: res, json: body });
  });
  const problems: string[] = [];
  for (const v of VIEWS) {
    await openView(page, v.name);
    problems.push(...(await page.evaluate(LABEL_NOT_IN_NAME)).map((s) => `${v.name}: ${s}`));
  }
  await openView(page, 'sprints');
  await page.locator('.sprint-item').first().click();
  await expect(page.locator('button.task-toggle').first()).toBeVisible();
  problems.push(...(await page.evaluate(LABEL_NOT_IN_NAME)).map((s) => `sprint: ${s}`));
  expect(problems).toEqual([]);
});

test('deps at 320px: a story id in the table never breaks across lines', async ({ page }) => {
  await page.setViewportSize(ZOOM400);
  await openView(page, 'deps');
  const broken = await page.evaluate(() =>
    [...document.querySelectorAll('.deps-table a')]
      .filter((a) => a.getClientRects().length > 1)
      .map((a) => a.textContent)
  );
  expect(broken).toEqual([]);
});

// ---- K-29: structure -----------------------------------------------------------------------------------
test('structure: heading levels never skip a level, on every view and in the dialogs', async ({ page }) => {
  const skips: string[] = [];
  const check = async (where: string) => {
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
        .filter((h) => h.getClientRects().length || h.closest('.sr-only'))
        .filter((h) => !h.closest('dialog:not([open])'))
        .map((h) => Number(h.tagName[1]))
    );
    levels.forEach((l, i) => i > 0 && l > levels[i - 1] + 1 && skips.push(`${where}: h${levels[i - 1]} -> h${l}`));
    if (levels[0] !== 1) skips.push(`${where}: first heading is h${levels[0]}`);
  };
  for (const v of VIEWS) {
    await openView(page, v.name);
    await check(v.name);
  }
  await page.goto(`/#/kanban?story=${US}`);
  await expect(page.locator('dialog.modal[open]')).toBeVisible();
  await check('detail');
  expect(skips).toEqual([]);
});

test('structure: landmarks of the same kind all have distinct, non-empty names', async ({ page }) => {
  const problems: string[] = [];
  for (const v of VIEWS) {
    await openView(page, v.name);
    for (const role of ['navigation', 'search', 'region', 'complementary', 'banner', 'main'] as const) {
      const all = page.getByRole(role);
      const n = await all.count();
      if (role === 'banner' || role === 'main') {
        if (n !== 1) problems.push(`${v.name}: ${n} ${role}`);
        continue;
      }
      const names: string[] = [];
      for (let i = 0; i < n; i++) {
        const el = all.nth(i);
        names.push(
          await el.evaluate((e) => {
            const by = e.getAttribute('aria-labelledby');
            return (by ? document.getElementById(by)?.textContent : e.getAttribute('aria-label'))?.trim() ?? '';
          })
        );
      }
      if (n > 1 && (names.includes('') || new Set(names).size !== n))
        problems.push(`${v.name}: ${role} ${JSON.stringify(names)}`);
    }
  }
  // A dialog's header must not become a second banner.
  await page.goto(`/#/kanban?story=${US}`);
  await expect(page.locator('dialog.modal[open]')).toBeVisible();
  const inDetail = await page.locator('dialog[open]').getByRole('banner').count();
  if (inDetail) problems.push(`detail dialog: ${inDetail} banner`);
  await page.keyboard.press('Escape');
  await settingsButton(page).click();
  const inSettings = await page.locator('dialog[open]').getByRole('banner').count();
  if (inSettings) problems.push(`settings dialog: ${inSettings} banner`);
  expect(problems).toEqual([]);
});

// ---- K-23 / K-29: language -----------------------------------------------------------------------------
test('language: in French no interface string is left in English, and the title and lang follow', async ({ page }) => {
  // English strings that French translates differently (no parameter, at least 4 letters).
  const english = new Set(
    Object.entries(en as Record<string, string>)
      .filter(([k, v]) => !v.includes('{') && v.length >= 4 && (fr as Record<string, string>)[k] !== v)
      .map(([, v]) => v)
  );
  for (const v of Object.values(fr as Record<string, string>)) english.delete(v);
  await setTweaks(page, { lang: 'fr' });
  const leftovers: string[] = [];
  for (const v of VIEWS) {
    await openView(page, v.name);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    const texts = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('.md-body, .doc-paper, script, style')) continue;
        for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent!.trim()) out.push(n.textContent!.trim());
        for (const a of ['aria-label', 'placeholder', 'title']) {
          const value = el.getAttribute(a);
          if (value) out.push(value.trim());
        }
      }
      return out;
    });
    leftovers.push(...texts.filter((s) => english.has(s)).map((s) => `${v.name}: ${s}`));
    // French typography: a colon is preceded by a (no-break) space, never glued to the word.
    leftovers.push(...texts.filter((s) => /\p{L}:(\s|$)/u.test(s)).map((s) => `${v.name}: colon in "${s}"`));
  }
  expect(await page.title()).toContain('Documents');
  expect([...new Set(leftovers)]).toEqual([]);
});

// ---- K-24 / 1.4.12 / 1.4.4: spacing and text size -----------------------------------------------------
const CLIPPED = () =>
  [...document.querySelectorAll('body *')]
    .filter((e) => {
      const cs = getComputedStyle(e);
      if (!e.getClientRects().length || cs.visibility === 'hidden') return false;
      if (e.closest('.sr-only, svg, canvas, .table-scroll, .doc-paper, .md-body, .board, dialog:not([open])'))
        return false;
      const x = e.scrollWidth > e.clientWidth + 1 && ['hidden', 'clip'].includes(cs.overflowX);
      const y = e.scrollHeight > e.clientHeight + 1 && ['hidden', 'clip'].includes(cs.overflowY);
      return (x || y) && (e.textContent || '').trim() !== '';
    })
    .map((e) => `${e.tagName}.${(e as HTMLElement).className} "${(e.textContent || '').trim().slice(0, 30)}"`);

const SPACING =
  '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';

test('text spacing (1.4.12) at 320px: no horizontal scroll and no clipped text on any view', async ({ page }) => {
  await page.setViewportSize(ZOOM400);
  const problems: string[] = [];
  for (const v of VIEWS) {
    await openView(page, v.name);
    await page.addStyleTag({ content: SPACING });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    if (overflow > 0) problems.push(`${v.name}: scrolls ${overflow}px`);
    problems.push(...(await page.evaluate(CLIPPED)).map((s) => `${v.name}: ${s}`));
  }
  expect(problems).toEqual([]);
});

test('text at 200 % (1.4.4) at 1280px: no clipped text on any view', async ({ page }) => {
  const problems: string[] = [];
  for (const v of VIEWS) {
    await openView(page, v.name);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    problems.push(...(await page.evaluate(CLIPPED)).map((s) => `${v.name}: ${s}`));
  }
  expect(problems).toEqual([]);
});

test('German at 320px: the filter bar shows each selected value in full', async ({ page }) => {
  await setTweaks(page, { lang: 'de' });
  await page.setViewportSize(ZOOM400);
  for (const view of ['kanban', 'backlog']) {
    await openView(page, view);
    const cut = await page.evaluate(() =>
      [...document.querySelectorAll('.filter-bar select')].flatMap((s) => {
        const select = s as HTMLSelectElement;
        const cs = getComputedStyle(select);
        const ctx = document.createElement('canvas').getContext('2d')!;
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const need = ctx.measureText(select.selectedOptions[0].text).width + parseFloat(cs.paddingLeft) + 20;
        return need > select.clientWidth
          ? [`${select.selectedOptions[0].text} (${Math.round(need)} > ${select.clientWidth})`]
          : [];
      })
    );
    expect(cut, view).toEqual([]);
  }
});

// ---- K-16 / K-34: the Move menu follows the menu-button pattern -----------------------------------------
test('move menu: arrows, Home and End move focus and wrap; Tab closes it; Enter activates', async ({ page }) => {
  await openView(page, 'kanban');
  const button = page.locator(`[data-move-id="${US}"]`);
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const items = page.getByRole('menu', { name: `Move ${US} to:` }).getByRole('menuitem');
  await expect(items.first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(items.last()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(items.first()).toBeFocused();
  await page.keyboard.press('End');
  await expect(items.last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(items.first()).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(items.last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(await activeIsBody(page)).toBe(false);
});

// ---- K-17: read-only server ----------------------------------------------------------------------------
test('read-only: banner shown, no Move button and no draggable card', async ({ page }) => {
  await page.goto(`${READONLY_ORIGIN}/#/kanban`);
  await expect(page.locator('.banner-info')).toBeVisible();
  await expect(page.locator('[data-card-id]').first()).toBeVisible();
  await expect(page.locator('[data-move-id]')).toHaveCount(0);
  await expect(page.locator('li.card[draggable="true"]')).toHaveCount(0);
});

// ---- visual check: modal dialogs sit in the middle of the screen, inside it -----------------------------
for (const vp of [DESKTOP, { width: 320, height: 640 }]) {
  test(`dialogs: settings, detail and prompt are centred and fully on screen at ${vp.width}px`, async ({ page }) => {
    await page.setViewportSize(vp);
    const off: string[] = [];
    const check = async (name: string) => {
      const r = await page.locator('dialog[open]').evaluate((d) => d.getBoundingClientRect().toJSON());
      if (r.left < 0 || r.right > vp.width || Math.abs(r.left - (vp.width - r.right)) > 2)
        off.push(`${name}: left ${Math.round(r.left)}, right gap ${Math.round(vp.width - r.right)}`);
    };
    await openView(page, 'kanban');
    await settingsButton(page).click();
    await check('settings');
    await page.keyboard.press('Escape');
    await page.goto(`/#/kanban?story=${US}`);
    await expect(page.locator('dialog.modal[open]')).toBeVisible();
    await check('detail');
    await page.keyboard.press('Escape');
    await openMoveMenu(page, US);
    await page.getByRole('menu').locator('[aria-keyshortcuts="6"]').click();
    await check('prompt');
    expect(off).toEqual([]);
  });
}
