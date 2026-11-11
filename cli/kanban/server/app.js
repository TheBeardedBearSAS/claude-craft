import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { secureHeaders } from 'hono/secure-headers';
import { bodyLimit } from 'hono/body-limit';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { csrfGuard, hostGuard, readonlyGuard, resolveSafe } from './middleware/security.js';
import { readWipLimits } from './services/kanban-config.js';
import { register as registerStories, BODY_ROUTE_RE } from './routes/stories.js';
import { register as registerSprints } from './routes/sprints.js';
import { register as registerSettings } from './routes/settings.js';

const BODY_LIMIT = 64 * 1024;

/**
 * Build the Hono app. Kept separate from the HTTP server boot so tests can
 * invoke routes via app.request() without opening a socket.
 *
 * @param {object} opts
 * @param {import('./services/repository.js').Repository} opts.repository
 * @param {number} opts.port
 * @param {boolean} [opts.readonly=false]
 * @param {string} [opts.projectRoot] - Parent of project-management/, defaults to parent of repository.rootDir
 * @param {string} [opts.user='kanban'] - Name reported by /api/health
 * @returns {Hono}
 */
export function createApp({
  repository,
  port,
  readonly = false,
  eventBus = null,
  projectRoot = null,
  user = 'kanban',
}) {
  const resolvedProjectRoot = projectRoot ?? path.dirname(repository.rootDir);
  const app = new Hono();

  app.use('*', hostGuard(port));

  // Baseline response hardening.
  // crossOriginEmbedderPolicy: require-corp isole le processus renderer (SEC-003).
  // xFrameOptions: DENY prévient le clickjacking (renforcé vs défaut SAMEORIGIN).
  // Pas de CSP personnalisé : le dashboard bundlé repose sur des assets inline servis localement.
  app.use(
    '*',
    secureHeaders({
      crossOriginEmbedderPolicy: true,
      xFrameOptions: 'DENY',
    })
  );
  app.use('*', csrfGuard(port));
  app.use('*', readonlyGuard(readonly));
  // The markdown body route sets its own, larger limit (routes/stories.js).
  const smallBody = bodyLimit({ maxSize: BODY_LIMIT, onError: (c) => c.json({ error: 'payload_too_large' }, 413) });
  app.use('*', (c, next) => (BODY_ROUTE_RE.test(c.req.path) ? next() : smallBody(c, next)));

  app.get('/api/health', async (c) =>
    c.json({ ok: true, readonly, user, wip_limits: await readWipLimits(resolvedProjectRoot) })
  );

  app.get('/api/diagnostics', (c) => c.json(repository.diagnostics()));

  app.get('/api/stories', (c) => {
    const sprintId = c.req.query('sprint_id') || undefined;
    const status = c.req.query('status') || undefined;
    const epicId = c.req.query('epic_id') || undefined;
    return c.json({
      stories: repository.listStories({ sprintId, status, epicId }),
      epics: repository.listEpics(),
    });
  });

  app.get('/api/stories/:id', (c) => {
    const id = c.req.param('id');
    const story = repository.getStory(id);
    if (!story) return c.json({ error: 'not_found' }, 404);
    const tasks = repository.listTasksForStory(id);
    const body = repository.getStoryBody(id);
    return c.json({ story, tasks, body });
  });

  app.get('/api/dependencies', (c) => {
    return c.json(repository.buildDependenciesGraph());
  });

  app.get('/api/docs', (c) => {
    return c.json({ docs: repository.listDocs().map((d) => ({ rel: d.rel, category: d.category })) });
  });

  app.get('/api/docs/:rel{.+}', async (c) => {
    const rel = c.req.param('rel');
    try {
      resolveSafe(repository.rootDir, rel);
    } catch {
      // resolveSafe only throws on traversal: the 400 is the whole handling.
      return c.json({ error: 'invalid_path' }, 400);
    }
    const content = await repository.readDoc(rel);
    if (content === null) return c.json({ error: 'not_found' }, 404);
    return c.text(content);
  });

  registerStories(app, { repository, projectRoot: resolvedProjectRoot, user, eventBus });

  app.get('/api/events', (c) => {
    if (!eventBus) return c.json({ error: 'events_disabled' }, 501);
    return streamSSE(c, async (stream) => {
      const unsubscribe = eventBus.subscribe((msg) => {
        stream
          .writeSSE({
            event: msg.event,
            data: JSON.stringify(msg),
          })
          .catch(() => {
            // Rejected only once this client is gone; onAbort unsubscribes it. Nothing to report.
          });
      });
      stream.onAbort(() => unsubscribe());
      try {
        // A comment line right away: some browsers report the stream as open only once data has arrived.
        await stream.write(': connected\n\n');
        // heartbeat toutes les 30s
        while (!stream.aborted) {
          await stream.sleep(30_000);
          await stream.writeSSE({ event: 'heartbeat', data: String(Date.now()) });
        }
      } catch {
        // sleep/write reject once the client disconnects: end of stream, nothing to report.
      }
      unsubscribe();
    });
  });

  registerSprints(app, { repository, projectRoot: resolvedProjectRoot, eventBus });
  registerSettings(app, { projectRoot: resolvedProjectRoot, eventBus });

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(__dirname, '../client/dist');
  if (fs.existsSync(clientDist)) {
    app.use('/assets/*', serveStatic({ root: path.relative(process.cwd(), clientDist) }));
    const indexHtml = fs.readFileSync(path.join(clientDist, 'index.html'), 'utf8');
    app.get('/', (c) => c.html(indexHtml));
  } else {
    app.get('/', (c) =>
      c.text('claude-craft kanban : client not built.\n' + 'Run "npm run kanban:build" to build the UI.\n')
    );
  }

  return app;
}
