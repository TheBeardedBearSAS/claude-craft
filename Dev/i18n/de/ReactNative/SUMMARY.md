# Summary - React Native Development Rules

Vollständige Zusammenfassung aller erstellten Dateien für die React Native-Entwicklung mit Claude Code.

---

## 📊 Statistiken

- **Gesamtdateien**: 25 Markdown-Dateien
- **Gesamtgröße**: ~274 KB
- **Codezeilen**: ~8.000+ Zeilen Dokumentation
- **Kategorien**: 4 (Rules, Templates, Checklists, Docs)

---

## 📁 Vollständige Struktur

```
ReactNative/
├── README.md                              ✅ Nutzungsanleitung
├── SUMMARY.md                             ✅ Diese Datei
├── CLAUDE.md.template                     ✅ Hauptvorlage (12 KB)
│
├── rules/                                 ✅ 15 detaillierte Regeln
│   ├── 00-project-context.md.template    ✅ Projektkontext-Vorlage (9.2 KB)
│   ├── 01-workflow-analysis.md           ✅ Obligatorische Analyse (18 KB)
│   ├── 02-architecture.md                ✅ RN-Architektur (32 KB)
│   ├── 03-coding-standards.md            ✅ TypeScript-Standards (25 KB)
│   ├── 04-solid-principles.md            ✅ SOLID-Prinzipien (27 KB)
│   ├── 05-kiss-dry-yagni.md              ✅ Einfachheit (25 KB)
│   ├── 06-tooling.md                     ✅ Expo/EAS-Tools (4.4 KB)
│   ├── 07-testing.md                     ✅ Testing (8.5 KB)
│   ├── 08-quality-tools.md               ✅ ESLint/Prettier (2.2 KB)
│   ├── 09-git-workflow.md                ✅ Git & Conventional Commits (4.5 KB)
│   ├── 10-documentation.md               ✅ Dokumentation (4.4 KB)
│   ├── 11-security.md                    ✅ Mobile Sicherheit (16 KB)
│   ├── 12-performance.md                 ✅ Performance (15 KB)
│   ├── 13-state-management.md            ✅ State Management (13 KB)
│   └── 14-navigation.md                  ✅ Expo Router (12 KB)
│
├── templates/                             ✅ 4 Code-Vorlagen
│   ├── screen.md                         ✅ Screen-Vorlage (3.7 KB)
│   ├── component.md                      ✅ Komponenten-Vorlage (3.6 KB)
│   ├── hook.md                           ✅ Hook-Vorlage (4.6 KB)
│   └── test-component.md                 ✅ Test-Vorlage (6.3 KB)
│
├── checklists/                            ✅ 4 Validierungs-Checklisten
│   ├── pre-commit.md                     ✅ Pre-commit (2.4 KB)
│   ├── new-feature.md                    ✅ Neues Feature (4.5 KB)
│   ├── refactoring.md                    ✅ Refactoring (5.9 KB)
│   └── security.md                       ✅ Sicherheitsaudit (7.0 KB)
│
└── examples/                              📁 (leer, für zukünftige Beispiele)
```

---

## 📚 Detaillierter Inhalt

### 🎯 Hauptdateien

#### README.md (6.5 KB)
- Vollständige Übersicht
- Schnellstartanleitung
- Projektstruktur
- Verwendung mit Claude Code
- Philosophie und Workflow
- Ressourcen

#### CLAUDE.md.template (12 KB)
- Hauptvorlage für Projekte
- Projektkontext
- 7 grundlegende Regeln
- Tech Stack
- Wesentliche Befehle
- Architektur
- Vollständige Dokumentation
- Typischer Workflow
- Anweisungen für Claude Code

---

### 📖 Rules (15 Dateien, ~190 KB)

#### 00-project-context.md.template (9.2 KB)
Vorlage mit Platzhaltern für:
- Allgemeine Informationen
- Expo-Konfiguration
- Detaillierter Tech Stack
- Umgebungen
- APIs und Services
- Features
- Technische Einschränkungen
- Build & Deployment
- Team
- Konventionen

#### 01-workflow-analysis.md (18 KB)
**Absolute Regel**: Obligatorische Analyse vor dem Codieren
- Phase 1: Anforderungsverständnis
- Phase 2: Technische Analyse
- Phase 3: Auswirkungsidentifikation
- Phase 4: Lösungsdesign
- Phase 5: Implementierungsplan
- Phase 6: Vor-Implementierungs-Validierung
- Vollständige Beispiele (Feature, Bug Fix)

