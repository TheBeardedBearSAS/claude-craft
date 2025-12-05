# Installation & Setup Guide

Installations- und Konfigurationsanleitung für React Native-Regeln für Claude Code.

---

## 🚀 Quick Start (5 Minuten)

### Option 1: Neues React Native-Projekt

```bash
# 1. Expo-Projekt erstellen
npx create-expo-app my-app --template blank-typescript
cd my-app

# 2. .claude-Ordner erstellen
mkdir -p .claude

# 3. CLAUDE.md-Vorlage kopieren
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. (Optional) Alle Regeln kopieren
cp -r /path/to/ReactNative/rules/ .claude/rules/
cp -r /path/to/ReactNative/templates/ .claude/templates/
cp -r /path/to/ReactNative/checklists/ .claude/checklists/

# 5. .claude/CLAUDE.md anpassen
# {{PROJECT_NAME}}, {{TECH_STACK}}, etc. ersetzen
```

### Option 2: Bestehendes Projekt

```bash
# 1. Zum Projekt gehen
cd my-existing-app

# 2. .claude-Ordner erstellen (falls nicht vorhanden)
mkdir -p .claude

# 3. Vorlage kopieren
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. Schrittweise anpassen
# Mit CLAUDE.md beginnen, dann Regeln nach Bedarf hinzufügen
```

---

## 📋 CLAUDE.md Anpassung

`.claude/CLAUDE.md` öffnen und die Platzhalter ersetzen:

### Erforderliche Platzhalter

```markdown
{{PROJECT_NAME}}           → Projektname (z.B. "MyAwesomeApp")
{{TECH_STACK}}             → Tech-Stack (z.B. "React Native, Expo, TypeScript")
{{PROJECT_DESCRIPTION}}    → Projektbeschreibung
{{GOAL_1}}                 → Ziel 1
{{GOAL_2}}                 → Ziel 2
{{GOAL_3}}                 → Ziel 3
```

### Technische Platzhalter

```markdown
{{REACT_NATIVE_VERSION}}   → React Native-Version (z.B. "0.73")
{{EXPO_SDK_VERSION}}       → Expo SDK-Version (z.B. "50")
{{TYPESCRIPT_VERSION}}     → TypeScript-Version (z.B. "5.3")
{{NODE_VERSION}}           → Node-Version (z.B. "18")
```

### API-Platzhalter

```markdown
{{DEV_API_URL}}            → API-URL dev
{{PROD_API_URL}}           → API-URL Produktion
{{AUTH_METHOD}}            → Authentifizierungsmethode (z.B. "JWT")
```

### Team-Platzhalter

```markdown
{{TECH_LEAD}}              → Name des Tech Lead
{{PRODUCT_OWNER}}          → Name des PO
{{BACKEND_LEAD}}           → Name des Backend Lead
{{SLACK_CHANNEL}}          → Slack-Kanal
{{JIRA_PROJECT}}           → JIRA-Projekt
```

---

## 🎯 Konfiguration nach Projekttyp

### Einfaches Projekt (MVP)

**Empfohlenes Minimum**:
```
.claude/
└── CLAUDE.md              # Angepasste Vorlage
```

**Wesentliche Regeln zum Kopieren**:
- `01-workflow-analysis.md` - Obligatorische Analyse
- `02-architecture.md` - Architektur
- `03-coding-standards.md` - Standards

### Mittleres Projekt

**Empfohlen**:
```
.claude/
├── CLAUDE.md
├── rules/
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 07-testing.md
│   └── 11-security.md
└── checklists/
    └── pre-commit.md
```

### Komplexes / Enterprise-Projekt

**Vollständige Konfiguration**:
```
.claude/
├── CLAUDE.md
├── rules/                 # Alle 15 Regeln
├── templates/             # Alle Vorlagen
└── checklists/            # Alle Checklists
```

---

## 🔧 Umgebungskonfiguration

### 1. Install Dependencies

```bash
# Core
npm install react-native expo

# Navigation
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# State Management
npm install @tanstack/react-query zustand react-native-mmkv

# Forms & Validation
npm install react-hook-form zod

# Dev Dependencies
npm install --save-dev @types/react @types/react-native
npm install --save-dev typescript
npm install --save-dev eslint prettier
npm install --save-dev jest @testing-library/react-native
npm install --save-dev husky lint-staged
```

### 2. Configure TypeScript

```bash
# tsconfig.json generieren, falls nicht vorhanden
npx tsc --init

# Oder empfohlene Konfiguration aus rules/03-coding-standards.md kopieren
```

### 3. Configure ESLint

```bash
# .eslintrc.js erstellen
# Konfiguration aus rules/08-quality-tools.md kopieren
```

### 4. Configure Prettier

```bash
# .prettierrc.js erstellen
# Konfiguration aus rules/08-quality-tools.md kopieren
```

### 5. Configure Husky (Pre-commit)

```bash
# Install Husky
npm install --save-dev husky lint-staged
npx husky init

# Configure pre-commit hook
# Siehe rules/08-quality-tools.md
```

---

## 📱 app.json Konfiguration

