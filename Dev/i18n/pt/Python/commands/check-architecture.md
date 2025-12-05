# Verificar Arquitetura Python

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto a analisar)

## MISSÃO

Realizar uma auditoria completa da arquitetura do projeto Python seguindo os princípios de Arquitetura Limpa e Arquitetura Hexagonal definidos nas regras do projeto.

### Passo 1: Analisar Estrutura do Projeto

Examinar estrutura de diretórios e identificar:
- [ ] Presença das camadas Domain/Application/Infrastructure/Presentation
- [ ] Separação clara entre camadas (sem dependências invertidas)
- [ ] Organização de módulos por domínio de negócio
- [ ] Estrutura de pacotes consistente com regras de arquitetura

**Referência**: `rules/02-architecture.md` seções "Clean Architecture" e "Hexagonal Architecture"

### Passo 2: Verificar Dependências Entre Camadas

Analisar imports e dependências:
- [ ] Domínio não depende de nenhuma outra camada
- [ ] Aplicação depende apenas do Domínio
- [ ] Infraestrutura depende apenas de Domínio e Aplicação
- [ ] Apresentação não contém lógica de negócio
- [ ] Regra de dependência respeitada (apenas para dentro)

**Verificar**: Sem imports de camadas externas em Domain/Application

### Passo 3: Interfaces e Portas

Verificar implementação de portas e adaptadores:
- [ ] Interfaces (portas) definidas em Domain/Application
- [ ] Implementações (adaptadores) em Infrastructure
- [ ] Uso de injeção de dependência
- [ ] Sem acoplamento forte com frameworks externos

**Referência**: `rules/02-architecture.md` seção "Ports and Adapters"

### Passo 4: Entidades e Value Objects

Verificar modelagem do domínio:
- [ ] Entidades ricas com lógica de negócio encapsulada
- [ ] Value objects imutáveis
- [ ] Agregados delimitados adequadamente
- [ ] Domain Events se aplicável
- [ ] Sem lógica de infraestrutura em entidades

**Referência**: `rules/02-architecture.md` seção "Domain Layer"

### Passo 5: Serviços e Casos de Uso

Analisar organização da lógica de aplicação:
- [ ] Use Cases/Application Services claramente identificados
- [ ] Um Use Case = Uma ação de negócio
- [ ] Domain Services para lógica de negócio complexa
- [ ] Sem lógica de negócio em controllers/handlers
- [ ] Transações gerenciadas no nível de Application

**Referência**: `rules/02-architecture.md` seção "Application Layer"

### Passo 6: Princípios SOLID

Verificar aplicação dos princípios SOLID:
- [ ] Single Responsibility: Uma classe = Uma razão para mudar
- [ ] Open/Closed: Extensão através de herança/composição, não modificação
- [ ] Liskov Substitution: Subtipos são substituíveis
- [ ] Interface Segregation: Interfaces específicas e mínimas
- [ ] Dependency Inversion: Dependência de abstrações

**Referência**: `rules/04-solid-principles.md`

### Passo 7: Calcular Pontuação

Atribuição de pontos (de 25):
- Estrutura e separação de camadas: 6 pontos
- Respeito às dependências: 6 pontos
- Ports and Adapters: 4 pontos
- Modelagem do domínio: 4 pontos
- Use Cases e Services: 3 pontos
- Princípios SOLID: 2 pontos

## FORMATO DE SAÍDA

```
AUDITORIA DE ARQUITETURA PYTHON
================================

PONTUAÇÃO GERAL: XX/25

PONTOS FORTES:
- [Lista de pontos positivos identificados]

MELHORIAS:
- [Lista de melhorias menores]

PROBLEMAS CRÍTICOS:
- [Lista de violações sérias de arquitetura]

DETALHES POR CATEGORIA:

1. ESTRUTURA E CAMADAS (XX/6)
   Status: [Detalhes da estrutura]

2. DEPENDÊNCIAS (XX/6)
   Status: [Análise de dependências]

3. PORTS AND ADAPTERS (XX/4)
   Status: [Implementação de interfaces]

4. MODELAGEM DO DOMÍNIO (XX/4)
   Status: [Qualidade de entidades e VOs]

5. USE CASES (XX/3)
   Status: [Organização da lógica de aplicação]

6. PRINCÍPIOS SOLID (XX/2)
   Status: [Aplicação dos princípios SOLID]

TOP 3 AÇÕES PRIORITÁRIAS:
1. [Ação mais crítica com impacto estimado]
2. [Segunda ação prioritária]
3. [Terceira ação prioritária]
```

## NOTAS

- Usar `grep`, `find` e análise de código para detectar violações
- Fornecer exemplos concretos de arquivos/classes problemáticos
- Sugerir refatorações precisas para cada problema identificado
- Priorizar ações baseado no impacto na manutenibilidade
