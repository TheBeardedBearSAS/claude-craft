# Checklist de Pre-Commit

## Qualidade do Código

- [ ] Código formatado com `dart format`
- [ ] Sem warnings do `flutter analyze`
- [ ] Sem erros de compilação
- [ ] Todos os imports organizados
- [ ] Sem código comentado desnecessário
- [ ] Sem `print()` ou `debugPrint()` esquecidos
- [ ] Sem TODO sem ticket associado

## Testes

- [ ] Testes unitários passam (`flutter test`)
- [ ] Testes de widgets passam
- [ ] Cobertura > 80% para novos arquivos
- [ ] Sem testes pulados (`@Skip`)

## Documentação

- [ ] Dartdoc para novas classes públicas
- [ ] README atualizado se necessário
- [ ] CHANGELOG atualizado
- [ ] Comentários para código complexo

## Git

- [ ] Mensagem de commit segue Conventional Commits
- [ ] Sem arquivos sensíveis (.env, secrets)
- [ ] .gitignore atualizado
- [ ] Branch atualizada com develop/main

## Arquitetura

- [ ] Clean Architecture respeitada
- [ ] Dependências na direção correta
- [ ] Sem lógica de negócio na UI
- [ ] Widgets reutilizáveis extraídos

## Performance

- [ ] Widgets const utilizados
- [ ] Sem builds desnecessários
- [ ] Imagens otimizadas
- [ ] Uso correto de async/await

## Segurança

- [ ] Sem dados sensíveis hardcoded
- [ ] Validação de entrada do usuário
- [ ] Tratamento apropriado de permissões
