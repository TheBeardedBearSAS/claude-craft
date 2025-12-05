# Workflow Git e Gerenciamento de Versoes

## Estrategia de Branching - Git Flow

### Branches Principais

```
main (producao)
  └── develop (integracao)
      ├── feature/* (novas funcionalidades)
      ├── fix/* (correcoes de bugs)
      ├── refactor/* (refatoracao)
      └── hotfix/* (correcoes urgentes)
```

### Estrutura de Branches

#### 1. Main (Producao)

- **Proposito**: Codigo de producao
- **Protecao**: Branch protegida, sem push direto
- **Merge**: Apenas via Pull Request de `develop` ou `hotfix/*`
- **Tags**: Todos os merges sao marcados com uma versao

```bash
# Merge de develop
git checkout main
git merge --no-ff develop -m "Release v1.2.0"
git tag -a v1.2.0 -m "Versao de release 1.2.0"
git push origin main --tags
```

#### 2. Develop (Desenvolvimento)

- **Proposito**: Integracao de funcionalidades
- **Base**: Branch inicial para todas as funcionalidades
- **Protecao**: Branch protegida, merge apenas via PR

#### 3. Feature Branches

- **Nomenclatura**: `feature/TICKET-descricao`
- **Base**: Criada a partir de `develop`
- **Merge**: Para `develop` via Pull Request

```bash
# Criar uma feature branch
git checkout develop
git pull origin develop
git checkout -b feature/USER-123-adicionar-formulario-login

# Trabalhar na feature
git add .
git commit -m "feat(auth): adicionar componente de formulario de login"

# Push da branch
git push -u origin feature/USER-123-adicionar-formulario-login

# Criar Pull Request no GitHub/GitLab
```

#### 4. Fix Branches

- **Nomenclatura**: `fix/TICKET-descricao`
- **Base**: Criada a partir de `develop`
- **Merge**: Para `develop` via Pull Request

```bash
# Criar uma fix branch
git checkout develop
git pull origin develop
git checkout -b fix/BUG-456-corrigir-validacao-usuario

# Corrigir o bug
git add .
git commit -m "fix(validation): resolver problema de validacao de email"

# Push e criar PR
git push -u origin fix/BUG-456-corrigir-validacao-usuario
```

#### 5. Hotfix Branches

- **Nomenclatura**: `hotfix/v1.2.1-descricao`
- **Base**: Criada a partir de `main` (producao)
- **Merge**: Para `main` E `develop`

```bash
# Criar uma hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/v1.2.1-correcao-critica-seguranca

# Aplicar o hotfix
git add .
git commit -m "fix(security): corrigir vulnerabilidade XSS"

# Merge para main
git checkout main
git merge --no-ff hotfix/v1.2.1-correcao-critica-seguranca
git tag -a v1.2.1 -m "Hotfix v1.2.1 - Patch de seguranca"
git push origin main --tags

# Merge para develop
git checkout develop
git merge --no-ff hotfix/v1.2.1-correcao-critica-seguranca
git push origin develop

# Deletar a hotfix branch
git branch -d hotfix/v1.2.1-correcao-critica-seguranca
git push origin --delete hotfix/v1.2.1-correcao-critica-seguranca
```

#### 6. Refactor Branches

- **Nomenclatura**: `refactor/descricao`
- **Base**: Criada a partir de `develop`
- **Merge**: Para `develop` via Pull Request

```bash
git checkout -b refactor/otimizar-hooks-usuario
git commit -m "refactor(hooks): extrair logica comum de usuario"
git push -u origin refactor/otimizar-hooks-usuario
```

## Conventional Commits

### Formato

