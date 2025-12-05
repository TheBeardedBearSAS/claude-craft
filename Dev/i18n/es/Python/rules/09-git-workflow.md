# Regla 09: Flujo de Trabajo Git

Flujo de trabajo Git y mejores prácticas para colaboración.

## Estrategia de Ramificación

### Ramas Principales

- **main**: Código de producción, siempre desplegable
- **develop**: Rama de integración para funcionalidades (opcional)

### Ramas de Funcionalidad

Crear una rama para cada funcionalidad o corrección:

```bash
# Crear rama de funcionalidad desde main
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# Crear rama de corrección
git checkout -b fix/login-bug

# Crear rama de hotfix (urgente)
git checkout -b hotfix/critical-security-issue
```

### Nomenclatura de Ramas

```
feature/descripcion-corta     # Nueva funcionalidad
fix/descripcion-corta         # Corrección de bug
hotfix/descripcion-corta      # Corrección urgente
refactor/descripcion-corta    # Refactorización
docs/descripcion-corta        # Documentación
test/descripcion-corta        # Pruebas
chore/descripcion-corta       # Mantenimiento
```

## Commits Convencionales

Seguir la especificación de [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<tipo>(<ámbito>): <asunto>

<cuerpo>

<pie de página>
```

### Tipos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Solo documentación
- **style**: Formato, sin cambio de código
- **refactor**: Refactorización de código
- **test**: Agregar/actualizar pruebas
- **chore**: Tareas de mantenimiento
- **perf**: Mejora de rendimiento
- **ci**: Cambios en CI/CD
- **build**: Cambios en sistema de build

### Ejemplos

```bash
# Funcionalidad
git commit -m "feat(auth): agregar autenticación JWT

Implementar sistema de autenticación basado en JWT con:
- Generación de token
- Validación de token
- Mecanismo de refresh token

Closes #123"

# Corrección de bug
git commit -m "fix(user): manejar email nulo en validación

Agregar verificación de nulo antes de validar email para prevenir
NullPointerException.

Fixes #456"

# Cambio disruptivo
git commit -m "feat(api)!: cambiar formato de respuesta de endpoint de usuario

BREAKING CHANGE: La API de usuario ahora devuelve estructura de objeto
anidada en lugar de campos planos. Los clientes deben actualizar sus parsers.

Guía de migración: docs/migrations/v2-user-api.md"

# Múltiples cambios
git commit -m "chore: actualizar dependencias

- Actualizar FastAPI a 0.109.0
- Actualizar Pydantic a 2.5.0
- Actualizar SQLAlchemy a 2.0.25

Todas las pruebas pasan después de las actualizaciones."
```

## Guías de Commit

### Commits Atómicos

Cada commit debe ser un cambio lógico único.

```bash
# ❌ Malo: Commit gigante con múltiples cambios no relacionados
git add .
git commit -m "Actualizadas cosas"

# ✅ Bueno: Commits atómicos separados
git add src/domain/entities/user.py
git commit -m "feat(domain): agregar entidad User con validación de email"

git add src/application/use_cases/create_user.py
git commit -m "feat(application): agregar caso de uso CreateUser"

git add tests/unit/domain/test_user.py
git commit -m "test(domain): agregar pruebas de entidad User"
```

### Hacer Commit Frecuentemente

Hacer commit frecuentemente, incluso si los cambios son pequeños.

```bash
# Commit después de cada cambio significativo
git commit -m "feat(auth): agregar hash de contraseña"
git commit -m "feat(auth): agregar reglas de validación de contraseña"
git commit -m "test(auth): agregar pruebas de hash de contraseña"
```

### Buenos Mensajes de Commit

```bash
# ❌ Malos mensajes
git commit -m "fix"
git commit -m "código actualizado"
git commit -m "WIP"
git commit -m "correcciones"

# ✅ Buenos mensajes
git commit -m "fix(api): validar cuerpo de solicitud antes de procesar"
git commit -m "refactor(repository): extraer lógica de constructor de consultas"
git commit -m "docs(readme): agregar instrucciones de instalación"
git commit -m "test(user): agregar casos extremos para validación de email"
```

## Flujo de Trabajo de Pull Request

### 1. Crear Rama

```bash
git checkout -b feature/user-notifications
```

### 2. Hacer Cambios

```bash
# Hacer cambios
# Escribir pruebas
# Commit atómicamente

git add tests/test_notifications.py
git commit -m "test(notifications): agregar pruebas de servicio de notificación"

git add src/services/notification_service.py
git commit -m "feat(notifications): implementar servicio de notificación por email"
```

### 3. Mantener Rama Actualizada

```bash
# Rebase en main regularmente
git fetch origin
git rebase origin/main

# O merge si hay conflictos
git merge origin/main
```

### 4. Ejecutar Verificaciones

```bash
# Antes de hacer push, asegurar calidad
make quality  # lint, type-check, test

# O individualmente
make lint
make type-check
make test-cov
```

### 5. Push de Rama

```bash
git push origin feature/user-notifications
```

### 6. Crear Pull Request

Template de descripción de PR:

```markdown
## Resumen
Breve descripción de lo que hace este PR y por qué.

## Cambios
- Cambio 1: Descripción
- Cambio 2: Descripción
- Cambio 3: Descripción

## Tipo de Cambio
- [ ] Nueva funcionalidad (feat)
- [ ] Corrección de bug (fix)
- [ ] Refactorización (refactor)
- [ ] Documentación (docs)
- [ ] Pruebas (test)

## Pruebas
Cómo se probó esto:
- [ ] Pruebas unitarias agregadas/actualizadas
- [ ] Pruebas de integración agregadas/actualizadas
- [ ] Pruebas manuales realizadas
- [ ] Todas las pruebas pasan localmente

## Lista de Verificación
- [ ] El código sigue las guías de estilo del proyecto
- [ ] Auto-revisión completada
- [ ] Comentarios agregados para código complejo
- [ ] Documentación actualizada
- [ ] No se generaron nuevas advertencias
- [ ] Pruebas agregadas que prueban que la corrección/funcionalidad funciona
- [ ] Cambios dependientes fusionados

## Issues Relacionados
Closes #123
Relates to #456

## Capturas de Pantalla (si aplica)
[Agregar capturas de pantalla para cambios de UI]
```

### 7. Revisión de Código

Atender comentarios de revisores:

```bash
# Hacer cambios solicitados
git add .
git commit -m "refactor(user): extraer validación a método separado

Atender comentario de revisión de @reviewer"

git push origin feature/user-notifications
```

### 8. Merge

```bash
# Después de aprobación, merge vía UI de GitHub/GitLab
# Usualmente "Squash and merge" para historial limpio

# Eliminar rama después del merge
git checkout main
git pull origin main
git branch -d feature/user-notifications
git push origin --delete feature/user-notifications
```

## Comandos Git Útiles

### Verificar Estado

```bash
# Ver qué cambió
git status

# Ver cambios detallados
git diff

# Ver cambios en staging
git diff --staged

# Ver historial de commits
git log --oneline --graph --all
```

### Deshacer Cambios

```bash
# Descartar cambios no en staging
git checkout -- file.py

# Quitar archivo de staging
git reset HEAD file.py

# Modificar último commit (si no se hizo push)
git commit --amend

# Resetear a commit anterior (¡cuidado!)
git reset --hard HEAD~1

# Revertir commit (seguro, crea nuevo commit)
git revert <commit-hash>
```

### Rebase Interactivo

```bash
# Limpiar commits antes de PR
git rebase -i HEAD~3

# En el editor:
# pick = mantener commit
# reword = cambiar mensaje
# squash = combinar con anterior
# fixup = combinar sin mensaje
# drop = eliminar commit
```

### Stash de Cambios

```bash
# Hacer stash de cambios actuales
git stash

# Listar stashes
git stash list

# Aplicar último stash
git stash apply

# Aplicar y eliminar stash
git stash pop

# Stash con mensaje
git stash save "WIP: autenticación de usuario"
```

## Configuración de Git

```bash
# Configuración de usuario
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@example.com"

# Editor
git config --global core.editor "code --wait"

# Alias
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg 'log --oneline --graph --all'

# Auto-setup de rama remota
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

# Testing
.pytest_cache/
.coverage
htmlcov/
.tox/

# Type checking
.mypy_cache/
.dmypy.json
dmypy.json

# IDEs
.idea/
.vscode/
*.swp
*.swo
*~

# Environment
.env
.env.local
.env.*.local

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

## Lista de Verificación

- [ ] La rama sigue convención de nomenclatura
- [ ] Los commits son atómicos y siguen Conventional Commits
- [ ] Los mensajes de commit son claros y descriptivos
- [ ] La rama está actualizada con main
- [ ] Todas las verificaciones pasan (lint, type-check, tests)
- [ ] La descripción del PR está completa
- [ ] Auto-revisión realizada
- [ ] Sin conflictos de merge
- [ ] Sin código temporal/debug
- [ ] Sin código comentado
- [ ] Sin secretos committeados
