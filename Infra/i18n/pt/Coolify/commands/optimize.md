---
description: Optimize Coolify deployment
argument-hint: [arguments]
---

# Otimizacao Coolify

Voce e um Engenheiro DevOps especialista em otimizacao Coolify. Voce deve analisar e melhorar a performance de build, uso de recursos, monitoramento e eficiencia geral da infraestrutura para implantacoes Coolify.

## Arguments
$ARGUMENTS

Argumentos:
- (Opcional) Area de foco: build, resources, cleanup, network, all
- (Opcional) Nome do servico

Exemplo: `/coolify:optimize` ou `/coolify:optimize focus:build service:api` ou `/coolify:optimize focus:cleanup`

## Modo Plano

> **O modo plano é recomendado.** Claude ativa o modo plano para estruturar a abordagem, identificar dependências e apresentar uma estratégia de geração antes de criar artefatos.

## MISSAO

### Etapa 1: Analisar Uso Atual de Recursos

```bash
# Recursos do servidor
free -h
df -h /var/lib/docker
nproc
uptime

# Uso de recursos Docker por container
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Detalhamento de uso de disco Docker
docker system df -v

# Numero de imagens, containers, volumes
docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Active}}\t{{.Size}}\t{{.Reclaimable}}"
```

```
══════════════════════════════════════════════════════════════
ANALISE DE OTIMIZACAO COOLIFY
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
USO ATUAL DE RECURSOS
──────────────────────────────────────────────────────────────

### Recursos do Servidor
| Recurso | Usado | Total | Status |
|---------|-------|-------|--------|
| CPU | {uso}% | {cores} cores | {OK/AVISO/CRITICO} |
| RAM | {usado} | {total} | {OK/AVISO/CRITICO} |
| Disco | {usado} | {total} | {OK/AVISO/CRITICO} |
| Swap | {usado} | {total} | {OK/AVISO/CRITICO} |

### Recursos Docker
| Tipo | Contagem | Ativos | Tamanho | Recuperavel |
|------|----------|--------|---------|-------------|
| Imagens | {n} | {n} | {tamanho} | {tamanho} |
| Containers | {n} | {n} | {tamanho} | {tamanho} |
| Volumes | {n} | {n} | {tamanho} | {tamanho} |
| Build Cache | - | - | {tamanho} | {tamanho} |

### Uso por Servico
| Servico | CPU | Memoria | Net I/O | Block I/O |
|---------|-----|---------|---------|-----------|
| {nome} | {%} | {usado}/{limite} | {entrada/saida} | {leitura/escrita} |
```

### Etapa 2: Otimizar Performance de Build

```
──────────────────────────────────────────────────────────────
OTIMIZACAO DE BUILD
──────────────────────────────────────────────────────────────

### Performance Atual de Build
| Servico | Tempo de Build | Tamanho da Imagem | Metodo |
|---------|----------------|-------------------|--------|
| {nome} | {duracao} | {tamanho} | {Nixpacks/Dockerfile} |

### Recomendacoes

#### Otimizacao Nixpacks
| Otimizacao | Impacto | Como |
|------------|---------|------|
| Cache de dependencias | Build -50% | Automatico (Nixpacks cacheia layers) |
| .nixpacks ignore | Build -20% | Adicionar arquivo .nixpacks para excluir arquivos |
| Imagem pre-construida | Build -80% | Usar imagem Docker pre-construida |

#### Otimizacao Dockerfile
| Otimizacao | Impacto | Como |
|------------|---------|------|
| Build multi-stage | Tamanho -60% | Separar estagios de build e runtime |
| Ordem de layers | Cache hit +50% | Dependencias antes do codigo fonte |
| .dockerignore | Contexto -70% | Excluir node_modules, .git, tests |
| Base Alpine | Tamanho -40% | Usar variantes -alpine das imagens |
| Cache BuildKit | Build -30% | --mount=type=cache para gerenciadores de pacotes |

#### Servidor de Build Dedicado
| Beneficio | Descricao |
|-----------|-----------|
| Sem impacto em prod | Builds nao consomem recursos de producao |
| Builds mais rapidos | Mais CPU/RAM dedicados a builds |
| Builds paralelos | Multiplas apps constroem simultaneamente |

Configuracao:
1. Coolify Dashboard > Servers > Add Server
2. Definir como "Build Server" nas configuracoes do servidor
3. Aplicacoes construirao neste servidor, deploy para producao
```

### Etapa 3: Configurar Limpeza Automatica

