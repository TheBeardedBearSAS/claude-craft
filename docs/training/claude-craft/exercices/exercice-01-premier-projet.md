# Exercice 1 : Premier Projet avec Claude Code

## Objectif

Installer Claude Code, le configurer et réaliser une première interaction.

## Durée estimée

10 minutes

---

## Prérequis

- Node.js 20+ installé
- Compte Anthropic avec clé API

---

## Étapes

### Étape 1 : Installation

```bash
# Installer Claude Code globalement
npm install -g @anthropic-ai/claude-code

# Vérifier l'installation
claude --version
# Devrait afficher la version (ex: claude-code v2.1.105)
```

**Validation :** [OK] La version s'affiche correctement

---

### Étape 2 : Configuration de la clé API

```bash
# Configurer la clé API
claude config set api_key sk-ant-votre-cle-api

# OU via variable d'environnement
export ANTHROPIC_API_KEY="sk-ant-votre-cle-api"

# Vérifier la configuration
claude config get api_key
# Devrait afficher : sk-ant-****** (masqué)
```

**Validation :** [OK] La clé est configurée

---

### Étape 3 : Créer un projet de test

```bash
# Créer un répertoire
mkdir ~/exercice-claude
cd ~/exercice-claude

# Initialiser un fichier PHP simple
cat > hello.php << 'EOF'
<?php
echo "Hello World";
EOF
```

---

### Étape 4 : Première session Claude

```bash
# Lancer Claude dans le répertoire
claude

# Vous êtes maintenant dans une session interactive
```

---

### Étape 5 : Commandes de base

Dans la session Claude, testez :

```
# 1. Demander de l'aide
/help

# 2. Voir le modèle actif
/model

# 3. Changer de modèle (optionnel)
/model sonnet

# 4. Ajouter le fichier au contexte
/add hello.php
```

---

### Étape 6 : Première génération

Demandez à Claude :

```
"Modifie hello.php pour qu'il :
1. Accepte un argument nom en ligne de commande
2. Affiche 'Hello [nom]!'
3. Affiche 'Hello World!' si pas d'argument"
```

**Attendu :** Claude devrait générer quelque chose comme :

```php
<?php
$name = $argv[1] ?? 'World';
echo "Hello {$name}!";
```

---

### Étape 7 : Tester le résultat

```bash
# Quitter Claude
/exit

# Tester le script modifié
php hello.php
# Output: Hello World!

php hello.php Claude
# Output: Hello Claude!
```

---

### Étape 8 : Afficher le coût

Relancez Claude et vérifiez le coût :

```bash
claude
/cost
# Affiche le nombre de tokens utilisés et le coût estimé
/exit
```

---

## Critères de réussite

- [ ] Claude Code installé et fonctionnel
- [ ] Clé API configurée
- [ ] Session interactive lancée
- [ ] Fichier modifié par Claude
- [ ] Script fonctionnel après modification

---

## Bonus : Explorer plus

Si vous avez terminé en avance :

1. Demandez à Claude d'ajouter une gestion d'erreur
2. Demandez de créer un test PHPUnit pour le script
3. Explorez la commande `/history`
4. Essayez `/doctor` pour diagnostiquer l'installation
5. Utilisez `/compact` pour optimiser le contexte

---

## Problèmes courants

### "Command not found: claude"

```bash
# Vérifier le PATH
npm list -g @anthropic-ai/claude-code

# Réinstaller si nécessaire
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code
```

### "Invalid API key"

```bash
# Vérifier que la clé est correcte
# Elle doit commencer par sk-ant-
claude config get api_key

# Reconfigurer si nécessaire
claude config set api_key sk-ant-votre-vraie-cle
```

### "Rate limit exceeded"

Attendez quelques secondes et réessayez. Les quotas sont limités par minute.

---

## Points clés appris

1. Installation via `npm install -g`
2. Configuration via `claude config` ou variable d'environnement
3. Session interactive avec `claude`
4. Commandes de base : `/help`, `/model`, `/add`, `/exit`, `/cost`
5. Claude modifie les fichiers à votre demande

---

**Prochain exercice :** Installation de Claude-Craft
