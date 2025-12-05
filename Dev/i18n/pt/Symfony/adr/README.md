# Architecture Decision Records (ADR)

> Documentação das decisões arquiteturais importantes do projeto

## O que é um ADR?

Um **Architecture Decision Record** (ADR) é um documento que captura uma decisão arquitetural importante, incluindo:
- O **contexto** e o problema a resolver
- As **alternativas** consideradas com suas vantagens/desvantagens
- A **decisão** tomada e sua justificativa
- As **consequências** positivas E negativas
- Os detalhes de **implementação**

**Formato utilizado**: MADR v2.2 (Markdown Any Decision Records)

---

## Índice dos ADRs

### Críticos (P0)

| ADR | Título | Status | Data | Tags |
|-----|--------|--------|------|------|
| [0001](0001-halite-encryption.md) | Criptografia Halite para Dados Sensíveis LGPD | ✅ Accepted | 2025-11-26 | security, lgpd, halite |
| [0002](0002-gedmo-doctrine-extensions.md) | Gedmo Doctrine Extensions para Audit Trail | ✅ Accepted | 2025-11-26 | audit, gedmo, lgpd |
| [0003](0003-clean-architecture-ddd.md) | Clean Architecture + DDD + Hexagonal | 🔄 Refactoring | 2025-11-26 | architecture, ddd |

### Importantes (P1)

| ADR | Título | Status | Data | Tags |
|-----|--------|--------|------|------|
| [0004](0004-docker-multi-stage.md) | Docker Multi-stage para Dev e Prod | ✅ Accepted | 2025-11-26 | docker, infra |
| [0005](0005-symfony-messenger-async.md) | Symfony Messenger para Emails Assíncronos | 📝 Proposed | 2025-11-26 | async, messaging |
| [0006](0006-postgresql-database.md) | PostgreSQL 16 como Banco de Dados | ✅ Accepted | 2025-11-26 | database |

### Padrão (P2)

| ADR | Título | Status | Data | Tags |
|-----|--------|--------|------|------|
| [0007](0007-easyadmin-backoffice.md) | EasyAdmin para o Backoffice | ✅ Accepted | 2025-11-26 | admin, crud |
| [0008](0008-tailwind-alpine-frontend.md) | Tailwind CSS + Alpine.js para Frontend | ✅ Accepted | 2025-11-26 | frontend |
| [0009](0009-phpstan-quality-tools.md) | PHPStan e Ferramentas de Qualidade | ✅ Accepted | 2025-11-26 | quality, phpstan |
| [0010](0010-conventional-commits.md) | Conventional Commits | ✅ Accepted | 2025-11-26 | git, commits |

### Legenda dos Status

- 📝 **Proposed**: Em discussão, ainda não aceito
- ✅ **Accepted**: Decisão validada e em produção
- 🔄 **Refactoring**: Implementação em andamento (migração progressiva)
- ⚠️ **Deprecated**: Obsoleto, não usar
- 🔄 **Superseded**: Substituído por um novo ADR (ver link)

---

## Quando Criar um ADR?

### ✅ CRIAR um ADR se:

- **Decisão arquitetural estrutural** impactando > 1 bounded context
- **Trade-offs significativos** entre várias opções viáveis
- **Restrição** regulatória/segurança/performance impondo uma escolha
- **Pergunta recorrente** em code review necessitando resposta oficial
- **Mudança de paradigma** (ex: sync → async, monolito → microserviços)
- **Escolha de tecnologia** importante (framework, biblioteca, infraestrutura)
- **Padrão arquitetural** novo para a equipe

### ❌ NÃO CRIAR um ADR se:

- **Decisão tática local** afetando < 3 arquivos
- **Bug fix** simples sem impacto arquitetural
- **CRUD padrão** seguindo padrões existentes
- **Atualização de dependência menor** (patch/minor version)
- **Escolha óbvia** sem alternativa viável
- **Configuração** de ambiente (exceto se impactar segurança/conformidade)

**Regra de ouro**: Em caso de dúvida, discuta com o Lead Dev antes de criar o ADR.

---

## Processo de Criação de um ADR

### 1️⃣ Proposta (Status: Proposed)

```bash
# 1. Criar branch dedicada
git checkout -b adr/0011-titulo-decisao

# 2. Copiar o template
cp .claude/adr/template.md .claude/adr/0011-titulo-decisao.md

# 3. Preencher todas as seções obrigatórias
# - Mínimo 2 opções com vantagens/desvantagens
# - Justificativa clara da decisão
# - Consequências positivas E negativas

# 4. Commit
git add .claude/adr/0011-titulo-decisao.md
git commit -m "docs: add ADR-0011 for [titulo] (Proposed)"
```

### 2️⃣ Discussão (Pull Request)

