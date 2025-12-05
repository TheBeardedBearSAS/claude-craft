# Checklist de Auditoria de Segurança

## Dados Sensíveis

- [ ] Tokens em flutter_secure_storage
- [ ] Sem senhas em SharedPreferences
- [ ] Sem secrets hardcoded
- [ ] .env no .gitignore
- [ ] Obfuscação habilitada em prod

## API & Rede

- [ ] Apenas HTTPS
- [ ] Certificate pinning implementado
- [ ] Timeouts configurados
- [ ] Estratégia segura de retry
- [ ] Tratamento de erros de rede

## Autenticação

- [ ] Tokens JWT seguros
- [ ] Refresh token implementado
- [ ] Logout limpo
- [ ] Timeout de sessão
- [ ] Biometria se disponível

## Validação

- [ ] Validação client-side
- [ ] Validação server-side
- [ ] Sanitização de inputs
- [ ] Prevenção XSS
- [ ] Prevenção SQL injection

## Permissões

- [ ] Permissões mínimas
- [ ] Solicitação no momento certo
- [ ] Tratamento de negação
- [ ] Documentação de permissões

## Produção

- [ ] ProGuard/R8 configurado
- [ ] Símbolos enviados
- [ ] Logs de produção desabilitados
- [ ] Rastreamento de erros configurado
