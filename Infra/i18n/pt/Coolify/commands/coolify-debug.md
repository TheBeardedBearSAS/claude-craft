---
description: Diagnose Coolify deployment issues
argument-hint: [arguments]
---

# Diagnostico Coolify

Voce e um especialista em debug Coolify. Voce deve diagnosticar e resolver problemas de deploy e runtime no Coolify PaaS auto-hospedado.

## Arguments
$ARGUMENTS

Argumentos:
- Sintoma ou mensagem de erro
- (Opcional) Nome do servico
- (Opcional) Contexto: build, runtime, networking, ssl

Exemplo: `/coolify:debug "502 Bad Gateway em app.example.com"` ou `/coolify:debug "Build falha com OOM" service:api`

## MISSAO

### Etapa 1: Coletar Sintomas

```
══════════════════════════════════════════════════════════════
DIAGNOSTICO COOLIFY
══════════════════════════════════════════════════════════════

Servico: {nome}
Tipo: {Application / Database / Docker Compose}
Build Pack: {Nixpacks / Dockerfile / Compose}

──────────────────────────────────────────────────────────────
SINTOMA REPORTADO
──────────────────────────────────────────────────────────────

{descricao do problema}

### Classificacao do Sintoma
| Categoria | Probabilidade |
|-----------|---------------|
| Falha de build | {Alta/Media/Baixa} |
| Erro de runtime | {Alta/Media/Baixa} |
| Rede | {Alta/Media/Baixa} |
| SSL/TLS | {Alta/Media/Baixa} |
| Webhook/Git | {Alta/Media/Baixa} |
| Armazenamento | {Alta/Media/Baixa} |
```

### Etapa 2: Verificar Status do Deploy e Logs

```bash
# Verificar servicos Coolify
docker ps --filter "name=coolify" --format "table {{.Names}}\t{{.Status}}"

# Verificar containers da aplicacao
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs da aplicacao (do dashboard Coolify ou CLI)
docker logs <container-name> --tail 200 2>&1

# Logs do proxy Traefik
docker logs coolify-proxy --tail 100 2>&1 | grep -i "error\|warn"

# Recursos do sistema
free -h
df -h /var/lib/docker
```

```
──────────────────────────────────────────────────────────────
STATUS DO DEPLOY
──────────────────────────────────────────────────────────────

| Verificacao | Resultado | Detalhes |
|-------------|-----------|---------|
| Estado do container | {rodando/parado/reiniciando} | {uptime ou codigo de saida} |
| Health check | {saudavel/nao saudavel/nenhum} | {resultado da ultima verificacao} |
| Rota Traefik | {ativa/ausente} | {status do roteamento do dominio} |
| Ultimo deploy | {sucesso/falha} | {timestamp} |
| Recursos | {OK/aviso} | CPU: {%}, RAM: {usado/total} |
| Disco | {OK/aviso} | {usado/total} ({percentual}) |
```

### Etapa 3: Verificar Status do Container

```bash
# Inspecao detalhada do container
docker inspect <container-name> --format='
  State: {{.State.Status}}
  Exit Code: {{.State.ExitCode}}
  OOM Killed: {{.State.OOMKilled}}
  Started: {{.State.StartedAt}}
  Finished: {{.State.FinishedAt}}
  Restarts: {{.RestartCount}}
'

# Processos do container
docker exec <container-name> ps aux 2>/dev/null || echo "Nao e possivel exec (container nao esta rodando)"

# Uso de recursos do container
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

### Etapa 4: Verificar Rede

```bash
# Resolucao DNS
dig +short {dominio}
nslookup {dominio} 8.8.8.8

# Acessibilidade de porta (externo)
curl -s -o /dev/null -w "%{http_code}" https://{dominio}
curl -s -o /dev/null -w "%{http_code}" http://{dominio}

# Roteamento Traefik
docker logs coolify-proxy 2>&1 | grep "{dominio}"

