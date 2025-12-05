# React Native Development Rules for Claude Code

Umfassende Entwicklungsregeln für React Native (TypeScript + Expo) für Claude Code.

---

## 📁 Struktur

```
ReactNative/
├── README.md                           # Diese Datei
├── CLAUDE.md.template                  # Hauptvorlage für Projekte
├── rules/                              # Detaillierte Regeln (15 Dateien)
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
│   ├── 12-performance.md
│   ├── 13-state-management.md
│   └── 14-navigation.md
├── templates/                          # Code-Vorlagen
│   ├── screen.md
│   ├── component.md
│   ├── hook.md
│   └── test-component.md
└── checklists/                         # Validierungs-Checklisten
    ├── pre-commit.md
    ├── new-feature.md
    ├── refactoring.md
    └── security.md
```

---

## 🚀 Quick Start

### Für ein Neues Projekt

1. **Template kopieren**:
   ```bash
   cp CLAUDE.md.template /path/to/your/project/.claude/CLAUDE.md
   ```

2. **Anpassen**:
   - `{{PROJECT_NAME}}` durch den Projektnamen ersetzen
   - `{{TECH_STACK}}` durch den Technologie-Stack ersetzen
   - Spezifische Informationen ausfüllen

3. **Regeln kopieren** (optional aber empfohlen):
   ```bash
   cp -r rules/ /path/to/your/project/.claude/rules/
   cp -r templates/ /path/to/your/project/.claude/templates/
   cp -r checklists/ /path/to/your/project/.claude/checklists/
   ```

### Für ein Bestehendes Projekt

1. **Schrittweise anpassen**:
   - Mit CLAUDE.md beginnen
   - Prioritäre Regeln hinzufügen
   - Checklisten integrieren
   - Templates übernehmen

---

## 📚 Dokumentation

### Regeln nach Kategorie

#### Grundlagen
- **00-project-context**: Projektkontext-Vorlage
- **01-workflow-analysis**: Obligatorischer Analyseprozess
- **02-architecture**: React Native/Expo Architektur
- **03-coding-standards**: TypeScript/React Native Standards

#### Design-Prinzipien
- **04-solid-principles**: SOLID angepasst für React Native
- **05-kiss-dry-yagni**: Prinzipien der Einfachheit

#### Tools & Qualität
- **06-tooling**: Expo CLI, EAS, Metro
- **07-testing**: Jest, Testing Library, Detox
- **08-quality-tools**: ESLint, Prettier, TypeScript
- **09-git-workflow**: Git & Conventional Commits
- **10-documentation**: Dokumentationsstandards

#### Produktion
- **11-security**: Mobile Sicherheit (SecureStore, etc.)
- **12-performance**: Optimierungen (Hermes, FlatList, etc.)
- **13-state-management**: React Query, Zustand, MMKV
- **14-navigation**: Expo Router

---

## 🎯 Grundlegende Regeln

### REGEL #1: OBLIGATORISCHE ANALYSE
**Vor jedem Code, vollständige Analyse.**

Siehe: [rules/01-workflow-analysis.md](./rules/01-workflow-analysis.md)

### REGEL #2: ARCHITECTURE FIRST
**Die etablierte Architektur respektieren.**

Siehe: [rules/02-architecture.md](./rules/02-architecture.md)

### REGEL #3: CODE-STANDARDS
**TypeScript strict, ESLint, Prettier.**

Siehe: [rules/03-coding-standards.md](./rules/03-coding-standards.md)

### REGEL #4: SOLID-PRINZIPIEN
**SOLID, KISS, DRY, YAGNI anwenden.**

Siehe: [rules/04-solid-principles.md](./rules/04-solid-principles.md)

### REGEL #5: OBLIGATORISCHE TESTS
**Coverage > 80%.**

Siehe: [rules/07-testing.md](./rules/07-testing.md)

### REGEL #6: SICHERHEIT
**Security by design.**

Siehe: [rules/11-security.md](./rules/11-security.md)

### REGEL #7: LEISTUNG
**60 FPS target.**

Siehe: [rules/12-performance.md](./rules/12-performance.md)

---

## 📋 Templates

### Screen Component
Vollständige Vorlage zum Erstellen eines neuen Screens mit Expo Router.

Siehe: [templates/screen.md](./templates/screen.md)

### Reusable Component
Vorlage für wiederverwendbare Komponenten mit Typen, Stilen, Tests.

Siehe: [templates/component.md](./templates/component.md)

### Custom Hook
Vorlage für Custom Hook mit React Query oder benutzerdefinierter Logik.

Siehe: [templates/hook.md](./templates/hook.md)

### Component Test
Vollständige Test-Vorlage für Komponenten.

Siehe: [templates/test-component.md](./templates/test-component.md)

---

## ✅ Checklisten

### Pre-Commit
Validierung vor jedem Commit.

Siehe: [checklists/pre-commit.md](./checklists/pre-commit.md)

