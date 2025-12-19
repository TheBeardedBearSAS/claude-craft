---
description: Analisar Performance do Aplicativo Flutter
---

# Analisar Performance do Aplicativo Flutter

Analise a performance do aplicativo Flutter, identifique gargalos de renderização, problemas de memória e oportunidades de otimização.

## Ações a Realizar

### 1. Análise de Renderização

```bash
# Executar em modo profile
flutter run --profile

# No DevTools, verificar:
# - Frame rendering time
# - Rebuild Count
# - Layer Count
```

### 2. Análise de Memória

```bash
# Memory profiler no DevTools
# Verificar:
# - Memory leaks
# - Heap snapshots
# - Allocation tracking
```

### 3. Verificar Otimização de Widgets

```bash
# Buscar widgets sem const
grep -r "Widget build" lib/ | grep -v "const"

# Buscar ListView sem builder
grep -r "ListView(" lib/ | grep -v "ListView.builder"
```

### 4. Análise de Build

```bash
# Analisar tamanho do bundle
flutter build apk --analyze-size
flutter build appbundle --analyze-size

# Web bundle
flutter build web --source-maps
```

## Relatório de Saída

Gere um relatório contendo:

1. **Problemas de Performance Identificados**
   - Widgets não otimizados
   - Rebuilds desnecessários
   - Problemas de memória

2. **Métricas**
   - Tempo médio de frame
   - Uso de memória
   - Tamanho do app

3. **Recomendações**
   - Adicionar const
   - Usar builders
   - RepaintBoundary onde necessário
   - Otimização de imagens