# Conectividade interna (do container)
docker exec <container-name> wget -q -O- http://localhost:{porta}/health 2>/dev/null

# Verificar firewall
sudo ufw status verbose
```

### Etapa 5: Verificar SSL e Let's Encrypt

```bash
# Detalhes do certificado
openssl s_client -connect {dominio}:443 -servername {dominio} 2>/dev/null | \
  openssl x509 -noout -dates -subject -issuer

# Logs do Let's Encrypt
docker logs coolify-proxy 2>&1 | grep -i "acme\|certificate\|letsencrypt"

# Armazenamento ACME
docker exec coolify-proxy cat /data/acme.json 2>/dev/null | jq '.[] | keys'

# Verificacao de DNS challenge (se wildcard)
dig TXT _acme-challenge.{dominio}
```

### Etapa 6: Verificar Webhooks e Integracao Git

```
──────────────────────────────────────────────────────────────
STATUS GIT & WEBHOOK
──────────────────────────────────────────────────────────────

### GitHub App
- Verificar: GitHub > Settings > Applications > Coolify
- Entregas recentes: Settings > Developer settings > GitHub Apps > Advanced
- Verificar: repositorio tem o app Coolify instalado

### Entrega de Webhook
| Verificacao | Status |
|-------------|--------|
| URL do webhook acessivel | {sim/nao} |
| Status da entrega recente | {sucesso/falha} |
| Codigo de resposta | {200/404/500} |
| Branch correspondente | {sim/nao} |
| Auto-deploy habilitado | {sim/nao} |

### Teste de Acionamento Manual
curl -X POST https://coolify.example.com/api/v1/deploy \
  -H "Authorization: Bearer {token}" \
  -d '{"uuid": "{service-uuid}"}'
```

### Etapa 7: Propor Correcao

```
──────────────────────────────────────────────────────────────
DIAGNOSTICO
──────────────────────────────────────────────────────────────

### Causa Raiz
{descricao da causa raiz}

### Evidencias
- {evidencia 1}
- {evidencia 2}

──────────────────────────────────────────────────────────────
SOLUCAO
──────────────────────────────────────────────────────────────

### Hipotese 1: {Mais Provavel}
**Causa**: {descricao}
**Correcao**:
\`\`\`bash
{comandos de resolucao}
\`\`\`

### Hipotese 2: {Alternativa}
**Causa**: {descricao}
**Correcao**:
\`\`\`bash
{comandos de resolucao}
\`\`\`

──────────────────────────────────────────────────────────────
PREVENCAO
──────────────────────────────────────────────────────────────

Para evitar este problema no futuro:
- [ ] {Recomendacao 1}
- [ ] {Recomendacao 2}
- [ ] {Recomendacao 3}

──────────────────────────────────────────────────────────────
COMANDOS UTEIS
──────────────────────────────────────────────────────────────

# Refazer deploy do servico
# Dashboard > Service > Deploy (ou Rebuild without cache)

# Reiniciar proxy Traefik
docker restart coolify-proxy

# Limpar recursos Docker
docker system prune -af

# Verificar saude de todos os containers
docker ps --format "{{.Names}}: {{.Status}}" | sort
```

## Checklist de Diagnostico

### Informacoes Basicas
- [ ] Mensagem de erro exata ou sintoma anotado
- [ ] Hora de inicio do problema identificada
- [ ] Mudancas recentes revisadas (deploy, config, DNS)
- [ ] Reprodutibilidade confirmada

### Ambiente
- [ ] Versao do Coolify verificada
- [ ] Recursos do servidor verificados (RAM, disco, CPU)
- [ ] Status do Docker verificado
- [ ] Conectividade de rede testada

### Verificacoes Realizadas
- [ ] Logs de deploy analisados
- [ ] Estado do container verificado
- [ ] Roteamento Traefik verificado
- [ ] Resolucao DNS confirmada
- [ ] Certificado SSL validado
- [ ] Entrega de webhooks verificada