**Wichtige Punkte**:
- Code lint (0 errors)
- Tests bestehen
- Coverage erhalten
- Performance OK
- Security check

### New Feature
Vollständiger Workflow für neue Funktionalität.

Siehe: [checklists/new-feature.md](./checklists/new-feature.md)

**Phasen**:
1. Analysis
2. Design
3. Setup
4. Implementation (bottom-up)
5. Quality Assurance
6. Documentation
7. Manual Testing
8. Code Review
9. Merge & Deploy
10. Cleanup

### Refactoring
Sicherer Refactoring-Prozess.

Siehe: [checklists/refactoring.md](./checklists/refactoring.md)

**Ansatz**:
- Tests zuerst
- Kleine Commits
- Kontinuierlich testen
- Verhalten bewahren

### Security Audit
Vollständiges Sicherheitsaudit.

Siehe: [checklists/security.md](./checklists/security.md)

**Bereiche**:
- Sensitive data storage
- API security
- Input validation
- Authentication
- Dependencies

---

## 🛠 Empfohlener Stack

### Core
- React Native
- Expo SDK
- TypeScript
- Node.js

### Navigation
- **Expo Router** (file-based routing)

### State Management
- **React Query** (server state)
- **Zustand** (global client state)
- **MMKV** (persistence)

### UI
- StyleSheet (native)
- Reanimated (animations)
- Gesture Handler

### Forms & Validation
- React Hook Form
- Zod

### Testing
- Jest
- React Native Testing Library
- Detox (E2E)

### Tools
- ESLint
- Prettier
- Husky
- EAS CLI

---

## 📖 Verwendung mit Claude Code

### Globale Konfiguration

In `~/.claude/CLAUDE.md` hinzufügen:

```markdown
# React Native Projects

Für React Native Projekte, folgen Sie den Regeln:
/path/to/ReactNative/CLAUDE.md.template

Siehe vollständige Dokumentation:
/path/to/ReactNative/
```

### Projektspezifische Konfiguration

Im React Native Projekt:

```
my-react-native-app/
├── .claude/
│   ├── CLAUDE.md           # Kopiert von CLAUDE.md.template
│   ├── rules/              # (optional) Kopiert von rules/
│   ├── templates/          # (optional) Kopiert von templates/
│   └── checklists/         # (optional) Kopiert von checklists/
├── src/
├── app/
└── package.json
```

Claude Code liest automatisch `.claude/CLAUDE.md`.

---

## 🎓 Philosophie

### Analyse Zuerst
**Think First, Code Later**

Immer beginnen mit:
1. Den Bedarf verstehen
2. Das Bestehende analysieren
3. Die Lösung entwerfen
4. DANN codieren

### Architecture Matters
**Klare Struktur = Wartbarer Code**

- Feature-based organization
- Separation of concerns
- Clean architecture layers

### Quality Over Speed
**Qualitätscode spart Zeit**

- Tests von Anfang an
- Systematisches Code Review
- Strenge Standards
- Kontinuierliches Refactoring

### Security by Design
**Sicherheit ist keine Option**

- Tokens in SecureStore
- Input validation
- HTTPS only
- Dependencies audit

### Performance First
**60 FPS target**

- Hermes engine
- Optimizations (memo, FlatList)
- Images optimized
- Native driver animations

---

## 🔄 Typischer Workflow

### Feature Development

```
Anforderung erhalten
    ↓
ANALYSE (obligatorisch)
    ↓
Design & Planning
    ↓
Setup (branch, ticket)
    ↓
Implementation (bottom-up)
    ├── 1. Types
    ├── 2. Services
    ├── 3. Hooks
    ├── 4. Components
    ├── 5. Screens
    └── 6. Integration
    ↓
Tests
    ↓
Quality Check
    ↓
Documentation
    ↓
Code Review
    ↓
Merge & Deploy
    ↓
Monitor
```

---

## 📊 Qualitätsmetriken

### Ziele

- **Code Coverage**: > 80%
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 errors (strict mode)
- **npm audit**: 0 vulnerabilities
- **Bundle Size**: < 10MB
- **Startup Time**: < 3s
- **FPS**: 60 konstant

---

## 🤝 Contributing

Um diese Regeln zu verbessern:

1. Fork / Clone
2. Branch erstellen (`feature/improvement`)
3. Regeln ändern
4. Mit einem echten Projekt testen
5. Änderungen dokumentieren
6. Pull Request

---

## 📄 License

MIT

---

## 👥 Autoren

- **Ersteller**: TheBeardedCTO
- **Mitwirkende**: Siehe CONTRIBUTORS.md

---

## 🔗 Ressourcen

### Offizielle Dokumentation
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Leitfäden
- [React Query Docs](https://tanstack.com/query)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

### Best Practices
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-03

**Remember**: Diese Regeln sind Leitfäden, keine Dogmen. Passen Sie sie an Ihren Kontext an.
