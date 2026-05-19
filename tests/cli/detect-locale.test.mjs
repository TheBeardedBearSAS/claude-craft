import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectLocale } from '../../cli/lib/installer.js';

describe('detectLocale', () => {
  let originalLang;
  let originalLcAll;

  beforeEach(() => {
    originalLang = process.env.LANG;
    originalLcAll = process.env.LC_ALL;
    delete process.env.LANG;
    delete process.env.LC_ALL;
  });

  afterEach(() => {
    if (originalLang === undefined) {
      delete process.env.LANG;
    } else {
      process.env.LANG = originalLang;
    }
    if (originalLcAll === undefined) {
      delete process.env.LC_ALL;
    } else {
      process.env.LC_ALL = originalLcAll;
    }
  });

  it('returns "en" when no env vars are set', () => {
    expect(detectLocale()).toBe('en');
  });

  it('returns "fr" for LANG=fr_FR.UTF-8', () => {
    process.env.LANG = 'fr_FR.UTF-8';
    expect(detectLocale()).toBe('fr');
  });

  it('returns "fr" for LANG=fr_BE.UTF-8', () => {
    process.env.LANG = 'fr_BE.UTF-8';
    expect(detectLocale()).toBe('fr');
  });

  it('returns "es" for LANG=es_ES.UTF-8', () => {
    process.env.LANG = 'es_ES.UTF-8';
    expect(detectLocale()).toBe('es');
  });

  it('returns "es" for LANG=es_MX.UTF-8', () => {
    process.env.LANG = 'es_MX.UTF-8';
    expect(detectLocale()).toBe('es');
  });

  it('returns "de" for LANG=de_DE.UTF-8', () => {
    process.env.LANG = 'de_DE.UTF-8';
    expect(detectLocale()).toBe('de');
  });

  it('returns "pt" for LANG=pt_BR.UTF-8', () => {
    process.env.LANG = 'pt_BR.UTF-8';
    expect(detectLocale()).toBe('pt');
  });

  it('returns "pt" for LANG=pt_PT.UTF-8', () => {
    process.env.LANG = 'pt_PT.UTF-8';
    expect(detectLocale()).toBe('pt');
  });

  it('returns "en" for LANG=en_US.UTF-8', () => {
    process.env.LANG = 'en_US.UTF-8';
    expect(detectLocale()).toBe('en');
  });

  it('returns "en" for LANG=C', () => {
    process.env.LANG = 'C';
    expect(detectLocale()).toBe('en');
  });

  it('prefers LC_ALL over LANG when both are set', () => {
    process.env.LANG = 'en_US.UTF-8';
    process.env.LC_ALL = 'fr_FR.UTF-8';
    expect(detectLocale()).toBe('fr');
  });

  it('falls back to LANG when LC_ALL is not set', () => {
    process.env.LANG = 'de_DE.UTF-8';
    expect(detectLocale()).toBe('de');
  });

  it('returns "en" for unknown locale', () => {
    process.env.LANG = 'ja_JP.UTF-8';
    expect(detectLocale()).toBe('en');
  });
});
