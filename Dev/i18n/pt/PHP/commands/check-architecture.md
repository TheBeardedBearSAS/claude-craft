---
description: Validação de Arquitetura PHP
argument-hint: [argumentos]
---

# Validação de Arquitetura PHP

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto PHP a auditar, padrão é o diretório atual)

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

Você é um arquiteto de software PHP especialista. Audite a arquitetura de um projeto PHP nativo (sem framework) contra Clean Architecture, Arquitetura Hexagonal, padrões táticos DDD e regras de autoloading PSR-4.

**Regras de referência**: `.claude/rules/php-architecture.md`

### Etapa 1: Análise da Estrutura do Projeto

1. Identifique a raiz do projeto (use $ARGUMENTS ou diretório atual)
2. Leia `composer.json` — verifique versão PHP (≥ 8.4, idealmente 8.5) e mapeamento autoload PSR-4
3. Mapeie a estrutura do diretório `src/` e camadas esperadas
4. Liste todos os namespaces de nível superior

**Estrutura esperada** (PHP nativo):

```
src/
├── Domain/              # Lógica de negócio pura (Entidades, Value Objects, Domain Events)
│   ├── Entity/
│   ├── ValueObject/
│   ├── Event/
│   └── Exception/
├── Application/         # Use Cases / Commands / Queries, orquestração
│   ├── UseCase/
│   ├── DTO/
│   └── Port/            # Interfaces consumidas pela Application
└── Infrastructure/      # Adapters (DB, HTTP, filesystem, APIs externas)
    ├── Persistence/
    ├── Http/
    └── Adapter/
tests/
├── Unit/
├── Integration/
└── Fixtures/
```

### Etapa 2: Verificação de Separação de Camadas (6 pts)

- [ ] Camada Domain tem **zero** dependências em Application ou Infrastructure
- [ ] Camada Application depende **apenas** de abstrações Domain (interfaces/portas)
- [ ] Infrastructure implementa portas Domain/Application, nunca o inverso
- [ ] Nenhum código específico de framework vaza para Domain
- [ ] `declare(strict_types=1);` no topo de cada arquivo

**Comando de detecção**:

```bash
docker compose exec app grep -rn "use.*Infrastructure" src/Domain/ src/Application/
# Esperado: nenhuma correspondência
```

### Etapa 3: Portas e Adaptadores (5 pts)

- [ ] Portas de entrada (interfaces) definidas em `Application/Port/In/` ou similar
- [ ] Portas de saída definidas em `Application/Port/Out/` ou `Domain/Port/`
- [ ] Adaptadores em `Infrastructure/` implementam essas portas
- [ ] Injeção de Dependência via construtor (sem service locator, sem estado estático)

### Etapa 4: Modelagem de Domínio (5 pts)

- [ ] Entidades têm identidade e invariantes aplicadas em construtores / named constructors
- [ ] Value Objects são imutáveis (classes `readonly` PHP 8.2+, ou propriedades readonly)
- [ ] Agregados encapsulam invariantes; mutação externa impossível
- [ ] Domain events emitidos para mudanças de estado relevantes
- [ ] Exceções são específicas do domínio (estendem uma `DomainException` base)

### Etapa 5: Use Cases (4 pts)

- [ ] Um use case = uma classe com um único método público (`execute()`, `handle()`, ou `__invoke()`)
- [ ] Entrada como um objeto DTO / Command / Query dedicado
- [ ] Saída como um DTO de retorno ou void (para comandos)
- [ ] Limites transacionais tratados no nível Application, não Domain

### Etapa 6: PSR-4 & Regras de Dependência (3 pts)

- [ ] `composer.json` autoload é compatível com PSR-4
- [ ] Namespace corresponde exatamente à estrutura de diretórios
- [ ] Sem dependências circulares (`deptrac` ou `phparkitect` para verificar)
- [ ] Acoplamento entre módulos é explícito e documentado

**Comando de detecção**:

```bash
docker compose exec app composer dump-autoload --strict-psr
docker compose exec app vendor/bin/deptrac analyse --fail-on-uncovered
```

### Etapa 7: Padrões Alternativos (2 pts)

Aceite alternativas pragmáticas quando justificadas:

| Padrão | Quando aceitável |
|---|---|
| **Vertical Slice Architecture** | App pequeno, pesado em CRUD, sem reutilização entre features |
| **Modular Monolith** | Múltiplos contextos delimitados dentro de um implantável |
| **Simples em camadas** | Domínio é trivial — não sobre-engenheirar |

Sinalize sobre-engenharia (abstrações vazias, mapeamento excessivo de DTOs) como um problema.

## FORMATO DE SAÍDA

```
AUDITORIA DE ARQUITETURA PHP
=============================

PONTUAÇÃO: XX/25

SEPARAÇÃO DE CAMADAS (X/6)
  Pontos Fortes:
  - [...]
  Problemas:
  - [arquivo:linha] descrição

PORTAS & ADAPTADORES (X/5)
  [...]

MODELAGEM DE DOMÍNIO (X/5)
  [...]

USE CASES (X/4)
  [...]

PSR-4 & REGRAS DE DEPENDÊNCIA (X/3)
  [...]

ADEQUAÇÃO DO PADRÃO (X/2)
  [...]

TOP 3 AÇÕES:
1. [CRÍTICO] Descrição
   Arquivos: src/...
   Esforço: Baixo/Médio/Alto
2. [...]
3. [...]

PADRÃO RECOMENDADO: [Clean / Hexagonal / VSA / Modular Monolith]
```

## NOTAS IMPORTANTES

- Use Docker para todas as ferramentas de análise (`composer`, `deptrac`, `phparkitect`)
- Cite referências concretas `arquivo:linha` para cada problema
- Não imponha Clean Architecture se o domínio for trivial — favoreça o pragmatismo
- Sinalize vazamentos de framework imediatamente (um projeto PHP nativo não deve depender de classes Symfony/Laravel)
