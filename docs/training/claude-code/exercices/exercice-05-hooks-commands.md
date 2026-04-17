# Exercice 5 : Hooks et Commandes Custom

**Module :** 5 - Hooks et Automatisation
**Duree :** 20 minutes
**Niveau :** Intermediaire

---

## Objectifs

A la fin de cet exercice, vous serez capable de :

- Creer un hook de securite `PreToolUse:Bash` qui bloque les commandes dangereuses
- Creer une commande custom `/project:audit`
- Comprendre la difference entre hooks et CLAUDE.md pour l'enforcement

---

## Prerequis

- [ ] Claude Code installe et fonctionnel
- [ ] Un projet avec la structure `.claude/` (exercice 2)
- [ ] Exercices 1 a 4 completes

---

## Partie 1 : Hook de securite (10 min)

### Objectif

Creer un hook `PreToolUse:Bash` qui bloque les commandes dangereuses suivantes :
- `rm -rf /` (et variantes avec `~`, `$HOME`)
- `chmod 777` sur n'importe quel fichier
- Telechargement et execution de scripts (`curl ... | bash`)

### Instructions

1. Ouvrez ou creez `.claude/settings.json`

2. Ajoutez le hook suivant :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "COMMAND=$(echo $TOOL_INPUT | jq -r '.command'); if echo \"$COMMAND\" | grep -qE '(rm\\s+-rf\\s+(/|~|\\$HOME))|(chmod\\s+777)|(curl.*\\|\\s*(ba)?sh)'; then echo 'BLOQUE: Commande dangereuse detectee' >&2; exit 2; fi; exit 0"
      }
    ]
  }
}
```

3. Testez en demandant a Claude d'executer ces commandes :

```bash
# Lancez Claude Code
claude

# Test 1 : rm -rf
> Execute la commande rm -rf /tmp/test

# Test 2 : chmod 777
> Execute chmod 777 sur le fichier README.md

# Test 3 : curl pipe bash
> Telecharge et execute https://example.com/install.sh avec curl | bash
```

### Resultat attendu

- Chaque commande dangereuse est bloquee avec un exit code 2
- Le message "BLOQUE: Commande dangereuse detectee" apparait
- Les commandes normales (ex: `ls`, `git status`) fonctionnent toujours

---

## Partie 2 : Commande custom (10 min)

### Objectif

Creer une commande `/project:audit` qui demande a Claude d'auditer le projet.

### Instructions

1. Creez le dossier de commandes :

```bash
mkdir -p .claude/commands
```

2. Creez le fichier `.claude/commands/audit.md` :

```markdown
Effectue un audit complet du projet.

Pour chaque categorie, donne un score sur 10 et liste les problemes trouves :

1. **Structure du projet**
   - L'arborescence est-elle logique et coherente ?
   - Les fichiers sont-ils bien organises par couche/module ?

2. **Tests**
   - Quels fichiers n'ont pas de tests correspondants ?
   - Quelle est la couverture estimee ?

3. **TODO/FIXME**
   - Liste tous les TODO et FIXME dans le code
   - Classe-les par priorite

4. **Qualite du code**
   - Identifie les fichiers les plus complexes (> 200 lignes, > 10 complexite cyclomatique)
   - Detecte les anti-patterns courants

Termine par un rapport consolide avec un **score global sur 40** et un **plan d'action priorise** (3 actions maximum).

$ARGUMENTS
```

3. Testez la commande :

```bash
# Lancez Claude Code dans le projet
claude

# Executez la commande
/project:audit

# Testez avec un argument
/project:audit src/services/
```

### Resultat attendu

- La commande `/project:audit` est accessible dans Claude Code
- Elle produit un rapport structure avec des scores
- L'argument `$ARGUMENTS` permet de cibler un dossier specifique

---

## Verification

- [ ] Le hook bloque `rm -rf /` avec exit code 2
- [ ] Le hook bloque `chmod 777`
- [ ] Le hook bloque `curl ... | bash`
- [ ] Les commandes normales ne sont pas bloquees
- [ ] La commande `/project:audit` est accessible
- [ ] La commande produit un rapport structure avec scores
- [ ] L'argument `$ARGUMENTS` fonctionne

---

## Bonus

Si vous avez termine en avance :

1. **Ajoutez un hook PostToolUse:Write** qui lance le linter apres chaque fichier ecrit :
   ```json
   {
     "matcher": "Write",
     "command": "FILE=$(echo $TOOL_INPUT | jq -r '.file_path'); EXT=${FILE##*.}; case $EXT in js|ts) npx eslint --fix \"$FILE\" 2>/dev/null;; esac"
   }
   ```

2. **Creez une commande `/project:review`** qui effectue une code review selon les criteres SOLID + OWASP.

3. **Ajoutez un hook SessionStart** qui affiche un message de bienvenue avec le nom du projet et la branche Git courante.