#### 02-architecture.md (32 KB)
Vollständige React Native-Architektur:
- Architekturprinzipien (Clean Architecture)
- Feature-basierte Organisation
- Detaillierte Ordnerstruktur
- Layer-Details (4 Schichten)
- App Router (Expo Router)
- Komponenten (UI, Smart, Compound)
- Hooks-Muster
- Multi-Level State Management
- Services (API, Storage)
- Navigation
- Plattformspezifischer Code
- Native Module
- Best Practices (DI, Repository, Adapter)

#### 03-coding-standards.md (25 KB)
TypeScript/React Native-Standards:
- TypeScript Strict Mode-Konfiguration
- Typ-Annotationen
- Interface vs Type
- Generics und Type Guards
- Utility Types
- Komponenten-Standards (Funktional, Struktur)
- Props-Destrukturierung
- Bedingtes Rendering
- Event-Handler
- Hooks-Standards (Benennung, Struktur, Regeln)
- Abhängigkeits-Arrays
- Styling-Standards (StyleSheet, Organisation)
- Dynamische Styles
- Theme-Integration
- Plattformspezifische Muster
- Imports-Organisation
- Fehlerbehandlung
- Performance (Memoization, FlatList)
- Namenskonventionen
- Kommentare & JSDoc

#### 04-solid-principles.md (27 KB)
SOLID angepasst für React Native:
- **S**RP: Single Responsibility (User Profile-Beispiele)
- **O**CP: Open/Closed (Button-Varianten, Storage-Abstraktion)
- **L**SP: Liskov Substitution (Button-Verträge, List-Komponenten)
- **I**SP: Interface Segregation (ArticleCard, Form-Komponenten)
- **D**IP: Dependency Inversion (Repository-Muster, DI)
- Vollständige Beispiele für jedes Prinzip
- Vorteile und Anti-Muster

#### 05-kiss-dry-yagni.md (25 KB)
Einfachheitsprinzipien:
- **KISS**: Keep It Simple
  - Over-Engineering vs Einfache Lösungen
  - Einfaches State Management
  - Einfaches Data Fetching
  - Bedingtes Rendering
- **DRY**: Don't Repeat Yourself
  - Duplizierter Code → Wiederverwendeter Code
  - Validierungs-Utils
  - Wiederverwendbare Hooks/Komponenten
  - Zentralisierte Styles
  - Regel von 3
- **YAGNI**: You Aren't Gonna Need It
  - Zukunfts-Over-Engineering
  - Pagination, i18n, Theme "für alle Fälle"
  - Wann vorausplanen (Sicherheit, Performance)
- Balance zwischen den 3 Prinzipien

#### 06-tooling.md (4.4 KB)
Expo/EAS-Tools:
- Expo CLI (Installation, Befehle)
- EAS (Build, Update, Submit)
- eas.json-Konfiguration
- Metro Bundler-Konfiguration
- Entwicklungstools (Debugger, Flipper)
- VS Code-Erweiterungen
- Paketverwaltung (npm vs yarn)

#### 07-testing.md (8.5 KB)
Vollständiges Testing:
- Testtypen (Unit, Component, Integration, E2E)
- Jest-Konfiguration
- Unit-Tests (Utils, Services)
- Komponenten-Tests (Testing Library)
- Hooks-Testing
- Testing mit React Query
- E2E mit Detox
- Test-Organisation
- Coverage

#### 08-quality-tools.md (2.2 KB)
Qualitätstools:
- ESLint-Konfiguration
- Prettier-Konfiguration
- TypeScript Strict Mode
- Pre-Commit-Hooks (Husky)
- lint-staged

#### 09-git-workflow.md (4.5 KB)
Git & Conventional Commits:
- Branching-Strategie
- Branch-Benennung
- Conventional Commits (Typen, Format)
- Vollständige Beispiele
- Feature-Entwicklungs-Workflow
- Hotfix-Prozess
- Pull Request-Vorlage
- Best Practices
- Nützliche Git-Befehle

#### 10-documentation.md (4.4 KB)
Dokumentationsstandards:
- JSDoc-Kommentare
- Komponentendokumentation
- README-Struktur
- Inline-Kommentare (wann/wie)
- ADR (Architecture Decision Records)
- API-Dokumentation
- Changelog

