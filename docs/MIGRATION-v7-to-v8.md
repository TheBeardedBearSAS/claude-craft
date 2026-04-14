# Migration Guide — Claude Craft v7 → v8

> **Breaking release :** v8.0.0 aligne strictement Claude Craft sur la **spécification officielle Anthropic Agent Skills** ([agent-skills-spec.md](https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md)).
>
> Cette migration est nécessaire pour garantir l'interopérabilité avec le marketplace Anthropic et le `superpowers-marketplace`.

---

## TL;DR

| Changement | Impact | Action requise |
|------------|--------|----------------|
| Suppression symlink `remotion-best-practices` | Bas | Aucune (automatique) |
| Skill `remotion-best-practices` renommé → `remotion` | Bas | Mettre à jour vos références |
| Validation CI des skills obligatoire | Moyen | Installer `Dev/scripts/validate-skills-spec.sh` en pre-commit |
| Frontmatter `metadata:` retiré du skill `remotion` | Bas | Aucune |

Pour la plupart des utilisateurs, la migration est **transparente**. Les changements ci-dessous impactent les intégrations avancées.

---

## Breaking changes détaillés

### 1. Skill `remotion-best-practices` fusionné dans `remotion`

**Avant (v7) :**
```
.claude/skills/
├── remotion/                              (réel)
└── remotion-best-practices -> .agents/... (symlink externe, gitignored)
```

Les deux skills avaient un contenu identique. La spec Anthropic interdit les skills dupliqués.

**Après (v8) :**
```
.claude/skills/
└── remotion/                              (canonique)
```

**Action si vous invoquiez `remotion-best-practices` :**
- Remplacer par `remotion` dans vos `CLAUDE.md` projets
- Mettre à jour les références dans vos `.claude/settings.json`

### 2. Frontmatter `metadata:` supprimé

**Avant (v7) :**
```yaml
---
name: remotion-best-practices
description: Best practices for Remotion - Video creation in React
metadata:
  tags: remotion, video, react, animation, composition
---
```

Le champ `metadata:` n'existe pas dans la spec Anthropic. Remplacé par `triggers:` (extension Claude Code officielle).

**Après (v8) :**
```yaml
---
name: remotion
description: Best practices for Remotion - video creation in React. Use when creating videos, animations, compositions, sequences, or any Remotion project.
triggers:
  files: ["**/remotion.config.*", "**/Root.tsx", "**/Composition.tsx"]
  keywords: ["remotion", "video", "composition", "animation", "sequence", "interpolate"]
auto_suggest: true
---
```

### 3. Validation CI obligatoire

Nouveau script `Dev/scripts/validate-skills-spec.sh` vérifie :

| Règle | Description |
|-------|-------------|
| **Structure** | Chaque skill est un dossier avec `SKILL.md` à la racine |
| **Frontmatter** | YAML commence par `---`, contient `name:` + `description:` |
| **Naming** | Dossier et `name:` identiques, lowercase kebab-case |
| **Description** | Non-vide, idéalement >= 30 chars avec "Use when..." |
| **Portabilité** | Aucun chemin absolu (`/home/`, `/Users/`, `C:\`) |

**Installation pre-commit :**

```bash
# Ajouter à .husky/pre-commit ou équivalent
bash Dev/scripts/validate-skills-spec.sh .claude/skills || exit 1
```

**CI GitHub Actions :**

```yaml
- name: Validate Claude Craft skills spec
  run: bash Dev/scripts/validate-skills-spec.sh
```

---

## Changements non-breaking (rappel des versions récentes)

v8.0.0 inclut également toutes les nouveautés des 5 phases v7.31 → v7.35 :

- **v7.31.0** — Règle 23 Karpathy + skill `atomic-tasks` (GSD) + convention DESIGN.md
- **v7.32.0** — Skills Superpowers : `architect`, `debug-methodical`, `socratic-brainstorm`
- **v7.33.0** — Command `/common:pack-repo` (Repomix wrapper + fallback shell)
- **v7.34.0** — `@security-auditor`, `@data-analyst`, `@migration-specialist`, `@cost-optimizer` + `/uiux:generate-design-md`
- **v7.35.0** — Memory lifecycle hooks (5 hooks + SQLite local, inspired by claude-mem)

---

## Procédure de migration

### Option A — Installation fraîche (recommandé)

```bash
npx @the-bearded-bear/claude-craft@8 install . --tech=<votre-stack> --lang=<langue>
```

### Option B — Upgrade d'un projet existant

1. Mettre à jour la dépendance
   ```bash
   npm install -g @the-bearded-bear/claude-craft@8
   ```

2. Re-installer les rules/skills (garde vos customisations)
   ```bash
   claude-craft install . --tech=<votre-stack> --merge
   ```

3. Vérifier la conformité
   ```bash
   bash Dev/scripts/validate-skills-spec.sh
   ```

4. Mettre à jour vos références `remotion-best-practices` → `remotion`
   ```bash
   grep -rln "remotion-best-practices" . | xargs sed -i 's/remotion-best-practices/remotion/g'
   ```

5. Committer les changements
   ```bash
   git add -A && git commit -m "chore: migrate to Claude Craft v8 (spec-compliant skills)"
   ```

---

## FAQ

### Mes skills custom vont-ils continuer à fonctionner ?

Oui, tant qu'ils respectent la spec (`name` + `description` dans frontmatter, naming kebab-case, pas de chemins absolus). Lancer `validate-skills-spec.sh` pour vérifier.

### Pourquoi cette migration maintenant ?

L'écosystème Claude Code converge vers la spec Anthropic officielle ([agent-skills-spec.md](https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md)). Les marketplaces (Anthropic, superpowers) requièrent cette conformité. Continuer avec un format custom aurait créé une fragmentation.

### Le champ `triggers:` est-il dans la spec officielle ?

Non, c'est une extension Claude Code (supportée nativement par le harness). La spec Anthropic stricte ignore ce champ mais ne l'interdit pas — safe pour l'interopérabilité.

### Quid de `auto_suggest:` ?

Idem : extension Claude Code, pas de la spec stricte, mais safe.

### Quand v9 ?

Pas avant que la spec Anthropic évolue significativement. v8.x sera maintenue avec des updates mineures (skills ajoutés, agents enrichis, patterns de l'écosystème).

---

## Ressources

- [Spec officielle Anthropic](https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md)
- [17 skills officiels Anthropic](https://github.com/anthropics/skills)
- [superpowers-marketplace](https://github.com/obra/superpowers-marketplace)
- Audit interne : `.claude/SKILLS-SPEC.md`
- Script validation : `Dev/scripts/validate-skills-spec.sh`

---

**Date :** 2026-04-15
**Version de départ :** 7.35.0
**Version cible :** 8.0.0
