# E2E Tests — Tools/ scripts

> Phase 2 audit P2-11. Tests end-to-end dockerisés pour les scripts principaux de `Tools/`.

## Stack

- **Runner** : [Bats](https://bats-core.readthedocs.io/) (Bash Automated Testing System).
- **Isolation** : Docker (Ubuntu 24.04) — alignement règle CLAUDE.md "Docker obligatoire".
- **Framework** : `docker-compose.test.yml` monte le repo en read-only et lance `bats`.

## Scripts couverts

| Script | Suite | Tests |
|--------|-------|------:|
| `Tools/StatusLine/statusline.sh` | `statusline.bats` | 4 |
| `Tools/Ralph/ralph.sh` | `ralph.bats` | 5 |
| `Tools/Ralph/` (comportement de la boucle) | `ralph-behavioral.bats` | 11 |
| `Tools/Ralph/lib/parallel-manager.sh` (sessions Claude) | `ralph-parallel-session.bats` | 2 |
| `Tools/Ralph/` (chemins `set -e`) | `ralph-set-e.bats` | 7 |
| `Tools/Ralph/` (sessions de continuation) | `ralph-continuation.bats` | 8 |
| `Tools/Ralph/lib/sprint-conductor.sh` (sessions, workers) | `ralph-conductor-sessions.bats` | 7 |
| `Tools/Ralph/` (handoff, workers parallèles) | `ralph-handoff-workers.bats` | 7 |
| `Tools/Ralph/` (ids de story non sûrs, langue du leader) | `ralph-unsafe-session-paths.bats` | 5 |
| `scripts/verify-i18n-parity.sh` (dépôt en lecture seule) | `i18n-parity.bats` | 2 |
| `Tools/install-rtk.sh` | `install-rtk.bats` | 6 |
| `Dev/scripts/install-*-rules.sh` | `install-scripts.bats` | 12 |
| `cli/lib/path-safety.js` (skippée sans `node`) | `path-safety.bats` | 9 |
| **Total** | 13 suites | **85** |

## Exécution locale

```bash
# Via docker-compose (recommandé)
cd tests/e2e/tools
docker compose -f docker-compose.test.yml up --abort-on-container-exit

# Sortie : ./artifacts/e2e-report.txt

# Exécution directe (si bats installé localement)
bats tests/e2e/tools/*.bats
```

## CI

Job dédié dans `.github/workflows/e2e-tools.yml` (à créer si absent) :

```yaml
jobs:
  e2e-tools:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd tests/e2e/tools && docker compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from e2e-runner
```

## Extension

Pour ajouter un nouveau script :

1. Créer `<script-name>.bats` dans ce répertoire.
2. Adapter le pattern des fichiers existants (setup, tests de base : exists, shellcheck, bash -n, --help).
3. Ajouter le fichier au `command` de `docker-compose.test.yml`.
4. Update ce README avec le nouveau script couvert.

## DoD P2-11

- [x] 3 suites E2E (ralph, statusline, install-rtk).
- [x] docker-compose.test.yml.
- [ ] Job CI `e2e-tools` actif (à lancer en parallèle de cette PR).
- [ ] bashcov coverage report ≥ 60% (à ajouter en itération 2).
- [ ] Badge README (à ajouter après 1ère CI verte).
