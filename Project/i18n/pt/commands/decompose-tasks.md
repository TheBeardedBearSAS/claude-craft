---
description: Decompor User Stories em Tarefas
argument-hint: [arguments]
---

# Decompor User Stories em Tarefas

Você é um Tech Lead e Scrum Master experiente. Você deve decompor as User Stories do sprint em tarefas técnicas detalhadas para a equipe de desenvolvimento.

Esta etapa corresponde ao **Sprint Planning Parte 2 - "O Como"** no Scrum.

## Argumentos
$ARGUMENTS - Número do sprint (ex: 001, 002)

Se nenhum argumento, perguntar qual sprint decompor.

## Modo Plano

> **O modo plano é obrigatório.** Antes de executar, Claude ativa o modo plano para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## TECH STACK

| Camada | Tecnologia | Tarefas Típicas |
|--------|-------------|-----------------|
| 🗄️ DB | PostgreSQL + Doctrine | Entity, Migration, Repository, Fixtures |
| ⚙️ API | API Platform | Resource, DTO, Processor, Voter |
| 🌐 Web | Symfony UX + Turbo | Controller, Twig Template, Stimulus, Live Component |
| 📱 Mobile | Flutter | Widget, Screen, Provider/Bloc, Repository |
| 🧪 Tests | PHPUnit + Flutter Test | Unit, Integration, Functional, E2E |
| 📝 Doc | PHPDoc + DartDoc | Documentation, README, OpenAPI |
| 🐳 Ops | Docker | Config, CI/CD |

## MISSÃO

### ETAPA 1: Ler Sprint
Ler arquivos do sprint `project-management/sprints/sprint-$ARGUMENTS-*/`:
- sprint-goal.md
- sprint-dependencies.md
- Todas as USs referenciadas em backlog/user-stories/

### ETAPA 2: Criar estrutura de tarefas

```
project-management/sprints/sprint-$ARGUMENTS-{slug}/
├── sprint-goal.md
├── sprint-dependencies.md
├── board.md                         # Quadro Kanban (arquivo de board único)
└── tasks/
    ├── README.md                    # Visão geral: tarefas agrupadas por US
    ├── TASK-001.md                  # Um arquivo por tarefa (.claude/templates/project/task.md)
    └── ...
```

### ETAPA 3: Regras de decomposição

#### Características de boa tarefa (SMART)
| Critério | Descrição | Exemplo |
|---------|-------------|---------|
| **S**pecífica | Ação clara e precisa | "Criar entidade User" |
| **M**ensurável | Saber quando está concluída | "Migration executada" |
| **A**tribuível | Um único responsável | "Atribuída ao Dev Backend" |
| **R**ealista | Realizável no tempo | "4h estimadas" |
| **T**emporal | Duração estimada | "Máx 8h" |

#### Regras de tamanho
- **Mínimo**: 30 minutos
- **Máximo**: 8 horas (1 dia)
- **Ideal**: 2-4 horas
- Se > 8h → dividir em subtarefas

#### Tipos de tarefa
| Tipo | Prefixo | Exemplos |
|------|---------|----------|
| Database | `[DB]` | Entity, Migration, Repository |
| Backend | `[BE]` | Service, API Resource, Processor |
| Frontend Web | `[FE-WEB]` | Controller, Twig, Stimulus |
| Frontend Mobile | `[FE-MOB]` | Model, Repository, Bloc, Screen |
| Tests | `[TEST]` | Unit, API, Widget, E2E |
| Documentation | `[DOC]` | PHPDoc, README |
| DevOps | `[OPS]` | Docker, CI/CD |
| Review | `[REV]` | Code review |

### ETAPA 4: Template de decomposição de US

Para cada US, adicionar uma seção em `tasks/README.md` usando o template abaixo e criar um arquivo `tasks/TASK-{ID}.md` por linha de tarefa a partir de `.claude/templates/project/task.md` (os IDs continuam após o último `TASK-*` existente, como faz `/project:add-task`):

````markdown
# Tarefas - US-XXX: [Título]

## Informações da US
- **Epic**: EPIC-XXX
- **Persona**: P-XXX - [Nome]
- **Story Points**: [X]
- **Sprint**: sprint-$ARGUMENTS-{slug}

## Resumo da US
**Como** [persona]
**Eu quero** [ação]
**Para que** [benefício]

## Visão Geral das Tarefas

