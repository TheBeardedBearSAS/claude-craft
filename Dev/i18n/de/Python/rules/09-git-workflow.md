# Regel 09: Git Workflow

Git-Workflow und Best Practices für Zusammenarbeit.

## Branching-Strategie

### Hauptbranches

- **main**: Produktionscode, immer deploybar
- **develop**: Integrationsbranch für Features (optional)

### Feature-Branches

Erstellen Sie einen Branch für jedes Feature oder jeden Fix:

```bash
# Feature-Branch von main erstellen
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# Fix-Branch erstellen
git checkout -b fix/login-bug

# Hotfix-Branch erstellen (dringend)
git checkout -b hotfix/critical-security-issue
```

### Branch-Benennung

```
feature/kurze-beschreibung     # Neues Feature
fix/kurze-beschreibung         # Bug-Fix
hotfix/kurze-beschreibung      # Dringender Fix
refactor/kurze-beschreibung    # Refactoring
docs/kurze-beschreibung        # Dokumentation
test/kurze-beschreibung        # Tests
chore/kurze-beschreibung       # Wartung
```

## Conventional Commits

Folgen Sie der [Conventional Commits](https://www.conventionalcommits.org/de/) Spezifikation.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Typen

- **feat**: Neues Feature
- **fix**: Bug-Fix
- **docs**: Nur Dokumentation
- **style**: Formatierung, keine Codeänderung
- **refactor**: Code-Refactoring
- **test**: Tests hinzufügen/aktualisieren
- **chore**: Wartungsaufgaben
- **perf**: Performance-Verbesserung
- **ci**: CI/CD-Änderungen
- **build**: Build-System-Änderungen

### Beispiele

```bash
# Feature
git commit -m "feat(auth): JWT-Authentifizierung hinzufügen

JWT-basiertes Authentifizierungssystem implementieren mit:
- Token-Generierung
- Token-Validierung
- Refresh-Token-Mechanismus

Closes #123"

# Bug-Fix
git commit -m "fix(user): Null-E-Mail in Validierung behandeln

Null-Prüfung vor E-Mail-Validierung hinzufügen, um
NullPointerException zu verhindern.

Fixes #456"

# Breaking Change
git commit -m "feat(api)!: User-Endpoint-Antwortformat ändern

BREAKING CHANGE: User-API gibt jetzt verschachtelte Objektstruktur
statt flache Felder zurück. Clients müssen ihre Parser aktualisieren.

Migrationsanleitung: docs/migrations/v2-user-api.md"

# Mehrere Änderungen
git commit -m "chore: Abhängigkeiten aktualisieren

- FastAPI auf 0.109.0 aktualisieren
- Pydantic auf 2.5.0 aktualisieren
- SQLAlchemy auf 2.0.25 aktualisieren

Alle Tests laufen nach Updates durch."
```

## Commit-Richtlinien

### Atomare Commits

Jeder Commit sollte eine einzige logische Änderung sein.

```bash
# ❌ Schlecht: Riesiger Commit mit mehreren unabhängigen Änderungen
git add .
git commit -m "Stuff aktualisiert"

# ✅ Gut: Separate atomare Commits
git add src/domain/entities/user.py
git commit -m "feat(domain): User-Entität mit E-Mail-Validierung hinzufügen"

git add src/application/use_cases/create_user.py
git commit -m "feat(application): CreateUser Use Case hinzufügen"

git add tests/unit/domain/test_user.py
git commit -m "test(domain): User-Entitäts-Tests hinzufügen"
```

### Häufig committen

Committen Sie häufig, auch wenn Änderungen klein sind.

```bash
# Nach jeder sinnvollen Änderung committen
git commit -m "feat(auth): Passwort-Hashing hinzufügen"
git commit -m "feat(auth): Passwort-Validierungsregeln hinzufügen"
git commit -m "test(auth): Passwort-Hashing-Tests hinzufügen"
```

### Gute Commit-Messages

```bash
# ❌ Schlechte Nachrichten
git commit -m "fix"
git commit -m "code aktualisiert"
git commit -m "WIP"
git commit -m "fixes"

# ✅ Gute Nachrichten
git commit -m "fix(api): Request-Body vor Verarbeitung validieren"
git commit -m "refactor(repository): Query-Builder-Logik extrahieren"
git commit -m "docs(readme): Installationsanweisungen hinzufügen"
git commit -m "test(user): Randfälle für E-Mail-Validierung hinzufügen"
```

## Pull Request Workflow

### 1. Branch erstellen

```bash
git checkout -b feature/user-notifications
```

### 2. Änderungen vornehmen

```bash
# Änderungen vornehmen
# Tests schreiben
# Atomar committen

git add tests/test_notifications.py
git commit -m "test(notifications): Notification-Service-Tests hinzufügen"

git add src/services/notification_service.py
git commit -m "feat(notifications): E-Mail-Notification-Service implementieren"
```

### 3. Branch aktuell halten

```bash
# Regelmäßig auf main rebasen
git fetch origin
git rebase origin/main

# Oder merge bei Konflikten
git merge origin/main
```

### 4. Checks ausführen

```bash
# Vor dem Push Qualität sicherstellen
make quality  # lint, type-check, test

# Oder einzeln
make lint
make type-check
make test-cov
```

### 5. Branch pushen

```bash
git push origin feature/user-notifications
```

### 6. Pull Request erstellen

PR-Beschreibungsvorlage:

```markdown
## Zusammenfassung
Kurze Beschreibung, was dieser PR tut und warum.

## Änderungen
- Änderung 1: Beschreibung
- Änderung 2: Beschreibung
- Änderung 3: Beschreibung

## Art der Änderung
- [ ] Neues Feature (feat)
- [ ] Bug-Fix (fix)
- [ ] Refactoring (refactor)
- [ ] Dokumentation (docs)
- [ ] Tests (test)

## Testing
Wie dies getestet wurde:
- [ ] Unit-Tests hinzugefügt/aktualisiert
- [ ] Integrationstests hinzugefügt/aktualisiert
- [ ] Manuelle Tests durchgeführt
- [ ] Alle Tests laufen lokal durch

## Checkliste
- [ ] Code folgt Projekt-Stilrichtlinien
- [ ] Selbstüberprüfung abgeschlossen
- [ ] Kommentare für komplexen Code hinzugefügt
- [ ] Dokumentation aktualisiert
- [ ] Keine neuen Warnungen generiert
- [ ] Tests hinzugefügt, die Fix/Feature beweisen
- [ ] Abhängige Änderungen gemergt

## Zugehörige Issues
Closes #123
Relates to #456

## Screenshots (falls zutreffend)
[Screenshots für UI-Änderungen hinzufügen]
```

### 7. Code-Review

Reviewer-Kommentare adressieren:

```bash
# Angeforderte Änderungen vornehmen
git add .
git commit -m "refactor(user): Validierung in separate Methode extrahieren

Reviewer-Kommentar von @reviewer adressieren"

git push origin feature/user-notifications
```

### 8. Merge

```bash
# Nach Genehmigung über GitHub/GitLab UI mergen
# Normalerweise "Squash and merge" für saubere Historie

# Branch nach Merge löschen
git checkout main
git pull origin main
git branch -d feature/user-notifications
git push origin --delete feature/user-notifications
```

## Nützliche Git-Befehle

### Status prüfen

```bash
# Sehen, was sich geändert hat
git status

# Detaillierte Änderungen sehen
git diff

# Gestagete Änderungen sehen
git diff --staged

# Commit-Historie sehen
git log --oneline --graph --all
```

### Änderungen rückgängig machen

```bash
# Ungestagete Änderungen verwerfen
git checkout -- file.py

# Datei unstagen
git reset HEAD file.py

# Letzten Commit ändern (wenn nicht gepusht)
git commit --amend

# Auf vorherigen Commit zurücksetzen (Vorsicht!)
git reset --hard HEAD~1

# Commit rückgängig machen (sicher, erstellt neuen Commit)
git revert <commit-hash>
```

### Interaktives Rebase

```bash
# Commits vor PR aufräumen
git rebase -i HEAD~3

# Im Editor:
# pick = Commit behalten
# reword = Nachricht ändern
# squash = Mit vorherigem kombinieren
# fixup = Kombinieren ohne Nachricht
# drop = Commit entfernen
```

### Änderungen stashen

```bash
# Aktuelle Änderungen stashen
git stash

# Stashes auflisten
git stash list

# Neuesten Stash anwenden
git stash apply

# Anwenden und Stash entfernen
git stash pop

# Stash mit Nachricht
git stash save "WIP: Benutzer-Authentifizierung"
```

## Git-Konfiguration

```bash
# Benutzerkonfiguration
git config --global user.name "Ihr Name"
git config --global user.email "ihre.email@example.com"

# Editor
git config --global core.editor "code --wait"

# Aliase
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg 'log --oneline --graph --all'

# Auto-Setup Remote-Branch
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

# Typprüfung
.mypy_cache/
.dmypy.json
dmypy.json

# IDEs
.idea/
.vscode/
*.swp
*.swo
*~

# Umgebung
.env
.env.local
.env.*.local

# Datenbank
*.db
*.sqlite
*.sqlite3

# Logs
*.log

# OS
.DS_Store
Thumbs.db
```

## Checkliste

- [ ] Branch folgt Namenskonvention
- [ ] Commits sind atomar und folgen Conventional Commits
- [ ] Commit-Messages sind klar und beschreibend
- [ ] Branch ist aktuell mit main
- [ ] Alle Checks laufen durch (lint, type-check, tests)
- [ ] PR-Beschreibung ist vollständig
- [ ] Selbstüberprüfung durchgeführt
- [ ] Keine Merge-Konflikte
- [ ] Kein temporärer/Debug-Code
- [ ] Kein auskommentierter Code
- [ ] Keine Secrets committed
