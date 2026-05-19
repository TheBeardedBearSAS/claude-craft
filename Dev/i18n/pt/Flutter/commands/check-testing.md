---
description: Verificação de Testes Flutter
argument-hint: [arguments]
---

# Verificação de Testes Flutter

## Argumentos

$ARGUMENTS

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

Você é um especialista Flutter responsável por auditar a estratégia e a cobertura de testes do projeto.

### Etapa 1 : Análise da configuração de testes

- [ ] Localizar a pasta `/test/` e sua estrutura
- [ ] Verificar as dependências de teste em `pubspec.yaml` (flutter_test, mockito, bloc_test)
- [ ] Referenciar as regras de `/rules/07-testing.md`
- [ ] Referenciar as ferramentas de `/rules/08-quality-tools.md`
- [ ] Verificar a configuração de cobertura

### Etapa 2 : Verificações de Testes (25 pontos)

#### 2.1 Cobertura de testes (8 pontos)
- [ ] **Testes unitários** presentes para a lógica de negócio (0-3 pts)
  - Domain layer : Entities, UseCases
  - Data layer : Repositories, Models
  - Mínimo 70% de cobertura no domain
- [ ] **Testes de widgets** para os componentes de UI (0-3 pts)
  - Pelo menos os widgets críticos testados
  - Testes de interação do usuário (tap, scroll, input)
- [ ] **Cobertura global** medida e > 60% (0-2 pts)
  - Executar : `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter test --coverage`
  - Analisar `coverage/lcov.info`

#### 2.2 Qualidade dos testes (7 pontos)
- [ ] **Padrão AAA** (Arrange-Act-Assert) respeitado (0-2 pts)
  - Testes estruturados e legíveis
  - Um teste = um comportamento
- [ ] **Testes isolados** com mocks/stubs (0-2 pts)
  - Uso de mockito ou mocktail
  - Sem dependências externas (API, DB) nos testes
- [ ] **Testes descritivos** com nomes explícitos (0-2 pts)
  - Formato : `test('should return user when authentication succeeds')`
- [ ] **Sem testes flaky** (instáveis) (0-1 pt)

#### 2.3 Tipos de testes (6 pontos)
- [ ] **Unit tests** : Lógica pura (0-2 pts)
  - UseCases, Validators, Utils
  - Testes rápidos (< 100ms por teste)
- [ ] **Widget tests** : UI e interações (0-2 pts)
  - `testWidgets()` para componentes
  - Pumping e eventos simulados
- [ ] **Golden tests** : Testes visuais de regressão (0-1 pt)
  - Snapshots de widgets críticos
- [ ] **Integration tests** : Fluxos completos (0-1 pt)
  - Testes end-to-end para user stories críticas

#### 2.4 Mocks e fixtures (4 pontos)
- [ ] **Mocks limpos** gerados com mockito/mocktail (0-2 pts)
  - Arquivos `*.mocks.dart` atualizados
  - Comando : `flutter pub run build_runner build`
- [ ] **Fixtures/test data** organizados (0-2 pts)
  - Pasta `/test/fixtures/` com JSON, dados de teste
  - Reutilizáveis entre testes

### Etapa 3 : Execução dos testes

```bash
# Executar os testes com cobertura
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable sh -c "
  flutter test --coverage && \
  flutter test --reporter expanded
"
```

Analisar os resultados :
- [ ] Número total de testes
- [ ] Testes passados/falhos
- [ ] Cobertura por arquivo

### Etapa 4 : Cálculo do score

```
SCORE TESTING = Total de pontos / 25

Interpretação :
✅ 20-25 pts : Cobertura excelente
⚠️ 15-19 pts : Cobertura correta, a completar
⚠️ 10-14 pts : Cobertura insuficiente
❌ 0-9 pts : Testes faltando ou inadequados
```

### Etapa 5 : Relatório detalhado

Gere um relatório com:

#### 📊 SCORE TESTING : XX/25

#### ✅ Pontos fortes
- Tipos de testes presentes
- Boa cobertura detectada
- Exemplos de testes bem escritos

#### ⚠️ Pontos de atenção
- Arquivos sem testes
- Cobertura < 60%
- Testes faltando em features críticas

#### ❌ Violações críticas
- Nenhum teste presente
- Testes flaky detectados
- Sem mocks, dependências externas

#### 📈 Estatísticas de cobertura

```
Domain Layer     : XX% (objetivo : 70%)
Data Layer       : XX% (objetivo : 60%)
Presentation Layer: XX% (objetivo : 50%)
TOTAL            : XX% (objetivo : 60%)
```

#### 💡 Arquivos prioritários para testar

1. `/lib/domain/usecases/authenticate_user.dart` - Lógica crítica
2. `/lib/presentation/pages/home_page.dart` - UI principal
3. `/lib/data/repositories/user_repository_impl.dart` - Acesso a dados

#### 🎯 TOP 3 AÇÕES PRIORITÁRIAS

1. **[PRIORIDADE ALTA]** Adicionar testes unitários para os UseCases críticos (Impacto : confiabilidade)
2. **[PRIORIDADE MÉDIA]** Aumentar cobertura para 60% mínimo (Impacto : confiança)
3. **[PRIORIDADE BAIXA]** Adicionar golden tests para widgets reutilizáveis (Impacto : regressão UI)

---

**Nota** : Este relatório foca apenas nos testes. Para uma auditoria completa, use `/check-compliance`.
