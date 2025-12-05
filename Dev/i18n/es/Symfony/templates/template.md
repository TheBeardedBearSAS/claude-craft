# ADR-NNNN : [Título Corto de la Decisión]

**Estado** : Proposed | Accepted | Deprecated | Superseded by [ADR-YYYY](YYYY-titulo.md)

**Fecha** : YYYY-MM-DD

**Decisores** : [Lista de personas que tomaron la decisión]

**Tags** : `tag1`, `tag2`, `tag3`

---

## Contexto y Problema

[Describa el contexto y el problema que requiere una decisión arquitectónica. Use 2-3 párrafos para explicar:]
- ¿Cuál es la situación actual?
- ¿Qué problema encontramos?
- ¿Cuáles son las restricciones (técnicas, de negocio, regulatorias)?
- ¿Por qué ahora? (urgencia, oportunidad)

## Opciones Consideradas

**Importante**: Se deben documentar mínimo 2 opciones para demostrar que se hizo un análisis comparativo.

### Opción 1 : [Nombre de la opción]

**Descripción** : [Breve descripción de la opción]

**Ventajas** :
- ✅ [Ventaja 1]
- ✅ [Ventaja 2]
- ✅ [Ventaja 3]

**Inconvenientes** :
- ❌ [Inconveniente 1]
- ❌ [Inconveniente 2]
- ❌ [Inconveniente 3]

**Esfuerzo** : [Estimación: Bajo / Medio / Alto]

---

### Opción 2 : [Nombre de la opción]

**Descripción** : [Breve descripción de la opción]

**Ventajas** :
- ✅ [Ventaja 1]
- ✅ [Ventaja 2]

**Inconvenientes** :
- ❌ [Inconveniente 1]
- ❌ [Inconveniente 2]

**Esfuerzo** : [Estimación: Bajo / Medio / Alto]

---

## Decisión

**Opción elegida** : [Nombre de la opción elegida]

**Justificación** :

[Explique POR QUÉ se eligió esta opción. Use 2-4 párrafos cubriendo:]
- ¿Por qué esta opción es superior a las demás?
- ¿Qué criterios fueron determinantes? (rendimiento, mantenibilidad, costo, conformidad)
- ¿Qué supuestos sustentan esta decisión?
- ¿Cómo se alinea esta decisión con la visión/estrategia global?

**Criterios de decisión** :
1. [Criterio 1 y su importancia]
2. [Criterio 2 y su importancia]
3. [Criterio 3 y su importancia]

---

## Consecuencias

### Positivas ✅

- **[Consecuencia positiva 1]** : [Explicación]
- **[Consecuencia positiva 2]** : [Explicación]
- **[Consecuencia positiva 3]** : [Explicación]

### Negativas ⚠️

**Sea honesto**: Toda decisión tiene compromisos. Documéntelos claramente.

- **[Consecuencia negativa 1]** : [Explicación + mitigación si es posible]
- **[Consecuencia negativa 2]** : [Explicación + mitigación si es posible]
- **[Consecuencia negativa 3]** : [Explicación + mitigación si es posible]

### Riesgos Identificados 🔴

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|-------------|------------|
| [Descripción riesgo 1] | Alto/Medio/Bajo | Alta/Media/Baja | [Acciones de mitigación] |
| [Descripción riesgo 2] | Alto/Medio/Bajo | Alta/Media/Baja | [Acciones de mitigación] |

---

## Implementación

### Archivos Afectados

**A crear** :
- `ruta/al/archivo1.php` - [Descripción]
- `ruta/al/archivo2.yaml` - [Descripción]

**A modificar** :
- `ruta/al/archivo3.php` - [Qué cambia]
- `ruta/al/archivo4.yaml` - [Qué cambia]

**A eliminar** :
- `ruta/al/archivo-antiguo.php` - [Razón]

### Dependencias

**Composer** :
```bash
composer require vendor/package:^version
```

**NPM** :
```bash
npm install package@version
```

**Configuración** :
- Variable de entorno: `VARIABLE_NAME` (.env)
- Servicio Symfony a configurar
- Migración Doctrine a crear

### Ejemplo de Código

```php
<?php
// Ejemplo concreto del proyecto (NO genérico)
namespace App\Infrastructure\...;

class EjemploImplementacion
{
    public function metodoEjemplo(): void
    {
        // Código concreto mostrando el uso
    }
}
```

**Uso** :
```php
// En una entidad, servicio, etc.
$ejemplo = new EjemploImplementacion();
$ejemplo->metodoEjemplo();
```

---

## Validación y Tests

### Criterios de Aceptación

- [ ] [Criterio 1 verificable]
- [ ] [Criterio 2 verificable]
- [ ] [Criterio 3 verificable]

### Tests Requeridos

**Tests unitarios** :
- `tests/Unit/...Test.php` - [Qué se prueba]

**Tests de integración** :
- `tests/Integration/...Test.php` - [Qué se prueba]

**Tests funcionales** :
- `tests/Functional/...Test.php` - [Qué se prueba]

### Métricas de Éxito

| Métrica | Antes | Objetivo | Cómo medir |
|---------|-------|----------|------------|
| [Métrica 1] | [Valor] | [Valor] | [Herramienta/Comando] |
| [Métrica 2] | [Valor] | [Valor] | [Herramienta/Comando] |

---

## Referencias

### Reglas Internas
- [Regla `.claude/rules/XX-nombre.md`](./../rules/XX-nombre.md) - [Descripción]
- [Plantilla `.claude/templates/nombre.md`](./../templates/nombre.md) - [Descripción]

### Documentación Externa
- [Título de la documentación](https://url.com) - [Descripción]
- [Artículo/Blog pertinente](https://url.com) - [Descripción]

### ADRs Relacionadas
- [ADR-XXXX : Título](XXXX-titulo.md) - [Relación: depende de / reemplaza / complementa]

### Código Fuente
- Implementación: `src/ruta/al/archivo.php:linea`
- Tests: `tests/ruta/al/test.php:linea`
- Configuración: `config/packages/package.yaml`

---

## Historial de Modificaciones

| Fecha | Autor | Modificación |
|-------|-------|--------------|
| YYYY-MM-DD | [Nombre] | Creación inicial |
| YYYY-MM-DD | [Nombre] | [Descripción modificación] |

---

## Notas Complementarias

[Sección opcional para información adicional que no encaja en las secciones anteriores:]
- Discusiones importantes que llevaron a la decisión
- Contexto histórico adicional
- Referencias a POCs o experimentos
- Feedback post-implementación (agregar después de puesta en producción)
