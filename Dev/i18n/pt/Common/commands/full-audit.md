# Auditoria Completa Multi-Tecnologia

Você é um auditor de código especialista. Você deve realizar uma auditoria completa de conformidade no projeto, detectando automaticamente as tecnologias presentes e aplicando as regras correspondentes.

## Argumentos
$ARGUMENTS

Se nenhum argumento for fornecido, detectar automaticamente todas as tecnologias.

## MISSÃO

### Etapa 1: Detecção de Tecnologias

Escanear o projeto para identificar tecnologias presentes:

| Arquivo | Tecnologia |
|---------|-------------|
| `composer.json` + `symfony/*` | Symfony |
| `pubspec.yaml` + `flutter:` | Flutter |
| `pyproject.toml` ou `requirements.txt` | Python |
| `package.json` + `react` (sem `react-native`) | React |
| `package.json` + `react-native` | React Native |

Para cada tecnologia detectada:
1. Carregar regras de `.claude/rules/`
2. Aplicar auditoria específica

### Etapa 2: Auditoria por Tecnologia

Para CADA tecnologia detectada, verificar:

#### Arquitetura (25 pontos)
- [ ] Camadas separadas (Domain/Application/Infrastructure)
- [ ] Dependências apontando para dentro (em direção ao domain)
- [ ] Estrutura de pastas conforme convenções
- [ ] Sem acoplamento de framework no domain
- [ ] Padrões arquiteturais respeitados

#### Qualidade de Código (25 pontos)
- [ ] Padrões de nomenclatura respeitados
- [ ] Linting/Analyze sem erros críticos
- [ ] Type hints/anotações presentes
- [ ] Classes públicas documentadas
- [ ] Complexidade ciclomática < 10

#### Testes (25 pontos)
- [ ] Cobertura ≥ 80%
- [ ] Testes unitários para domain
- [ ] Testes de integração presentes
- [ ] Testes E2E/Widget para UI
- [ ] Pirâmide de testes respeitada

#### Segurança (25 pontos)
- [ ] Sem segredos no código fonte
- [ ] Validação de entrada em todas as entradas
- [ ] Proteções OWASP (XSS, CSRF, injection)
- [ ] Dados sensíveis criptografados
- [ ] Dependências sem vulnerabilidades conhecidas

### Etapa 3: Executar Ferramentas

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov

# React/React Native
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
```

### Etapa 4: Calcular Pontuações

Para cada tecnologia, calcular:
- Pontuação Arquitetura: X/25
- Pontuação Qualidade de Código: X/25
- Pontuação Testes: X/25
- Pontuação Segurança: X/25
- **Pontuação Total: X/100**

### Etapa 5: Gerar Relatório

```
══════════════════════════════════════════════════════════════
📊 AUDITORIA MULTI-TECNOLOGIA - Pontuação Global: XX/100
══════════════════════════════════════════════════════════════

Tecnologias detectadas: [lista]
Data: AAAA-MM-DD

──────────────────────────────────────────────────────────────
🔷 SYMFONY - Pontuação: XX/100
──────────────────────────────────────────────────────────────

🏗️ Arquitetura (XX/25)
  ✅ Clean Architecture respeitada
  ✅ CQRS implementado corretamente
  ⚠️ 2 serviços acessam Repository diretamente

📝 Qualidade de Código (XX/25)
  ✅ PHPStan nível 8 - 0 erros
  ✅ Convenções PSR-12 respeitadas
  ⚠️ 5 métodos > 20 linhas

🧪 Testes (XX/25)
  ✅ Cobertura: 85%
  ✅ Testes unitários domain
  ⚠️ Sem testes E2E Panther

🔒 Segurança (XX/25)
  ✅ Sem segredos no código
  ✅ CSRF habilitado
  ⚠️ Dependência com CVE menor

──────────────────────────────────────────────────────────────
🔷 FLUTTER - Pontuação: XX/100
──────────────────────────────────────────────────────────────

[Mesma estrutura]

══════════════════════════════════════════════════════════════
📋 RESUMO GLOBAL
══════════════════════════════════════════════════════════════

| Tecnologia | Arquitetura | Código | Testes | Segurança | Total |
|-------------|------------|--------|--------|-----------|-------|
| Symfony     | XX/25      | XX/25  | XX/25  | XX/25     | XX/100|
| Flutter     | XX/25      | XX/25  | XX/25  | XX/25     | XX/100|
| MÉDIA       | XX/25      | XX/25  | XX/25  | XX/25     | XX/100|

══════════════════════════════════════════════════════════════
🎯 TOP 5 AÇÕES PRIORITÁRIAS
══════════════════════════════════════════════════════════════

1. [CRÍTICO] Descrição da ação 1
   → Impacto: +X pontos | Esforço: Baixo/Médio/Alto

2. [ALTO] Descrição da ação 2
   → Impacto: +X pontos | Esforço: Baixo/Médio/Alto

3. [MÉDIO] Descrição da ação 3
   → Impacto: +X pontos | Esforço: Baixo/Médio/Alto

4. [MÉDIO] Descrição da ação 4
   → Impacto: +X pontos | Esforço: Baixo/Médio/Alto

5. [BAIXO] Descrição da ação 5
   → Impacto: +X pontos | Esforço: Baixo/Médio/Alto
```

## Regras de Pontuação

### Deduções por Categoria

| Violação | Pontos Perdidos |
|-----------|---------------|
| Padrão arquitetural violado | -5 |
| Acoplamento framework/domain | -3 |
| Erro crítico de linting | -2 |
| Warning de linting | -1 |
| Método > 30 linhas | -1 |
| Cobertura < 80% | -5 |
| Sem testes unitários domain | -5 |
| Segredo no código | -10 |
| Vulnerabilidade CVE crítica | -10 |
| Vulnerabilidade CVE alta | -5 |

### Limiares de Qualidade

| Pontuação | Avaliação |
|-------|------------|
| 90-100 | Excelente |
| 75-89 | Bom |
| 60-74 | Aceitável |
| 40-59 | Necessita melhoria |
| < 40 | Crítico |
