---
description: Executar Claude em loop continuo ate completar a tarefa (Ralph Wiggum v2.0)
argument-hint: <descricao-tarefa> [--auto-detect|--init|--interactive]
---

# Ralph Run - Loop Continuo de Agente IA v2.0

Executa Claude em um loop continuo ate que a tarefa esteja completa ou os criterios de Definition of Done (DoD) sejam atendidos.

## Argumentos

**$ARGUMENTS**

- `<descricao-tarefa>`: A tarefa para Claude completar
- `--auto-detect`: Detectar automaticamente o tipo de projeto e configurar DoD
- `--init`: Gerar configuracao sem executar
- `--interactive`: Assistente de configuracao interativo

## Novas funcionalidades v2.0

| Funcionalidade | Descricao |
|----------------|-----------|
| **Integracao Hooks** | Integracao bidirecional com Claude Code 2.1.23+ |
| **Auto-Deteccao** | Deteccao automatica do tipo de projeto |
| **Dashboard** | Visualizacao em tempo real com barra de progresso |
| **Export Metricas** | Metricas em formato JSON e Prometheus |
| **Circuit Breaker Adaptativo** | 5 perfis com aprendizado historico |
| **Monitor de Saude** | Deteccao de estagnacao, espiral de erros |
| **Templates DoD** | Templates pre-configurados para 8 tecnologias |

## Circuit Breaker Adaptativo (v2.0)

| Perfil | Palavras-chave | Sem Mud. | Erros | Max Iter |
|--------|----------------|----------|-------|----------|
| `quick_fix` | fix, bug, typo | 2 | 3 | 10 |
| `small_feature` | add, implement | 3 | 4 | 15 |
| `medium_feature` | feature, create | 4 | 6 | 25 |
| `large_feature` | refactor, migrate | 5 | 8 | 50 |
| `exploration` | explore, investigate | 10 | 15 | 100 |

## Exemplos rapidos

```bash
# Uso basico
ralph.sh "Implementar autenticacao de usuario"

# Detectar e gerar config
ralph.sh --auto-detect --init

# Assistente interativo
ralph.sh --interactive
```

## Templates DoD por tecnologia

| Tecnologia | Comando Teste | Comando Lint |
|------------|---------------|--------------|
| Symfony | `vendor/bin/phpunit` | `vendor/bin/phpstan analyse` |
| Flutter | `flutter test` | `flutter analyze` |
| React | `npm test` | `npm run lint` |
| Python | `pytest` | `ruff check .` |
| .NET | `dotnet test` | `dotnet build /p:TreatWarningsAsErrors=true` |
| Go | `go test ./...` | `golangci-lint run` |
| Rust | `cargo test` | `cargo clippy` |

## Relacionado

- `@ralph-conductor` - Agente para orquestracao Ralph
- `/qa:tdd` - Correcao de bugs com TDD
- `/sprint:dev` - Desenvolvimento de sprint com TDD
