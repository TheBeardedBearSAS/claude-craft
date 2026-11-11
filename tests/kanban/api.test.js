import { describe, it, expect, vi, afterEach } from 'vitest';
import { request, ApiError, storyUrl, errorKey, latestOnly, isAbort } from '../../cli/kanban/client/src/lib/api.js';

const reply = (status, body, { json = true } = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: 'x',
  json: json ? async () => body : async () => Promise.reject(new SyntaxError('no json')),
});

afterEach(() => vi.unstubAllGlobals());

describe('request', () => {
  it('returns the parsed body and sends JSON headers', async () => {
    const f = vi.fn().mockResolvedValue(reply(200, { a: 1 }));
    vi.stubGlobal('fetch', f);
    expect(await request('/x', { method: 'PATCH', headers: { 'X-A': '1' } })).toEqual({ a: 1 });
    expect(f.mock.calls[0][1].headers).toEqual({ 'Content-Type': 'application/json', 'X-A': '1' });
    expect(f.mock.calls[0][1].method).toBe('PATCH');
  });

  it('throws a typed error carrying status, code and body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(409, { error: 'invalid_transition', allowed: ['done'] })));
    const err = await request('/x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 409, code: 'invalid_transition', message: 'invalid_transition' });
    expect(err.body.allowed).toEqual(['done']);
  });

  it('falls back to http_<status> when the error body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(502, null, { json: false })));
    const err = await request('/x').catch((e) => e);
    expect(err).toMatchObject({ status: 502, code: 'http_502', body: null, message: 'HTTP 502' });
  });

  it('maps network failures to status 0 / network, and lets aborts through', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    expect(await request('/x').catch((e) => e)).toMatchObject({ status: 0, code: 'network' });
    const abort = Object.assign(new Error('a'), { name: 'AbortError' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort));
    const err = await request('/x').catch((e) => e);
    expect(isAbort(err)).toBe(true);
    expect(err).not.toBeInstanceOf(ApiError);
  });
});

describe('storyUrl / errorKey', () => {
  it('encodes the id (K-19)', () => {
    expect(storyUrl('US-1')).toBe('/api/stories/US-1');
    expect(storyUrl('a/b?c', '/status')).toBe('/api/stories/a%2Fb%3Fc/status');
  });
  it('derives an i18n key, with a safe fallback', () => {
    expect(errorKey({ code: 'invalid_transition' })).toBe('error.invalid_transition');
    expect(errorKey({ code: 'HTTP 500!' })).toBe('error.unknown');
    expect(errorKey(undefined)).toBe('error.unknown');
  });
});

describe('latestOnly', () => {
  it('invalidates the previous ticket and aborts its signal', () => {
    const run = latestOnly();
    const a = run();
    expect(a.current).toBe(true);
    const b = run();
    expect(a.current).toBe(false);
    expect(a.signal.aborted).toBe(true);
    expect(b.current).toBe(true);
    expect(b.signal.aborted).toBe(false);
  });
});
