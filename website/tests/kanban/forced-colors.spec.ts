import { test, expect, type Page } from '@playwright/test';
import { VIEWS, openView, pressTab, settingsButton, openMoveMenu, openDepsNode, privateServer } from './helpers';

// Windows high-contrast mode (`forced-colors: active`), emulated by Playwright: the browser replaces author colours
// with the system palette, drops backgrounds images, gradients and box-shadows, and keeps author system colours
// (Highlight, CanvasText...). What is carried only by a fill, a shadow or a hue disappears. Checked on computed styles
// (never on pixels): focus outlines, control boundaries, states, progress fills, colour coding, chart colours, text
// and icon colours. Light and dark palettes (`colorScheme`).
//
// Engines: Chromium emulates the whole mode (light and dark palettes). Firefox forces the colours too, with its light
// palette only (colorScheme is ignored for the palette). WebKit only flips the media query and keeps the author
// colours, a state no real browser produces: the spec is skipped there. None of this is a real Windows machine.
//
// Own server on a private copy of the fixture (port 3793): the states test sets WIP limits.
// KANBAN_SCREENSHOTS=1 also saves one capture per scene and palette in results/ (git-ignored).

test.skip(
  ({ browserName }) => browserName === 'webkit',
  'WebKit emulates the media query only: author colours are not replaced'
);

const srv = privateServer(3793, 'forced-colors');
const US = 'US-200'; // writable in-progress story of the fixture
const ACTIVE = 'sprint-9-auth-premium';
const SHOTS = process.env.KANBAN_SCREENSHOTS === '1';

test.use({ baseURL: srv.origin, viewport: { width: 1280, height: 800 } });
test.describe.configure({ timeout: 90_000 }); // several views per test, a Tab walk over every control
test.beforeAll(() => srv.start());
test.afterAll(() => srv.stop());

// ---- In-page helpers (installed before the app boots) -------------------------------------------------------------
declare global {
  interface Window {
    __fc: {
      boxed: () => number[];
      boundaryFailures: (indices: number[]) => string[];
      focusFailure: () => string | null;
      activeKey: () => string;
      colourFailures: () => string[];
      signature: (selector: string, index?: number) => string;
      contrastToCanvas: (colour: string) => number;
      token: (selector: string, name: string) => string;
      visibleFill: (selector: string) => string | null;
      arrowless: () => string[];
      describe: (el: Element) => string;
    };
  }
}