```
<tipo>(<escopo>): <assunto>

<corpo>

<rodape>
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correcao de bug
- **docs**: Documentacao
- **style**: Formatacao, ponto e virgula faltando, etc.
- **refactor**: Refatoracao de codigo
- **perf**: Melhoria de performance
- **test**: Adicao de testes
- **build**: Mudancas no sistema de build
- **ci**: Mudancas no CI/CD
- **chore**: Outras mudancas (dependencias, etc.)
- **revert**: Reverter commit anterior

### Escopos (Exemplos)

- **auth**: Autenticacao
- **user**: Gerenciamento de usuarios
- **product**: Produtos
- **api**: API
- **ui**: Interface de usuario
- **hooks**: Hooks personalizados
- **utils**: Utilitarios
- **config**: Configuracao

### Exemplos de Commits

```bash
# Feature
feat(auth): adicionar fluxo de autenticacao OAuth2

Implementar autenticacao OAuth2 Google e Facebook.
- Adicionar configuracao de provedores OAuth2
- Criar handlers de callback de autenticacao
- Implementar logica de troca de token

Closes #USER-123

# Fix
fix(validation): resolver problema de regex de validacao de email

O regex de email nao estava aceitando TLDs validos como .technology
Atualizado padrao regex para permitir TLDs mais longos

Fixes #BUG-456

# Breaking Change
feat(api)!: alterar estrutura de resposta da API de usuarios

BREAKING CHANGE: API de usuarios agora retorna { data: User, meta: Metadata }
em vez de apenas objeto User.

Guia de migracao:
- Atualizar todas as chamadas de API para acessar response.data
- Tratar paginacao com response.meta

Closes #API-789

# Refactoring
refactor(hooks): extrair logica comum de busca de dados

Extrair padroes useQuery em hooks reutilizaveis para reduzir duplicacao de codigo

# Performance
perf(list): implementar rolagem virtual para listas grandes

Melhorar performance com react-window para listas > 100 itens

# Documentacao
docs(readme): adicionar instrucoes de instalacao

Adicionar guia passo a passo de instalacao para novos desenvolvedores

# Testes
test(auth): adicionar testes unitarios para componente de login

Aumentar cobertura de testes de 65% para 85%

# Build
build(deps): atualizar react para v18.3

# CI
ci(github): adicionar workflow de testes E2E automatizados

# Chore
chore(deps): atualizar dependencias

# Revert
revert: feat(auth): adicionar fluxo de autenticacao OAuth2

Este commit reverte abc123def456.
Motivo: Integracao OAuth2 causando problemas em producao
```

### Diretrizes de Mensagem de Commit

#### Linha de Assunto

```bash
# ✅ Bom
feat(auth): adicionar validacao de formulario de login

# ❌ Ruim
Adicionei algumas coisas

# ✅ Bom - Imperativo
fix(api): resolver problema de timeout

# ❌ Ruim - Tempo passado
corrigiu o problema de timeout

# ✅ Bom - Conciso
refactor(hooks): simplificar useAuth

# ❌ Ruim - Muito longo
refactor(hooks): simplificar o hook useAuth extraindo a logica de validacao e removendo codigo duplicado
```

#### Corpo (Opcional mas Recomendado)

```bash
feat(user): adicionar edicao de perfil de usuario

Implementar funcionalidade completa de edicao de perfil incluindo:
- Upload de foto de perfil com preview
- Validacao de formulario usando Zod
- Atualizacoes otimistas com React Query
- Tratamento de erros e rollback

A implementacao segue os padroes estabelecidos no codebase
e inclui testes unitarios e de integracao abrangentes.

Closes #USER-123
```

#### Rodape

```bash
# Referenciar issues
Closes #123
Fixes #456
Resolves #789

# Multiplas issues
Closes #123, #456, #789

# Breaking changes
BREAKING CHANGE: Estrutura de resposta da API alterada
```

## Workflow de Pull Request

### Criando um Pull Request

```bash
# 1. Garantir que a branch esta atualizada
git checkout develop
git pull origin develop

# 2. Fazer rebase da feature branch
git checkout feature/USER-123-adicionar-formulario-login
git rebase develop

# 3. Resolver conflitos se necessario
# 4. Push das mudancas
git push origin feature/USER-123-adicionar-formulario-login --force-with-lease

# 5. Criar PR no GitHub/GitLab
```

### Template de Pull Request

```markdown
## Descricao

Breve descricao das mudancas neste PR.

## Tipo de Mudanca

