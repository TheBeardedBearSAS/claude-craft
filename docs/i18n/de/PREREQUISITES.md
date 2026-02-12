# Voraussetzungen

Vollständige Anleitung zu allen erforderlichen Abhängigkeiten für Claude Craft.

---

## Erforderliche Abhängigkeiten

### 1. Node.js (20+)

Erforderlich für NPX-Installation und CLI-Tools.

| OS | Installationsbefehl |
|----|---------------------|
| **macOS** | `brew install node` |
| **Ubuntu/Debian** | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| **Windows WSL** | Wie Ubuntu |
| **Arch Linux** | `sudo pacman -S nodejs npm` |

**Überprüfen:**
```bash
node --version   # Sollte v18.x oder höher sein
npm --version    # Sollte v9.x oder höher sein
```

---

### 2. Bash-Shell

Erforderlich für Installationsskripte.

| OS | Status |
|----|--------|
| **macOS** | Vorinstalliert |
| **Linux** | Vorinstalliert |
| **Windows** | WSL oder Git Bash verwenden |

---

### 3. yq - YAML-Prozessor

Erforderlich für YAML-Konfiguration.

| OS | Installationsbefehl |
|----|---------------------|
| **macOS** | `brew install yq` |
| **Ubuntu/Debian** | `sudo apt install yq` |
| **Windows WSL** | `sudo apt install yq` |

**Überprüfen:**
```bash
yq --version   # Sollte v4.x oder höher sein (Mike Farah's Version)
```

---

### 4. Git

Erforderlich für Versionskontrolle.

| OS | Installationsbefehl |
|----|---------------------|
| **macOS** | `xcode-select --install` |
| **Ubuntu/Debian** | `sudo apt install git` |

---

## Empfohlene Abhängigkeiten

### 5. Docker

Sehr empfohlen für die Ausführung von Befehlen in isolierten Umgebungen.

| OS | Installation |
|----|--------------|
| **macOS** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Ubuntu/Debian** | `curl -fsSL https://get.docker.com \| sudo sh` |

---

### 6. jq - JSON-Prozessor

Erforderlich für StatusLine und erweiterte Funktionen.

| OS | Installationsbefehl |
|----|---------------------|
| **macOS** | `brew install jq` |
| **Ubuntu/Debian** | `sudo apt install jq` |

---

## Automatisches Prüfskript

```bash
./Dev/scripts/check-prerequisites.sh --fix
```

---

## Zusammenfassung der erforderlichen Versionen

| Tool | Mindestversion |
|------|----------------|
| Node.js | 20.0 |
| npm | 9.0 |
| yq | 4.0 |
| Git | 2.0 |
| Docker | 20.0 |
| Claude Code | 2.1.38+ |

---

## Nächste Schritte

Sobald alle Voraussetzungen installiert sind:

1. Folgen Sie dem [Schnellstart-Guide](QUICKSTART.md)
2. Oder gehen Sie direkt zum [Installations-Guide](../INSTALLATION.md)
