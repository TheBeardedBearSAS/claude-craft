---
description: Verificação Global de Conformidade do Projeto React Native
argument-hint: [arguments]
---

# Verificação Global de Conformidade do Projeto React Native

## Argumentos

$ARGUMENTS

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer uma investigação transversal.

## MISSÃO

Você é um especialista em conformidade de projetos React Native. Sua missão é orquestrar uma auditoria completa combinando as auditorias especializadas: arquitetura, qualidade de código, testes e segurança.

Este comando agrega os resultados de:
1. `/reactnative:check-architecture` (25 pontos)
2. `/reactnative:check-code-quality` (25 pontos)
3. `/reactnative:check-testing` (25 pontos)
4. `/reactnative:check-security` (25 pontos)

### Etapa 1: Executar as 4 auditorias especializadas

Executar sequencialmente (ou exibir os comandos a executar):

```bash
# 1. Auditoria de Arquitetura
/reactnative:check-architecture

# 2. Auditoria de Qualidade de Código
/reactnative:check-code-quality

# 3. Auditoria de Testes
/reactnative:check-testing

# 4. Auditoria de Segurança
/reactnative:check-security
```

### Etapa 2: Agregar resultados

Coletar as pontuações de cada auditoria:

```
┌─────────────────────────┬─────────┬─────────┬────────┐
│ Auditoria               │ Pontos  │ Máximo  │ Status │
├─────────────────────────┼─────────┼─────────┼────────┤
│ Arquitetura             │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Qualidade de Código     │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Testes                  │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Segurança               │ XX/25   │ 25      │ ✅/⚠️/❌│
├─────────────────────────┼─────────┼─────────┼────────┤
│ TOTAL GLOBAL            │ XX/100  │ 100     │ ✅/⚠️/❌│
└─────────────────────────┴─────────┴─────────┴────────┘
```

**Legenda:**
- ✅ Excelente (≥ 80/100)
- ⚠️ Atenção (60-79/100)
- ❌ Crítico (< 60/100)

### Etapa 3: Avaliação Global

## 📊 RELATÓRIO GLOBAL DE CONFORMIDADE

### 🎯 Pontuação Global: XX/100

**Avaliação:**
- 90-100: Projeto pronto para produção ✅
- 80-89: Bom projeto, melhorias menores ⚠️
- 70-79: Projeto aceitável, melhorias significativas necessárias ⚠️
- 60-69: Projeto problemático, grandes melhorias exigidas ❌
- < 60: Projeto crítico, refatoração necessária ❌

### 📈 Pontuações Detalhadas

#### 1. Arquitetura (XX/25)
- Estrutura Feature-Based: XX/8
- Organização de Pastas: XX/5
- Navegação: XX/4
- Arquitetura em Camadas: XX/4
- Assets: XX/4

**Status:** [✅/⚠️/❌]
**Ações Prioritárias:** [Top 2-3]

#### 2. Qualidade de Código (XX/25)
- TypeScript: XX/7
- ESLint: XX/6
- Prettier: XX/3
- SOLID: XX/4
- KISS/DRY/YAGNI: XX/5

**Status:** [✅/⚠️/❌]
**Ações Prioritárias:** [Top 2-3]

#### 3. Testes (XX/25)
- Configuração do Jest: XX/5
- Testes Unitários: XX/6
- Testes de Componentes: XX/6
- Testes de Integração: XX/4
- Testes E2E: XX/4

**Status:** [✅/⚠️/❌]
**Ações Prioritárias:** [Top 2-3]

#### 4. Segurança (XX/25)
- Dados Sensíveis: XX/6
- Segurança de API: XX/5
- Segurança de Código: XX/5
- Autenticação: XX/5
- Segurança da Plataforma: XX/4

**Status:** [✅/⚠️/❌]
**Ações Prioritárias:** [Top 2-3]

### 🚨 Problemas Críticos (Todas as Auditorias)

Liste todos os problemas críticos identificados nas 4 auditorias:

1. **[Problema Crítico #1]**
   - **Auditoria:** Arquitetura/Qualidade de Código/Testes/Segurança
   - **Impacto:** Crítico
   - **Localização:** [Arquivos]
   - **Ação:** [Ação imediata]

2. **[Problema Crítico #2]**
   - **Auditoria:** Arquitetura/Qualidade de Código/Testes/Segurança
   - **Impacto:** Crítico
   - **Localização:** [Arquivos]
   - **Ação:** [Ação imediata]

### ⚠️ Problemas de Alta Prioridade

Liste todos os problemas de alta prioridade:

1. **[Problema #1]**
   - **Auditoria:** [Nome]
   - **Impacto:** Alto
   - **Ação:** [Ação necessária]

2. **[Problema #2]**
   - **Auditoria:** [Nome]
   - **Impacto:** Alto
   - **Ação:** [Ação necessária]

### 🎯 PLANO DE AÇÃO GLOBAL

#### Fase 1: Imediata (Semana 1)
- [ ] [Ação Crítica #1]
- [ ] [Ação Crítica #2]
- [ ] [Ação Crítica #3]

#### Fase 2: Curto Prazo (Semanas 2-4)
- [ ] [Ação de Alta Prioridade #1]
- [ ] [Ação de Alta Prioridade #2]
- [ ] [Ação de Alta Prioridade #3]

#### Fase 3: Médio Prazo (Mês 2)
- [ ] [Ação de Média Prioridade #1]
- [ ] [Ação de Média Prioridade #2]
- [ ] [Ação de Média Prioridade #3]

### 📊 Métricas-Chave

```
Painel de Saúde do Projeto
════════════════════════════

Qualidade de Código
├─ Erros ESLint: XX
├─ Erros TypeScript: XX
├─ Duplicação de Código: XX%
└─ Dívida Técnica: XX horas

Testes
├─ Cobertura Total: XX%
├─ Testes Unitários: XX aprovados / XX total
├─ Testes de Componentes: XX aprovados / XX total
└─ Testes E2E: XX aprovados / XX total

Segurança
├─ Vulnerabilidades em Dependências: XX
├─ Segredos Expostos: XX
├─ Avisos de Segurança: XX
└─ Problemas OWASP: XX

Arquitetura
├─ Features: XX
├─ Componentes Compartilhados: XX
├─ Hooks Customizados: XX
└─ Profundidade de Pastas: XX níveis
```

### 🏆 Pontos Fortes

Liste de 5 a 10 pontos fortes gerais do projeto:
- [Ponto Forte 1]
- [Ponto Forte 2]
- [Ponto Forte 3]

### 🎓 Recomendações de Aprendizado

Com base nas lacunas identificadas, recomendar treinamentos/aprendizados para a equipe:
- [Recomendação 1: ex. treinamento em TypeScript strict mode]
- [Recomendação 2: ex. workshop de performance React Native]
- [Recomendação 3: ex. curso de boas práticas de segurança]

### 📚 Referências

- `.claude/rules/` - Todas as regras do projeto
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-top-10/)

---

## ✅ Checklist de Conformidade

Use este checklist para futuras verificações de conformidade:

### Antes do Deploy em Produção
- [ ] Pontuação global ≥ 80/100
- [ ] Sem problemas críticos
- [ ] Cobertura de testes ≥ 70%
- [ ] 0 vulnerabilidades de segurança (alta/crítica)
- [ ] 0 erros ESLint
- [ ] 0 erros TypeScript
- [ ] Todos os testes aprovados
- [ ] Documentação atualizada

---

**Pontuação Global: XX/100**
**Recomendação: [Pronto para Produção / Precisa de Melhorias / Requer Refatoração]**
