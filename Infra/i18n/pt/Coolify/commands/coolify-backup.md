---
description: Configure and manage Coolify backups
argument-hint: [arguments]
---

# Configuracao de Backup Coolify

Voce e um especialista em backup e recuperacao de desastres Coolify. Voce deve configurar estrategias de backup, testar restauracoes e documentar procedimentos de recuperacao para servicos gerenciados pelo Coolify.

## Arguments
$ARGUMENTS

Argumentos:
- Acao: audit, configure, test, restore
- (Opcional) Nome ou tipo do servico
- (Opcional) Provedor S3: backblaze, wasabi, aws, minio

Exemplo: `/coolify:backup audit` ou `/coolify:backup configure provider:backblaze` ou `/coolify:backup test service:postgres`

## MISSAO

### Etapa 1: Auditar Estado Atual de Backup

```bash
# Inventario de todos os servicos
docker ps --format "table {{.Names}}\t{{.Status}}" | sort

# Identificar bancos de dados
docker ps --filter "ancestor=postgres" --filter "ancestor=mysql" --filter "ancestor=mongo" --filter "ancestor=redis" --format "{{.Names}}"

# Verificar volumes existentes
docker volume ls --format "table {{.Name}}\t{{.Driver}}"

# Uso de disco atual
df -h /var/lib/docker
du -sh /var/lib/docker/volumes/* 2>/dev/null | sort -rh | head -20
```

```
══════════════════════════════════════════════════════════════
AUDITORIA DE BACKUP COOLIFY
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
INVENTARIO DE SERVICOS
──────────────────────────────────────────────────────────────

| Servico | Tipo | Tamanho dos Dados | Status do Backup |
|---------|------|-------------------|------------------|
| {nome} | {PostgreSQL/MySQL/Redis/App} | {tamanho} | {configurado/ausente} |

──────────────────────────────────────────────────────────────
STATUS ATUAL DE BACKUP
──────────────────────────────────────────────────────────────

| Item | Status | Detalhes |
|------|--------|---------|
| Armazenamento S3 | {configurado/ausente} | {nome do provedor ou N/A} |
| Backups de BD | {ativo/inativo} | {frequencia ou N/A} |
| Backups de volumes | {ativo/inativo} | {frequencia ou N/A} |
| Ultimo backup | {data} | {tamanho} |
| Retencao | {X dias} | {politica ou nenhuma} |
| Restauracao testada | {sim/nao/nunca} | {data do ultimo teste} |
```

### Etapa 2: Configurar Armazenamento Compativel com S3

```
──────────────────────────────────────────────────────────────
CONFIGURACAO DE ARMAZENAMENTO S3
──────────────────────────────────────────────────────────────

### Selecao de Provedor

| Provedor | Custo Mensal (50GB) | Egress | Melhor Para |
|----------|---------------------|--------|-------------|
| Backblaze B2 | $0.25 | Gratis via CF | Orcamento |
| Wasabi | $0.35 | Gratis | Sem taxas de egress |
| Hetzner | $0.25 | Incluso | Conformidade EU |
| AWS S3 | $1.15 | $0.09/GB | Ecossistema AWS |
| MinIO | Gratis (auto-host) | N/A | Controle total |

### Configuracao no Coolify
Dashboard > Settings > S3 Storage > Add New:

| Campo | Valor |
|-------|-------|
| Nome | {production-backups} |
| Endpoint | {URL do endpoint do provedor} |
| Bucket | {nome-do-bucket} |
| Regiao | {regiao} |
| Access Key | {access-key} |
| Secret Key | {secret-key} |

### Testar Conexao
→ Clicar "Test Connection" no dashboard Coolify
→ Verificar: arquivo de teste enviado e excluido com sucesso
```

### Etapa 3: Definir Agendamento e Retencao de Backup

```
──────────────────────────────────────────────────────────────
AGENDAMENTO DE BACKUP
──────────────────────────────────────────────────────────────

### Backups de Banco de Dados (Coolify Built-in)
Para cada servico de banco de dados:
Dashboard > Database > Backups

| Banco de Dados | Frequencia | Retencao | Destino S3 |
|----------------|------------|----------|------------|
| {PostgreSQL} | {expressao cron} | {N backups} | {nome do armazenamento} |
| {MySQL} | {expressao cron} | {N backups} | {nome do armazenamento} |
| {Redis} | {expressao cron} | {N backups} | {nome do armazenamento} |

Agendamentos comuns:
- Projeto pequeno: 0 3 * * *        (diario as 3 AM)
- Producao:        0 */6 * * *      (a cada 6 horas)
- Critico:         0 * * * *        (a cada hora)

### Backups de Volumes (Customizado)
Configurar via tarefa agendada do Coolify ou cron:

| Volume | Frequencia | Retencao | Metodo |
|--------|------------|----------|--------|
| {uploads} | Diario | 14 dias | tar + S3 |
| {config} | Semanal | 4 semanas | tar + S3 |

### Politica de Retencao

| Tipo de Backup | Manter | Armazenamento Estimado |
|----------------|--------|------------------------|
| BD por hora | 24 backups | {estimativa de tamanho} |
| BD diario | 30 backups | {estimativa de tamanho} |
| Volumes semanal | 4 backups | {estimativa de tamanho} |
| Completo mensal | 3 backups | {estimativa de tamanho} |
| Total | - | {estimativa total} |
| Custo mensal | - | {estimativa de custo} |
```

