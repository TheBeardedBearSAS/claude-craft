---
title: "Claude Craft vs Cursor Rules vs BMad-Method : pragmatic comparison (2026)"
publishedAt: ""
canonical: ""
tags: ["ai", "comparison", "claude-code", "cursor", "bmad"]
status: DRAFT
author: Flavien Métivier
wordCount: ~2200
---

# Claude Craft vs Cursor Rules vs BMad-Method : pragmatic comparison

**TL;DR** : J'ai utilisé les 3 sur 4 projets clients (2 Symfony, 1 React, 1 Flutter). Voici comment choisir.

## Le contexte 2026

Trois approches dominantes pour structurer l'AI-assisted dev :

- **Cursor Rules** : fichiers `.cursor/rules/*.mdc`, focus IDE Cursor
- **BMad-Method** : framework original (Brian Madison), workflow 6 phases
- **Claude Craft** : surcouche open-source de Claude Code + BMAD v6, multi-stack

Trois philosophies, trois trade-offs.

## Matrice comparative

| Dimension | Cursor Rules | BMad-Method | Claude Craft |
|---|---|---|---|
| **Setup initial** | 2 min | 30 min | 5 min |
| **IDE lié** | Cursor only | Agnostic | Claude Code |
| **Stacks supportés** | Tous (user-defined) | Agnostic | 11 stacks curated |
| **Agents** | Non | Via Cursor agents | 67 agents pré-packagés |
| **Commands** | Non | Templates | 214 commands |
| **Workflow** | DIY | Strict 6 phases | BMAD v6 + personnalisable |
| **Licence** | Propriétaire (Cursor) | MIT | MIT (+ commercial draft) |
| **Prix** | Cursor Pro $20/mois | Gratuit | Gratuit (MIT) |
| **Audit/Security** | Non | Non | `/team:audit`, `/team:security` |
| **Tests coverage** | DIY | DIY | `/*:check-testing` par stack |
| **i18n** | Non | Partiel | 5 langues |
| **Communauté** | Cursor Discord | GitHub ~5k stars | Early phase |

## Quand choisir quoi

### Cursor Rules : vous êtes team Cursor

**Choisir si** :
- Vous utilisez déjà Cursor (votre IDE principal)
- Vous voulez un contrôle fin par fichier
- Vous n'avez pas besoin d'agents multi-stack complexes
- Petit projet solo ou dans une startup early-stage

**Éviter si** :
- Vous utilisez VS Code + Claude Code
- Vous avez besoin d'audit / conformité automatisée
- Vous travaillez en équipe > 3 devs sur multi-stack

### BMad-Method : vous voulez apprendre les fondations

**Choisir si** :
- Vous cherchez un cadre méthodologique universel (agent-agnostic)
- Vous voulez comprendre le "pourquoi" des phases
- Vous êtes prêt à construire votre tooling autour

**Éviter si** :
- Vous voulez un framework clé-en-main avec commandes prêtes
- Vous utilisez Claude Code (Claude Craft encapsule BMAD v6)

### Claude Craft : vous voulez la suite complète Claude Code

**Choisir si** :
- Vous utilisez Claude Code comme IDE/CLI principal
- Vous travaillez sur 1+ des 11 stacks supportés
- Vous voulez audit, security, workflow, agents pré-configurés
- Équipe 2-10 devs

**Éviter si** :
- Cursor est votre IDE principal (fork partiel possible mais friction)
- Stack non supporté (Rust, Go, Elixir — contributions bienvenues)
- Aversion aux frameworks opinionated

## Les critères qui comptent vraiment

Après 4 projets, voici les signaux qui m'ont fait basculer.

### 1. Temps entre "idée" et "premier commit testé"

- Cursor Rules : 30 min (rédaction règles + 1er prompt)
- BMad-Method : 2h (setup workflow + templates)
- Claude Craft : 15 min (`install + /workflow:init + /workflow:plan`)

### 2. Onboarding nouveau dev

- Cursor Rules : lire `.cursor/rules/*` + doc projet
- BMad-Method : lire framework + doc projet
- Claude Craft : `make install-<stack>` + `docs/QUICKSTART.md`

### 3. Maintenance long-terme

- Cursor Rules : drift des règles, oubli de mise à jour
- BMad-Method : très stable mais minimaliste
- Claude Craft : release hebdo, risk de breaking changes (cadence rapide)

### 4. Coût total

| | An 1 | An 2 |
|---|---|---|
| Cursor Rules | $240 (Cursor Pro) × 5 devs = $1200 | idem |
| BMad-Method | $0 | $0 |
| Claude Craft | $0 (+ claude API usage) | $0 à €5000 si commercial tier |

## Cas d'usage où j'ai failli changer d'avis

### Cas 1 : projet Rust

Claude Craft ne supporte pas Rust. J'ai utilisé BMad-Method + Cursor Rules custom. Résultat : workflow fonctionnel en 3h mais moins riche.

### Cas 2 : client exige Cursor

Pas d'issue. Claude Craft a un fork plugin Cursor en draft (non officiel) — pas maintenu. J'ai recréé les règles essentielles dans `.cursor/rules/` (copier-coller depuis `.claude/rules/`).

## Conclusion

Pas de silver bullet. Mais un rule of thumb :

- **Solo + Cursor + multi-stack custom** → Cursor Rules
- **Équipe + méthodo avant outil** → BMad-Method
- **Équipe + Claude Code + stack supportée** → Claude Craft

Les 3 peuvent cohabiter (j'utilise Cursor Rules pour des scratch + Claude Craft pour les projets clients).

---

*Ressources :*
- [Claude Craft GitHub](https://github.com/the-bearded-cto/claude-craft)
- [BMad-Method](https://github.com/brianmadison/bmad-method)
- [Cursor Directory](https://cursor.directory)
