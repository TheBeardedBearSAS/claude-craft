# Guía de Solución de Problemas

Problemas comunes y sus soluciones al usar Claude-Craft.

---

## Problemas de Instalación

### Comandos No Reconocidos
**Soluciones:**
1. Reiniciar Claude Code (`exit` + `claude`)
2. Verificar instalación: `ls -la .claude/commands/`
3. Verificar formato de archivos de comandos

### Archivos No Encontrados
**Soluciones:**
1. Verificar ruta de Claude-Craft: `pwd && ls Dev/scripts/`
2. Verificar archivos de idioma: `ls Dev/i18n/es/`
3. Usar ruta TARGET absoluta

### Errores de Permisos
```bash
chmod +x Dev/scripts/*.sh
chmod +x Tools/*/*.sh
```

---

## Problemas de Agentes

### Agente No Disponible
1. Verificar archivos: `ls .claude/agents/`
2. Verificar formato frontmatter
3. Reinstalar: `make install-common TARGET=. OPTIONS="--force"`

### Respuestas Irrelevantes
1. Proporcionar más contexto en la solicitud
2. Ser específico en la petición
3. Verificar `00-project-context.md`

---

## Problemas de Comandos

### Comando No Encontrado
1. Verificar directorio: `ls .claude/commands/symfony/`
2. Verificar namespace correcto
3. Listar comandos: `/help`

### Errores de Ejecución
1. Verificar prerrequisitos
2. Revisar archivo de comando
3. Proporcionar parámetros requeridos

---

## Problemas de Configuración

### YAML Inválido
```bash
yq e '.' claude-projects.yaml  # Validar sintaxis
make config-validate CONFIG=claude-projects.yaml
```

### Proyecto No Encontrado
1. Verificar ortografía del nombre (sensible a mayúsculas)
2. Verificar ruta del archivo de configuración

---

## Problemas de Herramientas

### StatusLine No Se Muestra
```bash
ls -la ~/.claude/statusline.sh  # Verificar instalación
echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh  # Test
```

### Problemas de Perfil MultiAccount
```bash
./claude-accounts.sh list
ls -la ~/.claude-profiles/
```

### Errores yq
```bash
# Instalar yq v4.x (mikefarah/yq)
brew install yq  # macOS
sudo snap install yq  # Linux
yq --version  # Verificar versión
```

---

## Problemas de Rendimiento

### Ejecución Lenta
1. Ajustar TTL de caché en `statusline.conf`
2. Limpiar cachés: `rm /tmp/.ccusage_*`
3. Verificar conexión de red

### Alto Uso de Contexto
1. Usar `/compact` para compactar el contexto proactivamente
2. Usar `/clear` entre tareas no relacionadas
3. Usar `/effort low` para tareas simples (reduce consumo de tokens)
4. Usar `/context` para obtener sugerencias de optimización
5. Configurar RTK para ahorro de tokens del 60-90% (`/common:setup-rtk`)
6. Delegar investigaciones a sub-agentes

---

## Obtener Ayuda

### Documentación
- `docs/AGENTS.md` - Referencia de agentes
- `docs/COMMANDS.md` - Referencia de comandos
- `docs/TECHNOLOGIES.md` - Guía de tecnologías

### Versiones
```bash
./Dev/scripts/install-symfony-rules.sh --version
./Tools/MultiAccount/claude-accounts.sh --version
```

---

## Checklist de Correcciones Rápidas

- [ ] Reiniciar Claude Code
- [ ] Verificar instalación (`ls .claude/`)
- [ ] Verificar permisos de archivos
- [ ] Validar configuración
- [ ] Limpiar cachés
- [ ] Verificar dependencias (jq, yq)
- [ ] Intentar reinstalación con `--force`

---

[&larr; Referencia de Herramientas](05-tools-reference.md) | [Gestión del Backlog &rarr;](07-backlog-management.md)
