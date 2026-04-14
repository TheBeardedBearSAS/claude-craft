---
description: Diagnose Hetzner Cloud infrastructure issues from symptoms
argument-hint: <Symptom> [resource]
---

# Hcloud Debug

> ⚠️ **Migração obrigatória antes de 2026-07-01**: o parâmetro `location` está deprecado em favor de `location`. Provider Terraform do Hetzner Cloud >= 1.58.0. Fonte: https://github.com/hetznercloud/terraform-provider-hcloud/releases

Voce e um especialista em troubleshooting Hetzner Cloud. Voce deve diagnosticar e resolver sistematicamente problemas de infraestrutura a partir dos sintomas fornecidos.

## Arguments
$ARGUMENTS

Argumentos:
- Descricao do sintoma (ex: "servidor inacessivel", "health check do load balancer falhando", "volume nao montando")
- (Opcional) Nome ou tipo do recurso
- (Opcional) Datacenter ou localizacao

Exemplo: `/hcloud:debug "Conexao SSH recusada no web-01" resource:server`

## Plan Mode

> **O modo plan nao e necessario.** Este e um comando diagnostico que prossegue imediatamente com a investigacao.

## MISSION

### Passo 1: Coletar Informacoes

```
══════════════════════════════════════════════════════════════
HCLOUD DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}
Resource: {resource}
Location: {location}

──────────────────────────────────────────────────────────────
ENVIRONMENT STATUS
──────────────────────────────────────────────────────────────
```

Executar comandos diagnosticos:
```bash
# Server status
hcloud server describe {resource}
hcloud server list-actions {resource}

# Network status
hcloud server describe {resource} -o json | jq '.private_net'
hcloud network list

# Firewall status
hcloud firewall list
hcloud server describe {resource} -o json | jq '.public_net.firewalls'

# Volume status
hcloud volume list --server {resource}

# Load balancer status (if applicable)
hcloud load-balancer list
```

### Passo 2: Analise de Causa Raiz

```
──────────────────────────────────────────────────────────────
DIAGNOSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| Server status | {running/off/rebuilding} | {details} |
| Public IP | {assigned/missing} | {ip address} |
| Firewall rules | {ok/blocking} | {details} |
| Private network | {attached/detached} | {details} |
| Volume mount | {ok/fail} | {details} |
| Cloud-init | {complete/running/failed} | {details} |
| SSH key | {deployed/missing} | {details} |

──────────────────────────────────────────────────────────────
DECISION TREE
──────────────────────────────────────────────────────────────

Symptom: {symptom}
  ├── Problema no servidor?
  │   ├── Nao esta executando → Verificar hcloud server describe, ligar
  │   ├── Travado em rebuilding → Aguardar ou contatar suporte
  │   └── Cloud-init falhou → Habilitar rescue, verificar logs
  ├── Problema de rede?
  │   ├── Sem IP publico → Verificar atribuicao de primary IP
  │   ├── Firewall bloqueando → Revisar regras com hcloud firewall describe
  │   └── Rede privada → Verificar anexacao e sub-rede
  ├── Problema de volume?
  │   ├── Nao anexado → hcloud volume attach
  │   ├── Falha de montagem → Verificar filesystem, /dev/disk/by-id/
  │   └── Localizacao errada → Volume deve estar no mesmo location
  └── Problema de load balancer?
      ├── Health check falhando → Verificar porta, caminho, codigos de status
      ├── Sem targets → Verificar label selector
      └── Erro TLS → Verificar certificado

Root Cause: {explanation}
```

### Passo 3: Resolucao

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Fornecer:
1. **Correcao imediata** -- Comandos hcloud exatos ou alteracoes de configuracao para resolver o problema agora
2. **Explicacao** -- Por que isso aconteceu, incluindo especificidades do Hetzner Cloud
3. **Prevencao** -- Regras de firewall, scripts cloud-init ou monitoramento para evitar recorrencia

### Passo 4: Verificacao

```bash
# Verify server is running
hcloud server describe {resource}

# Verify connectivity
ssh root@{server-ip} echo "OK"

# Verify health checks (if LB)
hcloud load-balancer describe {lb-name} -o json | jq '.targets[].health_status'
```

### Passo 5: Relatorio Final

```
══════════════════════════════════════════════════════════════
DEBUG REPORT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SUMMARY
──────────────────────────────────────────────────────────────

| Item | Value |
|------|-------|
| Symptom | {symptom} |
| Root cause | {cause} |
| Fix applied | {fix} |
| Status | Resolvido / Requer acao |

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

- [ ] Adicionar monitoramento para {condicao}
- [ ] Atualizar cloud-init para prevenir {problema}
- [ ] Adicionar verificacao CI para {validacao}
- [ ] Documentar correcao no runbook para referencia @hcloud-debug
```
