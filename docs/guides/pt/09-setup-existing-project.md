# Adicionando Claude-Craft a um Projeto Existente

Este tutorial completo guia você através da adição do Claude-Craft a um projeto que já possui código. Você aprenderá como instalar com segurança, fazer o Claude entender seu codebase e fazer push das suas primeiras modificações assistidas por IA.

**Tempo necessário:** ~20-30 minutos

---

## Índice

1. [Antes de Começar](#1-antes-de-começar)
2. [Fazer Backup do Seu Projeto](#2-fazer-backup-do-seu-projeto)
3. [Analisar a Estrutura do Seu Projeto](#3-analisar-a-estrutura-do-seu-projeto)
4. [Verificar Conflitos](#4-verificar-conflitos)
5. [Escolher Sua Stack Tecnológica](#5-escolher-sua-stack-tecnológica)
6. [Instalar o Claude-Craft](#6-instalar-o-claude-craft)
7. [Mesclar Configurações](#7-mesclar-configurações)
8. [Fazer o Claude Entender Seu Codebase](#8-fazer-o-claude-entender-seu-codebase)
9. [Sua Primeira Modificação](#9-sua-primeira-modificação)
10. [Onboarding da Equipe](#10-onboarding-da-equipe)
11. [Migração de Outras Ferramentas de IA](#11-migração-de-outras-ferramentas-de-ia)
12. [Solução de Problemas](#12-solução-de-problemas)

---

## 1. Antes de Começar

### Avisos Importantes

> **Aviso:** Instalar o Claude-Craft criará um diretório `.claude/` no seu projeto. Se já existir um, você precisará decidir se vai mesclar, substituir ou preservar.

> **Aviso:** Sempre crie uma branch de backup antes da instalação. Isso permite um rollback fácil se algo der errado.

### Checklist de Pré-requisitos

- [ ] Seu projeto está rastreado no Git
- [ ] Você commitou todas as alterações atuais
- [ ] Você tem acesso de escrita ao diretório do projeto
- [ ] Node.js 16+ instalado (para o método NPX)
- [ ] Claude Code instalado

### Quando NÃO Instalar

Considere adiar a instalação se:
- Você tem alterações não commitadas
- Você está no meio de um release crítico
- O projeto tem uma configuração `.claude/` existente complexa
- Vários membros da equipe estão ativamente fazendo push de alterações

---

## 2. Fazer Backup do Seu Projeto

**Nunca pule este passo.** Crie uma branch de backup antes da instalação.

### Criar Branch de Backup

```bash
# Navegue para seu projeto
cd ~/seu-projeto-existente

# Certifique-se de que tudo está commitado
git status
```

Se você ver alterações não commitadas:
```bash
git add .
git commit -m "chore: save work before Claude-Craft installation"
```

Agora crie o backup:
```bash
# Criar e ficar na branch de backup
git checkout -b backup/before-claude-craft

# Voltar para sua branch principal
git checkout main  # ou 'master' ou sua branch padrão
```

### Verificar o Backup

```bash
# Confirmar que a branch de backup existe
git branch | grep backup
```

Saída esperada:
```
  backup/before-claude-craft
```

### Plano de Rollback

Se algo der errado, você pode fazer rollback:
```bash
# Descartar todas as alterações e voltar para o backup
git checkout backup/before-claude-craft
git branch -D main
git checkout -b main
```

---

## 3. Analisar a Estrutura do Seu Projeto

Antes de instalar, entenda o que você já tem.

### Verificar se Existe Diretório .claude

```bash
# Verificar se .claude já existe
ls -la .claude/ 2>/dev/null || echo "No .claude directory found"
```

**Se .claude existir:**
- Note quais arquivos estão dentro
- Decida: mesclar, substituir ou preservar
- Veja [Seção 7: Mesclar Configurações](#7-mesclar-configurações)

### Identificar a Estrutura do Seu Projeto

```bash
# Listar diretório raiz
ls -la

# Mostrar árvore de diretórios (primeiros 2 níveis)
find . -maxdepth 2 -type d | head -20
```

Tome nota de:
- Diretórios de código-fonte principais (`src/`, `app/`, `lib/`)
- Arquivos de configuração (`.env`, `config/`, `settings/`)
- Diretórios de testes (`tests/`, `test/`, `spec/`)
- Documentação (`docs/`, `README.md`)

### Verificar Outras Configurações de Ferramentas de IA

```bash
# Verificar regras do Cursor
ls -la .cursorrules 2>/dev/null

# Verificar instruções do GitHub Copilot
ls -la .github/copilot-instructions.md 2>/dev/null

# Verificar outras configs do Claude
ls -la CLAUDE.md 2>/dev/null
```

Note quaisquer configurações existentes - você pode querer migrá-las (veja [Seção 11](#11-migração-de-outras-ferramentas-de-ia)).

---

## 4. Verificar Conflitos

### Arquivos que Podem Conflitar

| Arquivo/Diretório | Claude-Craft Cria | Seu Projeto Pode Ter |
|-------------------|-------------------|----------------------|
| `.claude/` | Sim | Talvez |
| `.claude/CLAUDE.md` | Sim | Talvez |
| `.claude/rules/` | Sim | Talvez |
| `CLAUDE.md` (raiz) | Não | Talvez |

### Matriz de Decisão

| Cenário | Recomendação |
|---------|--------------|
| Não existe `.claude/` | Instalar normalmente |
| `.claude/` vazio existe | Instalar com `--force` |
| `.claude/` tem regras personalizadas | Usar `--preserve-config` |
| `CLAUDE.md` raiz existe | Manter, não vai conflitar |

---

## 5. Escolher Sua Stack Tecnológica

Identifique a tecnologia principal do seu projeto:

| Seu Projeto Usa | Comando de Instalação |
|-----------------|----------------------|
| PHP/Symfony | `--tech=symfony` |
| Dart/Flutter | `--tech=flutter` |
| Python/FastAPI/Django | `--tech=python` |
| JavaScript/React | `--tech=react` |
| JavaScript/React Native | `--tech=reactnative` |
| Múltiplas/Outras | `--tech=common` |

**Para monorepos:** Instale em cada subprojeto separadamente (veja abaixo).

---

## 6. Instalar o Claude-Craft

### Instalação Padrão

**Método A: NPX (Recomendado)**
```bash
cd ~/seu-projeto-existente
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=pt
```

**Método B: Makefile**
```bash
cd ~/claude-craft
make install-symfony TARGET=~/seu-projeto-existente LANG=pt
```

### Preservar Configuração Existente

Se você tem arquivos `.claude/` existentes que deseja manter:

```bash
# NPX com flag de preservação
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=pt --preserve-config

# Makefile com flag de preservação
make install-symfony TARGET=~/seu-projeto-existente LANG=pt OPTIONS="--preserve-config"
```

**O que `--preserve-config` mantém:**
- `CLAUDE.md` (sua descrição do projeto)
- `rules/00-project-context.md` (seu contexto personalizado)
- Quaisquer regras personalizadas que você adicionou

### Instalação em Monorepo

Para projetos com múltiplas apps:

```
meu-monorepo/
├── frontend/    (React)
├── backend/     (Symfony)
└── mobile/      (Flutter)
```

Instale em cada diretório:
```bash
# Instalar React no frontend
npx @the-bearded-bear/claude-craft install ./frontend --tech=react --lang=pt

# Instalar Symfony no backend
npx @the-bearded-bear/claude-craft install ./backend --tech=symfony --lang=pt

# Instalar Flutter no mobile
npx @the-bearded-bear/claude-craft install ./mobile --tech=flutter --lang=pt
```

### Verificar a Instalação

```bash
ls -la .claude/
```

Estrutura esperada:
```
.claude/
├── CLAUDE.md
├── agents/
├── checklists/
├── commands/
├── rules/
└── templates/
```

---

## 7. Mesclar Configurações

Se você tinha configurações existentes, mescle-as agora.

### Mesclar CLAUDE.md

Se você tinha um `CLAUDE.md` personalizado:

1. Abra ambos os arquivos:
   ```bash
   # Seu arquivo antigo (se feito backup)
   cat .claude/CLAUDE.md.backup

   # Novo arquivo Claude-Craft
   cat .claude/CLAUDE.md
   ```

2. Copie suas seções personalizadas para o novo arquivo
3. Mantenha a estrutura do Claude-Craft, adicione seu conteúdo

### Mesclar Regras Personalizadas

Se você tinha regras personalizadas em `rules/`:

1. As regras do Claude-Craft são numeradas de `01-xx.md` a `12-xx.md`
2. Adicione suas regras personalizadas como `90-custom-rule.md`, `91-another-rule.md`
3. Números mais altos = menor prioridade, mas ainda incluídas

### Exemplo de Mesclagem

```bash
# Renomear sua antiga regra personalizada
mv .claude/rules/my-custom-rules.md .claude/rules/90-project-custom-rules.md
```

---

## 8. Fazer o Claude Entender Seu Codebase

**Esta é a seção mais importante.** Uma configuração bem-sucedida do Claude-Craft não é apenas sobre instalar arquivos—é sobre fazer o Claude realmente entender seu projeto.

### 8.1 Exploração Inicial do Codebase

Inicie o Claude Code no seu projeto:

```bash
cd ~/seu-projeto-existente
claude
```

Comece com uma exploração ampla:

```
Explore este codebase e me dê um resumo completo de:
1. A estrutura geral do projeto
2. Diretórios principais e seus propósitos
3. Pontos de entrada chave
4. Arquivos de configuração que você encontrar
```

**Resultado esperado:** Claude deve descrever a estrutura do seu projeto com precisão. Se ele errar em algo, corrija-o—isso ajuda o Claude a aprender.

**Verifique o entendimento do Claude:**
```
Com base no que você encontrou, que tipo de projeto é este?
Qual framework ou stack tecnológica é usada?
```

### 8.2 Entender a Arquitetura

Peça ao Claude para identificar padrões arquiteturais:

```
Analise a arquitetura deste projeto:
1. Qual padrão arquitetural ele segue? (MVC, Clean Architecture, etc.)
2. Quais são as principais camadas e suas responsabilidades?
3. Como o código está organizado em módulos/domínios?
4. Quais padrões de design você vê sendo usados?
```

**Verifique com perguntas específicas:**
```
Mostre-me um exemplo de como uma requisição flui através do sistema,
do ponto de entrada até o banco de dados e de volta.
```

Se a análise do Claude estiver precisa, ótimo! Se não, corrija:
```
Na verdade, este projeto usa Clean Architecture com estas camadas:
- Domain (src/Domain/)
- Application (src/Application/)
- Infrastructure (src/Infrastructure/)
- Presentation (src/Controller/)
Por favor atualize seu entendimento.
```

### 8.3 Descobrir a Lógica de Negócio

Ajude o Claude a entender o que seu projeto realmente faz:

```
Quais são os principais domínios de negócio ou funcionalidades neste codebase?
Liste as entidades principais e explique seus relacionamentos.
```

**Use agentes especializados:**

```
@database-architect
Analise o schema do banco de dados neste projeto.
Quais são as entidades principais, seus relacionamentos e padrões que você nota?
```

```
@api-designer
Revise os endpoints de API neste projeto.
Quais recursos são expostos? Quais padrões são usados?
```

### 8.4 Documentar o Contexto

Você tem duas opções para configurar o contexto do projeto:

**Opção A: Configuração Interativa (Recomendada)**

Use o comando integrado para detectar automaticamente sua stack e responder perguntas direcionadas:

```bash
/common:setup-project-context
```

O comando analisará sua codebase existente, detectará tecnologias e perguntará apenas sobre informações faltantes.

**Opção B: Configuração Manual**

Crie ou atualize o arquivo de contexto do projeto manualmente:

```bash
nano .claude/rules/00-project-context.md
```

Preencha o template com o que você descobriu:

```markdown
## Visão Geral do Projeto
- **Nome**: [Nome do seu projeto]
- **Descrição**: [O que o Claude aprendeu + suas adições]
- **Domínio**: [ex: E-commerce, Saúde, FinTech]

## Arquitetura
- **Padrão**: [O que o Claude identificou]
- **Camadas**: [Liste-as]
- **Diretórios Chave**:
  - `src/Domain/` - Lógica de negócio e entidades
  - `src/Application/` - Casos de uso e serviços
  - [etc.]

## Contexto de Negócio
- **Entidades Principais**: [Liste objetos de domínio principais]
- **Fluxos Chave**: [Descreva as principais jornadas de usuário]
- **Integrações Externas**: [APIs, serviços aos quais você se conecta]

## Convenções de Desenvolvimento
- **Testes**: [Sua abordagem de testes]
- **Estilo de Código**: [Seus padrões]
- **Fluxo Git**: [Sua estratégia de branches]

## Notas Importantes para IA
- [Qualquer coisa que o Claude deve sempre lembrar]
- [Armadilhas a evitar]
- [Considerações especiais]
```

Salve e verifique se o Claude vê:
```
Leia o arquivo de contexto do projeto e resuma o que você entende
agora sobre este projeto.
```

---

## 9. Sua Primeira Modificação

Agora vamos fazer sua primeira alteração assistida por IA e fazer push.

### 9.1 Escolher uma Tarefa Simples

Boas primeiras tarefas:
- [ ] Adicionar um teste unitário faltante
- [ ] Corrigir um pequeno bug
- [ ] Adicionar documentação a uma função
- [ ] Refatorar um método para maior clareza
- [ ] Adicionar validação de entrada

**Evitar para a primeira tarefa:**
- Funcionalidades grandes
- Alterações de segurança críticas
- Migrações de banco de dados
- Alterações de API que quebram compatibilidade

### 9.2 Deixar o Claude Analisar

Peça ao Claude para analisar antes de fazer alterações:

```
Eu quero [descreva sua tarefa].

Antes de fazer quaisquer alterações:
1. Analise o código relevante
2. Explique sua abordagem
3. Liste os arquivos que você vai modificar
4. Descreva os testes que você vai adicionar ou atualizar
```

**Revise o plano do Claude cuidadosamente.** Faça perguntas:
```
Por que você escolheu esta abordagem?
Existem riscos com esta alteração?
Quais testes vão verificar que funciona?
```

### 9.3 Implementar a Alteração

Uma vez satisfeito com o plano:
```
Vá em frente e implemente esta alteração seguindo TDD:
1. Primeiro escreva/atualize os testes
2. Depois implemente o código
3. Execute os testes para verificar
```

### 9.4 Revisar e Commitar

Antes de commitar, execute verificações de qualidade:

```
/common:pre-commit-check
```

Revise todas as alterações:
```bash
git diff
git status
```

Se tudo parecer bom:
```bash
# Stage as alterações
git add .

# Commit com mensagem descritiva
git commit -m "feat: [descreva o que você fez]

- [ponto sobre a alteração]
- [outra alteração]
- Adicionados testes para [funcionalidade]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 9.5 Fazer Push das Suas Alterações

```bash
# Push para o remoto
git push origin main
```

Se seu CI/CD executar, verifique se passa:
```bash
# Verificar status do CI (se usando GitHub)
gh run list --limit 1
```

**Parabéns!** Você fez sua primeira modificação assistida por IA.

---

## 10. Onboarding da Equipe

Compartilhe o Claude-Craft com sua equipe.

### Commitar a Configuração

```bash
# Adicionar arquivos do Claude-Craft ao git
git add .claude/

# Commitar
git commit -m "feat: add Claude-Craft AI development configuration

- Added rules for [sua stack tech]
- Configured project context
- Added agents and commands"

# Push
git push origin main
```

### Notificar Sua Equipe

Crie um guia breve para colegas:

```markdown
## Usando Claude-Craft Neste Projeto

1. Instalar Claude Code: [link]
2. Pull das últimas alterações: `git pull`
3. Iniciar no projeto: `cd project && claude`

### Comandos Rápidos
- `/common:pre-commit-check` - Executar antes de commitar
- `@tdd-coach` - Ajuda com testes
- `@{tech}-reviewer` - Revisão de código

### Contexto do Projeto
Nosso assistente de IA entende:
- [Padrões de arquitetura que usamos]
- [Convenções de código]
- [Domínio de negócio]
```

### Demo para a Equipe

Considere fazer uma demo curta:
1. Mostrar o Claude explorando o codebase
2. Demonstrar uma tarefa simples
3. Mostrar o fluxo de pre-commit
4. Responder perguntas

---

## 11. Migração de Outras Ferramentas de IA

Se você usa outras ferramentas de codificação com IA, migre suas configurações.

### Do Cursor Rules (.cursorrules)

```bash
# Verificar se você tem regras do Cursor
cat .cursorrules 2>/dev/null
```

Migração:
1. Abra `.cursorrules`
2. Copie as regras relevantes
3. Adicione a `.claude/rules/90-migrated-cursor-rules.md`
4. Adapte o formato para o estilo do Claude-Craft

### Do GitHub Copilot Instructions

```bash
# Verificar instruções do Copilot
cat .github/copilot-instructions.md 2>/dev/null
```

Migração:
1. Abra as instruções do Copilot
2. Extraia as diretrizes de codificação
3. Adicione ao contexto do projeto ou regras personalizadas

### De Outras Configurações do Claude

Se você tem um `CLAUDE.md` na raiz:
```bash
# Revisar config existente
cat CLAUDE.md 2>/dev/null
```

Migração:
1. Compare com o novo `.claude/CLAUDE.md`
2. Mescle conteúdo único
3. Mantenha o `CLAUDE.md` raiz se tiver documentação do projeto
4. Remova se for redundante com `.claude/`

### Tabela de Mapeamento de Migração

| Localização Antiga | Localização Claude-Craft |
|--------------------|--------------------------|
| `.cursorrules` | `.claude/rules/90-custom.md` |
| `.github/copilot-instructions.md` | `.claude/rules/00-project-context.md` |
| `CLAUDE.md` (raiz) | `.claude/CLAUDE.md` |
| Prompts personalizados | `.claude/commands/custom/` |

---

## 12. Solução de Problemas

### Problemas de Instalação

**Problema:** Erro "Directory already exists"
```bash
# Solução: Usar flag force
npx @the-bearded-bear/claude-craft install . --tech=symfony --force
```

**Problema:** "Permission denied"
```bash
# Solução: Verificar propriedade
ls -la .claude/
# Corrigir permissões
chmod -R 755 .claude/
```

**Problema:** "CLAUDE.md not found" após instalação
```bash
# Solução: Re-executar instalação
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=pt
```

### Problemas de Entendimento do Claude

**Problema:** Claude não entende a estrutura do meu projeto

Solução: Seja explícito no seu arquivo de contexto e durante a conversa:
```
Este projeto usa [padrão específico]. O código-fonte principal está em [diretório].
Quando eu pergunto sobre [termo de domínio], eu quero dizer [explicação].
```

**Problema:** Claude sugere padrões errados

Solução: Corrija e reforce:
```
Nós não usamos [padrão] neste projeto. Nós usamos [padrão correto] porque [razão].
Por favor lembre disso para sugestões futuras.
```

**Problema:** Claude esquece contexto entre sessões

Solução: Certifique-se de que `00-project-context.md` seja completo. Informações chave devem estar em arquivos, não apenas na conversa.

### Rollback

Se você precisar desfazer a instalação:

```bash
# Remover arquivos do Claude-Craft
rm -rf .claude/

# Restaurar da branch de backup
git checkout backup/before-claude-craft -- .

# Ou hard reset
git checkout backup/before-claude-craft
```

---

## Resumo

Você conseguiu com sucesso:
- [x] Fazer backup do seu projeto
- [x] Instalar o Claude-Craft com segurança
- [x] Fazer o Claude entender seu codebase
- [x] Fazer sua primeira modificação assistida por IA
- [x] Fazer push de alterações para seu repositório
- [x] Preparar o onboarding da equipe

### O Que Vem a Seguir?

| Tarefa | Guia |
|--------|------|
| Aprender o fluxo TDD completo | [Desenvolvimento de Funcionalidades](03-feature-development.md) |
| Debugar efetivamente | [Correção de Bugs](04-bug-fixing.md) |
| Gerenciar seu backlog com IA | [Gestão do Backlog](07-backlog-management.md) |
| Explorar ferramentas avançadas | [Referência de Ferramentas](05-tools-reference.md) |

---

[&larr; Anterior: Setup Novo Projeto](08-setup-new-project.md) | [Voltar ao Índice](../index.md)
