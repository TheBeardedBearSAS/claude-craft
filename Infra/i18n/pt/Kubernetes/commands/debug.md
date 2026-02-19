---
description: Diagnosticar problemas do Kubernetes a partir de sintomas
argument-hint: <Sintoma> [namespace]
---

# Kubernetes Debug

Você é um especialista em troubleshooting de Kubernetes. Você deve diagnosticar e resolver problemas sistematicamente a partir dos sintomas fornecidos.

## Argumentos
$ARGUMENTS

Argumentos:
- Descrição do sintoma (ex.: "pods travados em CrashLoopBackOff", "service inacessível")
- (Opcional) Namespace
- (Opcional) Nome do pod ou do deployment

Exemplo: `/kubernetes:debug "CrashLoopBackOff nos pods da api" namespace:app-prod`

## Plan Mode

> **Plan mode não é obrigatório.** Este é um comando de diagnóstico que prossegue imediatamente com a investigação.

## MISSÃO

### Passo 1: Coleta de Informações

```
══════════════════════════════════════════════════════════════
KUBERNETES DEBUG
══════════════════════════════════════════════════════════════

Sintoma: {description}
Namespace: {namespace}

──────────────────────────────────────────────────────────────
STATUS DO CLUSTER
──────────────────────────────────────────────────────────────
```

Executar comandos de diagnóstico:
```bash
# Visão geral do cluster
kubectl get nodes
kubectl get pods -n {namespace}
kubectl get events -n {namespace} --sort-by='.lastTimestamp' | tail -20

# Detalhes do recurso com problema
kubectl describe pod {pod} -n {namespace}
kubectl logs {pod} -n {namespace} --tail=50
kubectl logs {pod} -n {namespace} --previous --tail=50
```

### Passo 2: Análise de Causa Raiz

```
──────────────────────────────────────────────────────────────
DIAGNÓSTICO
──────────────────────────────────────────────────────────────

| Verificação | Status | Detalhes |
|------------|--------|---------|
| Status do pod | {status} | {details} |
| Eventos | {normal/warning} | {details} |
| Logs | {error/clean} | {details} |
| Recursos | {ok/exhausted} | {details} |
| Rede | {ok/issue} | {details} |
| Armazenamento | {ok/issue} | {details} |

Causa Raiz: {explanation}
```

### Passo 3: Resolução

```
──────────────────────────────────────────────────────────────
CORREÇÃO
──────────────────────────────────────────────────────────────
```

Fornecer:
1. **Correção imediata** -- Comandos ou alterações de manifest para resolver agora
2. **Explicação** -- Por que isso aconteceu
3. **Prevenção** -- Como evitar recorrência

### Passo 4: Verificação

```bash
# Verificar a correção
kubectl get pods -n {namespace}
kubectl describe pod {pod} -n {namespace}
```

### Passo 5: Relatório Final

```
══════════════════════════════════════════════════════════════
RELATÓRIO DE DEBUG
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMO
──────────────────────────────────────────────────────────────

| Item | Valor |
|------|-------|
| Sintoma | {symptom} |
| Causa raiz | {cause} |
| Correção aplicada | {fix} |
| Status | Resolvido / Requer ação |

──────────────────────────────────────────────────────────────
PREVENÇÃO
──────────────────────────────────────────────────────────────

- [ ] {medida de prevenção 1}
- [ ] {medida de prevenção 2}
- [ ] {recomendação de monitoramento}
```
