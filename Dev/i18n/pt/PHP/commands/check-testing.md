---
description: Análise de Cobertura de Testes PHP
argument-hint: [argumentos]
---

# Análise de Cobertura de Testes PHP

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto PHP a auditar, padrão é o diretório atual)

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

Audite estratégia de testes, cobertura e qualidade de um projeto PHP nativo. Avalie a pirâmide de testes (unitário, integração, end-to-end), práticas Pest / PHPUnit, pontuação de mutação e higiene de fixtures. Produza um relatório com pontuação de 25.

**Regras de referência**: `.claude/rules/php-testing.md`

### Etapa 1: Inventário da Suite de Testes

- [ ] Leia `phpunit.xml` / `phpunit.xml.dist` ou configuração Pest
- [ ] Verifique Pest 4.5+ (`pestphp/pest`) ou PHPUnit 12+
- [ ] Verifique Infection (`infection/infection`) para mutation testing
- [ ] Verifique Mockery, Prophecy ou doubles nativos PHPUnit
- [ ] Leia estrutura `tests/`: Unit / Integration / Feature / Browser

**Layout esperado**:

```
tests/
├── Unit/           # Rápido, sem IO, Domain + Application
├── Integration/    # DB, filesystem, adaptadores externos
├── Feature/        # Nível de use case, end-to-end dentro do limite da app
└── Fixtures/       # Factories de dados de teste, builders
```

### Etapa 2: Cobertura (7 pts)

```bash
docker compose exec app vendor/bin/pest --coverage --min=80
# ou
docker compose exec app vendor/bin/phpunit --coverage-text --coverage-html=var/coverage
```

Verificar:
- [ ] Cobertura de linha global ≥ 80%
- [ ] Cobertura da camada Domain ≥ 95% (lógica de negócio é onde bugs doem mais)
- [ ] Cobertura da camada Application ≥ 90%
- [ ] Cobertura Infrastructure ≥ 70% (testada por integração)
- [ ] Relatório de cobertura publicado no CI

**Pontuação**:
- ≥ 90%: 7 pts
- 80–89%: 5 pts
- 70–79%: 3 pts
- < 70%: 0 pts

### Etapa 3: Testes Unitários — Domain (6 pts)

- [ ] Todo Value Object tem testes de invariante (entradas inválidas lançam exceção)
- [ ] Toda Entity tem testes de identidade + comportamento
- [ ] Agregados testados para aplicação de invariantes
- [ ] Emissão de domain events testada
- [ ] Sem IO / sem mocks necessários (testes unitários verdadeiros)
- [ ] Padrão AAA (Arrange-Act-Assert) respeitado

### Etapa 4: Testes de Integração (4 pts)

- [ ] Adaptadores de banco de dados testados contra um DB real (Postgres/MySQL no Docker)
- [ ] Adaptadores HTTP testados com fixtures gravados (padrão VCR) ou servidor mock
- [ ] Adaptadores de filesystem testados com diretórios temporários
- [ ] **Sem mocks para o adaptador sob teste** — mocks mascaram quebras de contrato (ref: feedback do usuário para testes com DB real)

### Etapa 5: Qualidade de Teste — Pest / PHPUnit (3 pts)

- [ ] Nomes de teste descrevem comportamento: `it('rejects empty email')` / `testRejectsEmptyEmail`
- [ ] Um grupo de asserção por teste (múltiplos `expect()` OK se mesmo comportamento)
- [ ] Nenhum `$this->markTestSkipped()` sem referência a ticket
- [ ] Sem testes comentados
- [ ] `setUp` / `beforeEach` mantidos mínimos; preferir factories/builders

### Etapa 6: Fixtures & Data Builders (3 pts)

- [ ] Factories existem para agregados (ex.: `UserFactory::make()->withEmail(...)`)
- [ ] Sem dados mágicos em testes — constantes nomeadas ou builders
- [ ] Fixtures resetados entre testes (rollback de transação para testes de DB)
- [ ] Faker ou dados fake determinísticos

### Etapa 7: Mutation Testing & Isolamento (2 pts)

```bash
docker compose exec app vendor/bin/infection --min-msi=70 --min-covered-msi=80
```

Verificar:
- [ ] Mutation Score Indicator (MSI) ≥ 70% (alvo 80%)
- [ ] Testes são independentes (ordem aleatória deve passar)
- [ ] Sem estado mutável compartilhado entre testes
- [ ] Tempo e aleatoriedade injetados (sem `time()` / `rand()` diretamente)

## FORMATO DE SAÍDA

```
AUDITORIA DE TESTES PHP
========================

PONTUAÇÃO: XX/25

COBERTURA (X/7)
  Global          : XX%
  Domain          : XX%
  Application     : XX%
  Infrastructure  : XX%
  Lacunas:
  - src/Domain/... : 0% de cobertura

TESTES UNITÁRIOS — DOMAIN (X/6)
  Entities testadas: N/M
  Value Objects testados: N/M
  Faltando:
  - src/Domain/ValueObject/Email.php

INTEGRAÇÃO (X/4)
  DB real usado: sim/não
  Adaptadores mockados (sinal vermelho): N

QUALIDADE DE TESTE (X/3)
  Testes pulados sem ticket: N
  Testes comentados: N

FIXTURES (X/3)
  Factories presentes: sim/não
  Contagem de dados mágicos: N

MUTATION & ISOLAMENTO (X/2)
  MSI: XX%
  Testes instáveis detectados: N

TOP 3 AÇÕES:
1. [CRÍTICO] Adicionar testes unitários para src/Domain/...
2. Configurar Infection com MSI ≥ 70
3. Substituir mocks de adaptador por DB real em tests/Integration/
```

## NOTAS IMPORTANTES

- **Regra de ouro**: um bug corrigido nunca deve regredir → adicione um teste de regressão ANTES de corrigir
- Cobertura sozinha não é qualidade → reporte pontuação de mutação (Infection)
- Testes de integração NÃO DEVEM mockar o adaptador sob teste — mocks escondem quebras de contrato
- Pest 4.5+ vem com Browser Testing (baseado em Playwright) — útil para cenários end-to-end HTTP/CLI
- Use Docker para todo o pipeline de testes para evitar drift do ambiente local
