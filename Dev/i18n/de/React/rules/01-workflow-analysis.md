# Workflow-Analyse

## Zweck

Vor Beginn des Projekts ist es **essenziell**, den bestehenden Entwicklungs-Workflow zu analysieren, um die Arbeit zu beschleunigen und die Qualität zu verbessern.

## Zu analysierende Punkte

### 1. Projekt-Struktur

```bash
# Codebase inspizieren
tree -L 3 -I 'node_modules|dist|build'

# Haupt-Technologien identifizieren
cat package.json | jq '.dependencies'
cat package.json | jq '.devDependencies'
```

**Zu dokumentieren:**
- Ordnerorganisation (Feature-based, Type-based, etc.)
- Architektur-Pattern (Atomic Design, Clean Architecture, etc.)
- Verwendete Haupt-Libraries
- Build-Tooling (Vite, Webpack, etc.)

### 2. Qualitäts-Tools

```bash
# Existierende Konfigurationen prüfen
ls -la | grep -E '\.(eslint|prettier|tsconfig)'

# Qualitäts-Scripts prüfen
cat package.json | jq '.scripts'
```

**Zu dokumentieren:**
- ESLint: Konfiguration und Regeln
- Prettier: Formatierungs-Standards
- TypeScript: Strict Mode und Konfiguration
- Tests: Framework und Coverage
- CI/CD: Pipeline und Automatisierung

### 3. Git-Workflow

```bash
# Branch-Modell verstehen
git branch -a

# Commit-Konventionen prüfen
git log --oneline -20

# Tag-Strategy analysieren
git tag -l
```

**Zu dokumentieren:**
- Branching-Strategy (Git Flow, GitHub Flow, etc.)
- Commit-Message-Konventionen
- PR-Prozess und Templates
- Code-Review-Prozess

### 4. Dependencies und Versionen

```bash
# Versions analysieren
npm list --depth=0

# Veraltete Pakete prüfen
npm outdated

# Sicherheits-Audit
npm audit
```

**Zu dokumentieren:**
- Haupt-Dependencies und Versionen
- Veraltete oder verwundbare Pakete
- Versioning-Policy
- Update-Strategie

## Analyse-Checkliste

```markdown
## Projekt-Verstehen
- [ ] README gelesen und verstanden
- [ ] Projekt-Architektur dokumentiert
- [ ] Haupt-Features identifiziert
- [ ] Technologie-Stack aufgelistet

## Development-Umgebung
- [ ] Projekt lokal aufgesetzt
- [ ] Dev-Server gestartet
- [ ] Build-Prozess validiert
- [ ] Test-Suite ausgeführt

## Code-Standards
- [ ] ESLint-Konfiguration analysiert
- [ ] Prettier-Regeln verstanden
- [ ] TypeScript-Config geprüft
- [ ] Namenskonventionen identifiziert

## Testing-Strategy
- [ ] Test-Framework identifiziert
- [ ] Coverage-Anforderungen verstanden
- [ ] Test-Organisation analysiert
- [ ] E2E-Tests geprüft

## Deployment
- [ ] Build-Prozess verstanden
- [ ] Deployment-Ziele identifiziert
- [ ] CI/CD-Pipeline analysiert
- [ ] Environment-Variablen dokumentiert
```

## Workflow-Dokumentations-Template

```markdown
# Projekt Workflow

## Übersicht
[Kurze Projekt-Beschreibung]

## Tech Stack
- **Framework**: React 18.x
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **Testing**: Vitest + Playwright

## Projekt-Struktur
\`\`\`
src/
├── components/       # Wiederverwendbare Komponenten
├── features/         # Business-Features
├── hooks/            # Custom Hooks
├── services/         # API Services
├── utils/            # Utilities
└── types/            # TypeScript Types
\`\`\`

## Development-Workflow

### Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

### Before Commit
\`\`\`bash
npm run lint        # Linting
npm run type-check  # Type-Prüfung
npm run test        # Tests
\`\`\`

### Branching
- **main**: Production
- **develop**: Integration
- **feature/***: Neue Features
- **fix/***: Bug Fixes

### Commits
Format: `type(scope): subject`
Beispiel: `feat(auth): add login form`

## Quality Gates
- ESLint: 0 errors, 0 warnings
- TypeScript: No type errors
- Tests: >80% coverage
- Build: Success

## Deployment
[Deployment-Prozess beschreiben]
```

## Best Practices

### 1. Änderungen Inkrementell Machen

```typescript
// ❌ Nicht: Alles auf einmal refactoren
// ✅ Gut: Schritt für Schritt vorgehen

// Schritt 1: Einen Komponenten-Type refactoren
// Schritt 2: Tests hinzufügen
// Schritt 3: Nächsten Typ refactoren
```

### 2. Bestehende Patterns Respektieren

```typescript
// Wenn das Projekt diese Struktur nutzt:
features/
  users/
    components/
    hooks/
    services/

// Dann folge dem gleichen Pattern für neue Features:
features/
  products/
    components/
    hooks/
    services/
```

### 3. Vor Änderung Verstehen

```bash
# Vor dem Refactoring:
1. Tests lesen
2. Dependencies verstehen
3. Usage-Beispiele finden
4. Breaking Changes identifizieren
```

## Kommunikations-Checkliste

### Mit dem Team

- [ ] Workflow-Präferenzen besprechen
- [ ] Code-Review-Prozess klären
- [ ] Testing-Erwartungen alignment
- [ ] Deployment-Permissions prüfen

### Dokumentation

- [ ] Workflow-Dokumentation erstellen
- [ ] Diagramme für Architektur
- [ ] Onboarding-Guide aktualisieren
- [ ] Decision-Records pflegen

## Tools für Workflow-Analyse

### Dependency-Analyse

```bash
# Visualisiere Dependencies
npx madge --image graph.svg src/

# Zirkuläre Dependencies finden
npx madge --circular src/
```

### Code-Metriken

```bash
# Code-Komplexität
npx complexity-report src/

# Duplikation finden
npx jscpd src/
```

### Bundle-Analyse

```bash
# Bundle-Größe analysieren
npm run build
npx vite-bundle-visualizer
```

## Fazit

Eine gründliche Workflow-Analyse ermöglicht:

1. ✅ **Effizienz**: Schneller arbeiten im Projekt-Kontext
2. ✅ **Qualität**: Standards von Anfang an einhalten
3. ✅ **Kollaboration**: Reibungslose Teamarbeit
4. ✅ **Wartbarkeit**: Konsistente Codebase
5. ✅ **Onboarding**: Neue Entwickler schneller einarbeiten

**Goldene Regel**: Niemals anfangen zu coden, bevor du den Workflow verstanden hast.
