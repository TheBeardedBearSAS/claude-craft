import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

const { MemoryManager } = await import('../../cli/lib/memory.js');

describe('MemoryManager path safety', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    vi.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('deleteConversation', () => {
    it('refuses to delete when id contains path traversal', () => {
      manager.deleteConversation('../../../etc/passwd');
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('refuses to delete when id contains a path separator', () => {
      manager.deleteConversation('sub/dir-id');
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('deletes a conversation with a valid id', () => {
      manager.deleteConversation('valid-id_123');
      expect(fs.unlinkSync).toHaveBeenCalledTimes(1);
      expect(fs.unlinkSync.mock.calls[0][0]).toMatch(/valid-id_123\.json$/);
    });
  });

  describe('saveConversations', () => {
    it('skips entries whose id contains path traversal', () => {
      manager.conversations.set('../../../etc/cron.d/evil', {
        id: '../../../etc/cron.d/evil',
        messages: [],
      });
      manager.saveConversations();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('writes entries with a valid id', () => {
      manager.conversations.set('valid-id', { id: 'valid-id', messages: [] });
      manager.saveConversations();
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fs.writeFileSync.mock.calls[0][0]).toMatch(/valid-id\.json$/);
    });
  });
});

describe('MemoryManager init', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates the memory directory when it does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const mkdirSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

    manager.init();

    expect(mkdirSpy).toHaveBeenCalledWith(manager.memoryDir, { recursive: true });
  });

  it('does not recreate the memory directory when it already exists', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readdirSync').mockReturnValue([]);
    vi.spyOn(fs, 'readFileSync').mockReturnValue('{}');
    const mkdirSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

    manager.init();

    expect(mkdirSpy).not.toHaveBeenCalled();
  });

  it('loads conversations, project state and preferences on init', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['conv-1.json']);
    vi.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
      if (String(filePath).includes('conv-1.json')) {
        return JSON.stringify({ id: 'conv-1', messages: [] });
      }
      if (String(filePath).includes('project-state.json')) {
        return JSON.stringify({ phase: 'implement' });
      }
      if (String(filePath).includes('user-preferences.json')) {
        return JSON.stringify({ theme: 'dark' });
      }
      return '{}';
    });
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

    manager.init();

    expect(manager.conversations.get('conv-1')).toEqual({ id: 'conv-1', messages: [] });
    expect(manager.projectState).toEqual({ phase: 'implement' });
    expect(manager.userPreferences).toEqual({ theme: 'dark' });
  });
});

describe('MemoryManager loadConversations', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when the conversations directory does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const readdirSpy = vi.spyOn(fs, 'readdirSync');

    manager.loadConversations();

    expect(readdirSpy).not.toHaveBeenCalled();
    expect(manager.conversations.size).toBe(0);
  });

  it('loads valid conversation files and ignores non-json files', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['conv-a.json', 'notes.txt']);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(
      JSON.stringify({ id: 'conv-a', messages: [{ role: 'user', content: 'hi' }] })
    );

    manager.loadConversations();

    expect(manager.conversations.size).toBe(1);
    expect(manager.conversations.get('conv-a').messages).toHaveLength(1);
  });

  it('skips conversation files containing invalid JSON', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['broken.json']);
    vi.spyOn(fs, 'readFileSync').mockReturnValue('{not valid json');

    manager.loadConversations();

    expect(manager.conversations.size).toBe(0);
  });
});

describe('MemoryManager loadProjectState', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('leaves projectState as {} when the file does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    manager.loadProjectState();

    expect(manager.projectState).toEqual({});
  });

  it('parses project state from a valid file', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ phase: 'design' }));

    manager.loadProjectState();

    expect(manager.projectState).toEqual({ phase: 'design' });
  });

  it('resets projectState to {} when the file has invalid JSON', () => {
    manager.projectState = { stale: true };
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue('not json');

    manager.loadProjectState();

    expect(manager.projectState).toEqual({});
  });
});

describe('MemoryManager loadUserPreferences', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('leaves userPreferences as {} when the file does not exist', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);

    manager.loadUserPreferences();

    expect(manager.userPreferences).toEqual({});
  });

  it('parses user preferences from a valid file', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ lang: 'fr' }));

    manager.loadUserPreferences();

    expect(manager.userPreferences).toEqual({ lang: 'fr' });
  });

  it('resets userPreferences to {} when the file has invalid JSON', () => {
    manager.userPreferences = { stale: true };
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue('not json');

    manager.loadUserPreferences();

    expect(manager.userPreferences).toEqual({});
  });
});