- [ ] Correcao de bug (mudanca nao-breaking que corrige um problema)
- [ ] Nova funcionalidade (mudanca nao-breaking que adiciona funcionalidade)
- [ ] Breaking change (correcao ou feature que faria funcionalidade existente nao funcionar como esperado)
- [ ] Esta mudanca requer atualizacao de documentacao

## Issues Relacionadas

Closes #123
Related to #456

## Mudancas Realizadas

- Adicionado fluxo de autenticacao de usuario
- Implementada validacao de token JWT
- Criados formularios de login e registro
- Adicionados testes unitarios para componentes de auth

## Screenshots (se aplicavel)

[Adicionar screenshots aqui]

## Testes

### Como Foi Testado?

- [ ] Testes unitarios
- [ ] Testes de integracao
- [ ] Testes E2E
- [ ] Testes manuais

### Configuracao de Teste

- Versao do Node: 20.x
- Navegador: Chrome 120

## Checklist

- [ ] Meu codigo segue o estilo de codigo deste projeto
- [ ] Realizei uma auto-revisao do meu proprio codigo
- [ ] Comentei meu codigo, especialmente em areas dificeis de entender
- [ ] Fiz mudancas correspondentes na documentacao
- [ ] Minhas mudancas nao geram novos warnings
- [ ] Adicionei testes que provam que minha correcao e efetiva ou que minha feature funciona
- [ ] Testes unitarios novos e existentes passam localmente com minhas mudancas
- [ ] Quaisquer mudancas dependentes foram merged e publicadas

## Impacto de Performance

- [ ] Sem impacto de performance
- [ ] Pequena melhoria de performance
- [ ] Melhoria significativa de performance
- [ ] Regressao de performance (explicar por que e aceitavel)

## Consideracoes de Seguranca

- [ ] Sem impacto de seguranca
- [ ] Melhoria de seguranca
- [ ] Potencial preocupacao de seguranca (explicado abaixo)

## Notas Adicionais

Qualquer informacao adicional que os revisores devem saber.
```

### Processo de Revisao de Codigo

#### Para o Revisor

```bash
# 1. Buscar a branch
git fetch origin
git checkout feature/USER-123-adicionar-formulario-login

# 2. Testar localmente
pnpm install
pnpm dev

# 3. Verificar testes
pnpm test
pnpm lint
pnpm type-check

# 4. Revisar o codigo
# - Verificar qualidade do codigo
# - Verificar testes
# - Verificar documentacao
# - Testes manuais

# 5. Aprovar ou solicitar mudancas
```

#### Checklist do Revisor

- [ ] Codigo segue padroes do projeto
- [ ] Testes estao completos e passando
- [ ] Sem codigo duplicado
- [ ] Sem valores hard-coded
- [ ] Documentacao esta atualizada
- [ ] Sem console.log sobrando
- [ ] Performance aceitavel
- [ ] Seguranca respeitada
- [ ] Acessibilidade respeitada
- [ ] Design responsivo (se UI)

## Gerenciamento de Conflitos

### Resolvendo Conflitos Durante Rebase

```bash
# 1. Iniciar o rebase
git checkout feature/minha-feature
git rebase develop

# 2. Se houver conflito, Git para
# Editar arquivos conflitantes

# 3. Marcar como resolvido
git add <arquivos-resolvidos>
git rebase --continue

# 4. Se muitos conflitos, abortar
git rebase --abort

# 5. Push (force with lease)
git push --force-with-lease origin feature/minha-feature
```

### Resolvendo Conflitos Durante Merge

```bash
# 1. Merge develop na feature
git checkout feature/minha-feature
git merge develop

# 2. Resolver conflitos
# Editar arquivos

# 3. Commit da resolucao
git add <arquivos-resolvidos>
git commit -m "merge: resolver conflitos com develop"

# 4. Push
git push origin feature/minha-feature
```

## Git Hooks (Automacao)

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

# Lint de arquivos staged
npx lint-staged

# Verificacao de tipos
npm run type-check

# Se tudo passar, commit continua
exit 0
```

