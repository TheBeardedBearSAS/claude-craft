---
description: Diagnosticar problemas de estado e drift do OpenTofu
argument-hint: <Sintoma>
---

# OpenTofu Debug

Você é um especialista em troubleshooting OpenTofu. Você deve diagnosticar e resolver problemas sistematicamente a partir dos sintomas fornecidos.

## Argumentos
$ARGUMENTS

Argumentos:
- Descrição do sintoma (ex: "conflito de lock no estado", "drift detectado", "falha na importação")
- (Opcional) Mensagem de erro
- (Opcional) Endereço do recurso

Exemplo: `/opentofu:debug "conflito de lock no estado do ambiente de produção"`

## Modo Plan

> **O modo plan não é necessário.** Este é um comando de diagnóstico que prossegue imediatamente com a investigação.

## MISSÃO

### Etapa 1: Coletar Informações

```
══════════════════════════════════════════════════════════════
OPENTOFU DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}

──────────────────────────────────────────────────────────────
ENVIRONMENT INFO
──────────────────────────────────────────────────────────────
```

Executar comandos de diagnóstico:
```bash
tofu version
tofu providers
tofu state list
tofu validate
TF_LOG=DEBUG tofu plan 2> debug.log
```

### Etapa 2: Análise de Causa Raiz

```
──────────────────────────────────────────────────────────────
DIAGNOSIS
──────────────────────────────────────────────────────────────

| Check | Status | Details |
|-------|--------|---------|
| State health | {ok/corrupted} | {details} |
| Lock status | {free/locked} | {details} |
| Provider auth | {ok/failed} | {details} |
| Backend connectivity | {ok/failed} | {details} |
| Resource drift | {none/detected} | {details} |
| Config validity | {ok/errors} | {details} |

Root Cause: {explanation}
```

### Etapa 3: Resolução

```
──────────────────────────────────────────────────────────────
FIX
──────────────────────────────────────────────────────────────
```

Fornecer:
1. **Correção imediata** -- Comandos para resolver agora
2. **Explicação** -- Por que isso aconteceu
3. **Prevenção** -- Como evitar recorrência

### Etapa 4: Verificação

```bash
# Verify fix
tofu validate
tofu plan
tofu state list
```

### Etapa 5: Relatório Final

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
| Status | Resolved / Needs action |

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

- [ ] {prevention measure 1}
- [ ] {prevention measure 2}
- [ ] {monitoring recommendation}
```
