---
description: Otimizar uso de recursos e custos do Kubernetes
argument-hint: [namespace] [alvo]
---

# Kubernetes Optimize

Você é um especialista em otimização de Kubernetes. Você deve analisar o uso de recursos e fornecer recomendações acionáveis para right-sizing, autoscaling e redução de custos.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Namespace a otimizar (padrão: todos os namespaces)
- (Opcional) Alvo: resources, autoscaling, costs, full (padrão: full)

Exemplo: `/kubernetes:optimize namespace:app-prod target:resources`

## Plan Mode

> **Plan mode é recomendado.** Claude analisa o uso atual de recursos antes de propor alterações.

## MISSÃO

### Passo 1: Análise de Recursos

```
══════════════════════════════════════════════════════════════
OTIMIZAÇÃO KUBERNETES
══════════════════════════════════════════════════════════════

Namespace: {namespace}
Alvo: {resources/autoscaling/costs/full}

──────────────────────────────────────────────────────────────
USO ATUAL DE RECURSOS
──────────────────────────────────────────────────────────────
```

Analisar com:
```bash
kubectl top pods -n {namespace}
kubectl top nodes
kubectl get hpa -n {namespace}
kubectl get pdb -n {namespace}
kubectl get vpa -n {namespace}
```

### Passo 2: Análise de Right-Sizing

```
──────────────────────────────────────────────────────────────
RECOMENDAÇÕES DE RIGHT-SIZING
──────────────────────────────────────────────────────────────

| Workload | Req Atual | Limit Atual | Uso Real | Recomendado |
|----------|-----------|-------------|---------|-------------|
| api | 500m/512Mi | 1/1Gi | 120m/200Mi | 200m/300Mi |
| worker | 250m/256Mi | 500m/512Mi | 50m/100Mi | 100m/150Mi |

Economia potencial: {estimate}
```

### Passo 3: Configuração de Autoscaling

```
──────────────────────────────────────────────────────────────
RECOMENDAÇÕES DE AUTOSCALING
──────────────────────────────────────────────────────────────

| Workload | Atual | HPA Recomendado | Sugestão VPA |
|----------|-------|----------------|--------------|
| api | 3 fixo | 2-10, CPU 70% | mode: Auto |
| worker | 2 fixo | 1-5, comprimento de fila | mode: Auto |
```

Gerar manifests HPA:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

### Passo 4: PodDisruptionBudget

```
──────────────────────────────────────────────────────────────
RECOMENDAÇÕES DE PDB
──────────────────────────────────────────────────────────────

| Workload | Réplicas | PDB | Recomendação |
|----------|----------|-----|-------------|
| api | 3 | nenhum | minAvailable: 2 |
| worker | 2 | nenhum | minAvailable: 1 |
```

Gerar manifests PDB.

### Passo 5: Otimização de Custos

```
──────────────────────────────────────────────────────────────
ANÁLISE DE CUSTOS
──────────────────────────────────────────────────────────────

| Área | Atual | Otimizado | Economia |
|------|-------|-----------|---------|
| Computação (CPU) | {x} cores | {y} cores | {z}% |
| Memória | {x} Gi | {y} Gi | {z}% |
| Armazenamento | {x} Gi | {y} Gi | {z}% |
| Spot/Preemptível | {não} | {recomendado} | {z}% |
```

### Passo 6: Relatório Final

```
══════════════════════════════════════════════════════════════
RELATÓRIO DE OTIMIZAÇÃO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMO
──────────────────────────────────────────────────────────────

| Otimização | Impacto | Esforço | Prioridade |
|-----------|--------|--------|-----------|
| Right-size requests | Alto | Baixo | 1 |
| Adicionar HPA | Alto | Médio | 2 |
| Adicionar PDB | Médio | Baixo | 3 |
| Instâncias Spot | Alto | Médio | 4 |

──────────────────────────────────────────────────────────────
ARQUIVOS GERADOS
──────────────────────────────────────────────────────────────

| Arquivo | Descrição |
|---------|----------|
| {file} | {description} |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar right-sizing em staging primeiro
2. [ ] Habilitar HPA e monitorar por 24h
3. [ ] Adicionar PDBs antes da próxima janela de manutenção
4. [ ] Configurar monitoramento com @kubernetes-monitoring
```
