# Ressources et Liens Utiles

## Documentation Officielle

### Claude / Anthropic

- **Claude Code Documentation** : https://docs.anthropic.com/claude-code
- **Claude Code Releases** : https://docs.anthropic.com/claude-code/releases
- **Anthropic API Documentation** : https://docs.anthropic.com/
- **Anthropic Cookbook** : https://github.com/anthropics/anthropic-cookbook
- **Pricing** : https://www.anthropic.com/pricing
- **Status Page** : https://status.anthropic.com/

### Claude-Craft

- **Repository GitHub** : https://github.com/thebeardedcto/claude-craft
- **NPM Package** : https://npmjs.com/@the-bearded-bear/claude-craft
- **Documentation** : Dans le repo, dossier `docs/`
- **Issues / Support** : https://github.com/thebeardedcto/claude-craft/issues

---

## Claude Code 2.1.105

### Nouvelles fonctionnalités

- **Claude Opus 4.6** : Nouveau modèle flagship - 200K context (1M beta), 128K output, adaptive thinking
- **Agent Teams** (Research Preview) : Coordination multi-agents avec Teammate/SendMessage tools
- **Automatic Memory** : Enregistrement auto de la mémoire de session
- **Extended Thinking** : think / think hard / think harder / ultrathink
- **MCP Integration** : `/mcp`, variable `MCP_TIMEOUT`
- **Hooks** : 24 hooks (PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, UserPromptSubmit, Stop, SubagentStop, SubagentStart, Notification, PreCompact, PostCompact, SessionStart, SessionEnd, Setup, TeammateIdle, TaskCompleted + 8 additionnels)
- **Permissions 3-tier** : Deny / Allow / Ask
- **Sub-agents** : Task tool pour orchestration parallèle
- **Default model** : Sonnet 4.5

### Commandes clés

```bash
/compact            # Compacter le contexte
/doctor             # Diagnostiquer les problèmes
/mcp                # Gérer les serveurs MCP
/config             # Configuration Claude Code
/teleport           # Téléporter le contexte
/release-notes      # Notes de version
```

### Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Shift+Enter` | Nouvelle ligne |
| `Ctrl+B` | Background task |
| `Shift+Tab` | Plan mode |

---

## Claude-Craft 7.26.0

### TCL (Tiered Context Loading)

| Niveau | Fichiers | Chargement |
|--------|----------|------------|
| ALWAYS | CLAUDE.md, INDEX.md | Automatique |
| ON-DEMAND | skills/*.md | Via /skill |
| REFERENCE | references/**/*.md | Via @ |

### Fonctionnalités principales

- **BMAD v6** : 5 quality gates, status-based routing (BMAD roles integrated into workflow/sprint commands)
- **Ralph Wiggum** : AI loop continu, DoD validators (command, output_contains, file_changed, hook, human)
- **QA Recette** : Tests d'acceptance automatisés via Chrome, Golden Rule (un bug fixe ne doit JAMAIS reapparaitre)
- **Docker agents** : 5 agents spécialisés (dockerfile, compose, debug, cicd, architect)
- **63 agents** au total, **204 commandes** across 26 namespaces

### Installation

```bash
# Interactive
npx @the-bearded-bear/claude-craft install

# Directe
npx @the-bearded-bear/claude-craft install ~/projet --tech=symfony --lang=fr
```

### Technologies supportées (18 stacks)

- symfony, laravel, react, angular, vuejs
- flutter, reactnative, python, php, csharp

---

## BMAD v6

### Documentation

- **BMAD dans Claude-Craft** : `.claude/references/bmad/` dans le repo Claude-Craft
- **BMAD Framework** : `.claude/commands/bmad/` pour les commandes
- **Quality Gates** : PRD (>=80%), Tech Spec (>=90%), Backlog (INVEST 6/6), Sprint Ready (100%), Story DoD (100%)

### Agile / Scrum

- **Scrum Guide** : https://scrumguides.org/
- **Agile Manifesto** : https://agilemanifesto.org/
- **Mountain Goat Software (User Stories)** : https://www.mountaingoatsoftware.com/agile/user-stories
- **INVEST Criteria** : https://www.agilealliance.org/glossary/invest/

---

## Ralph Wiggum

### Documentation

- **Ralph Conductor** : `.claude/commands/common/ralph-run.md`

### Concepts clés

- DoD Validators : `command`, `output_contains`, `file_changed`, `hook`, `human`
- Error Classification : Transient (L0), Recoverable (L1), Degraded (L2), Blocked (L3)
- Escalation Service : Queues blocking issues avec timeout

---

## QA Recette

### Documentation

- **Chrome Extension** : https://docs.anthropic.com/claude-code/chrome-extension
- **QA Recette Commands** : `.claude/commands/qa/` dans le repo Claude-Craft
- **Regression Registry** : `.recette/regression/registry.yaml`
- **QA Fix** : `.claude/commands/qa/fix` - Correction TDD des bugs
- **Bug Story Template** : `Dev/i18n/{lang}/Common/templates/bug-story.md`

### Acceptance Testing

