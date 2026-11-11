import { readJson, writeError } from './http-errors.js';
import { updateWipLimits } from '../services/kanban-config.js';
import { WipLimitsSchema } from '../../shared/schemas.js';

/**
 * Board settings. Only the WIP limits exist: `PUT /api/settings/wip` merges the given statuses
 * (number sets, null removes) into `.bmad/kanban.yaml`; `/api/health` exposes the result.
 *
 * @param {import('hono').Hono} app
 * @param {{ projectRoot: string, eventBus?: object|null }} deps
 */
export function register(app, { projectRoot, eventBus = null }) {
  app.put('/api/settings/wip', async (c) => {
    const read = await readJson(c, WipLimitsSchema);
    if (read.response) return read.response;
    try {
      const wip_limits = await updateWipLimits(projectRoot, read.data);
      eventBus?.publish('settings:updated', { wip_limits });
      return c.json({ wip_limits });
    } catch (err) {
      return writeError(c, err);
    }
  });
}
