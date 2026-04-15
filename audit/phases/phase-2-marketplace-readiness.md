# P2-20 — Marketplace Anthropic Skills — Readiness Audit

> **Status** : Audit readiness. La publication effective dépend de l'ouverture du marketplace Anthropic Skills (à vérifier trimestriellement).
>
> **Référence audit** : 03 COMP-002 (défense menace Anthropic Skills).

## Contexte

Anthropic a annoncé un marketplace Skills en 2025/2026. Fenêtre 6-12 mois pour positionner Claude Craft comme **référence** des skills AI-First (devops, DDD, AI-era best practices). Si on laisse le marketplace se peupler de skills concurrents, on perd l'avantage de "early mover".

## Spec format Anthropic Skills (état avril 2026)

**À valider via WebSearch périodique** : "Anthropic Skills marketplace publish spec 2026".

D'après l'observation du format skill existant dans Claude Craft (compatible Claude Code v2.1.105+) :

```yaml
---
name: <kebab-case>
description: <1-2 phrases, utilisé par le LLM pour auto-invocation>
triggers:
  keywords: [...]       # optionnel : mots-clés pour suggestion
  files: [...]          # optionnel : glob patterns
auto_suggest: true      # optionnel
context: fork           # optionnel (v2.1.105+) : exécution en contexte isolé
disable-model-invocation: false  # optionnel
---
```

**Risques format marketplace** :
- Frontmatter pourrait exiger `author`, `license`, `version` (absents).
- Namespace obligatoire (`claude-craft/*`) non encore imposé.
- Limite longueur description (actuellement libre).

## Top 10 skills candidats pour publication

Critères : généricité (pas stack-specific), qualité documentation, réutilisabilité, alignement état de l'art 2026.

| Skill | Chemin | Taille | Stack-specific ? | Ready ? | Action avant publication |
|-------|--------|-------:|-----------------|---------|--------------------------|
| `architect` | `.claude/skills/architect/` | ~8K | Non | ✅ | Ajouter `author`, `license`, `version` frontmatter |
| `testing` | `.claude/skills/testing/` | ~5K | Non | ✅ | Idem + ajouter liens vers `testing-{react,python,...}` |
| `security` | `.claude/skills/security/` | ~6K | Non | ✅ | Idem + mettre à jour OWASP 2025 references |
| `git-workflow` | `.claude/skills/git-workflow/` | ~4K | Non | ✅ | Idem |
| `documentation` | `.claude/skills/documentation/` | ~4K | Non | ✅ | Idem |
| `solid-principles` | `.claude/skills/solid-principles/` | ~5K | Non | ✅ | Idem |
| `kiss-dry-yagni` | `.claude/skills/kiss-dry-yagni/` | ~3K | Non | ✅ | Idem |
| `debug-methodical` | `.claude/skills/debug-methodical/` | ~4K | Non | ✅ | Idem |
| `socratic-brainstorm` | `.claude/skills/socratic-brainstorm/` | ~4K | Non | ✅ | Idem |
| `atomic-tasks` | `.claude/skills/atomic-tasks/` | ~4K | Non | ✅ | Idem |

**Total** : ~47K markdown à reformater.

## Checklist pré-publication (par skill)

- [ ] Frontmatter enrichi : `name`, `description`, `author: "The Bearded CTO"`, `license: MIT`, `version: "1.0.0"`, `repository: https://github.com/Flavien-Metivier/claude-craft`.
- [ ] Description < 200 caractères (utilisée par LLM pour auto-invocation — clarté > exhaustivité).
- [ ] Body < 10K tokens (cohérence avec budget skill 5K-25K).
- [ ] Aucune dépendance stack-specific (`/symfony:*`, `/react:*` → retirer ou abstraire).
- [ ] Exemples en code neutre (pseudocode ou multi-langages).
- [ ] Référence visible vers Claude Craft repo + Discord.
- [ ] Tag release v8.2+ qui verrouille le contenu publié.
- [ ] Compat Claude Code v2.1.107+ (LTS branch).

## Stratégie de publication

### Si marketplace GA (General Availability)

1. **Namespace** : `thebearedcto/claude-craft-<skill>` ou `claude-craft/<skill>` si disponible.
2. **Ordre de publication** : priorité aux skills les plus populaires dans nos métriques internes (tracker via telemetry opt-in, cf. P1-05).
3. **Cadence** : 2 skills / semaine pendant 5 semaines pour éviter spam et permettre feedback.
4. **Bidirectional links** : chaque skill marketplace link → GitHub issue dédié, chaque issue GitHub → skill marketplace.

### Si marketplace closed beta / early access

1. Candidater via le programme early access (email `skills@anthropic.com` ou formulaire officiel).
2. Préparer un pitch : "10 skills prêts, licence MIT, attribution claire, maintenus par mainteneur dédié".
3. Pendant l'attente : garder skills dans repo + promouvoir via Discord / Discussions.

### Si marketplace encore non existant

1. Skills restent dans `.claude/skills/` du repo.
2. Installer via `npx @the-bearded-bear/claude-craft install` (flow actuel).
3. Monitoring trimestriel : `WebSearch "Anthropic Skills marketplace open 2026"`.
4. Préparer post LinkedIn / blog le jour de l'ouverture pour capter l'attention.

## Métriques post-publication

Par skill publié (après 30 jours) :

- Downloads / installs.
- Rating moyen (si feature).
- Issues ouvertes dans repo Claude Craft depuis utilisateurs marketplace (analyse via referer).
- Feedback qualitatif (Discord, Discussions).

Seuil de succès : ≥ 100 downloads totaux après 30 jours, ≥ 4.0/5 rating moyen.

## Risques

| Risque | Mitigation |
|--------|------------|
| Spec marketplace change | Release skills dans un tag séparé `marketplace-v1` pour pinning |
| Skill ne fonctionne pas standalone (dépend de CLAUDE.md) | Tester chaque skill dans un repo vierge avant publication |
| Concurrence adopte nos skills | MIT license permet fork, accepter + valoriser "original" |
| Rating bas par mauvaise UX | Beta test avec 5 utilisateurs Discord avant publication |

## Timeline suggérée

| Semaine | Action |
|---------|--------|
| S1 | Valider spec officielle via WebSearch + contact Anthropic |
| S2 | Reformater les 10 skills (frontmatter enrichi, suppression deps stack) |
| S3 | Beta test Discord (5 users, feedback 48h) |
| S4-5 | Publication 2/semaine |
| S6+ | Monitoring + itération |

## Commandes de reproduction

```bash
# Inspect skill frontmatter
for s in architect testing security git-workflow documentation solid-principles kiss-dry-yagni debug-methodical socratic-brainstorm atomic-tasks; do
  echo "=== $s ==="
  head -15 ".claude/skills/$s/SKILL.md" 2>/dev/null || echo "MISSING"
done

# Measure total size
du -sh .claude/skills/{architect,testing,security,git-workflow,documentation,solid-principles,kiss-dry-yagni,debug-methodical,socratic-brainstorm,atomic-tasks}
```
