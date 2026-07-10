/**
 * AI Craft - Shared Memory System
 * Multi-AI Development Framework
 *
 * This module provides a shared memory system that allows different AI providers
 * to share conversation context, project state, and user preferences.
 *
 * @module lib/memory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Conversation ids are used as filenames on disk (`${id}.json`). Restricting
 * them to a safe charset prevents path traversal (CWE-22) via a crafted id.
 * @param {string} id
 * @returns {boolean}
 */
function isValidConversationId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]+$/.test(id);
}

/**
 * Memory Manager for AI Craft
 * Manages shared memory across all AI providers
 */
export class MemoryManager {
  constructor() {
    /** @type {string} */
    this.memoryDir = path.join(process.cwd(), '.ai-craft', 'memory');

    /** @type {Object} */
    this.cache = {};

    /** @type {Map<string, Conversation>} */
    this.conversations = new Map();

    /** @type {Object} */
    this.projectState = {};

    /** @type {Object} */
    this.userPreferences = {};

    /** @type {boolean} */
    this._initialized = false;
  }

  /**
   * Lazily run init() on first real use (ERG-02): importing this module, or
   * running any CLI command that never touches memory (--version, --help),
   * must not create .ai-craft/memory/ in the caller's cwd as a side effect.
   */
  _ensureInit() {
    if (!this._initialized) {
      this._initialized = true;
      this.init();
    }
  }

  /**
   * Initialize memory directory
   */
  init() {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }

