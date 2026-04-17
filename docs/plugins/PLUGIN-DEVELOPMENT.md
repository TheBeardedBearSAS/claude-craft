# Plugin Development Guide

> **Version:** 1.0.0 | **Date:** 2026-04-17

Guide de développement de plugins pour Claude Craft.

---

## Table des matières

1. [Architecture](#architecture)
2. [Plugin Format](#plugin-format)
3. [Lifecycle Hooks](#lifecycle-hooks)
4. [API Reference](#api-reference)
5. [Examples](#examples)
6. [Publishing](#publishing)

---

## Architecture

### Principe

Les plugins étendent Claude Craft avec des comportements personnalisés via des hooks de lifecycle.

```
Claude Craft Core
  ↓
Plugin Loader (.claude/plugins/)
  ↓
Plugin Hooks
  ├─ beforeCommand (validation, préparation)
  ├─ afterCommand (post-traitement, génération)
  ├─ onAudit (collecte métriques, analyse)
  └─ onReport (enrichissement rapports)
```

### Configuration

```json
// .claude/plugins/config.json
{
  "plugins": [
    "@company/plugin-eslint",
    "@company/plugin-notify",
    "./local-plugins/plugin-custom"
  ],
  "autoload": true
}
```

---

## Plugin Format

### Structure NPM Package

```
@company/plugin-eslint/
├── package.json
├── src/
│   └── index.ts
├── dist/
│   └── index.js
└── README.md
```

### package.json

```json
{
  "name": "@company/plugin-eslint",
  "version": "1.0.0",
  "description": "ESLint plugin for Claude Craft",
  "main": "dist/index.js",
  "keywords": ["claude-craft", "plugin", "eslint"],
  "peerDependencies": {
    "@the-bearded-bear/claude-craft": "^8.0.0"
  },
  "claudeCraft": {
    "type": "plugin",
    "hooks": ["afterCommand"]
  }
}
```

### src/index.ts

```typescript
import { ClaudePlugin, PluginContext, PluginConfig } from '@the-bearded-bear/claude-craft';

export default class ESLintPlugin implements ClaudePlugin {
  name = 'eslint';
  version = '1.0.0';

  async beforeCommand(ctx: PluginContext): Promise<void> {
    // Hook avant exécution
  }

  async afterCommand(ctx: PluginContext): Promise<void> {
    // Hook après exécution
  }

  async onAudit(ctx: PluginContext): Promise<void> {
    // Hook pendant audit
  }

  async onReport(ctx: PluginContext): Promise<void> {
    // Hook génération rapport
  }
}
```

---

## Lifecycle Hooks

### 1. beforeCommand

**Déclenché avant:** Exécution d'une commande `/namespace:command`.

**Use cases:**
- Validation de prérequis
- Préparation de l'environnement
- Injection de configuration

**Exemple:**

```typescript
async beforeCommand(ctx: PluginContext): Promise<void> {
  if (ctx.command === 'react:generate-component') {
    // Vérifier ESLint config
    const hasConfig = await ctx.fs.exists('.eslintrc.json');
    if (!hasConfig) {
      throw new Error('Missing .eslintrc.json');
    }
  }
}
```

### 2. afterCommand

**Déclenché après:** Exécution réussie d'une commande.

**Use cases:**
- Lint du code généré
- Formatage automatique
- Génération de tests

**Exemple:**

```typescript
async afterCommand(ctx: PluginContext): Promise<void> {
  if (ctx.command.startsWith('react:generate')) {
    // Lint des fichiers générés
    const files = ctx.result.generatedFiles;
    await this.lintFiles(files);
  }
}
```

### 3. onAudit

**Déclenché pendant:** Exécution de `/team:audit`.

**Use cases:**
- Collecte de métriques personnalisées
- Analyse de conformité
- Vérifications custom

**Exemple:**

```typescript
async onAudit(ctx: PluginContext): Promise<void> {
  const metrics = {
    lintErrors: await this.countLintErrors(),
    coverage: await this.getCoverage(),
  };

  ctx.audit.addMetrics('eslint', metrics);
}
```

### 4. onReport

**Déclenché pendant:** Génération de rapports d'audit.

**Use cases:**
- Enrichissement du rapport
- Ajout de sections custom
- Formatage spécifique

**Exemple:**

```typescript
async onReport(ctx: PluginContext): Promise<void> {
  const section = {
    title: 'ESLint Analysis',
    content: this.generateESLintReport(),
    priority: 10,
  };

  ctx.report.addSection(section);
}
```

---

## API Reference

### PluginContext

```typescript
interface PluginContext {
  // Commande en cours
  command: string;
  args: Record<string, any>;

  // Système de fichiers
  fs: {
    exists(path: string): Promise<boolean>;
    read(path: string): Promise<string>;
    write(path: string, content: string): Promise<void>;
    glob(pattern: string): Promise<string[]>;
  };

  // Résultat de la commande
  result?: {
    generatedFiles: string[];
    modifiedFiles: string[];
    deletedFiles: string[];
  };

  // Audit
  audit?: {
    addMetrics(key: string, data: any): void;
    getMetrics(key: string): any;
  };

  // Rapport
  report?: {
    addSection(section: ReportSection): void;
    getSections(): ReportSection[];
  };

  // Logging
  logger: {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
  };

  // Configuration
  config: PluginConfig;
}
```

### PluginConfig

```typescript
interface PluginConfig {
  // Config du plugin (depuis .claude/plugins/config.json)
  get<T>(key: string, defaultValue?: T): T;
  set(key: string, value: any): void;

  // Config globale du projet
  project: {
    name: string;
    version: string;
    technologies: string[];
  };
}
```

### ClaudePlugin

```typescript
interface ClaudePlugin {
  // Métadonnées
  name: string;
  version: string;
  description?: string;

  // Hooks (tous optionnels)
  beforeCommand?(ctx: PluginContext): Promise<void>;
  afterCommand?(ctx: PluginContext): Promise<void>;
  onAudit?(ctx: PluginContext): Promise<void>;
  onReport?(ctx: PluginContext): Promise<void>;

  // Lifecycle
  initialize?(config: PluginConfig): Promise<void>;
  destroy?(): Promise<void>;
}
```

---

## Examples

### Example 1: plugin-eslint

**Lint automatique après génération de code.**

```typescript
import { ClaudePlugin, PluginContext } from '@the-bearded-bear/claude-craft';
import { ESLint } from 'eslint';

export default class ESLintPlugin implements ClaudePlugin {
  name = 'eslint';
  version = '1.0.0';

  private eslint: ESLint;

  async initialize(): Promise<void> {
    this.eslint = new ESLint({ fix: true });
  }

  async afterCommand(ctx: PluginContext): Promise<void> {
    const jsCommands = ['react:generate-component', 'react:generate-hook'];

    if (!jsCommands.includes(ctx.command)) {
      return;
    }

    const files = ctx.result?.generatedFiles || [];
    const results = await this.eslint.lintFiles(files);

    // Auto-fix
    await ESLint.outputFixes(results);

    // Rapport
    const formatter = await this.eslint.loadFormatter('stylish');
    const output = formatter.format(results);

    if (output) {
      ctx.logger.warn('ESLint issues found', { output });
    } else {
      ctx.logger.info('ESLint: All files passed');
    }
  }
}
```

### Example 2: plugin-notify

**Notifications Slack/Discord après audit.**

```typescript
import { ClaudePlugin, PluginContext } from '@the-bearded-bear/claude-craft';
import axios from 'axios';

export default class NotifyPlugin implements ClaudePlugin {
  name = 'notify';
  version = '1.0.0';

  async onReport(ctx: PluginContext): Promise<void> {
    const webhookUrl = ctx.config.get<string>('webhookUrl');
    if (!webhookUrl) {
      return;
    }

    const sections = ctx.report?.getSections() || [];
    const summary = this.buildSummary(sections);

    await axios.post(webhookUrl, {
      text: 'Claude Craft Audit Report',
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: summary },
        },
      ],
    });

    ctx.logger.info('Notification sent', { webhook: webhookUrl });
  }

  private buildSummary(sections: any[]): string {
    return sections
      .map((s) => `**${s.title}**: ${s.content.slice(0, 100)}...`)
      .join('\n');
  }
}
```

### Example 3: plugin-metrics

**Collecte de métriques d'usage.**

```typescript
import { ClaudePlugin, PluginContext } from '@the-bearded-bear/claude-craft';
import { writeFileSync, existsSync, readFileSync } from 'fs';

interface Metrics {
  commands: Record<string, number>;
  lastRun: string;
}

export default class MetricsPlugin implements ClaudePlugin {
  name = 'metrics';
  version = '1.0.0';

  private metricsFile = '.claude/plugins/metrics.json';

  async afterCommand(ctx: PluginContext): Promise<void> {
    const metrics = this.loadMetrics();

    metrics.commands[ctx.command] = (metrics.commands[ctx.command] || 0) + 1;
    metrics.lastRun = new Date().toISOString();

    this.saveMetrics(metrics);
  }

  async onReport(ctx: PluginContext): Promise<void> {
    const metrics = this.loadMetrics();

    ctx.report?.addSection({
      title: 'Usage Metrics',
      content: this.formatMetrics(metrics),
      priority: 5,
    });
  }

  private loadMetrics(): Metrics {
    if (!existsSync(this.metricsFile)) {
      return { commands: {}, lastRun: '' };
    }
    return JSON.parse(readFileSync(this.metricsFile, 'utf-8'));
  }

  private saveMetrics(metrics: Metrics): void {
    writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
  }

  private formatMetrics(metrics: Metrics): string {
    const sorted = Object.entries(metrics.commands).sort((a, b) => b[1] - a[1]);
    return sorted.map(([cmd, count]) => `- ${cmd}: ${count}`).join('\n');
  }
}
```

---

## Publishing

### 1. Préparer le package

```bash
npm init @company/plugin-name
npm install --save-peer @the-bearded-bear/claude-craft
npm install --save-dev typescript @types/node
```

### 2. Compiler

```bash
tsc src/index.ts --outDir dist --declaration
```

### 3. Publier sur npm

```bash
npm publish --access public
```

### 4. Documentation

Inclure dans le README:
- Installation: `npm install @company/plugin-name`
- Configuration: exemple `.claude/plugins/config.json`
- Hooks utilisés
- Options de configuration

### 5. Discovery

Taguer avec `claude-craft-plugin` pour apparaître dans la recherche.

---

## Best Practices

- **Performance**: Les hooks doivent être rapides (< 1s)
- **Errors**: Ne jamais bloquer le workflow principal
- **Logs**: Logger toutes les actions pour debug
- **Config**: Fournir des defaults sensés
- **Docs**: Documenter tous les hooks et options

---

**Maintainer:** The Bearded CTO  
**License:** MIT
