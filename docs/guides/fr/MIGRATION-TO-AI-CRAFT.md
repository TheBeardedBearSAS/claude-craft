# 🚀 Guide de migration : Claude Craft → AI Craft

**Version :** 9.0.0
**Statut :** Travail en cours
**Branche :** `refactor/ai-craft`
**Dernière mise à jour :** 2026-07-10

---

## 📌 Vue d'ensemble

Ce document décrit le chemin de migration de **Claude Craft** (fournisseur unique, Claude Code seulement) vers **AI Craft** (multi-fournisseurs, prenant en charge Vibe, Codex, OpenCode, Claude Code, Cursor et GitHub Copilot).

### Statut actuel

| Composant | Statut | Détails |
|-----------|--------|---------|
| **Architecture principale** | ✅ Complète | AI Provider Manager implémenté |
| **Intégrations des fournisseurs** | ✅ 80 % complètes | Vibe, Codex, OpenCode, Claude, Cursor |
| **Configuration** | ✅ Complète | ai-craft.yaml, AI-CRAFT.md |
| **Documentation** | ✅ 70 % complète | README, AI-CRAFT.md mis à jour |
| **Rétrocompatibilité** | ✅ Complète | Liens symboliques, mode legacy |
| **Migration des agents** | ⏳ Non démarrée | 70 agents à mettre à jour |
| **Migration des commandes** | ⏳ Non démarrée | 220 commandes à vérifier |
| **Tests** | ⏳ Non démarrés | Tests multi-fournisseurs requis |
| **Mise à jour des bundles** | ⏳ Non démarrée | Bundles vibe/, codex/, opencode/ |

---

## 🎯 Phases de migration

### Phase 1 : Fondations (branche actuelle)
**Branche :** `refactor/ai-craft`
**Statut :** ✅ Complète
**Durée :** 2 semaines (estimation)

#### Ce qui est fait

1. **AI Provider Manager** (`cli/lib/ai-provider.js`)
   - Classe de fournisseur de base avec interface commune
   - Détection des fournisseurs (config, env, binaires)
   - Exécution de commandes avec repli (fallback)
   - Prise en charge des sous-agents
   - Gestion des serveurs MCP

2. **Implémentations des fournisseurs** (`cli/lib/provider/`)
   - `base-provider.js` - Classe abstraite de base
   - `vibe-provider.js` - Mistral AI Vibe
   - `codex-provider.js` - Google Codex
   - `opencode-provider.js` - OpenCode auto-hébergé
   - `claude-provider.js` - Anthropic Claude Code
   - `cursor-provider.js` - Cursor (VSCode)

3. **Configuration**
   - `ai-craft.yaml` - Modèle de configuration multi-fournisseurs
   - `AI-CRAFT.md` - Instructions principales pour tous les fournisseurs
   - Réglages de rétrocompatibilité

4. **Compatibilité historique** (`cli/lib/legacy/claude-compat.js`)
   - Détection des projets Claude Craft
   - Outil de migration automatique
   - Gestion des liens symboliques (`.claude/ -> .ai-craft/`)
   - Fonctionnalité de sauvegarde et de restauration

5. **Mises à jour du package**
   - Nom du package : `@ai-craft/core` (était `@the-bearded-bear/claude-craft`)
   - Version : `9.0.0` (bump majeur — continuité SemVer depuis la série `8.19.x`
     de Claude Craft, pas une remise à zéro vers `1.0.0`, car le renommage du package
     est traité comme le breaking change de ce projet, pas comme un tout nouveau produit)
   - Binaires : `ai-craft` + `claude-craft` (rétrocompatibilité)

6. **Dépréciation de l'ancien package** (action mainteneur, non automatisée par ce dépôt)
   - Une fois `@ai-craft/core` publié, marquer l'ancien package comme déprécié pour
     que les installations existantes fassent apparaître un pointeur clair plutôt que
     de rester silencieusement obsolètes :
     ```bash
     npm deprecate @the-bearded-bear/claude-craft "Renamed to @ai-craft/core — see https://github.com/TheBeardedBearSAS/claude-craft/blob/main/docs/guides/en/MIGRATION-TO-AI-CRAFT.md"
     ```
   - Cela nécessite un accès npm publish sur l'ancien nom de package et n'est exécuté par
     aucun script de ce dépôt — c'est une étape manuelle, à réaliser une seule fois par
     la personne qui détient cet accès.