#### 11-security.md (16 KB)
Vollständige mobile Sicherheit:
- **Secure Storage**: SecureStore, MMKV-Verschlüsselung
- **API Security**: Token-Management, Interceptors, Certificate Pinning
- **Input Validation**: Zod-Schemas, Sanitization
- **Biometric Authentication**: Setup, Implementierung
- **Code Obfuscation**: react-native-obfuscating-transformer
- **Environment Variables**: .env, EAS Secrets
- **Network Security**: HTTPS, Timeout
- **Screen Security**: Screenshot-Verhinderung
- **Deep Link Security**: Validierung
- **Security Checklist** (Development, Pre-Production, Post-Production)
- **Common Vulnerabilities** (XSS, SQL Injection, MITM)

#### 12-performance.md (15 KB)
Performance-Optimierungen:
- **Hermes Engine**: Konfiguration, Vorteile
- **FlatList Optimization**: Props, Memoization, getItemLayout
- **Image Optimization**: expo-image, Größenanpassung, Lazy Loading
- **Memoization**: React.memo, useMemo, useCallback
- **Animations Performance**: Native Driver, Reanimated, LayoutAnimation
- **Bundle Size**: Analysieren, Code Splitting, Nicht verwendete entfernen
- **Network Performance**: Batching, Caching, Pagination
- **JavaScript Performance**: Inline vermeiden, Debounce
- **Memory Management**: Cleanup, Async abbrechen
- **Profiling Tools**: React DevTools, Performance Monitor
- **Performance Checklist**
- **Metrics** (Ziel: 60 FPS, < 3s Startup, etc.)

#### 13-state-management.md (13 KB)
Multi-Level State Management:
- **React Query**: Setup, Queries, Mutations, Optimistische Updates, Infinite Queries
- **Zustand**: Basic Store, Persistent (MMKV), Selectors, Slices
- **MMKV**: Schneller Speicher, Verschlüsselter Speicher
- **Decision Tree**: Welches Tool für welchen Bedarf
- **Best Practices**: Concerns nicht mischen, Selectors verwenden, Daten normalisieren
- **Offline Support**: useOfflineQuery
- **Checklist**

#### 14-navigation.md (12 KB)
Expo Router (Navigation):
- Installation & Setup
- **File-based Routing**: Grundstruktur, Root Layout
- **Route Groups**: Tabs, Auth Groups
- **Dynamic Routes**: Einzelner Param, Mehrere Params, Catch-all
- **Navigation API**: router.push/replace/back, useRouter, useNavigation
- **Deep Linking**: Konfiguration, Handling
- **Modal Screens**: Konfiguration
- **Protected Routes**: Authentifizierungsprüfung
- **Type-safe Navigation**: TypeScript-Typen
- **Navigation Patterns**: Tabs+Stack, Drawer, Onboarding
- **Screen Options**: Pro-Screen-Konfiguration
- **Best Practices**: Nach Feature organisieren, Route Groups verwenden, Params typisieren

---

### 🎨 Templates (4 Dateien, ~18 KB)

#### screen.md (3.7 KB)
Vollständige Screen-Vorlage:
- Vollständige Struktur (Imports, State, Hooks, Handlers, Render)
- Separate Styles
- Tests (Rendering, Loading, Error States)
- Screen-Optionen für Expo Router

#### component.md (3.6 KB)
Wiederverwendbare Komponenten-Vorlage:
- Struktur (Props, State, Handlers, Render)
- Separate Typen (Interfaces)
- Styles (StyleSheet)
- Vollständige Tests
- Index-Export

#### hook.md (4.6 KB)
Custom Hook-Vorlage:
- Struktur (State, Refs, Effects, Callbacks, Return)
- Beispiel mit React Query (CRUD-Operationen)
- Tests (Initialisierung, Fetching, Errors, Refetch)

#### test-component.md (6.3 KB)
Vollständige Test-Vorlage:
- Test-Struktur (describe, beforeEach)
- Rendering-Tests
- Interaktions-Tests
- States-Tests (Loading, Error, Empty)
- Async-Verhalten-Tests
- Accessibility-Tests
- Styling-Tests
- Edge Cases-Tests
- Snapshot-Tests
- Integrations-Tests

---

### ✅ Checklists (4 Dateien, ~20 KB)

#### pre-commit.md (2.4 KB)
Pre-Commit-Validierung:
- Code Quality (Lint, Format, Type-Check)
- Tests (Unit, Component, Coverage)
- Code Standards (Benennung, Imports, DRY, JSDoc)
- Performance (Memoization, Images, FlatList)
- Security (Secrets, Validierung, Storage)
- Architecture (SRP, Separation, DI)
- Documentation (README, JSDoc, Changelog)
- Git (Message, Atomic, Branch)
- Final Check

