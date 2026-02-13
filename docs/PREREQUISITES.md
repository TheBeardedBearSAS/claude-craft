# Prerequisites

Complete guide to all dependencies required for Claude Craft.

---

## Required Dependencies

### 1. Node.js (20+)

Required for NPX installation and CLI tools.

| OS | Installation Command |
|----|----------------------|
| **macOS** | `brew install node` |
| **Ubuntu/Debian** | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
| **Windows WSL** | Same as Ubuntu |
| **Arch Linux** | `sudo pacman -S nodejs npm` |

**Verify:**
```bash
node --version   # Should be v18.x or higher
npm --version    # Should be v9.x or higher
```

---

### 2. Bash Shell

Required for installation scripts.

| OS | Status |
|----|--------|
| **macOS** | Pre-installed |
| **Linux** | Pre-installed |
| **Windows** | Use WSL or Git Bash |

**Verify:**
```bash
bash --version
```

---

### 3. yq - YAML Processor

Required for YAML configuration and multi-project setups.

| OS | Installation Command |
|----|----------------------|
| **macOS** | `brew install yq` |
| **Ubuntu/Debian** | `sudo apt install yq` or `snap install yq` |
| **Windows WSL** | `sudo apt install yq` |
| **Arch Linux** | `sudo pacman -S yq` |
| **Docker** | `docker run --rm -v "${PWD}":/workdir mikefarah/yq` |

**Alternative - Download Binary:**
```bash
# Linux amd64
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq

# macOS arm64
wget https://github.com/mikefarah/yq/releases/latest/download/yq_darwin_arm64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

**Verify:**
```bash
yq --version   # Should be v4.x or higher
```

---

### 4. Git

Required for version control and installation from repository.

| OS | Installation Command |
|----|----------------------|
| **macOS** | `xcode-select --install` or `brew install git` |
| **Ubuntu/Debian** | `sudo apt install git` |
| **Windows WSL** | `sudo apt install git` |
| **Arch Linux** | `sudo pacman -S git` |

**Verify:**
```bash
git --version   # Should be v2.x or higher
```

---

## Recommended Dependencies

### 5. Docker

Strongly recommended for running commands in isolated environments.

| OS | Installation |
|----|--------------|
| **macOS** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Ubuntu/Debian** | See [Docker Install Guide](https://docs.docker.com/engine/install/ubuntu/) |
| **Windows WSL** | [Docker Desktop with WSL2](https://docs.docker.com/desktop/wsl/) |

**Quick Install (Ubuntu):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# Log out and back in
```

**Verify:**
```bash
docker --version
docker compose version
```

---

### 6. jq - JSON Processor

Required for StatusLine tool and some advanced features.

| OS | Installation Command |
|----|----------------------|
| **macOS** | `brew install jq` |
| **Ubuntu/Debian** | `sudo apt install jq` |
| **Windows WSL** | `sudo apt install jq` |
| **Arch Linux** | `sudo pacman -S jq` |

**Verify:**
```bash
jq --version
```

---

### 7. Make

Required for Makefile-based installation (most common method).

| OS | Status/Installation |
|----|---------------------|
| **macOS** | Pre-installed with Xcode tools: `xcode-select --install` |
| **Ubuntu/Debian** | `sudo apt install make` |
| **Windows WSL** | `sudo apt install make` |
| **Arch Linux** | `sudo pacman -S make` |

**Verify:**
```bash
make --version
```

---

## Claude Code

Claude Craft is designed to work with [Claude Code](https://claude.ai/code), Anthropic's official CLI.

**Installation:**
```bash
# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Or use npx
npx @anthropic-ai/claude-code
```

**First-time setup:**
```bash
# Authenticate with your Anthropic account
claude login
```

---

## Automatic Prerequisites Check

Run this script to verify all prerequisites:

```bash
#!/bin/bash
# Save as check-prerequisites.sh and run: bash check-prerequisites.sh

echo "Checking Claude Craft prerequisites..."
echo ""

check() {
    if command -v "$1" &> /dev/null; then
        echo "  [OK] $1: $($1 --version 2>&1 | head -n1)"
        return 0
    else
        echo "  [MISSING] $1 - $2"
        return 1
    fi
}

ERRORS=0

echo "Required:"
check "node" "Install: brew install node (macOS) or apt install nodejs (Linux)" || ((ERRORS++))
check "npm" "Comes with Node.js" || ((ERRORS++))
check "bash" "Pre-installed on most systems" || ((ERRORS++))
check "yq" "Install: brew install yq (macOS) or apt install yq (Linux)" || ((ERRORS++))
check "git" "Install: brew install git (macOS) or apt install git (Linux)" || ((ERRORS++))

echo ""
echo "Recommended:"
check "docker" "Install Docker Desktop from docker.com" || true
check "jq" "Install: brew install jq (macOS) or apt install jq (Linux)" || true
check "make" "Install: xcode-select --install (macOS) or apt install make (Linux)" || true

echo ""
if [ $ERRORS -eq 0 ]; then
    echo "All required prerequisites are installed!"
else
    echo "Missing $ERRORS required prerequisite(s). Please install them before continuing."
    exit 1
fi
```

---

## Version Requirements Summary

| Tool | Minimum Version | Recommended |
|------|-----------------|-------------|
| Node.js | 20.0 | 20.x LTS |
| npm | 9.0 | 10.x |
| yq | 4.0 | 4.40+ |
| Git | 2.0 | 2.40+ |
| Docker | 20.0 | 24.x |
| Docker Compose | 2.0 | 2.24+ |
| jq | 1.5 | 1.7+ |
| Make | 3.0 | 4.x |
| Claude Code | 2.1.41 | 2.1.41+ |

---

## Operating System Support

| OS | Support Level | Notes |
|----|---------------|-------|
| **macOS 12+** | Full | Recommended for development |
| **Ubuntu 22.04+** | Full | Primary Linux target |
| **Debian 12+** | Full | |
| **Windows 11 + WSL2** | Full | Use Ubuntu in WSL |
| **Arch Linux** | Full | Community tested |
| **Windows (native)** | Partial | Some features require WSL |
| **Other Linux** | Should work | Not officially tested |

---

## Troubleshooting

### yq: command not found

The most common issue. Make sure you install the correct `yq` (Mike Farah's version):

```bash
# Check if you have the wrong yq
which yq

# If it points to /usr/bin/yq, you might have the Python version
# Install the correct one:
sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
sudo chmod +x /usr/local/bin/yq
```

### Permission denied on scripts

```bash
# Make scripts executable
chmod +x Dev/scripts/*.sh

# Or use make
make fix-permissions
```

### Docker permission denied

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

### Node.js version too old

```bash
# Use nvm to manage Node versions
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

---

## Next Steps

Once all prerequisites are installed:

1. Follow the [Quickstart Guide](QUICKSTART.md)
2. Or go directly to [Installation Guide](INSTALLATION.md)
