---
description: Verificacao de Estrategia de Testes
---

# Verificacao de Estrategia de Testes

Verificar se a aplicacao React tem cobertura de testes abrangente e segue melhores praticas de teste.

## O Que Este Comando Faz

1. **Analise de Testes**
   - Verificar cobertura de testes
   - Verificar qualidade dos testes
   - Validar padroes de teste
   - Verificar organizacao dos testes
   - Analisar performance dos testes

2. **Metricas Medidas**
   - Cobertura de codigo (linhas, funcoes, branches)
   - Contagem de testes por tipo (unit, integracao, e2e)
   - Tempo de execucao dos testes
   - Deteccao de testes instáveis
   - Caminhos criticos nao testados

3. **Relatorio Gerado**
   - Relatorio de cobertura
   - Testes faltantes
   - Score de qualidade dos testes
   - Recomendacoes

## Metas de Cobertura

```json
{
  "coverage": {
    "lines": 80,
    "functions": 80,
    "branches": 75,
    "statements": 80
  }
}
```

## Checklist de Testes

- [ ] Testes unitarios para todos os componentes
- [ ] Testes unitarios para todos os hooks
- [ ] Testes unitarios para todos os utilitarios
- [ ] Testes de integracao para funcionalidades
- [ ] Testes E2E para fluxos criticos
- [ ] Cobertura > 80%
- [ ] Sem testes instaveis
- [ ] Testes sao rapidos (< 1s cada)
- [ ] MSW para mock de API
- [ ] Utilitarios de teste extraidos
- [ ] Testes seguem padrao AAA
- [ ] Testes tem nomes descritivos
- [ ] Testes usam queries acessiveis