| ID | Tipo | Tarefa | Estimativa | Depende de | Status |
|----|------|--------|------------|-----------|--------|
| TASK-001 | [DB] | Criar entidade [Nome] | 2h | - | 🔲 |
| TASK-002 | [DB] | Migration | 1h | TASK-001 | 🔲 |
| TASK-003 | [BE] | API Platform resource | 3h | TASK-001 | 🔲 |
| TASK-004 | [BE] | Serviço de negócio | 4h | TASK-003 | 🔲 |
| TASK-005 | [FE-WEB] | Symfony controller | 2h | TASK-003 | 🔲 |
| TASK-006 | [FE-WEB] | Templates Twig | 3h | TASK-005 | 🔲 |
| TASK-007 | [FE-WEB] | Stimulus controller | 2h | TASK-006 | 🔲 |
| TASK-008 | [FE-MOB] | Modelo Dart | 1h | TASK-003 | 🔲 |
| TASK-009 | [FE-MOB] | Flutter repository | 2h | TASK-008 | 🔲 |
| TASK-010 | [FE-MOB] | Bloc/Provider | 3h | TASK-009 | 🔲 |
| TASK-011 | [FE-MOB] | Flutter screen | 4h | TASK-010 | 🔲 |
| TASK-012 | [TEST] | Testes unitários backend | 2h | TASK-004 | 🔲 |
| TASK-013 | [TEST] | Testes API | 2h | TASK-003 | 🔲 |
| TASK-014 | [TEST] | Widget tests | 2h | TASK-011 | 🔲 |
| TASK-015 | [TEST] | Testes E2E | 3h | TASK-007, TASK-011 | 🔲 |
| TASK-016 | [DOC] | Documentação | 1h | TASK-015 | 🔲 |
| TASK-017 | [REV] | Code Review | 2h | TASK-016 | 🔲 |

**Total estimado**: XXh

---

## Detalhes das Tarefas

### Camada Database [DB]

#### TASK-001: Criar entidade [Nome] com Doctrine
- **Tipo**: [DB]
- **Estimativa**: 2h
- **Depende de**: -

**Descrição**:
Criar entidade Doctrine com todos os campos, relações e anotações.

**Arquivos a criar/modificar**:
- `src/Entity/[Nome].php`
- `src/Repository/[Nome]Repository.php`

**Critérios de validação**:
- [ ] Entidade criada com todos os campos
- [ ] Anotações/atributos Doctrine corretos
- [ ] Relações configuradas
- [ ] Repository com métodos personalizados

**Comandos**:
```bash
php bin/console make:entity [Nome]
```

---

#### TASK-002: Migration para [Nome]
- **Tipo**: [DB]
- **Estimativa**: 1h
- **Depende de**: TASK-001

**Arquivos**:
- `migrations/VersionXXXX.php`

**Critérios**:
- [ ] Migration gerada
- [ ] Testada (up/down)
- [ ] Índices criados

**Comandos**:
```bash
php bin/console doctrine:migrations:diff
php bin/console doctrine:migrations:migrate
```

---

### Camada API [BE]

#### TASK-003: API Platform resource [Nome]
- **Tipo**: [BE]
- **Estimativa**: 3h
- **Depende de**: TASK-001

**Arquivos**:
- `src/Entity/[Nome].php` (atributos ApiResource)
- `src/Dto/[Nome]Input.php`
- `src/Dto/[Nome]Output.php`

**Configuração**:
```php
#[ApiResource(
    operations: [
        new GetCollection(),
        new Get(),
        new Post(security: "is_granted('ROLE_USER')"),
        new Put(security: "object.owner == user"),
        new Delete(security: "is_granted('ROLE_ADMIN')"),
    ],
    normalizationContext: ['groups' => ['[name]:read']],
    denormalizationContext: ['groups' => ['[name]:write']],
)]
```

**Critérios**:
- [ ] Endpoints REST funcionais
- [ ] Grupos de serialização
- [ ] Constraints de validação
- [ ] Security/Voters
- [ ] OpenAPI gerado

---

#### TASK-004: [Nome]Service serviço de negócio
- **Tipo**: [BE]
- **Estimativa**: 4h
- **Depende de**: TASK-003

**Arquivos**:
- `src/Service/[Nome]Service.php`

**Critérios**:
- [ ] Serviço criado e injetado
- [ ] Lógica de negócio implementada
- [ ] Exceções de negócio
- [ ] Logs adicionados

---

### Camada Frontend Web [FE-WEB]

#### TASK-005: Symfony [Nome] controller
- **Tipo**: [FE-WEB]
- **Estimativa**: 2h
- **Depende de**: TASK-003

**Arquivos**:
- `src/Controller/[Nome]Controller.php`

**Rotas**:
| Rota | Método | Ação |
|-------|---------|--------|
| `/[nome]` | GET | index |
| `/[nome]/{id}` | GET | show |
| `/[nome]/new` | GET/POST | new |
| `/[nome]/{id}/edit` | GET/POST | edit |

**Critérios**:
- [ ] Rotas funcionais
- [ ] IsGranted configurado
- [ ] Flash messages

---

#### TASK-006: Templates Twig [Nome]
- **Tipo**: [FE-WEB]
- **Estimativa**: 3h
- **Depende de**: TASK-005