```bash
# 5. Push e criar PR
git push origin adr/0011-titulo-decisao

# 6. Abrir PR com título: [ADR] ADR-0011: Título Decisão
#    - Tag: [ADR]
#    - Reviewers: Lead Dev + 1 Senior mínimo
#    - Descrição: Link para o ADR no corpo do PR
```

**Elementos a discutir no PR**:
- Todas as opções foram consideradas?
- A justificativa é convincente?
- As consequências negativas são aceitáveis?
- Há riscos não documentados?
- A implementação está clara?

### 3️⃣ Aceitação (Status: Accepted)

**Critérios de aceitação**:
- ✅ Mínimo 2 reviewers aprovaram (Lead Dev + 1 Senior)
- ✅ Todas as seções obrigatórias preenchidas
- ✅ Mínimo 2 opções documentadas com prós/contras
- ✅ Consequências positivas E negativas listadas
- ✅ Referências a regras/código existente presentes
- ✅ Exemplos de código concretos (não genéricos)

### 4️⃣ Implementação

```bash
# Ao implementar a decisão:
git commit -m "feat: implement [feature] (see ADR-0011)"
```

### 5️⃣ Superseded (Se Evolução Necessária)

Se uma decisão precisa ser modificada significativamente:

```bash
# 1. NUNCA excluir o ADR antigo
# 2. Marcar o ADR antigo como Superseded
#    Status: Superseded by ADR-0015
# 3. Criar novo ADR (ADR-0015) explicando:
#    - Por que a decisão inicial não é mais válida
#    - O que mudou (contexto, restrições)
#    - A nova decisão
# 4. Vincular ambos os ADRs mutuamente
```

---

## Checklist de Validação

Antes de enviar um ADR no PR, verificar:

- [ ] **Título** claro e descritivo (≤10 palavras)
- [ ] **Status** correto (Proposed para novo ADR)
- [ ] **Data** no formato YYYY-MM-DD
- [ ] **Decisores** listados com nomes completos
- [ ] **Tags** pertinentes (3-5 tags)
- [ ] **Contexto** explica claramente o problema (2-3 parágrafos)
- [ ] **Mínimo 2 opções** documentadas
- [ ] Cada opção tem **vantagens** E **desvantagens**
- [ ] **Decisão** justificada em detalhes (por que esta opção?)
- [ ] **Consequências positivas** listadas (3-5)
- [ ] **Consequências negativas** listadas honestamente (2-4)
- [ ] **Riscos** identificados com mitigação
- [ ] **Implementação**: arquivos afetados listados
- [ ] **Exemplo de código** concreto do projeto (NÃO genérico)
- [ ] **Referências** a regras `.claude/`, docs, ADRs relacionados
- [ ] **Testes** necessários descritos
- [ ] Revisão de ortografia/gramática

---

## Recursos e Referências

### Documentação Interna

- **Configuração do projeto**: [`.claude/CLAUDE.md`](../CLAUDE.md)
- **Regras de arquitetura**: [`.claude/rules/02-architecture-clean-ddd.md`](../rules/02-architecture-clean-ddd.md)
- **Regras de segurança LGPD**: [`.claude/rules/11-security-rgpd.md`](../rules/11-security-rgpd.md)
- **Templates de desenvolvimento**: [`.claude/templates/`](../templates/)
- **Checklists de qualidade**: [`.claude/checklists/`](../checklists/)

### Recursos MADR

- [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) - Formato oficial
- [ADR Tools](https://github.com/npryce/adr-tools) - CLI para gerenciar ADRs
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Artigo fundador

---

## Boas Práticas

### ✅ FAZER

- **Seja conciso**: Máximo 2 páginas por ADR (exceto casos excepcionais)
- **Seja honesto**: Documente desvantagens e riscos
- **Seja concreto**: Exemplos de código do projeto, não genéricos
- **Referencie**: Vincule ADRs, regras, código existente
- **Atualize**: Adicione feedback pós-implementação
- **Versione**: Numeração sequencial (0001, 0002, ...)
- **Date**: Data de criação/aceitação clara

### ❌ NÃO FAZER

- **Nunca exclua** um ADR (use Superseded)
- **Não copie** código das regras (referencie)
- **Não generalize** em excesso (mantenha o contexto do projeto)
- **Não esqueça** as consequências negativas (é crucial)
- **Não atrase**: Crie o ADR ANTES da implementação se possível
- **Não negligencie** as reviews (2+ reviewers obrigatórios)

---

**Última atualização**: 2025-11-26

- **Total ADRs**: 10
- **Aceitos**: 9
- **Propostos**: 1
- **Refactoring**: 1
- **Deprecated**: 0
- **Superseded**: 0

---

*Este README é mantido pela equipe de Arquitetura. Qualquer modificação deve ser validada pelo Lead Dev.*
