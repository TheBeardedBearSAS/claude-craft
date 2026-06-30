---
description: "Auditoria de postura de segurança do Kubernetes"
argument-hint: "[namespace] [escopo]"
---

# Kubernetes Security Audit

Você é um especialista em segurança Kubernetes. Você deve realizar uma auditoria de segurança abrangente do cluster ou namespace.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Namespace a auditar (padrão: todos os namespaces)
- (Opcional) Escopo: rbac, network, pods, secrets, images, full (padrão: full)

Exemplo: `/kubernetes:security-audit namespace:app-prod scope:full`

## Plan Mode

> **Plan mode é condicional.** Ativa automaticamente quando o escopo é "full" ou abrange múltiplos namespaces.

## MISSÃO

### Passo 1: Definição de Escopo

```
══════════════════════════════════════════════════════════════
AUDITORIA DE SEGURANÇA KUBERNETES
══════════════════════════════════════════════════════════════

Escopo: {namespace ou cluster-wide}
Categorias: {rbac, network, pods, secrets, images}

──────────────────────────────────────────────────────────────
ESCOPO DA AUDITORIA
──────────────────────────────────────────────────────────────
```

### Passo 2: Auditoria de RBAC

```
──────────────────────────────────────────────────────────────
ANÁLISE DE RBAC
──────────────────────────────────────────────────────────────

| Verificação | Status | Detalhes |
|------------|--------|---------|
| Bindings cluster-admin | {count} | {details} |
| Roles excessivamente permissivas | {count} | {details} |
| ServiceAccounts não utilizadas | {count} | {details} |
| Auto-mount de token | {habilitado/desabilitado} | {details} |
```

### Passo 3: Auditoria de Segurança de Pods

```
──────────────────────────────────────────────────────────────
SEGURANÇA DE PODS
──────────────────────────────────────────────────────────────

| Verificação | Status | Detalhes |
|------------|--------|---------|
| Aplicação de PSS | {restricted/baseline/none} | {details} |
| Containers root | {count} | {lista de pods} |
| Containers privilegiados | {count} | {lista de pods} |
| Rootfs somente leitura | {%} | {details} |
| Capabilities removidas | {%} | {details} |
| Perfis seccomp | {%} | {details} |
```

### Passo 4: Auditoria de Segurança de Rede

```
──────────────────────────────────────────────────────────────
SEGURANÇA DE REDE
──────────────────────────────────────────────────────────────

| Verificação | Status | Detalhes |
|------------|--------|---------|
| Políticas default deny | {sim/não por ns} | {details} |
| Services expostos | {count} | {lista de services} |
| TLS do Ingress | {%} | {details} |
| Exposição de service interno | {count} | {details} |
```

### Passo 5: Auditoria de Secrets

```
──────────────────────────────────────────────────────────────
GERENCIAMENTO DE SECRETS
──────────────────────────────────────────────────────────────

| Verificação | Status | Detalhes |
|------------|--------|---------|
| Secrets em env vars | {count} | {details} |
| External secrets | {sim/não} | {ferramenta} |
| Criptografia em repouso | {habilitada/desabilitada} | {details} |
| Rotação de secrets | {automatizada/manual/nenhuma} | {details} |
```

### Passo 6: Segurança de Imagens

```
──────────────────────────────────────────────────────────────
SEGURANÇA DE IMAGENS
──────────────────────────────────────────────────────────────

| Verificação | Status | Detalhes |
|------------|--------|---------|
| Tags latest | {count} | {images} |
| Imagens não assinadas | {count} | {images} |
| Vulnerabilidades conhecidas | {count} | {breakdown por severidade} |
| Registries confiáveis | {%} | {details} |
```

### Passo 7: Relatório Final

```
══════════════════════════════════════════════════════════════
RELATÓRIO DE AUDITORIA DE SEGURANÇA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
PONTUAÇÃO
──────────────────────────────────────────────────────────────

| Categoria | Pontuação | Status |
|----------|----------|--------|
| RBAC | {x}/100 | {aprovado/aviso/reprovado} |
| Segurança de Pods | {x}/100 | {aprovado/aviso/reprovado} |
| Rede | {x}/100 | {aprovado/aviso/reprovado} |
| Secrets | {x}/100 | {aprovado/aviso/reprovado} |
| Imagens | {x}/100 | {aprovado/aviso/reprovado} |
| **Geral** | **{x}/100** | **{status}** |

──────────────────────────────────────────────────────────────
ACHADOS CRÍTICOS
──────────────────────────────────────────────────────────────

1. [ ] {achado crítico 1}
2. [ ] {achado crítico 2}

──────────────────────────────────────────────────────────────
RECOMENDAÇÕES
──────────────────────────────────────────────────────────────

Prioridade 1 (Imediato):
- [ ] {recomendação}

Prioridade 2 (Neste sprint):
- [ ] {recomendação}

Prioridade 3 (Próximo trimestre):
- [ ] {recomendação}
```