**Arquivos**:
- `templates/[nome]/index.html.twig`
- `templates/[nome]/show.html.twig`
- `templates/[nome]/new.html.twig`
- `templates/[nome]/edit.html.twig`
- `templates/[nome]/_form.html.twig`

**Critérios**:
- [ ] Turbo Frames/Streams
- [ ] Responsivo
- [ ] WCAG 2.1 AA

---

#### TASK-007: Stimulus controller
- **Tipo**: [FE-WEB]
- **Estimativa**: 2h
- **Depende de**: TASK-006

**Arquivos**:
- `assets/controllers/[nome]_controller.js`

**Critérios**:
- [ ] Sem JS inline
- [ ] UX fluida

---

### Camada Frontend Mobile [FE-MOB]

#### TASK-008: Modelo Dart [Nome]
- **Tipo**: [FE-MOB]
- **Estimativa**: 1h
- **Depende de**: TASK-003

**Arquivos**:
- `lib/models/[nome].dart`

```dart
@JsonSerializable()
class [Nome] {
  final int id;
  // ...
  factory [Nome].fromJson(Map<String, dynamic> json) => _$[Nome]FromJson(json);
}
```

**Critérios**:
- [ ] Serialização JSON
- [ ] Tipos nullable
- [ ] Equivalente à API

---

#### TASK-009: Flutter [Nome] repository
- **Tipo**: [FE-MOB]
- **Estimativa**: 2h
- **Depende de**: TASK-008

**Arquivos**:
- `lib/repositories/[nome]_repository.dart`

**Critérios**:
- [ ] CRUD completo
- [ ] Tratamento de erros HTTP
- [ ] Headers de auth

---

#### TASK-010: [Nome] Provider/Bloc
- **Tipo**: [FE-MOB]
- **Estimativa**: 3h
- **Depende de**: TASK-009

**Arquivos**:
- `lib/providers/[nome]_provider.dart`
- ou `lib/blocs/[nome]_bloc.dart`

**Estados**:
- Initial, Loading, Loaded, Error

---

#### TASK-011: Flutter [Nome] screen
- **Tipo**: [FE-MOB]
- **Estimativa**: 4h
- **Depende de**: TASK-010

**Arquivos**:
- `lib/screens/[nome]/[nome]_list_screen.dart`
- `lib/screens/[nome]/[nome]_detail_screen.dart`
- `lib/widgets/[nome]/[nome]_card.dart`

**Critérios**:
- [ ] Material/Cupertino
- [ ] Pull-to-refresh
- [ ] Loading states
- [ ] Error handling
- [ ] Navegação

---

### Camada Tests [TEST]

#### TASK-012: Testes unitários backend
- **Tipo**: [TEST]
- **Estimativa**: 2h
- **Depende de**: TASK-004

**Arquivos**:
- `tests/Unit/Service/[Nome]ServiceTest.php`

**Critérios**:
- [ ] Cobertura > 80%
- [ ] Mocks corretos

---

#### TASK-013: Testes API
- **Tipo**: [TEST]
- **Estimativa**: 2h
- **Depende de**: TASK-003

**Arquivos**:
- `tests/Functional/Api/[Nome]Test.php`

**Endpoints a testar**:
| Método | Caso nominal | Caso de erro |
|---------|-------------|------------|
| GET | 200 | 401, 404 |
| POST | 201 | 422 |
| PUT | 200 | 403, 404 |
| DELETE | 204 | 403, 404 |

---

#### TASK-014: Flutter widget tests
- **Tipo**: [TEST]
- **Estimativa**: 2h
- **Depende de**: TASK-011

**Arquivos**:
- `test/widgets/[nome]_card_test.dart`

---

#### TASK-015: Testes E2E
- **Tipo**: [TEST]
- **Estimativa**: 3h
- **Depende de**: TASK-007, TASK-011

**Arquivos**:
- `tests/E2E/[Nome]FlowTest.php`
- `integration_test/[nome]_flow_test.dart`

**Critérios**:
- [ ] Web E Mobile
- [ ] < 2 min

---

### Documentação & Review

#### TASK-016: Documentação
- **Tipo**: [DOC]
- **Estimativa**: 1h
- **Depende de**: TASK-015

**Critérios**:
- [ ] PHPDoc/DartDoc
- [ ] OpenAPI atualizado

---

#### TASK-017: Code Review
- **Tipo**: [REV]
- **Estimativa**: 2h
- **Depende de**: TASK-016

**Checklist**:
- [ ] Código legível
- [ ] Testes passando
- [ ] PHPStan/Dart analyzer OK
- [ ] Segurança verificada

---

## Grafo de Dependências