function installHelpers() {
  const SYSTEM = [
    'Canvas',
    'CanvasText',
    'LinkText',
    'VisitedText',
    'ActiveText',
    'ButtonFace',
    'ButtonText',
    'ButtonBorder',
    'Field',
    'FieldText',
    'Highlight',
    'HighlightText',
    'SelectedItem',
    'SelectedItemText',
    'Mark',
    'MarkText',
    'GrayText',
    'AccentColor',
    'AccentColorText',
  ];
  const BOX = [
    'button',
    'a.btn',
    'input:not([type=checkbox]):not([type=radio]):not([type=hidden])',
    'select',
    'textarea',
    '.card',
    '.column',
    '.chip',
    '.points',
    '.search',
    '.sprint-item',
    '.epic',
    '.toast',
    'dialog[open]',
  ].join(',');
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
  /** Any CSS colour (system keywords and oklch included) as sRGB bytes, through a 1px canvas. */
  const cache = new Map<string, number[]>(); // computed values only: a keyword (CanvasText) depends on the mode
  const rgba = (colour: string) => {
    const hit = cache.get(colour);
    if (hit) return hit;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#00000000';
    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, 1, 1);
    const bytes = [...ctx.getImageData(0, 0, 1, 1).data];
    if (colour.includes('(')) cache.set(colour, bytes);
    return bytes;
  };
  const resolve = (name: string) => {
    const s = document.createElement('span');
    s.style.cssText = `forced-color-adjust:none;color:${name}`;
    document.documentElement.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    return c;
  };
  const lum = ([r, g, b]: number[]) => {
    const f = (v: number) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const canvasRgb = () => rgba(resolve('Canvas')).slice(0, 3);
  /** Contrast of a colour painted on the system background (alpha composited over Canvas). */
  const contrastToCanvas = (colour: string) => {
    const bg = canvasRgb();
    const [r, g, b, a] = rgba(colour);
    const mixed = [r, g, b].map((v, i) => (v * a + bg[i] * (255 - a)) / 255);
    const [l1, l2] = [lum(mixed), lum(bg)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const seen = (c: string) => contrastToCanvas(c) >= 3; // WCAG 1.4.11 non-text contrast
  const shown = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    if (getComputedStyle(el).visibility === 'hidden') return false;
    return !el.closest('.sr-only, dialog:not([open])');
  };
  const describe = (el: Element) => {
    const h = el as HTMLElement;
    const cls =
      typeof h.className === 'string' ? h.className.split(' ').filter((c) => !c.startsWith('svelte-'))[0] : '';
    const name = (h.getAttribute('aria-label') || h.textContent || h.getAttribute('id') || '').trim().slice(0, 30);
    return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''} "${name}"`;
  };
  const SIDES = ['Top', 'Right', 'Bottom', 'Left'] as const;
  const border = (cs: CSSStyleDeclaration, side: (typeof SIDES)[number]) => {
    const w = parseFloat(cs.getPropertyValue(`border-${side.toLowerCase()}-width`));
    const st = cs.getPropertyValue(`border-${side.toLowerCase()}-style`);
    const col = cs.getPropertyValue(`border-${side.toLowerCase()}-color`);
    return w > 0 && st !== 'none' && st !== 'hidden' ? { w, st, col } : null;
  };
  const outlined = (cs: CSSStyleDeclaration) =>
    cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 && seen(cs.outlineColor);
  const framed = (cs: CSSStyleDeclaration) =>
    SIDES.every((s) => {
      const b = border(cs, s);
      return b && seen(b.col);
    });
  const effectiveBg = (el: Element | null): string => {
    for (let n = el; n; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (rgba(bg)[3] > 0) return bg;
    }
    return 'rgb(0, 0, 0)';
  };
  /** What survives the forced palette, as a string: visible borders, outline, fill, decoration, colour, opacity. */
  const features = (el: Element, pseudo?: string) => {
    const cs = getComputedStyle(el, pseudo);
    if (pseudo && (cs.content === 'none' || cs.content === 'normal')) return '';
    const f: string[] = [];
    for (const s of SIDES) {
      const b = border(cs, s);
      if (b && seen(b.col)) f.push(`border-${s}:${b.w}px ${b.st} ${b.col}`);
    }
    if (outlined(cs)) f.push(`outline:${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`);
    if (seen(cs.backgroundColor)) f.push(`fill:${cs.backgroundColor}`);
    if (cs.backgroundImage !== 'none') f.push(`image:${cs.backgroundImage}`);
    if (cs.textDecorationLine !== 'none') f.push(`decoration:${cs.textDecorationLine}`);
    if (cs.boxShadow !== 'none') f.push(`shadow:${cs.boxShadow}`);
    if (cs.opacity !== '1') f.push(`opacity:${cs.opacity}`);
    f.push(`colour:${cs.color}`);
    return f.join(' ');
  };
  const signature = (el: Element) => [features(el), features(el, '::before'), features(el, '::after')].join(' | ');

  window.__fc = {
    describe,
    contrastToCanvas,
    /** Drop-down lists without an arrow: neither the native control nor a drawn one (a background image). */
    arrowless: () =>
      [...document.querySelectorAll('select')]
        .filter((el) => shown(el))
        .filter((el) => {
          const cs = getComputedStyle(el);
          return cs.appearance === 'none' && !cs.backgroundImage.includes('('); // "none, none": two empty layers
        })
        .map(describe),
    /** Normal mode: indices of the controls and containers drawn as a box (four borders, or a fill of their own). */
    boxed: () =>
      [...document.querySelectorAll(BOX)].flatMap((el, i) => {
        if (!shown(el)) return [];
        const cs = getComputedStyle(el);
        const ownFill = rgba(cs.backgroundColor)[3] > 0 && cs.backgroundColor !== effectiveBg(el.parentElement);
        const allSides = SIDES.every((s) => {
          const b = border(cs, s);
          return b && rgba(b.col)[3] > 0;
        });
        return ownFill || allSides || cs.backgroundImage !== 'none' ? [i] : [];
      }),
    /** Forced mode: which of those boxes lost their outline (no visible border on every side, no outline). */
    boundaryFailures: (indices) => {
      const all = [...document.querySelectorAll(BOX)];
      return indices
        .map((i) => all[i])
        .filter((el) => {
          const cs = getComputedStyle(el);
          return !framed(cs) && !outlined(cs);
        })
        .map(describe);
    },
    activeKey: () => {
      const a = document.activeElement;
      if (!a || a === document.body) return 'body';
      return `${describe(a)}#${[...document.querySelectorAll('*')].indexOf(a)}`;
    },
    /** The focused element (or the container that draws its ring, like the search box) shows an outline. */
    focusFailure: () => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      for (let n: Element | null = a, depth = 0; n && depth < 3; n = n.parentElement, depth++) {
        const cs = getComputedStyle(n);
        if (cs.outlineStyle === 'auto' || outlined(cs)) return null;
      }
      const cs = getComputedStyle(a);
      return `${describe(a)} (outline ${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor})`;
    },
    /** Text and icons painted in a colour outside the system palette (only `forced-color-adjust: none` keeps one). */
    colourFailures: () => {
      const palette = new Set(SYSTEM.map((n) => rgba(resolve(n)).join()));
      const out: string[] = [];
      for (const el of document.querySelectorAll('body *')) {
        if (!shown(el) || el.closest('.chart-wrapper, .deps-canvas, .ring-wrap')) continue;
        const cs = getComputedStyle(el);
        const text = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
        if (text && !palette.has(rgba(cs.color).join())) out.push(`text ${describe(el)}: ${cs.color}`);
        if (el.tagName.toLowerCase() === 'svg' && cs.stroke !== 'none' && !palette.has(rgba(cs.stroke).join()))
          out.push(`icon ${describe(el.parentElement!)}: ${cs.stroke}`);
      }
      return out;
    },
    signature: (selector, index = 0) => {
      const el = document.querySelectorAll(selector)[index];
      return el ? signature(el) : `missing ${selector}`;
    },
    token: (selector, name) => getComputedStyle(document.querySelector(selector)!).getPropertyValue(name).trim(),
    /** null when the element shows a fill or a frame that stands out from the system background. */
    visibleFill: (selector) => {
      const el = document.querySelector(selector);
      if (!el) return `missing ${selector}`;
      const cs = getComputedStyle(el);
      if (!el.getBoundingClientRect().width) return `${selector} has no width`;
      return seen(cs.backgroundColor) || framed(cs) || outlined(cs) ? null : `${selector}: ${features(el)}`;
    },
  };
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(installHelpers);
});

