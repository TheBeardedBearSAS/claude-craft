# Checklists de Claude Code - Atoll Tourisme

> Checklists para asegurar la calidad del código y la seguridad

## Descripción General

Esta carpeta contiene 4 checklists esenciales para el flujo de trabajo de desarrollo.

**Total:** 4 checklists | ~3700 líneas de procedimientos detallados

---

## 📋 Lista de Checklists

### 1. `pre-commit.md` - Antes de cada commit
**Tiempo estimado:** 2-5 minutos

**Uso:** ANTES de cada `git commit`

**Verificaciones automáticas:**
- ✅ Tests aprobados (unitarios + integración + Behat)
- ✅ PHPStan nivel 8 (0 errores)
- ✅ CS-Fixer (código formateado PER-CS 3.0)
- ✅ Hadolint (Dockerfile válido)
- ✅ Cobertura ≥ 80%
- ✅ Mensaje de commit conforme (Conventional Commits)

**Comando rápido:**
```bash
make pre-commit && git commit
```

**Secciones:**
1. Tests automatizados
2. Análisis estático (PHPStan)
3. Estándares de codificación (PHP CS Fixer)
4. Docker (Hadolint)
5. Cobertura de tests
6. Mensaje de commit (Conventional Commits)
7. Documentación (si aplica)
8. Seguridad y RGPD (si datos personales)

**Cuándo usar:**
- ✅ Antes de CADA commit
- ✅ Validación continua
- ✅ Evitar regresiones

**Ejemplos de mensajes de commit:**
```bash
✅ feat(reservation): add single supplement for 1 participant
✅ fix(value-object): fix rounding in Money::multiply
✅ refactor(reservation): extract PrixCalculatorService
✅ test(reservation): add total price calculation tests

❌ "update code"  (demasiado vago)
❌ "fix bug"      (¿qué bug?)
❌ "WIP"          (no commitear WIP)
```

---

### 2. `new-feature.md` - Nueva funcionalidad
**Tiempo estimado:** 2h30 (pequeña) a 10h (grande)

**Uso:** Flujo completo para implementar una nueva funcionalidad

**Fases TDD:**
```
1. ANÁLISIS (30 min)    → Template: .claude/templates/analysis.md
2. TDD RED (1h)         → Templates: test-*.md
3. TDD GREEN (2h)       → Templates: service.md, value-object.md, etc.
4. TDD REFACTOR (1h)    → Principios SOLID
5. VALIDACIÓN (30 min)  → Checklist pre-commit
6. PULL REQUEST         → Template PR
```

**Secciones:**
1. **Fase 1:** Análisis pre-implementación
2. **Fase 2:** TDD RED (tests que fallan)
3. **Fase 3:** TDD GREEN (implementación mínima)
4. **Fase 4:** TDD REFACTOR (mejora SOLID)
5. **Fase 5:** Validación final (calidad + tests)
6. **Fase 6:** Pull Request

**Cuándo usar:**
- ✅ Nueva funcionalidad de negocio
- ✅ Nuevo endpoint API
- ✅ Nuevo caso de uso

**Ejemplo completo:** Funcionalidad "Opciones de pago"
- Análisis: 30 min
- TDD RED: 1h (12 tests escritos)
- TDD GREEN: 2h (implementación + migración BD)
- TDD REFACTOR: 1h (Value Objects + servicios)
- Validación: 30 min (PHPStan + cobertura)
- **Total:** 5h

**Tiempo por tamaño:**
| Tamaño | Archivos | Tiempo total |
|--------|----------|--------------|
| Pequeño | 1 archivo | 2h30 |
| Mediano | 3-5 archivos | 5h |
| Grande | 10+ archivos | 10h |

---

### 3. `refactoring.md` - Refactorización segura
**Tiempo estimado:** 30 min a 4h

**Uso:** Mejorar código sin romper comportamiento

**Principio:** Red de seguridad = Tests en verde

**Fases:**
1. **Preparación:** Estado estable (tests en verde)
2. **Análisis:** Identificar code smells
3. **Refactorización:** Baby steps
4. **Patrones:** Aplicar patrones de refactorización
5. **Validación:** Tests siempre en verde + rendimiento OK
6. **Commit:** Documentación de refactorización

**Code smells detectados:**
- ❌ Método demasiado largo (> 20 líneas)
- ❌ Duplicación (violación DRY)
- ❌ Complejidad ciclomática alta (> 5)
- ❌ Primitive Obsession
- ❌ God Class (> 300 líneas)

