# Agent Skills Spec Alignment — Audit Claude Craft

> **Audit de conformité** des 42 skills Claude Craft vis-à-vis de la spécification officielle Anthropic [agent-skills-spec.md](https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md).
>
> **Status v7.34.0 :** audit documentaire uniquement — aucun skill renommé ni cassé.
> **Migration stricte :** prévue en **v8.0.0** (breaking change).

## Spec officielle Anthropic — résumé

Structure d'un skill conforme :

```
.claude/skills/<skill-name>/
├── SKILL.md              # Obligatoire : frontmatter YAML + contenu markdown
├── REFERENCE.md          # Optionnel : documentation étendue
└── <resources/>          # Optionnel : scripts, templates, assets
```

**Frontmatter YAML obligatoire :**

```yaml
---
name: <slug-name>          # Requis : lowercase-kebab-case, unique
description: <one-line>    # Requis : 1 ligne, commence par verbe "Use when..."
---
```

**Frontmatter optionnel (extensions Anthropic / Claude Code) :**

```yaml
triggers:                  # Extension Claude Code
  files: ["*.ts"]
  keywords: ["react", "hook"]
auto_suggest: true         # Extension Claude Code
```

**Règles clés :**
- Self-contained : toutes les ressources dans le dossier du skill
- Un skill = un dossier avec `SKILL.md` à la racine
- `description` doit aider Claude à choisir quand l'invoquer
- Pas de dépendance entre skills (composition libre)

## État actuel Claude Craft (42 skills)

### Skills conformes ✅ (40/42)

Tous les skills Claude Craft respectent déjà :
- Structure dossier `<skill>/SKILL.md` ✅
- Frontmatter `name` + `description` ✅
- Description en une ligne ✅

**Extensions Claude Craft présentes :**
- `triggers.files` — glob patterns (supporté par Claude Code, pas dans spec Anthropic stricte)
- `triggers.keywords` — liste de mots-clés (idem)
- `auto_suggest` — boolean (idem)

Ces extensions sont **safe** : Claude Code les utilise, la spec Anthropic les ignore.

### Écarts identifiés ⚠️

| Skill | Écart | Gravité | Action v8.0.0 |
|-------|-------|---------|----------------|
| `remotion-best-practices` | `metadata:` custom, pas de `triggers` | Mineur | Normaliser |
| `remotion` | Duplicata partiel de `remotion-best-practices` | Mineur | Fusionner |
| Certains skills n'ont pas de `REFERENCE.md` | Contenu parfois long dans SKILL.md | Mineur | Extraire en REFERENCE.md |

### Skills avec contenu long (> 100 lignes dans SKILL.md)

Candidats à extraction `REFERENCE.md` en v8.0.0 :
- `architect` (135 lignes)
- `debug-methodical` (160 lignes)
- `socratic-brainstorm` (130 lignes)
- `atomic-tasks` (122 lignes)
- `design-md-convention` (110 lignes)
- `testing`, `testing-*` (150+ lignes chacun)
- `security-*` (120+ lignes chacun)

**Recommandation :** SKILL.md < 80 lignes (quick reference) + REFERENCE.md pour les détails — pattern déjà appliqué pour `kiss-dry-yagni`, `security`, `testing`.

## Conformité marketplace

Pour interopérabilité avec [Anthropic marketplace](https://github.com/anthropics/skills) et [superpowers-marketplace](https://github.com/obra/superpowers-marketplace) :

| Critère | Status |
|---------|--------|
| `name` unique cross-repository | ✅ Tous les skills Claude Craft préfixés implicitement |
| `description` qui déclenche bien l'auto-load | ✅ Pattern "Use when..." appliqué |
| Self-contained folder | ✅ 100% |
| Pas de chemins absolus | ✅ À auditer PR par PR |
| Frontmatter minimal (name + description) | ✅ |

## Plan de migration v8.0.0 (breaking)

### Non-breaking changes (safe, peuvent arriver avant v8)
- [ ] Normaliser `remotion-best-practices` (retirer `metadata`, ajouter `triggers`)
- [ ] Fusionner `remotion` + `remotion-best-practices` en un seul skill `remotion`
- [ ] Extraire contenu long vers `REFERENCE.md` pour skills > 100 lignes
- [ ] Vérifier absence de chemins absolus dans tous les skills

### Breaking changes v8.0.0
- [ ] Retrait potentiel de `triggers.files` / `triggers.keywords` si Anthropic spec se stabilise sans
- [ ] Rename éventuel des skills conflits (aucun identifié actuellement)
- [ ] Validation JSON Schema au build (CI) : échec si frontmatter non conforme
- [ ] Documentation `MIGRATION-v7-to-v8.md`

### Tests de conformité (v8.0.0)

À ajouter en CI :

```bash
# Test 1 : tous les skills ont SKILL.md
for skill in .claude/skills/*/; do
  [[ -f "${skill}SKILL.md" ]] || echo "MISSING: $skill"
done

# Test 2 : frontmatter valide (name + description)
for f in .claude/skills/*/SKILL.md; do
  head -10 "$f" | grep -q "^name:" || echo "NO NAME: $f"
  head -10 "$f" | grep -q "^description:" || echo "NO DESC: $f"
done

# Test 3 : pas de chemin absolu
grep -rn "/home/\|/Users/\|C:\\\\" .claude/skills/ && echo "ABSOLUTE PATH FOUND"
```

## Ressources

- [Spec officielle Anthropic](https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md)
- [17 skills officiels Anthropic](https://github.com/anthropics/skills)
- [Superpowers marketplace](https://github.com/obra/superpowers-marketplace)
- Skills Claude Craft : `.claude/skills/`

---

**Date d'audit :** 2026-04-15
**Version Claude Craft auditée :** 7.33.0 (→ 7.34.0)
**Migration stricte prévue :** v8.0.0
