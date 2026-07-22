import { describe, it, expect } from 'vitest';
import { TECHNOLOGIES, LANGUAGES, TRACKS } from '../../cli/lib/constants.js';

describe('TECHNOLOGIES', () => {
  it('contains all 11 selectable technologies (php, docker, coolify excluded)', () => {
    const keys = Object.keys(TECHNOLOGIES);
    expect(keys).toHaveLength(11);
    expect(keys).toContain('symfony');
    expect(keys).toContain('flutter');
    expect(keys).toContain('react');
    expect(keys).toContain('reactnative');
    expect(keys).toContain('angular');
    expect(keys).toContain('csharp');
    expect(keys).toContain('laravel');
    expect(keys).toContain('vuejs');
    expect(keys).toContain('vite');
    expect(keys).toContain('python');
    expect(keys).toContain('paperclip');
    // php is auto-included with symfony/laravel — not a standalone menu option (audit DA-PM-03)
    expect(keys).not.toContain('php');
    // docker and coolify are infra techs — not in the installation menu (audit CLI-02)
    expect(keys).not.toContain('docker');
    expect(keys).not.toContain('coolify');
  });

  it('each technology has name and desc', () => {
    for (const [key, tech] of Object.entries(TECHNOLOGIES)) {
      expect(tech).toHaveProperty('name');
      expect(tech).toHaveProperty('desc');
      expect(typeof tech.name).toBe('string');
      expect(typeof tech.desc).toBe('string');
      expect(tech.name.length).toBeGreaterThan(0);
      expect(tech.desc.length).toBeGreaterThan(0);
    }
  });
});

describe('LANGUAGES', () => {
  it('contains all 5 supported languages', () => {
    const keys = Object.keys(LANGUAGES);
    expect(keys).toHaveLength(5);
    expect(keys).toEqual(['en', 'fr', 'es', 'de', 'pt']);
  });

  it('each language has a non-empty display name', () => {
    for (const [key, name] of Object.entries(LANGUAGES)) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });
});

describe('TRACKS', () => {
  it('contains quick, standard, and enterprise tracks', () => {
    expect(Object.keys(TRACKS)).toEqual(['quick', 'standard', 'enterprise']);
  });

  it('each track has name, desc, and phases', () => {
    for (const [key, track] of Object.entries(TRACKS)) {
      expect(track).toHaveProperty('name');
      expect(track).toHaveProperty('desc');
      expect(track).toHaveProperty('phases');
      expect(typeof track.phases).toBe('number');
      expect(track.phases).toBeGreaterThan(0);
    }
  });

  it('phases increase with complexity', () => {
    expect(TRACKS.quick.phases).toBeLessThan(TRACKS.standard.phases);
    expect(TRACKS.standard.phases).toBeLessThan(TRACKS.enterprise.phases);
  });
});
