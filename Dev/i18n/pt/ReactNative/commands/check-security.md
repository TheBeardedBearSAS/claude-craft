---
description: Verificar Segurança React Native
argument-hint: [arguments]
---

# Verificar Segurança React Native

## Argumentos

$ARGUMENTS

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer uma investigação transversal.

## MISSÃO

Você é um especialista em auditoria de segurança React Native. Sua missão é analisar as práticas de segurança de acordo com os padrões definidos em `.claude/rules/11-security.md`.

### Etapa 1: Análise de dependências e configuração

1. Verificar as dependências de segurança instaladas
2. Analisar arquivos de configuração sensíveis
3. Verificar a presença de segredos no código
4. Analisar as permissões solicitadas

### Etapa 2: Armazenamento Seguro (6 pontos)

#### 🔐 Expo SecureStore / Keychain

- [ ] **(2 pts)** Uso de `expo-secure-store` ou `react-native-keychain` para dados sensíveis
- [ ] **(1 pt)** Sem armazenamento de token/segredo no AsyncStorage
- [ ] **(1 pt)** Sem armazenamento de senha em texto simples
- [ ] **(1 pt)** Sem dados sensíveis em estado Redux/Zustand não persistido
- [ ] **(1 pt)** Configuração biométrica para acesso a dados sensíveis, quando aplicável

**Arquivos a verificar:**
```bash
src/services/storage.ts
src/utils/secureStorage.ts
src/hooks/useAuth.ts
```

Buscar padrões perigosos:
```bash
# Buscar AsyncStorage para dados sensíveis
grep -r "AsyncStorage.setItem.*token" src/
grep -r "AsyncStorage.setItem.*password" src/
grep -r "AsyncStorage.setItem.*secret" src/
```

### Etapa 3: Gerenciamento de segredos e chaves de API (5 pontos)

#### 🔑 Sem segredos no código

- [ ] **(2 pts)** Sem chave de API hardcoded no código-fonte
- [ ] **(1 pt)** Uso de variáveis de ambiente (`.env`, `app.config.js`)
- [ ] **(1 pt)** `.env` no `.gitignore`
- [ ] **(1 pt)** Documentação das variáveis de ambiente necessárias (`.env.example`)

**Arquivos a verificar:**
```bash
.env
.env.example
.gitignore
app.config.js
app.json
```

Buscar segredos hardcoded:
```bash
# Padrões suspeitos
grep -rE "(api[_-]?key|secret|password|token|private[_-]?key).*=.*['\"][a-zA-Z0-9]{20,}" src/ --exclude-dir=node_modules
grep -rE "https?://[^/]*:([^@]+)@" src/ --exclude-dir=node_modules
```

**Verificar especificamente:**
- Sem chaves AWS, Google, Firebase hardcoded
- Sem tokens OAuth hardcoded
- Sem certificados ou chaves privadas no repositório

### Etapa 4: Comunicação de rede segura (5 pontos)

#### 🌐 HTTPS e Certificate Pinning

- [ ] **(2 pts)** Todas as comunicações apenas em HTTPS
- [ ] **(1 pt)** Certificate pinning implementado para APIs críticas
- [ ] **(1 pt)** Validação de certificado SSL habilitada
- [ ] **(1 pt)** Timeout e retry apropriados para requisições

**Arquivos a verificar:**
```bash
src/services/api.ts
src/config/network.ts
app.json (iOS NSAppTransportSecurity)
android/app/src/main/AndroidManifest.xml (android:usesCleartextTraffic)
```

Verificar:
```typescript
// Correto: apenas HTTPS
const API_URL = 'https://api.example.com';

// Incorreto: HTTP
const API_URL = 'http://api.example.com';
```

Para iOS (app.json):
```json
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": false
      }
    }
  }
}
```

Para Android (AndroidManifest.xml):
```xml
<!-- Deve ser false ou ausente -->
<application android:usesCleartextTraffic="false">
```

### Etapa 5: Autenticação e autorização (4 pontos)

#### 🔒 Gerenciamento de tokens e sessões

- [ ] **(1 pt)** JWT armazenado com segurança (SecureStore)
- [ ] **(1 pt)** Refresh token implementado
- [ ] **(1 pt)** Expiração de token tratada
- [ ] **(1 pt)** Logout automático após inatividade (se aplicável)

**Arquivos a verificar:**
```bash
src/services/auth.ts
src/hooks/useAuth.ts
src/contexts/AuthContext.tsx
```

**Verificar o fluxo:**
```typescript
// Padrão correto
const token = await SecureStore.getItemAsync('access_token');
const refreshToken = await SecureStore.getItemAsync('refresh_token');

// Padrão incorreto
const token = await AsyncStorage.getItem('access_token');
```