/**
 * helpers.settled, restricted to rendered elements. Switching the palette starts a colour transition on every element
 * (reduced motion keeps a 0.001 ms one); Firefox never runs those of an element that is not rendered (the content of a
 * closed <details>, skipped by content-visibility): they stay pending and would block the wait. Such an element is
 * not measured anyway.
 */
const settled = (p: Page) =>
  p.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .filter((a) => {
          const target = (a.effect as KeyframeEffect | null)?.target;
          return !target || target.checkVisibility();
        })
        .map((a) => a.finished.catch(() => undefined))
    )
  );

/** No hover, no focus: states are compared at rest. */
async function rest(page: Page) {
  await page.mouse.move(1, 799);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await settled(page);
}

const forced = (page: Page, scheme: 'light' | 'dark') =>
  page.emulateMedia({ forcedColors: 'active', colorScheme: scheme, reducedMotion: 'reduce' });

/** Successful move without writing: the PATCH is answered by the test (success toast), plus an error toast. */
async function showToasts(p: Page) {
  await p.route(`**/api/stories/${US}/status`, async (route) => {
    const { stories } = await (await p.request.get('/api/stories')).json();
    const story = { ...stories.find((s: { id: string }) => s.id === US), status: 'review' };
    await route.fulfill({ json: { story, version: 'test' } });
  });
  await p.goto('/#/kanban?story=US-NOPE-99'); // unknown story -> persistent error toast
  await expect(p.locator('.toast.error')).toBeVisible();
  await openMoveMenu(p, US);
  await p.getByRole('menu').getByRole('menuitem').first().click();
  await expect(p.locator('.toast.success')).toBeVisible();
}

