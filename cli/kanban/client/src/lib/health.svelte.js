// Server capabilities, loaded once from GET /api/health.

import { request } from './api.js';

export const health = $state({ loaded: false, readonly: false, user: '', wipLimits: {} });

/** @returns {Promise<boolean>} true when the state was refreshed */
export async function loadHealth() {
  try {
    const data = await request('/api/health');
    health.readonly = data.readonly === true;
    health.user = data.user ?? '';
    health.wipLimits = data.wip_limits ?? {};
    health.loaded = true;
    return true;
  } catch {
    return false;
  }
}
