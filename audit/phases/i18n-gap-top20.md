# I18n Gap — Top 20 fichiers prioritaires

> Généré automatiquement par `.claude-craft-tmp/i18n-audit.sh`. Source : `audit/phases/i18n-gap.csv`.

## Constat

- **489 fichiers** multilingues audités.
- **25 missing** (0 byte dans au moins une langue cible).
- **99 size_gap** (< 80% de la version EN).
- **29 P1** (README, QUICKSTART, CLAUDE.md, getting-started + missing).
- **L'essentiel du gap est côté website/** — la doc publique n'est pas encore traduite hors FR.

## Breakdown par priorité

| Priorité | Nombre |
|----------|--------|
| P1 (critique : README/QUICKSTART/missing) | 29 |
| P2 (CLAUDE.md / README secondaires) | 8 |
| P3 (contenu technique secondaire) | 452 |

## Top 20 à traduire en priorité

Tri par taille EN décroissante (impact utilisateur maximal).

| Fichier | EN | FR | ES | DE | PT | Statut |
|---------|---:|---:|---:|---:|---:|--------|
| `website/changelog.md` | 90K | 0 | 0 | 0 | 0 | missing |
| `website/reference/commands.md` | 34K | 0 | 0 | 0 | 0 | missing |
| `website/reference/agents.md` | 33K | 0 | 0 | 0 | 0 | missing |
| `website/frameworks/agent-teams.md` | 23K | 0 | 0 | 0 | 0 | missing |
| `website/architecture.md` | 22K | 0 | 0 | 0 | 0 | missing |
| `website/reference/commands-full.md` | 22K | 0 | 0 | 0 | 0 | missing |
| `website/reference/agents-full.md` | 20K | 0 | 0 | 0 | 0 | missing |
| `website/reference/hooks.md` | 15K | 0 | 0 | 0 | 0 | missing |
| `website/reference/technologies.md` | 15K | 0 | 0 | 0 | 0 | missing |
| `website/contributing.md` | 15K | 0 | 0 | 0 | 0 | missing |
| `website/reference/mcp.md` | 14K | 0 | 0 | 0 | 0 | missing |
| `website/troubleshooting.md` | 14K | 9K | 0 | 0 | 0 | missing |
| `website/reference/cli.md` | 13K | 12K | 0 | 0 | 0 | missing |
| `website/frameworks/bmad-guide.md` | 13K | 0 | 0 | 0 | 0 | missing |
| `website/frameworks/ralph-guide.md` | 12K | 0 | 0 | 0 | 0 | missing |
| `website/getting-started/installation.md` | 12K | 0 | 0 | 0 | 0 | missing |
| `website/faq.md` | 11K | 11K | 0 | 0 | 0 | missing |
| `docs/guides/01-getting-started.md` | 10K | 10K | 6K | 6K | 6K | size_gap |
| `website/reference/scripts.md` | 10K | 0 | 0 | 0 | 0 | missing |
| `website/getting-started/configuration.md` | 10K | 0 | 0 | 0 | 0 | missing |

## Recommandations

### Scope réel vs audit initial

L'audit original annonçait "48% parité ES/DE/PT". La réalité mesurée :
- **Dev/, Infra/, Project/, Tools/i18n/** : parité ~94-97% (quasi complète).
- **website/** : seul FR partiellement traduit, ES/DE/PT **totalement absents**.
- **docs/guides/** : ES/DE/PT à 60% (size_gap modéré).

### Stratégie suggérée

1. **Phase 2a (immédiat)** : traduire le top 20 du website (~420K total, ~12K-15K LOC Markdown).
   - Outil : DeepL API ou Claude Sonnet pour pré-traduction.
   - Review humaine native obligatoire pour FAQ, contributing, troubleshooting.
   - Effort estimé : **50-80h** (au lieu des 60h audit initial — proche).

2. **Phase 2b (différé)** : compléter `docs/guides/` ES/DE/PT size_gap (10 fichiers à ~60%).
   - Effort : ~20h.

3. **Phase 3** : P2 (CLAUDE.md secondaires) et P3 (références techniques).

### Blocage CI

Un validator `lint:i18n` renforcé est désormais en place : il bloque sur régression (fichier qui chute sous 80% de parité ou disparition). Voir `.github/workflows/i18n-parity.yml`.

## Reproduire l'audit

```bash
bash .claude-craft-tmp/i18n-audit.sh
# Produit audit/phases/i18n-gap.csv (490 lignes)
```
