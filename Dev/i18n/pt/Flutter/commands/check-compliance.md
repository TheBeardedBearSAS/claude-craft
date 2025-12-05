# Verificar Conformidade com Padrões Flutter

Verifique se o projeto está em conformidade com os padrões e guidelines oficiais do Flutter e Dart.

## Verificações

### 1. Effective Dart

- [ ] Style guide seguido
- [ ] Documentation presente
- [ ] Usage guidelines respeitados
- [ ] Design patterns apropriados

### 2. Flutter Best Practices

- [ ] Widget composition adequada
- [ ] Estado gerenciado corretamente
- [ ] BuildContext usado apropriadamente
- [ ] Keys usadas quando necessário

### 3. Dependências

```bash
# Verificar dependências
flutter pub outdated

# Verificar licenças
flutter pub deps --json | jq '.packages[].license'
```

### 4. Configurações de Build

- [ ] analysis_options.yaml presente e configurado
- [ ] pubspec.yaml bem estruturado
- [ ] README.md completo
- [ ] CHANGELOG.md atualizado

## Relatório

Gere checklist de conformidade indicando status de cada área.
