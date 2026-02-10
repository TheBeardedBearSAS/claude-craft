# Principios SOLID

## Vision general

Los principios SOLID son **obligatorios** para todo el codigo del proyecto. Estos principios garantizan un codigo mantenible, testeable y evolutivo.

> **Nota:** Este documento presenta los principios generales. Consulta las reglas especificas de tu tecnologia para ejemplos concretos.

---

## Tabla de contenidos

1. [SRP - Single Responsibility Principle](#srp---single-responsibility-principle)
2. [OCP - Open/Closed Principle](#ocp---openclosed-principle)
3. [LSP - Liskov Substitution Principle](#lsp---liskov-substitution-principle)
4. [ISP - Interface Segregation Principle](#isp---interface-segregation-principle)
5. [DIP - Dependency Inversion Principle](#dip---dependency-inversion-principle)
6. [Checklist de validacion](#checklist-de-validacion)

---

## SRP - Single Responsibility Principle

### Definicion

**Una clase debe tener una sola razon para cambiar.**

Cada clase, metodo o modulo debe tener una responsabilidad unica y bien definida.

### Signos de violacion

- Clase con "and" u "or" en el nombre
- Metodo que hace varias cosas no relacionadas
- Clase dificil de nombrar claramente
- Tests complejos que requieren muchos mocks

### Aplicacion

```
❌ MALO - Multiples responsabilidades
┌─────────────────────────────────────┐
│ OrderService                        │
├─────────────────────────────────────┤
│ - validateOrder()                   │
│ - calculatePrice()                  │
│ - saveToDatabase()                  │
│ - sendEmail()                       │
│ - generatePDF()                     │
└─────────────────────────────────────┘

✅ BUENO - Responsabilidades separadas
┌─────────────────┐  ┌─────────────────┐
│ OrderValidator  │  │ PricingService  │
├─────────────────┤  ├─────────────────┤
│ - validate()    │  │ - calculate()   │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ OrderRepository │  │ EmailNotifier   │
├─────────────────┤  ├─────────────────┤
│ - save()        │  │ - notify()      │
└─────────────────┘  └─────────────────┘
```

### Ventajas

- ✅ **Testeabilidad:** Cada clase puede probarse de forma aislada
- ✅ **Mantenibilidad:** Los cambios estan localizados
- ✅ **Reutilizabilidad:** Los componentes son independientes
- ✅ **Legibilidad:** Cada clase tiene un objetivo claro

---

## OCP - Open/Closed Principle

### Definicion

**Las entidades de software deben estar abiertas a la extension pero cerradas a la modificacion.**

Se debe poder agregar nuevas funcionalidades sin modificar el codigo existente.

### Signos de violacion

- Switch/case sobre tipos para determinar el comportamiento
- Modificaciones frecuentes de una misma clase
- Agregar funcionalidad = modificacion de codigo existente

### Aplicacion

```
❌ MALO - Modificacion del codigo existente
┌─────────────────────────────────────┐
│ DiscountCalculator                  │
├─────────────────────────────────────┤
│ calculate(type):                    │
│   if type == "family":              │
│     return basePrice * 0.9          │
│   if type == "student":             │
│     return basePrice * 0.8          │
│   // Para agregar "senior" →        │
│   // modificar esta clase           │
└─────────────────────────────────────┘

✅ BUENO - Extension via interfaces
┌─────────────────────────────────────┐
│ <<interface>>                       │
│ DiscountPolicy                      │
├─────────────────────────────────────┤
│ + apply(price): Money               │
│ + isApplicable(order): boolean      │
└─────────────────────────────────────┘
         △
         │
    ┌────┴────┬────────────┐
    │         │            │
┌───┴───┐ ┌───┴───┐ ┌──────┴──────┐
│Family │ │Student│ │SeniorPolicy │
│Policy │ │Policy │ │(nueva)      │
└───────┘ └───────┘ └─────────────┘
```

### Patron Strategy

Utiliza el patron Strategy para permitir la extension:

1. Definir una interfaz para el comportamiento variable
2. Implementar cada variante en una clase separada
3. Inyectar las implementaciones via configuracion

### Ventajas

- ✅ **Extension facil:** Nuevas funcionalidades = nuevas clases
- ✅ **Estabilidad:** El codigo existente no se modifica
- ✅ **Tests:** Sin regresion en el codigo existente
- ✅ **Evolutividad:** Agregar funcionalidades sin riesgo

---

## LSP - Liskov Substitution Principle

### Definicion

**Los objetos de una clase derivada deben poder reemplazar los objetos de la clase base sin alterar la coherencia del programa.**

Los subtipos deben ser sustituibles por sus tipos base.

### Signos de violacion

- Subclase que lanza excepciones no documentadas
- Metodo que verifica el tipo concreto antes de actuar
- Override que cambia el comportamiento esperado
- Precondiciones reforzadas o postcondiciones debilitadas

### Reglas

1. **Precondiciones:** No reforzar (aceptar al menos lo mismo)
2. **Postcondiciones:** No debilitar (garantizar al menos lo mismo)
3. **Invariantes:** Mantener los invariantes del padre
4. **Restriccion historica:** No modificar el estado de manera incompatible

### Aplicacion

```
❌ MALO - Violacion del contrato
┌─────────────────────────────────────┐
│ class Rectangle                     │
├─────────────────────────────────────┤
│ - width, height                     │
│ + setWidth(w)                       │
│ + setHeight(h)                      │
│ + area() = width * height           │
└─────────────────────────────────────┘
         △
         │
┌─────────────────────────────────────┐
│ class Square extends Rectangle     │
├─────────────────────────────────────┤
│ + setWidth(w):                      │
│     this.width = w                  │
│     this.height = w  // ❌ Viola LSP│
└─────────────────────────────────────┘

✅ BUENO - Contratos respetados
┌─────────────────────────────────────┐
│ <<interface>> Shape                 │
├─────────────────────────────────────┤
│ + area(): number                    │
└─────────────────────────────────────┘
         △
    ┌────┴────┐
    │         │
┌───┴───┐ ┌───┴───┐
│Rect.  │ │Square │
│w*h    │ │side²  │
└───────┘ └───────┘
```

### Ventajas

- ✅ **Polimorfismo seguro:** Las sustituciones siempre funcionan
- ✅ **Contratos claros:** Interfaces bien documentadas
- ✅ **Previsibilidad:** Sin sorpresas con los subtipos
- ✅ **Testeabilidad:** Los mocks respetan los contratos

---

## ISP - Interface Segregation Principle

### Definicion

**Los clientes no deben depender de interfaces que no utilizan.**

Es mejor tener varias interfaces especificas que una interfaz general.

### Signos de violacion

- Interfaz con muchos metodos (> 5)
- Clases que implementan metodos vacios
- Metodos que lanzan `NotImplementedException`
- Clientes que solo usan una parte de la interfaz

### Aplicacion

```
❌ MALO - Interfaz demasiado amplia
┌─────────────────────────────────────┐
│ <<interface>>                       │
│ UserRepository                      │
├─────────────────────────────────────┤
│ + find(id)                          │
│ + findAll()                         │
│ + save(user)                        │
│ + delete(user)                      │
│ + findByEmail(email)                │
│ + findByRole(role)                  │
│ + countByMonth(month)               │
│ + exportToCsv()                     │
│ + importFromCsv()                   │
│ + syncWithLDAP()                    │
└─────────────────────────────────────┘

✅ BUENO - Interfaces segregadas
┌─────────────────┐  ┌─────────────────┐
│ UserFinder      │  │ UserPersister   │
├─────────────────┤  ├─────────────────┤
│ + find(id)      │  │ + save(user)    │
│ + findAll()     │  │ + delete(user)  │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ UserSearcher    │  │ UserExporter    │
├─────────────────┤  ├─────────────────┤
│ + byEmail()     │  │ + toCsv()       │
│ + byRole()      │  │ + fromCsv()     │
└─────────────────┘  └─────────────────┘
```

### Ventajas

- ✅ **Acoplamiento debil:** Los clientes dependen del minimo necesario
- ✅ **Flexibilidad:** Implementaciones parciales posibles
- ✅ **Testeabilidad:** Mocks mas simples (menos metodos)
- ✅ **Evolutividad:** Agregar interfaces sin impactar lo existente

---

## DIP - Dependency Inversion Principle

### Definicion

**Los modulos de alto nivel no deben depender de los modulos de bajo nivel. Ambos deben depender de abstracciones.**

**Las abstracciones no deben depender de los detalles. Los detalles deben depender de las abstracciones.**

### Signos de violacion

- Instanciacion directa de dependencias (`new ConcreteClass()`)
- Import de clases de infraestructura en la capa de negocio
- Acoplamiento fuerte con un framework o una biblioteca
- Tests dificiles de escribir sin base de datos real

### Aplicacion

```
❌ MALO - Dependencia de las implementaciones
┌─────────────────────────────────────┐
│ OrderService                        │
├─────────────────────────────────────┤
│ - MySQLOrderRepository              │
│ - SmtpMailer                        │
│ - StripePaymentGateway              │
└─────────────────────────────────────┘
     │
     ▼ Depende de
┌─────────────────────────────────────┐
│ Infraestructura concreta            │
└─────────────────────────────────────┘

✅ BUENO - Dependencia de las abstracciones
┌─────────────────────────────────────┐
│ OrderService (Application Layer)    │
├─────────────────────────────────────┤
│ - OrderRepositoryInterface          │
│ - MailerInterface                   │
│ - PaymentGatewayInterface           │
└─────────────────────────────────────┘
     │
     ▼ Depende de
┌─────────────────────────────────────┐
│ Interfaces (Domain Layer)           │
└─────────────────────────────────────┘
     △
     │ Implementado por
┌─────────────────────────────────────┐
│ MySQL, Smtp, Stripe (Infra Layer)   │
└─────────────────────────────────────┘
```

### Arquitectura en capas

```
┌─────────────────────────────────────────────┐
│         PRESENTACION (UI/API)               │
│   Controllers, Commands, Forms              │
├─────────────────────────────────────────────┤
│         APLICACION (Use Cases)              │
│   Servicios que orquestan la logica         │
│               │                             │
│       Depende de (Interfaces)               │
├─────────────────────────────────────────────┤
│            DOMINIO (Business)               │
│   Entidades, Value Objects, Interfaces      │
│               △                             │
│       Implementado por (Inversion)          │
├─────────────────────────────────────────────┤
│       INFRAESTRUCTURA (Tecnica)             │
│   Repositories, Mailers, Gateways           │
└─────────────────────────────────────────────┘

✅ Las capas superiores dependen de abstracciones
✅ Las capas inferiores implementan esas abstracciones
✅ La logica de negocio esta aislada de los detalles tecnicos
```

### Ventajas

- ✅ **Testeabilidad:** Mocks y stubs faciles de crear
- ✅ **Flexibilidad:** Cambio de implementacion sin impacto
- ✅ **Aislamiento:** La logica de negocio no depende de la infraestructura
- ✅ **Reutilizabilidad:** Las abstracciones son reutilizables

---

## Checklist de validacion

### Antes de cada commit

#### SRP
- [ ] Cada clase tiene una sola responsabilidad claramente definida
- [ ] Los metodos hacen una sola cosa (< 20 lineas)
- [ ] Sin metodos con "y" u "o" en el nombre

#### OCP
- [ ] Nuevas funcionalidades agregadas por extension, no por modificacion
- [ ] Uso de interfaces y patrones Strategy
- [ ] Sin switch/if sobre tipos para determinar el comportamiento

#### LSP
- [ ] Los subtipos respetan los contratos de sus padres
- [ ] Sin precondiciones reforzadas en las subclases
- [ ] Sin postcondiciones debilitadas en las subclases
- [ ] Sin excepciones nuevas no documentadas

#### ISP
- [ ] Las interfaces son pequenas y focalizadas (< 5 metodos)
- [ ] Los clientes solo dependen de los metodos que utilizan
- [ ] Sin metodos `throw NotImplementedException()`

#### DIP
- [ ] Los use cases dependen de interfaces, no de implementaciones
- [ ] Las interfaces estan en el dominio, no en la infraestructura
- [ ] Inyeccion de dependencias via constructor

---

## Recursos

- **Libro:** *Clean Architecture* - Robert C. Martin
- **Libro:** *SOLID Principles* - Uncle Bob
- **Video:** [SOLID Principles Explained](https://www.youtube.com/watch?v=pTB30aXS77U)

---

**Fecha de ultima actualizacion:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