- **Acceptance Test-Driven Development (ATDD)** : https://www.agilealliance.org/glossary/atdd/
- **BDD / Gherkin** : https://cucumber.io/docs/gherkin/
- **Golden Rule** : Un bug fixé ne doit JAMAIS réapparaître (regression tests auto-générés)

---

## MCP (Model Context Protocol)

### Spécification

- **MCP Specification** : https://modelcontextprotocol.io/
- **MCP GitHub** : https://github.com/modelcontextprotocol

### Serveurs MCP

- **MCP Servers Directory** : https://modelcontextprotocol.io/servers
- **Awesome MCP Servers** : https://github.com/punkpeye/awesome-mcp-servers
- **Claude Code MCP Config** : Via `/mcp` ou `claude mcp add`

---

## Symfony

### Documentation

- **Symfony Docs** : https://symfony.com/doc/current/index.html
- **Symfony Best Practices** : https://symfony.com/doc/current/best_practices.html
- **API Platform** : https://api-platform.com/docs/

### Outils

- **PHPStan** : https://phpstan.org/
- **PHP-CS-Fixer** : https://cs.symfony.com/
- **Rector** : https://getrector.com/
- **PHPUnit** : https://phpunit.de/

---

## Architecture

### Clean Architecture

- **The Clean Architecture (Uncle Bob)** : https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Hexagonal Architecture (Alistair Cockburn)** : https://alistair.cockburn.us/hexagonal-architecture/

### DDD

- **Domain-Driven Design Reference** : https://www.domainlanguage.com/ddd/reference/
- **DDD Community** : https://www.dddcommunity.org/

### CQRS

- **CQRS Pattern (Martin Fowler)** : https://martinfowler.com/bliki/CQRS.html

---

## Tests

### TDD

- **Test-Driven Development by Example (Kent Beck)** - Livre
- **TDD by Example** : https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530

### Outils PHP

- **PHPUnit** : https://phpunit.de/documentation.html
- **Behat** : https://docs.behat.org/
- **Pest** : https://pestphp.com/

---

## Sécurité

### OWASP

- **OWASP Top 10** : https://owasp.org/www-project-top-ten/
- **OWASP Cheat Sheet Series** : https://cheatsheetseries.owasp.org/
- **OWASP Testing Guide** : https://owasp.org/www-project-web-security-testing-guide/

### Symfony Security

- **Security Component** : https://symfony.com/doc/current/security.html
- **Security Advisories** : https://symfony.com/blog/category/security-advisories

---

## Git

### Workflows

- **GitHub Flow** : https://docs.github.com/en/get-started/quickstart/github-flow
- **GitLab Flow** : https://docs.gitlab.com/ee/topics/gitlab_flow.html

### Conventional Commits

- **Specification** : https://www.conventionalcommits.org/
- **Commitlint** : https://commitlint.js.org/

---

## IDE et Outils

### VS Code

- **VS Code** : https://code.visualstudio.com/
- **PHP Intelephense** : https://intelephense.com/
- **GitLens** : https://gitlens.amod.io/

### JetBrains

- **PhpStorm** : https://www.jetbrains.com/phpstorm/
- **PhpStorm Tips** : https://www.jetbrains.com/phpstorm/guide/

---

## Livres Recommandés

### Architecture

- **Clean Architecture** - Robert C. Martin
- **Domain-Driven Design** - Eric Evans
- **Implementing Domain-Driven Design** - Vaughn Vernon

### Code Quality

- **Clean Code** - Robert C. Martin
- **Refactoring** - Martin Fowler
- **Working Effectively with Legacy Code** - Michael Feathers

### Tests

- **Test-Driven Development** - Kent Beck
- **Growing Object-Oriented Software, Guided by Tests** - Steve Freeman

---

## Communautés

### Discord / Slack

- **Anthropic Discord** : Communauté officielle
- **Symfony Slack** : https://symfony.com/slack
- **PHP Community** : https://phpc.chat/

### Meetups

- **AFUP (France)** : https://afup.org/
- **Symfony Meetups** : https://www.meetup.com/topics/symfony/

---

## Veille Technologique

### Newsletters

- **PHP Weekly** : https://www.phpweekly.com/
- **Symfony Blog** : https://symfony.com/blog/

### Blogs

- **Martin Fowler** : https://martinfowler.com/
- **Uncle Bob** : https://blog.cleancoder.com/

---

## Outils en Ligne

### API Testing

- **Postman** : https://www.postman.com/
- **Insomnia** : https://insomnia.rest/
- **HTTPie** : https://httpie.io/

### Diagrammes

- **Draw.io** : https://draw.io/
- **Mermaid** : https://mermaid.js.org/
- **PlantUML** : https://plantuml.com/

---

## Support Formation

### Contact Formateur

- Email : [à compléter]
- LinkedIn : [à compléter]

### Ressources Formation

- Slides : [lien à fournir]
- Exercices : Dans ce package
- Projet démo : [lien à fournir]

---

**Mis à jour : Janvier 2026**
**Claude Code : 2.1.105**
**Claude-Craft : 7.26.0**
