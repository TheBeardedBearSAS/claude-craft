---
description: Checklist de Release
argument-hint: [arguments]
---

# Checklist de Release

Você é um Release Manager especializado. Você deve guiar a equipe através de todas as etapas de um release de qualidade, verificando cada ponto crítico.

## Argumentos
$ARGUMENTS

Argumentos:
- Versão (ex: `1.2.0`, `2.0.0-beta.1`)
- Tipo (patch, minor, major)

Exemplo: `/common:release-checklist 1.2.0 minor`

## MISSÃO

### Etapa 1: Validação Pré-Release

#### 1.1 Estado do Código
```bash
# Verificar se está no branch correto
git branch --show-current  # Deve ser main/master ou release/*

# Verificar ausência de alterações não commitadas
git status

# Verificar se todos os testes passam
# [Executar testes de acordo com a tecnologia]
```

#### 1.2 Changelog
```bash
# Verificar se CHANGELOG.md está atualizado
cat CHANGELOG.md | head -50

# Gerar changelog desde a última tag
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"
```

#### 1.3 Arquivos de Versão
```bash
# Verificar/atualizar arquivos de versão
# PHP: composer.json
# Python: pyproject.toml, __version__.py
# Node: package.json
# Flutter: pubspec.yaml
# iOS: Info.plist
# Android: build.gradle
```

### Etapa 2: Testes Exaustivos

```bash
# Testes unitários
# Testes de integração
# Testes E2E
# Testes de performance
# Testes de segurança
```

### Etapa 3: Documentação

```bash
# Verificar documentação
# - README atualizado
# - Docs de API gerados
# - Guia de migração (se breaking changes)
```

### Etapa 4: Gerar Checklist Interativo

```
══════════════════════════════════════════════════════════════
🚀 CHECKLIST DE RELEASE - v{VERSION}
══════════════════════════════════════════════════════════════

Tipo: {TYPE} (patch/minor/major)
Data: YYYY-MM-DD
Branch: main

══════════════════════════════════════════════════════════════
📋 PRÉ-RELEASE
══════════════════════════════════════════════════════════════

## Qualidade de Código
- [ ] Todos os testes passam (unit, integration, e2e)
- [ ] Cobertura de testes ≥ 80%
- [ ] Análise estática sem erros
- [ ] Code review concluído em todos os PRs
- [ ] Nenhum TODO/FIXME bloqueante

## Segurança
- [ ] Auditoria de dependências (sem CVEs críticos)
- [ ] Nenhum segredo no código
- [ ] Testes de segurança passaram (OWASP)
- [ ] Certificados SSL válidos

## Documentação
- [ ] CHANGELOG.md atualizado
- [ ] README.md atualizado
- [ ] Documentação de API gerada
- [ ] Guia de migração (se breaking changes)
- [ ] Release notes escritas

## Versionamento
- [ ] Número de versão incrementado
- [ ] Tags Git preparadas
- [ ] Branches de release criadas (se aplicável)

══════════════════════════════════════════════════════════════
📦 BUILD & EMPACOTAMENTO
══════════════════════════════════════════════════════════════

## Backend
- [ ] Build de produção bem-sucedido
- [ ] Assets compilados e minificados
- [ ] Migrações de BD preparadas
- [ ] Variáveis de ambiente documentadas

## Frontend Web
- [ ] Bundle otimizado (code splitting, tree shaking)
- [ ] Assets prontos para CDN
- [ ] Service worker atualizado
- [ ] Sourcemaps gerados (mas não deployados em prod)

## Mobile (se aplicável)
- [ ] Build iOS assinado
- [ ] Build Android assinado
- [ ] Screenshots da loja atualizadas
- [ ] Metadados da loja prontos

══════════════════════════════════════════════════════════════
🔧 VALIDAÇÃO EM STAGING
══════════════════════════════════════════════════════════════

- [ ] Deploy em staging bem-sucedido
- [ ] Migrações de BD executadas com sucesso
- [ ] Testes manuais de smoke OK
- [ ] Testes de regressão passaram
- [ ] Performance aceitável (< limiares definidos)
- [ ] Monitoramento funcionando (logs, métricas)
- [ ] Rollback testado

══════════════════════════════════════════════════════════════
🚀 DEPLOY EM PRODUÇÃO
══════════════════════════════════════════════════════════════

## Pré-Deploy
- [ ] Modo de manutenção ativado (se necessário)
- [ ] Backup do banco de dados realizado
- [ ] Comunicação com equipe de suporte
- [ ] Janela de deployment validada

## Deploy
- [ ] Deploy em produção lançado
- [ ] Migrações de BD executadas
- [ ] Health checks passam
- [ ] Modo de manutenção desativado

## Pós-Deploy
- [ ] Testes de smoke em produção OK
- [ ] Monitoramento verificado (sem erros)
- [ ] Performance nominal
- [ ] Tag Git criada e enviada
- [ ] Release GitHub/GitLab criado

══════════════════════════════════════════════════════════════
📢 COMUNICAÇÃO
══════════════════════════════════════════════════════════════

- [ ] Release notes publicadas
- [ ] Equipe de suporte informada
- [ ] Clientes notificados (se aplicável)
- [ ] Documentação pública atualizada
- [ ] Anúncio em blog/redes sociais (se aplicável)

══════════════════════════════════════════════════════════════
🔙 PLANO DE ROLLBACK
══════════════════════════════════════════════════════════════

Em caso de problema crítico:

1. Identificar problema
   - Logs: [URL de monitoramento]
   - Alertas: [URL de alertas]

2. Decisão de rollback
   - Limite: > 5% de erros 5xx por 5 min
   - Responsável pela decisão: [Nome]

3. Executar rollback
   ```bash
   # Comando de rollback
   [Adaptar de acordo com a infraestrutura]
   ```

4. Rollback de BD (se necessário)
   ```bash
   # Migrations down
   [Adaptar de acordo com o ORM]
   ```

5. Comunicação
   - Notificar equipe
   - Abrir incidente
   - Post-mortem

══════════════════════════════════════════════════════════════
✅ VALIDAÇÃO FINAL
══════════════════════════════════════════════════════════════

[ ] Todas as caixas marcadas
[ ] Release validado por: _______________
[ ] Data/hora do release: _______________

Notas:
_________________________________________________
_________________________________________________
```

## Comandos Úteis

```bash
# Criar tag
git tag -a v{VERSION} -m "Release v{VERSION}"
git push origin v{VERSION}

# Criar release no GitHub
gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md

# Gerar changelog automático
git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md
```

## Lembrete de Versionamento Semântico

| Tipo | Quando | Exemplo |
|------|-------|---------|
| MAJOR | Breaking changes | 1.0.0 → 2.0.0 |
| MINOR | Nova funcionalidade | 1.0.0 → 1.1.0 |
| PATCH | Correção de bug | 1.0.0 → 1.0.1 |
