# Documentation

## Vue d'ensemble

Une bonne documentation est **essentielle** pour la maintenabilité du projet. Elle doit être à jour, concise et utile.

**Principes:**
- ✅ Documentation as Code (versionnée avec le code)
- ✅ Single Source of Truth (pas de duplication)
- ✅ Mise à jour avec chaque PR
- ✅ Automatisée quand possible

---

## Table des matières

1. [Types de documentation](#types-de-documentation)
2. [README.md](#readmemd)
3. [Documentation du code](#documentation-du-code)
4. [ADR - Architecture Decision Records](#adr---architecture-decision-records)
5. [API Documentation](#api-documentation)
6. [Changelog](#changelog)
7. [Bonnes pratiques](#bonnes-pratiques)
8. [Checklist](#checklist)

---

## Types de documentation

| Type | Audience | Contenu | Format |
|------|----------|---------|--------|
| README | Nouveaux devs | Démarrage rapide | Markdown |
| Code comments | Développeurs | Pourquoi, pas quoi | Inline |
| API docs | Consommateurs | Endpoints, schemas | OpenAPI |
| ADR | Équipe | Décisions arch. | Markdown |
| Changelog | Tous | Historique changes | Markdown |
| User docs | Utilisateurs | Guides, tutoriels | Markdown/HTML |

---

## README.md

### Sections requises

Un bon README contient au minimum :

1. **Nom + description** (1-2 phrases)
2. **Prérequis** (outils, versions)
3. **Installation** (commandes)
4. **Démarrage rapide** (commandes)
5. **Configuration** (variables d'environnement)
6. **Tests** (comment les lancer)
7. **Déploiement** (instructions)
8. **Architecture** (brève description + lien vers docs détaillées)
9. **Contribution** (lien vers CONTRIBUTING.md)
10. **License**

---

## Documentation du code

### Règle d'or

> **Le code doit être auto-documenté.**
> Les commentaires expliquent le POURQUOI, pas le QUOI.

### Quand commenter

```
✅ COMMENTER:
- Décisions non évidentes
- Workarounds temporaires
- Références externes (tickets, specs)
- Algorithmes complexes

❌ NE PAS COMMENTER:
- Ce que fait le code (lisible)
- Code évident
- Code mort
```

### Documentation des fonctions

Documenter selon la visibilité :

| Visibilité | Documenter ? |
|------------|-------------|
| **Public API** | Toujours |
| **Fonctions complexes** | Si non évident |
| **Fonctions privées** | Rarement |

Format recommandé : description, `@param`, `@returns`, `@throws`, `@example`.

---

## ADR - Architecture Decision Records

### Format

Un ADR contient les sections suivantes :

| Section | Contenu |
|---------|---------|
| **Statut** | Accepté / Rejeté / Déprécié + date |
| **Contexte** | Problème à résoudre, contraintes |
| **Décision** | Solution choisie |
| **Alternatives considérées** | Options évaluées avec pros/cons |
| **Conséquences** | Impacts positifs et négatifs |

### Quand créer un ADR

- Choix de technologie majeure
- Changement d'architecture
- Adoption d'un pattern
- Décision irréversible ou coûteuse à changer

### Structure des fichiers

```
docs/
└── adr/
    ├── 0001-choix-base-donnees.md
    ├── 0002-architecture-microservices.md
    ├── 0003-strategie-cache.md
    └── index.md
```

### Outils ADR recommandés

| Outil | Description | URL |
|-------|-------------|-----|
| **Log4brains** | CLI + interface web + diagrammes de dépendances entre ADRs | [github.com/thomvaill/log4brains](https://github.com/thomvaill/log4brains) |
| **adr-log** | Validation de conformité (policy enforcement) | [adr.github.io](https://adr.github.io/) |
| **ADR Manager** | Extension VS Code pour créer/éditer ADRs | VS Code Marketplace |
| **Workik AI** | Générateurs IA pour accélérer la rédaction d'ADRs | [workik.com](https://workik.com) |

**Recommandation :** Log4brains pour projets moyens/grands (graphe de dépendances, web UI), templates manuels pour petits projets.

---

## API Documentation

### Format

Utiliser **OpenAPI 3.2.0** (Swagger) pour documenter les APIs REST.

### Nouveautés OpenAPI 3.2

| Fonctionnalité | Description |
|----------------|-------------|
| **JSON Schema 2020-12** | Alignement avec le dernier draft JSON Schema |
| **Tag metadata** | Parent tags, grouping par fonctionnalité |
| **Streaming responses** | Support natif SSE (Server-Sent Events) et JSON Lines |
| **OAuth 2.0 device flow** | Authorization flow pour devices sans browser |
| **Unions discriminées** | Meilleur support des polymorphic schemas |
| **API versioning** | Métadonnées de versioning intégrées |

### Bonnes pratiques API Docs

1. **Exemples concrets** pour chaque endpoint
2. **Codes d'erreur** documentés (RFC 9457 Problem Details)
3. **Authentification** expliquée (Bearer, OAuth2, OIDC)
4. **Rate limits** mentionnés (headers `X-RateLimit-*`)
5. **Versioning** clair (URI `/v1/`, header `API-Version`)
6. **Streaming endpoints** avec SSE/JSON Lines si applicable

---

## Changelog

### Format

Suivre le standard [Keep a Changelog](https://keepachangelog.com/).

### Catégories

| Catégorie | Contenu |
|-----------|---------|
| **Added** | Nouvelles fonctionnalités |
| **Changed** | Modifications de comportement |
| **Deprecated** | Fonctionnalités bientôt supprimées |
| **Removed** | Fonctionnalités supprimées |
| **Fixed** | Corrections de bugs |
| **Security** | Corrections de sécurité |

---

## Bonnes pratiques

### 1. Documentation as Code

```
✅ Versionnée avec Git
✅ Revue dans les PRs
✅ Tests de documentation (liens, syntaxe)
✅ CI/CD génère la doc
```

### 2. Single Source of Truth

```
❌ MAUVAIS
- README dit "utiliser npm"
- Wiki dit "utiliser yarn"
- Slack dit "utiliser pnpm"

✅ BON
- README dit "utiliser npm"
- Wiki renvoie vers README
- Slack renvoie vers README
```

### 3. Mise à jour continue

```
Règle: Chaque PR qui change le comportement
       doit mettre à jour la documentation.

Checklist PR:
- [ ] README mis à jour
- [ ] API docs mis à jour
- [ ] CHANGELOG mis à jour
- [ ] ADR créé si décision architecturale
```

### 4. Automatisation

```yaml
# Génération automatique
- API docs depuis code (annotations)
- Changelog depuis commits (conventional)
- Diagrammes depuis code (Mermaid)
```

---

## Checklist

### Pour chaque PR

- [ ] README mis à jour si changement de setup
- [ ] Commentaires ajoutés pour code non évident
- [ ] CHANGELOG mis à jour
- [ ] API docs générées/mises à jour
- [ ] ADR créé si décision architecturale

### Revue trimestrielle

- [ ] README toujours exact
- [ ] Liens fonctionnels
- [ ] Exemples à jour
- [ ] Dépendances documentées

### Nouveau projet

- [ ] README avec installation
- [ ] CONTRIBUTING.md
- [ ] CHANGELOG.md initialisé
- [ ] Structure docs/adr/ créée
- [ ] Template PR avec checklist doc

---

## Outils recommandés

| Outil | Usage |
|-------|-------|
| **MkDocs** | Documentation site |
| **Swagger UI** | API documentation |
| **Mermaid** | Diagrammes |
| **ADR Tools** | Gestion ADRs |
| **Vale** | Linting prose |

---

> Detailed examples and templates: see @.claude/references/base/documentation.md

---

## Ressources

- **Keep a Changelog:** [keepachangelog.com](https://keepachangelog.com/)
- **ADR:** [adr.github.io](https://adr.github.io/)
- **OpenAPI 3.2.0:** [spec.openapis.org/oas/v3.2.0.html](https://spec.openapis.org/oas/v3.2.0.html)
- **OpenAPI 3.2 vs 3.1 vs 3.0:** [apidog.com/blog/what-changed-openapi-3-2-vs-3-1-vs-3-0](https://apidog.com/blog/what-changed-openapi-3-2-vs-3-1-vs-3-0/)
- **Diátaxis:** [diataxis.fr](https://diataxis.fr/) (framework documentation)

---

**Date de dernière mise à jour:** 2026-04
**Version:** 1.1.0
**Auteur:** The Bearded CTO
