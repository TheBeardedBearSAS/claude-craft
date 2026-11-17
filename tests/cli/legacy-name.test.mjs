import { describe, it, expect } from 'vitest';
import { legacyNameNotice } from '../../cli/lib/legacy-name.js';

/**
 * 10.0.0 renomme claude-craft en bear-craft. Le binaire `claude-craft` reste un alias
 * pendant la 10.x et doit prévenir l'utilisateur, sans bruit sous le nouveau nom.
 */
describe('legacyNameNotice', () => {
  it('prévient quand le CLI est lancé sous l’ancien nom de binaire', () => {
    for (const argv1 of [
      '/usr/local/bin/claude-craft',
      'C:\\Users\\me\\AppData\\Roaming\\npm\\claude-craft',
      '/home/me/.npm/_npx/abc/node_modules/.bin/claude-craft',
    ]) {
      const notice = legacyNameNotice(argv1);
      expect(notice, argv1).toMatch(/bear-craft/);
      expect(notice, argv1).toMatch(/@the-bearded-bear\/bear-craft/);
    }
  });

  it('reste silencieux sous le nouveau nom ou un lancement direct', () => {
    for (const argv1 of ['/usr/local/bin/bear-craft', '/repo/cli/index.js', undefined]) {
      expect(legacyNameNotice(argv1), String(argv1)).toBeNull();
    }
  });
});