#### new-feature.md (4.5 KB)
Vollständiger Feature-Workflow (10 Phasen):
1. **Analysis** (obligatorisch): Anforderungen, User Stories, Use Cases
2. **Design**: Architektur, Datenmodellierung, Technische Entscheidungen
3. **Setup**: Branch, Ticket, Abhängigkeiten
4. **Implementation** (Bottom-up): Data → Logic → UI → Screens → Integration
5. **Quality Assurance**: Code-Qualität, Testing, Performance, Security, Accessibility
6. **Documentation**: JSDoc, Kommentare, README, ADR
7. **Manual Testing**: Funktional, Plattformen, UX
8. **Code Review**: PR, Reviewer, Feedback
9. **Merge & Deploy**: Staging, Produktion, Monitoring
10. **Cleanup**: Branch löschen, Ticket schließen
+ **Post-Launch**: Metriken, Feedback, Retrospektive

#### refactoring.md (5.9 KB)
Sicheres Refactoring (5 Phasen):
1. **Preparation**: Verständnis, Dokumentation, Tests
2. **Planning**: Strategie, Risikobewertung
3. **Refactoring**: Inkrementelle Änderungen, Code-Qualität, Tests
4. **Validation**: Automatisiertes Testing, Manuelles Testing, Code Review
5. **Deployment**: Pre-Deploy, Deploy, Post-Deploy
+ **Refactoring Patterns**: Extract Method, Extract Component, Introduce Hook
+ **Common Pitfalls**: Vermeiden/Tun-Listen

#### security.md (7.0 KB)
Vollständiges Sicherheitsaudit (16 Abschnitte):
1. Sensitive Data Storage
2. API Security
3. Input Validation
4. Authentication & Authorization
5. Code Security
6. Platform Security (iOS/Android)
7. Network Security
8. Offline Security
9. Error Handling
10. Third-Party Security
11. WebView Security
12. Biometric Security
13. Code Obfuscation
14. Compliance (GDPR, CCPA, HIPAA)
15. Monitoring & Response
16. Testing
+ **Security Score**: Critical/High/Medium/Low

---

## 🎯 Grundlegende Regeln (Zusammenfassung)

### REGEL #1: OBLIGATORISCHE ANALYSE
Vor jedem Code vollständige Analyse (6 Phasen).
**Verhältnis**: 1h Analyse = 1h Code mindestens.

### REGEL #2: ARCHITEKTUR ZUERST
Feature-basierte + Clean Architecture befolgen.
**Struktur**: Data → Logic → UI → Screens.

### REGEL #3: CODE-STANDARDS
TypeScript Strict, ESLint 0 Fehler, Prettier Auto-Format.
**Qualität**: JSDoc, Named Exports, organisierte Imports.

### REGEL #4: SOLID-PRINZIPIEN
SOLID + KISS + DRY + YAGNI anwenden.
**Einfachheit**: Einfacher Code > Cleverer Code.

### REGEL #5: OBLIGATORISCHE TESTS
Coverage > 80%, alle Testtypen.
**Testing**: Unit + Component + Integration + E2E.

### REGEL #6: SICHERHEIT
Security by Design, SecureStore, Validierung.
**Schutz**: Sichere Tokens, HTTPS, Abhängigkeiten auditieren.

### REGEL #7: PERFORMANCE
60 FPS-Ziel, Hermes, Optimierungen.
**Geschwindigkeit**: Memoization, FlatList, Images, Animations.

---

## 📦 Empfohlener Tech Stack

### Core
- **React Native** (latest)
- **Expo SDK** (latest)
- **TypeScript** (strict mode)
- **Node.js** (18+)

### Navigation
- **Expo Router** (file-based routing)

### State Management
- **React Query** (server state, cache)
- **Zustand** (global client state)
- **MMKV** (fast persistence)

### UI & Styling
- **StyleSheet** (native styling)
- **Theme** (centralized)
- **Reanimated** (animations)
- **Gesture Handler** (gestures)

### Forms & Validation
- **React Hook Form** (forms management)
- **Zod** (validation schemas)

### Testing
- **Jest** (unit tests)
- **React Native Testing Library** (component tests)
- **Detox** (E2E tests)

### Quality Tools
- **ESLint** (linting)
- **Prettier** (formatting)
- **Husky** (git hooks)
- **TypeScript** (type checking)

