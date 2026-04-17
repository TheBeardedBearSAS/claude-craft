# Exercice 2 : Configurer un CLAUDE.md Optimal

**Module :** 2 - CLAUDE.md et Configuration
**Duree :** 30 minutes
**Niveau :** Debutant / Intermediaire

---

## Objectifs

A la fin de cet exercice, vous serez capable de :

- Creer la structure `.claude/` complete d'un projet
- Rediger un CLAUDE.md de projet adapte
- Configurer les permissions dans `settings.json`
- Creer un fichier `.claudeignore`
- Verifier que Claude Code charge correctement les instructions

---

## Prerequis

- [ ] Claude Code installe et fonctionnel
- [ ] Terminal ouvert
- [ ] Exercice 1 complete

---

## Etape 1 : Creer la structure (5 min)

```bash
# Creer un projet d'exercice
mkdir exercice-claude-config && cd exercice-claude-config
git init

# Creer la structure .claude
mkdir -p .claude/rules

# Creer les fichiers de base
touch CLAUDE.md
touch .claude/CLAUDE.md
touch .claude/settings.json
touch .claudeignore
```

**Resultat attendu :** L'arborescence suivante existe :

```
exercice-claude-config/
  .claude/
    CLAUDE.md
    settings.json
    rules/
  CLAUDE.md
  .claudeignore
```

---

## Etape 2 : Rediger le CLAUDE.md projet (10 min)

Ouvrez `CLAUDE.md` et redigez les instructions pour un projet fictif (API REST en Node.js) :

```markdown
# Mon API REST

## Stack
- Node.js 22 + TypeScript 5.7
- Express.js 5
- PostgreSQL 17 + Prisma ORM
- Vitest pour les tests

## Conventions
- Architecture Clean Architecture (4 couches)
- Nommage fichiers : kebab-case
- Nommage variables : camelCase
- Tests : fichier.test.ts adjacent au fichier source

## Commandes
- `npm run dev` : Serveur de developpement
- `npm run test` : Tests unitaires
- `npm run lint` : Linting ESLint
- `npm run build` : Build production
```

**Conseil :** Restez concis. Un bon CLAUDE.md fait moins de 200 lignes.

---

## Etape 3 : Configurer les permissions (5 min)

Ouvrez `.claude/settings.json` et configurez les permissions :

```json
{
  "permissions": {
    "allow": [
      "Bash(npm*)",
      "Bash(npx*)",
      "Bash(git*)",
      "Write(src/**)",
      "Write(tests/**)"
    ],
    "deny": [
      "Bash(rm -rf*)",
      "Bash(sudo*)",
      "Write(.env*)"
    ]
  }
}
```

**Points cles :**
- `allow` : commandes auto-acceptees sans confirmation
- `deny` : commandes bloquees systematiquement
- Les wildcards (`*`, `**`) permettent le pattern matching

---

## Etape 4 : Creer le .claudeignore (5 min)

Ouvrez `.claudeignore` et ajoutez les patterns courants :

```gitignore
node_modules/
dist/
build/
*.min.*
*.map
*.lock
*.log
.env
.env.*
```

**Objectif :** Empecher Claude de lire des fichiers inutiles qui pollueraient le contexte.

---

## Etape 5 : Tester avec Claude Code (5 min)

```bash
# Lancer Claude Code dans le projet
claude

# Verifier que les instructions sont chargees
> Quel est le stack technique de ce projet ?

# Verifier les permissions
> Essaie de lire le fichier .env

# Tester la comprehension du contexte
> Quelle architecture dois-tu suivre pour ce projet ?
```

**Resultat attendu :**
- Claude cite le stack du CLAUDE.md (Node.js, TypeScript, Express, etc.)
- Claude respecte les conventions definies
- Claude ne peut pas acceder aux fichiers dans `.claudeignore`

---

## Verification

- [ ] La structure `.claude/` est creee avec tous les fichiers
- [ ] Le CLAUDE.md contient les instructions du projet
- [ ] Les permissions sont configurees dans `settings.json`
- [ ] Le `.claudeignore` exclut les fichiers inutiles
- [ ] Claude Code charge et respecte les instructions

---

## Bonus

Si vous avez termine en avance :

1. **Creez une regle modulaire** dans `.claude/rules/01-api-conventions.md` avec les conventions specifiques pour les endpoints REST.

2. **Ajoutez un CLAUDE.local.md** (non commite) avec vos preferences personnelles :
   ```markdown
   # Preferences personnelles
   - Reponds toujours en francais
   - Utilise des exemples concrets dans tes explications
   ```

3. **Testez les references `@`** :
   ```bash
   > Analyse le fichier @CLAUDE.md et dis-moi si quelque chose manque
   ```