describe('MemoryManager saveProjectState / saveUserPreferences', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes the current project state as JSON', () => {
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    manager.projectState = { phase: 'implement' };

    manager.saveProjectState();

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy.mock.calls[0][0]).toMatch(/project-state\.json$/);
    expect(JSON.parse(writeSpy.mock.calls[0][1])).toEqual({ phase: 'implement' });
  });

  it('swallows write errors when saving project state', () => {
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('disk full');
    });

    expect(() => manager.saveProjectState()).not.toThrow();
  });

  it('writes the current user preferences as JSON', () => {
    const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    manager.userPreferences = { theme: 'dark' };

    manager.saveUserPreferences();

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy.mock.calls[0][0]).toMatch(/user-preferences\.json$/);
    expect(JSON.parse(writeSpy.mock.calls[0][1])).toEqual({ theme: 'dark' });
  });

  it('swallows write errors when saving user preferences', () => {
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {
      throw new Error('disk full');
    });

    expect(() => manager.saveUserPreferences()).not.toThrow();
  });
});

describe('MemoryManager conversation helpers', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a conversation with defaults on first access', () => {
    const conversation = manager.getConversation('conv-1');

    expect(conversation.id).toBe('conv-1');
    expect(conversation.provider).toBe('unknown');
    expect(conversation.model).toBe('unknown');
    expect(conversation.messages).toEqual([]);
  });

  it('creates a conversation using provided provider/model options', () => {
    const conversation = manager.getConversation('conv-2', { provider: 'anthropic', model: 'sonnet-5' });

    expect(conversation.provider).toBe('anthropic');
    expect(conversation.model).toBe('sonnet-5');
  });

  it('returns the same conversation object on repeat calls', () => {
    const first = manager.getConversation('conv-3');
    first.messages.push({ role: 'user', content: 'hello' });

    const second = manager.getConversation('conv-3');

    expect(second).toBe(first);
    expect(second.messages).toHaveLength(1);
  });

  it('appends a message, refreshes updatedAt and persists to disk', () => {
    const conversation = manager.getConversation('conv-4');
    const initialUpdatedAt = conversation.metadata.updatedAt;

    manager.addMessage('conv-4', { role: 'user', content: 'hi there' });

    const stored = manager.conversations.get('conv-4');
    expect(stored.messages).toHaveLength(1);
    expect(stored.messages[0]).toMatchObject({ role: 'user', content: 'hi there' });
    expect(stored.messages[0].timestamp).toBeDefined();
    expect(stored.metadata.updatedAt >= initialUpdatedAt).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('returns an empty array from getHistory for an unknown conversation', () => {
    expect(manager.getHistory('missing')).toEqual([]);
  });

  it('returns the full history when under the limit', () => {
    manager.addMessage('conv-5', { role: 'user', content: 'one' });
    manager.addMessage('conv-5', { role: 'assistant', content: 'two' });

    const history = manager.getHistory('conv-5');

    expect(history).toHaveLength(2);
    expect(history[0].content).toBe('one');
    expect(history[1].content).toBe('two');
  });

  it('limits the history to the last N messages', () => {
    manager.addMessage('conv-6', { role: 'user', content: 'one' });
    manager.addMessage('conv-6', { role: 'assistant', content: 'two' });
    manager.addMessage('conv-6', { role: 'user', content: 'three' });

    const history = manager.getHistory('conv-6', 2);

    expect(history).toHaveLength(2);
    expect(history.map((m) => m.content)).toEqual(['two', 'three']);
  });
});

describe('MemoryManager project context and preferences', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns {} for project context when none has been set', () => {
    expect(manager.getProjectContext()).toEqual({});
  });

  it('sets and retrieves the project context, persisting to disk', () => {
    manager.setProjectContext({ activeStack: 'symfony' });

    expect(manager.getProjectContext()).toEqual({ activeStack: 'symfony' });
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync.mock.calls[0][0]).toMatch(/project-state\.json$/);
  });

  it('returns the default value when a preference is not set', () => {
    expect(manager.getPreference('lang', 'en')).toBe('en');
    expect(manager.getPreference('lang')).toBeUndefined();
  });

  it('sets and retrieves a user preference, persisting to disk', () => {
    manager.setPreference('lang', 'fr');

    expect(manager.getPreference('lang')).toBe('fr');
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync.mock.calls[0][0]).toMatch(/user-preferences\.json$/);
  });
});

