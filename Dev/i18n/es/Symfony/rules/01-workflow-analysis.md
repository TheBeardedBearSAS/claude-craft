# Workflow de Análisis Obligatorio

## Principio Fundamental

**ANTES de cualquier modificación de código (feature, bugfix, refactoring), una fase de análisis profundo es OBLIGATORIA.**

Esta regla es CRÍTICA y NO NEGOCIABLE. Evita:
- Las regresiones
- Los efectos secundarios inesperados
- La deuda técnica
- Los bugs en producción

## Proceso en 4 Etapas

### Etapa 1: Comprender la Solicitud

**Preguntas a hacerse:**
1. ¿Cuál es el objetivo preciso?
2. ¿Cuáles son los criterios de aceptación?
3. ¿Hay restricciones (rendimiento, seguridad, RGPD)?
4. ¿Cuál es el impacto para el usuario?

**Acciones:**
- Reformular la solicitud para validación
- Identificar los casos de uso concernidos
- Verificar alineación con objetivos business (ver `.claude/rules/00-project-context.md`)

### Etapa 2: Analizar el Código Existente

**Archivos a leer OBLIGATORIAMENTE:**
1. Los archivos directamente concernidos por la modificación
2. Los archivos dependientes (que utilizan el código modificado)
3. Los tests existentes (para comprender el comportamiento esperado)
4. Las migraciones Doctrine (si impacto en esquema DB)

**Herramientas:**
```bash
# Buscar usos de una clase/método
make console CMD="debug:container NombreClase"

# Analizar dependencias
make phpstan
make deptrac

# Ver tests existentes
make test-coverage
```

**Puntos de vigilancia:**
- ¿Hay tests que van a fallar?
- ¿Hay otras clases que dependen de este código?
- ¿El código respeta la arquitectura Clean Architecture + DDD?
- ¿Hay datos sensibles (RGPD)?

### Etapa 3: Documentar el Análisis

**Utilizar el template**: `.claude/templates/analysis.md`

**Contenido obligatorio:**
1. **Objetivo**: Descripción clara de la modificación
2. **Archivos impactados**: Lista exhaustiva con justificación
3. **Impactos**:
   - Breaking changes: sí/no
   - Migración DB necesaria: sí/no
   - Impacto rendimiento: sí/no
   - Datos sensibles: sí/no
4. **Riesgos**: Lista + mitigaciones
5. **Enfoque**: Estrategia implementación (TDD, refactoring progresivo, etc.)
6. **Tests TDD**: Lista de tests a escribir ANTES de la implementación

**Ejemplo:**
```markdown
## Análisis: Cifrado alergias y tratamientos médicos (RGPD)

### Objetivo
Cifrar los campos `allergies` y `medicalTreatments` de la entidad Participant
para conformidad RGPD.

### Archivos impactados
- `src/Entity/Participant.php` (agregar anotaciones cifrado)
- `config/packages/doctrine.yaml` (config Gedmo)
- `src/Repository/ParticipantRepository.php` (queries con campos cifrados)
- Migración Doctrine (sin cambio esquema, cifrado transparente)

### Impactos
- Breaking change: NO (cifrado transparente)
- Migración DB: NO (Doctrine gestiona automáticamente)
- Rendimiento: Impacto leve (cifrado/descifrado) < 50ms
- Datos sensibles: SÍ (razón del cifrado)

### Riesgos
1. Pérdida clave cifrado → Mitigación: backup clave en vault seguro
2. Rendimiento queries LIKE sobre campos cifrados → Mitigación: no usar LIKE sobre alergias

### Enfoque
1. Instalar gedmo/doctrine-extensions
2. Configurar doctrine_encryption en services.yaml
3. TDD: escribir tests con datos sensibles
4. Implementar anotaciones sobre entidad
5. Probar cifrado/descifrado
6. Verificar rendimiento (< 50ms)

### Tests TDD
1. test_should_encrypt_allergies_when_saved()
2. test_should_decrypt_allergies_when_loaded()
3. test_should_encrypt_medical_treatments()
4. test_should_find_participant_by_encrypted_field()
```

### Etapa 4: Validación

**Criterios de decisión:**

| Impacto | Acción |
|---------|--------|
| **Bajo** (1 archivo, sin breaking change, < 1h) | Proceder directamente |
| **Medio** (2-5 archivos, migración DB, < 4h) | Validar con usuario |
| **Alto** (> 5 archivos, breaking changes, refactoring arq.) | Planificación detallada + validación obligatoria |

**Preguntas de validación:**
- ¿El enfoque respeta Clean Architecture + DDD?
- ¿Los tests TDD son suficientes?
- ¿Hay una alternativa más simple (KISS)?
- ¿Los riesgos son aceptables?

## Anti-Patterns a Evitar

### ❌ Codificar sin leer el código existente
```php
// MALO: modificación sin comprender impacto
class ReservationController {
    public function create() {
        // Cambio directamente sin leer el código existente
        $reservation->setStatus('confirmed'); // ⚠️ ¿Impacto?
    }
}
```

### ❌ Ignorar las dependencias
```php
// MALO: modificación sin verificar quién utiliza este método
class Sejour {
    public function getPrice(): float {
        // Cambio el comportamiento sin verificar impactos
        return $this->price * 0.8; // ⚠️ ¿Quién llama a getPrice()?
    }
}
```

### ❌ Olvidar los tests
```php
// MALO: sin verificación tests existentes
// Si modifico Participant, ¿qué tests van a fallar?
```

### ❌ Ignorar RGPD
```php
// MALO: agregar campo sensible sin cifrado
class Participant {
    private string $socialSecurityNumber; // ⚠️ ¡RGPD!
}
```

## Checklist Rápida

Antes de cualquier modificación:

- [ ] He leído y comprendido la solicitud
- [ ] He leído los archivos concernidos
- [ ] He identificado las dependencias
- [ ] He documentado el análisis
- [ ] He evaluado los riesgos
- [ ] He definido los tests TDD
- [ ] He validado el enfoque (si impacto medio/alto)
- [ ] He verificado conformidad Clean Architecture + SOLID
- [ ] He verificado seguridad + RGPD si datos sensibles

## Templates Asociados

- `.claude/templates/analysis.md` - Template análisis detallado
- `.claude/checklists/new-feature.md` - Checklist nueva feature
- `.claude/checklists/refactoring.md` - Checklist refactoring
