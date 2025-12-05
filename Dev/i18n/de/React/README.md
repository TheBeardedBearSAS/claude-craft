# React TypeScript Entwicklungsregeln für Claude Code

## Übersicht

Dieser Ordner enthält ein vollständiges Set von Regeln, Templates und Checklisten für die React TypeScript Entwicklung mit Claude Code. Diese Regeln gewährleisten Konsistenz, Qualität und Wartbarkeit des Codes in allen Ihren React-Projekten.

## Ordnerstruktur

```
React/
├── CLAUDE.md.template          # Hauptkonfiguration (in Ihr Projekt kopieren)
├── README.md                   # Diese Datei
│
├── rules/                      # Detaillierte Entwicklungsregeln
│   ├── 00-project-context.md.template
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 04-solid-principles.md
│   ├── 05-kiss-dry-yagni.md
│   ├── 06-tooling.md
│   ├── 07-testing.md
│   ├── 08-quality-tools.md
│   ├── 09-git-workflow.md
│   ├── 10-documentation.md
│   ├── 11-security.md
│   ├── 12-performance.md          # Zu erstellen
│   ├── 13-state-management.md     # Zu erstellen
│   └── 14-styling.md              # Zu erstellen
│
├── templates/                  # Code-Templates
│   ├── component.md           # React-Komponenten-Template
│   ├── hook.md                # Custom Hook Template
│   ├── context.md             # Zu erstellen
│   ├── test-component.md      # Zu erstellen
│   └── test-hook.md           # Zu erstellen
│
└── checklists/                # Validierungs-Checklisten
    ├── pre-commit.md          # Pre-Commit-Checkliste
    ├── new-feature.md         # Neue Feature-Checkliste
    ├── refactoring.md         # Zu erstellen
    └── security.md            # Zu erstellen
```

## Verwendung

### 1. Neues Projekt Initialisieren

1. **CLAUDE.md.template kopieren** in Ihr Projekt:
   ```bash
   cp CLAUDE.md.template /path/to/your/project/CLAUDE.md
   ```

2. **Platzhalter ersetzen** in CLAUDE.md:
   - `{{PROJECT_NAME}}`: Name Ihres Projekts
   - `{{TECH_STACK}}`: Vollständiger Tech-Stack
   - `{{REACT_VERSION}}`: React-Version
   - `{{TYPESCRIPT_VERSION}}`: TypeScript-Version
   - `{{BUILD_TOOL}}`: Vite, Next.js, etc.
   - `{{PACKAGE_MANAGER}}`: pnpm, npm, yarn
   - Etc.

3. **rules/00-project-context.md.template kopieren**:
   ```bash
   cp rules/00-project-context.md.template /path/to/your/project/docs/project-context.md
   ```

4. **Projektkontext ausfüllen** mit spezifischen Informationen.

### 2. Claude Code Konfigurieren

In Ihrem Projekt wird Claude Code automatisch die `CLAUDE.md`-Datei lesen und alle definierten Regeln anwenden.

### 3. Regeln Referenzieren

Jede Regeldatei kann in der Haupt-CLAUDE.md referenziert werden:

```markdown
**Referenz**: `rules/01-workflow-analysis.md`
```

Claude Code wird Zugriff auf alle diese Regeln haben, um Sie bei der Entwicklung zu unterstützen.

## Hauptregeln

### 1. Analyse-Workflow (01-workflow-analysis.md)

**Vor dem Schreiben von Code, IMMER**:
- Bestehenden Code analysieren
- Bedarf verstehen
- Lösung entwerfen
- Entscheidungen dokumentieren

### 2. Architektur (02-architecture.md)

- **Feature-based**: Organisation nach Geschäftsfunktionalität
- **Atomic Design**: Hierarchie atoms → molecules → organisms → templates
- **Container/Presenter**: Logik-/Präsentationstrennung
- **Custom Hooks**: Wiederverwendbare Logik

### 3. Code-Standards (03-coding-standards.md)

- **TypeScript Strict**: Strict-Modus aktiviert
- **ESLint**: Strikte Konfiguration
- **Prettier**: Automatische Formatierung
- **Konventionen**: Konsistente Benennung

### 4. SOLID-Prinzipien (04-solid-principles.md)

Anwendung der SOLID-Prinzipien in React mit konkreten Beispielen.

### 5. KISS, DRY, YAGNI (05-kiss-dry-yagni.md)

- **KISS**: Einfachheit zuerst
- **DRY**: Duplikation intelligent vermeiden
- **YAGNI**: Nur das Notwendige implementieren

