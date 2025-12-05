# Git Workflow - Conventional Commits

## Estratégia de Branching

### Branches Principais

```
main (production)
├── develop (staging)
    ├── feature/user-authentication
    ├── feature/article-list
    ├── bugfix/login-crash
    └── hotfix/security-patch
```

### Nomenclatura de Branches

```bash
# Features
feature/feature-name
feature/auth-social-login
feature/offline-mode

# Bug fixes
bugfix/bug-description
bugfix/profile-image-upload

# Hotfixes
hotfix/critical-fix
hotfix/payment-gateway

# Releases
release/v1.2.0
```

---

## Conventional Commits

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação (sem mudança de código)
- **refactor**: Reestruturação de código
- **perf**: Melhoria de performance
- **test**: Adição de testes
- **chore**: Mudanças de build/tooling
- **ci**: Mudanças de CI/CD

### Exemplos

```bash
# Feature
feat(auth): add social login with Google

Implements OAuth2 flow for Google authentication.
Users can now login using their Google account.

Closes #123

# Bug fix
fix(profile): resolve image upload crash on Android

The app was crashing when uploading images larger than 5MB
on Android devices. Added image compression before upload.

Fixes #456

# Performance
perf(articles): optimize FlatList rendering

- Added getItemLayout for better scrolling
- Implemented React.memo for ArticleCard
- Reduced re-renders by 60%

# Breaking change
feat(api)!: migrate to v2 API endpoints

BREAKING CHANGE: All API endpoints now use /v2/ prefix.
Update your API_BASE_URL configuration.

Migration guide: docs/migration-v2.md
```

---

## Workflow

### Desenvolvimento de Feature

```bash
# 1. Criar branch de feature
git checkout -b feature/article-favorites

# 2. Trabalhar na feature
# Fazer alterações...

# 3. Commitar mudanças
git add .
git commit -m "feat(articles): add favorite functionality"

# 4. Push para remote
git push -u origin feature/article-favorites

# 5. Criar Pull Request
gh pr create --title "Add article favorites" --body "Implements #123"

# 6. Após review, merge para develop
git checkout develop
git merge feature/article-favorites
git push origin develop

# 7. Deletar branch de feature
git branch -d feature/article-favorites
git push origin --delete feature/article-favorites
```

### Processo de Hotfix

```bash
# 1. Criar hotfix a partir de main
git checkout main
git checkout -b hotfix/critical-security-fix

# 2. Corrigir o problema
# Fazer alterações...

# 3. Commitar
git commit -m "fix(auth): patch security vulnerability"

# 4. Merge para main
git checkout main
git merge hotfix/critical-security-fix
git tag -a v1.2.1 -m "Security hotfix"
git push origin main --tags

# 5. Merge para develop
git checkout develop
git merge hotfix/critical-security-fix
git push origin develop

# 6. Deletar branch
git branch -d hotfix/critical-security-fix
```

---

## Template de Pull Request

```.github/pull_request_template.md
## Descrição
Breve descrição das mudanças

## Tipo de Mudança
- [ ] Nova funcionalidade
- [ ] Correção de bug
- [ ] Breaking change
- [ ] Atualização de documentação

## Testes
- [ ] Testes unitários adicionados/atualizados
- [ ] Testes E2E adicionados/atualizados
- [ ] Testes manuais concluídos

## Checklist
- [ ] Código segue as diretrizes de estilo
- [ ] Auto-revisão concluída
- [ ] Comentários adicionados para código complexo
- [ ] Documentação atualizada
- [ ] Sem novos warnings
- [ ] Testes passam localmente

## Screenshots (se aplicável)

## Issues Relacionadas
Closes #
```

---

## Melhores Práticas de Mensagens de Commit

### FAÇA

```bash
✅ feat(auth): implement biometric authentication
✅ fix(navigation): resolve deep link routing issue
✅ perf(images): add lazy loading for gallery
✅ docs(readme): update setup instructions
```

### NÃO FAÇA

```bash
❌ fixed stuff
❌ WIP
❌ updates
❌ changed files
```

---

## Comandos Git Úteis

```bash
# Emendar último commit
git commit --amend -m "new message"

# Rebase interativo (limpar histórico)
git rebase -i HEAD~3

# Guardar mudanças
git stash
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# Resetar para remote
git reset --hard origin/main

# Ver histórico
git log --oneline --graph --all
```

---

## Checklist Git Workflow

- [ ] Branches nomeadas corretamente
- [ ] Commits seguem Conventional Commits
- [ ] Mensagens de commit descritivas
- [ ] Template de PR utilizado
- [ ] Code review antes do merge
- [ ] Testes passam antes do merge
- [ ] Branch deletada após merge

---

**Um histórico Git limpo facilita a colaboração e debug.**
