# Principios SOLID - Atoll Tourisme

## Descripción General

Los principios SOLID son **obligatorios** para todo el código PHP del proyecto Atoll Tourisme. Estos principios garantizan un código mantenible, testable y evolutivo.

> **Referencias:**
> - `01-symfony-best-practices.md` - Estructura y patrones Symfony
> - `02-architecture-clean-ddd.md` - Arquitectura global
> - `03-coding-standards.md` - Estándares de código
> - `13-ddd-patterns.md` - Patrones DDD complementarios

---

## Tabla de contenidos

1. [SRP - Single Responsibility Principle](#srp---single-responsibility-principle)
2. [OCP - Open/Closed Principle](#ocp---openclosed-principle)
3. [LSP - Liskov Substitution Principle](#lsp---liskov-substitution-principle)
4. [ISP - Interface Segregation Principle](#isp---interface-segregation-principle)
5. [DIP - Dependency Inversion Principle](#dip---dependency-inversion-principle)
6. [Checklist de validación](#checklist-de-validación)

---

## SRP - Single Responsibility Principle

### Definición

**Una clase debe tener una sola razón para cambiar.**

Cada clase, método o módulo debe tener una única responsabilidad bien definida.

### Aplicación en Atoll Tourisme

**Regla de oro:** Las dependencias siempre apuntan hacia el interior (hacia el dominio).

### Ventajas SRP

- ✅ **Testabilidad:** Cada clase puede testearse aisladamente
- ✅ **Mantenibilidad:** Los cambios están localizados
- ✅ **Reutilización:** Los componentes son independientes
- ✅ **Legibilidad:** Cada clase tiene un objetivo claro

---

## OCP - Open/Closed Principle

### Definición

**Las entidades de software deben estar abiertas a la extensión pero cerradas a la modificación.**

Se debe poder agregar nuevas funcionalidades sin modificar el código existente.

### Ventajas OCP

- ✅ **Extensión fácil:** Nuevas funcionalidades = nuevas clases
- ✅ **Estabilidad:** El código existente no se modifica
- ✅ **Tests:** Sin regresión en el código existente
- ✅ **Evolutividad:** Agregar funcionalidades sin riesgo

---

## LSP - Liskov Substitution Principle

### Definición

**Los objetos de una clase derivada deben poder reemplazar los objetos de la clase base sin alterar la coherencia del programa.**

Los subtipos deben ser sustituibles por sus tipos base.

### Ventajas LSP

- ✅ **Polimorfismo seguro:** Las sustituciones siempre funcionan
- ✅ **Contratos claros:** Interfaces bien documentadas
- ✅ **Previsibilidad:** Sin sorpresas con los subtipos
- ✅ **Testabilidad:** Los mocks respetan los contratos

---

## ISP - Interface Segregation Principle

### Definición

**Los clientes no deben depender de interfaces que no utilizan.**

Es mejor tener varias interfaces específicas que una interfaz general.

### Ventajas ISP

- ✅ **Acoplamiento débil:** Los clientes dependen del mínimo necesario
- ✅ **Flexibilidad:** Implementaciones parciales posibles
- ✅ **Testabilidad:** Mocks más simples (menos métodos)
- ✅ **Evolutividad:** Agregar interfaces sin impactar el existente

---

## DIP - Dependency Inversion Principle

### Definición

**Los módulos de alto nivel no deben depender de los módulos de bajo nivel. Ambos deben depender de abstracciones.**

**Las abstracciones no deben depender de los detalles. Los detalles deben depender de las abstracciones.**

### Arquitectura en capas (DIP)

```
┌─────────────────────────────────────────────────────┐
│           CAPA PRESENTACIÓN (UI)                    │
│   Controllers, Commands, API, Forms                 │
│                       │                              │
│                       ▼                              │
├─────────────────────────────────────────────────────┤
│         CAPA APPLICATION (Use Cases)                │
│   ConfirmarReservationUseCase                       │
│   AnnulerReservationUseCase                         │
│                       │                              │
│           Depende de  ▼   (Interfaces)              │
├─────────────────────────────────────────────────────┤
│            CAPA DOMINIO (Business)                  │
│   ReservationRepositoryInterface                    │
│   NotificationServiceInterface                      │
│   Entities, Value Objects, Domain Services          │
│                       ▲                              │
│           Implementado por (Inversión)              │
├─────────────────────────────────────────────────────┤
│       CAPA INFRASTRUCTURE (Técnica)                 │
│   DoctrineReservationRepository                     │
│   EmailNotificationService                          │
│   Doctrine, Mailer, Redis, etc.                     │
└─────────────────────────────────────────────────────┘

✅ Las capas altas dependen de abstracciones
✅ Las capas bajas implementan estas abstracciones
✅ La lógica de negocio está aislada de los detalles técnicos
```

### Ventajas DIP

- ✅ **Testabilidad:** Mocks y stubs fáciles de crear
- ✅ **Flexibilidad:** Cambio de implementación sin impacto
- ✅ **Aislamiento:** La lógica de negocio no depende de la infraestructura
- ✅ **Reutilización:** Las abstracciones son reutilizables

---

## Checklist de validación

### Antes de cada commit

- [ ] **SRP:** Cada clase tiene una única responsabilidad claramente definida
- [ ] **SRP:** Los métodos hacen una sola cosa (< 20 líneas)
- [ ] **SRP:** No hay métodos con "y" o "o" en el nombre
- [ ] **OCP:** Nuevas funcionalidades agregadas por extensión, no modificación
- [ ] **OCP:** Uso de interfaces y patrones Strategy/Chain of Responsibility
- [ ] **OCP:** No hay switch/if sobre tipos para determinar el comportamiento
- [ ] **LSP:** Los subtipos respetan los contratos de sus padres
- [ ] **LSP:** Sin precondiciones reforzadas en las subclases
- [ ] **LSP:** Sin postcondiciones debilitadas en las subclases
- [ ] **LSP:** Sin excepciones nuevas no documentadas
- [ ] **ISP:** Las interfaces son pequeñas y focalizadas (< 5 métodos)
- [ ] **ISP:** Los clientes solo dependen de los métodos que utilizan
- [ ] **ISP:** No hay métodos "throw new BadMethodCallException()"
- [ ] **DIP:** Los use cases dependen de interfaces, no de implementaciones
- [ ] **DIP:** Las interfaces están en el dominio, no en la infraestructura
- [ ] **DIP:** Inyección de dependencias vía constructor (readonly)

### Validación PHPStan

```bash
# Verificación SOLID vía PHPStan
make phpstan

# Debe pasar sin error:
# - No unused parameters (SRP)
# - No mixed types (DIP)
# - No violations of interface contracts (LSP)
```

### Code review

- [ ] Las abstracciones están en `src/Domain/`
- [ ] Las implementaciones están en `src/Infrastructure/`
- [ ] Los use cases están en `src/Application/`
- [ ] Cada interfaz tiene al menos 2 implementaciones (real + test)
- [ ] Los Value Objects son inmutables y garantizan sus invariantes
- [ ] Los servicios de dominio no tienen dependencias técnicas
- [ ] Las entidades no tienen lógica de persistencia

---

## Recursos

- **Libro:** *Clean Architecture* - Robert C. Martin
- **Libro:** *SOLID Principles* - Uncle Bob
- **Artículo:** [SOLID in Symfony](https://symfony.com/doc/current/best_practices.html)
- **Video:** [SOLID Principles Explained](https://www.youtube.com/watch?v=pTB30aXS77U)

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
