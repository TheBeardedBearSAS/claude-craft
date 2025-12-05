# Lista de Verificación Pre-Commit

Esta lista de verificación debe ser validada **antes de cada commit**.

---

## Calidad del Código

- [ ] Código lintado con 0 errores (`npm run lint`)
- [ ] Código formateado con Prettier (`npm run format`)
- [ ] TypeScript compila sin errores (`npm run type-check`)
- [ ] Sin `console.log` olvidados (excepto logs intencionales)
- [ ] Sin `// TODO` o `// FIXME` añadidos sin issue asociado
- [ ] Sin código comentado (eliminar o crear issue)

---

## Tests

- [ ] Tests unitarios añadidos para nueva lógica
- [ ] Tests de componentes añadidos para nueva UI
- [ ] Todos los tests pasan (`npm test`)
- [ ] Cobertura mantenida o mejorada
- [ ] Tests E2E actualizados si es necesario

---

## Estándares de Código

- [ ] Convenciones de nomenclatura respetadas
- [ ] Imports organizados correctamente
- [ ] Sin duplicación de código (DRY)
- [ ] Comentarios JSDoc para funciones públicas
- [ ] Tipos TypeScript completos (sin `any`)
- [ ] Componentes React.memo si es necesario
- [ ] useCallback/useMemo usados correctamente

---

## Rendimiento

- [ ] Sin cálculos costosos sin memoización
- [ ] Imágenes optimizadas (tamaño, formato)
- [ ] FlatList optimizado (si aplica)
- [ ] Sin funciones inline en renders
- [ ] Sin objetos de estilo inline
- [ ] Animaciones usan `useNativeDriver`

---

## Seguridad

- [ ] Sin secrets/tokens en código
- [ ] Validación de entrada en su lugar
- [ ] Datos sensibles en SecureStore
- [ ] Llamadas API usan HTTPS
- [ ] Sin vulnerabilidades de dependencias (`npm audit`)

---

## Arquitectura

- [ ] Respetar arquitectura establecida
- [ ] Responsabilidad única (SRP)
- [ ] Separación de concerns
- [ ] Sin acoplamiento fuerte
- [ ] Inyección de dependencias usada

---

## Documentación

- [ ] README actualizado si es necesario
- [ ] JSDoc añadido para nuevas APIs
- [ ] Comentarios para lógica compleja
- [ ] CHANGELOG actualizado
- [ ] Tipos documentados

---

## Git

- [ ] Mensaje de commit sigue Conventional Commits
- [ ] Commit atómico (una funcionalidad/corrección)
- [ ] Sin archivos irrelevantes commiteados
- [ ] .gitignore respetado
- [ ] Rama actualizada con main/develop

---

## Verificación Final

- [ ] Diff completo revisado
- [ ] Funcionalidad probada manualmente
- [ ] Sin cambios incompatibles no documentados
- [ ] Listo para revisión de código

---

**Si todos los items están marcados ✅ → Commit autorizado**