```json
{
  "expo": {
    "name": "{{PROJECT_NAME}}",
    "slug": "{{PROJECT_SLUG}}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "myapp",
    "jsEngine": "hermes",
    "plugins": ["expo-router"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.company.myapp"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.company.myapp"
    }
  }
}
```

---

## 🧪 Installationsüberprüfung

### Checklist

```bash
# 1. Struktur
[ ] .claude/CLAUDE.md existiert und ist angepasst
[ ] .claude/rules/ existiert (falls kopiert)
[ ] .claude/templates/ existiert (falls kopiert)
[ ] .claude/checklists/ existiert (falls kopiert)

# 2. Konfiguration
[ ] tsconfig.json konfiguriert (strict mode)
[ ] .eslintrc.js konfiguriert
[ ] .prettierrc.js konfiguriert
[ ] package.json scripts (lint, format, test)

# 3. Abhängigkeiten
[ ] React Native + Expo installiert
[ ] TypeScript installiert
[ ] ESLint + Prettier installiert
[ ] Testing-Bibliotheken installiert

# 4. Git
[ ] .gitignore vollständig
[ ] Husky konfiguriert (optional)
[ ] Branches main/develop erstellt

# 5. Tests
[ ] npm run lint funktioniert
[ ] npm run type-check funktioniert
[ ] npm test funktioniert
[ ] npx expo start funktioniert
```

### Testbefehle

```bash
# Type checking
npm run type-check
# → Sollte ohne Fehler durchlaufen

# Linting
npm run lint
# → Sollte ohne Fehler durchlaufen

# Formatting check
npm run format:check
# → Sollte durchlaufen

# Tests
npm test
# → Sollte durchlaufen (wenn Tests konfiguriert sind)

# Run app
npx expo start
# → Sollte ohne Fehler starten
```

---

## 🎓 Team-Schulung

### Onboarding neuer Entwickler

1. **README.md lesen** (5 Min.)
2. **CLAUDE.md des Projekts lesen** (10 Min.)
3. **Wesentliche Regeln lesen**:
   - 01-workflow-analysis.md (15 Min.)
   - 02-architecture.md (20 Min.)
   - 03-coding-standards.md (15 Min.)
4. **Vorlagen erkunden** (10 Min.)
5. **Workflow testen** mit einer kleinen Aufgabe (30 Min.)

**Gesamt**: ~1h30

### Kontinuierliche Schulung

- **Wöchentlich**: Überprüfung einer Regel im Team (15 Min.)
- **Sprint**: Retrospektive zur Anwendung der Regeln
- **Monatlich**: Aktualisierung der Regeln falls nötig

---

## 🔄 Aktualisierung

### Nach neuen Versionen suchen

```bash
# Zum ReactNative-Quellordner gehen
cd /path/to/ReactNative

# Pull latest (falls git repo)
git pull origin main

# Versionen vergleichen
diff .claude/CLAUDE.md CLAUDE.md.template
```

### Updates anwenden

```bash
# Backup aktuelle Version
cp .claude/CLAUDE.md .claude/CLAUDE.md.backup

# Regeln aktualisieren
cp /path/to/ReactNative/rules/XX-rule.md .claude/rules/

# Änderungen zusammenführen
# Backup und neue Datei vergleichen
```

---

## 💡 Tips

### Für Claude Code

Claude Code erkennt `.claude/CLAUDE.md` im Projekt automatisch.

**Keine zusätzliche Konfiguration erforderlich!**

### Für das Team

- **`.claude/` committen** in git, um mit dem Team zu teilen
- **Regeln regelmäßig gemeinsam überprüfen**
- **Regeln** an den Projektkontext **anpassen**
- **Spezifische Entscheidungen** in CLAUDE.md **dokumentieren**

### Troubleshooting

**Claude sieht CLAUDE.md nicht**:
- Überprüfen, dass die Datei unter `.claude/CLAUDE.md` liegt
- Leserechte überprüfen
- Claude Code neu starten

**ESLint-Fehler zu streng**:
- `.eslintrc.js` an das Projekt anpassen
- Ausnahmen in CLAUDE.md dokumentieren

**Tests schlagen fehl**:
- Jest-Konfiguration überprüfen
- Notwendige Mocks überprüfen
- Siehe `rules/07-testing.md`

---

## 📞 Support

### Dokumentation
- README.md - Übersicht
- SUMMARY.md - Vollständige Zusammenfassung
- rules/ - Detaillierte Regeln

### Issues
Bei Problemen mit den Regeln:
1. SUMMARY.md überprüfen
2. Zugehörige Regel lesen
3. An den Kontext anpassen

---

## ✅ Installation Abgeschlossen!

Nach Befolgen dieser Anleitung sollten Sie haben:

✅ `.claude/`-Struktur konfiguriert
✅ CLAUDE.md angepasst
✅ Regeln kopiert (falls vollständige Option)
✅ Umgebung konfiguriert (TypeScript, ESLint, etc.)
✅ Abhängigkeiten installiert
✅ Überprüfungstests bestanden
✅ Team geschult

**Bereit, mit Qualität zu entwickeln!** 🚀

---

**Version**: 1.0.0
**Anleitung erstellt am**: 2025-12-03
