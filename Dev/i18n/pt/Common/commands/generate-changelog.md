# Geração Automática de Changelog

Você é um assistente de documentação. Você deve analisar commits git e gerar um changelog formatado seguindo as convenções Conventional Commits e Keep a Changelog.

## Argumentos
$ARGUMENTS

Argumentos:
- Versão alvo (ex: `1.2.0`)
- Desde (tag anterior, padrão: última tag)

Exemplo: `/common:generate-changelog 1.2.0 v1.1.0`

## MISSÃO

### Etapa 1: Recuperar Commits

```bash
# Identificar última tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# Listar commits desde última tag
if [ -z "$LAST_TAG" ]; then
    git log --pretty=format:"%H|%s|%an|%ad" --date=short
else
    git log ${LAST_TAG}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short
fi
```

### Etapa 2: Analisar Commits (Conventional Commits)

Formato esperado: `type(scope): description`

| Type | Categoria no Changelog |
|------|---------------------|
| feat | Added |
| fix | Fixed |
| docs | Documentation |
| style | (ignorado) |
| refactor | Changed |
| perf | Performance |
| test | (ignorado) |
| chore | (ignorado) |
| build | Build |
| ci | (ignorado) |
| revert | Removed |
| BREAKING CHANGE | Breaking Changes |

### Etapa 3: Analisar PRs (se disponível)

```bash
# Recuperar PRs mergeados
gh pr list --state merged --base main --json number,title,labels,author
```

### Etapa 4: Gerar Changelog

Formato Keep a Changelog:

```markdown
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/spec/v2.0.0.html).

## [Unreleased]

## [{VERSÃO}] - {DATA}

### Breaking Changes
- **{scope}**: {descrição} ({autor}) - #{PR}

### Added
- **{scope}**: {descrição} ({autor}) - #{PR}
- **{scope}**: {descrição} ({autor}) - #{PR}

### Changed
- **{scope}**: {descrição} ({autor}) - #{PR}

### Deprecated
- **{scope}**: {descrição} ({autor}) - #{PR}

### Removed
- **{scope}**: {descrição} ({autor}) - #{PR}

### Fixed
- **{scope}**: {descrição} ({autor}) - #{PR}

### Security
- **{scope}**: {descrição} ({autor}) - #{PR}

### Performance
- **{scope}**: {descrição} ({autor}) - #{PR}

## [{VERSÃO_ANTERIOR}] - {DATA}
...

[Unreleased]: https://github.com/{owner}/{repo}/compare/v{VERSÃO}...HEAD
[{VERSÃO}]: https://github.com/{owner}/{repo}/compare/v{VERSÃO_ANTERIOR}...v{VERSÃO}
```

### Etapa 5: Exemplo de Saída

```markdown
## [1.2.0] - 2024-01-15

### Breaking Changes
- **api**: Mudança de autenticação de session para JWT (#123) - @joao

### Added
- **auth**: Adicionar suporte a login OAuth2 social (#145) - @maria
- **users**: Adicionar upload de foto de perfil (#142) - @joao
- **dashboard**: Adicionar notificações em tempo real (#138) - @alice

### Changed
- **api**: Atualizar API Platform para v3.2 (#150) - @bob
- **ui**: Migrar para TailwindCSS v3 (#148) - @maria

### Fixed
- **auth**: Corrigir email de reset de senha não enviando (#141) - @joao
- **orders**: Corrigir cálculo de total com descontos (#139) - @alice
- **mobile**: Corrigir crash no iOS 17 (#137) - @bob

### Security
- **deps**: Atualizar symfony/http-kernel para CVE-2024-1234 (#146) - @security-bot

### Performance
- **api**: Adicionar cache Redis para sessões de usuário (#144) - @alice
- **db**: Otimizar consultas N+1 na lista de pedidos (#140) - @bob

---

**Changelog Completo**: https://github.com/org/repo/compare/v1.1.0...v1.2.0

### Contribuidores
- @joao (4 commits)
- @maria (3 commits)
- @alice (3 commits)
- @bob (3 commits)

### Estatísticas
- Commits: 13
- Arquivos alterados: 87
- Linhas adicionadas: +2,345
- Linhas removidas: -876
```

### Etapa 6: Ações Sugeridas

```
══════════════════════════════════════════════════════════════
📝 CHANGELOG GERADO
══════════════════════════════════════════════════════════════

Versão: 1.2.0
Período: 2024-01-01 → 2024-01-15
Commits analisados: 13

──────────────────────────────────────────────────────────────
📊 RESUMO POR CATEGORIA
──────────────────────────────────────────────────────────────

| Categoria | Contagem |
|-----------|--------|
| Added | 3 |
| Changed | 2 |
| Fixed | 3 |
| Security | 1 |
| Performance | 2 |
| Breaking | 1 |

──────────────────────────────────────────────────────────────
⚠️ PONTOS DE ATENÇÃO
──────────────────────────────────────────────────────────────

1. ⚠️ BREAKING CHANGE detectado - requer versão MAJOR?
2. 🔒 1 correção de segurança - mencionar nas notas de release
3. 📝 5 commits sem formato conventional (a melhorar)

──────────────────────────────────────────────────────────────
🎯 PRÓXIMOS PASSOS
──────────────────────────────────────────────────────────────

1. Verificar e editar changelog gerado
2. Criar ou atualizar arquivo CHANGELOG.md
3. Commit: git commit -am "docs: atualizar changelog para v1.2.0"
4. Criar tag: git tag -a v1.2.0 -m "Release v1.2.0"
```

## Comandos Associados

```bash
# Salvar o changelog
# O conteúdo será exibido, você pode copiá-lo para CHANGELOG.md

# Ferramentas recomendadas para automação
# - git-cliff: https://github.com/orhun/git-cliff
# - conventional-changelog: https://github.com/conventional-changelog/conventional-changelog
# - release-please: https://github.com/googleapis/release-please
```

## Lembrete de Conventional Commits

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Tipos padrão
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Apenas documentação
style:    Formatação (sem mudança de código)
refactor: Refatoração (sem nova feature ou fix)
perf:     Melhoria de performance
test:     Adicionar/modificar testes
chore:    Manutenção (deps, config, etc.)
build:    Sistema de build, deps externas
ci:       Configuração CI/CD
revert:   Reverter commit anterior

# Breaking change
feat!: descrição
# ou
feat: descrição

BREAKING CHANGE: explicação da mudança quebrada
```
