# Prerrequisitos

Guía completa de todas las dependencias requeridas para Claude Craft.

---

## Dependencias Obligatorias

### 1. Node.js (20+)

Requerido para instalación NPX y herramientas CLI.

| SO | Comando de Instalación |
|----|------------------------|
| **macOS** | `brew install node` |
| **Ubuntu/Debian** | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| **Windows WSL** | Igual que Ubuntu |
| **Arch Linux** | `sudo pacman -S nodejs npm` |

**Verificar:**
```bash
node --version   # Debe ser v18.x o superior
npm --version    # Debe ser v9.x o superior
```

---

### 2. Shell Bash

Requerido para scripts de instalación.

| SO | Estado |
|----|--------|
| **macOS** | Preinstalado |
| **Linux** | Preinstalado |
| **Windows** | Usar WSL o Git Bash |

---

### 3. yq - Procesador YAML

Requerido para configuración YAML.

| SO | Comando de Instalación |
|----|------------------------|
| **macOS** | `brew install yq` |
| **Ubuntu/Debian** | `sudo apt install yq` |
| **Windows WSL** | `sudo apt install yq` |

**Verificar:**
```bash
yq --version   # Debe ser v4.x o superior (versión de Mike Farah)
```

---

### 4. Git

Requerido para control de versiones.

| SO | Comando de Instalación |
|----|------------------------|
| **macOS** | `xcode-select --install` |
| **Ubuntu/Debian** | `sudo apt install git` |

---

## Dependencias Recomendadas

### 5. Docker

Muy recomendado para ejecutar comandos en entornos aislados.

| SO | Instalación |
|----|-------------|
| **macOS** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Ubuntu/Debian** | `curl -fsSL https://get.docker.com \| sudo sh` |

---

### 6. jq - Procesador JSON

Requerido para StatusLine y funciones avanzadas.

| SO | Comando de Instalación |
|----|------------------------|
| **macOS** | `brew install jq` |
| **Ubuntu/Debian** | `sudo apt install jq` |

---

## Script de Verificación Automática

```bash
./Dev/scripts/check-prerequisites.sh --fix
```

---

## Resumen de Versiones Requeridas

| Herramienta | Versión Mínima |
|-------------|----------------|
| Node.js | 20.0 |
| npm | 9.0 |
| yq | 4.0 |
| Git | 2.0 |
| Docker | 20.0 |
| Claude Code | 2.1.38+ |

---

## Siguientes Pasos

Una vez instalados todos los prerrequisitos:

1. Sigue la [Guía de Inicio Rápido](QUICKSTART.md)
2. O ve directamente a la [Guía de Instalación](../INSTALLATION.md)