### Etapa 6: Permissões e dados do usuário (3 pontos)

#### 📱 Permissões Android/iOS

- [ ] **(1 pt)** Permissões solicitadas justificadas e mínimas
- [ ] **(1 pt)** Solicitações de permissão em tempo de execução (não todas na inicialização)
- [ ] **(1 pt)** Mensagens explicativas para permissões sensíveis

**Arquivos a verificar:**
```bash
app.json (permissões iOS/Android)
android/app/src/main/AndroidManifest.xml
ios/[AppName]/Info.plist
```

**Permissões a auditar:**
- Câmera (NSCameraUsageDescription / CAMERA)
- Localização (NSLocationWhenInUseUsageDescription / ACCESS_FINE_LOCATION)
- Contatos (NSContactsUsageDescription / READ_CONTACTS)
- Armazenamento (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)

### Etapa 7: Proteção de código (2 pontos)

#### 🛡️ Ofuscação e proteção

- [ ] **(1 pt)** Ofuscação habilitada para builds de produção (ProGuard/R8)
- [ ] **(1 pt)** Logs sensíveis desabilitados em produção (sem console.log de tokens)

**Arquivos a verificar:**
```bash
android/app/build.gradle (minifyEnabled, shrinkResources)
src/**/*.ts (instruções console.log)
```

Para Android (build.gradle):
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

Buscar logs sensíveis:
```bash
grep -rE "console\.(log|debug|info).*token" src/
grep -rE "console\.(log|debug|info).*password" src/
grep -rE "console\.(log|debug|info).*secret" src/
```

### Etapa 8: Calcular pontuação

```
┌──────────────────────────────────┬─────────┬────────┐
│ Critério                         │ Pontos  │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Armazenamento seguro             │ XX/6    │ ✅/⚠️/❌│
│ Segredos e chaves de API         │ XX/5    │ ✅/⚠️/❌│
│ Comunicação de rede              │ XX/5    │ ✅/⚠️/❌│
│ Autenticação                     │ XX/4    │ ✅/⚠️/❌│
│ Permissões                       │ XX/3    │ ✅/⚠️/❌│
│ Proteção de código               │ XX/2    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL SEGURANÇA                  │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legenda:**
- ✅ Excelente (≥ 20/25)
- ⚠️ Atenção (15-19/25)
- ❌ Crítico (< 15/25)

### Etapa 9: Varredura de vulnerabilidades

Executar os seguintes comandos para detectar vulnerabilidades:

#### 🔍 NPM Audit

```bash
npm audit
```

Analisar os resultados:
- **Vulnerabilidades críticas:** XX (alvo: 0)
- **Vulnerabilidades altas:** XX (alvo: 0)
- **Vulnerabilidades médias:** XX (alvo: < 5)
- **Vulnerabilidades baixas:** XX

#### 📦 Dependências desatualizadas

```bash
npm outdated
```

Listar dependências de segurança desatualizadas:
- `expo-secure-store`
- `react-native-keychain`
- `react-native-ssl-pinning`
- etc.

### Etapa 10: Relatório detalhado

## 📊 RESULTADOS DA AUDITORIA DE SEGURANÇA

### ✅ Pontos Fortes

Liste as boas práticas identificadas:
- [Prática 1 com localização]
- [Prática 2 com localização]

### 🚨 Vulnerabilidades Críticas

Liste os problemas de segurança críticos (pontuação ❌ imediata):

1. **[CRÍTICO - Problema 1]**
   - **Severidade:** CRÍTICA
   - **Localização:** [Arquivos afetados]
   - **Risco:** [Descrição do risco]
   - **Exemplo:**
   ```typescript
   // Código vulnerável
   const API_KEY = "sk_live_123456789abcdef"; // ❌ CRÍTICO
   ```
   - **Correção imediata:**
   ```typescript
   // Código seguro
   const API_KEY = process.env.EXPO_PUBLIC_API_KEY; // ✅
   ```

### ⚠️ Pontos de Melhoria

Liste os problemas por prioridade:

1. **[Problema 1]**
   - **Severidade:** Alta/Média
   - **Localização:** [Arquivos afetados]
   - **Risco:** [Descrição]
   - **Recomendação:** [Ação]

2. **[Problema 2]**
   - **Severidade:** Alta/Média
   - **Localização:** [Arquivos afetados]
   - **Risco:** [Descrição]
   - **Recomendação:** [Ação]

### 📈 Métricas de Segurança

#### Vulnerabilidades em dependências

```
┌─────────────────────┬──────────┐
│ Severidade          │ Contagem │
├─────────────────────┼──────────┤
│ 🔴 Crítica          │ XX       │
│ 🟠 Alta             │ XX       │
│ 🟡 Média            │ XX       │
│ 🟢 Baixa            │ XX       │
└─────────────────────┴──────────┘
```

#### Segredos detectados

- **Chaves de API hardcoded:** XX (alvo: 0)
- **Tokens hardcoded:** XX (alvo: 0)
- **Senhas hardcoded:** XX (alvo: 0)
- **Chaves privadas no repositório:** XX (alvo: 0)

#### Permissões

- **Total de permissões solicitadas:** XX
- **Permissões sensíveis:** XX
- **Permissões não justificadas:** XX (alvo: 0)

#### Armazenamento

- **Uso de SecureStore/Keychain:** Sim/Não
- **Dados sensíveis no AsyncStorage:** XX ocorrências (alvo: 0)
- **Biometria configurada:** Sim/Não

#### Comunicação

- **Endpoints HTTP (inseguros):** XX (alvo: 0)
- **Endpoints HTTPS:** XX
- **Certificate pinning:** Sim/Não
- **Tráfego em texto simples permitido:** Sim/Não (alvo: Não)

### 🎯 TOP 3 AÇÕES PRIORITÁRIAS

#### 1. [AÇÃO DE SEGURANÇA #1]
- **Esforço:** Baixo/Médio/Alto
- **Impacto:** CRÍTICO/Alto/Médio
- **Risco se não corrigido:** [Descrição do risco]
- **Descrição:** [Detalhe da vulnerabilidade]
- **Solução:** [Ação concreta e código]
- **Arquivos afetados:**
  - `[arquivo1]` - [problema]
  - `[arquivo2]` - [problema]
- **Exemplo de correção:**
```typescript
// ANTES (vulnerável)
[código vulnerável]

