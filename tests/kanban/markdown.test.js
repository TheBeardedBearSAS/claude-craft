import { describe, it, expect } from 'vitest';
import {
  createRenderer,
  linkifyStoryIds,
  demoteHeadings,
  RENDER_ERROR_HTML,
} from '../../cli/kanban/client/src/lib/markdown.js';

describe('createRenderer', () => {
  it('parses then sanitizes', () => {
    const r = createRenderer({ parse: (s) => `<p>${s}</p>`, sanitize: (h) => h.toUpperCase() });
    expect(r('x')).toBe('<P>X</P>');
  });
  it('returns empty for empty input and a fallback on error', () => {
    const r = createRenderer({
      parse: () => {
        throw new Error('bad');
      },
      sanitize: (h) => h,
    });
    expect(r('')).toBe('');
    expect(r('x')).toBe(RENDER_ERROR_HTML);
  });
});

describe('linkifyStoryIds', () => {
  const route = { name: 'backlog', query: { q: 'auth' } };

  it('links ids in text, keeping the current route and query', () => {
    expect(linkifyStoryIds('<p>See US-E4-03.</p>', route)).toBe(
      '<p>See <a href="#/backlog?q=auth&story=US-E4-03">US-E4-03</a>.</p>'
    );
  });

  it('handles flat ids, TT ids and several ids', () => {
    const out = linkifyStoryIds('<li>US-001, TT-12 and US-E1-02a</li>');
    expect(out).toContain('href="#/kanban?story=US-001">US-001</a>');
    expect(out).toContain('story=TT-12');
    expect(out).toContain('story=US-E1-02a');
  });

  it('leaves existing links, code and pre blocks alone', () => {
    const html = '<a href="x">US-1</a> <code>US-2</code> <pre><code>US-3</code></pre> US-4';
    const out = linkifyStoryIds(html);
    expect(out).toContain('<a href="x">US-1</a>');
    expect(out).toContain('<code>US-2</code>');
    expect(out).toContain('<pre><code>US-3</code></pre>');
    expect(out).toContain('story=US-4');
    expect(out.match(/story=/g)).toHaveLength(1);
  });

  it('does not touch attributes or ids embedded in longer words', () => {
    expect(linkifyStoryIds('<img alt="US-1" src="a">')).toBe('<img alt="US-1" src="a">');
    expect(linkifyStoryIds('<p>FOUS-1 and US-</p>')).toBe('<p>FOUS-1 and US-</p>');
  });

  it('preserves the route params (sprints/<id>)', () => {
    expect(linkifyStoryIds('US-1', { name: 'sprints', params: { id: 's1' } })).toContain(
      'href="#/sprints/s1?story=US-1"'
    );
  });

  it('copes with empty input', () => {
    expect(linkifyStoryIds('')).toBe('');
    expect(linkifyStoryIds(undefined)).toBe('');
  });
});

describe('demoteHeadings', () => {
  it('shifts heading levels, floor at h6, leaving other tags', () => {
    expect(demoteHeadings('<h1 id="a">T</h1><h2>U</h2><h6>V</h6><hr><header>x</header>')).toBe(
      '<h2 id="a">T</h2><h3>U</h3><h6>V</h6><hr><header>x</header>'
    );
    expect(demoteHeadings('<h1>T</h1>', 2)).toBe('<h3>T</h3>');
  });
});
