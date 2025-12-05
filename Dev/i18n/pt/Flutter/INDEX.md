# Índice Completo - Flutter Development Rules

## Visão Geral

Estrutura completa de regras de desenvolvimento Flutter para Claude Code, inspirada na estrutura Symfony mas adaptada para Flutter/Dart.

**Total**: 26 arquivos
- 1 CLAUDE.md.template principal
- 1 README guia de uso
- 14 arquivos de regras (rules/)
- 5 templates de código (templates/)
- 4 checklists (checklists/)
- 1 índice (este arquivo)

---

## Arquivos Principais

### CLAUDE.md.template
Arquivo principal para copiar em cada projeto Flutter. Contém:
- Contexto do projeto
- Regras fundamentais
- Workflow obrigatório
- Comandos Makefile
- Instruções para Claude

### README.md
Guia de uso completo:
- Como inicializar um novo projeto
- Estrutura recomendada
- Workflow de desenvolvimento
- Configuração das ferramentas

---

## Rules (14 arquivos)

### 00-project-context.md.template
Template de contexto do projeto com placeholders:
- Visão geral do projeto
- Arquitetura global
- Stack tecnológica
- Especificidades e convenções
- Variáveis a substituir: {{PROJECT_NAME}}, {{TECH_STACK}}, etc.

### 01-workflow-analysis.md (27 KB)
Metodologia obrigatória antes da codificação:
- Fase 1: Compreensão da necessidade
- Fase 2: Exploração do código existente
- Fase 3: Concepção da solução
- Fase 4: Plano de teste
- Fase 5: Estimativa e planejamento
- Fase 6: Revisão pós-implementação
- Templates de análise
- Exemplos concretos (feature favoritos)

### 02-architecture.md (53 KB)
Clean Architecture para Flutter:
- As 3 camadas (Domain, Data, Presentation)
- Estrutura de pastas detalhada
- Entities, Repositories, Use Cases
- Models, DataSources
- Padrão BLoC completo
- Dependency Injection
- Exemplos de código completos

### 03-coding-standards.md (24 KB)
Padrões de código Dart/Flutter:
- Convenções de nomenclatura
- Formatação e estilo
- Organização do código
- Widgets Flutter (const, extração)
- Tipos e inferência
- Documentação (dartdoc)
- Extensões Dart
- Async/await
- Configuração de linters

### 04-solid-principles.md (38 KB)
Princípios SOLID com exemplos Flutter:
- S - Single Responsibility Principle
- O - Open/Closed Principle
- L - Liskov Substitution Principle
- I - Interface Segregation Principle
- D - Dependency Inversion Principle
- Exemplos concretos para cada princípio
- Widgets, BLoCs, repositories
- Diagramas de dependências

### 05-kiss-dry-yagni.md (30 KB)
Princípios de simplicidade:
- KISS: Keep It Simple, Stupid
- DRY: Don't Repeat Yourself
- YAGNI: You Aren't Gonna Need It
- Exemplos de super-complexificação vs soluções simples
- State management adaptado à complexidade
- Widgets reutilizáveis
- Equilíbrio entre princípios

### 06-tooling.md (10 KB)
Ferramentas e comandos:
- Flutter CLI essenciais
- Comandos Pub
- Docker para Flutter
- Makefile completo
- FVM (Flutter Version Management)
- Scripts úteis
- CI/CD (GitHub Actions, GitLab CI)
- Configuração VS Code
- DevTools

### 07-testing.md (19 KB)
Estratégia de teste completa:
- Pirâmide de testes (70% unit, 20% widget, 10% integration)
- Testes unitários (entities, use cases, BLoCs)
- Testes de widgets
- Testes de integração
- Golden tests
- Mocking com Mocktail
- Test coverage
- Boas práticas (padrão AAA)

### 08-quality-tools.md
Ferramentas de qualidade:
- Dart Analyze
- DCM (Dart Code Metrics)
- Very Good Analysis
- Flutter Lints
- Regras de lint personalizadas
- Integração CI/CD
- Targets Makefile

### 09-git-workflow.md
Workflow Git:
- Conventional Commits
- Estratégia de branches (GitFlow)
- Pre-commit hooks
- CI/CD
- Comandos Git úteis

### 10-documentation.md
Padrões de documentação:
- Formato Dartdoc
- Estrutura README.md
- CHANGELOG.md
- Documentação API
- Exemplos de documentação completa

### 11-security.md
Segurança Flutter:
- flutter_secure_storage
- Gestão de API keys
- Variáveis de ambiente
- Ofuscação
- HTTPS e certificate pinning
- Validação de entradas
- Autenticação (JWT)
- Permissões
- Checklist de segurança

### 12-performance.md
Otimização de desempenho:
- const widgets
- Otimização ListView
- Imagens (caching, lazy loading)
- Evitar rebuilds
- DevTools profiling
- Lazy loading & code splitting
- Checklist de performance

### 13-state-management.md
Padrões de state management:
- Árvore de decisão (quando usar o quê)
- StatefulWidget
- ValueNotifier
- Provider
- Riverpod (recomendado)
- BLoC (recomendado para apps complexas)
- Comparação dos padrões
- Best practices
- Recomendações por tamanho de projeto

---

## Templates (5 arquivos)