    // Load persisted data
    this.loadConversations();
    this.loadProjectState();
    this.loadUserPreferences();
  }

  /**
   * Load conversations from disk
   */
  loadConversations() {
    const convDir = path.join(this.memoryDir, 'conversations');
    if (fs.existsSync(convDir)) {
      const files = fs.readdirSync(convDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = fs.readFileSync(path.join(convDir, file), 'utf8');
            const conversation = JSON.parse(content);
            this.conversations.set(conversation.id, conversation);
          } catch {
            // Skip invalid files
          }
        }
      }
    }
  }

  /**
   * Load project state from disk
   */
  loadProjectState() {
    const statePath = path.join(this.memoryDir, 'project-state.json');
    if (fs.existsSync(statePath)) {
      try {
        const content = fs.readFileSync(statePath, 'utf8');
        this.projectState = JSON.parse(content);
      } catch {
        this.projectState = {};
      }
    }
  }

  /**
   * Load user preferences from disk
   */
  loadUserPreferences() {
    const prefsPath = path.join(this.memoryDir, 'user-preferences.json');
    if (fs.existsSync(prefsPath)) {
      try {
        const content = fs.readFileSync(prefsPath, 'utf8');
        this.userPreferences = JSON.parse(content);
      } catch {
        this.userPreferences = {};
      }
    }
  }

  /**
   * Save conversations to disk
   */
  saveConversations() {
    const convDir = path.join(this.memoryDir, 'conversations');
    if (!fs.existsSync(convDir)) {
      fs.mkdirSync(convDir, { recursive: true });
    }

    for (const [id, conversation] of this.conversations) {
      if (!isValidConversationId(id)) {
        continue;
      }
      try {
        fs.writeFileSync(path.join(convDir, `${id}.json`), JSON.stringify(conversation, null, 2));
      } catch {
        // Skip errors
      }
    }
  }

  /**
   * Save project state to disk
   */
  saveProjectState() {
    const statePath = path.join(this.memoryDir, 'project-state.json');
    try {
      fs.writeFileSync(statePath, JSON.stringify(this.projectState, null, 2));
    } catch {
      // Skip errors
    }
  }

  /**
   * Save user preferences to disk
   */
  saveUserPreferences() {
    const prefsPath = path.join(this.memoryDir, 'user-preferences.json');
    try {
      fs.writeFileSync(prefsPath, JSON.stringify(this.userPreferences, null, 2));
    } catch {
      // Skip errors
    }
  }

  /**
   * Create or get a conversation
   * @param {string} id - Conversation ID
   * @param {Object} options - Conversation options
   * @returns {Conversation} - Conversation object
   */
  getConversation(id, options = {}) {
    this._ensureInit();
    if (!this.conversations.has(id)) {
      this.conversations.set(id, {
        id,
        provider: options.provider || 'unknown',
        model: options.model || 'unknown',
        messages: [],
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          project: process.cwd(),
        },
        context: {
          files: [],
          symbols: [],
          projectInfo: null,
        },
      });
    }
    return this.conversations.get(id);
  }

  /**
   * Add a message to a conversation
   * @param {string} id - Conversation ID
   * @param {Object} message - Message object
   */
  addMessage(id, message) {
    const conversation = this.getConversation(id);
    conversation.messages.push({
      ...message,
      timestamp: new Date().toISOString(),
    });
    conversation.metadata.updatedAt = new Date().toISOString();
    this.saveConversations();
  }

  /**
   * Get conversation history
   * @param {string} id - Conversation ID
   * @param {number} limit - Maximum number of messages to return
   * @returns {Array} - Message history
   */
  getHistory(id, limit = 100) {
    this._ensureInit();
    const conversation = this.conversations.get(id);
    if (!conversation) {
      return [];
    }
    return conversation.messages.slice(-limit);
  }

  /**
   * Set project context
   * @param {Object} context - Project context
   */
  setProjectContext(context) {
    this._ensureInit();
    this.projectState.context = context;
    this.saveProjectState();
  }

  /**
   * Get project context
   * @returns {Object} - Project context
   */
  getProjectContext() {
    this._ensureInit();
    return this.projectState.context || {};
  }

  /**
   * Set user preference
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   */
  setPreference(key, value) {
    this._ensureInit();
    this.userPreferences[key] = value;
    this.saveUserPreferences();
  }

  /**
   * Get user preference
   * @param {string} key - Preference key
   * @param {*} defaultValue - Default value if not set
   * @returns {*} - Preference value
   */
  getPreference(key, defaultValue = undefined) {
    this._ensureInit();
    return this.userPreferences[key] !== undefined ? this.userPreferences[key] : defaultValue;
  }

  /**
   * Get shared cache value
   * @param {string} key - Cache key
   * @returns {*} - Cached value
   */
  getCache(key) {
    return this.cache[key];
  }

  /**
   * Set shared cache value
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  setCache(key, value, ttl = 0) {
    this.cache[key] = value;

    if (ttl > 0) {
      setTimeout(() => {
        delete this.cache[key];
      }, ttl);
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {};
  }

  /**
   * Delete a conversation
   * @param {string} id - Conversation ID
   */
  deleteConversation(id) {
    this._ensureInit();
    this.conversations.delete(id);
    if (!isValidConversationId(id)) {
      return;
    }
    const convDir = path.join(this.memoryDir, 'conversations');
    const filePath = path.join(convDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Clear all conversations
   */
  clearConversations() {
    this._ensureInit();
    this.conversations.clear();
    const convDir = path.join(this.memoryDir, 'conversations');
    if (fs.existsSync(convDir)) {
      fs.rmSync(convDir, { recursive: true, force: true });
      fs.mkdirSync(convDir, { recursive: true });
    }
  }

  /**
   * Get memory statistics
   * @returns {Object} - Statistics
   */
  getStats() {
    return {
      conversations: this.conversations.size,
      cacheKeys: Object.keys(this.cache).length,
      projectStateKeys: Object.keys(this.projectState).length,
      userPreferenceKeys: Object.keys(this.userPreferences).length,
    };
  }

  /**
   * Export all memory data
   * @returns {Object} - All memory data
   */
  export() {
    return {
      conversations: Object.fromEntries(this.conversations),
      cache: this.cache,
      projectState: this.projectState,
      userPreferences: this.userPreferences,
    };
  }

  /**
   * Import memory data
   * @param {Object} data - Data to import
   */
  import(data) {
    this.conversations = new Map(Object.entries(data.conversations || {}));
    this.cache = data.cache || {};
    this.projectState = data.projectState || {};
    this.userPreferences = data.userPreferences || {};
  }
}

// Singleton instance. init() is deferred to first real use (ERG-02) via
// _ensureInit() rather than run here, so importing this module never
// creates .ai-craft/memory/ as a side effect on unrelated CLI commands.
export const memoryManager = new MemoryManager();

// Conversation type definition
/**
 * @typedef {Object} Conversation
 * @property {string} id - Conversation ID
 * @property {string} provider - AI provider name
 * @property {string} model - Model used
 * @property {Array<Object>} messages - Message history
 * @property {Object} metadata - Conversation metadata
 * @property {Object} context - Conversation context
 */