#### Fichiers modifiés/créés

```
cli/
├── lib/
│   ├── ai-provider.js          # ✅ NEW: Main provider manager
│   ├── provider/               # ✅ NEW: Provider implementations
│   │   ├── base-provider.js
│   │   ├── vibe-provider.js
│   │   ├── codex-provider.js
│   │   ├── opencode-provider.js
│   │   ├── claude-provider.js
│   │   └── cursor-provider.js
│   └── legacy/                 # ✅ NEW: Compatibility layer
│       └── claude-compat.js
├── index.js                    # ⚠️ TODO: Update to use provider manager
│
.claude/
└── AI-CRAFT.md                # ✅ NEW: Multi-provider instructions

ai-craft.yaml                  # ✅ NEW: Default configuration
package.json                   # ✅ UPDATED: New name and version
README.md                      # ✅ UPDATED: Transition notice
docs/guides/en/MIGRATION-TO-AI-CRAFT.md  # ✅ NEW: This file (translated fr/es/de/pt)
```

---

## 📋 Checklist de migration

### Pour les mainteneurs du framework

- [x] Créer la branche `refactor/ai-craft`
- [x] Mettre à jour package.json avec le nouveau nom et la nouvelle version
- [x] Créer l'architecture AI Provider Manager
- [x] Implémenter la classe de fournisseur de base
- [x] Implémenter le fournisseur Vibe
- [x] Implémenter le fournisseur Codex
- [x] Implémenter le fournisseur OpenCode
- [x] Implémenter le fournisseur Claude (rétrocompatible)
- [x] Implémenter le fournisseur Cursor
- [x] Créer la configuration ai-craft.yaml
- [x] Créer les instructions AI-CRAFT.md
- [x] Créer la couche de rétrocompatibilité
- [x] Mettre à jour README.md avec l'avis de transition
- [x] Créer ce guide de migration
- [ ] Mettre à jour le CLI pour utiliser le provider manager
- [ ] Mettre à jour l'installeur pour créer la structure .ai-craft/
- [ ] Mettre à jour Ralph pour fonctionner en multi-fournisseurs
- [ ] Mettre à jour QA Recette pour le multi-navigateur
- [ ] Mettre à jour les hooks BMAD pour le multi-fournisseurs
- [ ] Migrer les 70 agents vers le format multi-fournisseurs
- [ ] Vérifier que les 220 commandes fonctionnent avec tous les fournisseurs
- [ ] Créer une suite de tests multi-fournisseurs
- [ ] Mettre à jour la documentation pour tous les fournisseurs
- [ ] Créer des bundles spécifiques à chaque fournisseur
- [ ] Tester la migration depuis des projets Claude Craft
- [ ] Mettre à jour les GitHub Actions CI/CD
- [ ] Mettre à jour les métadonnées du package npm
- [ ] Préparer les notes de version
- [ ] Annoncer à la communauté

### Pour les utilisateurs qui migrent leurs projets

1. **Sauvegarder votre projet**
   ```bash
   cd ~/my-project
   git commit -am "Backup before AI Craft migration"
   ```

2. **Installer AI Craft**
   ```bash
   npx @ai-craft/core install ~/my-project
   ```

3. **Lancer la migration** (si projet Claude Craft)
   ```bash
   npx @ai-craft/core migrate ~/my-project
   ```

4. **Vérifier l'installation**
   ```bash
   # Check .ai-craft/ directory exists
   ls -la .ai-craft/
   
   # Check symlink exists
   ls -la .claude/  # Should show -> .ai-craft/
   
   # Test with your provider
   vibe --system .ai-craft/AI-CRAFT.md
   ```

