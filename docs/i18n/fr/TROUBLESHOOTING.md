# Guide de Dépannage

Solutions aux problèmes courants avec Claude Craft.

---

## Problèmes d'Installation

### "yq: command not found"

**Problème :** Les scripts d'installation nécessitent yq mais il n'est pas installé ou c'est la mauvaise version.

**Solution :**
```bash
# Vérifier la version actuelle (si installée)
which yq
yq --version

# Installer la bonne version (yq v4 de Mike Farah)
# macOS
brew install yq

# Ubuntu/Debian
sudo apt install yq

# Ou télécharger le binaire directement
sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
sudo chmod +x /usr/local/bin/yq
```

**Note :** Il existe plusieurs outils nommés "yq". Claude Craft nécessite la version de Mike Farah (v4+), pas la version Python.

---

### "Permission denied" lors de l'exécution des scripts

**Problème :** Les scripts d'installation ne sont pas exécutables.

**Solution :**
```bash
# Rendre tous les scripts exécutables
chmod +x Dev/scripts/*.sh

# Ou utiliser make
make fix-permissions

# Ou exécuter avec bash directement
bash Dev/scripts/install-symfony-rules.sh --lang=fr ~/mon-projet
```

---

### "Target directory does not exist"

**Problème :** Le répertoire cible du projet n'existe pas.

**Solution :**
```bash
# Créer d'abord le répertoire
mkdir -p ~/mon-projet

# Puis lancer l'installation
make install-symfony TARGET=~/mon-projet
```

---

### L'installation se termine mais des fichiers manquent

**Problème :** Certains fichiers n'ont pas été copiés lors de l'installation.

**Diagnostic :**
```bash
# Vérifier ce qui a été installé
ls -la ~/mon-projet/.claude/

# Compter les fichiers
find ~/mon-projet/.claude -name "*.md" | wc -l
```

**Solution :**
```bash
# Forcer la réinstallation
make install-symfony TARGET=~/mon-projet OPTIONS="--force"

# Ou exécuter avec sortie détaillée
./Dev/scripts/install-symfony-rules.sh --verbose ~/mon-projet
```

---

## Problèmes Claude Code

### Les commandes n'apparaissent pas

**Problème :** Les commandes slash n'apparaissent pas dans Claude Code.

**Diagnostic :**
```bash
# Vérifier que le répertoire des commandes existe
ls -la ~/mon-projet/.claude/commands/

# Vérifier le format du fichier
head -20 ~/mon-projet/.claude/commands/common/pre-commit-check.md
```

**Solutions :**

1. **Redémarrer la session Claude Code**
   ```bash
   exit
   claude
   ```

2. **Vérifier que le frontmatter YAML est valide**
   ```yaml
   ---
   description: Brève description
   argument-hint: <arg1> [arg2]
   ---
   ```

3. **Vérifier l'extension du fichier** (doit être `.md`)

---

### Les agents ne répondent pas

**Problème :** Les mentions @agent ne déclenchent pas le comportement de l'agent.

**Solutions :**

1. **Utiliser le nom exact de l'agent**
   ```
   # Correct
   @api-designer Aide-moi à concevoir...

   # Incorrect
   @API-Designer Aide-moi à concevoir...
   ```

2. **Vérifier le format du frontmatter**
   ```yaml
   ---
   name: api-designer
   description: Expert en conception d'API REST/GraphQL
   ---
   ```

---

## Problèmes Docker

### Docker permission denied

**Problème :** Impossible d'exécuter des commandes Docker sans sudo.

**Solution :**
```bash
# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Se déconnecter et se reconnecter, ou
newgrp docker

# Vérifier
docker run hello-world
```

---

### Le conteneur ne démarre pas

**Problème :** Les conteneurs Docker ne démarrent pas.

**Diagnostic :**
```bash
# Vérifier les logs du conteneur
docker compose logs

# Vérifier le statut des conteneurs
docker compose ps

# Vérifier les conflits de ports
sudo lsof -i :8080
```

**Solutions :**

1. **Arrêter les services conflictuels**
   ```bash
   sudo kill $(sudo lsof -t -i:8080)
   ```

2. **Reconstruire les conteneurs**
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

---

## Problèmes BMAD

### "No sprint-status.yaml found"

**Problème :** Les commandes BMAD échouent car sprint-status.yaml n'existe pas.

**Solution :**
```bash
# Initialiser BMAD
/bmad:init

# Ou créer manuellement
mkdir -p .bmad
cat > .bmad/sprint-status.yaml << 'EOF'
version: 2
current_sprint: 1
sprints:
  - number: 1
    goal: "Sprint initial"
    stories: []
EOF
```

---

### Le quality gate échoue toujours

**Problème :** Les quality gates échouent même quand les critères semblent remplis.

**Diagnostic :**
```
/gate:report
```

**Causes courantes :**

1. **Champs requis manquants**
   - PRD doit avoir : problem, users, goals, metrics, scope
   - Story doit avoir : AC, estimate, tasks

2. **Problèmes de format**
   - Erreurs de syntaxe YAML dans les fichiers story
   - Frontmatter manquant

3. **Seuil non atteint**
   - PRD Gate : ≥80%
   - Tech Spec Gate : ≥90%
   - Story DoD : 100%

---

## Problèmes Ralph Wiggum

### Boucle infinie

**Problème :** Ralph continue de tourner sans terminer.

**Solution :**
```bash
# Ralph a un circuit breaker intégré
# Par défaut : 10 itérations max

# Vérifier ralph.yml pour les limites
cat ralph.yml

# Ajuster les limites
max_iterations: 5
circuit_breaker:
  enabled: true
  threshold: 3
```

---

### Les validateurs DoD échouent toujours

**Problème :** Les validateurs Definition of Done ne passent pas.

**Diagnostic :**
```bash
# Vérifier la configuration DoD
cat ralph.yml

# Exécuter les validateurs manuellement
npm test
npm run lint
```

---

## Problèmes de Configuration

### Erreurs de syntaxe YAML

**Problème :** Les fichiers de configuration ont un YAML invalide.

**Diagnostic :**
```bash
# Valider le YAML
yq eval '.' claude-projects.yaml
```

**Problèmes courants :**

1. **Erreurs d'indentation**
   ```yaml
   # Mauvais
   projects:
   - name: "test"

   # Correct
   projects:
     - name: "test"
   ```

2. **Caractères spéciaux non échappés**
   ```yaml
   # Mauvais
   description: Ceci est un test: valeur

   # Correct
   description: "Ceci est un test: valeur"
   ```

---

## Obtenir Plus d'Aide

### Mode Debug

Activer la sortie détaillée :
```bash
./Dev/scripts/install-symfony-rules.sh --verbose ~/projet
```

### Vérifier les Logs

```bash
# Logs Claude Code
cat ~/.claude/logs/claude-code.log

# Logs Docker
docker compose logs -f
```

### Signaler un Problème

Si vous ne trouvez pas de solution :

1. Cherchez dans les issues existantes : https://github.com/TheBeardedBearSAS/claude-craft/issues
2. Créez une nouvelle issue avec :
   - Version de Claude Craft
   - OS et version
   - Étapes pour reproduire
   - Messages d'erreur
   - Comportement attendu vs réel
