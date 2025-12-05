# Checklist Nueva Funcionalidad

## Análisis

- [ ] Necesidad empresarial clarificada
- [ ] Casos de uso identificados
- [ ] Dependencias analizadas
- [ ] Arquitectura definida
- [ ] Casos límite anticipados

## Capa Domain

- [ ] Entidad creada
- [ ] Interfaz Repository definida
- [ ] Casos de uso implementados
- [ ] Pruebas unitarias de casos de uso (> 90%)

## Capa Data

- [ ] Models con Freezed/JsonSerializable
- [ ] Remote DataSource
- [ ] Local DataSource (si hay caché)
- [ ] Repository implementado
- [ ] Pruebas unitarias de repository (> 85%)

## Capa Presentation

- [ ] Events/States del BLoC
- [ ] BLoC implementado
- [ ] Pruebas del BLoC (> 85%)
- [ ] Pages/Screens creadas
- [ ] Widgets reutilizables extraídos
- [ ] Pruebas de widget (> 70%)

## Integración

- [ ] Inyección de dependencias configurada
- [ ] Navegación agregada
- [ ] Pruebas de integración escritas
- [ ] Flujo E2E probado

## Documentación

- [ ] Dartdoc completo
- [ ] README actualizado
- [ ] CHANGELOG actualizado
- [ ] Screenshots agregadas (si es UI)

## Calidad

- [ ] flutter analyze limpio
- [ ] dart format aplicado
- [ ] Cobertura de pruebas > umbrales
- [ ] Rendimiento verificado
- [ ] Code review aprobado