5. **Mettre à jour votre workflow**
   - Utiliser la commande `ai-craft` (ou `claude-craft` pour la rétrocompatibilité)
   - Mettre à jour tous les scripts qui référencent `.claude/` pour utiliser `.ai-craft/`
   - Configurer votre fournisseur préféré dans `ai-craft.yaml`

---

## 🔧 Détails d'implémentation technique

### Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────┐   │
│  │   AI Provider        │    │        Commands         │   │
│  │   Manager            │    │                         │   │
│  │                     │    │  /workflow:init         │   │
│  │  ┌───────────────┐  │    │  /team:audit           │   │
│  │  │ Provider      │  │    │  /qa:recette          │   │
│  │  │ Detection     │  │    │  /common:ralph-run    │   │
│  │  └───────────────┘  │    │                         │   │
│  │                     │    └────────────────────────┘   │
│  │  ┌───────────────┐  │                                  │
│  │  │ Provider      │  │    ┌────────────────────────┐   │
│  │  │ Execution     │  │    │        Legacy           │   │
│  │  └───────────────┘  │    │        Compat           │   │
│  │                     │    │                         │   │
│  │  ┌───────────────┐  │    │  Claude Craft          │   │
│  │  │ Fallback      │  │    │  Migration             │   │
│  │  │ Handling      │  │    │  Symlink Management    │   │
│  │  └───────────────┘  │    └────────────────────────┘   │
│  └─────────────────────┘                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│   Vibe Provider  │ │ Codex Provider│ │ OpenCode Provider│
│   (Mistral AI)   │ │   (Google)    │ │ (Self-Hosted)    │
└─────────────────┘ └──────────────┘ └─────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Providers                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │   Vibe CLI  │ │ Codex CLI   │ │ OpenCode CLI│    │
│  │ (vibe)      │ │ (codex)     │ │ (opencode)  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐                    │
│  │ Claude Code │ │   Cursor    │                    │
│  │ (claude)    │ │ (VSCode)    │                    │
│  └─────────────┘ └─────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Interface des fournisseurs

Tous les fournisseurs implémentent l'interface suivante :

```javascript
class BaseProvider {
  // Metadata
  name: string              // 'vibe', 'codex', etc.
  displayName: string       // 'Vibe (Mistral AI)'
  mcpSupported: boolean     // Supports MCP servers
  hooksSupported: boolean   // Supports hooks system
  subAgentsSupported: boolean // Supports sub-agents
  forkSupported: boolean    // Supports context forking
  
  // Configuration
  supportedModels: string[] // List of supported models
  defaultModel: string      // Default model to use
  modelAliases: Object      // Model name mappings
  
  // Methods
  async execute(command, args, options)      // Execute a command
  async sendMessage(prompt, options)         // Send a message to AI
  async spawnSubAgent(prompt, options)       // Spawn a sub-agent
  getMCPServers()                           // Get MCP server configs
  mapCommand(command, args)                 // Map generic → provider-specific
  async isAvailable()                       // Check if provider is installed
  async getVersion()                        // Get provider version
  validateConfig(config)                    // Validate provider config
  getEnvVars()                              // Get environment variables
}
```

### Structure de configuration

**Nouvelle structure (`.ai-craft/`) :**
```
.ai-craft/
├── AI-CRAFT.md              # Core instructions (replaces CLAUDE.md)
├── ai-craft.yaml            # Multi-provider configuration
├── ai-craft-config.json     # Generic settings (optional)
├── providers/               # Provider-specific configs
│   ├── vibe.yaml
│   ├── codex.yaml
│   ├── opencode.yaml
│   ├── claude.yaml
│   └── cursor.yaml
├── agents/                  # Multi-provider agents
│   └── api-designer.md
│   └── symfony-reviewer.md
│   └── ...
├── commands/                # Framework commands
├── skills/                  # Universal skills
├── templates/               # Code generation templates
├── memory/                  # Cross-session memory
├── logs/                    # Log files
└── hooks/                   # Hook scripts
```

**Structure historique (`.claude/`) :**
```
.claude/ → .ai-craft/  (symlink for backward compatibility)
```

### Correspondance des noms de modèles

AI Craft fournit une correspondance automatique des noms de modèles entre fournisseurs :

