# Claude Craft Skills Marketplace

> **Status** : DRAFT — **parkée** (décision audit 2026-07-03, GAP-04). Scaffolding initial (site Astro + index JSON + CLI spec) non terminé, **non annoncé publiquement**, aucun user ne l'attend.
> **Décision** : privilégier la soumission des skills à l'**Anthropic Skills Marketplace** (roadmap DIFF-10) plutôt qu'un marketplace maison à maintenir. Reprendre ce chantier uniquement si DIFF-10 s'avère insuffisant.
> **URL cible** : https://skills.claude-craft.dev
> **Source** : `audit/10-COMMUNAUTE.md` §COMM-015 ; décisions de scope dans `docs/ROADMAP.md`.

## Vue d'ensemble / Overview

🇫🇷 Marketplace communautaire pour skills Claude Code. Tout le monde peut publier, installer, noter.
🇬🇧 Community marketplace for Claude Code skills. Anyone can publish, install, rate.

## Structure

```
skills-marketplace/
├── README.md              ← vous êtes ici
├── index.json.template    ← schéma d'index (généré en CI)
├── skills/
│   └── SKILL-TEMPLATE.md  ← template à copier pour nouvelle skill
├── site/                  ← Astro site statique (catalogue, recherche)
│   ├── package.json
│   ├── astro.config.mjs
│   └── src/
│       ├── pages/
│       │   └── index.astro
│       └── layouts/
│           └── Base.astro
└── cli-spec.md            ← spec pour `claude-craft skill install <name>`
```

## Workflow contributeur

1. Fork ce repo (ou le futur repo dédié `github.com/the-bearded-cto/skills-marketplace`)
2. Copier `skills/SKILL-TEMPLATE.md` → `skills/<votre-skill>/SKILL.md`
3. Remplir le frontmatter (stack, tags, version)
4. PR → review par 2 mainteneurs → merge
5. CI regenère `index.json` automatiquement

## Installation

```bash
# Chercher
claude-craft skill search symfony

# Installer
claude-craft skill install php:check-testing-advanced

# Lister ses skills locales
claude-craft skill list
```

## Licences

- Site statique (Astro) : **MIT**
- Skills communautaires : **chaque contributeur choisit sa licence** (recommandé : MIT, Apache 2.0, CC-BY-SA)
- Template `SKILL-TEMPLATE.md` : **CC0** (domaine public)

## Roadmap

- [ ] Site live Cloudflare Pages sur skills.claude-craft.dev
- [ ] Catalogue de 30+ skills (10 officiels + 20 communautaires)
- [ ] CLI `claude-craft skill install` fonctionnel (NPM + GitHub raw)
- [ ] Recherche full-text (Pagefind)
- [ ] Ratings + stats downloads
- [ ] Badge "Top Contributor" + AUTHORS.md

## Non-goals v1

- ❌ Backend custom (GitHub raw + index JSON CI suffit)
- ❌ Auth utilisateur (pas de ratings personnels v1, ratings anonymisés aggregés)
- ❌ Monétisation skills (free-for-all, gratuit, pas de paywall)
- ❌ Auto-update skills installées (manuel `claude-craft skill update <name>`)
