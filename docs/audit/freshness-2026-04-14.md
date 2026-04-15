# Audit de Fraîcheur claude-craft — 2026-04-14

**Version claude-craft auditée** : 7.28.0
**Agents lancés** : 17 (10 stacks + 4 transverse + 3 infrastructure) en 3 vagues parallèles
**Outils** : MCP context7 (`resolve-library-id`, `query-docs`), WebSearch (release notes officielles, CHANGELOG, blogs experts)
**Commande utilisée** : `/common:audit-freshness`
**Portée** : contenu documentaire (skills, commands, agents, references, rules) — **aucune modification du dépôt hors ce rapport**

Légende des écarts :
- 🔴 **Critique** : version majeure de retard, breaking changes non couverts, sécurité
- 🟠 **Majeur** : version(s) majeure(s) de retard, patterns structurants manquants
- 🟡 **Mineur** : versions mineures de retard, patterns émergents absents
- ✅ **Aucun** : alignement complet

---

## Résumé exécutif

| Sévérité | Nombre | Domaines concernés |
|---|---|---|
| 🔴 Critique | 4 | Angular (2 majeures en retard), React Native (9 majeures), Reanimated v3→v4, Pest 3→4, Symfony 8 PHP 8.5 inexistant |
| 🟠 Majeur | 8 | Flutter (3 mineures), Laravel (1 majeure), Python (1 majeure), Testing outils, Sécurité OWASP/Supply-chain, Docker Compose, OpenAPI, PHP patterns |
| 🟡 Mineur | 4 | PHP (outils Level 10), Principes (VSA/Modular Monolith), Git/DDD (Log4brains, multitenant tiers), Infra (versions implicites) |
| ✅ Aucun | 3 | C# / .NET 10, Symfony 8.0 (version framework), Vue 3.5 (stable actuelle) |

**Constat général** : la majorité des versions **frameworks** restent proches de la réalité 2026-04, à deux exceptions graves près (**Angular 19 vs 21**, **React Native 0.76 vs 0.85**). Les plus gros écarts sont sur l'**écosystème d'outils** (Reanimated, Pest, Vitest, PHPStan, Hadolint) et sur les **standards transverses** (OWASP 2025, Supply-chain, Cognitive Complexity, Vertical Slice Architecture).

---

## Tableau global — Versions

| Stack | Déclarée | Stable actuelle | Écart |
|---|---|---|---|
| Symfony | 8.0 / PHP 8.5 | 8.0.8 / PHP 8.4+ requis | 🔴 PHP 8.5 inexistant |
| React | 19.x | 19.2.5 (+ React Compiler 1.0) | 🟡 documentation Compiler manquante |
| Flutter / Dart | 3.38 / 3.10 | 3.41.5 / 3.11.0 | 🟠 3 mineures |
| Python | 3.13+ | 3.14.4 | 🟠 version majeure |
| Angular | 19.x | 21.2.8 (LTS: 20) | 🔴 2 majeures |
| Laravel | 12.x / PHP 8.5 | 13.4.0 / PHP 8.5 | 🟠 majeure |
| Vue.js | 3.5+ | 3.5.32 (3.6-beta) | ✅ aligné |
| React Native | 0.76+ | 0.85 | 🔴 9 majeures |
| C# / .NET | 10 LTS / C# 14 | 10.0.5 LTS / C# 14 | ✅ aligné |
| PHP | 8.5 | 8.5.5 | ✅ aligné (outils en retard) |
| Docker Engine | non déclarée | 29.4.0 | 🟠 Compose spec v5, `version:` obsolète |
| Kubernetes | non déclarée | 1.35.3 (1.36 attendu 22/04) | 🟠 API/patterns à préciser |
| Coolify | non déclarée | 4.0.0-beta.470 | 🟡 versions à déclarer |
| Hadolint | non pinnée | 2.12.0 | 🟡 pin version |
| OpenTofu | non déclarée | 1.11.6 | 🟡 versions à déclarer |
| Ansible-core | non déclarée | 2.20.4 | 🟡 versions à déclarer |
| Hetzner Cloud provider | non déclarée | 1.58.0+ (datacenter→location juillet 2026) | 🟠 migration urgente |
| FrankenPHP | non déclarée | 1.12.1 | 🟡 versions à déclarer |
| PgBouncer | non déclarée | 1.25.1 (prepared stmts depuis 1.21) | 🟡 versions à déclarer |
| Reanimated | 3 | 4.3.0 | 🔴 v3 deprecated pour New Architecture |
| Pest | 3 | 4.5.0 | 🔴 obsolète |
| PHPStan | Level 9 | 2.1.46 / Level 10 | 🟠 niveau inférieur |
| Vitest | non spécifiée | 4.1.4 | 🟠 Browser Mode stable manquant |
| Playwright | non spécifié | Component testing stable | 🟠 pattern manquant |

