# ADR-NNNN: [Título Curto da Decisão]

**Status**: Proposed | Accepted | Deprecated | Superseded by [ADR-YYYY](YYYY-titulo.md)

**Data**: YYYY-MM-DD

**Decisores**: [Lista das pessoas que tomaram a decisão]

**Tags**: `tag1`, `tag2`, `tag3`

---

## Contexto e Problema

[Descreva o contexto e o problema que requer uma decisão arquitetural. Use 2-3 parágrafos para explicar:]
- Qual é a situação atual?
- Qual problema enfrentamos?
- Quais são as restrições (técnicas, de negócio, regulatórias)?
- Por que agora? (urgência, oportunidade)

## Opções Consideradas

**Importante**: Mínimo 2 opções devem ser documentadas para demonstrar uma análise comparativa.

### Opção 1: [Nome da opção]

**Descrição**: [Breve descrição da opção]

**Vantagens**:
- ✅ [Vantagem 1]
- ✅ [Vantagem 2]
- ✅ [Vantagem 3]

**Desvantagens**:
- ❌ [Desvantagem 1]
- ❌ [Desvantagem 2]
- ❌ [Desvantagem 3]

**Esforço**: [Estimativa: Baixo / Médio / Alto]

---

### Opção 2: [Nome da opção]

**Descrição**: [Breve descrição da opção]

**Vantagens**:
- ✅ [Vantagem 1]
- ✅ [Vantagem 2]

**Desvantagens**:
- ❌ [Desvantagem 1]
- ❌ [Desvantagem 2]

**Esforço**: [Estimativa: Baixo / Médio / Alto]

---

### Opção 3: [Nome da opção] (Opcional)

**Descrição**: [Breve descrição da opção]

**Vantagens**:
- ✅ [Vantagem 1]

**Desvantagens**:
- ❌ [Desvantagem 1]

**Esforço**: [Estimativa]

---

## Decisão

**Opção escolhida**: [Nome da opção escolhida]

**Justificativa**:

[Explique POR QUE esta opção foi escolhida. Use 2-4 parágrafos cobrindo:]
- Por que esta opção é superior às outras?
- Quais critérios foram determinantes? (desempenho, manutenibilidade, custo, conformidade)
- Quais hipóteses fundamentam esta decisão?
- Como esta decisão se alinha com a visão/estratégia global?

**Critérios de decisão**:
1. [Critério 1 e sua importância]
2. [Critério 2 e sua importância]
3. [Critério 3 e sua importância]

---

## Consequências

### Positivas ✅

- **[Consequência positiva 1]**: [Explicação]
- **[Consequência positiva 2]**: [Explicação]
- **[Consequência positiva 3]**: [Explicação]

### Negativas ⚠️

**Seja honesto**: Toda decisão tem compromissos. Documente-os claramente.

- **[Consequência negativa 1]**: [Explicação + mitigação se possível]
- **[Consequência negativa 2]**: [Explicação + mitigação se possível]
- **[Consequência negativa 3]**: [Explicação + mitigação se possível]

### Riscos Identificados 🔴

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| [Descrição do risco 1] | Alto/Médio/Baixo | Alta/Média/Baixa | [Ações de mitigação] |
| [Descrição do risco 2] | Alto/Médio/Baixo | Alta/Média/Baixa | [Ações de mitigação] |

---

## Implementação

### Arquivos Afetados

**A criar**:
- `caminho/para/arquivo1.php` - [Descrição]
- `caminho/para/arquivo2.yaml` - [Descrição]

**A modificar**:
- `caminho/para/arquivo3.php` - [O que muda]
- `caminho/para/arquivo4.yaml` - [O que muda]

**A excluir**:
- `caminho/para/arquivo-antigo.php` - [Razão]

### Dependências

**Composer**:
```bash
composer require vendor/package:^version
```

**NPM**:
```bash
npm install package@version
```

**Configuração**:
- Variável de ambiente: `VARIABLE_NAME` (.env)
- Serviço Symfony a configurar
- Migração Doctrine a criar

### Exemplo de Código

```php
<?php
// Exemplo concreto do projeto (NÃO genérico)
namespace App\Infrastructure\...;

class ExemploImplementacao
{
    public function metodoExemplo(): void
    {
        // Código concreto mostrando o uso
    }
}
```

**Uso**:
```php
// Em uma entidade, serviço, etc.
$exemplo = new ExemploImplementacao();
$exemplo->metodoExemplo();
```

---

## Validação e Testes

### Critérios de Aceitação

- [ ] [Critério 1 testável]
- [ ] [Critério 2 testável]
- [ ] [Critério 3 testável]

### Testes Necessários

**Testes unitários**:
- `tests/Unit/...Test.php` - [O que é testado]

**Testes de integração**:
- `tests/Integration/...Test.php` - [O que é testado]

**Testes funcionais**:
- `tests/Functional/...Test.php` - [O que é testado]

### Métricas de Sucesso

| Métrica | Antes | Meta | Como medir |
|---------|-------|------|------------|
| [Métrica 1] | [Valor] | [Valor] | [Ferramenta/Comando] |
| [Métrica 2] | [Valor] | [Valor] | [Ferramenta/Comando] |

---

## Referências

### Regras Internas
- [Regra `.claude/rules/XX-nome.md`](./../rules/XX-nome.md) - [Descrição]
- [Template `.claude/templates/nome.md`](./../templates/nome.md) - [Descrição]

### Documentação Externa
- [Título da documentação](https://url.com) - [Descrição]
- [Artigo/Blog relevante](https://url.com) - [Descrição]

### ADRs Relacionados
- [ADR-XXXX: Título](XXXX-titulo.md) - [Relação: depende de / substitui / complementa]

### Código Fonte
- Implementação: `src/caminho/para/arquivo.php:linha`
- Testes: `tests/caminho/para/test.php:linha`
- Configuração: `config/packages/package.yaml`

---

## Histórico de Modificações

| Data | Autor | Modificação |
|------|-------|-------------|
| YYYY-MM-DD | [Nome] | Criação inicial |
| YYYY-MM-DD | [Nome] | [Descrição da modificação] |

---

## Notas Adicionais

[Seção opcional para informações adicionais que não se encaixam nas seções anteriores:]
- Discussões importantes que levaram à decisão
- Contexto histórico adicional
- Referências a POCs ou experimentos
- Feedback pós-implementação (adicionar após o deploy em produção)
