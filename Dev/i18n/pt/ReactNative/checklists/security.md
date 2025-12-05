# Checklist: Segurança React Native

Use este checklist para garantir que sua aplicação React Native segue as melhores práticas de segurança.

---

## 🔐 Armazenamento de Dados

### Dados Sensíveis
- [ ] SecureStore (expo-secure-store) usado para tokens, senhas, chaves API
- [ ] AsyncStorage NUNCA usado para dados sensíveis
- [ ] Dados sensíveis NUNCA em localStorage (web)
- [ ] Dados criptografados quando necessário
- [ ] Dados sensíveis NUNCA em logs
- [ ] Dados sensíveis limpos ao fazer logout

### MMKV Storage
- [ ] MMKV usado para dados não sensíveis
- [ ] Encryption ativada no MMKV quando apropriado
- [ ] Keys de storage documentadas
- [ ] Dados expiram quando apropriado
- [ ] Storage limpo adequadamente

### Persistência
- [ ] State persistido NUNCA contém dados sensíveis
- [ ] Redux persist / Zustand persist configurado com segurança
- [ ] Blacklist para dados sensíveis configurada
- [ ] Dados criptografados antes de persistir (se sensíveis)

---

## 🔑 Autenticação e Autorização

### Tokens
- [ ] Access tokens armazenados no SecureStore
- [ ] Refresh tokens armazenados no SecureStore
- [ ] Tokens NUNCA armazenados em AsyncStorage
- [ ] Tokens incluídos em headers, não query params
- [ ] Tokens expiram e são renovados automaticamente
- [ ] Tokens limpos ao fazer logout

### Sessões
- [ ] Timeout de sessão implementado
- [ ] Logout automático após inatividade
- [ ] Renovação de sessão transparente
- [ ] Multi-device login gerenciado
- [ ] Logout força limpeza de dados

### Biometria
- [ ] Face ID / Touch ID / Fingerprint implementado quando disponível
- [ ] Fallback para PIN/senha disponível
- [ ] Biometria não substitui autenticação de servidor
- [ ] Permissões solicitadas adequadamente
- [ ] Erro de biometria tratado graciosamente

---

## 🌐 Comunicação de Rede

### HTTPS
- [ ] TODAS as comunicações sobre HTTPS (nunca HTTP)
- [ ] Certificate pinning implementado para APIs críticas
- [ ] Certificate validation não desabilitada
- [ ] Sem exceções SSL/TLS em produção

### API Security
- [ ] API keys NUNCA hardcoded
- [ ] API keys em variáveis de ambiente
- [ ] Bearer tokens em Authorization header
- [ ] CORS configurado apropriadamente no backend
- [ ] Rate limiting implementado
- [ ] Retry logic com backoff exponencial

### Interceptors
- [ ] Auth token anexado automaticamente em requests
- [ ] Token refresh automático em 401
- [ ] Logout automático em 403
- [ ] Erros de rede tratados adequadamente
- [ ] Request/response logging sem dados sensíveis

---

## 🛡️ Validação de Entrada

### Client-Side
- [ ] Todos os inputs do usuário validados
- [ ] Validação de formato (email, telefone, etc.)
- [ ] Validação de comprimento (min/max)
- [ ] Validação de tipo (string, number, etc.)
- [ ] Caracteres especiais escapados
- [ ] SQL injection prevenida (se queries locais)

### Server-Side
- [ ] Validação client-side replicada no servidor
- [ ] Server-side validation é autoritativa
- [ ] DTOs/schemas usados para validação
- [ ] Erros de validação retornados de forma segura

### Sanitização
- [ ] Dados de API sanitizados antes do uso
- [ ] HTML escapado antes de renderizar
- [ ] JavaScript injection prevenida
- [ ] XSS prevenido
- [ ] SQL injection prevenida

---

## 🔒 Permissões

### Solicitação
- [ ] Permissões solicitadas no momento do uso
- [ ] Justificativa clara fornecida ao usuário
- [ ] Permissões negadas tratadas graciosamente
- [ ] App funciona sem permissões opcionais
- [ ] Status de permissões verificado antes do uso

