# Cheatsheet Avance — Claude Code

> Reference pratiques avancees (Modules 6-8)

---

## MCP — Model Context Protocol

### Architecture

```
┌─────────────────────────┐
│      Claude Code        │
│   (Client MCP)          │
└──┬──────────┬──────────┬┘
   |          |          |
┌──┴──────┐ ┌─┴───────┐ ┌┴──────────┐
│ Serveur │ │ Serveur │ │ Serveur   │
│ MCP BDD │ │ MCP API │ │ MCP Chrome│
└─────────┘ └─────────┘ └───────────┘
```

### Configuration dans settings.json

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-sqlite", "database.db"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Commandes MCP

```bash
claude mcp add <name> -- <command> [args...]   # Ajouter un serveur
claude mcp add sqlite -- npx -y @anthropic/mcp-server-sqlite db.sqlite
/mcp                                           # Gerer en session
```

### Composants MCP

| Composant | Description |
|-----------|-------------|
| **Outils (Tools)** | Actions executables (`query_database`, `create_issue`) |
| **Ressources** | Donnees en lecture (schema BDD, docs) |
| **Prompts** | Templates de prompts predefinis |

### Securite MCP

- Auditer le code source avant installation
- Preferer ecrire ses propres serveurs MCP
- Limiter les permissions (tools allowlist)
- Version pinee (pas de `latest`)
- Pas d'acces reseau non justifie

---

## Integrations IDE

### VS Code

- Extension officielle "Claude Code"
- **Inline edit** : modifier du code directement dans l'editeur
- **Diff view** : visualiser les changements proposes
- **Session picker** : gerer plusieurs sessions
- `$SELECTION` : passer la selection au prompt

### JetBrains

- Plugin officiel pour IntelliJ, WebStorm, PhpStorm, PyCharm
- **Tool window** dediee
- Integration avec les outils JetBrains (refactoring, tests)

---

## CI/CD

### Mode Headless en pipeline

```bash
# GitHub Actions / GitLab CI
claude -p "prompt" --output-format json
claude -p "prompt" --output-format text
```

### Review automatique de PR

```bash
claude --from-pr 123        # Analyse la PR #123
```

### Exemple GitHub Actions

```yaml
steps:
  - name: Code review
    run: |
      claude -p "Fais une revue du diff" \
        --output-format json \
        --dangerously-skip-permissions
    env:
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Variables d'environnement CI

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Cle API Anthropic |
| `CI=true` | Active le mode CI |

---

## Multi-Agent — Agent Teams

### Architecture Leader-Teammates

```
┌──────────────────────────────────┐
│          LEADER AGENT            │
│  (Coordonne, planifie, delegue)  │
└───────┬──────────┬──────────┬────┘
        |          |          |
  ┌─────┴───┐ ┌────┴────┐ ┌──┴───────┐
  │Teammate │ │Teammate │ │Teammate  │
  │  Tests  │ │ Feature │ │  Docs    │
  └─────────┘ └─────────┘ └──────────┘
```

### Outils Agent Teams

| Outil | Description |
|-------|-------------|
| `TeamCreate` | Creer une equipe |
| `SendMessage` | Message a un teammate ou broadcast |
| `TaskCreate` | Creer une tache partagee |
| `TaskUpdate` | Mettre a jour le statut |
| `TaskList` | Lister les taches |
| `TaskGet` | Details d'une tache |

### Activation

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### Workflow Agent Teams

```
1. TeamCreate("feature-X")
2. TaskCreate("Ecrire les tests", assignee: "tests-agent")
3. TaskCreate("Implementer", assignee: "feature-agent")
4. Task tool (team_name: "feature-X") → Spawner les teammates
5. SendMessage("tests-agent", "Commence par les tests")
6. Teammates travaillent → TaskUpdate(status: "done")
7. shutdown_request("tests-agent") → Cleanup
```

---

## Git Worktrees

### Commandes

```bash
# Creer un worktree
git worktree add ../feature-auth feature/auth

# Lister les worktrees
git worktree list

# Supprimer un worktree
git worktree remove ../feature-auth
```

### Pattern Writer/Reviewer

```bash
# Terminal 1 (Writer)
cd ../feature-auth && claude
> Implemente l'authentification JWT

# Terminal 2 (Reviewer)
cd ../review-auth && claude
> Revoir le code d'authentification
# Contexte frais, pas de biais d'auteur
```

### Recommandations

- 3-5 worktrees maximum
- Un worktree = une tache
- Supprimer les worktrees termines

---

## Fan-out Pattern

Lancer plusieurs sub-agents en parallele via `run_in_background` :

```
Leader → Task(Explore) : "Analyse module A"  (background)
       → Task(Explore) : "Analyse module B"  (background)
       → Task(Explore) : "Analyse module C"  (background)
       → Agreger les resultats
