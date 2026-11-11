// The control that opened a dialog (see openerOf): the focused one, or under Safari on macOS the one just clicked.
import { openerOf } from './story-form.js';

const CONTROL = 'button, a[href], summary, [role="menuitem"], [tabindex]';
let clicked = null;

if (typeof document !== 'undefined') {
  document.addEventListener('click', (event) => (clicked = event.target?.closest?.(CONTROL) ?? null), true);
  document.addEventListener('keydown', () => (clicked = null), true); // a later keyboard action owns the focus
}

export const opener = () => openerOf(document.activeElement, document.body, clicked);