| Nom générique | Vibe (Mistral) | Codex (Google) | OpenCode | Claude (Anthropic) |
|--------------|----------------|---------------|----------|-------------------|
| `opus` | `mistral-large-3.5` | `codex-pro` | `llama-3.2-90b` | `opus-4.8` |
| `sonnet` | `mistral-medium-3.5` | `codex-plus` | `llama-3.2-70b` | `sonnet-5` |
| `haiku` | `mistral-small-3.5` | `codex` | `llama-3.2-11b` | `haiku-4.5` |

Cela permet aux commandes Claude Craft existantes de fonctionner sans modification :
```bash
# These work the same across all providers
/workflow:init --model=opus
/team:audit --model=sonnet
```

---

## 🎛️ Configuration spécifique à chaque fournisseur

### Vibe (Mistral AI)

**Prérequis :**
- Installer Vibe CLI : `curl -sSL https://vibe.mistral.ai | sh`
- Définir la clé API : `export MISTRAL_API_KEY=your_key`

**Configuration :**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "vibe"

provider_settings:
  vibe:
    model: "mistral-large-3.5"
    api_endpoint: "https://api.mistral.ai"
```

### Codex (Google)

**Prérequis :**
- Installer Codex CLI : `npm install -g @google-cloud/codex-cli`
- Définir la clé API : `export CODEX_API_KEY=your_key`

**Configuration :**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "codex"

provider_settings:
  codex:
    model: "codex-pro"
```

### OpenCode (auto-hébergé)

**Prérequis :**
- Installer OpenCode : `npm install -g @open-code/cli`
- Exécuter un serveur LLM (par ex. `llama-3.2-90b`)
- Définir le endpoint : `export OPENCODE_ENDPOINT=http://localhost:8080`

**Configuration :**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "opencode"

provider_settings:
  opencode:
    model: "llama-3.2-90b"
    base_url: "http://localhost:8080"
```

### Claude Code (Anthropic)

**Prérequis :**
- Installer Claude Code : `brew install claude-code` (macOS) ou voir la [documentation](https://code.claude.com)

**Configuration :**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "claude"

provider_settings:
  claude:
    model: "sonnet-5"
```

### Cursor (VSCode)

**Prérequis :**
- Installer l'extension Cursor dans VSCode

**Configuration :**
```json
// VSCode settings.json
{
  "cursor.rules": [
    {
      "path": ".ai-craft",
      "prompt": ".ai-craft/AI-CRAFT.md"
    }
  ]
}
```

---

## 🚀 Démarrage rapide pour les développeurs

### Cloner et configurer

```bash
# Clone the repository
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Switch to the AI Craft branch
git checkout refactor/ai-craft

# Install dependencies
npm install

# Link the package locally
npm link
```

### Tester la migration

```bash
# Create a test project
mkdir ~/ai-craft-test
cd ~/ai-craft-test

# Initialize AI Craft
npx @ai-craft/core install . --provider=vibe

# Or test migration from Claude Craft
npx @the-bearded-bear/claude-craft install . --tech=symfony
npx @ai-craft/core migrate .

# Test with different providers
ai-craft --provider=vibe workflow:init
ai-craft --provider=codex workflow:init
ai-craft --provider=claude workflow:init
```

### Exécuter les tests

```bash
# Run existing tests
npm test

# Run lint
npm run lint

# Check multi-provider functionality
node tests/ai-provider.test.mjs
```

---

## 🐛 Dépannage

### Problèmes courants

**1. Fournisseur non détecté**
```
❌ Error: No AI provider detected
```
**Solution :**
- Installer le CLI du fournisseur (vibe, codex, opencode ou claude)
- Définir la variable d'environnement appropriée
- Ou spécifier explicitement le fournisseur : `--provider=vibe`

**2. Lien symbolique non créé**
```
❌ Error: .claude/ directory not found
```
**Solution :**
- La migration devrait créer un lien symbolique automatiquement
- Le créer manuellement : `ln -s .ai-craft .claude`
- Ou utiliser directement les commandes `ai-craft`

