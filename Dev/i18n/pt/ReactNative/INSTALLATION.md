# Installation & Setup Guide

Guia de instalação e configuração das regras React Native para Claude Code.

---

## 🚀 Quick Start (5 minutos)

### Opção 1: Novo Projeto React Native

```bash
# 1. Criar projeto Expo
npx create-expo-app my-app --template blank-typescript
cd my-app

# 2. Criar pasta .claude
mkdir -p .claude

# 3. Copiar template CLAUDE.md
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. (Opcional) Copiar todas as regras
cp -r /path/to/ReactNative/rules/ .claude/rules/
cp -r /path/to/ReactNative/templates/ .claude/templates/
cp -r /path/to/ReactNative/checklists/ .claude/checklists/

# 5. Personalizar .claude/CLAUDE.md
# Substituir {{PROJECT_NAME}}, {{TECH_STACK}}, etc.
```

### Opção 2: Projeto Existente

```bash
# 1. Ir para o projeto
cd my-existing-app

# 2. Criar pasta .claude (se não existir)
mkdir -p .claude

# 3. Copiar template
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. Adaptar progressivamente
# Começar por CLAUDE.md, depois adicionar regras conforme necessário
```

---

## 📋 Personalização CLAUDE.md

Abrir `.claude/CLAUDE.md` e substituir os placeholders:

### Placeholders Obrigatórios

```markdown
{{PROJECT_NAME}}           → Nome do projeto (ex: "MyAwesomeApp")
{{TECH_STACK}}             → Stack técnico (ex: "React Native, Expo, TypeScript")
{{PROJECT_DESCRIPTION}}    → Descrição do projeto
{{GOAL_1}}                 → Objetivo 1
{{GOAL_2}}                 → Objetivo 2
{{GOAL_3}}                 → Objetivo 3
```

### Placeholders Técnicos

```markdown
{{REACT_NATIVE_VERSION}}   → Versão React Native (ex: "0.73")
{{EXPO_SDK_VERSION}}       → Versão Expo SDK (ex: "50")
{{TYPESCRIPT_VERSION}}     → Versão TypeScript (ex: "5.3")
{{NODE_VERSION}}           → Versão Node (ex: "18")
```

### Placeholders API

```markdown
{{DEV_API_URL}}            → URL API dev
{{PROD_API_URL}}           → URL API produção
{{AUTH_METHOD}}            → Método de autenticação (ex: "JWT")
```

### Placeholders Equipe

```markdown
{{TECH_LEAD}}              → Nome do tech lead
{{PRODUCT_OWNER}}          → Nome do PO
{{BACKEND_LEAD}}           → Nome do backend lead
{{SLACK_CHANNEL}}          → Canal Slack
{{JIRA_PROJECT}}           → Projeto JIRA
```

---

## 🎯 Configuração por Tipo de Projeto

### Projeto Simples (MVP)

**Mínimo recomendado**:
```
.claude/
└── CLAUDE.md              # Template personalizado
```

**Regras essenciais a copiar**:
- `01-workflow-analysis.md` - Análise obrigatória
- `02-architecture.md` - Arquitetura
- `03-coding-standards.md` - Padrões

### Projeto Médio

**Recomendado**:
```
.claude/
├── CLAUDE.md
├── rules/
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 07-testing.md
│   └── 11-security.md
└── checklists/
    └── pre-commit.md
```

### Projeto Complexo / Enterprise

**Configuração completa**:
```
.claude/
├── CLAUDE.md
├── rules/                 # Todas as 15 regras
├── templates/             # Todos os templates
└── checklists/            # Todas as checklists
```

---

## 🔧 Configuração do Ambiente

### 1. Install Dependencies

```bash
# Core
npm install react-native expo

# Navigation
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# State Management
npm install @tanstack/react-query zustand react-native-mmkv

# Forms & Validation
npm install react-hook-form zod

# Dev Dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev typescript
npm install --save-dev eslint prettier
npm install --save-dev jest @testing-library/react-native
npm install --save-dev husky lint-staged
```

### 2. Configure TypeScript

```bash
# Gerar tsconfig.json se não existir
npx tsc --init

# Ou copiar configuração recomendada de rules/03-coding-standards.md
```

### 3. Configure ESLint

```bash
# Criar .eslintrc.js
# Copiar configuração de rules/08-quality-tools.md
```

### 4. Configure Prettier

```bash
# Criar .prettierrc.js
# Copiar configuração de rules/08-quality-tools.md
```

### 5. Configure Husky (Pre-commit)

```bash
# Install Husky
npm install --save-dev husky lint-staged
npx husky init

# Configure pre-commit hook
# Ver rules/08-quality-tools.md
```

