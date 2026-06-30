# Configurando Claude-Craft em um Novo Projeto

Este tutorial passo a passo irá guiá-lo através da instalação do Claude-Craft em um projeto completamente novo. No final, você terá um ambiente de desenvolvimento totalmente configurado com assistência de IA.

**Tempo necessário:** ~10 minutos

---

## Índice

1. [Lista de Pré-requisitos](#1-lista-de-pré-requisitos)
2. [Criar o Diretório do Seu Projeto](#2-criar-o-diretório-do-seu-projeto)
3. [Inicializar o Repositório Git](#3-inicializar-o-repositório-git)
4. [Escolher Sua Stack Tecnológica](#4-escolher-sua-stack-tecnológica)
5. [Instalar o Claude-Craft](#5-instalar-o-claude-craft)
   - [Método A: NPX (Sem Necessidade de Clone)](#método-a-npx-sem-necessidade-de-clone)
   - [Método B: Makefile (Mais Controle)](#método-b-makefile-mais-controle)
6. [Verificar a Instalação](#6-verificar-a-instalação)
7. [Configurar o Contexto do Projeto](#7-configurar-o-contexto-do-projeto)
8. [Primeiro Lançamento com Claude Code](#8-primeiro-lançamento-com-claude-code)
9. [Testar Sua Configuração](#9-testar-sua-configuração)
10. [Solução de Problemas](#10-solução-de-problemas)
11. [Próximos Passos](#11-próximos-passos)

---

## 1. Lista de Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado:

### Obrigatório

- [ ] **Terminal/Linha de Comando** - Qualquer aplicativo de terminal
- [ ] **Node.js 20+** - Necessário para instalação via NPX
- [ ] **Git** - Para controle de versão
- [ ] **Claude Code** - O assistente de codificação com IA

### Verificar Seus Pré-requisitos

Abra seu terminal e execute estes comandos:

```bash
# Verificar versão do Node.js (deve ser 16 ou superior)
node --version
```
Saída esperada: `v20.x.x` ou superior (ex: `v20.10.0`)

```bash
# Verificar versão do Git
git --version
```
Saída esperada: `git version 2.x.x` (ex: `git version 2.43.0`)

```bash
# Verificar se Claude Code está instalado
claude --version
```
Saída esperada: Número da versão (ex: `1.0.x`)

### Instalar Pré-requisitos Faltantes

Se algum comando acima falhar:

**Node.js:** Baixe de [nodejs.org](https://nodejs.org/) ou use:
```bash
# macOS com Homebrew
brew install node

# Ubuntu/Debian
sudo apt install nodejs npm
```

**Git:** Baixe de [git-scm.com](https://git-scm.com/) ou use:
```bash
# macOS com Homebrew
brew install git

# Ubuntu/Debian
sudo apt install git
```

**Claude Code:** Siga o [guia de instalação oficial](https://code.claude.com/docs/en/installation)

---

## 2. Criar o Diretório do Seu Projeto

Escolha onde você quer criar seu projeto e execute:

```bash
# Criar diretório do projeto
mkdir ~/meu-projeto

# Navegar para dentro
cd ~/meu-projeto
```

**Verificação:** Execute `pwd` para confirmar que você está no diretório correto:
```bash
pwd
```
Saída esperada: `/home/seunome/meu-projeto` (ou `/Users/seunome/meu-projeto` no macOS)

---

## 3. Inicializar o Repositório Git

Claude-Craft funciona melhor com projetos rastreados pelo Git:

```bash
# Inicializar repositório Git
git init
```

Saída esperada:
```
Initialized empty Git repository in /home/seunome/meu-projeto/.git/
```

**Verificação:** Verifique se a pasta `.git` existe:
```bash
ls -la
```
Você deve ver um diretório `.git/` na saída.

---

## 4. Escolher Sua Stack Tecnológica

Claude-Craft suporta múltiplas stacks tecnológicas. Escolha a que corresponde ao seu projeto:

| Stack | Ideal Para | Flag de Comando |
|-------|------------|-----------------|
| **C# / .NET** | APIs Enterprise, Microserviços | `--tech=csharp` |
| **Symfony / PHP** | APIs PHP, Apps Web, Serviços Backend | `--tech=symfony` |
| **Laravel / PHP** | Apps Web, APIs rápidas | `--tech=laravel` |
| **PHP** | Clean Architecture genérica | `--tech=php` |
| **Flutter / Dart** | Apps móveis (iOS/Android) | `--tech=flutter` |
| **Python** | APIs, Serviços de dados, Backends ML | `--tech=python` |
| **React** | SPAs Web, Dashboards | `--tech=react` |
| **React Native** | Apps móveis multiplataforma | `--tech=reactnative` |
| **Angular** | Apps empresariais, SPAs | `--tech=angular` |
| **Vue.js** | SPAs Web, Dashboards | `--tech=vuejs` |
| **Apenas Common** | Qualquer projeto (regras genéricas) | `--tech=common` |

**Escolha seu idioma:**

| Idioma | Flag |
|--------|------|
| Inglês | `--lang=en` |
| Francês | `--lang=fr` |
| Espanhol | `--lang=es` |
| Alemão | `--lang=de` |
| Português | `--lang=pt` |

---

## 5. Instalar o Claude-Craft

Você tem dois métodos de instalação. Escolha o que se adapta às suas necessidades:

### Método A: NPX (Sem Necessidade de Clone)

**Ideal para:** Configuração rápida, novos usuários, pipelines CI/CD

Este método baixa e executa o Claude-Craft diretamente sem clonar o repositório.

```bash
# Substitua 'symfony' pela sua stack tech e 'pt' pelo seu idioma
npx @the-bearded-bear/claude-craft install ~/meu-projeto --tech=symfony --lang=pt
```

**Exemplo para um projeto Flutter em inglês:**
```bash
npx @the-bearded-bear/claude-craft install ~/meu-projeto --tech=flutter --lang=en
```

Saída esperada:
```
Installing Claude-Craft rules...
  ✓ Common rules installed
  ✓ Symfony rules installed
  ✓ Agents installed
  ✓ Commands installed
  ✓ Templates installed
  ✓ Checklists installed
  ✓ CLAUDE.md generated

Installation complete! Run 'claude' in your project directory to start.
```

**Se você ver um erro:**
- `npm ERR! 404` → Verifique sua conexão com a internet
- `EACCES: permission denied` → Execute com `sudo` ou corrija permissões do npm
- `command not found: npx` → Instale o Node.js primeiro

---

### Método B: Makefile (Mais Controle)

**Ideal para:** Personalização, contribuidores do projeto, uso offline

Este método requer clonar o repositório do Claude-Craft primeiro.

#### Passo B.1: Clonar o Claude-Craft

```bash
# Clonar para um local permanente
git clone https://github.com/TheBeardedBearSAS/claude-craft.git ~/claude-craft
```

Saída esperada:
```
Cloning into '/home/seunome/claude-craft'...
remote: Enumerating objects: XXX, done.
...
Resolving deltas: 100% (XXX/XXX), done.
```

#### Passo B.2: Executar a Instalação

```bash
# Navegar para o diretório do Claude-Craft
cd ~/claude-craft

# Instalar regras no seu projeto
# Substitua 'symfony' pela sua tech e 'pt' pelo seu idioma
make install-symfony TARGET=~/meu-projeto RULES_LANG=pt
```

**Exemplos para outras stacks:**
```bash
# Flutter em inglês
make install-flutter TARGET=~/meu-projeto RULES_LANG=en

# React em francês
make install-react TARGET=~/meu-projeto RULES_LANG=fr

# Python em alemão
make install-python TARGET=~/meu-projeto RULES_LANG=de

# Apenas regras comuns (qualquer projeto)
make install-common TARGET=~/meu-projeto RULES_LANG=pt
```

Saída esperada:
```
Installing Symfony rules to /home/seunome/meu-projeto...
  Creating .claude directory...
  Copying rules... done
  Copying agents... done
  Copying commands... done
  Copying templates... done
  Copying checklists... done
  Generating CLAUDE.md... done

Installation complete!
```

---

## 6. Verificar a Instalação

Após a instalação, verifique se tudo está no lugar:

```bash
# Navegar para seu projeto
cd ~/meu-projeto

# Listar o diretório .claude
ls -la .claude/
```

Saída esperada:
```
total XX
drwxr-xr-x  8 user user 4096 Jan 12 10:00 .
drwxr-xr-x  3 user user 4096 Jan 12 10:00 ..
-rw-r--r--  1 user user 2048 Jan 12 10:00 CLAUDE.md
drwxr-xr-x  2 user user 4096 Jan 12 10:00 agents
drwxr-xr-x  2 user user 4096 Jan 12 10:00 checklists
drwxr-xr-x  4 user user 4096 Jan 12 10:00 commands
drwxr-xr-x  2 user user 4096 Jan 12 10:00 rules
drwxr-xr-x  2 user user 4096 Jan 12 10:00 templates
```

### Verificar Cada Componente

```bash
# Contar regras (deve ser 15-25 dependendo da stack)
ls .claude/rules/*.md | wc -l

# Contar agentes (deve ser 5-12)
ls .claude/agents/*.md | wc -l

# Contar comandos (deve ter subdiretórios)
ls .claude/commands/
```

**Se faltarem arquivos:**
- Execute novamente o comando de instalação
- Verifique se você tem permissões de escrita no diretório
- Veja a seção [Solução de Problemas](#10-solução-de-problemas)

---

## 7. Configurar o Contexto do Projeto

O arquivo mais importante para personalizar é o contexto do seu projeto. Isso informa ao Claude sobre SEU projeto específico.

### Opção A: Configuração Interativa (Recomendada)

Use o comando integrado para detectar automaticamente sua stack e responder perguntas direcionadas:

```bash
# Iniciar Claude Code
claude

# Executar o comando de configuração
/common:setup-project-context
```

O comando irá:
1. **Auto-detectar** sua stack técnica, framework, banco de dados e CI/CD
2. **Fazer perguntas** para informações faltantes (tipo de app, domínio, usuários, conformidade)
3. **Gerar** um arquivo `.claude/references/<your-tech>/project-context.md` completo
4. **Sugerir próximos passos** (agentes para executar, seções para completar)

**Modos disponíveis:**
- `(padrão)` - Detecção equilibrada + perguntas essenciais
- `--auto` - Detecção máxima, perguntas mínimas
- `--full` - Questionário completo incluindo objetivos e glossário

### Opção B: Configuração Manual

Se preferir configurar manualmente, abra o arquivo diretamente:

```bash
# Abrir no seu editor (substitua 'nano' por 'code', 'vim', etc.)
nano .claude/references/<your-tech>/project-context.md
```

### Seções para Personalizar

Encontre e atualize estas seções:

```markdown
## Visão Geral do Projeto
- **Nome**: [Nome do seu projeto]
- **Descrição**: [O que seu projeto faz?]
- **Tipo**: [API / App Web / App Móvel / CLI / Biblioteca]

## Stack Técnica
- **Framework**: [ex: Symfony 7.0, Flutter 3.16]
- **Versão da Linguagem**: [ex: PHP 8.3, Dart 3.2]
- **Banco de Dados**: [ex: PostgreSQL 16, MySQL 8]

## Convenções da Equipe
- **Estilo de Código**: [ex: PSR-12, Effective Dart]
- **Estratégia de Branches**: [ex: GitFlow, Trunk-based]
- **Formato de Commits**: [ex: Conventional Commits]

## Regras Específicas do Projeto
- [Adicione quaisquer regras personalizadas para seu projeto]
```

### Exemplo: API de E-commerce

```markdown
## Visão Geral do Projeto
- **Nome**: ShopAPI
- **Descrição**: API RESTful para plataforma de e-commerce
- **Tipo**: API

## Stack Técnica
- **Framework**: Symfony 7.0 com API Platform
- **Versão da Linguagem**: PHP 8.3
- **Banco de Dados**: PostgreSQL 16

## Convenções da Equipe
- **Estilo de Código**: PSR-12
- **Estratégia de Branches**: GitFlow
- **Formato de Commits**: Conventional Commits

## Regras Específicas do Projeto
- Todos os preços devem ser armazenados em centavos (inteiro)
- Usar UUID v7 para todos os identificadores de entidades
- Exclusão suave obrigatória para todas as entidades
```

Salve o arquivo quando terminar (no nano: `Ctrl+O`, depois `Enter`, depois `Ctrl+X`).

---

## 8. Primeiro Lançamento com Claude Code

Agora vamos iniciar o Claude Code e verificar se tudo funciona:

```bash
# Certifique-se de estar no diretório do seu projeto
cd ~/meu-projeto

# Lançar Claude Code
claude
```

Você deve ver o Claude Code iniciar com um prompt.

### Testar se as Regras Estão Ativas

Digite esta mensagem para o Claude:

```
Quais regras e diretrizes você está seguindo para este projeto?
```

Claude deve responder mencionando:
- Contexto do projeto de `00-project-context.md`
- Regras de arquitetura
- Requisitos de testes
- Diretrizes específicas da tecnologia

**Se Claude não mencionar suas regras:**
- Certifique-se de estar na raiz do projeto (não em um subdiretório)
- Verifique se o diretório `.claude/` existe
- Reinicie o Claude Code

---

## 9. Testar Sua Configuração

Execute estes testes rápidos para verificar se tudo funciona:

### Teste 1: Verificar Comandos Disponíveis

Pergunte ao Claude:
```
Liste todos os comandos slash disponíveis para este projeto
```

Esperado: Claude deve listar comandos como `/common:analyze-feature`, `/{tech}:generate-crud`, etc.

### Teste 2: Usar um Agente

Tente invocar um agente:
```
@tdd-coach Ajude-me a entender como escrever testes para este projeto
```

Esperado: Claude deve responder como o agente TDD Coach com orientação sobre testes.

### Teste 3: Executar um Comando

Tente um comando simples:
```
/common:pre-commit-check
```

Esperado: Claude deve executar uma verificação de qualidade pré-commit (pode reportar sem alterações se o projeto estiver vazio).

### Checklist de Validação

- [ ] Claude Code inicia sem erros
- [ ] Claude menciona as regras do projeto quando perguntado
- [ ] Comandos slash são reconhecidos
- [ ] Agentes respondem com conhecimento especializado
- [ ] Contexto do projeto é refletido nas respostas

---

## 10. Solução de Problemas

### Problemas de Instalação

**Problema:** `Permission denied` durante a instalação
```bash
# Solução 1: Corrigir permissões do diretório
chmod 755 ~/meu-projeto

# Solução 2: Executar com sudo (não recomendado para npm)
sudo npx @the-bearded-bear/claude-craft install ...
```

**Problema:** `Command not found: npx`
```bash
# Solução: Instalar Node.js
brew install node  # macOS
sudo apt install nodejs npm  # Ubuntu/Debian
```

**Problema:** `ENOENT: no such file or directory`
```bash
# Solução: Criar o diretório de destino primeiro
mkdir -p ~/meu-projeto
```

### Problemas em Tempo de Execução

**Problema:** Claude não vê as regras
- Verifique se você está na raiz do projeto: `pwd`
- Verifique se `.claude/` existe: `ls -la .claude/`
- Reinicie o Claude Code: saia e execute `claude` novamente

**Problema:** Comandos não reconhecidos
- Verifique o diretório de comandos: `ls .claude/commands/`
- Verifique permissões de arquivos: `ls -la .claude/commands/*.md`

**Problema:** Agentes não respondem
- Verifique o diretório de agentes: `ls .claude/agents/`
- Use a sintaxe correta: `@nome-agente mensagem`

### Obter Ajuda

Se ainda estiver travado:
1. Consulte o [Guia de Solução de Problemas](06-troubleshooting.md)
2. Pesquise nos [GitHub Issues](https://github.com/TheBeardedBearSAS/claude-craft/issues)
3. Abra uma nova issue com sua mensagem de erro

---

## 11. Próximos Passos

Parabéns! Seu ambiente Claude-Craft está pronto. Aqui está o que vem a seguir:

### Próximos Passos Imediatos

1. **Commite sua configuração:**
   ```bash
   git add .claude/
   git commit -m "feat: add Claude-Craft configuration"
   ```

2. **Comece a construir seu projeto** com assistência de IA

3. **Leia o Guia de Desenvolvimento de Funcionalidades** para aprender o fluxo de trabalho TDD

### Leituras Recomendadas

| Guia | Descrição |
|------|-----------|
| [Desenvolvimento de Funcionalidades](03-feature-development.md) | Fluxo TDD com agentes e comandos |
| [Correção de Bugs](04-bug-fixing.md) | Diagnóstico e testes de regressão |
| [Referência de Ferramentas](05-tools-reference.md) | Utilitários Multi-conta, StatusLine |
| [Adicionar a Projeto Existente](09-setup-existing-project.md) | Para seus outros projetos |

### Cartão de Referência Rápida

```bash
# Lançar Claude Code
claude

# Agentes comuns
@api-designer      # Design de API
@database-architect # Schema de banco de dados
@tdd-coach         # Ajuda com testes
@{tech}-reviewer   # Revisão de código

# Comandos comuns
/common:analyze-feature     # Analisar requisitos
/{tech}:generate-crud       # Gerar código CRUD
/common:pre-commit-check    # Verificação de qualidade
/common:security-audit      # Auditoria de segurança
```

---

[&larr; Anterior: Gestão do Backlog](07-backlog-management.md) | [Próximo: Adicionar a Projeto Existente &rarr;](09-setup-existing-project.md)
