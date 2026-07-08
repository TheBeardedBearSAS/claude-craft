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
