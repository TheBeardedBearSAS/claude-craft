# Añadir una nueva locale a Claude Craft

Esta guía le explica cómo añadir un nuevo idioma al sistema i18n de Claude Craft. Claude Craft actualmente soporta 5 idiomas (`en`, `fr`, `es`, `de`, `pt`) y está diseñado para facilitar la incorporación de nuevos idiomas.

---

## Requisitos previos

- Node.js 20+ con acceso al repositorio de Claude Craft
- Familiaridad con la estructura del proyecto (ver `docs/guides/es/01-getting-started.md`)
- Un enfoque de traducción: traductores humanos, un agente (`@research-assistant`), o una combinación

---

## Paso 1 — Registrar el código de locale

Edite `cli/lib/constants.js` y añada su código de idioma al objeto `LANGUAGES`:

```js
const LANGUAGES = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  // Añada su nueva locale aquí, p.ej.:
  // it: 'Italiano',
  // ja: '日本語',
};
```

Actualice también `scripts/verify-i18n-parity.sh` — encuentre el array `LANGS` y añada su código:

```bash
LANGS=("en" "fr" "es" "de" "pt" "it")   # ejemplo: añadiendo italiano
```

---

## Paso 2 — Crear la estructura de directorios

El contenido i18n de Claude Craft vive en tres árboles. Cree los directorios correspondientes para su nueva locale:

```bash
# Reglas y referencias Dev
mkdir -p Dev/i18n/<lang>/

# Guías de infraestructura
mkdir -p Infra/i18n/<lang>/

# Plantillas de gestión de proyecto
mkdir -p Project/i18n/<lang>/

# Guías de documentación de usuario
mkdir -p docs/guides/<lang>/
```

Cada árbol debe reflejar exactamente la referencia en inglés (`en`) — mismos nombres de archivo, mismas rutas relativas.

---

## Paso 3 — Traducir los archivos

La locale de referencia (`en`) contiene aproximadamente **325 archivos** en todos los árboles. Puede delegar la traducción a un agente de Claude para acelerar el proceso:

```
@research-assistant Traduce todos los archivos de docs/guides/en/ al italiano (it).
Mantén la estructura idéntica. Genera cada archivo en docs/guides/it/ con el mismo nombre de archivo.
Preserva todos los bloques de código, ejemplos de comandos y enlaces relativos tal como están.
```

**Reglas de traducción:**

| Regla | Detalle |
|-------|---------|
| Bloques de código | Nunca traducir — mantener tal cual |
| Comandos CLI | Nunca traducir |
| Rutas de archivo | Nunca traducir |
| Encabezados de sección | Traducir, mantener el formato Markdown |
| Enlaces | Actualizar el texto mostrado, mantener rutas relativas idénticas |
| Términos técnicos | Usar la convención establecida en la comunidad del idioma destino |

Comience con `docs/guides/<lang>/` (mayor valor para el usuario), luego `Dev/i18n/<lang>/`, y después `Infra/` y `Project/`.

---

## Paso 4 — Verificar la paridad

Ejecute el script de verificación de paridad para confirmar que su locale está completa y cumple el umbral de tamaño:

```bash
# Verificar paridad de recuento de archivos (bloqueante — debe ser 100%)
bash scripts/verify-i18n-parity.sh

# Verificar paridad de tamaño en modo estricto (ratio >= 0.80 por archivo)
STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh

# Ejecutar en modo permisivo durante una PR en progreso
I18N_PARITY_STRICT=0 bash scripts/verify-i18n-parity.sh
```

El script genera un informe de brechas en `audit/phases/i18n-gap.csv` que lista los archivos por debajo del umbral de ratio 0.80. Úselo para priorizar el trabajo de traducción restante.

**Salida esperada cuando está completo:**

```
✓ en: 325 archivos
✓ it: 325 archivos
✓ Todos los idiomas en paridad
```

---

## Paso 5 — Actualizar la CI y la documentación

### Workflow de GitHub Actions

Edite `.github/workflows/i18n-parity.yml`. En el filtro `paths` del disparador `pull_request`, el workflow ya cubre `Dev/i18n/**`, `docs/guides/**`, `Infra/i18n/**` y `Project/i18n/**` — no se necesitan cambios adicionales para locales estándar.

Si añadió un filtro específico de locale en otro lugar del workflow, añada su nuevo código a cualquier lista de permitidos o matriz.

### README

Actualice la tabla de guías multilingüe en `README.md` (sección "User Guides (Multilingual)") para incluir los enlaces a su nueva locale para cada guía.

### Detección automática de locale CLI

Si la nueva locale corresponde a un prefijo de locale del sistema operativo común (p.ej. `it` para `it_IT.UTF-8`), añada el mapeo en `cli/lib/installer.js` dentro de la función `detectLocale()`:

```js
if (raw.startsWith('it')) return 'it';
```

Añada un caso de prueba correspondiente en `tests/cli/detect-locale.test.mjs`.

---

## Checklist

- [ ] Código añadido a `LANGUAGES` en `cli/lib/constants.js`
- [ ] Código añadido al array `LANGS` en `scripts/verify-i18n-parity.sh`
- [ ] Directorios creados: `Dev/i18n/<lang>/`, `Infra/i18n/<lang>/`, `Project/i18n/<lang>/`, `docs/guides/<lang>/`
- [ ] Todos los archivos traducidos (325 archivos)
- [ ] `bash scripts/verify-i18n-parity.sh` sale con 0
- [ ] `STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh` sale con 0 (o las brechas están documentadas)
- [ ] `audit/phases/i18n-gap.csv` revisado y brechas tratadas
- [ ] Tabla multilingüe del README actualizada
- [ ] `detectLocale()` actualizado + prueba añadida (si la detección automática de locale del SO es relevante)
- [ ] PR abierta con la etiqueta `i18n/<lang>`

---

> Ver también: `.claude/rules/16-i18n.md` | `scripts/verify-i18n-parity.sh` | `.github/workflows/i18n-parity.yml`
