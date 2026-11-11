import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { createIdempotencyStore, idempotent, isValidKey } from '../../cli/kanban/server/services/idempotency.js';

const KEY = 'a1b2c3d4-e5f6-4789-a012-b3c4d5e6f708';

describe('isValidKey', () => {
  it('accepts 8..128 visible ASCII characters', () => {
    expect(isValidKey('12345678')).toBe(true);
    expect(isValidKey('x'.repeat(128))).toBe(true);
    expect(isValidKey(KEY)).toBe(true);
  });
  it('refuses shorter, longer, empty, spaced or control-character keys', () => {
    for (const bad of ['1234567', 'x'.repeat(129), '', 'has space 1234', 'tab\t12345678', 'é'.repeat(10), null])
      expect(isValidKey(bad)).toBe(false);
  });
});

describe('createIdempotencyStore', () => {
  it('runs the task once per scope and key; the second call gets the first value', async () => {
    const store = createIdempotencyStore();
    const task = vi.fn(async () => ({ n: Math.random() }));
    const first = await store.run('POST /a', KEY, task);
    const second = await store.run('POST /a', KEY, task);
    expect(task).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });

  it('shares the in-flight task between concurrent calls', async () => {
    const store = createIdempotencyStore();
    let release;
    const task = vi.fn(() => new Promise((resolve) => (release = () => resolve('done'))));
    const a = store.run('POST /a', KEY, task);
    const b = store.run('POST /a', KEY, task);
    release();
    expect(await Promise.all([a, b])).toEqual(['done', 'done']);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('binds the key to its scope: the same key on another route runs again', async () => {
    const store = createIdempotencyStore();
    const task = vi.fn(async () => 1);
    await store.run('POST /a', KEY, task);
    await store.run('POST /b', KEY, task);
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('forgets a key after the ttl', async () => {
    let t = 0;
    const store = createIdempotencyStore({ ttlMs: 1000, now: () => t });
    const task = vi.fn(async () => 1);
    await store.run('s', KEY, task);
    t = 999;
    await store.run('s', KEY, task);
    expect(task).toHaveBeenCalledTimes(1);
    t = 1001;
    await store.run('s', KEY, task);
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('is bounded: the oldest entry is dropped beyond maxEntries', async () => {
    const store = createIdempotencyStore({ maxEntries: 2 });
    const task = vi.fn(async () => 1);
    for (const k of ['key-00001', 'key-00002', 'key-00003']) await store.run('s', k, task);
    expect(store.size).toBe(2);
    await store.run('s', 'key-00001', task);
    expect(task).toHaveBeenCalledTimes(4);
  });

  it('does not keep a value refused by shouldCache, nor a rejected task: the retry runs again', async () => {
    const store = createIdempotencyStore();
    const refused = vi.fn(async () => ({ ok: false }));
    await store.run('s', KEY, refused, (v) => v.ok);
    await store.run('s', KEY, refused, (v) => v.ok);
    expect(refused).toHaveBeenCalledTimes(2);

    const boom = vi.fn(async () => {
      throw new Error('x');
    });
    await expect(store.run('s', 'key-boom-1', boom)).rejects.toThrow('x');
    await expect(store.run('s', 'key-boom-1', boom)).rejects.toThrow('x');
    expect(boom).toHaveBeenCalledTimes(2);
    expect(store.size).toBe(0);
  });
});

describe('idempotent (Hono handler wrapper)', () => {
  function build() {
    const app = new Hono();
    const hits = { n: 0 };
    const status = { code: 201 };
    app.post('/things/:id', idempotent(createIdempotencyStore(), async (c) => {
      hits.n += 1;
      return c.json({ n: hits.n, id: c.req.param('id') }, status.code);
    }));
    const post = (url, key) => app.request(url, { method: 'POST', headers: key ? { 'Idempotency-Key': key } : {} });
    return { post, hits, status };
  }

  it('without the header every request runs', async () => {
    const { post, hits } = build();
    await post('/things/a');
    await post('/things/a');
    expect(hits.n).toBe(2);
  });

  it('replays status and body of the first answer, marked Idempotent-Replayed', async () => {
    const { post, hits } = build();
    const first = await post('/things/a', KEY);
    const second = await post('/things/a', KEY);
    expect(hits.n).toBe(1);
    expect(second.status).toBe(201);
    expect(await second.json()).toEqual(await first.json());
    expect(second.headers.get('content-type')).toContain('application/json');
    expect(second.headers.get('idempotent-replayed')).toBe('true');
    expect(first.headers.get('idempotent-replayed')).toBeNull();
  });

  it('is bound to the path: another resource with the same key runs', async () => {
    const { post, hits } = build();
    await post('/things/a', KEY);
    await post('/things/b', KEY);
    expect(hits.n).toBe(2);
  });

  it('answers 400 invalid_idempotency_key for a malformed key, without running', async () => {
    const { post, hits } = build();
    const res = await post('/things/a', 'short');
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('invalid_idempotency_key');
    expect(hits.n).toBe(0);
  });

  it('does not keep error answers: a retry with the same key runs again', async () => {
    const { post, hits, status } = build();
    status.code = 409;
    await post('/things/a', KEY);
    status.code = 201;
    const retry = await post('/things/a', KEY);
    expect(hits.n).toBe(2);
    expect(retry.status).toBe(201);
  });
});