**Patrones de refactorización:**
1. Extract Method
2. Extract Class
3. Replace Conditional with Polymorphism
4. Introduce Parameter Object
5. Replace Magic Number with Constant

**Cuándo usar:**
- ✅ Código complejo para simplificar
- ✅ Duplicación detectada
- ✅ Violación SOLID
- ✅ Reducir deuda técnica

**Regla de oro:** Un cambio a la vez + tests en verde

**Flujo de trabajo:**
```bash
# 1. Estado estable
git commit -m "chore: stable state before refactoring"

# 2. Pequeño cambio
vim src/Service/ReservationService.php
# Renombrar variable

# 3. Tests
make test  # ✅ Green

# 4. Commit
git commit -m "refactor: rename data variable"

# 5. Repetir (baby steps)
```

---

### 4. `security-rgpd.md` - Seguridad y RGPD
**Tiempo estimado:** 1-2h (auditoría completa)

**Uso:** Antes de cada release + cada 3 meses

**Secciones:**

#### Seguridad (11 puntos)
1. Protección de datos personales (cifrado BD)
2. Validación de inputs de usuario
3. Protección CSRF
4. Protección XSS
5. Protección contra inyección SQL
6. Security Headers (CSP, HSTS, etc.)
7. Autenticación y Autorización
8. Tests de seguridad

#### RGPD (4 puntos)
8. Consentimiento y Derechos
9. Derecho al olvido (anonimización)
10. Portabilidad de datos (exportación JSON)
11. Periodo de retención (limpieza automática)
12. Auditoría y Trazabilidad (logs)

**Checklist final:**

**Seguridad:**
- [ ] Datos sensibles cifrados (`doctrine-encrypt-bundle`)
- [ ] Validación estricta de inputs (Symfony Forms + Constraints)
- [ ] CSRF habilitado
- [ ] Protección XSS (autoescape Twig)
- [ ] Inyección SQL imposible (Doctrine ORM)
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] HTTPS forzado
- [ ] Contraseñas hasheadas (Bcrypt/Argon2)
- [ ] Rate limiting en login
- [ ] Sin secretos commiteados

**RGPD:**
- [ ] Política de privacidad publicada
- [ ] Consentimiento explícito (checkbox)
- [ ] Trazabilidad de consentimiento (fecha, IP)
- [ ] Derecho al olvido implementado (comando CLI)
- [ ] Portabilidad de datos (exportación JSON)
- [ ] Periodo de retención definido (máx 3 años)
- [ ] Limpieza automática (cron)
- [ ] Logs de acciones sensibles
- [ ] Cifrado de datos personales
- [ ] Procedimiento de breach documentado

**Cuándo usar:**
- ✅ Antes de release mayor
- ✅ Auditoría trimestral (cada 3 meses)
- ✅ Después de incidente de seguridad
- ✅ Nueva recolección de datos

**Comandos de auditoría:**
```bash
# Vulnerabilidades de Composer
composer audit

# Symfony security checker
symfony security:check

# Check cifrado BD
docker compose exec db mysql -u root -p atoll
SELECT nom FROM participant LIMIT 1;
# Esperado: "enc:def502000..." (cifrado)

# Test security headers
curl -I https://atoll-tourisme.com
# Esperado: CSP, HSTS, X-Frame-Options, etc.
```

---

## 🎯 Flujo de Trabajo Recomendado

### Desarrollo Diario

```bash
# 1. Nueva funcionalidad
# Usar: new-feature.md

# 2. Antes de cada commit
# Usar: pre-commit.md
make pre-commit && git commit

# 3. Refactorización si necesario
# Usar: refactoring.md

# 4. Auditoría Seguridad/RGPD (trimestral)
# Usar: security-rgpd.md
```

### Flujo Completo de Funcionalidad

```bash
# Paso 1: Análisis (new-feature.md fase 1)
vim docs/analysis/2025-01-15-feature.md

# Paso 2: TDD RED (new-feature.md fase 2)
vim tests/Unit/Service/MyServiceTest.php
make test  # ❌ Failed (esperado)

# Paso 3: TDD GREEN (new-feature.md fase 3)
vim src/Service/MyService.php
make test  # ✅ Passed

# Paso 4: TDD REFACTOR (new-feature.md fase 4 + refactoring.md)
# Mejorar código (SOLID, DRY)
make test  # ✅ Aún pasado

# Paso 5: Pre-commit (pre-commit.md)
make pre-commit  # ✅ Todo OK
git commit -m "feat(service): add MyService"

# Paso 6: PR
git push origin feature/my-feature
# Crear PR
```

