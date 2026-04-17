# Exercice 6 : Configuration MCP et CI/CD

**Module :** 6 - MCP et Integrations
**Duree :** 15 minutes
**Niveau :** Intermediaire / Avance

---

## Objectifs

A la fin de cet exercice, vous serez capable de :

- Configurer un serveur MCP (SQLite) dans Claude Code
- Interroger une base de donnees via MCP
- Creer un workflow GitHub Actions pour la review automatisee de PRs

---

## Prerequis

- [ ] Claude Code installe et fonctionnel
- [ ] Node.js installe (pour npx)
- [ ] Un projet avec la structure `.claude/` (exercice 2)
- [ ] Modules 1 a 5 completes

---

## Partie 1 : Serveur MCP SQLite (5 min)

### Instructions

1. Creez une base de donnees SQLite de test :

```bash
# Creer un dossier data
mkdir -p data

# Creer une base de test avec quelques donnees
sqlite3 data/app.db <<'EOF'
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, role) VALUES
  ('Alice Dupont', 'alice@example.com', 'admin'),
  ('Bob Martin', 'bob@example.com', 'user'),
  ('Charlie Durand', 'charlie@example.com', 'user'),
  ('Diana Petit', 'diana@example.com', 'manager');

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  assignee_id INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tasks (title, status, assignee_id) VALUES
  ('Setup CI/CD', 'done', 1),
  ('Write tests', 'pending', 2),
  ('Fix login bug', 'pending', 3),
  ('Update docs', 'pending', 1);
EOF
```

2. Ajoutez la configuration MCP dans `.claude/settings.json` :

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-sqlite", "data/app.db"]
    }
  }
}
```

3. Testez dans Claude Code :

```bash
claude

# Verifier la connexion MCP
/mcp

# Interroger la base
> Montre-moi le schema de la base de donnees

> Combien d'utilisateurs sont enregistres ?

> Quelles taches sont en statut "pending" et a qui sont-elles assignees ?

> Optimise la structure de la base si necessaire
```

### Resultat attendu

- `/mcp` montre le serveur SQLite comme actif
- Claude peut lire le schema et les donnees
- Claude peut repondre a des questions en langage naturel sur les donnees

---

## Partie 2 : Workflow GitHub Actions (10 min)

### Instructions

1. Creez la structure GitHub Actions :

```bash
mkdir -p .github/workflows
```

2. Demandez a Claude de generer le workflow :

```bash
claude

> Cree un workflow GitHub Actions pour la review automatisee de PRs.
>
> Le fichier doit etre .github/workflows/claude-review.yml
>
> Specifications :
> - Se declenche sur pull_request (opened, synchronize, ready_for_review)
> - Ignore les PRs en brouillon (draft)
> - Installe Claude Code
> - Execute une review avec --from-pr en verifiant :
>   - Architecture et separation des couches
>   - Securite OWASP Top 10
>   - Couverture de tests
>   - Performance
> - Utilise les secrets ANTHROPIC_API_KEY et GITHUB_TOKEN
```

3. Verifiez le fichier genere :

```bash
> Verifie que le fichier .github/workflows/claude-review.yml
> est syntaxiquement correct. Identifie les problemes potentiels
> (versions, cache, secrets manquants).
```

### Resultat attendu

Le workflow doit ressembler a :

```yaml
name: Claude PR Review
on:
  pull_request:
    types: [opened, synchronize, ready_for_review]
jobs:
  claude-review:
    runs-on: ubuntu-latest
    if: github.event.pull_request.draft == false
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code
      - name: Review PR
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          claude -p "Effectue une code review complete..." \
            --from-pr ${{ github.event.pull_request.number }}
```

---

## Verification

- [ ] Le serveur MCP SQLite est configure et actif (`/mcp`)
- [ ] Claude peut interroger la base de donnees en langage naturel
- [ ] Le workflow GitHub Actions est syntaxiquement correct
- [ ] Le workflow utilise `--from-pr` pour le contexte de la PR
- [ ] Les secrets sont references correctement

---

## Bonus

Si vous avez termine en avance :

1. **Ajoutez un serveur MCP GitHub** pour gerer les issues directement depuis Claude Code.

2. **Creez un hook de securite MCP** qui log tous les appels MCP :
   ```json
   {
     "matcher": "mcp",
     "command": "echo \"$(date): MCP call $TOOL_NAME\" >> .claude/mcp-audit.log"
   }
   ```

3. **Testez `--from-pr`** sur un vrai repository en creant une PR de test.
