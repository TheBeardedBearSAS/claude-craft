---
description: Verificacao de Qualidade de Codigo
---

# Verificacao de Qualidade de Codigo

Realizar uma analise abrangente de qualidade de codigo da aplicacao React.

## O Que Este Comando Faz

1. **Analise de Qualidade**
   - Executar linting (ESLint)
   - Verificacao de tipos (TypeScript)
   - Formatacao de codigo (Prettier)
   - Analise de complexidade
   - Deteccao de code smells
   - Verificacao de cobertura de testes

2. **Metricas Medidas**
   - Complexidade ciclomatica
   - Duplicacao de codigo
   - Cobertura de testes
   - Divida tecnica
   - Indice de manutenibilidade

3. **Relatorio Gerado**
   - Score de qualidade
   - Problemas por severidade
   - Recomendacoes de refatoracao
   - Tendencias ao longo do tempo

## Como Usar

```bash
# Verificacao completa de qualidade
npm run quality

# Verificacoes individuais
npm run lint
npm run type-check
npm run format:check
npm run test:coverage
```

## Metas de Metricas de Qualidade

- **Complexidade Ciclomatica**: < 10 por funcao
- **Cobertura de Testes**: > 80%
- **Duplicacao de Codigo**: < 3%

## Melhores Praticas

1. **Executar verificacoes localmente** antes de fazer push
2. **Automatizar no CI/CD** para aplicar padroes
3. **Definir quality gates** que devem passar
4. **Monitorar tendencias** ao longo do tempo
5. **Refatorar regularmente** para reduzir divida tecnica
6. **Documentar padroes** para a equipe
7. **Revisar metricas** em reunioes de equipe
8. **Celebrar melhorias**