### Etapa 4: Testar Backup e Restauracao

```
──────────────────────────────────────────────────────────────
VERIFICACAO DE BACKUP
──────────────────────────────────────────────────────────────

### 1. Verificar se o Backup Existe
\`\`\`bash
# Listar backups recentes no S3
aws s3 ls s3://{bucket}/databases/ --recursive --human-readable | tail -5

# Ou pelo dashboard Coolify
# Database > Backups > View list
\`\`\`

### 2. Baixar e Verificar Integridade
\`\`\`bash
# Baixar ultimo backup
aws s3 cp s3://{bucket}/databases/postgresql/{latest}.sql.gz /tmp/

# Verificar se o arquivo nao esta corrompido
gunzip -t /tmp/{latest}.sql.gz && echo "Integridade OK" || echo "CORROMPIDO"
\`\`\`

### 3. Testar Restauracao de Banco de Dados
\`\`\`bash
# Criar banco de dados de teste
docker exec {postgres-container} psql -U {user} -c "CREATE DATABASE restore_test;"

# Restaurar backup
gunzip -c /tmp/{latest}.sql.gz | \
  docker exec -i {postgres-container} psql -U {user} -d restore_test

# Verificar dados
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public';"

# Verificacao de contagem de linhas
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT count(*) as rows FROM {main_table};"

# Limpar banco de dados de teste
docker exec {postgres-container} psql -U {user} -c "DROP DATABASE restore_test;"
\`\`\`

### 4. Testar Restauracao de Volume
\`\`\`bash
# Baixar backup de volume
aws s3 cp s3://{bucket}/volumes/{latest}.tar.gz /tmp/

# Restaurar para volume de teste
docker volume create test_restore
docker run --rm -v test_restore:/data -v /tmp:/backup:ro \
  alpine tar xzf /backup/{latest}.tar.gz -C /data

# Verificar conteudo
docker run --rm -v test_restore:/data alpine ls -la /data/

# Limpeza
docker volume rm test_restore
\`\`\`
```

### Etapa 5: Configurar Alertas

```
──────────────────────────────────────────────────────────────
CONFIGURACAO DE ALERTAS
──────────────────────────────────────────────────────────────

### Notificacoes do Coolify
Dashboard > Settings > Notifications:

| Canal | Tipo | Eventos |
|-------|------|---------|
| {Slack/Discord/Email} | {URL de webhook} | Sucesso/falha de backup |

### Script de Monitoramento de Backup
\`\`\`bash
#!/bin/bash
# check-backups.sh - Executar diariamente via cron

BUCKET="s3://{bucket}"
MAX_AGE_HOURS=24
WEBHOOK_URL="{slack-webhook-url}"

# Verificar idade do ultimo backup PostgreSQL
LATEST=$(aws s3 ls ${BUCKET}/databases/postgresql/ | sort | tail -1 | awk '{print $1" "$2}')
LATEST_EPOCH=$(date -d "$LATEST" +%s 2>/dev/null || echo 0)
NOW_EPOCH=$(date +%s)
AGE_HOURS=$(( (NOW_EPOCH - LATEST_EPOCH) / 3600 ))

if [ "$AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
  curl -s -X POST "$WEBHOOK_URL" \
    -d "{\"text\": \"ALERTA DE BACKUP: Backup PostgreSQL tem ${AGE_HOURS}h (max: ${MAX_AGE_HOURS}h)\"}"
fi
\`\`\`
```

### Etapa 6: Documentar Plano de Recuperacao de Desastres

```
══════════════════════════════════════════════════════════════
PLANO DE RECUPERACAO DE DESASTRES
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
METRICAS DE RECUPERACAO
──────────────────────────────────────────────────────────────

| Metrica | Alvo | Alcancado |
|---------|------|-----------|
| RPO (tolerancia a perda de dados) | {horas} | {horas} |
| RTO (tempo de recuperacao) | {horas} | {horas} |

──────────────────────────────────────────────────────────────
PROCEDIMENTOS DE RECUPERACAO
──────────────────────────────────────────────────────────────

### Recuperacao de Servico Unico
1. Identificar servico com falha no dashboard Coolify
2. Verificar logs de deploy para erro
3. Refazer deploy ou rollback para versao anterior
4. Se problema de dados: restaurar banco de dados do backup S3
Tempo: 15-30 minutos

### Recuperacao Completa do Servidor
1. Provisionar novo VPS (mesmas specs)
2. Instalar Coolify
3. Configurar conexao de armazenamento S3
4. Restaurar bancos de dados a partir do backup
5. Reconectar fontes Git e refazer deploy das apps
6. Atualizar registros DNS
Tempo: 1-2 horas

──────────────────────────────────────────────────────────────
RESUMO DE BACKUP
──────────────────────────────────────────────────────────────

| Componente | Agendamento | Retencao | Caminho S3 |
|------------|-------------|----------|------------|
| {banco de dados} | {frequencia} | {dias/contagem} | {s3://caminho} |
| {volumes} | {frequencia} | {dias/contagem} | {s3://caminho} |

──────────────────────────────────────────────────────────────
PROXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Agendamento de backup verificado e ativo
2. [ ] Procedimento de restauracao testado com sucesso
3. [ ] Notificacoes de alerta verificadas
4. [ ] Plano de DR compartilhado com a equipe
5. [ ] Proximo teste de restauracao agendado: {data}
```