---

## 📚 Referencias Cruzadas

### Templates Asociados
`.claude/templates/`:
- `analysis.md` → Usado en `new-feature.md` fase 1
- `test-*.md` → Usado en `new-feature.md` fases 2-3
- `service.md`, `value-object.md`, etc. → Usado en `new-feature.md` fase 3

### Reglas Asociadas
`.claude/rules/`:
- `01-architecture-ddd.md` → Arquitectura DDD
- `03-coding-standards.md` → Estándares de código
- `04-testing-tdd.md` → Estrategia TDD
- `07-security-rgpd.md` → Seguridad y RGPD

---

## 💡 Consejos de Uso

### 1. Pre-commit: Automatización

Crear un Git hook:
```bash
# .git/hooks/pre-commit
#!/bin/bash
make pre-commit || exit 1
```

O usar Husky (npm):
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "make pre-commit"
    }
  }
}
```

### 2. New-feature: Cumplimiento TDD

**NO** codificar antes de los tests:
```bash
# ❌ MALO
vim src/Service/MyService.php  # Código primero
vim tests/Unit/Service/MyServiceTest.php  # Tests después

# ✅ BUENO
vim tests/Unit/Service/MyServiceTest.php  # Tests primero (RED)
make test  # ❌ Failed
vim src/Service/MyService.php  # Código después (GREEN)
make test  # ✅ Passed
```

### 3. Refactoring: Baby Steps

**NO** refactorizar todo a la vez:
```bash
# ❌ MALO (Big Bang)
# 3 días de refactorización
git commit -m "refactor: improve everything"  # 50 archivos

# ✅ BUENO (Baby Steps)
git commit -m "refactor: rename variable"  # 1 archivo
git commit -m "refactor: extract method"   # 1 archivo
git commit -m "refactor: move class"       # 2 archivos
```

### 4. Security-RGPD: Automatización

Crear un cron para limpieza RGPD:
```bash
# crontab -e
# Limpieza RGPD cada día a las 2am
0 2 * * * cd /path/to/project && docker compose exec php bin/console app:gdpr:cleanup
```

---

## 📊 Estadísticas

| Checklist | Líneas | Tiempo estimado | Frecuencia |
|-----------|--------|-----------------|-----------|
| pre-commit.md | 527 | 2-5 min | Cada commit |
| new-feature.md | 765 | 2h30-10h | Cada funcionalidad |
| refactoring.md | 975 | 30min-4h | Según necesidad |
| security-rgpd.md | 920 | 1-2h | Trimestral |

**Total:** ~3700 líneas de procedimientos detallados

---

## ⚠️ Puntos de Atención

### NUNCA
- ❌ Commitear sin validar `pre-commit.md`
- ❌ Funcionalidad sin análisis (`new-feature.md` fase 1)
- ❌ Refactorización sin tests en verde
- ❌ Release sin auditoría seguridad/RGPD

### SIEMPRE
- ✅ Ejecutar tests antes de commit
- ✅ PHPStan nivel 8 sin errores
- ✅ Cobertura ≥ 80%
- ✅ Mensaje de commit conforme (Conventional Commits)

---

## 🚀 Atajos de Makefile

Agregar a `Makefile`:

```makefile
.PHONY: pre-commit
pre-commit: ## Checklist pre-commit
	@echo "🔍 Validación pre-commit..."
	@$(MAKE) phpstan
	@$(MAKE) cs-fix
	@$(MAKE) test
	@$(MAKE) test-coverage
	@echo "✅ ¡Listo para commitear!"

.PHONY: security-audit
security-audit: ## Auditoría Seguridad/RGPD
	@echo "🔒 Auditoría de seguridad..."
	composer audit
	symfony security:check
	@echo "📋 Ver checklist: .claude/checklists/security-rgpd.md"
```

Uso:
```bash
make pre-commit       # Antes de cada commit
make security-audit   # Auditoría de seguridad trimestral
```

---

**Última actualización:** 2025-11-26
**Responsable:** Lead Dev
**Frecuencia de revisión:** Mensual
