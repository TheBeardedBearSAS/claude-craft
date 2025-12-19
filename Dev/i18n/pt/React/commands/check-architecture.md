---
description: Verificacao de Conformidade de Arquitetura
---

# Verificacao de Conformidade de Arquitetura

Verificar se o projeto segue padroes arquiteturais e melhores praticas estabelecidas.

## O Que Este Comando Faz

1. **Analise de Arquitetura**
   - Verificar estrutura de pastas
   - Verificar separacao de responsabilidades
   - Validar organizacao de componentes
   - Verificar direcoes de dependencia
   - Verificar padroes de design

2. **Pontos de Verificacao**
   - Estrutura baseada em funcionalidades
   - Hierarquia de componentes
   - Gerenciamento de estado
   - Separacao da camada de API
   - Definicoes de tipos

3. **Relatorio Gerado**
   - Violacoes de arquitetura
   - Recomendacoes
   - Oportunidades de refatoracao
   - Score de conformidade

## Estrutura Esperada

```
src/
├── app/                    # Configuracao da aplicacao
├── features/              # Funcionalidades (logica de negocio)
├── components/            # Componentes compartilhados
├── hooks/                 # Hooks compartilhados
├── services/             # Servicos compartilhados
├── stores/               # Estado global
├── types/                # Tipos globais
├── utils/                # Funcoes utilitarias
└── config/               # Configuracao
```

## Melhores Praticas

1. **Isolamento de funcionalidades**: Cada funcionalidade e autocontida
2. **Limites claros**: Camadas de apresentacao, logica, dados
3. **Injecao de dependencia**: Servicos atraves de hooks/context
4. **Type safety**: TypeScript em todos os lugares
5. **Nomenclatura consistente**: Seguir convencoes
6. **Responsabilidade unica**: Um componente, uma tarefa
7. **Composicao sobre heranca**: Usar composicao
8. **Documentacao**: Documentar decisoes de arquitetura
