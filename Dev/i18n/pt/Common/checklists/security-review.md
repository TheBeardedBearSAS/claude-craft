# Checklist de Revisão de Segurança

## OWASP Top 10 (2021)

### A01:2021 - Controle de Acesso Quebrado

- [ ] Verificação de autorização em cada endpoint
- [ ] Sem acesso direto a objetos por ID sem verificação
- [ ] CORS configurado corretamente
- [ ] Tokens JWT validados no servidor
- [ ] Princípio do menor privilégio aplicado
- [ ] Não há possibilidade de escalação de privilégio

### A02:2021 - Falhas Criptográficas

- [ ] Dados sensíveis criptografados em repouso
- [ ] Dados sensíveis criptografados em trânsito (HTTPS)
- [ ] Algoritmos de criptografia atualizados (sem MD5, SHA1)
- [ ] Chaves de criptografia armazenadas com segurança
- [ ] Senhas com hash bcrypt/argon2
- [ ] Sem secrets no código-fonte

### A03:2021 - Injeção

- [ ] Queries SQL parametrizadas (prepared statements)
- [ ] Validação e sanitização de entrada
- [ ] Escape de saída (XSS)
- [ ] Sem avaliação de código dinâmico
- [ ] LDAP/XML/OS injection verificado
- [ ] Headers HTTP sanitizados

### A04:2021 - Design Inseguro

- [ ] Modelagem de ameaças realizada
- [ ] Rate limiting implementado
- [ ] Limites de recursos definidos
- [ ] Falhar com segurança (sem dados expostos em erro)
- [ ] Defesa em profundidade aplicada

### A05:2021 - Configuração Incorreta de Segurança

- [ ] Headers de segurança configurados (CSP, HSTS, X-Frame-Options)
- [ ] Modo debug desativado em produção
- [ ] Erros genéricos em produção (sem stack traces)
- [ ] Permissões de arquivo restritivas
- [ ] Serviços não utilizados desativados
- [ ] Versões de dependências atualizadas

### A06:2021 - Componentes Vulneráveis

- [ ] Auditoria de dependências realizada (npm audit, safety check)
- [ ] Sem vulnerabilidades críticas conhecidas
- [ ] Dependências atualizadas
- [ ] Fontes de pacotes verificadas
- [ ] Lockfile presente e atualizado

### A07:2021 - Falhas de Autenticação

- [ ] Política de senha robusta (12+ chars, complexidade)
- [ ] Proteção contra brute force
- [ ] MFA disponível/obrigatório para admins
- [ ] Sessão invalidada após logout
- [ ] Tokens com expiração razoável
- [ ] Sem credenciais padrão

### A08:2021 - Falhas de Integridade de Software e Dados

- [ ] Integridade do pipeline CI/CD verificada
- [ ] Assinaturas de pacotes verificadas
- [ ] Sem desserialização insegura
- [ ] SRI (Subresource Integrity) para CDNs
- [ ] Atualizações automáticas seguras

### A09:2021 - Falhas de Log e Monitoramento de Segurança

- [ ] Eventos de segurança logados (login, falhas, acessos)
- [ ] Logs protegidos contra modificação
- [ ] Sem dados sensíveis nos logs
- [ ] Alertas em eventos suspeitos
- [ ] Retenção de logs conforme

### A10:2021 - Server-Side Request Forgery (SSRF)

- [ ] URLs validadas no servidor
- [ ] Whitelist de domínios permitidos
- [ ] Sem acesso a metadados da nuvem
- [ ] Resolução DNS controlada

---

## Checklist por Componente

### API / Backend

- [ ] Autenticação em todos os endpoints sensíveis
- [ ] Autorização verificada (RBAC/ABAC)
- [ ] Validação de entrada rigorosa
- [ ] Encoding de saída
- [ ] Rate limiting por IP/usuário
- [ ] Timeouts configurados
- [ ] CORS restritivo

### Banco de Dados

- [ ] Acesso com conta de privilégio limitado
- [ ] Sem acesso direto da internet
- [ ] Criptografia de dados sensíveis
- [ ] Backups criptografados
- [ ] Auditoria de acessos ativada

### Frontend

- [ ] Content Security Policy (CSP)
- [ ] Sanitização de dados exibidos
- [ ] Sem secrets no código JS
- [ ] HTTPS forçado
- [ ] Cookies seguros (HttpOnly, Secure, SameSite)

### Mobile

- [ ] Certificate pinning
- [ ] Armazenamento seguro (Keychain/Keystore)
- [ ] Sem dados sensíveis em plain text
- [ ] Anti-tampering
- [ ] Ofuscação de código

### Infraestrutura

- [ ] Firewall configurado
- [ ] VPC/rede isolada
- [ ] Secrets em vault (não em env vars)
- [ ] Logs centralizados
- [ ] Monitoramento de segurança

---

## Testes de Segurança

### Testes Automatizados

- [ ] SAST (análise estática) passou
- [ ] DAST (análise dinâmica) passou
- [ ] Scan de dependências passou
- [ ] Scan de containers passou (se aplicável)

### Testes Manuais

- [ ] Teste de penetração (se mudança importante)
- [ ] Revisão de código de segurança
- [ ] Teste de cenários de ataque comuns

---

## Documentação de Segurança

- [ ] Política de segurança documentada
- [ ] Processo de resposta a incidentes
- [ ] Contato de segurança definido
- [ ] Política de divulgação responsável

---

## Decisão

- [ ] ✅ **Aprovado** - Sem problemas de segurança
- [ ] ⚠️ **Preocupações** - Pontos a verificar/melhorar
- [ ] ❌ **Bloqueado** - Vulnerabilidades críticas a corrigir
