# Checklist de Nova Funcionalidade

## Análise

- [ ] Necessidade de negócio esclarecida
- [ ] Casos de uso identificados
- [ ] Dependências analisadas
- [ ] Arquitetura definida
- [ ] Casos extremos antecipados

## Camada Domain

- [ ] Entity criada
- [ ] Interface do Repository definida
- [ ] Use cases implementados
- [ ] Testes unitários dos use cases (> 90%)

## Camada Data

- [ ] Models com Freezed/JsonSerializable
- [ ] Remote DataSource
- [ ] Local DataSource (se cache)
- [ ] Repository implementado
- [ ] Testes unitários do Repository (> 85%)

## Camada Presentation

- [ ] BLoC Events/States
- [ ] BLoC implementado
- [ ] Testes do BLoC (> 85%)
- [ ] Pages/Screens criadas
- [ ] Widgets reutilizáveis extraídos
- [ ] Testes de widgets (> 70%)

## Integração

- [ ] Injeção de dependências configurada
- [ ] Navegação adicionada
- [ ] Testes de integração escritos
- [ ] Fluxo E2E testado

## Documentação

- [ ] Dartdoc completo
- [ ] README atualizado
- [ ] CHANGELOG atualizado
- [ ] Screenshots adicionados (se UI)

## Qualidade

- [ ] flutter analyze limpo
- [ ] dart format aplicado
- [ ] Cobertura de testes > limiares
- [ ] Performance verificada
- [ ] Code review aprovado
