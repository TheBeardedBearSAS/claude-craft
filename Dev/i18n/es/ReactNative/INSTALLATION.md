# Installation & Setup Guide

Guía de instalación y configuración de las reglas de React Native para Claude Code.

---

## 🚀 Quick Start (5 minutos)

### Opción 1: Nuevo Proyecto React Native

```bash
# 1. Crear proyecto Expo
npx create-expo-app my-app --template blank-typescript
cd my-app

# 2. Crear carpeta .claude
mkdir -p .claude

# 3. Copiar plantilla CLAUDE.md
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. (Opcional) Copiar todas las reglas
cp -r /path/to/ReactNative/rules/ .claude/rules/
cp -r /path/to/ReactNative/templates/ .claude/templates/
cp -r /path/to/ReactNative/checklists/ .claude/checklists/

# 5. Personalizar .claude/CLAUDE.md
# Reemplazar {{PROJECT_NAME}}, {{TECH_STACK}}, etc.
```

### Opción 2: Proyecto Existente

```bash
# 1. Ir al proyecto
cd my-existing-app

# 2. Crear carpeta .claude (si no existe)
mkdir -p .claude

# 3. Copiar plantilla
cp /path/to/ReactNative/CLAUDE.md.template .claude/CLAUDE.md

# 4. Adaptar progresivamente
# Comenzar por CLAUDE.md, luego agregar reglas según sea necesario
```

---

## 📋 Personalización CLAUDE.md

Abrir `.claude/CLAUDE.md` y reemplazar los placeholders:

### Placeholders Obligatorios

```markdown
{{PROJECT_NAME}}           → Nombre del proyecto (ej: "MyAwesomeApp")
{{TECH_STACK}}             → Stack técnico (ej: "React Native, Expo, TypeScript")
{{PROJECT_DESCRIPTION}}    → Descripción del proyecto
{{GOAL_1}}                 → Objetivo 1
{{GOAL_2}}                 → Objetivo 2
{{GOAL_3}}                 → Objetivo 3
```

### Placeholders Técnicos

```markdown
{{REACT_NATIVE_VERSION}}   → Versión React Native (ej: "0.73")
{{EXPO_SDK_VERSION}}       → Versión Expo SDK (ej: "50")
{{TYPESCRIPT_VERSION}}     → Versión TypeScript (ej: "5.3")
{{NODE_VERSION}}           → Versión Node (ej: "18")
```

### Placeholders API

```markdown
{{DEV_API_URL}}            → URL API dev
{{PROD_API_URL}}           → URL API producción
{{AUTH_METHOD}}            → Método de autenticación (ej: "JWT")
```

### Placeholders Equipo

```markdown
{{TECH_LEAD}}              → Nombre del tech lead
{{PRODUCT_OWNER}}          → Nombre del PO
{{BACKEND_LEAD}}           → Nombre del backend lead
{{SLACK_CHANNEL}}          → Canal de Slack
{{JIRA_PROJECT}}           → Proyecto JIRA
```

---

## 🎯 Configuración por Tipo de Proyecto

### Proyecto Simple (MVP)

**Mínimo recomendado**:
```
.claude/
└── CLAUDE.md              # Plantilla personalizada
```

**Reglas esenciales a copiar**:
- `01-workflow-analysis.md` - Análisis obligatorio
- `02-architecture.md` - Arquitectura
- `03-coding-standards.md` - Estándares

### Proyecto Medio

**Recomendado**:
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

### Proyecto Complejo / Enterprise

**Configuración completa**:
```
.claude/
├── CLAUDE.md
├── rules/                 # Las 15 reglas
├── templates/             # Todas las plantillas
└── checklists/            # Todas las checklists
```

---

## 🔧 Configuración del Entorno

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
# Generar tsconfig.json si no existe
npx tsc --init

# O copiar configuración recomendada desde rules/03-coding-standards.md
```

### 3. Configure ESLint

```bash
# Crear .eslintrc.js
# Copiar configuración desde rules/08-quality-tools.md
```

### 4. Configure Prettier

```bash
# Crear .prettierrc.js
# Copiar configuración desde rules/08-quality-tools.md
```

### 5. Configure Husky (Pre-commit)

```bash
# Install Husky
npm install --save-dev husky lint-staged
npx husky init

