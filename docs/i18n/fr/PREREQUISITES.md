# Prérequis

Guide complet de toutes les dépendances requises pour Claude Craft.

---

## Dépendances Obligatoires

### 1. Node.js (20+)

Requis pour l'installation NPX et les outils CLI.

| OS | Commande d'Installation |
|----|-------------------------|
| **macOS** | `brew install node` |
| **Ubuntu/Debian** | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| **Windows WSL** | Identique à Ubuntu |
| **Arch Linux** | `sudo pacman -S nodejs npm` |

**Vérification :**
```bash
node --version   # Doit être v20.x ou supérieur
npm --version    # Doit être v9.x ou supérieur
```

---

### 2. Shell Bash

Requis pour les scripts d'installation.

| OS | Statut |
|----|--------|
| **macOS** | Pré-installé |
| **Linux** | Pré-installé |
| **Windows** | Utiliser WSL ou Git Bash |

**Vérification :**
```bash
bash --version
```

---

### 3. yq - Processeur YAML

Requis pour la configuration YAML et les configurations multi-projets.

| OS | Commande d'Installation |
|----|-------------------------|
| **macOS** | `brew install yq` |
| **Ubuntu/Debian** | `sudo apt install yq` ou `snap install yq` |
| **Windows WSL** | `sudo apt install yq` |
| **Arch Linux** | `sudo pacman -S yq` |
| **Docker** | `docker run --rm -v "${PWD}":/workdir mikefarah/yq` |

**Alternative - Télécharger le Binaire :**
```bash
# Linux amd64
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq

# macOS arm64
wget https://github.com/mikefarah/yq/releases/latest/download/yq_darwin_arm64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

**Vérification :**
```bash
yq --version   # Doit être v4.x ou supérieur
```

---

### 4. Git

Requis pour le contrôle de version et l'installation depuis le dépôt.

| OS | Commande d'Installation |
|----|-------------------------|
| **macOS** | `xcode-select --install` ou `brew install git` |
| **Ubuntu/Debian** | `sudo apt install git` |
| **Windows WSL** | `sudo apt install git` |
| **Arch Linux** | `sudo pacman -S git` |

**Vérification :**
```bash
git --version   # Doit être v2.x ou supérieur
```

---

## Dépendances Recommandées

### 5. Docker

Fortement recommandé pour exécuter les commandes dans des environnements isolés.

| OS | Installation |
|----|--------------|
| **macOS** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Ubuntu/Debian** | Voir [Guide d'Installation Docker](https://docs.docker.com/engine/install/ubuntu/) |
| **Windows WSL** | [Docker Desktop avec WSL2](https://docs.docker.com/desktop/wsl/) |

**Installation Rapide (Ubuntu) :**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Déconnectez-vous et reconnectez-vous
```

**Vérification :**
```bash
docker --version
docker compose version
```

---

### 6. jq - Processeur JSON

Requis pour l'outil StatusLine et certaines fonctionnalités avancées.

| OS | Commande d'Installation |
|----|-------------------------|
| **macOS** | `brew install jq` |
| **Ubuntu/Debian** | `sudo apt install jq` |
| **Windows WSL** | `sudo apt install jq` |
| **Arch Linux** | `sudo pacman -S jq` |

**Vérification :**
```bash
jq --version
```

---

### 7. Make

Requis pour l'installation via Makefile (méthode la plus courante).

| OS | Statut/Installation |
|----|---------------------|
| **macOS** | Pré-installé avec les outils Xcode : `xcode-select --install` |
| **Ubuntu/Debian** | `sudo apt install make` |
| **Windows WSL** | `sudo apt install make` |
| **Arch Linux** | `sudo pacman -S make` |

**Vérification :**
```bash
make --version
```

---

## Claude Code

