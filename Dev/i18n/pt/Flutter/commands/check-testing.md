---
description: Verificar Estratégia de Testes Flutter
---

# Verificar Estratégia de Testes Flutter

Analise a cobertura e qualidade dos testes do projeto Flutter.

## Análise de Testes

### 1. Cobertura de Testes

```bash
# Executar testes com cobertura
flutter test --coverage

# Gerar relatório HTML
genhtml coverage/lcov.info -o coverage/html

# Verificar cobertura por tipo
lcov --summary coverage/lcov.info
```

### 2. Tipos de Testes

Verificar presença de:
- [ ] Testes unitários (test/unit/)
- [ ] Testes de widgets (test/widget/)
- [ ] Testes de integração (integration_test/)
- [ ] Golden tests

### 3. Qualidade dos Testes

- [ ] Testes seguem padrão AAA (Arrange, Act, Assert)
- [ ] Mocks utilizados apropriadamente (mocktail/mockito)
- [ ] Testes isolados (sem dependências entre testes)
- [ ] Testes rápidos (< 5s para suite completa)
- [ ] Testes determinísticos

### 4. Métricas

Calcular:
- Cobertura total: target > 80%
- Cobertura de lógica de negócio: target > 90%
- Número de testes por tipo
- Tempo de execução

## Gaps Identificados

Liste áreas com:
- Cobertura < 80%
- Sem testes
- Testes quebrados ou pulados

## Recomendações

Priorize testes para:
1. Lógica de negócio crítica
2. Use cases importantes
3. BLoCs principais
4. Widgets complexos
