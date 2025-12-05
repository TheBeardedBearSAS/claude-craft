# Gerar Nova Funcionalidade Flutter

Gere toda a estrutura necessária para uma nova funcionalidade seguindo Clean Architecture.

## Entrada Necessária

- Nome da funcionalidade (ex: "user_profile")
- Camadas necessárias: [data, domain, presentation]
- Tipo de gerenciamento de estado: [bloc, riverpod, provider]

## Estrutura a Gerar

```
lib/features/{feature_name}/
  data/
    datasources/
      {feature}_local_datasource.dart
      {feature}_remote_datasource.dart
    models/
      {feature}_model.dart
    repositories/
      {feature}_repository_impl.dart
  domain/
    entities/
      {feature}.dart
    repositories/
      {feature}_repository.dart
    usecases/
      get_{feature}.dart
  presentation/
    bloc/
      {feature}_bloc.dart
      {feature}_event.dart
      {feature}_state.dart
    pages/
      {feature}_page.dart
    widgets/
      {feature}_widget.dart
```

## Testes a Gerar

```
test/features/{feature_name}/
  data/
    models/{feature}_model_test.dart
    repositories/{feature}_repository_impl_test.dart
  domain/
    usecases/get_{feature}_test.dart
  presentation/
    bloc/{feature}_bloc_test.dart
    widgets/{feature}_widget_test.dart
```

## Ações

1. Criar estrutura de pastas
2. Gerar arquivos com templates
3. Configurar injeção de dependências
4. Adicionar ao roteamento se necessário
5. Criar testes básicos