### Commit-msg Hook

```bash
#!/bin/sh
# .husky/commit-msg

# Validar mensagem de commit
npx --no -- commitlint --edit ${1}
```

### Pre-push Hook

```bash
#!/bin/sh
# .husky/pre-push

# Executar testes antes do push
npm run test:run

# Build para garantir sem erros de build
npm run build

exit 0
```

## Versionamento Semantico

### Formato: MAJOR.MINOR.PATCH

- **MAJOR**: Mudancas breaking (1.0.0 → 2.0.0)
- **MINOR**: Novas funcionalidades, compativel para tras (1.0.0 → 1.1.0)
- **PATCH**: Correcoes de bugs (1.0.0 → 1.0.1)

### Exemplos

```bash
# Release patch (correcao de bug)
git tag -a v1.0.1 -m "Fix: resolver problema de validacao de usuario"

# Release minor (nova funcionalidade)
git tag -a v1.1.0 -m "Feature: adicionar suporte a modo escuro"

# Release major (breaking change)
git tag -a v2.0.0 -m "Breaking: nova estrutura de API"

# Push tags
git push origin --tags
```

### Changelog Automatico

```bash
# Instalar standard-version
npm install -D standard-version

# Adicionar ao package.json
{
  "scripts": {
    "release": "standard-version",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}

# Gerar um release
npm run release
# Gera automaticamente:
# - Bump de versao no package.json
# - Git tag
# - CHANGELOG.md atualizado

git push --follow-tags origin main
```

## Melhores Praticas Git

### 1. Commits Atomicos

```bash
# ✅ Bom - Commits separados
git commit -m "feat(auth): adicionar formulario de login"
git commit -m "test(auth): adicionar testes de formulario de login"
git commit -m "docs(auth): documentar fluxo de login"

# ❌ Ruim - Tudo em um commit
git commit -m "Adicionar feature de login com testes e docs"
```

### 2. Branches Curtas

- Feature branches: < 3 dias
- Merge rapido e frequente
- Evitar branches de longa duracao

### 3. Rebase vs Merge

```bash
# Rebase para feature branches (historico linear)
git checkout feature/minha-feature
git rebase develop

# Merge para integrar no develop (preservar historico)
git checkout develop
git merge --no-ff feature/minha-feature
```

### 4. Force Push Seguro

```bash
# ❌ Perigoso
git push --force

# ✅ Seguro
git push --force-with-lease
```

### 5. Manter develop e main atualizados

```bash
# Sincronizar regularmente
git checkout develop
git pull origin develop

git checkout main
git pull origin main
```

## Gitignore

```gitignore
# Dependencias
node_modules/
.pnp
.pnp.js

# Testes
coverage/
.nyc_output/

# Producao
dist/
build/
.next/
out/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Variaveis de ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Arquivos temporarios
*.log
tmp/
temp/

# Informacoes de build
.tsbuildinfo
```

## Aliases Git Uteis

```bash
# Adicionar ao ~/.gitconfig
[alias]
  # Status curto
  st = status -sb

  # Commit
  cm = commit -m
  ca = commit --amend

  # Checkout
  co = checkout
  cob = checkout -b

  # Branch
  br = branch
  brd = branch -d

  # Pull/Push
  pl = pull
  ps = push
  pf = push --force-with-lease

  # Log
  lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
  last = log -1 HEAD

  # Rebase
  rb = rebase
  rbc = rebase --continue
  rba = rebase --abort

  # Stash
  st = stash
  stp = stash pop

  # Desfazer
  undo = reset --soft HEAD^
  unstage = reset HEAD --
```

## Conclusao

Um bom workflow Git permite:

1. ✅ **Colaboracao**: Trabalho em equipe suave
2. ✅ **Qualidade**: Revisao de codigo sistematica
3. ✅ **Rastreabilidade**: Historico claro
4. ✅ **Seguranca**: Protecao de branches principais
5. ✅ **Automacao**: Hooks e CI/CD

**Regra de ouro**: Commitar frequentemente, push regularmente, merge rapidamente.
