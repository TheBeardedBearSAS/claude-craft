---
description: Verificar Qualidade do Código Flutter
---

# Verificar Qualidade do Código Flutter

Execute uma análise completa da qualidade do código Flutter incluindo análise estática, formatação, complexidade e boas práticas.

## Verificações

### 1. Análise Estática

```bash
flutter analyze
```

Expectativa: 0 erros, 0 warnings

### 2. Formatação

```bash
dart format --set-exit-if-changed lib/ test/
```

### 3. Métricas de Código

```bash
dart run dart_code_metrics:metrics analyze lib

# Verificar:
# - Cyclomatic complexity < 20
# - Number of parameters < 5
# - Maximum nesting level < 5
# - Lines of code per file < 300
```

### 4. Dependências

```bash
flutter pub outdated
```

### 5. Verificações Manuais

- [ ] Effective Dart respeitado
- [ ] Widgets const utilizados
- [ ] Nomenclatura consistente
- [ ] Documentação presente
- [ ] Sem código duplicado
- [ ] Sem magic numbers
- [ ] Sem print() statements

## Relatório

Produza scores para:
- Análise estática: /100
- Formatação: /100
- Métricas: /100
- Boas práticas: /100

Score global: /100