---

## Vague 1 — Stacks techniques

### Symfony 🔴

- **Version déclarée** : Symfony 8.0 / PHP 8.5 (`.claude/CLAUDE.md`)
- **Version stable actuelle** : Symfony 8.0.8 (31 mars 2026), prérequis **PHP 8.4+**
- **Écart** : **critique** — PHP 8.5 déclaré n'existe pas officiellement (8.5.5 réellement sorti, mais Symfony 8 requiert 8.4+)
- **Best practices à revoir** :
  - Configuration PHP pure (abandon XML/YAML pour bundles intégrés, arrays type-safe)
  - Console via invokables avec attributs PHP
  - Performance : APCu/Redis multi-couches, OPcache, monitoring Inspector/Profiler
- **Patterns manquants** :
  - **JsonStreamer** (JSON haute performance)
  - **JsonPath** (navigation JSON)
  - **ObjectMapper** (DTOs)
  - **Wizard Forms** (formulaires multi-étapes)
- **Fichiers impactés** : `.claude/CLAUDE.md`, `.claude/agents/symfony-reviewer.md`, `.claude/references/symfony/`, `.claude/commands/symfony/`
- **Sources** : [Symfony 8.0 Release](https://symfony.com/releases/8.0), [SensioLabs 2026](https://sensiolabs.com/blog/2026/symfony-8-stability-security-innovation-for-developers), [massiveart](https://www.massiveart.com/en/blog/symfony-8)

### React 🟡

- **Version déclarée** : 19.x
- **Version stable actuelle** : 19.2.5 (8 avril 2026)
- **Écart** : alignement principal OK, mais **React Compiler 1.0** (stable depuis oct. 2025) absent de la documentation
- **Best practices à revoir** :
  - React Compiler auto-memoization (v1.0, compatible React 17+)
  - Server Components & Actions (client islands, bundle -40%)
  - `use()` Hook (Promises + Context, remplace useEffect async)
  - Suspense patterns (prévention waterfalls)
- **Patterns manquants** : React Compiler, `useOptimistic`, `use()` async sans useEffect, Server Components hybrides
- **Outils écosystème** : Zustand 5.0.12, TanStack Query 5.99.0
- **Fichiers impactés** : `.claude/CLAUDE.md`, `.claude/agents/react-reviewer.md`, `.claude/references/react/`, `.claude/commands/react/`, skills `testing-react`
- **Sources** : [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1), [React 19 Best Practices 2026](https://dev.to/jay_sarvaiya_reactjs/react-19-best-practices-write-clean-modern-and-efficient-react-code-1beb)

### Flutter / Dart 🟠

- **Version déclarée** : Flutter 3.38 / Dart 3.10
- **Version stable actuelle** : Flutter 3.41.5 / Dart 3.11.0 (février 2026)
- **Écart** : **3 mineures Flutter**, **1 mineure Dart** — obsolète depuis février 2026
- **Best practices à revoir** :
  - Impeller par défaut (iOS + Android, −50% rastérisation)
  - Material 3 modulaire (packages indépendants)
  - **Riverpod 3.0 Mutations API** (gestion auto Idle/Pending/Success/Error)
  - BLoC v9 mounted safety checks
  - `dart:js_interop` (suppression `dart:js_util` en Wasm)
- **Patterns manquants** : Pub workspaces avec globs, Unix domain sockets Windows, Cubit vs BLoC 2026, lint `simplify_variable_pattern`
- **Fichiers impactés** : `.claude/CLAUDE.md`, `.claude/agents/flutter-reviewer.md`, `.claude/references/flutter/` (CLAUDE.md, state-management, performance), `.claude/skills/testing-flutter/`
- **Sources** : [Flutter 3.41](https://blog.flutter.dev/whats-new-in-flutter-3-41-302ec140e632), [Dart 3.11](https://blog.dart.dev/announcing-dart-3-11-b6529be4203a), [Riverpod 3.0](https://medium.com/@lee645521797/flutter-riverpod-3-0-released-a-major-redesign-of-the-state-management-framework-f7e31f19b179)

### Python 🟠

- **Version déclarée** : Python 3.13+
- **Version stable actuelle** : **Python 3.14.4** (7 avril 2026)
- **Écart** : décalage d'une version majeure
- **Best practices à revoir** :
  - FastAPI 0.115+ (0.130.0+ requiert Python 3.10+)
  - pytest-asyncio mode `auto` (plus besoin de `@pytest.mark.asyncio`)
  - Ruff (règles COM812 + UP pour pyupgrade automatique)
  - mypy/pyright strict dès le départ
- **Patterns manquants** :
  - **Free-threading Python 3.13+**
  - **JIT Python 3.14**
  - Deferred evaluation of annotations (3.14)
  - pytest-asyncio auto mode
  - Hexagonal Architecture explicite
- **Fichiers impactés** : `.claude/CLAUDE.md`, `.claude/agents/python-reviewer.md`, `.claude/references/python/`, `.claude/commands/python/`
- **Sources** : [Python 3.14.4](https://www.python.org/downloads/release/python-3144/), [Modern Python 2026](https://onehorizon.ai/blog/modern-python-best-practices-the-2026-definitive-guide)

### Angular 🔴

- **Version déclarée** : 19.x
- **Version stable actuelle** : **21.2.8** (8 avril 2026). Angular 20 en LTS jusqu'à novembre 2026
- **Écart** : **2 versions majeures de retard**
- **Best practices à revoir** :
  - **Zoneless par défaut** (v21) — plus opt-in, ~33 KB économisés, +30-40% rendu
  - **Resource API** stable (`httpResource`, streaming resources)
  - **Signal Forms** (API expérimentale v21)
  - `afterNextRender` / `PendingTasks` stables (v20)
- **Patterns manquants** : `httpResource`, migration zoneless obligatoire, Signal Forms vs Reactive Forms typés, streaming resources (WebSockets/SSE)
- **Fichiers impactés** : `.claude/CLAUDE.md` (ligne 18), `.claude/agents/angular-reviewer.md`, `.claude/references/angular/architecture.md`
- **Sources** : [Angular 21 - InfoQ](https://www.infoq.com/news/2025/11/angular-21-released/), [Angular 20 blog](https://blog.angular.dev/announcing-angular-v20-b5c9c06cf301), [Zoneless 2026](https://www.pkgpulse.com/blog/angular-21-zoneless-zone-js-performance-2026)

### Laravel 🟠

- **Version déclarée** : Laravel 12.x / PHP 8.5
- **Version stable actuelle** : **Laravel 13.4.0** (7 avril 2026) / PHP 8.5 (8.6 prévu nov 2026)
- **Écart** : majeure — Laravel 13 publiée le 17 mars 2026
- **Patterns manquants** :
  - **AI SDK stable** (API unifiée OpenAI/Anthropic/Gemini, outils, agents, embeddings)
  - **Vector Search natif** (pgvector, RAG)
  - **Passkey Authentication** (WebAuthn dans Breeze/Jetstream/Fortify)
  - Pest 3 Mutation Testing, Arch Presets, Team Management
- **Fichiers impactés** : `.claude/CLAUDE.md` (ligne 20), `.claude/agents/laravel-reviewer.md` (titre + sections 1-4), `.claude/references/laravel/*.md`
- **Sources** : [Laravel 13 Release Notes](https://laravel.com/docs/13.x/releases), [Laravel AI SDK](https://laravel.com/docs/13.x/ai-sdk), [Pest v3](https://pestphp.com/docs/pest3-now-available)

### Vue.js ✅

- **Version déclarée** : 3.5+
- **Version stable actuelle** : 3.5.32 (3 avril 2026) / 3.6.0-beta.10 (13 avril 2026)
- **Écart** : **aucun** sur la version stable
- **Patterns émergents manquants** :
  - **Vapor Mode** (Vue 3.6 beta, compilation sans Virtual DOM)
  - **Alien Signals** (3.6, architecture réactive, intégration Pinia 3)
  - **Nuxt 4** stable (4.4.2, EOL Nuxt 3 juillet 2026)
- **Fichiers impactés** : `.claude/CLAUDE.md`, `.claude/agents/vuejs-reviewer.md`, `.claude/references/vuejs/architecture.md`, `.claude/references/vuejs/tooling.md`
- **Sources** : [Vue 3.6 beta Vapor](https://x.com/vuejs/status/2003469481163784611), [Nuxt 4](https://nuxt.com/blog/v4)

### React Native 🔴

- **Version déclarée** : 0.76+
- **Version stable actuelle** : **0.85** (avril 2026)
- **Écart** : **9 versions majeures** — fin officielle du Bridge legacy, JSI synchrone par défaut
- **Obsolescences critiques** :
  - **Reanimated 3 → 4.x obligatoire** pour New Architecture (RN 0.76+)
  - Bridge legacy supprimé, TurboModules matures
  - **Shared Animation Backend** (0.85)
  - Support concurrent React first-class
- **Expo SDK** : 55.0.14 (embarque RN 0.83, pas encore 0.85)
- **React Navigation** : 7.2.2 stable + 8.0 alpha
- **Fichiers impactés** : `.claude/CLAUDE.md` (ligne 17), `.claude/agents/reactnative-reviewer.md` (lignes 18, 522), skills `testing-reactnative` et `security-reactnative`
- **Sources** : [RN 0.85 Criztec](https://criztec.com/react-native-0-85-defines-the-post-bridge-aeme/), [Reanimated 4.3.0](https://www.npmjs.com/package/react-native-reanimated), [Compatibility Table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/)

### C# / .NET ✅

- **Version déclarée** : .NET 10 LTS / C# 14
- **Version stable actuelle** : .NET 10.0.5 LTS (mars 2026) — support jusqu'à nov. 2028. C# 14 publié avec .NET 10. .NET 11 preview 2.
- **Écart** : **aucun** — documentation parfaitement alignée
- **Patterns émergents à considérer** :
  - CQRS sans MediatR (tendance 2026 pour éviter dépendance commerciale)
  - EF Core 11 prévu nov. 2026
- **Fichiers impactés** : aucune correction de version nécessaire. Optionnel : `.claude/agents/csharp-reviewer.md` (ligne 99) pour patterns alternatifs
- **Sources** : [.NET 10 LTS](https://github.com/dotnet/core/blob/main/release-notes/10.0/README.md), [C# 14 features](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14), [CQRS sans MediatR](https://dotnetcopilot.com/implementing-cqrs-without-mediatr-in-net-10-using-clean-architecture/)

### PHP ✅ / 🟠 (outils)

- **Version déclarée** : PHP 8.5
- **Version stable actuelle** : 8.5.5 (avril 2026)
- **Écart langage** : **aucun**
- **Écart features documentées** : 🔴 **Property Hooks** (PHP 8.4) et **Asymmetric Visibility** (PHP 8.4) **absents** de la documentation claude-craft
- **Outils** :
  - PHPStan : déclaré Level 9 → Level 10 disponible (PHPStan 2.0+, actuel 2.1.46) 🟠
  - Pest : déclaré v3 → **v4.5.0** actuel avec PHPUnit 12 🔴
  - Rector : compatible PHP 8.5 ✅
- **Patterns manquants Clean Architecture 2026** : property hooks pour encapsulation, asymmetric visibility pour VO immutables, PHPStan Level 10
- **Fichiers impactés** : `.claude/agents/php-reviewer.md`, `.claude/references/php/tooling.md`, `.claude/references/php/coding-standards.md`, `.claude/references/php/architecture.md`
- **Sources** : [PHP 8.5](https://www.php.net/releases/8.5/en.php), [Property Hooks](https://www.php.net/manual/en/language.oop5.property-hooks.php), [Asymmetric Visibility](https://www.zend.com/blog/php-asymmetric-visibility), [PHPStan 2.0 Level 10](https://phpstan.org/blog/phpstan-2-0-released-level-10-elephpants), [Pest 4](https://pestphp.com/docs/pest3-now-available)

---

## Vague 2 — Transverse

### Principes d'architecture 🟡

- **Écart doctrinal** : mineur — SOLID/KISS/DRY/YAGNI restent valides, critiques accumulées sur application dogmatique
- **Best practices à revoir** :
  - Complexité cyclomatique < 10 → ajouter **Cognitive Complexity < 7-10** comme métrique primaire (adoptée par SonarQube, ReSharper)
  - Méthodes < 20 lignes → privilégier cohésion fonctionnelle et cognitive complexity
  - Architecture en couches stricte → introduire **Vertical Slice Architecture** pour features isolées
  - Accepter DTOs/Shared Kernels traversant les couches (Clean Architecture 2026 pragmatique)
- **Patterns/métriques manquants** :
  - **Cognitive Complexity** (métrique dominante 2026)
  - **Vertical Slice Architecture** (pattern hybride montant)
  - **Modular Monolith** (réponse à la fatigue microservices, Spring Modulith)
  - Hexagonal + DDD : intégration explicite ports/adapters
  - Approche hybride Clean/VSA
- **Fichiers impactés** : `.claude/rules/04-solid-principles.md`, `05-kiss-dry-yagni.md`, `01-workflow-analysis.md`, skills `solid-principles`, `kiss-dry-yagni`, `architecture-clean-ddd` + nouveaux skills potentiels `vertical-slice-architecture`, `modular-monolith`
- **Sources** : [Cognitive vs Cyclomatic](https://gilles-fabre.medium.com/what-is-the-difference-between-cyclomatic-complexity-and-cognitive-complexity-a87cef0e2851), [Clean vs VSA](https://dev.to/harrykhlo/clean-architecture-vs-vertical-slice-pragmatism-over-dogma-in-modern-software-design-2co5), [Modular Monolith 2026](https://www.ancient.global/en/blogs-ancient/microservices-vs-modular-monolith-2026)

### Testing transverse 🟠

- **Versions stables 2026** : Vitest 4.1.4, Pest 4.5.0, PHPUnit 13.x, pytest 8.x, Ruff 0.8.0+, mypy 1.13.0+, Playwright component testing stable
- **Écart** : important — plusieurs évolutions 2025/2026 manquantes
- **Best practices à revoir** :
  - Stratégie empilée **Vitest (unit/composants) + Playwright (E2E)** (abandonner JSDOM lourd)
  - Python : pytest + Ruff (linting+formatting unifié, 10-100× plus rapide) + mypy strict
  - PHP : migrer vers **Pest 4** avec browser testing intégré (Playwright natif)
  - Vitest workspaces pour monorepos (unit/browser)
- **Patterns manquants** :
  - **Mutation testing** : Stryker (JS/TS/C#), Infection (PHP), Mutmut (Python) — "coverage ment, mutation scores disent la vérité"
  - **Property-based testing** (complémentaire au mutation testing)
  - Pest 4 arch tests avec presets améliorés
  - **Vitest Browser Mode stable** (Chromium/Firefox/WebKit)
  - Playwright component testing (alternative supérieure à React Testing Library)
- **Fichiers impactés** : `.claude/rules/07-testing.md`, skills `testing`, `testing-react`, `testing-python`, `testing-symfony`, `testing-flutter`
- **Sources** : [Vitest 4](https://vitest.dev/blog/vitest-4), [Pest 4 browser](https://pestphp.com/docs/pest-v4-is-here-now-with-browser-testing), [Stryker](https://stryker-mutator.io/), [Vitest vs Jest 2026](https://dev.to/dataformathub/vitest-vs-jest-30-why-2026-is-the-year-of-browser-native-testing-2fgb)

### Sécurité transverse 🟠

- **Écart** : majeur sur plusieurs standards
- **Manques critiques** :
  - **OWASP Top 10:2025** publié novembre 2025 (nouvelles catégories : Software Supply Chain Failures, Mishandling of Exceptional Conditions ; SSRF consolidé dans Broken Access Control) — claude-craft référence OWASP sans version
  - **Supply-chain** (SLSA 1.0, SBOM SPDX 3, Sigstore) : absent
  - Headers cross-origin **COOP/COEP/CORP** : absents
  - **DPoP** (RFC 9449) pour JWT sensibles : absent
  - **EdDSA** recommandé en priorité pour JWT : non mentionné
  - Paramètres OWASP 2026 Argon2id (128 MiB RAM, t=3-5, p=1) : non détaillés
- **Best practices à revoir** :
  - JWT : ajouter EdDSA en priorité, DPoP pour tokens sensibles, HTTP-only cookies (jamais localStorage)
  - Password : Argon2id avec params OWASP 2026
  - Headers : ajouter COOP/COEP/CORP, Permissions-Policy (CSP Level 3 actif)
  - OWASP : mettre à jour vers Top 10:2025
- **Patterns manquants** : SLSA niveaux 1-3, SBOM automatique (SPDX 3/CycloneDX), Sigstore keyless signing, DPoP token binding, Permissions-Policy granulaire
- **Fichiers impactés** : `.claude/rules/11-security.md`, skills `security`, `security-react`, `security-reactnative`, `security-flutter`, `security-symfony`, `.claude/references/base/security.md`
- **Sources** : [OWASP Top 10:2025](https://owasp.org/Top10/2025/), [HTTP Security Headers](https://thibautprobst.fr/en/posts/http-security-headers/), [JWT 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449), [Argon2id 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/), [Supply Chain Playbook 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

### Git / Documentation / DDD 🟡→🟠

- **Standards référencés** : Conventional Commits v1.0.0, GitHub Flow, Keep a Changelog, OpenAPI 3.0, ADR (adr-tools), Diátaxis, MkDocs, DDD tactique, Symfony Messenger, multitenant tenant_id
- **Écart** :
  - **OpenAPI** : 3.0 documenté → **3.2.0 stable** (JSON Schema 2020-12, tag metadata, streaming SSE/JSON Lines, OAuth 2.0 device) 🟠
  - **ADR tooling** : seul adr-tools mentionné → **Log4brains** (CLI + web + diagrammes), **adr-log** (policy enforcement), ADR Manager VS Code, AI generators (Workik) 🟡
  - **Multitenant** : tenant_id seul → tiered approach (shared schema / dedicated schema / dedicated DB) + RBAC/ABAC + field-level encryption 🟠
  - **CQRS/Event Sourcing** : trade-offs et "quand ne PAS utiliser" manquants
  - **Async** : Competing Consumers (Symfony), lifecycle tracking (Laravel), abstraction Ecotone manquants
- **Patterns manquants** : pre-release strategy SemVer, OpenAPI 3.2 streaming, DDD bounded contexts dans mono-repos (claudeMdExcludes)
- **Fichiers impactés** : `.claude/rules/09-git-workflow.md`, `10-documentation.md`, skills `multitenant`, `cqrs`, `async` ; nouveaux skills potentiels `openapi-3.2`, `adr-tooling`, `multitenant-isolation`
- **Sources** : [OpenAPI 3.2](https://spec.openapis.org/oas/v3.2.0.html), [What Changed 3.2 vs 3.1](https://apidog.com/blog/what-changed-openapi-3-2-vs-3-1-vs-3-0/), [Log4brains](https://github.com/thomvaill/log4brains), [Multi-tenant 2026](https://gainhq.com/blog/multi-tenant-architecture/), [Ecotone PHP](https://blog.ecotone.tech/message-processing-in-php-symfony-laravel-ecotone/)

---

## Vague 3 — Infrastructure

### Conteneurs & Orchestration 🟠

- **Versions stables 2026** : Docker Engine 29.4.0, Compose Spec v5.0.0 (codename "Mont Blanc"), Kubernetes 1.35.3 (1.36 attendu 22 avril), Coolify v4.0.0-beta.470, Hadolint v2.12.0
- **Écarts** :
  - **Docker Compose** : `version: '3.8'` dans `.claude/references/symfony/docker.md` → **obsolète** (champ `version:` non requis depuis v2.40+) 🟠
  - **Hadolint** : image non pinnée (`hadolint/hadolint` au lieu de `hadolint/hadolint:v2.12.0`) 🟡
  - **Kubernetes** : versions 1.30/1.31 ne sont plus supportées (policy N-2)
- **Best practices Dockerfile 2026** :
  - **BuildKit cache mounts** (`--mount=type=cache`)
  - **BuildKit secrets** (`RUN --mount=type=secret`)
  - **Images distroless** / **Chainguard** avec SBOMs
  - Multi-stage builds (réduction jusqu'à 97% de taille)
- **K8s 2026** :
  - **Gateway API v1.4+** remplace Ingress
  - **Sidecar-less architectures** (Istio Ambient, Cilium)
  - **Sidecar containers stables** (1.33+)
  - **Dynamic Resource Allocation** (1.30+)
- **Fichiers impactés** : `.claude/agents/devops-engineer.md`, `.claude/references/symfony/docker.md`, `.claude/skills/docker-hadolint/SKILL.md`, `.claude/CLAUDE.md`
- **Sources** : [Docker Engine 29](https://www.docker.com/blog/docker-engine-version-29/), [Compose Spec v5](https://www.compose-spec.io/), [K8s 1.35](https://endoflife.date/kubernetes), [K8s Gateway API](https://dev.to/mechcloud_academy/kubernetes-gateway-api-in-2026-the-definitive-guide-to-envoy-gateway-istio-cilium-and-kong-2bkl)

### IaC (OpenTofu / Ansible / Hcloud) 🟡

- **Versions stables 2026** : OpenTofu 1.11.6 (8 avril 2026), Ansible-core 2.20.4 (beta 2.21.0), Hetzner Cloud provider 1.58.0+
- **Écart** : versions non déclarées dans CLAUDE.md, commandes `.claude/commands/opentofu/`, `ansible/`, `hcloud/` à réviser pour indiquer les versions cibles
- **Migration urgente Hcloud** : `datacenter` → `location` avant **1er juillet 2026**
- **Best practices à revoir** :
  - OpenTofu : sécurité TLS renforcée (anti-deadlock), backends OCI registry, state locking distribué
  - Encryption at rest pour state files
  - Drift detection automatisé (refresh-only runs)
  - Ansible : migration 2.20+ (breaking changes 2.19→2.20)
- **Patterns manquants** : rollback strategies, multi-region state backends
- **Fichiers impactés** : `.claude/commands/opentofu/`, `ansible/`, `hcloud/`
- **Sources** : [OpenTofu releases](https://github.com/opentofu/opentofu/releases), [Ansible-core PyPI](https://pypi.org/project/ansible-core/), [Hetzner Cloud Provider](https://github.com/hetznercloud/terraform-provider-hcloud/releases)

### Runtime / DB (FrankenPHP / PgBouncer) 🟡→🟠

- **Versions stables 2026** : FrankenPHP 1.12.1 (avec PHP 8.5, Caddy 2.11.2), PgBouncer 1.25.1
- **Écart** : versions non explicitées dans les commandes, risque d'images Docker obsolètes
- **Best practices à revoir** :
  - **FrankenPHP Worker Mode** : Laravel Octane + Symfony, gains 2-3×, gestion variables statiques, `max_requests` pour prévenir fuites mémoire
  - **PgBouncer 1.21+** : support natif des prepared statements (`max_prepared_statements=200`), gains 15-250% selon workloads
  - **FrankenPHP v1.11.2+** : corrections sécurité critiques (session leak worker mode, exécution arbitraire de fichiers), +30% CGO, +40% GC (Go 1.26)
  - **HTTP/3** natif via Caddy
- **Patterns manquants** : configuration worker mode spécifique Laravel/Symfony, prepared statements PgBouncer en transaction mode, restart périodique workers, Alpine APK repo FrankenPHP
- **Fichiers impactés** : `.claude/commands/frankenphp/`, `.claude/commands/pgbouncer/`
- **Sources** : [FrankenPHP v1.11.2](https://laravel-news.com/frankenphp-v1112-released-with-30-faster-cgo-40-faster-gc-and-security-patches), [Worker Mode](https://frankenphp.dev/docs/worker/), [PgBouncer 1.21 Prepared Statements](https://www.postgresql.org/about/news/pgbouncer-1210-released-now-with-prepared-statements-2735/)

---

## Top 15 actions prioritaires

1. 🔴 **[Angular]** Mettre à jour la version déclarée **19 → 21** (ou au minimum 20 LTS). Ajouter zoneless par défaut, `httpResource`, Signal Forms. Impact : `CLAUDE.md`, `angular-reviewer.md`, `references/angular/architecture.md`.
2. 🔴 **[React Native]** Mettre à jour **0.76 → 0.85**, **Reanimated 3 → 4.x obligatoire** (sinon incompatible New Architecture). Impact : `CLAUDE.md`, `reactnative-reviewer.md`, skills RN.
3. 🔴 **[Symfony]** Corriger la mention PHP 8.5 → **PHP 8.4+** (prérequis Symfony 8). Ajouter JsonStreamer, JsonPath, ObjectMapper, Wizard Forms.
4. 🔴 **[PHP outils]** Pest 3 → **4.5.0** (intègre PHPUnit 12 + browser testing). Documenter **Property Hooks** et **Asymmetric Visibility** (PHP 8.4).
5. 🔴 **[Sécurité]** Passer à **OWASP Top 10:2025**. Ajouter SLSA/SBOM/Sigstore, DPoP, EdDSA, COOP/COEP/CORP, paramètres Argon2id OWASP 2026.
6. 🟠 **[Laravel]** **12 → 13** (Laravel 13.4.0 actuel). Documenter AI SDK, Vector Search, Passkey Authentication.
7. 🟠 **[Flutter]** 3.38 → **3.41**, Dart 3.10 → **3.11**. Ajouter Riverpod 3 Mutations API, BLoC v9, Impeller par défaut, `dart:js_interop`.
8. 🟠 **[Python]** 3.13+ → **3.14**. Documenter free-threading, JIT 3.14, pytest-asyncio auto mode.
9. 🟠 **[Testing]** Introduire **Vitest 4 + Playwright component testing**, Pest 4 browser, **mutation testing** (Stryker/Infection/Mutmut) dans `rules/07-testing.md` et skills.
10. 🟠 **[Docker]** Supprimer `version: '3.8'` obsolète dans `references/symfony/docker.md`. Pinner `hadolint:v2.12.0`. Ajouter BuildKit cache mounts, distroless/Chainguard.
11. 🟠 **[Hcloud IaC]** Migration **`datacenter` → `location`** avant **1er juillet 2026** dans commandes `/hcloud:*`.
12. 🟠 **[OpenAPI]** 3.0 → **3.2** (streaming SSE/JSON Lines, tag metadata, OAuth device).
13. 🟡 **[React]** Documenter **React Compiler 1.0** et patterns Server Components + `use()`.
14. 🟡 **[Principes]** Introduire **Cognitive Complexity**, **Vertical Slice Architecture**, **Modular Monolith** dans skills et rules.
15. 🟡 **[Infra]** Déclarer versions explicites (FrankenPHP 1.12, PgBouncer 1.25, OpenTofu 1.11, Ansible 2.20, Coolify v4) dans les commandes correspondantes.

---

## Méthodologie

- **Outils** :
  - MCP `context7` (`mcp__context7__resolve-library-id`, `mcp__context7__query-docs`)
  - `WebSearch` (release notes, CHANGELOG, blogs experts, CVE)
- **Sources de vérité pour versions déclarées** :
  - `.claude/CLAUDE.md` (table "Supported Technologies")
  - `.claude/references/<stack>/` (project-context.md, CLAUDE.md)
  - `.claude/agents/<stack>-reviewer.md` (frontmatter + body)
  - Skills `.claude/skills/*` et commandes `.claude/commands/*`
- **Parallélisme** : 3 vagues successives, chaque vague lançant ses N agents dans un message unique (true parallelism via `Agent` + `run_in_background`)
- **Garde-fous** :
  - Aucune modification du dépôt hors ce rapport dans `docs/audit/`
  - Chaque finding cite au moins une source (URL ou identifiant context7)
  - Les relances ont été nécessaires pour 7 agents ayant atteint la limite de tours sans produire leur rapport final — les relances ont ciblé directement la recherche web avec une consigne "pas de lecture de dépôt"

## Limitations de cet audit

- **Skills/commands non ouverts** : l'audit s'appuie sur les noms de fichiers et les versions déclarées dans `CLAUDE.md` + agents reviewers ; il n'a **pas lu le contenu ligne à ligne** de chacun des 204 commandes ou 41 skills. Les paths "impactés" sont des listes de cibles probables, pas une preuve d'obsolescence ligne par ligne.
- **Dates sources** : certaines URLs citent des articles datés 2025-2026 ; une validation manuelle par les mainteneurs reste souhaitable sur les versions les plus récentes (ex : React Native 0.85, Angular 21.2.8, Laravel 13.4.0).
- **Pas d'audit des dépendances npm/composer du projet** : cet audit porte sur le **contenu documentaire** de claude-craft, pas sur ses propres dépendances.
