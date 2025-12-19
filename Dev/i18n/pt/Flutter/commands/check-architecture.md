---
description: Verificar Arquitetura do Projeto Flutter
---

# Verificar Arquitetura do Projeto Flutter

Verifique se o projeto Flutter segue os princípios de Clean Architecture e boas práticas de organização de código.

## Análise a Realizar

### 1. Estrutura de Pastas

Verificar se existe:
```
lib/
  core/
    errors/
    usecases/
    utils/
  features/
    [feature]/
      data/
        datasources/
        models/
        repositories/
      domain/
        entities/
        repositories/
        usecases/
      presentation/
        bloc/
        pages/
        widgets/
```

### 2. Separação de Camadas

- [ ] Camada Domain isolada (sem dependências de Flutter)
- [ ] Camada Data implementa interfaces do Domain
- [ ] Camada Presentation usa apenas Domain
- [ ] Sem imports invertidos

### 3. Injeção de Dependências

- [ ] GetIt, Riverpod ou Provider configurado
- [ ] Repositories injetados
- [ ] UseCases injetados
- [ ] BLoCs/Controllers injetados

### 4. Patterns

- [ ] Repository Pattern implementado
- [ ] Use Cases para lógica de negócio
- [ ] Entities vs Models separados
- [ ] Gerenciamento de estado consistente

## Saída

Produza um relatório indicando:
- Conformidade com Clean Architecture (0-100%)
- Violações identificadas
- Recomendações de refatoração