# Configure pre-commit hook
# Ver rules/08-quality-tools.md
```

---

## 📱 Configuración app.json

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

## 🧪 Verificación de la Instalación

### Checklist

```bash
# 1. Estructura
[ ] .claude/CLAUDE.md existe y está personalizado
[ ] .claude/rules/ existe (si se copió)
[ ] .claude/templates/ existe (si se copió)
[ ] .claude/checklists/ existe (si se copió)

# 2. Configuración
[ ] tsconfig.json configurado (strict mode)
[ ] .eslintrc.js configurado
[ ] .prettierrc.js configurado
[ ] package.json scripts (lint, format, test)

# 3. Dependencias
[ ] React Native + Expo instalados
[ ] TypeScript instalado
[ ] ESLint + Prettier instalados
[ ] Librerías de testing instaladas

# 4. Git
[ ] .gitignore completo
[ ] Husky configurado (opcional)
[ ] Ramas main/develop creadas

# 5. Tests
[ ] npm run lint funciona
[ ] npm run type-check funciona
[ ] npm test funciona
[ ] npx expo start funciona
```

### Comandos de Prueba

```bash
# Type checking
npm run type-check
# → Debería pasar sin errores

# Linting
npm run lint
# → Debería pasar sin errores

# Formatting check
npm run format:check
# → Debería pasar

# Tests
npm test
# → Debería pasar (si los tests están configurados)

# Run app
npx expo start
# → Debería iniciarse sin errores
```

---

## 🎓 Formación del Equipo

### Onboarding Nuevo Desarrollador

1. **Leer README.md** (5 min)
2. **Leer CLAUDE.md** del proyecto (10 min)
3. **Leer reglas esenciales**:
   - 01-workflow-analysis.md (15 min)
   - 02-architecture.md (20 min)
   - 03-coding-standards.md (15 min)
4. **Explorar plantillas** (10 min)
5. **Probar workflow** con una pequeña tarea (30 min)

**Total**: ~1h30

### Formación Continua

- **Semanal**: Revisión de una regla en equipo (15 min)
- **Sprint**: Retrospectiva sobre la aplicación de las reglas
- **Mensual**: Actualización de las reglas si es necesario

---

## 🔄 Actualización

### Verificar Nuevas Versiones

```bash
# Ir a la carpeta fuente de ReactNative
cd /path/to/ReactNative

# Pull latest (si es git repo)
git pull origin main

# Comparar versiones
diff .claude/CLAUDE.md CLAUDE.md.template
```

### Aplicar Actualizaciones

```bash
# Backup actual
cp .claude/CLAUDE.md .claude/CLAUDE.md.backup

# Actualizar reglas
cp /path/to/ReactNative/rules/XX-rule.md .claude/rules/

# Fusionar cambios
# Comparar backup y nuevo archivo
```

---

## 💡 Tips

### Para Claude Code

Claude Code detecta automáticamente `.claude/CLAUDE.md` en el proyecto.

**¡No se necesita configuración adicional!**

### Para el Equipo

- **Commit `.claude/`** en git para compartir con el equipo
- **Revisar reglas** juntos regularmente
- **Adaptar** las reglas al contexto del proyecto
- **Documentar** las decisiones específicas en CLAUDE.md

### Troubleshooting

**Claude no ve CLAUDE.md**:
- Verificar que el archivo esté en `.claude/CLAUDE.md`
- Verificar permisos de lectura
- Reiniciar Claude Code

**Errores de ESLint muy estrictos**:
- Adaptar `.eslintrc.js` al proyecto
- Documentar excepciones en CLAUDE.md

**Tests fallan**:
- Verificar configuración de Jest
- Verificar mocks necesarios
- Ver `rules/07-testing.md`

---

## 📞 Soporte

### Documentación
- README.md - Visión general
- SUMMARY.md - Resumen completo
- rules/ - Reglas detalladas

### Issues
Si hay problemas con las reglas:
1. Verificar SUMMARY.md
2. Leer regla correspondiente
3. Adaptar al contexto

---

## ✅ ¡Instalación Completa!

Después de seguir esta guía, deberías tener:

✅ Estructura `.claude/` configurada
✅ CLAUDE.md personalizado
✅ Reglas copiadas (si opción completa)
✅ Entorno configurado (TypeScript, ESLint, etc.)
✅ Dependencias instaladas
✅ Tests de verificación pasados
✅ Equipo formado

**¡Listo para desarrollar con calidad!** 🚀

---

**Versión**: 1.0.0
**Guía creada el**: 2025-12-03
