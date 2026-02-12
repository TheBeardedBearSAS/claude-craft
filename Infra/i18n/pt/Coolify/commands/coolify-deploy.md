---
description: Deploy application to Coolify
argument-hint: [arguments]
---

# Coolify Deploy

Voce e um especialista em deploy Coolify. Voce deve guiar o deploy de uma aplicacao em uma instancia Coolify PaaS auto-hospedada.

## Arguments
$ARGUMENTS

Argumentos:
- Nome ou repositorio da aplicacao
- (Opcional) Ambiente: production, staging, preview
- (Opcional) Branch: main, develop, feature/*

Exemplo: `/coolify:deploy "my-app" env:production branch:main` ou `/coolify:deploy . env:staging`

## MISSAO

### Etapa 1: Verificar Pre-requisitos

```
══════════════════════════════════════════════════════════════
DEPLOY COOLIFY
══════════════════════════════════════════════════════════════

Aplicacao: {name}
Ambiente: {production/staging/preview}
Branch: {branch}

──────────────────────────────────────────────────────────────
VERIFICACAO DE PRE-REQUISITOS
──────────────────────────────────────────────────────────────

| Pre-requisito | Status | Detalhes |
|---------------|--------|---------|
| Instancia Coolify | {OK/FALHA} | {url} |
| Git provider | {OK/FALHA} | {GitHub/GitLab/Bitbucket} |
| Registros DNS | {OK/FALHA} | {dominio} → {ip} |
| Capacidade SSL | {OK/FALHA} | {Let's Encrypt / custom} |
| Configuracao de build | {OK/FALHA} | {Nixpacks/Dockerfile/Compose} |
```

### Etapa 2: Configurar Conexao do Git Provider

```
──────────────────────────────────────────────────────────────
CONFIGURACAO DO GIT PROVIDER
──────────────────────────────────────────────────────────────

Provedor: {GitHub / GitLab / Bitbucket}

### GitHub App (Recomendado)
1. Coolify Dashboard > Sources > Add
2. Selecionar "GitHub App"
3. Autorizar Coolify GitHub App
4. Selecionar repositorios para conceder acesso
5. Verificar entrega de webhook: GitHub > Settings > GitHub Apps > Recent deliveries

### GitLab (Deploy Key)
1. Coolify Dashboard > Sources > Add
2. Selecionar "GitLab"
3. Copiar chave publica SSH gerada
4. GitLab > Repository > Settings > Repository > Deploy Keys > Add
5. Configurar webhook:
   - URL: https://coolify.example.com/webhooks/source/gitlab
   - Secret: {do Coolify}
   - Triggers: Push events, Merge request events

Status: {configurado / necessita configuracao}
```

### Etapa 3: Definir Variaveis de Ambiente

```
──────────────────────────────────────────────────────────────
VARIAVEIS DE AMBIENTE
──────────────────────────────────────────────────────────────

### Variaveis Obrigatorias
| Variavel | Valor | Tipo |
|----------|-------|------|
| {VAR_NAME} | {valor ou instrucao} | Build / Runtime |

### Conexao com Banco de Dados
DATABASE_URL=postgresql://{user}:{password}@{host}:5432/{database}
→ Usar referencia de servico Coolify: $SERVICE_URL_POSTGRES

### Conexao com Cache
REDIS_URL=redis://{host}:6379
→ Usar referencia de servico Coolify: $SERVICE_URL_REDIS

### Secrets
{SECRET_NAME}={instrucao para gerar}
→ openssl rand -hex 32

### Variaveis Compartilhadas (entre ambientes)
Configurar em: Settings > Shared Variables
```

### Etapa 4: Escolher e Configurar Build Pack

```
──────────────────────────────────────────────────────────────
CONFIGURACAO DE BUILD
──────────────────────────────────────────────────────────────

Build Pack: {Nixpacks / Dockerfile / Docker Compose}

### Configuracao Nixpacks
| Configuracao | Valor |
|--------------|-------|
| Base Directory | {/} |
| Build Command | {auto-detectado ou custom} |
| Start Command | {auto-detectado ou custom} |
| Install Command | {auto-detectado ou custom} |
| Port | {auto-detectado ou custom} |

### Configuracao Dockerfile
| Configuracao | Valor |
|--------------|-------|
| Dockerfile Location | {./Dockerfile} |
| Build Target | {production} |
| Build Args | {KEY=value} |
| Port | {do EXPOSE ou manual} |

### Configuracao Docker Compose
| Configuracao | Valor |
|--------------|-------|
| Compose File | {./docker-compose.yml} |
| Services | {lista de servicos para deploy} |
```

### Etapa 5: Configurar Dominio e SSL

```
──────────────────────────────────────────────────────────────
CONFIGURACAO DE DOMINIO & SSL
──────────────────────────────────────────────────────────────

### Configuracao de Dominio
| Configuracao | Valor |
|--------------|-------|
| Dominio | {app.example.com} |
| Force HTTPS | Sim |
| WWW Redirect | {Sim/Nao} |
| Port | {porta da aplicacao} |

### Certificado SSL
Metodo: {Let's Encrypt HTTP / Let's Encrypt DNS / Custom}

Para HTTP challenge (padrao):
- Automatico, sem configuracao extra necessaria
- Porta 80 deve estar acessivel

Para DNS challenge (wildcard):
- Provedor: {Cloudflare / DigitalOcean / Hetzner}
- Token da API: {configurado nas configuracoes do Coolify}
- Dominio wildcard: *.example.com

### Deployments de Preview (opcional)
- Habilitar: {Sim/Nao}
- Padrao de dominio: pr-{{PR_NUMBER}}.preview.example.com
- DNS: *.preview.example.com → {server-ip}
```

### Etapa 6: Acionar Deploy e Verificar

```
──────────────────────────────────────────────────────────────
DEPLOY
──────────────────────────────────────────────────────────────

### Metodo de Deploy
Opcao A: Git Push (automatico)
  git push origin {branch}
  → Webhook aciona build + deploy no Coolify

Opcao B: Manual (Dashboard Coolify)
  Dashboard > Service > Deploy

Opcao C: API
  curl -X POST https://coolify.example.com/api/v1/deploy \
    -H "Authorization: Bearer {api-token}" \
    -H "Content-Type: application/json" \
    -d '{"uuid": "{service-uuid}"}'

### Verificacao de Saude
# Aguardar conclusao do deploy
# Verificar logs de deploy no Dashboard Coolify

# Verificar saude da aplicacao
curl -s -o /dev/null -w "%{http_code}" https://{dominio}/health

# Verificar certificado SSL
openssl s_client -connect {dominio}:443 -servername {dominio} 2>/dev/null | \
  openssl x509 -noout -dates

# Smoke test rapido
curl -s https://{dominio}/
```

### Etapa 7: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE DEPLOY
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
STATUS DO DEPLOY
──────────────────────────────────────────────────────────────

| Item | Status |
|------|--------|
| Build | {SUCESSO / FALHA} |
| Deploy | {SUCESSO / FALHA} |
| Health Check | {PASSANDO / FALHANDO} |
| SSL | {VALIDO / INVALIDO} |

──────────────────────────────────────────────────────────────
URLS
──────────────────────────────────────────────────────────────

| Ambiente | URL |
|----------|-----|
| Producao | https://{dominio} |
| Dashboard Coolify | https://coolify.example.com |
| Logs de Deploy | https://coolify.example.com/project/... |

──────────────────────────────────────────────────────────────
INSTRUCOES DE ROLLBACK
──────────────────────────────────────────────────────────────

Se problemas forem encontrados:
1. Dashboard > Service > Deployments
2. Selecionar deploy anterior bem-sucedido
3. Clicar "Rollback"

Ou via Git:
  git revert HEAD
  git push origin {branch}

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Verificar todos os endpoints funcionais
2. [ ] Executar migracoes de banco de dados (se aplicavel)
3. [ ] Configurar monitoramento com /coolify:backup
4. [ ] Configurar deployments de preview (se nao feito)
5. [ ] Documentar deploy no README do projeto
```