// DEPOIS (seguro)
[código seguro]
```

#### 2. [AÇÃO DE SEGURANÇA #2]
- **Esforço:** Baixo/Médio/Alto
- **Impacto:** CRÍTICO/Alto/Médio
- **Risco se não corrigido:** [Descrição]
- **Descrição:** [Detalhe]
- **Solução:** [Ação]
- **Arquivos afetados:** [Lista]

#### 3. [AÇÃO DE SEGURANÇA #3]
- **Esforço:** Baixo/Médio/Alto
- **Impacto:** CRÍTICO/Alto/Médio
- **Risco se não corrigido:** [Descrição]
- **Descrição:** [Detalhe]
- **Solução:** [Ação]
- **Arquivos afetados:** [Lista]

---

## 🛡️ Checklist de Segurança Mobile OWASP

Referência: [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)

- [ ] **M1: Uso Inadequado da Plataforma** - Uso correto das APIs da plataforma
- [ ] **M2: Armazenamento de Dados Inseguro** - Armazenamento seguro (SecureStore/Keychain)
- [ ] **M3: Comunicação Insegura** - HTTPS + Certificate Pinning
- [ ] **M4: Autenticação Insegura** - Autenticação robusta com JWT
- [ ] **M5: Criptografia Insuficiente** - Sem criptografia customizada, usar APIs da plataforma
- [ ] **M6: Autorização Insegura** - Autorização validada no lado do servidor
- [ ] **M7: Qualidade do Código do Cliente** - Código de qualidade, ofuscado em produção
- [ ] **M8: Adulteração de Código** - Proteção contra modificação (detecção de jailbreak)
- [ ] **M9: Engenharia Reversa** - Ofuscação e proteção do código
- [ ] **M10: Funcionalidade Estranha** - Sem backdoors ou logs de debug em produção

---

## 🚀 Recomendações

### Ações imediatas (hoje)
1. Corrigir todas as vulnerabilidades CRÍTICAS
2. Remover todos os segredos hardcoded
3. Executar `npm audit fix` para vulnerabilidades corrigíveis automaticamente

### Ações de curto prazo (esta semana)
1. Implementar SecureStore para todos os tokens
2. Habilitar apenas HTTPS (bloquear HTTP)
3. Adicionar .env ao .gitignore se ausente
4. Atualizar dependências vulneráveis

### Ações de médio prazo (este mês)
1. Implementar certificate pinning
2. Habilitar ofuscação em produção
3. Auditoria completa de permissões
4. Treinamento da equipe em boas práticas

### Ferramentas recomendadas

```bash
# Instalar ferramentas de segurança
npm install --save-dev @react-native-community/cli-doctor
npm audit

# Para iOS
gem install fastlane

# Para Android
# Usar ProGuard/R8 (já incluído)
```

---

## 📚 Referências

- `.claude/rules/11-security.md` - Padrões de segurança
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)

---

**Pontuação final: XX/25**

**⚠️ AVISO: Uma pontuação < 15/25 em segurança exige ação imediata antes de qualquer implantação em produção.**
