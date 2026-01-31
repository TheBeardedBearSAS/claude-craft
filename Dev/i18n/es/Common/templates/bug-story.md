# {BUG_ID}: [BUG] {TITULO}

## Metadata

- **ID**: {BUG_ID}
- **Tipo**: bug
- **Fuente**: Recette {SESSION_ID}
- **Error fuente**: {ERROR_ID}
- **Severidad**: {critical|high|medium|low}
- **Sprint**: {SPRINT}
- **Estado**: backlog
- **Fecha**: {DATE}

## Descripcion del Bug

**Comportamiento actual**: {descripcion refinada del comportamiento observado}

**Comportamiento esperado**: {descripcion del comportamiento correcto esperado}

## Pasos de Reproduccion

1. {paso 1}
2. {paso 2}
3. {paso 3}

## Causa Raiz

{analisis de la causa raiz identificada durante el refinamiento}

## Criterios de Aceptacion

### AC-1: El bug ya no se reproduce

```gherkin
GIVEN {contexto}
WHEN {accion que desencadenaba el bug}
THEN {comportamiento correcto}
```

### AC-2: Test de regresion pasa

```gherkin
GIVEN la correccion esta en su lugar
WHEN la suite de regresion se ejecuta
THEN todos los tests pasan
```

## Archivos Afectados

- {archivo 1}
- {archivo 2}

## Capturas de Pantalla

<!-- Capturas de pantalla de la sesion recette si disponibles -->
<!-- Ruta: .recette/sessions/{SESSION_ID}/screenshots/ -->

## Definition of Done

- [ ] Test RED escrito (reproduce el bug)
- [ ] Correccion GREEN aplicada
- [ ] Refactoring realizado
- [ ] Tests de regresion generados
- [ ] Registro de regresion actualizado
- [ ] Todos los tests pasan
