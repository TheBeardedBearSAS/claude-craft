---
description: Verificação da Arquitetura Flutter
argument-hint: [arguments]
---

# Verificação da Arquitetura Flutter

## Argumentos

$ARGUMENTS

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

Você é um especialista Flutter responsável por auditar a arquitetura do projeto segundo os princípios de Clean Architecture.

### Etapa 1 : Análise da estrutura do projeto

- [ ] Identificar a estrutura de pastas do projeto
- [ ] Localizar os arquivos `pubspec.yaml` e `analysis_options.yaml`
- [ ] Referenciar as regras de `/rules/02-architecture.md`
- [ ] Referenciar os princípios SOLID de `/rules/04-solid-principles.md`

### Etapa 2 : Verificações de Arquitetura (25 pontos)

#### 2.1 Organização em camadas de Clean Architecture (10 pontos)
- [ ] **Domain Layer** : Entidades e casos de uso isolados (0-4 pts)
  - Verificar `lib/domain/entities/` e `lib/domain/usecases/`
  - Nenhuma dependência em direção a data ou presentation
  - Entidades puras com lógica de negócio apenas
- [ ] **Data Layer** : Repositories, DataSources, Models (0-3 pts)
  - Verificar `lib/data/repositories/`, `lib/data/datasources/`, `lib/data/models/`
  - Implementação das interfaces do domain
  - Separação entre datasources remote/local
- [ ] **Presentation Layer** : UI, States, BLoCs/Providers (0-3 pts)
  - Verificar `lib/presentation/pages/`, `lib/presentation/widgets/`, `lib/presentation/blocs/`
  - Separação entre lógica UI/Business logic
  - Widgets reutilizáveis em `/widgets/common/`

#### 2.2 Injeção de dependências (5 pontos)
- [ ] **Container DI** configurado (get_it, injectable, riverpod) (0-3 pts)
- [ ] **Sem new()** direto nos widgets (0-2 pts)
- [ ] Todas as dependências injetadas via construtor

#### 2.3 Separação de responsabilidades (5 pontos)
- [ ] **Single Responsibility** : Uma classe = uma responsabilidade (0-2 pts)
- [ ] **Interface Segregation** : Interfaces pequenas e especializadas (0-2 pts)
- [ ] **Dependency Inversion** : Depende de abstrações, não de implementações (0-1 pt)

#### 2.4 Estrutura modular (5 pontos)
- [ ] **Features isoladas** : Código organizado por funcionalidade (0-2 pts)
- [ ] **Core/Shared** : Utilitários comuns separados (0-2 pts)
- [ ] **Sem acoplamento** entre features (0-1 pt)

### Etapa 3 : Cálculo do score

```
SCORE ARQUITETURA = Total de pontos / 25

Interpretação :
✅ 20-25 pts : Arquitetura excelente
⚠️ 15-19 pts : Arquitetura correta, melhorias recomendadas
⚠️ 10-14 pts : Arquitetura a melhorar
❌ 0-9 pts : Arquitetura problemática
```

### Etapa 4 : Relatório detalhado

Gere um relatório com:

#### 📊 SCORE ARQUITETURA : XX/25

#### ✅ Pontos fortes
- Lista das boas práticas detectadas
- Exemplos de código bem estruturado

#### ⚠️ Pontos de atenção
- Violações detectadas com arquivos e linhas
- Impacto na manutenibilidade

#### ❌ Violações críticas
- Problemas arquiteturais maiores
- Acoplamento forte, dependências circulares

#### 🎯 TOP 3 AÇÕES PRIORITÁRIAS

1. **[PRIORIDADE ALTA]** Ação mais importante com impacto e esforço estimado
2. **[PRIORIDADE MÉDIA]** Segunda ação com justificativa
3. **[PRIORIDADE BAIXA]** Terceira ação para melhoria contínua

---

**Nota** : Este relatório foca apenas na arquitetura. Para uma auditoria completa, use `/check-compliance`.