### Build & Deploy
- **EAS CLI** (Expo Application Services)
- **Metro** (bundler)

---

## 🚀 Verwendung

### Für Neues Projekt

```bash
# 1. Vorlage kopieren
cp CLAUDE.md.template /my-project/.claude/CLAUDE.md

# 2. Anpassen
# {{PROJECT_NAME}}, {{TECH_STACK}}, etc. ersetzen

# 3. Regeln kopieren (optional)
cp -r rules/ /my-project/.claude/rules/
cp -r templates/ /my-project/.claude/templates/
cp -r checklists/ /my-project/.claude/checklists/
```

### Für Bestehendes Projekt

```bash
# 1. CLAUDE.md kopieren
cp CLAUDE.md.template /existing-project/.claude/CLAUDE.md

# 2. Schrittweise anpassen
# Mit prioritären Regeln beginnen
```

---

## 💡 Highlights

### Vollständige Dokumentation
- **~8.000+ Zeilen** detaillierte Dokumentation
- **50+ Beispiele** konkreter Code
- **100+ Code-Snippets** React Native/TypeScript
- Französisch für Erklärungen, Englisch für Code

### Vollständige Abdeckung
- **Architecture**: Clean Architecture, Feature-based
- **Code Standards**: TypeScript strict, ESLint, Prettier
- **Patterns**: SOLID, KISS, DRY, YAGNI
- **Testing**: Unit, Component, Integration, E2E
- **Security**: SecureStore, validation, HTTPS, audit
- **Performance**: Hermes, memoization, FlatList, animations
- **State**: React Query, Zustand, MMKV
- **Navigation**: Expo Router, deep links, types

### Praktisch
- **4 Templates** gebrauchsfertiger Code
- **4 Checklists** zur Validierung
- **15 Regeln** detailliert
- **Workflow** vollständig (analysis → code → deploy)

---

## 📈 Qualitätsmetrik-Ziele

- **Code Coverage**: > 80%
- **ESLint**: 0 Fehler, 0 Warnungen
- **TypeScript**: 0 Fehler (strict mode)
- **npm audit**: 0 Schwachstellen
- **Bundle Size**: < 10MB
- **Startup Time**: < 3s
- **FPS**: 60 konstant
- **Memory**: < 200MB

---

## 🎓 Philosophie

### Think First, Code Later
Obligatorische Analyse vor jedem Code.

### Architecture Matters
Klare Struktur = Wartbarer Code.

### Quality Over Speed
Qualitätscode spart Zeit.

### Security by Design
Sicherheit von Anfang an, nicht nachträglich.

### Performance First
60 FPS-Ziel, native Optimierungen.

---

## ✅ Vollständigkeit

### Regeln: 15/15 ✅
- Alle wesentlichen Regeln abgedeckt
- Von der Analyse bis zum Deployment
- Konkrete Beispiele überall

### Templates: 4/4 ✅
- Screen, Component, Hook, Test
- Bereit zum Kopieren-Einfügen
- Mit Typen, Styles, Tests

### Checklists: 4/4 ✅
- Pre-commit, Feature, Refactoring, Security
- Vollständige Validierung
- Klarer Prozess

### Dokumentation: 100% ✅
- Vollständiges README
- CLAUDE.md-Vorlage
- Alle Dateien dokumentiert

---

## 🔮 Zukunft (Potenzial)

### Mögliche Erweiterungen
- [ ] Vollständige Code-Beispiele (Ordner examples/)
- [ ] Video tutorials
- [ ] Interactive checklists
- [ ] VS Code snippets
- [ ] CLI tool für setup
- [ ] More templates (service, store, etc.)

---

## 🏆 Fazit

**Vollständige und professionelle Struktur** für React Native-Entwicklung mit Claude Code:

✅ **25 Dateien** Dokumentation
✅ **~8.000+ Zeilen** detaillierter Inhalt
✅ **15 Regeln** wesentlich
✅ **4 Templates** gebrauchsfertig
✅ **4 Checklists** zur Validierung
✅ **100+ Beispiele** Code
✅ **Vollständige Abdeckung**: Architektur → Sicherheit → Performance
✅ **Einsatzbereit** für React Native/Expo-Projekte

---

**Version**: 1.0.0
**Erstellt am**: 2025-12-03
**Autor**: TheBeardedCTO

**Remember**: Diese Regeln sind Leitfäden zur Erstellung von Qualitätscode. Passen Sie sie an Ihren spezifischen Kontext an.