const openDetail = async (p: Page) => {
  await p.goto(`/#/kanban?story=${US}`);
  await expect(p.locator('dialog.modal[open]')).toBeVisible();
};

type Scene = { name: string; open: (p: Page) => Promise<void> };
const SCENES: Scene[] = [
  ...VIEWS.map((v) => ({ name: v.name, open: (p: Page) => openView(p, v.name) })),
  { name: 'story-detail', open: openDetail },
  {
    name: 'story-edit',
    open: async (p) => {
      await openDetail(p);
      await p.locator('dialog.modal[open]').getByRole('button', { name: 'Edit', exact: true }).click();
      await expect(p.locator('dialog.modal[open] #edit-title')).toBeFocused();
    },
  },
  {
    // Opened with the keyboard, like the Tab walk that follows: Firefox shows no ring on a control focused by script
    // when the previous focus came from the pointer (menu opened with a click, then left with Tab).
    name: 'move-menu',
    open: async (p) => {
      await openView(p, 'kanban');
      await p.locator(`[data-move-id="${US}"]`).focus();
      await p.keyboard.press('Enter');
      await expect(p.getByRole('menu')).toBeVisible();
    },
  },
  {
    name: 'create-form-errors',
    open: async (p) => {
      await openView(p, 'kanban');
      await p.getByRole('button', { name: 'New story' }).click();
      await p.getByRole('button', { name: 'Create story' }).click();
      await expect(p.locator('.sf-summary')).toBeFocused();
    },
  },
  {
    name: 'sprint-form-errors',
    open: async (p) => {
      await openView(p, 'sprints');
      await p.locator('.sprint-list-actions button').click();
      await p.locator('dialog.sprint-form[open] button[type="submit"]').click();
      await expect(p.locator('#sf-name-error')).toBeVisible();
    },
  },
  {
    name: 'close-sprint-dialog',
    open: async (p) => {
      await p.goto(`/#/sprints/${ACTIVE}`);
      await p.locator('.sd-actions button').click();
      await expect(p.locator('dialog.close-sprint[open] fieldset')).toBeVisible();
    },
  },
  {
    name: 'settings',
    open: async (p) => {
      await openView(p, 'kanban');
      await settingsButton(p).click();
      await expect(p.locator('dialog.tweaks-dialog[open] #wip-in-progress')).toBeVisible();
    },
  },
  {
    name: 'prompt-error',
    open: async (p) => {
      await openView(p, 'kanban');
      await openMoveMenu(p, US);
      await p.getByRole('menu').locator('[aria-keyshortcuts="6"]').click();
      await expect(p.locator('dialog.prompt-dialog[open] .dialog-input')).toBeFocused();
      await p.keyboard.press('Enter');
      await expect(p.locator('dialog.prompt-dialog .dialog-error')).toBeVisible();
    },
  },
  {
    name: 'delete-confirm',
    open: async (p) => {
      await openDetail(p);
      await p.locator('dialog.modal[open]').getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(p.getByRole('dialog', { name: /Delete .* Its file is moved to the trash/ })).toBeVisible();
    },
  },
  { name: 'toasts', open: showToasts },
  {
    name: 'filter-active',
    open: async (p) => {
      await p.goto('/#/kanban?prio=must,should');
      await expect(p.locator('.fb-chip[aria-pressed="true"]')).toHaveCount(2);
    },
  },
  {
    name: 'backlog-selection',
    open: async (p) => {
      await openView(p, 'backlog');
      await p.locator('#plan-scope').selectOption('backlog');
      await p.locator('li.story-item .row-select input').first().check();
      await expect(p.locator('.plan-actions')).toBeVisible();
    },
  },
  { name: 'deps-node', open: async (p) => (await openView(p, 'deps'), openDepsNode(p)) },
];

