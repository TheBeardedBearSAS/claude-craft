# Claude Code Status Line

Affiche une status line personnalisée dans Claude Code avec des informations contextuelles.

## Aperçu

```
🔑 pro | 🧠 Opus | 🌿 main +2~1 | 📁 mon-projet | 📊 45% | 💰 $0.42 | 🕐 14:32
```

### Éléments affichés

| Emoji | Info | Description |
|-------|------|-------------|
| 🔑 | Profil | Compte Claude actif (via `CLAUDE_CONFIG_DIR`) |
| 🧠/🎵/🍃 | Modèle | Opus/Sonnet/Haiku |
| 🌿 | Git | Branche + status (+staged ~modified ?untracked) |
| 📁 | Projet | Nom du répertoire projet |
| 📊 | Contexte | % utilisé (vert < 60%, jaune < 80%, rouge ≥ 80%) |
| 💰 | Coût | Coût session en USD |
| 🕐 | Heure | Heure actuelle |

## Installation

### 1. Copier le script

```bash
mkdir -p ~/.claude
cp statusline.sh ~/.claude/statusline.sh
chmod +x ~/.claude/statusline.sh
```

### 2. Configurer Claude Code

Fusionne avec ton `~/.claude/settings.json` existant :

```json
{
  "statusLine": {
    "enabled": true,
    "script": "~/.claude/statusline.sh"
  }
}
```

### 3. Installer les dépendances

```bash
# jq est requis pour parser le JSON
# macOS
brew install jq

# Linux (Debian/Ubuntu)
sudo apt install jq

# ccusage (optionnel, pour tracking avancé des coûts)
npm install -g ccusage
```

### 4. Configurer les profils multiples (optionnel)

Voir `Tools/MultiAccount/` pour gérer plusieurs comptes Claude Code.

## Personnalisation

### Modifier les seuils d'alerte

Édite `~/.claude/statusline.sh` :

```bash
CONTEXT_WARN_THRESHOLD=60   # Jaune à partir de 60%
CONTEXT_CRIT_THRESHOLD=80   # Rouge à partir de 80%
```

### Ajouter/retirer des éléments

Commente ou décommente les sections dans la partie "CONSTRUCTION DE LA STATUS LINE" du script.

### Changer les emojis

Modifie la fonction `get_model_emoji()` ou les lignes d'output.

## Troubleshooting

### La status line ne s'affiche pas

1. Vérifie que le script est exécutable : `ls -la ~/.claude/statusline.sh`
2. Teste manuellement : `echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh`
3. Vérifie les logs Claude Code

### Le coût affiche toujours $0.00

- Installe ccusage : `npm install -g ccusage`
- Le coût peut mettre quelques secondes à se mettre à jour

### Le contexte % semble incorrect

L'estimation est basée sur la taille du fichier transcript (~800KB = 100%).
Ajuste `max_size` dans la fonction `get_context_percent()` si nécessaire.

## Commandes utiles

```bash
# Voir l'usage du jour avec ccusage
npx ccusage daily

# Monitoring live
npx ccusage blocks --live

# Usage par projet
npx ccusage daily --instances
```
