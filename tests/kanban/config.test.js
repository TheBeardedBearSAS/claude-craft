import { describe, it, expect } from 'vitest';
import {
  STATUS,
  PRIORITY,
  TDD,
  hashString,
  epicHue,
  codeColor,
  initials,
  avatarColor,
} from '../../cli/kanban/client/src/lib/config.js';

describe('hashString', () => {
  it('est déterministe', () => {
    expect(hashString('US-114')).toBe(hashString('US-114'));
  });
  it('diffère selon l\'entrée', () => {
    expect(hashString('EPIC-01')).not.toBe(hashString('EPIC-02'));
  });
  it('gère null/undefined sans crash', () => {
    expect(hashString(null)).toBe(hashString(''));
    expect(typeof hashString(undefined)).toBe('number');
  });
});

describe('epicHue', () => {
  it('retourne --fg-faint quand epicId est vide', () => {
    expect(epicHue('')).toBe('var(--fg-faint)');
    expect(epicHue(null)).toBe('var(--fg-faint)');
  });
  it('produit une couleur oklch stable par id', () => {
    const a = epicHue('EPIC-01');
    expect(a).toMatch(/^oklch\(0\.78 0\.13 \d+\)$/);
    expect(epicHue('EPIC-01')).toBe(a);
  });
  it('varie selon l\'epic', () => {
    expect(epicHue('EPIC-01')).not.toBe(epicHue('EPIC-07'));
  });
});

describe('codeColor', () => {
  const story = {
    status: 'in-progress',
    priority: 'must',
    tdd_phase: 'green',
    epic_id: 'EPIC-03',
  };

  it('schéma status → variable de statut', () => {
    expect(codeColor(story, 'status')).toBe(`var(${STATUS['in-progress'].cssVar})`);
  });
  it('schéma priority → variable de priorité', () => {
    expect(codeColor(story, 'priority')).toBe(`var(${PRIORITY.must.cssVar})`);
  });
  it('schéma tdd → variable TDD', () => {
    expect(codeColor(story, 'tdd')).toBe(`var(${TDD.green.cssVar})`);
  });
  it('schéma epic → teinte d\'epic', () => {
    expect(codeColor(story, 'epic')).toBe(epicHue('EPIC-03'));
  });
  it('défaut (schéma inconnu) → statut', () => {
    expect(codeColor(story, 'wat')).toBe(`var(${STATUS['in-progress'].cssVar})`);
  });
  it('statut inconnu → --border', () => {
    expect(codeColor({ status: 'zzz' }, 'status')).toBe('var(--border)');
  });
  it('tdd manquant → --fg-faint', () => {
    expect(codeColor({ tdd_phase: null }, 'tdd')).toBe('var(--fg-faint)');
  });
  it('story null → --border', () => {
    expect(codeColor(null, 'status')).toBe('var(--border)');
  });
});

describe('initials', () => {
  it('deux mots → première lettre de chaque', () => {
    expect(initials('Alice Martin')).toBe('AM');
  });
  it('séparateurs variés (. _ -)', () => {
    expect(initials('jean.dupont')).toBe('JD');
    expect(initials('back_end')).toBe('BE');
  });
  it('un seul mot → deux premières lettres', () => {
    expect(initials('claude')).toBe('CL');
  });
  it('vide → ?', () => {
    expect(initials('')).toBe('?');
    expect(initials(null)).toBe('?');
  });
});

describe('avatarColor', () => {
  it('déterministe par nom', () => {
    expect(avatarColor('Alice')).toBe(avatarColor('Alice'));
  });
  it('couleur oklch valide', () => {
    expect(avatarColor('Bob')).toMatch(/^oklch\(0\.78 0\.12 \d+\)$/);
  });
  it('vide → fond inset', () => {
    expect(avatarColor('')).toBe('var(--bg-inset)');
  });
});
