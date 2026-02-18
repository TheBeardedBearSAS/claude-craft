---
description: Validar o Tech Spec contra o quality gate (≥90%)
argument-hint: [arquivo-techspec]
---

# Validar o Tech Spec Gate

Valida uma Especificacao Tecnica contra o quality gate Tech Spec.
O Tech Spec deve atingir pelo menos 90% para ser aprovado.

## Argumentos

$ARGUMENTS (formato: [arquivo-techspec])
- **arquivo-techspec** (opcional): Caminho para o arquivo Tech Spec. Padrao: `docs/tech-spec.md`

## Criterios do Gate

| Criterio | Peso | Obrigatorio | Descricao |
|----------|------|-------------|-----------|
| Visao geral da Arquitetura | 12% | Sim | Descricao do design do sistema |
| Diagrama de Arquitetura | 10% | Sim | Representacao visual |
| Componentes | 12% | Sim | Definicoes de modulos/servicos |
| Modelo de dados | 10% | Sim | Design de banco de dados/entidades |
| Contratos de API | 10% | Sim | Especificacoes de endpoints |
| Seguranca | 12% | Sim | Auth e medidas de seguranca |
| Performance | 8% | Nao | Requisitos de performance |
| Tratamento de erros | 8% | Nao | Estrategia de erros |
| Estrategia de testes | 10% | Sim | Abordagem de testes |
| Deploy | 8% | Nao | CI/CD e release |

**Limite: 90%**

## Processo

### Etapa 1: Localizar o arquivo Tech Spec

1. Usar o caminho fornecido ou o padrao `docs/tech-spec.md`
2. Verificar se o arquivo existe
3. Carregar o conteudo para analise

### Etapa 2: Validar cada criterio

Para cada criterio:
- Verificar as secoes e palavras-chave relevantes
- Verificar a existencia de diagramas (mermaid, imagens)
- Validar a profundidade tecnica

### Etapa 3: Calcular a pontuacao

Pontuacao = soma dos pesos dos criterios validados

### Etapa 4: Gerar o relatorio

Exibir os resultados detalhados com sugestoes.

## Formato de Saida

### Tech Spec Validado

```
═══════════════════════════════════════════════════════
          Validacao Quality Gate Tech Spec
═══════════════════════════════════════════════════════

Arquivo: docs/tech-spec.md
Limite: 90%

Resultados da validacao:
──────────────────────────────────────────────────────
✅ Visao geral da Arquitetura (12%)
   Encontrado: Clean Architecture com 4 camadas descritas

✅ Diagrama de Arquitetura (10%)
   Encontrado: Diagrama Mermaid na secao "System Design"

✅ Componentes (12%)
   Encontrado: 6 componentes com responsabilidades definidas

✅ Modelo de dados (10%)
   Encontrado: Definicoes de entidades com relacoes

✅ Contratos de API (10%)
   Encontrado: Endpoints REST com schemas de requisicao/resposta

✅ Seguranca (12%)
   Encontrado: JWT auth, RBAC, criptografia em repouso

✅ Performance (8%)
   Encontrado: Objetivos de latencia, estrategia de cache

✅ Tratamento de erros (8%)
   Encontrado: Codigos de erro, politicas de retry

✅ Estrategia de testes (10%)
   Encontrado: Planos de testes unitarios, integracao, e2e

✅ Deploy (8%)
   Encontrado: Pipeline CI/CD, deploy blue-green

Pontuacao: 100/100 (100%)
──────────────────────────────────────────────────────

✅ TECH SPEC GATE VALIDADO

Pronto para avancar para a criacao do Backlog.
Proximo: /arch:handoff po
═══════════════════════════════════════════════════════
```

### Tech Spec Nao Validado

```
═══════════════════════════════════════════════════════
          Validacao Quality Gate Tech Spec
═══════════════════════════════════════════════════════

Arquivo: docs/tech-spec.md
Limite: 90%

Resultados da validacao:
──────────────────────────────────────────────────────
✅ Visao geral da Arquitetura (12%)
❌ Diagrama de Arquitetura (10%)
   Ausente: Nenhum diagrama encontrado (mermaid, PNG, SVG)
✅ Componentes (12%)
✅ Modelo de dados (10%)
⚠️ Contratos de API (10%)
   Parcial: Endpoints listados mas sem schemas
❌ Seguranca (12%)
   Ausente: Nenhum auth/autorizacao definido
✅ Performance (8%)
✅ Tratamento de erros (8%)
✅ Estrategia de testes (10%)
⚠️ Deploy (8%)
   Parcial: CI mencionado mas sem estrategia de CD

Pontuacao: 68/100 (68%)
──────────────────────────────────────────────────────

❌ TECH SPEC GATE REPROVADO (necessario 90%, obtido 68%)

Acoes necessarias:
──────────────────────────────────────────────────────
1. Adicionar um diagrama de arquitetura
   ```mermaid
   graph TB
     Client --> API[API Gateway]
     API --> Service[Business Logic]
     Service --> DB[(Database)]
   ```

2. Definir a estrategia de seguranca
   - Metodo de autenticacao (JWT, OAuth2)
   - Modelo de autorizacao (RBAC, ABAC)
   - Abordagem de criptografia de dados

3. Completar os contratos de API com schemas
   - Schemas JSON de requisicao/resposta
   - Formatos de respostas de erro
   - Estrategia de versionamento

4. Adicionar estrategia de deploy
   - Etapas do pipeline CI/CD
   - Promocao entre ambientes
   - Procedimentos de rollback

Reexecutar apos correcoes: /gate:validate-techspec
═══════════════════════════════════════════════════════
```

## Exemplo

```
/gate:validate-techspec
/gate:validate-techspec docs/auth-tech-spec.md
```

## Revisao de Arquitetura

Considere criar um ADR para decisoes significativas:
```
/arch:adr "JWT vs autenticacao baseada em sessao"
```

Configuracao do gate: `.bmad/gates/techspec-gate.yaml`

## Próximo passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Se PASS (≥ limiar):                                     ║
║  → /gate:validate-backlog                                ║
║    Validar o backlog                                     ║
║                                                          ║
║  Se FAIL (< limiar):                                     ║
║  → Corrigir as especificações técnicas                   ║
║  → /gate:validate-techspec (re-run após correções)       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
