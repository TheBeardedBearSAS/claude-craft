# Git Workflow - Conventional Commits

## Estrategia de Branching

### Ramas Principales

```
main (producción)
├── develop (staging)
    ├── feature/user-authentication
    ├── feature/article-list
    ├── bugfix/login-crash
    └── hotfix/security-patch
```

### Nomenclatura de Ramas

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

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Documentación
- **style**: Formato (sin cambio de código)
- **refactor**: Reestructuración de código
- **perf**: Mejora de rendimiento
- **test**: Agregar pruebas
- **chore**: Cambios de build/herramientas
- **ci**: Cambios de CI/CD

### Ejemplos

```bash
# Feature
feat(auth): add social login with Google

Implementa flujo OAuth2 para autenticación de Google.
Los usuarios ahora pueden iniciar sesión con su cuenta de Google.

Closes #123

# Bug fix
fix(profile): resolve image upload crash on Android

La app se cerraba al subir imágenes mayores de 5MB
en dispositivos Android. Se agregó compresión de imagen antes de subir.

Fixes #456

# Performance
perf(articles): optimize FlatList rendering

- Se agregó getItemLayout para mejor scrolling
- Se implementó React.memo para ArticleCard
- Se redujeron los re-renders en 60%

# Breaking change
feat(api)!: migrate to v2 API endpoints

BREAKING CHANGE: Todos los endpoints de API ahora usan el prefijo /v2/.
Actualiza tu configuración API_BASE_URL.

Guía de migración: docs/migration-v2.md
```

---

## Workflow

### Desarrollo de Features

```bash
# 1. Crear rama de feature
git checkout -b feature/article-favorites

# 2. Trabajar en feature
# Hacer cambios...

# 3. Commit de cambios
git add .
git commit -m "feat(articles): add favorite functionality"

# 4. Push al remoto
git push -u origin feature/article-favorites

# 5. Crear Pull Request
gh pr create --title "Add article favorites" --body "Implements #123"

# 6. Después de revisión, merge a develop
git checkout develop
git merge feature/article-favorites
git push origin develop

# 7. Eliminar rama de feature
git branch -d feature/article-favorites
git push origin --delete feature/article-favorites
```

### Proceso Hotfix

```bash
# 1. Crear hotfix desde main
git checkout main
git checkout -b hotfix/critical-security-fix

# 2. Corregir problema
# Hacer cambios...

# 3. Commit
git commit -m "fix(auth): patch security vulnerability"

# 4. Merge a main
git checkout main
git merge hotfix/critical-security-fix
git tag -a v1.2.1 -m "Security hotfix"
git push origin main --tags

# 5. Merge a develop
git checkout develop
git merge hotfix/critical-security-fix
git push origin develop

# 6. Eliminar rama
git branch -d hotfix/critical-security-fix
```

---

## Plantilla de Pull Request

```.github/pull_request_template.md
## Descripción
Breve descripción de los cambios

## Tipo de Cambio
- [ ] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Breaking change
- [ ] Actualización de documentación

## Testing
- [ ] Pruebas unitarias agregadas/actualizadas
- [ ] Pruebas E2E agregadas/actualizadas
- [ ] Testing manual completado

## Checklist
- [ ] El código sigue las guías de estilo
- [ ] Auto-revisión completada
- [ ] Comentarios agregados para código complejo
- [ ] Documentación actualizada
- [ ] Sin nuevos warnings
- [ ] Pruebas pasan localmente

## Capturas de pantalla (si aplica)

## Issues Relacionados
Closes #
```

---

## Mejores Prácticas de Mensajes de Commit

### HACER

```bash
✅ feat(auth): implement biometric authentication
✅ fix(navigation): resolve deep link routing issue
✅ perf(images): add lazy loading for gallery
✅ docs(readme): update setup instructions
```

### NO HACER

```bash
❌ fixed stuff
❌ WIP
❌ updates
❌ changed files
```

---

## Comandos Git Útiles

```bash
# Modificar último commit
git commit --amend -m "new message"

# Rebase interactivo (limpiar historial)
git rebase -i HEAD~3

# Guardar cambios temporalmente
git stash
git stash pop

# Cherry-pick commit
git cherry-pick <commit-hash>

# Resetear al remoto
git reset --hard origin/main

# Ver historial
git log --oneline --graph --all
```

---

## Checklist Git Workflow

- [ ] Ramas nombradas correctamente
- [ ] Commits siguen Conventional Commits
- [ ] Mensajes de commit descriptivos
- [ ] Plantilla PR utilizada
- [ ] Code review antes de merge
- [ ] Pruebas pasan antes de merge
- [ ] Rama eliminada después de merge

---

**Un historial Git limpio facilita la colaboración y el debugging.**
