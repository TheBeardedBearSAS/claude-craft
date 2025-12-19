---
description: Comando: Verificar Segurança
---

# Comando: Verificar Segurança

Realize uma auditoria de segurança na aplicação React Native.

---

## Objetivo

Este comando identifica vulnerabilidades de segurança, verifica conformidade com melhores práticas e recomenda melhorias.

---

## Análise

### 1. Auditoria de Dependências

**Executar:**

```bash
# NPM audit
npm audit

# Com fix automático
npm audit fix

# Verificar vulnerabilidades conhecidas
npx snyk test

# Better-npm-audit
npx better-npm-audit audit
```

**Verificar:**

- [ ] Sem vulnerabilidades críticas
- [ ] Sem vulnerabilidades altas
- [ ] Dependências atualizadas
- [ ] Sem dependências obsoletas

### 2. Armazenamento de Dados

**Verificar:**

```bash
# Buscar por uso de AsyncStorage para dados sensíveis
rg "AsyncStorage" src --type ts --type tsx
```

**Avaliar:**

- [ ] Dados sensíveis no SecureStore (não AsyncStorage)
- [ ] Tokens armazenados com segurança
- [ ] Sem credenciais hardcoded
- [ ] Sem chaves de API no código
- [ ] Dados criptografados quando necessário

### 3. Comunicação de Rede

**Verificar:**

```bash
# Buscar por URLs HTTP (não HTTPS)
rg "http://" src --type ts --type tsx

# Buscar por API keys hardcoded
rg "api[_-]?key|api[_-]?secret" src --type ts --type tsx -i
```

**Avaliar:**

- [ ] Todas as comunicações sobre HTTPS
- [ ] Certificate pinning para APIs críticas
- [ ] Tokens em headers (não query params)
- [ ] Rate limiting implementado

### 4. Validação de Entrada

**Verificar:**

- [ ] Todos os inputs do usuário validados
- [ ] Validação de tipo, formato, comprimento
- [ ] Dados de API sanitizados
- [ ] XSS prevenido (escaping de user input)
- [ ] SQL injection prevenida (se aplicável)

### 5. Permissões

**Verificar:**

```bash
# iOS: app.json ou Info.plist
cat ios/*/Info.plist | grep -A 1 "NSCameraUsageDescription"

# Android: AndroidManifest.xml
cat android/app/src/main/AndroidManifest.xml | grep "uses-permission"
```

**Avaliar:**

- [ ] Apenas permissões necessárias solicitadas
- [ ] Justificativas fornecidas (iOS)
- [ ] Permissões solicitadas no momento de uso
- [ ] Permissões negadas tratadas adequadamente

### 6. Configuração

**Verificar:**

- [ ] .env não commitado
- [ ] Secrets em variáveis de ambiente
- [ ] Configurações diferentes por ambiente
- [ ] Debug mode desabilitado em produção
- [ ] Logging desabilitado em produção

### 7. Código

**Verificar:**

```bash
# Buscar por console.logs com dados potencialmente sensíveis
rg "console\.log.*password|console\.log.*token|console\.log.*key" src

# Buscar por TODOs de segurança
rg "TODO.*security|FIXME.*security" src -i
```

**Avaliar:**

- [ ] Sem console.logs com dados sensíveis
- [ ] Sem debuggers em produção
- [ ] Sem comentários com credenciais
- [ ] Error messages não expõem informações sensíveis

---

## Checklist OWASP Mobile Top 10

- [ ] **M1: Improper Platform Usage** - Keychain/Keystore usado corretamente
- [ ] **M2: Insecure Data Storage** - Dados sensíveis no SecureStore
- [ ] **M3: Insecure Communication** - HTTPS para tudo
- [ ] **M4: Insecure Authentication** - Autenticação robusta implementada
- [ ] **M5: Insufficient Cryptography** - Algoritmos modernos, keys seguras
- [ ] **M6: Insecure Authorization** - Controles de acesso no backend
- [ ] **M7: Client Code Quality** - Code review, testes, análise estática
- [ ] **M8: Code Tampering** - Detecção de jailbreak/root
- [ ] **M9: Reverse Engineering** - Ofuscação de código
- [ ] **M10: Extraneous Functionality** - Backdoors removidos, debug code removido

---

## Relatório

```markdown
## Auditoria de Segurança

### Vulnerabilidades Críticas
1. [Descrição] - [Localização] - [Ação]

### Vulnerabilidades Altas
1. [Descrição] - [Localização] - [Ação]

### Vulnerabilidades Médias
1. [Descrição] - [Localização] - [Ação]

### Recomendações
1. [Ação prioritária]
2. [Melhoria de segurança]

### Score de Segurança: [X]/100
```

---

## Ações Imediatas

- [ ] Corrigir vulnerabilidades críticas
- [ ] Atualizar dependências vulneráveis
- [ ] Mover dados sensíveis para SecureStore
- [ ] Remover credenciais hardcoded
- [ ] Habilitar HTTPS estritamente
- [ ] Implementar certificate pinning
- [ ] Configurar monitoramento de segurança

---

**Segurança não é opcional. É responsabilidade de todos os desenvolvedores.**