```

---

## TDD/BDD avec Claude Code

### Cycle Red-Green-Refactor

```
     ┌──────────────────────────────┐
     │                              │
     v                              │
┌─────────┐   ┌─────────┐   ┌──────┴───┐
│   RED   │──>│  GREEN  │──>│ REFACTOR │
│  Test   │   │  Code   │   │ Ameliorer│
│ echoue  │   │ minimal │   │  (pass)  │
└─────────┘   └─────────┘   └──────────┘
```

### Workflow TDD avec Claude

```
Etape 1 - RED :
> Ecris les tests pour un service de calcul de TVA.
> TVA standard 20%, reduite 5.5%, 0% exportations.

Etape 2 - GREEN :
> Implemente le TaxCalculatorService pour faire passer ces tests.
> Code minimal uniquement.

Etape 3 - REFACTOR :
> Refactorise en appliquant SOLID. Les tests doivent passer.
```

### Types de tests

| Type | Usage | Proportion |
|------|-------|-----------|
| **Unitaires** | Logique metier isolee | 70% |
| **Integration** | Connexions entre composants | 20% |
| **E2E** | Parcours utilisateur complet | 10% |

### Couverture cible

| Metrique | Objectif | Minimum |
|----------|----------|---------|
| Lignes | > 85% | > 80% |
| Branches | > 80% | > 75% |

---

## Securite — OWASP Top 10

| # | Risque | Protection |
|---|--------|-----------|
| 1 | Broken Access Control | Verifier permissions a chaque requete |
| 2 | Cryptographic Failures | TLS 1.3, bcrypt/Argon2, vault |
| 3 | Injection | Requetes parametrees, validation |
| 4 | Insecure Design | Threat modeling, rate limiting |
| 5 | Security Misconfiguration | Hardening, messages generiques en prod |
| 6 | Vulnerable Components | Audit dependances, Dependabot |
| 7 | Authentication Failures | MFA, expiration sessions, rate limiting |
| 8 | Data Integrity Failures | Signatures, checksums |
| 9 | Logging Failures | Logger evenements securite, alerting |
| 10 | SSRF | Whitelist destinations, validation URLs |

### Checklist securite

- [ ] Validation des entrees cote serveur
- [ ] Requetes parametrees (pas de concatenation SQL)
- [ ] Escape des outputs (prevention XSS)
- [ ] Mots de passe hashes (bcrypt/Argon2)
- [ ] Sessions securisees (httpOnly, secure, sameSite)
- [ ] Secrets dans variables d'environnement
- [ ] HTTPS active (TLS 1.3)
- [ ] Headers de securite configures
- [ ] Rate limiting active

---

## Audit Code avec Claude

```bash
# Audit architecture
> Analyse la qualite du code et identifie :
> - Complexite cyclomatique elevee
> - Methodes de plus de 20 lignes
> - Duplications de code
> - Violations SOLID

# Audit securite
> Cherche les vulnerabilites OWASP Top 10 :
> - Injections SQL
> - Secrets en dur
> - XSS, CSRF
```

---

## Git Workflow — Conventional Commits

### Format

```
<type>(<scope>): <description>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | Nouvelle fonctionnalite |
| `fix` | Correction de bug |
| `docs` | Documentation |
| `style` | Formatage |
| `refactor` | Refactoring |
| `perf` | Performance |
| `test` | Tests |
| `build` | Build, deps |
| `ci` | CI/CD |
| `chore` | Maintenance |

### Exemples

```bash
feat(auth): add JWT token generation
fix(cart): correct discount calculation
test(user): add email validation tests
```

---

## Gestion des couts

### Pricing par modele

| Modele | Input | Output | Fast Mode |
|--------|-------|--------|-----------|
| Haiku 4.5 | $1/M | $5/M | - |
| Sonnet 4.6 | $3/M | $15/M | - |
| Opus 4.8 | $5/M | $25/M | - (Fast Mode non disponible) |
| Opus 4.6 | $5/M | $25/M | $30/$150/M (via `/fast`) |

### Commandes de suivi

```bash
/cost      # Cout de la session
/status    # Etat complet (modele + tokens + cout)
```

### Strategies d'optimisation

| Strategie | Economie |
|-----------|---------|
| Haiku pour taches simples | Jusqu'a 5x |
| `/clear` entre taches | Reduit le contexte facture |
| Sub-agents pour investigations | Contexte principal propre |
| Prompts precis | Moins d'iterations |
| Eviter Fast Mode | 6x moins cher |

---

**Formation Claude Code** | The Bearded Bear | Fevrier 2026