Claude Craft est conçu pour fonctionner avec [Claude Code](https://claude.ai/code), le CLI officiel d'Anthropic.

> **Important :** La méthode `npm install -g` est obsolète. Utilisez les installateurs natifs ci-dessous.

**Installation (recommandée) :**
```bash
# macOS / Linux
curl https://install.claude.com | bash

# Windows (PowerShell)
irm https://install.claude.com/windows | iex
```

**Méthodes alternatives :**
```bash
# macOS (Homebrew)
brew install claude-code

# Windows (winget)
winget install Anthropic.ClaudeCode
```

**Première configuration :**
```bash
claude login
```

---

## Vérification Automatique des Prérequis

Exécutez ce script pour vérifier tous les prérequis :

```bash
#!/bin/bash
# Enregistrez sous check-prerequisites.sh et exécutez : bash check-prerequisites.sh

echo "Vérification des prérequis Claude Craft..."
echo ""

check() {
    if command -v "$1" &> /dev/null; then
        echo "  [OK] $1: $($1 --version 2>&1 | head -n1)"
        return 0
    else
        echo "  [MANQUANT] $1 - $2"
        return 1
    fi
}

ERRORS=0

echo "Obligatoires :"
check "node" "Installer : brew install node (macOS) ou apt install nodejs (Linux)" || ((ERRORS++))
check "npm" "Fourni avec Node.js" || ((ERRORS++))
check "bash" "Pré-installé sur la plupart des systèmes" || ((ERRORS++))
check "yq" "Installer : brew install yq (macOS) ou apt install yq (Linux)" || ((ERRORS++))
check "git" "Installer : brew install git (macOS) ou apt install git (Linux)" || ((ERRORS++))

echo ""
echo "Recommandés :"
check "docker" "Installer Docker Desktop depuis docker.com" || true
check "jq" "Installer : brew install jq (macOS) ou apt install jq (Linux)" || true
check "make" "Installer : xcode-select --install (macOS) ou apt install make (Linux)" || true

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "Tous les prérequis obligatoires sont installés !"
else
    echo "Il manque $ERRORS prérequis obligatoire(s). Veuillez les installer avant de continuer."
    exit 1
fi
```

---

## Résumé des Versions Requises

| Outil | Version Minimum | Recommandée |
|-------|-----------------|-------------|
| Node.js | 20.0 | 20.x LTS |
| npm | 9.0 | 10.x |
| yq | 4.0 | 4.40+ |
| Git | 2.0 | 2.40+ |
| Docker | 20.0 | 24.x |
| Docker Compose | 2.0 | 2.24+ |
| jq | 1.5 | 1.7+ |
| Make | 3.0 | 4.x |
| Claude Code | 2.1.97 (CVE-2025-59536 patché) | 2.1.159 |

---

## Support des Systèmes d'Exploitation

| OS | Niveau de Support | Notes |
|----|-------------------|-------|
| **macOS 12+** | Complet | Recommandé pour le développement |
| **Ubuntu 22.04+** | Complet | Cible Linux principale |
| **Debian 12+** | Complet | |
| **Windows 11 + WSL2** | Complet | Utiliser Ubuntu dans WSL |
| **Arch Linux** | Complet | Testé par la communauté |
| **Windows (natif)** | Partiel | Certaines fonctionnalités nécessitent WSL |
| **Autres Linux** | Devrait fonctionner | Non testé officiellement |

---

## Dépannage

### yq: command not found

Le problème le plus courant. Assurez-vous d'installer la bonne version de `yq` (celle de Mike Farah) :

```bash
# Vérifier si vous avez la mauvaise version de yq
which yq

# Si ça pointe vers /usr/bin/yq, vous avez peut-être la version Python
# Installez la bonne version :
sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
sudo chmod +x /usr/local/bin/yq
```

### Permission denied sur les scripts

```bash
# Rendre les scripts exécutables
chmod +x Dev/scripts/*.sh

# Ou utiliser make
make fix-permissions
```

### Docker permission denied

```bash
# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Déconnectez-vous et reconnectez-vous, ou exécutez :
newgrp docker
```

### Version de Node.js trop ancienne

```bash
# Utiliser nvm pour gérer les versions de Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

---

## Étapes Suivantes

Une fois tous les prérequis installés :

1. Suivez le [Guide de Démarrage Rapide](QUICKSTART.md)
2. Ou allez directement au [Guide d'Installation](../INSTALLATION.md)
