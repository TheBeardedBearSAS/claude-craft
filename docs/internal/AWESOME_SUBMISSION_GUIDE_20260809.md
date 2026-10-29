# Guide soumission awesome-claude-code — ACTION 3 MIN

**Date préparation :** 2026-08-09 — **Mise à jour counts : 2026-08-16**  
**Statut :** Prêt — ouvrir le lien ci-dessous, cocher, soumettre  
**Enjeu :** Premier backlink externe depuis une liste curatée (DA élevé, audience Claude Code)

---

## Règle critique — ne pas ignorer

**Ne pas soumettre via `gh` ou l'API GitHub.**  
Le repo `hesreallyhim/awesome-claude-code` détecte les soumissions automatisées et applique un auto-close + cooldown/ban du compte. Ouvrir uniquement via navigateur, formulaire web.

---

## Les 3 étapes

### Étape 1 — Ouvrir le formulaire (30 secondes)

Ouvrir ce lien dans un navigateur (tous les champs sont pré-remplis) :

```
https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml&display_name=claude-craft&category=Tooling&subcategory=General&primary_link=https%3A%2F%2Fgithub.com%2FTheBeardedBearSAS%2Fclaude-craft&author_name=The%20Bearded%20CTO&author_link=https%3A%2F%2Fthe-bearded-bear.com&license=MIT&description=Multi-stack%20framework%20for%20Claude%20Code%3A%2015%20technology%20stacks%2C%20140%20commands%20across%2017%20namespaces%2C%2033%20specialized%20agents%2C%20BMAD%20v6%20sprint%20workflow%2C%20browser%20QA%20automation%2C%20and%20i18n%20in%205%20languages.%20Installable%20via%20npx.
```

> **Duplicate check (2026-08-16) :** `absent (ok to submit)` — vérifié en direct contre le CSV upstream.

### Étape 2 — Vérifier les champs (60 secondes)

| Champ | Valeur attendue |
|-------|-----------------|
| `display_name` | `claude-craft` |
| `category` | `Tooling` |
| `subcategory` | `General` |
| `primary_link` | `https://github.com/TheBeardedBearSAS/claude-craft` |
| `author_name` | `The Bearded CTO` |
| `author_link` | `https://the-bearded-bear.com` |
| `license` | `MIT` |
| `description` | `Multi-stack framework for Claude Code: 15 technology stacks, 140 commands across 17 namespaces, 33 specialized agents, BMAD v6 sprint workflow, browser QA automation, and i18n in 5 languages. Installable via npx.` |

**Champ `validate_claims`** (peut ne pas être pré-rempli — coller manuellement si vide) :
```
Public npm package (@the-bearded-bear/claude-craft), MIT, 1139 passing tests + mutation testing, 13 stack-specific reviewers, BMAD v6 sprint workflow, and a strictly schema-valid plugin manifest.
```

### Étape 3 — Cocher toutes les cases et soumettre (30 secondes)

Toutes les cases de la checklist doivent être cochées avant de pouvoir soumettre.  
Cliquer "Submit new issue".

---

## Après soumission

- Le bot upstream traite les issues sous 24-72h (workday).
- Ne pas ouvrir de second issue tant que le premier est ouvert.
- Ne pas commenter l'issue après soumission sauf si le bot demande des corrections.
- Une fois accepté, claude-craft apparaît dans `THE_RESOURCES_TABLE.csv` du repo et sur la page curatée.

---

## Pourquoi maintenant

- SEO technique en place (sitemap, canonical, JSON-LD) — un backlink depuis awesome-claude-code sera crawlé et indexé proprement.
- La description est à jour (15 stacks v8.22.0) — pas besoin de revenir dessus.
- C'est la seule action de traction à 3 minutes avec un impact SEO direct et durable.

---

*Préparé par CMO agent e8318117 — 2026-08-09*  
*Script source : `scripts/awesome-claude-code-submit.mjs` (met à jour le prep file à chaque run)*
