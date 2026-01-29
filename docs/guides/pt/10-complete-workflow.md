# Guia de Fluxo de Trabalho Completo: Da Ideia à Produção

Guia completo passo a passo para construir uma aplicação completa com Claude Craft, da ideia inicial ao deploy em produção.

---

## Visão Geral

Este guia acompanha você através do ciclo de desenvolvimento completo:

1. **Ideação** - Definir sua visão do produto
2. **Requisitos** - Documentar o que você está construindo
3. **Arquitetura** - Projetar a solução técnica
4. **Planejamento** - Criar sprints acionáveis
5. **Desenvolvimento** - Implementar com TDD
6. **Qualidade** - Validar e testar
7. **Deploy** - Entregar em produção

---

## Fase 1: Ideação (5-10 minutos)

### Iniciar com BMAD

```bash
/bmad:init
```

### Definir a Visão

```
@pm Quero construir uma plataforma e-commerce para vender produtos artesanais.
Funcionalidades principais:
- Catálogo de produtos com categorias
- Carrinho de compras e checkout
- Autenticação de usuários
- Gestão de pedidos
```

---

## Fase 2: Requisitos (15-30 minutos)

### Criar PRD

```
@pm Crie um Product Requirements Document
/gate:validate-prd docs/prd.md
```

---

## Fase 3: Arquitetura (20-45 minutos)

### Projetar Arquitetura

```
@architect Projete a arquitetura do sistema para a plataforma e-commerce
```

### Validar Especificação Técnica

```
/gate:validate-techspec docs/tech-spec.md
```

---

## Fase 4: Planejamento (15-30 minutos)

### Criar Backlog

```
@po Crie user stories a partir da especificação técnica
@sm Planeje o sprint 1
/gate:validate-sprint
```

---

## Fase 5: Desenvolvimento

### Ciclo TDD

```bash
# Obter próxima história
/sprint:next-story --claim

# Implementar com TDD
@dev Implemente US-001 usando TDD

# 🔴 Vermelho - Escrever teste falhando
# 🟢 Verde - Implementar
# 🔵 Refatorar

# Validar
/gate:validate-story US-001
/sprint:transition US-001 done
```

---

## Fase 6: Qualidade

```bash
/symfony:check-architecture
/common:full-audit
/common:pre-commit-check
```

---

## Fase 7: Deploy

```bash
/docker:compose-setup symfony postgresql redis
/docker:cicd-pipeline github-actions
/common:release-checklist
```

---

## Usando Ralph para Automação

```bash
/common:ralph-run "Implementar autenticação de usuário com TDD"
```

---

## Sequência de Comandos Completa

```bash
/bmad:init
@pm Crie o PRD
/gate:validate-prd docs/prd.md
@architect Crie a especificação técnica
/gate:validate-techspec docs/tech-spec.md
@po Crie as user stories
@sm Planeje o sprint 1
/sprint:next-story --claim
@dev Implemente com TDD
/gate:validate-story US-001
/common:full-audit
/common:release-checklist
```

---

## Dicas para o Sucesso

1. **Não pule os Quality Gates**
2. **Use os agentes colaborativamente**
3. **TDD é não negociável**: 🔴 → 🟢 → 🔵
4. **Documente as decisões** com ADRs
5. **Revisões regulares**

---

## Veja Também

- [Guia Prático BMAD](../BMAD-PRACTICAL-GUIDE.md)
- [Guia Ralph Wiggum](../RALPH-GUIDE.md)
- [Referência de Comandos](../COMMANDS.md)