---

## 📱 Configuração app.json

```json
{
  "expo": {
    "name": "{{PROJECT_NAME}}",
    "slug": "{{PROJECT_SLUG}}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "myapp",
    "jsEngine": "hermes",
    "plugins": ["expo-router"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.company.myapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.company.myapp"
    }
  }
}
```

---

## 🧪 Verificação da Instalação

### Checklist

```bash
# 1. Estrutura
[ ] .claude/CLAUDE.md existe e está personalizado
[ ] .claude/rules/ existe (se copiado)
[ ] .claude/templates/ existe (se copiado)
[ ] .claude/checklists/ existe (se copiado)

# 2. Configuração
[ ] tsconfig.json configurado (strict mode)
[ ] .eslintrc.js configurado
[ ] .prettierrc.js configurado
[ ] package.json scripts (lint, format, test)

# 3. Dependências
[ ] React Native + Expo instalados
[ ] TypeScript instalado
[ ] ESLint + Prettier instalados
[ ] Bibliotecas de testes instaladas

# 4. Git
[ ] .gitignore completo
[ ] Husky configurado (opcional)
[ ] Branches main/develop criados

# 5. Testes
[ ] npm run lint funciona
[ ] npm run type-check funciona
[ ] npm test funciona
[ ] npx expo start funciona
```

### Comandos de Teste

```bash
# Type checking
npm run type-check
# → Deve passar sem erros

# Linting
npm run lint
# → Deve passar sem erros

# Formatting check
npm run format:check
# → Deve passar

# Tests
npm test
# → Deve passar (se testes configurados)

# Run app
npx expo start
# → Deve iniciar sem erros
```

---

## 🎓 Formação da Equipe

### Onboarding Novo Desenvolvedor

1. **Ler README.md** (5 min)
2. **Ler CLAUDE.md** do projeto (10 min)
3. **Ler regras essenciais**:
   - 01-workflow-analysis.md (15 min)
   - 02-architecture.md (20 min)
   - 03-coding-standards.md (15 min)
4. **Explorar templates** (10 min)
5. **Testar workflow** com uma pequena tarefa (30 min)

**Total**: ~1h30

### Formação Contínua

- **Semanal**: Revisão de uma regra em equipe (15 min)
- **Sprint**: Retrospectiva sobre aplicação das regras
- **Mensal**: Atualização das regras se necessário

---

## 🔄 Atualização

### Verificar Novas Versões

```bash
# Ir para a pasta fonte ReactNative
cd /path/to/ReactNative

# Pull latest (se git repo)
git pull origin main

# Comparar versões
diff .claude/CLAUDE.md CLAUDE.md.template
```

### Aplicar Atualizações

```bash
# Backup atual
cp .claude/CLAUDE.md .claude/CLAUDE.md.backup

# Atualizar regras
cp /path/to/ReactNative/rules/XX-rule.md .claude/rules/

# Mesclar alterações
# Comparar backup e novo arquivo
```

---

## 💡 Tips

### Para Claude Code

Claude Code detecta automaticamente `.claude/CLAUDE.md` no projeto.

**Não é necessária configuração adicional!**

### Para a Equipe

- **Commit `.claude/`** no git para compartilhar com a equipe
- **Revisar regras** juntos regularmente
- **Adaptar** as regras ao contexto do projeto
- **Documentar** decisões específicas em CLAUDE.md

### Troubleshooting

**Claude não vê CLAUDE.md**:
- Verificar que o arquivo está em `.claude/CLAUDE.md`
- Verificar permissões de leitura
- Reiniciar Claude Code

**Erros ESLint muito rígidos**:
- Adaptar `.eslintrc.js` ao projeto
- Documentar exceções em CLAUDE.md

**Testes falham**:
- Verificar configuração do Jest
- Verificar mocks necessários
- Ver `rules/07-testing.md`

---

## 📞 Suporte

### Documentação
- README.md - Visão geral
- SUMMARY.md - Resumo completo
- rules/ - Regras detalhadas

### Issues
Se problema com as regras:
1. Verificar SUMMARY.md
2. Ler regra correspondente
3. Adaptar ao contexto

---

## ✅ Instalação Completa!

Após seguir este guia, você deve ter:

✅ Estrutura `.claude/` configurada
✅ CLAUDE.md personalizado
✅ Regras copiadas (se opção completa)
✅ Ambiente configurado (TypeScript, ESLint, etc.)
✅ Dependências instaladas
✅ Testes de verificação aprovados
✅ Equipe treinada

**Pronto para desenvolver com qualidade!** 🚀

---

**Versão**: 1.0.0
**Guia criado em**: 2025-12-03
