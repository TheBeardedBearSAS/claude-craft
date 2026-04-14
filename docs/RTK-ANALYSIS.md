# Analyse Approfondie : RTK (Rust Token Killer)

**Version:** 7.28.0 | **Date:** 2026-04-14

> **Repo:** github.com/rtk-ai/rtk | **Site:** rtk-ai.app
> **Auteur:** Patrick Szymkowiak (@gloupish) | **Licence:** MIT
> **Version RTK:** 0.22.1 | **Langage:** Rust (99.9%)
> **Cree le:** 2026-01-22 (~28 jours) | **Stars:** 1,045 | **Forks:** 74

---

## 1. Qu'est-ce que RTK ?

RTK est un **proxy CLI** ecrit en Rust qui reduit la consommation de tokens LLM de **60-90%** sur les commandes developpeur courantes. Il s'intercale entre l'assistant IA (Claude Code, Cursor, Aider, Gemini CLI...) et le terminal, filtrant/compressant les sorties avant qu'elles n'atteignent la fenetre de contexte du LLM.

**Proposition de valeur :**
- Session Claude Code de 30 min : ~150,000 tokens -> ~45,000 avec RTK (70% de reduction)
- Single binary, zero dependance runtime, zero telemetrie
- Integration transparente via hook PreToolUse de Claude Code

---

## 2. Fonctionnement

```
Utilisateur/LLM lance "git status"
        |
        v
Hook PreToolUse reecrit -> "rtk git status"
        |
        v
RTK execute la vraie commande "git status"
        |
        v
Module git.rs filtre/compresse la sortie
        |
        v
Sortie compacte renvoyee au LLM (85% de tokens en moins)
        |
        v
Tracking SQLite local (metriques de savings)
```

**4 techniques de compression :**

| Technique | Description |
|-----------|-------------|
| **Smart Filtering** | Supprime commentaires, whitespace, info redondante |
| **Grouping** | Agregation par categorie (erreurs lint par regle) |
| **Truncation** | Preserve le contexte pertinent, elimine le bruit |
| **Deduplication** | Collapse les entrees repetees avec compteurs |

---

## 3. Commandes supportees (30+)

| Categorie | Commandes | Reduction tokens |
|-----------|-----------|-----------------|
| **Git** | status, log, diff, add, commit, push, pull, branch, fetch, stash | 59-99% |
| **Tests** | cargo test, pytest, vitest, playwright, go test | 90-99.6% |
| **Linting** | eslint, biome, ruff, golangci-lint, tsc, prettier | 80-87% |
| **Fichiers** | ls, tree, find, grep, read, smart, wc | 50-80% |
| **Containers** | docker, kubectl, docker-compose | 60-80% |
| **JS/TS** | next build, prisma, pnpm | 70-90% |
| **Python** | pip, ruff, pytest | 70-92% |
| **Go** | go test/build/vet, golangci-lint | 75-90% |
| **Analytique** | `rtk gain` (dashboard savings), `rtk discover` (audit sessions) | N/A |

**Cas marquants :**
- `vitest run` : 102,199 chars -> 377 chars (**-99.6%**)
- `git push` : verbose output -> `ok main` (**-99%**)
- `cargo test` : 155 lignes -> 3 lignes (**-98%**)

---

## 4. Architecture technique

**48 modules Rust** pour ~18,000+ lignes :

| Module | Taille | Role |
|--------|--------|------|
| `main.rs` | 48K | Entrypoint CLI (Clap), routage commandes |
| `git.rs` | 53K | 12 sous-commandes git avec filtering |
| `cargo_cmd.rs` | 54K | test/build/clippy/nextest |
| `gh_cmd.rs` | 46K | GitHub CLI (pr/issue/run) |
| `filter.rs` | 12K | Moteur de filtrage multi-langage (8 langages) |
| `tracking.rs` | 34K | SQLite analytics (retention 90 jours) |
| `tee.rs` | 12K | Recovery output brut sur echecs |
| `init.rs` | 51K | Installation hooks + CLAUDE.md |
| `discover/` | 49K | Scanner de sessions pour savings manques |

**Dependencies (13 crates) :**
- `clap` 4.x, `anyhow`, `regex`, `serde/serde_json`, `rusqlite` (bundled), `chrono`, `colored`, `dirs`, `walkdir`, `ignore`, `toml`, `thiserror`, `tempfile`
- **Zero dependance reseau** (pas de reqwest, pas de std::net)
- **Zero telemetrie** -- donnees 100% locales

---

## 5. Qualite du code & CI/CD

### Forces

- Architecture proxy bien structuree (1 module = 1 domaine de commande)
- 140+ tests unitaires (`#[test]`) repartis dans les modules principaux
- Build release optimise (LTO, strip, opt-level 3, panic=abort)
- Binary ~4.1 MB, overhead ~5-15ms par commande

### CI/CD (5 workflows GitHub Actions)

| Workflow | Declencheur | Role |
|----------|-------------|------|
| `security-check.yml` | Chaque PR | cargo audit, scan patterns dangereux, Clippy |
| `release-please.yml` | Merge main | Versioning auto, CHANGELOG |
| `release.yml` | Tag | Build multi-plateforme (macOS/Linux/Windows) |
| `benchmark.sh` | Pre-release | Mesure overhead par commande |
| `validate-docs.yml` | PR | Validation documentation |

