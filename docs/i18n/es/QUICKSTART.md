# Inicio Rápido - Claude Craft en 5 Minutos

¡Comienza a usar Claude Craft en solo 5 minutos!

---

## Verificación de Prerrequisitos

Antes de comenzar, verifica que tienes estas herramientas instaladas:

```bash
# Verificar Node.js (18+ requerido)
node --version

# Verificar npm
npm --version

# Verificar yq (requerido para config YAML)
yq --version

# Verificar Docker (recomendado)
docker --version
```

**¿Te falta algo?** Consulta la [Guía de Prerrequisitos](PREREQUISITES.md) para instrucciones de instalación.

---

## Instalación

### Método 1: NPX (Recomendado)

La forma más rápida de comenzar:

```bash
# Asistente interactivo
npx @the-bearded-bear/claude-craft

# O instalar directamente en un proyecto
npx @the-bearded-bear/claude-craft install ~/mi-proyecto --tech=symfony --lang=es
```

### Método 2: Clone + Makefile

```bash
# 1. Clonar el repositorio
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# 2. Instalar en tu proyecto (elige tu tecnología)
make install-symfony TARGET=~/mi-proyecto RULES_LANG=es
```

---

## Tu Primer Proyecto en 3 Comandos

```bash
# 1. Crear un nuevo directorio de proyecto
mkdir ~/mi-primera-app && cd ~/mi-primera-app && git init

# 2. Instalar reglas de Claude Craft (ejemplo: Symfony + Español)
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=es

# 3. Iniciar Claude Code
claude
```

¡Eso es todo! Ahora tienes acceso a todas las funcionalidades de Claude Craft.

---

## Verificar la Instalación

```bash
# Listar archivos instalados
ls -la ~/mi-primera-app/.claude/

# Deberías ver:
# CLAUDE.md          - Configuración principal
# INDEX.md           - Referencia rápida
# references/        - Documentación completa
# agents/            - Especialistas IA
# commands/          - Comandos slash
# skills/            - Mejores prácticas
```

---

## Prueba Tus Primeros Comandos

En Claude Code, prueba estos comandos:

```
# Verificar la arquitectura de tu proyecto
/symfony:check-architecture

# Obtener una revisión de código
@symfony-reviewer Revisa mi carpeta src/

# Generar una nueva entidad con CRUD
/symfony:generate-crud Producto
```

---

## ¿Qué Sigue?

| Tarea | Guía |
|-------|------|
| Entender la estructura del proyecto | [Guía de Arquitectura](ARCHITECTURE.md) |
| Crear una funcionalidad completa | [Desarrollo de Features](../guides/es/03-feature-development.md) |
| Configurar gestión de proyecto BMAD | [Guía Práctica BMAD](BMAD-PRACTICAL-GUIDE.md) |
| Ejecutar Claude en bucle continuo | [Guía Ralph Wiggum](RALPH-GUIDE.md) |

---

## Tecnologías Disponibles

| Tecnología | Comando de Instalación | Enfoque |
|------------|------------------------|---------|
| Symfony/PHP | `make install-symfony` | Clean Architecture, DDD |
| Flutter/Dart | `make install-flutter` | BLoC, Riverpod |
| React | `make install-react` | Hooks, State Management |
| React Native | `make install-reactnative` | Mobile, Navigation |
| Python | `make install-python` | FastAPI, async/await |
| Angular | `make install-angular` | Signals, Standalone |
| C#/.NET | `make install-csharp` | Clean Architecture, CQRS |
| Laravel | `make install-laravel` | Clean Architecture, Pest |
| Vue.js | `make install-vuejs` | Composition API, Pinia |
| PHP | `make install-php` | Clean Architecture, PSR-12 |

---

## ¿Necesitas Ayuda?

- **FAQ**: Preguntas frecuentes → [FAQ.md](FAQ.md)
- **Solución de Problemas**: Errores comunes → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **GitHub Issues**: [Reportar un bug](https://github.com/TheBeardedBearSAS/claude-craft/issues)