### 6. Tooling (06-tooling.md)

Vollständige Konfiguration von:
- Vite / Next.js
- pnpm / npm
- Docker + Makefile
- Build optimization

### 7. Tests (07-testing.md)

- **Test-Pyramide**: 70% Unit, 20% Integration, 10% E2E
- **Vitest**: Unit-Tests
- **React Testing Library**: Komponenten-Tests
- **MSW**: API-Mocking
- **Playwright**: E2E-Tests

### 8. Qualität (08-quality-tools.md)

- **ESLint**: Linting
- **Prettier**: Formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks
- **Commitlint**: Conventional commits

### 9. Git Workflow (09-git-workflow.md)

- **Git Flow**: Branching-Strategie
- **Conventional Commits**: Standardisierte Nachrichten
- **Pull Requests**: Review-Workflow
- **Versioning**: Semantic versioning

### 10. Dokumentation (10-documentation.md)

- **JSDoc/TSDoc**: Code-Dokumentation
- **Storybook**: Komponenten-Dokumentation
- **README**: Projekt-Dokumentation
- **Changelog**: Versionshistorie

### 11. Sicherheit (11-security.md)

- **XSS Prevention**: HTML-Sanitization
- **CSRF Protection**: Tokens und Validierung
- **Input Validation**: Zod schemas
- **Authentication**: JWT, protected routes
- **Dependencies**: Regelmäßige Audits

## Code-Templates

### React-Komponente (templates/component.md)

Vollständiges Template zum Erstellen von React-Komponenten mit:
- TypeScript
- Typisierte Props
- JSDoc
- Tests
- Storybook

### Custom Hook (templates/hook.md)

Template zum Erstellen von Custom Hooks mit:
- TypeScript
- Dokumentation
- Tests
- Verwendungsbeispiele

## Checklisten

### Pre-Commit (checklists/pre-commit.md)

Checkliste vor jedem Commit zu überprüfen:
- Code quality
- Tests
- Dokumentation
- Sicherheit
- Git

### Neues Feature (checklists/new-feature.md)

Vollständiger Workflow zur Implementierung eines neuen Features:
1. Analyse und Planung
2. Technisches Design
3. Implementierung
4. Tests
5. Qualität und Performance
6. Dokumentation
7. Review und Merge
8. Deployment und Monitoring

## Nützliche Befehle

### Entwicklung

```bash
# Neues React + TypeScript Projekt erstellen
npm create vite@latest my-app -- --template react-ts
cd my-app
pnpm install

# Regeln kopieren
cp /path/to/React/CLAUDE.md.template ./CLAUDE.md
```

### Qualität

```bash
# Alles überprüfen
pnpm run quality

# Detail
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run build
```

## Verbleibende Dateien zum Erstellen

Um dieses Regelsystem zu vervollständigen, müssen noch erstellt werden:

### Rules

- [ ] `12-performance.md`: React-Optimierungen (memo, lazy, code splitting)
- [ ] `13-state-management.md`: React Query, Zustand, Context API
- [ ] `14-styling.md`: Tailwind, CSS Modules, styled-components

### Templates

- [ ] `context.md`: Context Provider Template
- [ ] `test-component.md`: Komponenten-Test-Template
- [ ] `test-hook.md`: Hook-Test-Template

### Checklisten

- [ ] `refactoring.md`: Sichere Refactoring-Checkliste
- [ ] `security.md`: Vollständiges Sicherheitsaudit

## Beitrag

Um diese Regeln zu verbessern:

1. Branch erstellen `feature/improve-react-rules`
2. Regeldateien ändern
3. An einem echten Projekt testen
4. Pull Request mit Verbesserungen erstellen

## Ressourcen

### Offizielle Dokumentation

- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- TanStack Query: https://tanstack.com/query
- React Router: https://reactrouter.com

### Empfohlene Tools

- Vite: Schnelles Build-Tool
- pnpm: Performanter Paketmanager
- Vitest: Schnelles Testing-Framework
- Playwright: E2E-Tests
- Storybook: Komponenten-Dokumentation

## Lizenz

Diese Regeln werden "as-is" zur Verwendung mit Claude Code bereitgestellt.

## Support

Für Fragen oder Vorschläge:
- Issue im Repository erstellen
- Claude Code Dokumentation konsultieren

---

**Letzte Aktualisierung**: 2025-12-03
**Version**: 1.0.0
**Maintainer**: TheBeardedCTO