### widget.md
Templates de widgets:
- Stateless Widget
- Stateful Widget
- Consumer Widget (BLoC)

### bloc.md
Template BLoC completo:
- Events
- States
- Classe BLoC

### repository.md
Template Repository:
- Interface (camada Domain)
- Implementação (camada Data)

### test-widget.md
Template testes de widgets:
- Setup básico
- Testes de exibição
- Testes de interações
- Testes de atualização

### test-unit.md
Template testes unitários:
- Setup com mocks
- Testes de sucesso
- Testes de erro
- Testes de validação

---

## Checklists (4 arquivos)

### pre-commit.md
Checklist antes do commit:
- Qualidade do código
- Testes
- Documentação
- Git
- Arquitetura
- Performance
- Segurança

### new-feature.md
Checklist nova feature:
- Análise
- Camada Domain
- Camada Data
- Camada Presentation
- Integração
- Documentação
- Qualidade

### refactoring.md
Checklist refactoring seguro:
- Preparação
- Durante o refactoring
- Verificações
- Antes do merge

### security.md
Checklist auditoria de segurança:
- Dados sensíveis
- API & Network
- Autenticação
- Validação
- Permissões
- Produção

---

## Estatísticas

### Tamanho dos arquivos

| Arquivo | Tamanho | Linhas aprox. |
|---------|---------|---------------|
| 01-workflow-analysis.md | 27 KB | ~800 |
| 02-architecture.md | 53 KB | ~1600 |
| 03-coding-standards.md | 24 KB | ~700 |
| 04-solid-principles.md | 38 KB | ~1200 |
| 05-kiss-dry-yagni.md | 30 KB | ~900 |
| 06-tooling.md | 10 KB | ~300 |
| 07-testing.md | 19 KB | ~600 |
| 08-quality-tools.md | ~5 KB | ~150 |
| 09-git-workflow.md | ~4 KB | ~120 |
| 10-documentation.md | ~5 KB | ~150 |
| 11-security.md | ~6 KB | ~180 |
| 12-performance.md | ~5 KB | ~150 |
| 13-state-management.md | ~7 KB | ~210 |
| **TOTAL Rules** | **~233 KB** | **~7060 linhas** |

### Cobertura

**Assuntos cobertos**:
- ✅ Arquitetura (Clean Architecture completa)
- ✅ Padrões de código (Effective Dart)
- ✅ Princípios de design (SOLID, KISS, DRY, YAGNI)
- ✅ Testes (Unit, Widget, Integration, Golden)
- ✅ Ferramentas (CLI, Docker, Makefile, CI/CD)
- ✅ Qualidade (Analyze, Linters, Metrics)
- ✅ Workflow Git (Conventional Commits, Branching)
- ✅ Documentação (Dartdoc, README, CHANGELOG)
- ✅ Segurança (Storage, API keys, HTTPS, Auth)
- ✅ Performance (Otimizações, Profiling)
- ✅ State management (BLoC, Riverpod, Provider)
- ✅ Templates de código
- ✅ Checklists práticas

---

## Uso

### Para um novo projeto

1. Copiar `CLAUDE.md.template` para `.claude/CLAUDE.md`
2. Copiar `rules/`, `templates/`, `checklists/` para `.claude/`
3. Personalizar com as informações do projeto
4. Criar `Makefile` na raiz
5. Configurar `analysis_options.yaml`
6. Seguir as regras!

### Para Claude Code

Ler `.claude/CLAUDE.md` no início de cada sessão para:
- Compreender a arquitetura do projeto
- Conhecer as convenções
- Aplicar as boas práticas
- Usar os templates apropriados
- Seguir as checklists

---

## Comparação com Symfony Rules

### Semelhanças
- Estrutura modular (rules/, templates/, checklists/)
- Workflow de análise obrigatório
- Princípios SOLID
- Estratégia de testes
- Workflow Git
- Padrões de documentação

### Especificidades Flutter
- Clean Architecture (ao invés da arquitetura Symfony)
- Composição de widgets
- State management (BLoC, Riverpod)
- Otimizações const
- DevTools profiling
- flutter_secure_storage
- Material Design / Cupertino

### Melhorias
- Templates de código mais detalhados
- Mais exemplos
- Checklists mais completas
- Árvores de decisão (state management, arquitetura)
- Diagramas de dependências

---

## Manutenção

### Atualização

Atualizar as regras quando:
- Nova versão do Flutter/Dart
- Novas best practices
- Novos packages importantes
- Feedback do projeto

### Versionamento

Formato: `MAJOR.MINOR.PATCH`
- MAJOR: Mudança de arquitetura ou princípios
- MINOR: Adição de regras ou templates
- PATCH: Correções e esclarecimentos

**Versão atual**: 1.0.0

---

## Recursos Complementares

### Documentação
- [Flutter Documentation](https://docs.flutter.dev/)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Packages Essenciais
- flutter_bloc: State management
- riverpod: State management
- freezed: Geração de código
- dartz: Programação funcional
- get_it: Dependency injection
- dio: Cliente HTTP
- mocktail: Testing

---

**Criado em**: 2024-12-03
**Última atualização**: 2024-12-03
**Versão**: 1.0.0
**Autor**: Claude Code Assistant