```mermaid
graph TD
    T01[TASK-001: Entity] --> T02[TASK-002: Migration]
    T01 --> T03[TASK-003: API Resource]
    T03 --> T04[TASK-004: Service]
    T03 --> T05[TASK-005: Controller]
    T05 --> T06[TASK-006: Templates]
    T06 --> T07[TASK-007: Stimulus]
    T03 --> T08[TASK-008: Model Dart]
    T08 --> T09[TASK-009: Repository]
    T09 --> T10[TASK-010: Bloc]
    T10 --> T11[TASK-011: Screen]
    T04 --> T12[TASK-012: Unit Tests]
    T03 --> T13[TASK-013: API Tests]
    T11 --> T14[TASK-014: Widget Tests]
    T07 --> T15[TASK-015: E2E Tests]
    T11 --> T15
    T15 --> T16[TASK-016: Doc]
    T16 --> T17[TASK-017: Review]
```

## Resumo

| Camada | # Tarefas | Horas |
|--------|-----------|--------|
| [DB] | 2 | 3h |
| [BE] | 2 | 7h |
| [FE-WEB] | 3 | 7h |
| [FE-MOB] | 4 | 10h |
| [TEST] | 4 | 9h |
| [DOC] | 1 | 1h |
| [REV] | 1 | 2h |
| **TOTAL** | **17** | **39h** |
````

### ETAPA 5: Criar Task Board

Criar `board.md` (template `.claude/templates/project/board.md`):

```markdown
# Task Board - Sprint $ARGUMENTS

## Legenda
- 🔲 To Do
- 🔄 In Progress
- 👀 In Review
- ✅ Done
- 🚫 Blocked

## 🔲 To Do
| ID | US | Tarefa | Estimativa | Atribuída |
|----|-----|--------|------------|-----------|

## 🔄 In Progress
| ID | US | Tarefa | Iniciada | Atribuída |
|----|-----|--------|----------|-----------|

## 👀 In Review
| ID | US | Tarefa | Revisor |
|----|-----|--------|---------|

## ✅ Done
| ID | US | Tarefa | Real | Concluída |
|----|-----|--------|------|-----------|

## 🚫 Blocked
| ID | US | Motivo | Ação |
|----|-----|--------|------|

## Métricas
- **Tarefas**: X total | X concluídas (X%)
- **Horas**: Xh estimadas | Xh gastas | Xh restantes
```

### ETAPA 6: Criar README de tarefas

Criar `tasks/README.md`:

```markdown
# Tarefas - Sprint $ARGUMENTS

## Visão Geral

| US | Título | Pontos | Tarefas | Horas | Status |
|----|--------|--------|---------|--------|--------|

**Total**: X tarefas | Xh

## Distribuição por tipo

| Tipo | Tarefas | Horas | % |
|------|---------|-------|---|
| [DB] | X | Xh | X% |
| [BE] | X | Xh | X% |
| [FE-WEB] | X | Xh | X% |
| [FE-MOB] | X | Xh | X% |
| [TEST] | X | Xh | X% |

## Arquivos
- [TASK-001 - Título](./TASK-001.md)

## Convenções
- **ID**: TASK-[NNN] (ex: TASK-005); a US pai está nos metadados da tarefa
- **Tamanho**: 0.5h - 8h máx
- **Status**: 🔲 🔄 👀 ✅ 🚫
```

### ETAPA 7: Tarefas técnicas transversais

Adicionar uma seção "Tarefas técnicas transversais" em `tasks/README.md` e criar um `tasks/TASK-{ID}.md` por tarefa (US: nenhuma):

```markdown
# Tarefas Técnicas Transversais - Sprint $ARGUMENTS

## Infraestrutura

### TASK-018: Configuração de ambiente
- **Tipo**: [OPS]
- **Estimativa**: 2h

### TASK-019: Atualização de dependências
- **Tipo**: [OPS]
- **Estimativa**: 1h

## Refatoração

### TASK-020: [Refatoração identificada]
- **Tipo**: [BE]
- **Estimativa**: Xh
- **Motivo**: Dívida técnica

## CI/CD

### TASK-021: Pipeline CI
- **Tipo**: [OPS]
- **Estimativa**: 2h
```

## MAPEAMENTO US → TAREFAS

| Tipo de US | Tarefas BE | Tarefas FE | Tarefas Test | Total ~|
|------------|-----------|-----------|--------------|--------|
| CRUD simples | 4 | 7 | 4 | ~15 |
| Feature de negócio | 5 | 8 | 5 | ~18 |
| Apenas UI | 1 | 7 | 3 | ~11 |

## REGRAS

1. **Estimativa em horas** (não pontos)
2. **Uma tarefa = um responsável**
3. **Máx 2 tarefas em andamento por pessoa**
4. **Dependências explícitas** com Mermaid
5. **Vertical slicing**: Symfony + Flutter + API + DB

---
Executar decomposição do sprint $ARGUMENTS agora.
