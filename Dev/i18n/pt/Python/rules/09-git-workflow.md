# Regra 09: Fluxo Git

Fluxo Git e melhores práticas para colaboração.

## Estratégia de Branches

### Branches Principais

- **main**: Código de produção, sempre deployável
- **develop**: Branch de integração para features (opcional)

### Branches de Feature

Criar uma branch para cada feature ou correção:

```bash
# Criar branch de feature a partir de main
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# Criar branch de correção
git checkout -b fix/login-bug

# Criar branch de hotfix (urgente)
git checkout -b hotfix/critical-security-issue
```

### Nomenclatura de Branches

```
feature/descricao-curta     # Nova funcionalidade
fix/descricao-curta         # Correção de bug
hotfix/descricao-curta      # Correção urgente
refactor/descricao-curta    # Refatoração
docs/descricao-curta        # Documentação
test/descricao-curta        # Testes
chore/descricao-curta       # Manutenção
```

## Conventional Commits

Seguir especificação [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Apenas documentação
- **style**: Formatação, sem mudança de código
- **refactor**: Refatoração de código
- **test**: Adição/atualização de testes
- **chore**: Tarefas de manutenção
- **perf**: Melhoria de performance
- **ci**: Mudanças CI/CD
- **build**: Mudanças no sistema de build

### Exemplos

```bash
# Feature
git commit -m "feat(auth): adicionar autenticação JWT

Implementar sistema de autenticação baseado em JWT com:
- Geração de token
- Validação de token
- Mecanismo de refresh token

Closes #123"

# Correção de bug
git commit -m "fix(user): tratar email nulo na validação

Adicionar verificação de nulo antes da validação de email
para prevenir NullPointerException.

Fixes #456"

# Breaking change
git commit -m "feat(api)!: alterar formato de resposta do endpoint de usuário

BREAKING CHANGE: API de usuário agora retorna estrutura de objeto
aninhado em vez de campos planos. Clientes devem atualizar seus parsers.

Guia de migração: docs/migrations/v2-user-api.md"

# Múltiplas mudanças
git commit -m "chore: atualizar dependências

- Atualizar FastAPI para 0.109.0
- Atualizar Pydantic para 2.5.0
- Atualizar SQLAlchemy para 2.0.25

Todos os testes passando após atualizações."
```

## Diretrizes de Commit

### Commits Atômicos

Cada commit deve ser uma única mudança lógica.

```bash
# ❌ Ruim: Commit gigante com múltiplas mudanças não relacionadas
git add .
git commit -m "Atualizado stuff"

# ✅ Bom: Commits atômicos separados
git add src/domain/entities/user.py
git commit -m "feat(domain): adicionar entidade User com validação de email"

git add src/application/use_cases/create_user.py
git commit -m "feat(application): adicionar caso de uso CreateUser"

git add tests/unit/domain/test_user.py
git commit -m "test(domain): adicionar testes da entidade User"
```

### Fazer Commit Frequentemente

Fazer commit frequentemente, mesmo que as mudanças sejam pequenas.

```bash
# Fazer commit após cada mudança significativa
git commit -m "feat(auth): adicionar hashing de senha"
git commit -m "feat(auth): adicionar regras de validação de senha"
git commit -m "test(auth): adicionar testes de hashing de senha"
```

### Boas Mensagens de Commit

```bash
# ❌ Mensagens ruins
git commit -m "fix"
git commit -m "código atualizado"
git commit -m "WIP"
git commit -m "correções"

# ✅ Boas mensagens
git commit -m "fix(api): validar corpo da requisição antes do processamento"
git commit -m "refactor(repository): extrair lógica do query builder"
git commit -m "docs(readme): adicionar instruções de instalação"
git commit -m "test(user): adicionar casos extremos para validação de email"
```

## Fluxo de Pull Request

### 1. Criar Branch

```bash
git checkout -b feature/user-notifications
```

### 2. Fazer Mudanças

```bash
# Fazer mudanças
# Escrever testes
# Fazer commit atomicamente

git add tests/test_notifications.py
git commit -m "test(notifications): adicionar testes do serviço de notificação"

git add src/services/notification_service.py
git commit -m "feat(notifications): implementar serviço de notificação por email"
```

### 3. Manter Branch Atualizada

```bash
# Fazer rebase em main regularmente
git fetch origin
git rebase origin/main

# Ou merge se houver conflitos
git merge origin/main
```

### 4. Executar Verificações

```bash
# Antes de fazer push, garantir qualidade
make quality  # lint, type-check, test

# Ou individualmente
make lint
make type-check
make test-cov
```

### 5. Fazer Push da Branch

```bash
git push origin feature/user-notifications
```

### 6. Criar Pull Request

Template de descrição do PR:

```markdown
## Resumo
Breve descrição do que este PR faz e por quê.

## Mudanças
- Mudança 1: Descrição
- Mudança 2: Descrição
- Mudança 3: Descrição

## Tipo de Mudança
- [ ] Nova funcionalidade (feat)
- [ ] Correção de bug (fix)
- [ ] Refatoração (refactor)
- [ ] Documentação (docs)
- [ ] Testes (test)

## Testes
Como isso foi testado:
- [ ] Testes unitários adicionados/atualizados
- [ ] Testes de integração adicionados/atualizados
- [ ] Testes manuais realizados
- [ ] Todos os testes passando localmente

## Checklist
- [ ] Código segue diretrizes de estilo do projeto
- [ ] Auto-revisão completada
- [ ] Comentários adicionados para código complexo
- [ ] Documentação atualizada
- [ ] Nenhum novo aviso gerado
- [ ] Testes adicionados que provam que correção/feature funciona
- [ ] Mudanças dependentes foram mergeadas

## Issues Relacionadas
Closes #123
Relates to #456

## Screenshots (se aplicável)
[Adicionar screenshots para mudanças de UI]
```

### 7. Code Review

Endereçar comentários do revisor:

```bash
# Fazer mudanças solicitadas
git add .
git commit -m "refactor(user): extrair validação para método separado

Endereçar comentário de revisão de @reviewer"

git push origin feature/user-notifications
```

### 8. Merge

```bash
# Após aprovação, fazer merge via UI GitHub/GitLab
# Geralmente "Squash and merge" para histórico limpo

# Deletar branch após merge
git checkout main
git pull origin main
git branch -d feature/user-notifications
git push origin --delete feature/user-notifications
```

## Comandos Git Úteis

### Verificar Status

```bash
# Ver o que mudou
git status

# Ver mudanças detalhadas
git diff

# Ver mudanças staged
git diff --staged

# Ver histórico de commits
git log --oneline --graph --all
```

### Desfazer Mudanças

```bash
# Descartar mudanças não staged
git checkout -- file.py

# Unstage arquivo
git reset HEAD file.py

# Emendar último commit (se não foi pushed)
git commit --amend

# Resetar para commit anterior (cuidado!)
git reset --hard HEAD~1

# Reverter commit (seguro, cria novo commit)
git revert <commit-hash>
```

### Rebase Interativo

```bash
# Limpar commits antes do PR
git rebase -i HEAD~3

# No editor:
# pick = manter commit
# reword = mudar mensagem
# squash = combinar com anterior
# fixup = combinar sem mensagem
# drop = remover commit
```

### Stash de Mudanças

```bash
# Fazer stash das mudanças atuais
git stash

# Listar stashes
git stash list

# Aplicar último stash
git stash apply

# Aplicar e remover stash
git stash pop

# Stash com mensagem
git stash save "WIP: autenticação de usuário"
```

## Configuração Git

```bash
# Configuração de usuário
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"

# Editor
git config --global core.editor "code --wait"

# Aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg 'log --oneline --graph --all'

# Auto-setup de branch remota
git config --global push.default current
```

## .gitignore

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt

# Testes
.pytest_cache/
.coverage
htmlcov/
.tox/

# Verificação de tipos
.mypy_cache/
.dmypy.json
dmypy.json

# IDEs
.idea/
.vscode/
*.swp
*.swo
*~

# Ambiente
.env
.env.local
.env.*.local

# Banco de dados
*.db
*.sqlite
*.sqlite3

# Logs
*.log

# SO
.DS_Store
Thumbs.db
```

## Checklist

- [ ] Branch segue convenção de nomenclatura
- [ ] Commits são atômicos e seguem Conventional Commits
- [ ] Mensagens de commit são claras e descritivas
- [ ] Branch está atualizada com main
- [ ] Todas as verificações passam (lint, type-check, tests)
- [ ] Descrição do PR está completa
- [ ] Auto-revisão realizada
- [ ] Sem conflitos de merge
- [ ] Sem código temporário/debug
- [ ] Sem código comentado
- [ ] Sem secrets commitados