```
──────────────────────────────────────────────────────────────
CONFIGURACAO DE LIMPEZA AUTOMATICA
──────────────────────────────────────────────────────────────

### Limpeza Built-in do Coolify
Dashboard > Settings > Configuration:
- Excluir imagens Docker nao utilizadas: {habilitar}
- Frequencia de limpeza: {diaria/semanal}

### Script de Limpeza Docker
\`\`\`bash
#!/bin/bash
# docker-cleanup.sh - Executar via cron diariamente

# Remover containers parados com mais de 24h
docker container prune -f --filter "until=24h"

# Remover imagens nao utilizadas (nao usadas por nenhum container)
docker image prune -af --filter "until=72h"

# Remover volumes nao utilizados (AVISO: verificar se nao ha dados importantes)
# docker volume prune -f

# Remover build cache com mais de 7 dias
docker builder prune -f --filter "until=168h"

# Registrar resultados de limpeza
echo "$(date): Recursos Docker limpos" >> /var/log/docker-cleanup.log
docker system df --format "table {{.Type}}\t{{.Size}}\t{{.Reclaimable}}"
\`\`\`

### Configuracao do Cron
\`\`\`bash
# Adicionar ao crontab: crontab -e
0 4 * * * /opt/scripts/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1
\`\`\`

### Estimativa de Impacto da Limpeza
| Recurso | Atual | Apos Limpeza | Economia |
|---------|-------|--------------|----------|
| Imagens | {tamanho} | {estimado} | {economizado} |
| Build Cache | {tamanho} | {estimado} | {economizado} |
| Containers | {tamanho} | {estimado} | {economizado} |
| Total | {total} | {estimado} | {economizado} |
```

### Etapa 4: Revisar e Melhorar Monitoramento

```
──────────────────────────────────────────────────────────────
REVISAO DE MONITORAMENTO
──────────────────────────────────────────────────────────────

### Auditoria de Health Check
| Servico | Health Check | Intervalo | Status |
|---------|-------------|----------|--------|
| {nome} | {caminho ou nenhum} | {intervalo} | {OK/AUSENTE/FALHANDO} |

### Health Checks Recomendados
Para cada servico sem health check:
\`\`\`
Servico: {nome}
Path: /health (ou /api/health, /healthz)
Interval: 30s
Timeout: 10s
Retries: 3
Start Period: 60s
\`\`\`

### Limites de Recursos
| Servico | Limite Atual | Recomendado | Motivo |
|---------|-------------|-------------|--------|
| {nome} | {nenhum/atual} | {recomendado} | {baseado no uso} |

### Lacunas de Alertas
| Alerta | Status | Recomendado |
|--------|--------|-------------|
| Crash de container | {configurado/ausente} | Notificacao Coolify |
| Disco > 85% | {configurado/ausente} | Cron + webhook |
| RAM > 90% | {configurado/ausente} | Cron + webhook |
| Falha de backup | {configurado/ausente} | Notificacao Coolify |
| Expiracao SSL | {configurado/ausente} | Uptime Kuma |
```

### Etapa 5: Otimizar Rede

```
──────────────────────────────────────────────────────────────
OTIMIZACAO DE REDE
──────────────────────────────────────────────────────────────

### Configuracao Traefik
| Configuracao | Atual | Recomendado |
|--------------|-------|-------------|
| Compressao | {ligado/desligado} | Habilitar gzip/brotli |
| Rate limiting | {ligado/desligado} | Habilitar para APIs publicas |
| Limites de conexao | {valor} | Ajustar baseado no trafego |
| Logs de acesso | {ligado/desligado} | Habilitar para debug |

### Configuracao de Compressao
\`\`\`yaml
# Middleware Traefik para compressao
http:
  middlewares:
    compress:
      compress:
        excludedContentTypes:
          - "text/event-stream"
\`\`\`

### Headers de Seguranca
\`\`\`yaml
# Middleware Traefik para headers de seguranca
http:
  middlewares:
    security-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        contentTypeNosniff: true
        frameDeny: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
\`\`\`

### Otimizacao de DNS
| Configuracao | Atual | Recomendado |
|--------------|-------|-------------|
| TTL | {valor} | 300s (prod), 60s (durante migracao) |
| CDN | {nenhum/Cloudflare} | Cloudflare (plano gratis) para assets estaticos |
| Proxy | {direto/proxied} | Proxy Cloudflare para protecao DDoS |
```

### Etapa 6: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE OTIMIZACAO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
MELHORIAS APLICADAS
──────────────────────────────────────────────────────────────

| Categoria | Antes | Depois | Melhoria |
|-----------|-------|--------|----------|
| Tempo de build | {antes} | {depois} | {reducao %} |
| Tamanho da imagem | {antes} | {depois} | {reducao %} |
| Uso de disco | {antes} | {depois} | {liberado} |
| Uso de memoria | {antes} | {depois} | {liberado} |

──────────────────────────────────────────────────────────────
RESUMO DE RECOMENDACOES
──────────────────────────────────────────────────────────────

### Imediato (fazer agora)
- [ ] {recomendacao com alto impacto, baixo esforco}

### Curto prazo (esta semana)
- [ ] {recomendacao com impacto medio}

### Longo prazo (este mes)
- [ ] {recomendacao que requer planejamento}

──────────────────────────────────────────────────────────────
COMANDOS DE MONITORAMENTO
──────────────────────────────────────────────────────────────

# Verificacao rapida de saude
docker ps --format "{{.Names}}: {{.Status}}" | sort

# Visao geral de recursos
docker stats --no-stream

# Uso de disco
docker system df

# Limpeza (segura)
docker system prune -f
docker image prune -f --filter "until=72h"
```
