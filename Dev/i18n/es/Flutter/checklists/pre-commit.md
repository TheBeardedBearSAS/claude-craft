# Checklist Pre-Commit

## Calidad del Código

- [ ] Código formateado con `dart format`
- [ ] Sin warnings de `flutter analyze`
- [ ] Sin errores de compilación
- [ ] Todos los imports organizados
- [ ] Sin código comentado innecesario
- [ ] Sin `print()` o `debugPrint()` olvidados
- [ ] Sin TODO sin ticket asociado

## Pruebas

- [ ] Pruebas unitarias pasan (`flutter test`)
- [ ] Pruebas de widget pasan
- [ ] Cobertura > 80% para archivos nuevos
- [ ] Sin pruebas saltadas (`@Skip`)

## Documentación

- [ ] Dartdoc para nuevas clases públicas
- [ ] README actualizado si es necesario
- [ ] CHANGELOG actualizado
- [ ] Comentarios para código complejo

## Git

- [ ] Mensaje de commit sigue Conventional Commits
- [ ] Sin archivos sensibles (.env, secrets)
- [ ] .gitignore actualizado
- [ ] Branch actualizado con develop/main

## Arquitectura

- [ ] Clean Architecture respetada
- [ ] Dependencias en dirección correcta
- [ ] Sin lógica de negocio en UI
- [ ] Widgets reutilizables extraídos

## Rendimiento

- [ ] Widgets const utilizados
- [ ] Sin builds innecesarios
- [ ] Imágenes optimizadas
- [ ] Uso correcto de async/await

## Seguridad

- [ ] Sin datos sensibles hardcodeados
- [ ] Validación de entrada de usuario
- [ ] Manejo apropiado de permisos