describe('MemoryManager cache', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns undefined for a missing cache key', () => {
    expect(manager.getCache('missing')).toBeUndefined();
  });

  it('stores and retrieves a cache value without a ttl', () => {
    manager.setCache('key1', { foo: 'bar' });

    expect(manager.getCache('key1')).toEqual({ foo: 'bar' });
  });

  it('expires a cache value after the given ttl', () => {
    vi.useFakeTimers();
    manager.setCache('key2', 'value', 1000);

    expect(manager.getCache('key2')).toBe('value');

    vi.advanceTimersByTime(1000);

    expect(manager.getCache('key2')).toBeUndefined();
  });

  it('clears all cache entries', () => {
    manager.setCache('a', 1);
    manager.setCache('b', 2);

    manager.clearCache();

    expect(manager.getCache('a')).toBeUndefined();
    expect(manager.getCache('b')).toBeUndefined();
  });
});

describe('MemoryManager clearConversations', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clears the in-memory map and removes the conversations directory when present', () => {
    manager.conversations.set('conv-1', { id: 'conv-1', messages: [] });
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const rmSpy = vi.spyOn(fs, 'rmSync').mockImplementation(() => {});
    const mkdirSpy = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

    manager.clearConversations();

    expect(manager.conversations.size).toBe(0);
    expect(rmSpy).toHaveBeenCalledWith(expect.stringMatching(/conversations$/), {
      recursive: true,
      force: true,
    });
    expect(mkdirSpy).toHaveBeenCalledWith(expect.stringMatching(/conversations$/), { recursive: true });
  });

  it('does not touch the filesystem when the conversations directory is absent', () => {
    manager.conversations.set('conv-1', { id: 'conv-1', messages: [] });
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const rmSpy = vi.spyOn(fs, 'rmSync').mockImplementation(() => {});

    manager.clearConversations();

    expect(manager.conversations.size).toBe(0);
    expect(rmSpy).not.toHaveBeenCalled();
  });
});

describe('MemoryManager stats, export and import', () => {
  let manager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports accurate statistics across all stores', () => {
    manager.conversations.set('conv-1', { id: 'conv-1', messages: [] });
    manager.cache = { a: 1, b: 2 };
    manager.projectState = { phase: 'implement' };
    manager.userPreferences = { lang: 'fr', theme: 'dark' };

    expect(manager.getStats()).toEqual({
      conversations: 1,
      cacheKeys: 2,
      projectStateKeys: 1,
      userPreferenceKeys: 2,
    });
  });

  it('exports all memory data as plain objects', () => {
    manager.conversations.set('conv-1', { id: 'conv-1', messages: [] });
    manager.cache = { a: 1 };
    manager.projectState = { phase: 'design' };
    manager.userPreferences = { lang: 'en' };

    expect(manager.export()).toEqual({
      conversations: { 'conv-1': { id: 'conv-1', messages: [] } },
      cache: { a: 1 },
      projectState: { phase: 'design' },
      userPreferences: { lang: 'en' },
    });
  });

  it('imports memory data, replacing existing state', () => {
    manager.conversations.set('stale', { id: 'stale', messages: [] });

    manager.import({
      conversations: { fresh: { id: 'fresh', messages: [] } },
      cache: { x: 1 },
      projectState: { phase: 'review' },
      userPreferences: { lang: 'de' },
    });

    expect(manager.conversations.has('stale')).toBe(false);
    expect(manager.conversations.get('fresh')).toEqual({ id: 'fresh', messages: [] });
    expect(manager.cache).toEqual({ x: 1 });
    expect(manager.projectState).toEqual({ phase: 'review' });
    expect(manager.userPreferences).toEqual({ lang: 'de' });
  });

  it('falls back to empty defaults when importing partial data', () => {
    manager.conversations.set('stale', { id: 'stale', messages: [] });
    manager.cache = { keep: 'no' };

    manager.import({});

    expect(manager.conversations.size).toBe(0);
    expect(manager.cache).toEqual({});
    expect(manager.projectState).toEqual({});
    expect(manager.userPreferences).toEqual({});
  });
});
