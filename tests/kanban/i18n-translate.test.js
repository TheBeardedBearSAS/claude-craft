import { describe, it, expect } from 'vitest';
import {
  SUPPORTED_LOCALES,
  translate,
  translatePlural,
  pluralKey,
  formatDate,
  formatNumber,
  pickLocale,
} from '../../cli/kanban/client/src/lib/i18n/translate.js';

describe('SUPPORTED_LOCALES', () => {
  it('lists the five locales, English first', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'fr', 'es', 'de', 'pt']);
  });
});

describe('translate', () => {
  const fr = { 'a.hello': 'Bonjour {name}', 'a.only.fr': 'Seulement fr' };
  const en = { 'a.hello': 'Hello {name}', 'a.only.en': 'Only en' };

  it('uses the catalog first', () => {
    expect(translate(fr, en, 'a.hello', { name: 'Ada' })).toBe('Bonjour Ada');
  });

  it('falls back to the reference catalog, then to the key itself', () => {
    expect(translate(fr, en, 'a.only.en')).toBe('Only en');
    expect(translate(fr, en, 'a.missing')).toBe('a.missing');
  });

  it('replaces every occurrence of a token and keeps unknown tokens', () => {
    expect(translate({ k: '{a}-{a}-{b}' }, {}, 'k', { a: 1 })).toBe('1-1-{b}');
  });

  it('accepts 0 and empty string as parameter values', () => {
    expect(translate({ k: '{n}|{s}' }, {}, 'k', { n: 0, s: '' })).toBe('0|');
  });

  it('never throws on bad input', () => {
    expect(translate(null, undefined, 'k')).toBe('k');
    expect(translate({ k: 42 }, {}, 'k')).toBe('k');
    expect(translate({ k: 'x {a}' }, {}, 'k', null)).toBe('x {a}');
    expect(translate({}, {}, undefined)).toBe('');
  });

  it('does not interpret $ patterns in parameter values', () => {
    expect(translate({ k: 'v={a}' }, {}, 'k', { a: '$&$1' })).toBe('v=$&$1');
  });
});

describe('pluralKey', () => {
  it('picks .one / .other from Intl.PluralRules', () => {
    expect(pluralKey('en', 'x', 1)).toBe('x.one');
    expect(pluralKey('en', 'x', 0)).toBe('x.other');
    expect(pluralKey('en', 'x', 2)).toBe('x.other');
  });

  it('follows each language rules (French treats 0 as singular)', () => {
    expect(pluralKey('fr', 'x', 0)).toBe('x.one');
    expect(pluralKey('fr', 'x', 1)).toBe('x.one');
    expect(pluralKey('fr', 'x', 2)).toBe('x.other');
  });

  it('falls back to .other for categories we do not use and for bad locales', () => {
    expect(pluralKey('fr', 'x', 1000000)).toBe('x.other');
    expect(pluralKey('not a locale!!', 'x', 1)).toBe('x.other');
  });
});

describe('translatePlural', () => {
  const en = { 'n.one': '{n} story', 'n.other': '{n} stories', 'm.other': '{n} items' };

  it('selects the plural form and injects n', () => {
    expect(translatePlural({}, en, 'en', 'n', 1)).toBe('1 story');
    expect(translatePlural({}, en, 'en', 'n', 3)).toBe('3 stories');
  });

  it('falls back to .other when the singular form is absent', () => {
    expect(translatePlural({}, en, 'en', 'm', 1)).toBe('1 items');
  });

  it('lets explicit params override n', () => {
    expect(translatePlural({}, en, 'en', 'n', 2, { n: 'two' })).toBe('two stories');
  });
});

describe('formatDate / formatNumber', () => {
  it('formats a calendar date without timezone drift', () => {
    expect(formatDate('en', '2026-11-11', { dateStyle: 'medium' })).toBe('Nov 11, 2026');
    expect(formatDate('fr', '2026-11-11', { dateStyle: 'long' })).toBe('11 novembre 2026');
  });

  it('formats an ISO timestamp', () => {
    expect(formatDate('en', '2026-11-11T10:00:00Z', { dateStyle: 'medium', timeZone: 'UTC' })).toBe('Nov 11, 2026');
  });

  it('returns an empty string for invalid or missing dates', () => {
    expect(formatDate('en', 'nope')).toBe('');
    expect(formatDate('en', '')).toBe('');
    expect(formatDate('en', null)).toBe('');
  });

  it('tolerates an invalid locale', () => {
    expect(formatDate('???', '2026-11-11')).not.toBe('');
  });

  it('formats numbers per locale', () => {
    expect(formatNumber('en', 1234.5)).toBe('1,234.5');
    expect(formatNumber('de', 1234.5)).toBe('1.234,5');
  });

  it('returns an empty string for non-finite numbers', () => {
    expect(formatNumber('en', NaN)).toBe('');
    expect(formatNumber('en', undefined)).toBe('');
  });
});

describe('pickLocale', () => {
  it('prefers a supported saved locale', () => {
    expect(pickLocale('de', ['fr-FR'])).toBe('de');
  });

  it('ignores an unsupported saved locale', () => {
    expect(pickLocale('xx', ['fr-FR'])).toBe('fr');
  });

  it('reduces regional tags to the base language', () => {
    expect(pickLocale(null, ['fr-CA'])).toBe('fr');
    expect(pickLocale(null, ['pt_BR'])).toBe('pt');
    expect(pickLocale(null, ['ES'])).toBe('es');
  });

  it('takes the first supported navigator language', () => {
    expect(pickLocale(null, ['ja-JP', 'de-AT', 'fr'])).toBe('de');
  });

  it('defaults to en', () => {
    expect(pickLocale(null, ['ja'])).toBe('en');
    expect(pickLocale(undefined, undefined)).toBe('en');
    expect(pickLocale(null, [])).toBe('en');
  });

  it('honours a custom supported list', () => {
    expect(pickLocale(null, ['fr'], ['en', 'de'])).toBe('en');
  });
});