### Tipos
- [ ] Câmera: Justificativa no Info.plist (iOS)
- [ ] Galeria: Justificativa no Info.plist (iOS)
- [ ] Localização: Justificativa no Info.plist (iOS)
- [ ] Notificações: Opt-in, não opt-out
- [ ] Contatos: Apenas se absolutamente necessário
- [ ] Microfone: Justificativa no Info.plist (iOS)

---

## 📱 Proteção de Dados

### Dados do Usuário
- [ ] Dados pessoais criptografados em repouso
- [ ] Dados pessoais criptografados em trânsito
- [ ] Dados pessoais NUNCA logados
- [ ] Coleta de dados minimizada (apenas necessário)
- [ ] Opção de deletar dados fornecida

### GDPR/LGPD
- [ ] Consentimento explícito coletado
- [ ] Política de privacidade acessível
- [ ] Termos de uso acessíveis
- [ ] Direito ao esquecimento implementado
- [ ] Portabilidade de dados implementada
- [ ] Opt-out de tracking fornecido

### Backup
- [ ] Dados sensíveis excluídos de backups (iOS)
- [ ] allowBackup=false ou rules configuradas (Android)
- [ ] Auto-backup de dados sensíveis desabilitado

---

## 🖼️ UI/UX Security

### Inputs
- [ ] Senhas em campos secureTextEntry
- [ ] Copiar/colar desabilitado para senhas
- [ ] Keyboard type apropriado (email, phone, etc.)
- [ ] Autocomplete desabilitado para dados sensíveis
- [ ] PINs ofuscados durante digitação

### Screenshots
- [ ] Telas sensíveis ocultas em app switcher (iOS)
- [ ] FLAG_SECURE para telas sensíveis (Android)
- [ ] Dados sensíveis ocultos em background
- [ ] Screenshot listeners implementados se necessário

### Deep Linking
- [ ] URLs validados antes de abrir
- [ ] Parâmetros de deep link sanitizados
- [ ] Ações sensíveis requerem reautenticação
- [ ] Universal links configurados (iOS)
- [ ] App links configurados (Android)

---

## 🔐 Código e Build

### Configuração
- [ ] .env NUNCA commitado
- [ ] .env.example fornecido
- [ ] Secrets em variáveis de ambiente
- [ ] Configurações diferentes para dev/staging/prod
- [ ] API keys diferentes por ambiente

### Código
- [ ] Sem console.logs com dados sensíveis
- [ ] Sem debuggers em produção
- [ ] Sem TODOs com informações sensíveis
- [ ] Código ofuscado em produção
- [ ] Source maps não expostos em produção

### Dependências
- [ ] Dependências auditadas regularmente (npm audit)
- [ ] Vulnerabilidades conhecidas corrigidas
- [ ] Dependências atualizadas regularmente
- [ ] Dependências não confiáveis evitadas
- [ ] Lock file (package-lock.json) commitado

### Build
- [ ] ProGuard/R8 habilitado (Android)
- [ ] Bitcode habilitado (iOS)
- [ ] Symbols stripped em produção
- [ ] Debug mode desabilitado em produção
- [ ] Logging desabilitado em produção

---

## 🧪 Análise de Segurança

### Code Review
- [ ] Security code review realizado
- [ ] Dados sensíveis identificados e protegidos
- [ ] Vulnerabilidades comuns verificadas (OWASP Mobile Top 10)
- [ ] Autenticação e autorização revisadas
- [ ] Validação de entrada revisada

### Testes
- [ ] Testes de segurança automatizados
- [ ] Penetration testing realizado (se crítico)
- [ ] Man-in-the-middle attack testado
- [ ] Session hijacking testado
- [ ] XSS testado

### Ferramentas
- [ ] ESLint security plugins usados
- [ ] Dependências escaneadas (npm audit, Snyk)
- [ ] SAST tools usados se apropriado
- [ ] Mobile security framework usado (MobSF)

---

## 🚨 Monitoramento e Resposta