/** Tab through the page (or the open dialog) until the focus comes back; returns the controls without a ring. */
async function tabAround(page: Page, max = 90) {
  const failures: string[] = [];
  const keys = new Set<string>();
  for (let i = 0; i < max; i++) {
    await pressTab(page);
    const key = await page.evaluate(() => window.__fc.activeKey());
    if (keys.has(key)) break;
    keys.add(key);
    const fail = await page.evaluate(() => window.__fc.focusFailure());
    if (fail) failures.push(fail);
  }
  return { failures, stops: keys.size };
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`forced colours, ${scheme} palette`, () => {
    for (const scene of SCENES) {
      test(`${scene.name}: boundaries, text and icon colours, focus ring on every control`, async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await scene.open(page);
        await page.mouse.move(1, 799); // a hovered control would count as boxed by its hover fill
        await settled(page);
        const boxes = await page.evaluate(() => window.__fc.boxed());
        expect.soft(await page.evaluate(() => window.__fc.arrowless()), 'lists without an arrow').toEqual([]);
        await forced(page, scheme);
        await settled(page);
        if (SHOTS) await page.screenshot({ path: test.info().outputPath(`${scene.name}-${scheme}.png`) });

        expect.soft(await page.evaluate(() => window.__fc.arrowless()), 'lists without an arrow (forced)').toEqual([]);
        expect
          .soft(await page.evaluate((b) => window.__fc.boundaryFailures(b), boxes), 'boxes without a frame')
          .toEqual([]);
        expect
          .soft(await page.evaluate(() => window.__fc.colourFailures()), 'text or icon outside the palette')
          .toEqual([]);
        const { failures, stops } = await tabAround(page);
        expect.soft(stops, 'Tab reaches controls').toBeGreaterThan(0);
        expect.soft(failures, 'focused controls without an outline').toEqual([]);
      });
    }

    /** Two elements in the same view must not look alike once author colours are gone. */
    const distinct = async (page: Page, what: string, a: string, b: string) => {
      await rest(page);
      const sig = (s: string) => page.evaluate((x) => window.__fc.signature(x), s);
      const [x, y] = [await sig(a), await sig(b)];
      expect.soft(x, `${what}: ${a} is on the page`).not.toMatch(/^missing/);
      expect.soft(y, `${what}: ${b} is on the page`).not.toMatch(/^missing/);
      expect.soft(x, `${what}: "${a}" looks like "${b}"`).not.toBe(y);
    };

    test('states on the board: current page, filters, WIP limits, drop target, blocked, live', async ({ page }) => {
      await forced(page, scheme);
      const wip = (data: object) =>
        page.request.put(`${srv.origin}/api/settings/wip`, { headers: { Origin: srv.origin }, data });
      await wip({ 'in-progress': 1, 'ready-for-dev': 2 });
      try {
        await page.goto('/#/kanban');
        await expect(page.locator('.col-count.wip-over')).toHaveCount(1);
        await expect(page.locator('.col-count.wip-at')).toHaveCount(1);
        const plain = '.col-count:not(.wip-at):not(.wip-over)';
        await distinct(page, 'current page', '.nav-item[aria-current="page"]', '.nav-item:not([aria-current])');
        await distinct(page, 'unavailable button', '.fb-reset[aria-disabled="true"]', '.fb-btn:not(.fb-reset)');
        await distinct(page, 'WIP over vs none', '.col-count.wip-over', plain);
        await distinct(page, 'WIP at vs none', '.col-count.wip-at', plain);
        await distinct(page, 'WIP over vs at', '.col-count.wip-over', '.col-count.wip-at');
        await expect.soft(page.locator('.card-blocked').first()).toHaveText(/\S/);
        await expect.soft(page.locator('.live')).toHaveText(/\S/);

        const card = page.locator(`li.card:has([data-card-id="${US}"])`);
        const dt = await page.evaluateHandle(() => new DataTransfer());
        await card.dispatchEvent('dragstart', { dataTransfer: dt });
        await page.locator('section.column:has(#col-review)').dispatchEvent('dragover', { dataTransfer: dt });
        await expect(page.locator('.column.drop-target')).toHaveCount(1);
        const allowed = '.column:not(.drop-target):not(.drop-denied):has(.col-drop-note)';
        await distinct(page, 'drop target', '.column.drop-target', allowed);
        await distinct(page, 'drop refused', '.column.drop-denied', allowed);
        await card.dispatchEvent('dragend', { dataTransfer: dt });
      } finally {
        await wip({ 'in-progress': null, 'ready-for-dev': null });
      }
      await page.goto('/#/kanban?prio=must');
      await expect(page.locator('.fb-chip[aria-pressed="true"]')).toHaveCount(1);
      await distinct(page, 'pressed filter', '.fb-chip[aria-pressed="true"]', '.fb-chip[aria-pressed="false"]');
    });

    test('states elsewhere: disabled button, selected sprint, current document, settings', async ({ page }) => {
      await forced(page, scheme);
      // Story detail: a native disabled button (Move, no target chosen) next to an enabled one.
      await openDetail(page);
      const d = 'dialog.modal[open]';
      await distinct(page, 'disabled button', `${d} .sd-move button:disabled`, `${d} .sd-actions .btn`);

      await page.goto(`/#/sprints/${ACTIVE}`);
      await expect(page.locator('.sprint-item[aria-current="page"]')).toHaveCount(1);
      await distinct(page, 'selected sprint', '.sprint-item[aria-current="page"]', '.sprint-item:not([aria-current])');

      await openView(page, 'docs');
      const nav = page.locator('details.docs-nav');
      if ((await nav.getAttribute('open')) === null) await nav.locator('> summary').click();
      const collapsed = page.locator('.group-header[aria-expanded="false"]');
      while (await collapsed.count()) await collapsed.first().click();
      await page.locator('a.tree-item').first().click();
      await expect(page.locator('a.tree-item[aria-current="page"]')).toHaveCount(1);
      await distinct(page, 'current document', 'a.tree-item[aria-current="page"]', 'a.tree-item:not([aria-current])');

      await page.goto('/#/kanban');
      await settingsButton(page).click();
      await expect(page.locator('dialog.tweaks-dialog[open]')).toBeVisible();
      await distinct(page, 'selected option', '.tweak-opt.selected', '.tweak-opt:not(.selected)');
      await distinct(page, 'selected accent', '.swatch-btn.selected', '.swatch-btn:not(.selected)');
    });

    test('fields in error stay distinct from valid fields in every form', async ({ page }) => {
      await forced(page, scheme);
      await openView(page, 'kanban');
      await settingsButton(page).click();
      await page.locator('#wip-in-progress').fill('100');
      await page.locator('#wip-in-progress').press('Enter');
      await expect(page.locator('#wip-in-progress')).toHaveAttribute('aria-invalid', 'true');
      await distinct(page, 'field in error (WIP)', '#wip-in-progress', '#wip-review');

      await page.goto('about:blank');
      await openView(page, 'sprints');
      await page.locator('.sprint-list-actions button').click();
      await page.locator('#sf-goal').fill('A goal');
      await page.locator('dialog.sprint-form[open] button[type="submit"]').click();
      await expect(page.locator('#sf-name')).toHaveAttribute('aria-invalid', 'true');
      await distinct(page, 'field in error (sprint)', '#sf-name', '#sf-goal');

      await page.goto('about:blank');
      await openView(page, 'kanban');
      await page.getByRole('button', { name: 'New story' }).click();
      await page.getByRole('button', { name: 'Create story' }).click();
      await expect(page.locator('.sf-summary')).toBeFocused();
      const f = 'dialog[open] .sf';
      await distinct(page, 'field in error (story)', `${f} input[aria-invalid="true"]`, `${f} input:not([aria-invalid="true"])`);

      await page.goto('about:blank');
      await openView(page, 'kanban');
      await openMoveMenu(page, US);
      await page.getByRole('menu').locator('[aria-keyshortcuts="6"]').click();
      const input = 'dialog.prompt-dialog[open] .dialog-input';
      await rest(page);
      const before = await page.evaluate((x) => window.__fc.signature(x), input);
      await page.locator(input).press('Enter');
      await expect(page.locator('dialog.prompt-dialog .dialog-error')).toBeVisible();
      await rest(page);
      expect.soft(await page.evaluate((x) => window.__fc.signature(x), input), 'field in error (blocked reason)').not.toBe(before);
    });

    test('progress: the filled part stands out from the track and the page', async ({ page }) => {
      await forced(page, scheme);
      const fill = (s: string) => page.evaluate((x) => window.__fc.visibleFill(x), s);
      await openView(page, 'sprints');
      await expect
        .soft(await fill('.sprint-item .proj-bar > span[style*="width: 100%"]'), 'sprint progress fill')
        .toBeNull();
      await expect.soft(await fill('.sprint-item .proj-bar'), 'sprint progress track').toBeNull();
      await openView(page, 'kanban');
      await expect
        .soft(await fill('.task-prog .bar > span:not([style*="width: 0%"])'), 'task progress fill')
        .toBeNull();
      await expect.soft(await fill('.task-prog .bar'), 'task progress track').toBeNull();
      await openView(page, 'backlog');
      await expect(page.locator('.capacity[data-state="over"]')).toBeVisible();
      await expect.soft(await fill('.cap-track > span'), 'capacity fill').toBeNull();
      await expect.soft(await fill('.cap-track'), 'capacity track').toBeNull();
      // Epic rings: two strokes, the filled one stands out from the page and from the track.
      const ring = await page.evaluate(() => {
        const [track, bar] = [...document.querySelectorAll('.ring-wrap circle')]
          .slice(0, 2)
          .map((c) => getComputedStyle(c).stroke);
        return { track, bar, contrast: window.__fc.contrastToCanvas(bar) };
      });
      expect.soft(ring.bar, 'ring: filled part vs track').not.toBe(ring.track);
      expect.soft(ring.contrast, `ring: filled part on the page (${ring.bar})`).toBeGreaterThanOrEqual(3);
    });

    test('colour coding and colour dots: kept where colour is the content, labelled in text elsewhere', async ({
      page,
    }) => {
      await forced(page, scheme);
      await openView(page, 'kanban');
      // The legend and the card bars carry the coding chosen in Settings: their colours are kept, and match.
      const coding = await page.evaluate(() => {
        const legend = [...document.querySelectorAll('.coding-legend .key i')].map(
          (i) => getComputedStyle(i).backgroundColor
        );
        const bars = [...document.querySelectorAll('li.card')].map(
          (c) => getComputedStyle(c, '::before').backgroundColor
        );
        return { legend, bars, canvas: getComputedStyle(document.body).backgroundColor };
      });
      expect
        .soft(new Set(coding.legend).size, `legend swatches keep distinct colours (${coding.legend})`)
        .toBe(coding.legend.length);
      for (const bar of coding.bars) expect.soft(coding.legend, 'each card bar matches a legend colour').toContain(bar);
      // Status dots elsewhere sit next to their status in text.
      for (const [view, dot] of [
        ['backlog', '.s-status i'],
        ['deps', '.cell-status i'],
      ] as const) {
        await openView(page, view);
        if (view === 'backlog') await page.locator('.epic-head').first().click();
        const labels = await page
          .locator(dot)
          .evaluateAll((dots) => dots.map((d) => d.parentElement!.textContent!.trim()));
        expect.soft(labels.length, `${view}: status dots`).toBeGreaterThan(0);
        expect
          .soft(
            labels.filter((l) => !l),
            `${view}: dot without a text label`
          )
          .toEqual([]);
      }
    });

    test('charts are redrawn when the system palette is switched on with the page open', async ({ page }) => {
      // A canvas keeps the colours it was drawn with: switching high contrast on must rebuild the charts.
      const mark = (s: string) =>
        page.locator(s).evaluateAll((all) => all.forEach((c) => ((c as HTMLCanvasElement).dataset.old = '1')));
      const redrawn = (s: string) => page.locator(`${s}:not([data-old])`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openView(page, 'burndown');
      await expect(page.locator('.vel-chart canvas')).toBeAttached();
      await mark('.burn-card .chart-wrapper canvas');
      await mark('.vel-chart canvas');
      await forced(page, scheme);
      await expect.soft(redrawn('.burn-card .chart-wrapper canvas'), 'burndown redrawn').toHaveCount(1);
      await expect.soft(redrawn('.vel-chart canvas'), 'velocity redrawn').toHaveCount(1);

      await page.emulateMedia({ forcedColors: 'none' });
      await openView(page, 'deps');
      await expect(page.locator('.deps-canvas canvas').first()).toBeAttached();
      await mark('.deps-canvas canvas');
      await forced(page, scheme);
      await expect.soft(redrawn('.deps-canvas canvas').first(), 'graph redrawn').toBeAttached();
    });

    test('charts are drawn in system colours, their legend and tables stay', async ({ page }) => {
      await forced(page, scheme);
      const contrast = (selector: string, name: string) =>
        page.evaluate(([s, n]) => window.__fc.contrastToCanvas(window.__fc.token(s, n)), [selector, name] as const);
      await openView(page, 'burndown');
      await expect(page.locator('section.velocity table tbody tr').first()).toBeAttached();
      for (const chart of ['.burn-card .chart-wrapper', '.vel-chart']) {
        // Series and axis labels (--fg-dim), the actual / delivered series (--accent).
        expect.soft(await contrast(chart, '--fg-dim'), `${chart}: lines and labels`).toBeGreaterThanOrEqual(4.5);
        expect.soft(await contrast(chart, '--accent'), `${chart}: actual / delivered series`).toBeGreaterThanOrEqual(3);
      }
      const fill = (s: string) => page.evaluate((x) => window.__fc.visibleFill(x), s);
      expect.soft(await fill('.swatch-actual'), 'legend: actual').toBeNull();
      const sig = (s: string) => page.evaluate((x) => window.__fc.signature(x), s);
      expect
        .soft(await sig('.swatch-delivered'), 'legend: delivered (filled) vs committed (outline)')
        .not.toBe(await sig('.swatch-committed'));
      await expect.soft(page.locator('details.burn-data > summary')).toBeVisible();

      await openView(page, 'deps');
      await expect(page.locator('.deps-canvas canvas').first()).toBeAttached();
      expect.soft(await contrast('.deps-canvas', '--border-strong'), 'graph: edges').toBeGreaterThanOrEqual(3);
      await expect.soft(page.locator('table.deps-table tbody tr').first()).toBeVisible();
    });
  });
}
