# Checklist de Revisión de Código

## Antes de Comenzar la Revisión

- [ ] He leído la descripción del PR
- [ ] Entiendo el objetivo de los cambios
- [ ] He verificado los tickets relacionados
- [ ] Tengo el contexto necesario para revisar

---

## Checklist de Revisión

### 1. Diseño y Arquitectura

- [ ] Los cambios son consistentes con la arquitectura existente
- [ ] Las responsabilidades están bien separadas (SRP)
- [ ] No se introduce acoplamiento fuerte
- [ ] Las abstracciones están en el nivel correcto
- [ ] Los patrones utilizados son apropiados
- [ ] Sin sobre-ingeniería

### 2. Calidad del Código

#### Legibilidad
- [ ] El código es fácil de leer y entender
- [ ] Los nombres de variables/funciones son explícitos
- [ ] Las funciones hacen una cosa
- [ ] Las funciones tienen una longitud razonable (< 50 líneas)
- [ ] El código es auto-documentado

#### Mantenibilidad
- [ ] El código es fácilmente modificable
- [ ] Sin código duplicado
- [ ] Se evitan números mágicos (constantes nombradas)
- [ ] Las dependencias están gestionadas correctamente

#### Estándares
- [ ] Se respetan las convenciones de nombres
- [ ] El formato es correcto (linter)
- [ ] Las importaciones están organizadas
- [ ] Sin código comentado innecesario
- [ ] Sin TODO sin ticket asociado

### 3. Lógica y Funcionalidad

- [ ] La lógica de negocio es correcta
- [ ] Los casos extremos están manejados
- [ ] Las condiciones límite están verificadas
- [ ] Sin bugs obvios
- [ ] El comportamiento esperado está implementado

### 4. Manejo de Errores

- [ ] Los errores se manejan apropiadamente
- [ ] Los mensajes de error son claros y útiles
- [ ] Las excepciones se usan correctamente
- [ ] Los casos de fallo están cubiertos
- [ ] Logging apropiado en error

### 5. Seguridad

- [ ] Sin posibilidad de inyección SQL
- [ ] Sin posibilidad de XSS
- [ ] Sin secrets en el código
- [ ] Validación de entrada de usuario
- [ ] Autorización verificada si es necesario
- [ ] Datos sensibles protegidos

### 6. Rendimiento

- [ ] Sin consultas N+1
- [ ] Sin operaciones costosas en bucles
- [ ] Índices utilizados correctamente
- [ ] Caché apropiado
- [ ] Sin fugas de memoria
- [ ] Complejidad algorítmica aceptable

### 7. Tests

- [ ] Tests unitarios presentes y relevantes
- [ ] Tests cubren casos nominales
- [ ] Tests cubren casos de error
- [ ] Tests son legibles
- [ ] Tests son independientes
- [ ] Sin tests frágiles (flaky)

### 8. Documentación

- [ ] Código auto-documentado o comentado si es complejo
- [ ] API documentada si es pública
- [ ] README actualizado si es necesario
- [ ] Cambios de configuración documentados

---

## Tipos de Comentarios

### Bloqueante (❌)
Debe ser corregido antes del merge.
```
❌ Esta consulta puede causar inyección SQL
```

### Importante (⚠️)
Debería ser corregido, salvo justificación.
```
⚠️ Esta función podría beneficiarse de extracción
```

### Sugerencia (💡)
Mejora posible, no obligatoria.
```
💡 Podríamos simplificar esta condición
```

### Pregunta (❓)
Solicitud de aclaración.
```
❓ ¿Por qué esta elección de implementación?
```

### Positivo (✅)
Feedback positivo sobre el código.
```
✅ ¡Buen uso del patrón aquí!
```

---

## Mejores Prácticas del Revisor

1. **Ser constructivo** - Criticar el código, no la persona
2. **Ser preciso** - Dar ejemplos o sugerencias
3. **Ser respetuoso** - Usar tono benevolente
4. **Ser reactivo** - Responder rápidamente a discusiones
5. **Ser consistente** - Aplicar los mismos estándares a todos

## Mejores Prácticas del Autor

1. **Proporcionar contexto** - Descripción clara del PR
2. **PRs pequeños** - Más fácil de revisar
3. **Auto-revisión** - Releer antes de solicitar revisión
4. **Responder a comentarios** - No ignorar
5. **Aprender** - Usar feedback para mejorar

---

## Decisión de Revisión

- [ ] **Aprobado** - Listo para merge
- [ ] **Solicitar cambios** - Cambios necesarios
- [ ] **Comentar** - Preguntas o sugerencias sin bloquear
