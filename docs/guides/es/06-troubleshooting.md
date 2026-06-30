# Guía de Solución de Problemas

Esta guía cubre los problemas más comunes y sus soluciones al usar Claude-Craft.

---

## Tabla de Contenidos

1. [Problemas de Instalación](#problemas-de-instalación)
2. [Problemas de Agentes](#problemas-de-agentes)
3. [Problemas de Comandos](#problemas-de-comandos)
4. [Problemas de Configuración](#problemas-de-configuración)
5. [Problemas de Herramientas](#problemas-de-herramientas)
6. [Problemas de Rendimiento](#problemas-de-rendimiento)
7. [Obtener Ayuda](#obtener-ayuda)

---

## Problemas de Instalación

### Comandos No Reconocidos Tras la Instalación

**Síntomas:**
- Los comandos de barra diagonal como `/symfony:check-compliance` no funcionan
- Claude no reconoce los comandos instalados

**Soluciones:**

1. **Reiniciar Claude Code**
   ```bash
   # Salir de Claude Code completamente
   exit

   # Iniciar de nuevo
   claude
   ```

2. **Verificar la instalación**
   ```bash
   ls -la .claude/commands/
   # Debería mostrar los directorios de comandos
   ```

3. **Comprobar el formato del archivo de comandos**
   ```bash
   head -5 .claude/commands/symfony/check-compliance.md
   # Debería comenzar con la cabecera markdown adecuada
   ```

### Archivos No Encontrados Durante la Instalación

**Síntomas:**
- Errores de "Archivo fuente no encontrado"
- Faltan reglas o plantillas

**Soluciones:**

1. **Verificar la ruta de Claude-Craft**
   ```bash
   # Comprobar que se ejecuta desde el directorio claude-craft
   pwd
   ls -la Dev/scripts/
   ```

2. **Comprobar que existen los archivos de idioma**
   ```bash
   ls -la Dev/i18n/en/Symfony/rules/
   ```

3. **Usar ruta TARGET absoluta**
   ```bash
   # En lugar de
   make install-symfony TARGET=./backend

   # Usar
   make install-symfony TARGET=/ruta/completa/al/backend
   ```

### Errores de Permiso Denegado

**Síntomas:**
- No se pueden ejecutar los scripts de instalación
- No se puede escribir en el directorio de destino

**Soluciones:**

1. **Hacer los scripts ejecutables**
   ```bash
   chmod +x Dev/scripts/*.sh
   chmod +x Project/*.sh
   chmod +x Infra/*.sh
   chmod +x Tools/*/*.sh
   ```

2. **Comprobar los permisos del directorio de destino**
   ```bash
   ls -la ~/my-project/
   # Asegurarse de tener permisos de escritura
   ```

3. **Ejecutar con el usuario adecuado**
   ```bash
   # No usar sudo a menos que sea necesario
   # Comprobar la propiedad del directorio
   ls -la ~/my-project
   ```

### La Instalación Crea un Directorio Vacío

**Síntomas:**
- El directorio `.claude/` se crea pero está vacío o faltan archivos

**Soluciones:**

1. **Comprobar errores en la salida**
   ```bash
   # Ejecutar con salida detallada
   make install-symfony TARGET=./backend 2>&1 | tee install.log
   ```

2. **Verificar que existe la fuente**
   ```bash
   ls -la Dev/i18n/en/Symfony/
   ```

3. **Intentar la ejecución directa del script**
   ```bash
   ./Dev/scripts/install-symfony-rules.sh --lang=en ./backend
   ```

---

## Problemas de Agentes

### Agente No Disponible

**Síntomas:**
- `@api-designer` u otros agentes no responden
- Errores del tipo "agente desconocido"

**Soluciones:**

1. **Verificar que existen los archivos de agente**
   ```bash
   ls -la .claude/agents/
   # Debería listar los archivos .md de agentes
   ```

2. **Comprobar el formato del archivo de agente**
   ```bash
   head -20 .claude/agents/api-designer.md
   # Debería tener el frontmatter adecuado con nombre y descripción
   ```

3. **Reinstalar los agentes**
   ```bash
   make install-common TARGET=. OPTIONS="--force"
   ```

### El Agente Da Respuestas Irrelevantes

**Síntomas:**
- El agente no sigue sus instrucciones especializadas
- Respuestas genéricas en lugar de consejos de experto

**Soluciones:**

1. **Proporcionar más contexto**
   ```markdown
   @symfony-reviewer Revisa mi implementación de UserService

   Contexto:
   - Symfony 7 con API Platform
   - Clean Architecture
   - Enfoque DDD

   Código a revisar:
   [pegar código aquí]
   ```

2. **Ser específico en la petición**
   ```markdown
   # En lugar de
   @database-architect Ayuda con mi base de datos

   # Usar
   @database-architect Diseña el esquema para el agregado User con:
   - Entidad User (id, email, password_hash)
   - Entidad Role (muchos-a-muchos con User)
   - Entidad Permission (muchos-a-muchos con Role)
   - Historial de auditoría para cambios de usuario
   ```

3. **Comprobar el archivo de contexto del proyecto**
   ```bash
   cat .claude/references/<your-tech>/project-context.md
   # Asegurarse de que describe el proyecto con precisión
   ```

### El Agente Entra en Conflicto con las Reglas del Proyecto

**Síntomas:**
- Las sugerencias del agente contradicen las convenciones del proyecto
- Consejos inconsistentes

**Soluciones:**

1. **Actualizar el contexto del proyecto**
   - Añadir convenciones específicas a `00-project-context.md`
   - Incluir preferencias y restricciones del equipo

2. **Ser explícito en las peticiones**
   ```markdown
   @api-designer Diseña el endpoint siguiendo nuestras convenciones RESTful
   (ver 00-project-context.md para nuestros estándares de API)
   ```

---

## Problemas de Comandos

### Comando No Encontrado

**Síntomas:**
- `/symfony:generate-crud` devuelve "comando desconocido"
- Las sugerencias de comandos no aparecen

**Soluciones:**

1. **Comprobar el directorio de comandos**
   ```bash
   ls .claude/commands/symfony/
   # Debería incluir generate-crud.md
   ```

2. **Verificar el espacio de nombres**
   ```bash
   # Los comandos tienen el formato: /{espacio-de-nombres}:{comando}
   # Espacios de nombres disponibles:
   ls .claude/commands/
   # common/, symfony/, flutter/, python/, react/, reactnative/, docker/
   ```

3. **Listar los comandos disponibles**
   ```bash
   # En Claude Code, escribe:
   /help
   ```

### Errores de Ejecución de Comandos

**Síntomas:**
- El comando empieza pero falla
- Salida o errores inesperados

**Soluciones:**

1. **Comprobar los requisitos previos**
   - Algunos comandos requieren herramientas específicas
   - Verificar que las dependencias requeridas están instaladas

2. **Revisar el archivo de comandos**
   ```bash
   cat .claude/commands/symfony/generate-crud.md
   # Entender qué espera el comando
   ```

3. **Proporcionar los parámetros requeridos**
   ```bash
   # En lugar de
   /symfony:generate-crud

   # Usar
   /symfony:generate-crud User --with-api --with-tests
   ```

### Salida de Comandos Incorrecta

**Síntomas:**
- El código generado no coincide con el estilo del proyecto
- Se usan patrones de tecnología incorrectos

**Soluciones:**

1. **Actualizar el contexto del proyecto**
   ```bash
   # Editar .claude/references/<your-tech>/project-context.md
   # Añadir patrones y convenciones específicos
   ```

2. **Personalizar las plantillas**
   ```bash
   # Editar las plantillas en .claude/templates/
   # Ajustar para que coincida con el estilo de tu proyecto
   ```

---

## Problemas de Configuración

### Configuración YAML Inválida

**Síntomas:**
- `make config-validate` falla
- Errores de sintaxis en la configuración

**Soluciones:**

1. **Comprobar la sintaxis YAML**
   ```bash
   # Validar YAML
   yq e '.' claude-projects.yaml
   ```

2. **Errores YAML comunes:**
   ```yaml
   # Incorrecto: indentación inconsistente
   projects:
     - name: "project"
       path: "/path"  # 2 espacios
        technologies: ["symfony"]  # 3 espacios - ¡ERROR!

   # Correcto: indentación consistente
   projects:
     - name: "project"
       path: "/path"
       technologies: ["symfony"]
   ```

3. **Validar con la herramienta**
   ```bash
   make config-validate CONFIG=claude-projects.yaml
   ```

### Proyecto No Encontrado en la Configuración

**Síntomas:**
- "Proyecto no encontrado" al instalar
- El proyecto no aparece en la lista

**Soluciones:**

1. **Comprobar la ortografía del nombre del proyecto**
   ```bash
   # Listar proyectos
   make config-list CONFIG=claude-projects.yaml

   # Los nombres distinguen mayúsculas de minúsculas
   ```

2. **Verificar la ruta del archivo de configuración**
   ```bash
   # Por defecto busca claude-projects.yaml en el directorio actual
   # Especificar explícitamente:
   make config-install CONFIG=/ruta/a/config.yaml PROJECT=myproject
   ```

### La Configuración No Se Aplica

**Síntomas:**
- Los cambios en la configuración no surten efecto
- La configuración antigua persiste

**Soluciones:**

1. **Reinstalar con fuerza**
   ```bash
   make config-install CONFIG=claude-projects.yaml PROJECT=myproject OPTIONS="--force"
   ```

2. **Comprobar conflictos**
   ```bash
   # Eliminar la instalación existente
   rm -rf /ruta/al/proyecto/.claude

   # Reinstalar
   make config-install CONFIG=claude-projects.yaml PROJECT=myproject
   ```

---

## Problemas de Herramientas

### StatusLine No Se Muestra

**Síntomas:**
- La barra de estado está vacía o muestra la configuración predeterminada
- La línea de estado personalizada no se muestra

**Soluciones:**

1. **Verificar que el script está instalado**
   ```bash
   ls -la ~/.claude/statusline.sh
   # Debe existir y ser ejecutable
   ```

2. **Comprobar settings.json**
   ```bash
   cat ~/.claude/settings.json | jq '.statusLine'
   # Debería mostrar:
   # {
   #   "type": "command",
   #   "command": "~/.claude/statusline.sh"
   # }
   ```

3. **Probar el script manualmente**
   ```bash
   echo '{"model":{"display_name":"Test","id":"claude-opus"}}' | ~/.claude/statusline.sh
   # Debería producir una línea de estado formateada
   ```

4. **Comprobar que jq está instalado**
   ```bash
   which jq
   # Instalar si no está: brew install jq / apt install jq
   ```

### Problemas de Perfil MultiAccount

**Síntomas:**
- No se puede cambiar de perfil
- El perfil no se reconoce

**Soluciones:**

1. **Listar los perfiles**
   ```bash
   ./claude-accounts.sh list
   ```

2. **Comprobar el directorio de perfiles**
   ```bash
   ls -la ~/.claude-profiles/
   # Debería contener los directorios de perfiles
   ```

3. **Verificar el archivo de modo del perfil**
   ```bash
   cat ~/.claude-profiles/miperfil/.mode
   # Debería contener "shared" o "isolated"
   ```

4. **Recrear el perfil problemático**
   ```bash
   ./claude-accounts.sh remove miperfil
   ./claude-accounts.sh add miperfil --mode=shared
   ```

### Errores de yq en ProjectConfig

**Síntomas:**
- "yq: command not found"
- Errores de análisis de YAML

**Soluciones:**

1. **Instalar yq**
   ```bash
   # macOS
   brew install yq

   # Linux
   sudo snap install yq
   # o
   sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
   sudo chmod +x /usr/local/bin/yq
   ```

2. **Verificar la versión de yq**
   ```bash
   yq --version
   # Debe ser v4.x (mikefarah/yq, no kislyuk/yq)
   ```

---

## Problemas de Hooks

### El Hook No Se Dispara

**Síntomas:**
- Los hooks PreToolUse/PostToolUse no se ejecutan
- No hay salida de los comandos del hook

**Soluciones:**

1. **Verificar la configuración del hook en settings.json**
   ```bash
   cat .claude/settings.json | jq '.hooks'
   ```

2. **Comprobar la sintaxis del matcher**
   ```json
   {
     "hooks": {
       "PreToolUse": [{
         "matcher": "Bash",
         "hooks": [{"type": "command", "command": "echo test"}]
       }]
     }
   }
   ```
   El `matcher` debe coincidir exactamente con el nombre de la herramienta (p. ej., `Bash`, `Edit`, `Write`).

3. **Probar el comando del hook de forma independiente**
   ```bash
   # Ejecutar el comando del hook manualmente para verificar que funciona
   bash -c 'echo test'
   ```

### Bloqueo del Hook PreCompact

**Síntomas:**
- La compactación del contexto no ocurre cuando se espera
- La compactación parece atascada

**Solución:** Los hooks PreCompact (v2.1.105+) pueden bloquear la compactación con el código de salida 2. Comprueba tus hooks:
```bash
cat .claude/settings.json | jq '.hooks.PreCompact'
# Asegurarse de que los scripts de hook no devuelven accidentalmente el código de salida 2
```

### Errores de Sandbox

**Síntomas:**
- Errores de "Sandbox unavailable"
- Problemas de permisos en subprocesos

**Soluciones:**

1. **Comprobar la versión de Claude Code** (el sandboxing requiere v2.1.98+)
   ```bash
   claude --version
   ```

2. **En Linux, verificar el soporte de espacio de nombres PID**
   ```bash
   # Comprobar si unshare está disponible
   which unshare
   ```

3. **Deshabilitar el sandbox estricto si es necesario** (no recomendado por seguridad)
   - Eliminar `sandbox.failIfUnavailable` de la configuración si se añadió

### Fallos de Hooks Relacionados con Seguridad

Si se usan servidores MCP con hooks, asegurarse de tener Claude Code v2.1.97+ para evitar CVEs conocidas:
- CVE-2025-59536: Inyección de comandos a través de entradas MCP en el pipeline de hooks
- CVE-2026-35020: Bypass de comandos compuestos
- CVE-2026-35022: Inyección de prefijo de variables de entorno

---

## Problemas de Rendimiento

### Ejecución Lenta de Comandos

**Síntomas:**
- Los comandos tardan mucho en responder
- StatusLine se actualiza lentamente

**Soluciones:**

1. **Comprobar la configuración de caché**
   ```bash
   # En ~/.claude/statusline.conf
   SESSION_CACHE_TTL=60   # Reducir si es demasiado lento
   WEEKLY_CACHE_TTL=300   # Reducir si es demasiado lento
   ```

2. **Limpiar las cachés**
   ```bash
   rm /tmp/.ccusage_*
   ```

3. **Comprobar la red**
   - Algunas funcionalidades requieren red (ccusage)
   - Red lenta = actualizaciones lentas

### Alto Uso de la Ventana de Contexto

**Síntomas:**
- El indicador de contexto muestra un porcentaje alto rápidamente
- Advertencias de "límite de contexto"

**Soluciones:**

1. **Usar `/context` para sugerencias de optimización** (v2.1.74+)
   ```bash
   /context
   ```

2. **Ajustar el nivel de esfuerzo** para tareas sencillas (v2.1.72+)
   ```bash
   /effort low    # Búsquedas simples
   /effort medium # Trabajo estándar
   ```

3. **Compactar de forma proactiva** al ~70% de uso
   ```bash
   /compact
   ```

4. **Usar `/clear` entre tareas no relacionadas**

5. **Guardar aprendizajes clave** antes de la compactación
   ```bash
   /memory "Importante: auth usa JWT RS256 con expiración de 15min"
   ```

6. **Configurar RTK** para un ahorro de tokens del 55-65%
   ```bash
   /common:setup-rtk
   ```

7. **Usar agentes para tareas complejas**
   ```markdown
   # En lugar de pegar todo el código base
   @research-assistant Busca todos los archivos relacionados con autenticación en src/
   ```

---

## Obtener Ayuda

### Consultar la Documentación

1. **Documentación principal**: directorio `docs/`
2. **Referencia de agentes**: `docs/AGENTS.md`
3. **Referencia de comandos**: `docs/COMMANDS.md`
4. **Guía de tecnologías**: `docs/TECHNOLOGIES.md`

### Obtener Información de Versión

```bash
# Scripts de instalación
./Dev/scripts/install-symfony-rules.sh --version

# Herramientas
./Tools/MultiAccount/claude-accounts.sh --version
./Tools/ProjectConfig/claude-projects.sh --version
```

### Reportar Incidencias

Si encuentras bugs:

1. Recopilar información:
   - Versión de Claude-Craft
   - Sistema operativo
   - Pasos para reproducir
   - Mensajes de error

2. Comprobar las incidencias existentes en GitHub

3. Crear una nueva incidencia con los detalles

### Pedir Ayuda

```markdown
@research-assistant Tengo problemas con [describe el problema]

Entorno:
- SO: [tu SO]
- Versión de Claude-Craft: [versión]
- Tecnología: [symfony/flutter/etc.]

Lo que intenté:
1. [paso 1]
2. [paso 2]

Mensaje de error:
[pegar el error]
```

---

## Lista de Verificación de Correcciones Rápidas

Cuando algo no funciona:

- [ ] Reiniciar Claude Code
- [ ] Verificar la instalación (`ls .claude/`)
- [ ] Comprobar los permisos de archivos
- [ ] Validar la configuración
- [ ] Limpiar las cachés
- [ ] Comprobar las dependencias (jq, yq)
- [ ] Intentar la reinstalación con `--force`
- [ ] Consultar la documentación
- [ ] Pedir ayuda

---

[&larr; Referencia de Herramientas](05-tools-reference.md) | [Gestión del Backlog &rarr;](07-backlog-management.md)