### Securite

- 3 couches de review securite (CI auto + skill Claude Code + review manuelle)
- Fichiers critiques (runner.rs, tracking.rs, Cargo.toml) = 2 reviewers requis
- Scan automatique : injection shell, manipulation .env, operations reseau, blocs unsafe
- **Zero vecteur d'exfiltration** : pas de HTTP, pas de manipulation env vars

### Faiblesses

- Fichiers volumineux (53K git.rs, 54K cargo_cmd.rs) -- proches des limites de maintenabilite
- Pas de tests d'integration E2E en Rust (shell-based uniquement)
- Section `[dev-dependencies]` vide -- pas de framework de test externe

---

## 6. Reception communautaire

### Traction

- **1,045 stars en 28 jours** (croissance tres forte)
- **478 stars la premiere semaine** (annonce Twitter/X)
- 74 forks, 38 issues ouvertes, 8+ contributeurs externes
- Cadence de release : ~1 release/jour (v0.1 -> v0.22.1 en 28 jours)

### Savings reels rapportes

| Utilisateur | Duree | Resultats |
|-------------|-------|-----------|
| Createur (Patrick S.) | 15 jours | 24.6M tokens saves (83.7%) sur 7,061 commandes |
| Communaute | 2 semaines | ~10M tokens saves (89%) |

---

## 7. Modele economique

- **RTK CLI** : Gratuit, open-source (MIT)
- **RTK Cloud (coming soon)** : Dashboard analytics equipe a $15/dev/mois (tier gratuit pour open-source)

---

## 8. Pertinence pour claude-craft

### Complementarite directe

| claude-craft | RTK | Synergie |
|-------------|-----|---------|
| Gere le workflow dev IA | Optimise les couts tokens | **Complementaires** |
| 16 stacks technos | 30+ commandes proxy | RTK couvre les memes stacks |
| Hooks PreToolUse | S'integre via hooks | Integration native possible |
| Agents & commandes | Proxy transparent | Aucun conflit |

### Points positifs

- Reduit directement les couts Claude Code (meme ecosysteme)
- Integration hook non-invasive (transparent pour les agents/commandes)
- Zero vendor lock-in (MIT, pas de telemetrie)
- Memes stacks supportes (Rust, Python, JS/TS, Go, Docker, K8s)
- Peut reduire les compactions de contexte (moins de tokens = plus de marge)

### Risques

- Projet en beta precoce (v0.22, 28 jours d'existence)
- Breaking changes possibles avec les releases quotidiennes
- Collision de nom avec le crate `rtk` (Rust Type Kit) sur crates.io
- 2 contributeurs principaux seulement (bus factor)
- Pas encore battle-tested en production enterprise

---

## 9. Verdict

### Score global : 7.5/10

| Critere | Score | Commentaire |
|---------|-------|-------------|
| **Innovation** | 9/10 | Premier outil dans la categorie "token optimizer" |
| **Pertinence** | 9/10 | Directement complementaire a Claude Code / claude-craft |
| **Qualite technique** | 7/10 | Architecture solide, fichiers parfois trop gros |
| **Securite** | 8/10 | Zero telemetrie, scan automatise, review multi-couche |
| **Maturite** | 5/10 | Beta precoce, 28 jours, releases quotidiennes |
| **Communaute** | 7/10 | Traction forte mais encore petit noyau (2 core devs) |
| **Documentation** | 8/10 | Excellente (ARCHITECTURE.md, SECURITY.md, AUDIT_GUIDE.md) |
| **Maintenabilite** | 6/10 | Fichiers volumineux, pas de tests E2E Rust |

---

## 10. Recommandation

**A surveiller de pres.** RTK adresse un vrai besoin (optimisation tokens LLM) avec une approche technique elegante. La complementarite avec claude-craft est evidente.

### Plan d'action

| Horizon | Action |
|---------|--------|
| **Court terme** | Tester RTK manuellement avec claude-craft pour valider les savings reels |
| **Moyen terme** | Si RTK atteint v1.0 avec stabilite prouvee, envisager une mention dans la doc ou un guide d'integration |
| **Long terme** | Potentielle integration optionnelle dans le workflow claude-craft (ajout de hooks RTK via `/common:setup-project-context`) |

### Risques a monitorer

- Abandon du projet (2 core devs seulement)
- Changements d'API incompatibles (pre-1.0)
- Passage a un modele payant plus restrictif
- Collision de nom non resolue sur crates.io

---

## 11. Installation

RTK is integrated into claude-craft as an optional tool.

### Quick Install

```bash
# Via Makefile
make install-rtk RULES_LANG=fr

# Via CLI (interactive — answer 'y' to RTK question)
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=en

# Via Claude Code command
/common:setup-rtk
```

### Manual Install

```bash
bash Tools/RTK/install-rtk.sh --lang=en
```

### Check Status

```bash
bash Tools/RTK/install-rtk.sh --check
```

### Uninstall

```bash
bash Tools/RTK/install-rtk.sh --uninstall
```

### Tests

```bash
docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/RTK/tests/
```

---

*Analyse realisee le 2026-04-14 avec equipe d'agents specialises.*