**3. Commande introuvable**
```
❌ Error: ai-craft: command not found
```
**Solution :**
- S'assurer que npm link a été exécuté : `npm link`
- Ou utiliser npx : `npx @ai-craft/core`
- Ou installer globalement : `npm install -g .`

**4. Permission refusée**
```
❌ Error: EACCES: permission denied
```
**Solution :**
- Utiliser sudo si nécessaire : `sudo npm link`
- Ou corriger les permissions npm : `npm config set prefix ~/.npm-global`

**5. Erreurs de configuration**
```
❌ Error: Invalid configuration
```
**Solution :**
- Vérifier la syntaxe de `ai-craft.yaml` avec un validateur YAML
- Comparer avec la configuration par défaut
- Supprimer et régénérer : `rm -rf .ai-craft && npx @ai-craft/core install .`

---

## 📊 Suivi de l'avancement de la migration

| Tâche | Statut | Responsable | Notes |
|------|--------|-------|-------|
| Architecture principale | ✅ Terminé | - | Provider manager complet |
| Fournisseur Vibe | ✅ Terminé | - | Implémentation complète |
| Fournisseur Codex | ✅ Terminé | - | Implémentation complète |
| Fournisseur OpenCode | ✅ Terminé | - | Implémentation complète |
| Fournisseur Claude | ✅ Terminé | - | Rétrocompatible |
| Fournisseur Cursor | ✅ Terminé | - | Intégration VSCode |
| Configuration | ✅ Terminé | - | Modèle ai-craft.yaml |
| AI-CRAFT.md | ✅ Terminé | - | Instructions multi-fournisseurs |
| Rétrocompatibilité | ✅ Terminé | - | Gestion des liens symboliques |
| Mise à jour README | ✅ Terminé | - | Avis de transition |
| Guide de migration | ✅ Terminé | - | Ce document |
| Intégration CLI | ⏳ À FAIRE | Dev | Mettre à jour cli/index.js |
| Mise à jour de l'installeur | ⏳ À FAIRE | Dev | Créer la structure .ai-craft/ |
| Adaptation de Ralph | ⏳ À FAIRE | Dev | Boucle multi-fournisseurs |
| Adaptation de QA Recette | ⏳ À FAIRE | Dev | Prise en charge multi-navigateur |
| Migration des agents | ⏳ À FAIRE | Dev | Mettre à jour 70 agents |
| Vérification des commandes | ⏳ À FAIRE | QA | Tester 220 commandes |
| Suite de tests | ⏳ À FAIRE | QA | Tests multi-fournisseurs |
| Documentation | ⏳ À FAIRE | Docs | Mettre à jour toute la documentation |
| Bundles | ⏳ À FAIRE | Dev | Créer les bundles pour chaque fournisseur |
| Mise à jour CI/CD | ⏳ À FAIRE | DevOps | GitHub Actions |
| Publication du package | ⏳ À FAIRE | DevOps | npm publish |
| Annonce communautaire | ⏳ À FAIRE | Marketing | Annonce de release |

---

## 🎯 Roadmap de Migration vers AI Craft

### Phase 1 : Fondations (Semaines 1-2) ✅ **COMPLET**
- [x] Architecture du AI Provider Manager
- [x] Implémentation des providers de base
- [x] Configuration multi-provider
- [x] Couche de compatibilité Claude Craft
- [x] Documentation initiale

### Phase 2 : Intégration CLI (Semaines 3-4) ⏳ **EN COURS**
- [ ] Mise à jour de cli/index.js pour utiliser le provider manager
- [ ] Mise à jour de l'installer (Dev/scripts/install-*.sh)
- [ ] Intégration de Ralph avec multi-provider
- [ ] Tests d'intégration basiques

### Phase 3 : Adaptation des Outils (Semaines 5-6) ⏳ **À VENIR**
- [ ] Ralph Wiggum multi-provider
- [ ] QA Recette multi-browser + multi-AI
- [ ] BMAD hooks multi-provider
- [ ] Mise à jour des templates de hooks