### Logging
- [ ] Eventos de segurança logados
- [ ] Tentativas de login falhadas logadas
- [ ] Acessos não autorizados logados
- [ ] Dados sensíveis NUNCA logados
- [ ] Logs centralizados e monitorados

### Monitoramento
- [ ] Crashes monitorados (Sentry, Bugsnag)
- [ ] Performance monitorada
- [ ] Comportamento anômalo detectado
- [ ] Alertas configurados para eventos críticos

### Resposta a Incidentes
- [ ] Plano de resposta a incidentes definido
- [ ] Equipe de segurança identificada
- [ ] Processo de notificação definido
- [ ] Rollback plan preparado
- [ ] Comunicação com usuários planejada

---

## 🔄 Atualizações e Patches

### Over-the-Air (OTA)
- [ ] CodePush ou EAS Update configurado
- [ ] Updates assinados digitalmente
- [ ] Updates podem ser revertidos
- [ ] Updates testados antes de publicar
- [ ] Rollout gradual implementado

### App Store Updates
- [ ] Patches de segurança priorizados
- [ ] Processo de release rápido para emergências
- [ ] Changelog menciona fixes de segurança
- [ ] Usuários notificados de updates críticos

---

## 📊 Checklist de Auditoria

### Trimestral
- [ ] Audit de dependências (npm audit)
- [ ] Review de permissões
- [ ] Review de armazenamento de dados
- [ ] Review de configurações de ambiente
- [ ] Testes de penetração (se aplicável)

### Pré-Release
- [ ] Security checklist completo
- [ ] Code review de segurança completo
- [ ] Testes de segurança executados
- [ ] Vulnerabilidades conhecidas corrigidas
- [ ] Configurações de produção verificadas

---

## ⚠️ OWASP Mobile Top 10

Verificar proteção contra:

- [ ] **M1: Uso Impróprio das Credenciais da Plataforma**
  - Keychain (iOS) e Keystore (Android) usados corretamente

- [ ] **M2: Armazenamento de Dados Inseguro**
  - Dados sensíveis no SecureStore, não em local inseguro

- [ ] **M3: Comunicação Insegura**
  - HTTPS para tudo, certificate pinning para APIs críticas

- [ ] **M4: Autenticação Insegura**
  - Autenticação forte, tokens seguros, sessões gerenciadas

- [ ] **M5: Criptografia Insuficiente**
  - Algoritmos modernos, keys gerenciadas com segurança

- [ ] **M6: Autorização Insegura**
  - Controles de acesso no backend, não apenas frontend

- [ ] **M7: Qualidade de Código Cliente**
  - Code review, testes, ferramentas de análise estática

- [ ] **M8: Adulteração de Código**
  - Detecção de jailbreak/root, proteção contra reverse engineering

- [ ] **M9: Engenharia Reversa**
  - Ofuscação de código, anti-tampering

- [ ] **M10: Funcionalidades Estranhas**
  - Backdoors removidos, debug code removido, logs de produção limpos

---

## 📚 Recursos

### Documentação
- [ ] OWASP Mobile Security Guide lido
- [ ] React Native Security Best Practices revisadas
- [ ] Expo Security Guide consultado
- [ ] Platform security guides (iOS/Android) consultados

### Ferramentas
- [ ] expo-secure-store documentação
- [ ] react-native-keychain avaliado
- [ ] react-native-mmkv com encryption
- [ ] Sentry ou Bugsnag para monitoramento

---

## ✅ Critérios de Aceitação

**Antes de lançar, garanta que:**

- [ ] Todos os dados sensíveis protegidos adequadamente
- [ ] Todas as comunicações sobre HTTPS
- [ ] Todas as entradas validadas e sanitizadas
- [ ] Todas as permissões justificadas e gerenciadas
- [ ] Code review de segurança completo
- [ ] Testes de segurança executados
- [ ] Monitoramento configurado
- [ ] Plano de resposta a incidentes em vigor

---

**Segurança não é um checklist único. É um processo contínuo. Revise regularmente e mantenha-se atualizado com as melhores práticas.**
