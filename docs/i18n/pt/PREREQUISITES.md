# Pré-requisitos

Guia completo de todas as dependências necessárias para o Claude Craft.

---

## Dependências Obrigatórias

### 1. Node.js (20+)

Necessário para instalação NPX e ferramentas CLI.

| SO | Comando de Instalação |
|----|----------------------|
| **macOS** | `brew install node` |
| **Ubuntu/Debian** | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| **Windows WSL** | Igual ao Ubuntu |
| **Arch Linux** | `sudo pacman -S nodejs npm` |

**Verificar:**
```bash
node --version   # Deve ser v18.x ou superior
npm --version    # Deve ser v9.x ou superior
```

---

### 2. Shell Bash

Necessário para scripts de instalação.

| SO | Estado |
|----|--------|
| **macOS** | Pré-instalado |
| **Linux** | Pré-instalado |
| **Windows** | Usar WSL ou Git Bash |

---

### 3. yq - Processador YAML

Necessário para configuração YAML.

| SO | Comando de Instalação |
|----|----------------------|
| **macOS** | `brew install yq` |
| **Ubuntu/Debian** | `sudo apt install yq` |
| **Windows WSL** | `sudo apt install yq` |

**Verificar:**
```bash
yq --version   # Deve ser v4.x ou superior (versão do Mike Farah)
```

---

### 4. Git

Necessário para controle de versão.

| SO | Comando de Instalação |
|----|----------------------|
| **macOS** | `xcode-select --install` |
| **Ubuntu/Debian** | `sudo apt install git` |

---

## Dependências Recomendadas

### 5. Docker

Altamente recomendado para executar comandos em ambientes isolados.

| SO | Instalação |
|----|------------|
| **macOS** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Ubuntu/Debian** | `curl -fsSL https://get.docker.com \| sudo sh` |

---

### 6. jq - Processador JSON

Necessário para StatusLine e recursos avançados.

| SO | Comando de Instalação |
|----|----------------------|
| **macOS** | `brew install jq` |
| **Ubuntu/Debian** | `sudo apt install jq` |

---

## Script de Verificação Automática

```bash
./Dev/scripts/check-prerequisites.sh --fix
```

---

## Resumo das Versões Necessárias

| Ferramenta | Versão Mínima |
|------------|---------------|
| Node.js | 20.0 |
| npm | 9.0 |
| yq | 4.0 |
| Git | 2.0 |
| Docker | 20.0 |
| Claude Code | 2.1.47+ |

---

## Próximos Passos

Após instalar todos os pré-requisitos:

1. Siga o [Guia de Início Rápido](QUICKSTART.md)
2. Ou vá diretamente para o [Guia de Instalação](../INSTALLATION.md)
