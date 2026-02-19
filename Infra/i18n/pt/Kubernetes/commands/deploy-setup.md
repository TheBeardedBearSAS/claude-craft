---
description: Configurar pipeline de deployment GitOps para Kubernetes
argument-hint: <Stack> [ferramenta-gitops]
---

# Kubernetes Deploy Setup

Você é um especialista em deployment Kubernetes. Você deve configurar um pipeline de deployment GitOps completo para o projeto.

## Argumentos
$ARGUMENTS

Argumentos:
- Descrição do stack ou caminho
- (Opcional) Ferramenta GitOps: argocd, flux (padrão: argocd)
- (Opcional) Estratégia de release: rolling, canary, blue-green

Exemplo: `/kubernetes:deploy-setup "Node.js API" gitops:argocd strategy:canary`

## Plan Mode

> **Plan mode é obrigatório.** Antes de executar, Claude ativa o plan mode para analisar o projeto, propor uma estratégia de deployment e aguardar validação.

## MISSÃO

### Passo 1: Analisar o Projeto

```
══════════════════════════════════════════════════════════════
KUBERNETES DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projeto: {name}

──────────────────────────────────────────────────────────────
DETECÇÃO DE STACK
──────────────────────────────────────────────────────────────

| Componente | Detectado | Versão |
|-----------|----------|--------|
| Linguagem | {language} | {version} |
| Framework | {framework} | {version} |
| Dockerfile | {sim/não} | {path} |
| Manifests K8s | {sim/não} | {path} |
```

### Passo 2: Design da Estratégia de Deployment

```
──────────────────────────────────────────────────────────────
ESTRATÉGIA DE DEPLOYMENT
──────────────────────────────────────────────────────────────

Ferramenta GitOps: {ArgoCD / Flux}
Estratégia de Release: {Rolling / Canary / Blue-Green}

Pipeline:
  Push para main
    → CI: Testes → Build → Push da imagem
    → CD: Atualizar manifest → Sincronizar com cluster
    → Verificar: Health checks → Smoke tests
    → Promover: Staging → Produção
```

### Passo 3: Gerar Pipeline CI

Gerar workflow do GitHub Actions / GitLab CI:
- Build e testes da aplicação
- Build e push da imagem Docker com tag SHA
- Atualizar manifests Kubernetes com a nova image tag
- Disparar sincronização GitOps

### Passo 4: Gerar Configuração GitOps

Gerar ArgoCD Application ou Flux HelmRelease:
- Definição da aplicação
- Políticas de sincronização (auto-sync, prune, self-heal)
- Estratégia de promoção entre ambientes
- Configuração de rollback

### Passo 5: Gerar Estratégia de Rollout

Se canary ou blue-green, gerar configuração do Argo Rollouts:
- Etapas de entrega progressiva
- Templates de análise para promoção baseada em métricas
- Integração com service mesh (se aplicável)

### Passo 6: Relatório Final

```
══════════════════════════════════════════════════════════════
RELATÓRIO DE CONFIGURAÇÃO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARQUIVOS CRIADOS
──────────────────────────────────────────────────────────────

| Arquivo | Descrição |
|---------|----------|
| .github/workflows/deploy.yml | Pipeline CI/CD |
| k8s/argocd/application.yaml | Aplicação ArgoCD |
| k8s/argocd/project.yaml | Projeto ArgoCD |

──────────────────────────────────────────────────────────────
PRÓXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. [ ] Instalar ArgoCD/Flux no cluster alvo
2. [ ] Configurar acesso ao repositório Git (deploy key ou GitHub App)
3. [ ] Configurar credenciais do registry de imagens
4. [ ] Configurar secrets com External Secrets Operator
5. [ ] Testar o pipeline de deployment de ponta a ponta
6. [ ] Configurar monitoramento com @kubernetes-monitoring
```