### Phase 4 : Migration des Agents (Semaines 7-8) ⏳ **À VENIR**
- [ ] Script de migration des agents
- [ ] Mise à jour des 70 agents existants
- [ ] Frontmatter multi-provider
- [ ] Validation des agents

### Phase 5 : Tests & Validation (Semaines 9-10) ⏳ **À VENIR**
- [ ] Suite de tests multi-provider
- [ ] Tests d'intégration end-to-end
- [ ] Validation de la backward compatibility
- [ ] Benchmark des performances

### Phase 6 : Release (Semaine 11-12) ⏳ **À VENIR**
- [ ] Mise à jour de la documentation
- [ ] Création des bundles multi-IDE
- [ ] Mise à jour du CI/CD
- [ ] Publication sur npm
- [ ] Annonce à la communauté

---

## 🤝 Comment contribuer

Nous accueillons volontiers les contributions à AI Craft ! Voici comment vous pouvez aider :

### 1. Signaler des problèmes
- Ouvrir une issue sur GitHub avec le label `ai-craft`
- Inclure des détails sur :
  - Votre système d'exploitation
  - Le(s) fournisseur(s) d'IA que vous utilisez
  - Les étapes de reproduction
  - Le comportement attendu vs le comportement observé

### 2. Corriger des bugs
- Forker le dépôt
- Créer une branche : `git checkout -b fix/your-issue`
- Apporter vos modifications
- Ajouter des tests pour le correctif
- Soumettre une Pull Request

### 3. Ajouter des fonctionnalités
- Discuter d'abord de la fonctionnalité dans GitHub Discussions
- Créer une branche : `git checkout -b feat/your-feature`
- Implémenter la fonctionnalité
- Ajouter des tests et de la documentation
- Soumettre une Pull Request

### 4. Améliorer la documentation
- Mettre à jour la documentation existante
- Ajouter des exemples
- Améliorer les traductions (en, fr, es, de, pt)

### 5. Tester de nouveaux fournisseurs
- Essayer AI Craft avec différents fournisseurs d'IA
- Signaler les problèmes de compatibilité
- Aider à améliorer les implémentations de fournisseurs

---

## 📞 Support

### Communauté
- **GitHub Discussions :** [TheBeardedBearSAS/ai-craft/discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Discord :** [Rejoignez notre serveur Discord](https://discord.gg/...) (lien à mettre à jour)
- **Twitter/X :** [@TheBeardedCTO](https://twitter.com/TheBeardedCTO)

### Documentation
- **Documentation principale :** [ai-craft.the-bearded-bear.com](https://ai-craft.the-bearded-bear.com) (bientôt disponible)
- **Wiki GitHub :** [TheBeardedBearSAS/ai-craft/wiki](https://github.com/TheBeardedBearSAS/ai-craft/wiki)

### Support commercial
Pour le support entreprise, le développement sur mesure ou la formation :
- **Email :** support@the-bearded-bear.com
- **Site web :** [https://the-bearded-bear.com](https://the-bearded-bear.com)

---

## 📜 Licence

AI Craft est **100 % open-source** sous [licence MIT](LICENSE).

Cela signifie que vous pouvez :
- ✅ L'utiliser gratuitement (usage personnel et commercial)
- ✅ Modifier le code source
- ✅ Distribuer des versions modifiées
- ✅ L'utiliser dans un logiciel propriétaire

Vous ne pouvez pas :
- ❌ Utiliser les marques déposées sans autorisation
- ❌ Nous tenir responsables de quelque problème que ce soit

---

## 🙏 Remerciements

AI Craft s'appuie sur les fondations de **Claude Craft**, créé et maintenu par [The Bearded CTO](https://the-bearded-bear.com) avec les contributions de la communauté open-source.

Remerciements particuliers à :
- **Anthropic** pour la création de Claude Code
- **Mistral AI** pour Vibe et ses contributions open-source
- **Google** pour Codex et la recherche en IA
- **Tous les contributeurs** qui ont aidé à façonner ce framework

---

**AI Craft - Le Framework de développement multi-IA**
*Anciennement Claude Craft - Désormais agnostique aux fournisseurs !*
*Développé avec ❤️ par la communauté AI Craft*
