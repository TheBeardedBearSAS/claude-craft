---
description: Diagnóstico Docker
argument-hint: [arguments]
---

# Diagnóstico Docker

Você é um especialista em debugging Docker. Você deve diagnosticar e resolver problemas relacionados a containers.

## Argumentos
$ARGUMENTS

Argumentos:
- Sintoma ou mensagem de erro
- (Opcional) Nome do container
- (Opcional) Contexto (dev/prod)

Exemplo: `/docker:debug "Container sai com código 137"` ou `/docker:debug app "Connection refused"`

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

### Passo 1: Coletar Informações

```bash
# Estado do container
docker ps -a

# Logs recentes
docker logs <container> --tail 100 2>&1

# Inspeção completa
docker inspect <container>

# Recursos
docker stats --no-stream
```

### Passo 2: Identificar o Problema

```
══════════════════════════════════════════════════════════════
🔍 DIAGNÓSTICO DOCKER
══════════════════════════════════════════════════════════════

Container: {nome}
Imagem: {imagem}
Estado: {running|exited|restarting}
Tempo ativo: {duração}

──────────────────────────────────────────────────────────────
🚨 SINTOMA REPORTADO
──────────────────────────────────────────────────────────────

{descrição do problema}

──────────────────────────────────────────────────────────────
📋 ANÁLISE
──────────────────────────────────────────────────────────────
```

### Passo 3: Árvores de Decisão

#### Container Não Inicia

| Código de Saída | Significado | Ações |
|-----------------|-------------|-------|
| 0 | Terminou normalmente | Verificar CMD/ENTRYPOINT |
| 1 | Erro de aplicação | Analisar logs |
| 126 | Permissão negada | Verificar permissões |
| 127 | Comando não encontrado | Verificar PATH e binário |
| 137 | SIGKILL (OOM ou stop) | Verificar memória |
| 139 | SIGSEGV | Debugar código |

```bash
# Verificar código de saída
docker inspect --format='{{.State.ExitCode}}' <container>

# Verificar OOM
docker inspect --format='{{.State.OOMKilled}}' <container>

# Logs detalhados
docker logs <container> 2>&1
```

#### Problemas de Rede

```bash
# Resolução DNS
docker exec <container> nslookup <servico>
docker exec <container> cat /etc/resolv.conf

# Conectividade
docker exec <container> ping -c 3 <host>
docker exec <container> nc -zv <host> <porta>

# Configuração de rede
docker network inspect <rede>
docker inspect --format='{{json .NetworkSettings.Networks}}' <container>
```

#### Problemas de Recursos

```bash
# Monitoramento em tempo real
docker stats <container>

# Processos no container
docker exec <container> ps aux
docker exec <container> top -bn1

# Memória detalhada
docker exec <container> free -m
docker exec <container> cat /proc/meminfo
```

#### Problemas de Volumes

```bash
# Mudanças no sistema de arquivos
docker diff <container>

# Espaço em disco
docker exec <container> df -h

# Permissões
docker exec <container> ls -la /caminho/dados

# Inspecionar volume
docker volume inspect <volume>
```

### Passo 4: Soluções Comuns

```
──────────────────────────────────────────────────────────────
💡 HIPÓTESES E SOLUÇÕES
──────────────────────────────────────────────────────────────

### Hipótese 1: [Mais Provável]
**Causa**: {descrição}
**Verificação**:
\`\`\`bash
{comando de diagnóstico}
\`\`\`
**Solução**:
\`\`\`bash
{comando de resolução}
\`\`\`

### Hipótese 2: [Alternativa]
**Causa**: {descrição}
**Verificação**:
\`\`\`bash
{comando}
\`\`\`
**Solução**:
\`\`\`bash
{comando}
\`\`\`
```

### Passo 5: Relatório Final

```
══════════════════════════════════════════════════════════════
📊 RELATÓRIO DE DIAGNÓSTICO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 CAUSA IDENTIFICADA
──────────────────────────────────────────────────────────────

{Descrição da causa raiz}

──────────────────────────────────────────────────────────────
✅ SOLUÇÃO APLICADA
──────────────────────────────────────────────────────────────

{Passos de resolução}

──────────────────────────────────────────────────────────────
🛡️ PREVENÇÃO
──────────────────────────────────────────────────────────────

Para evitar este problema no futuro:
- [ ] {Recomendação 1}
- [ ] {Recomendação 2}
- [ ] {Recomendação 3}

──────────────────────────────────────────────────────────────
🔧 COMANDOS ÚTEIS
──────────────────────────────────────────────────────────────

# Recriar container
docker compose up -d --force-recreate <servico>

# Rebuild completo
docker compose build --no-cache <servico>

# Limpar recursos
docker system prune -af

# Verificar estado
docker compose ps
docker compose logs -f <servico>
```

## Checklist de Diagnóstico

### Informações Básicas
- [ ] Mensagem de erro exata anotada
- [ ] Timestamp do problema
- [ ] Mudanças recentes identificadas
- [ ] Reprodutibilidade verificada

### Ambiente
- [ ] Versão do Docker (`docker version`)
- [ ] Sistema operacional host verificado
- [ ] Recursos disponíveis
- [ ] Modo (Compose/Swarm)

### Verificações Realizadas
- [ ] Logs analisados
- [ ] Estado do container verificado
- [ ] Recursos verificados
- [ ] Rede testada (se aplicável)
- [ ] Volumes verificados (se aplicável)
