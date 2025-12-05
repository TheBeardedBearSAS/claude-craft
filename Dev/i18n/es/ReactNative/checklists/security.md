# Checklist de Auditoría de Seguridad

Auditoría de seguridad completa para aplicación React Native.

---

## 1. Almacenamiento de Datos Sensibles

### SecureStore / Keychain

- [ ] Tokens almacenados en SecureStore (iOS Keychain / Android Keystore)
- [ ] Refresh tokens asegurados
- [ ] API keys no expuestos
- [ ] Credenciales nunca en texto plano
- [ ] Claves biométricas protegidas

### Código

- [ ] Sin secrets hardcoded
- [ ] Sin tokens en código fuente
- [ ] Sin credenciales en logs
- [ ] `.env` en `.gitignore`
- [ ] Secrets en EAS Secrets (producción)

### Almacenamiento

- [ ] Encriptación de MMKV activada (datos sensibles)
- [ ] Sin PII en AsyncStorage
- [ ] Storage limpiado al cerrar sesión
- [ ] Backup encriptado (iOS/Android)

---

## 2. Seguridad de API

### Autenticación

- [ ] Tokens JWT con expiración corta
- [ ] Mecanismo de refresh token
- [ ] Rotación de tokens implementada
- [ ] Refresh automático de tokens
- [ ] Logout limpia todos los tokens

### HTTPS

- [ ] Todas las llamadas API en HTTPS
- [ ] Sin HTTP en producción
- [ ] Certificate pinning (si crítico)
- [ ] TLS 1.2+ mínimo

### Headers

- [ ] Header de autorización presente
- [ ] Protección CSRF (si aplicable)
- [ ] Versión de API en headers
- [ ] Tracking de Request ID
- [ ] User-Agent presente

### Seguridad de Requests

- [ ] Timeout configurado (10s máx)
- [ ] Lógica de retry con backoff
- [ ] Rate limiting del lado del cliente
- [ ] Validación de requests
- [ ] Validación de responses

---

## 3. Validación de Entradas

### Entrada del Usuario

- [ ] Validación con Zod/Yup
- [ ] Sanitización antes de mostrar
- [ ] Longitud máxima forzada
- [ ] Verificación estricta de tipos
- [ ] Validación segura de regex

### Formularios

- [ ] Validación de email
- [ ] Forzar fortaleza de contraseña
- [ ] Caracteres especiales manejados
- [ ] Prevención de inyección SQL (backend)
- [ ] Prevención de XSS

### URL/Deep Links

- [ ] Validación de URL
- [ ] Validación de esquema de deep link
- [ ] Sanitización de parámetros
- [ ] Whitelist de hosts permitidos
- [ ] Validación de redirección

---

## 4. Autenticación y Autorización

### Autenticación

- [ ] Flujo de login seguro
- [ ] Autenticación biométrica (si disponible)
- [ ] Soporte de 2FA (si requerido)
- [ ] Reset de contraseña seguro
- [ ] Bloqueo de cuenta después de intentos

### Autorización

- [ ] Control de acceso basado en roles
- [ ] Verificaciones de permisos antes de acciones
- [ ] Implementación de rutas protegidas
- [ ] Permisos de API validados
- [ ] Propiedad de recursos verificada

### Gestión de Sesión

- [ ] Timeout de sesión configurado
- [ ] Logout automático por inactividad
- [ ] Manejo de sesión concurrente
- [ ] Revocación de sesión
- [ ] Remember me seguro

---

## 5. Seguridad del Código

### Dependencias

- [ ] `npm audit` limpio (0 vulnerabilidades)
- [ ] Dependencias actualizadas
- [ ] Sin paquetes sospechosos
- [ ] Lock file commiteado
- [ ] Actualizaciones regulares programadas

### Calidad del Código

- [ ] Reglas de seguridad de ESLint
- [ ] Modo estricto de TypeScript
- [ ] Sin uso de `eval()`
- [ ] Sin `dangerouslySetInnerHTML`
- [ ] Sin código ofuscado malicioso

### Gestión de Secrets

- [ ] Variables de entorno usadas
- [ ] EAS Secrets para producción
- [ ] Archivos de config ignorados en git
- [ ] Sin secrets en logs
- [ ] Estrategia de rotación de secrets

---

## 6. Seguridad de Plataforma

### iOS

- [ ] Acceso a Keychain configurado
- [ ] NSAllowsArbitraryLoads = false
- [ ] SSL pinning (si crítico)
- [ ] Prevención de screenshots (si sensible)
- [ ] Touch ID / Face ID configurado

### Android

- [ ] ProGuard / R8 habilitado
- [ ] Configuración de seguridad de red
- [ ] Certificate pinning (si crítico)
- [ ] Prevención de screenshots (si sensible)
- [ ] Fingerprint / Face configurado

### Permisos

- [ ] Permisos mínimos
- [ ] Permisos de runtime manejados
- [ ] Justificación de permisos mostrada
- [ ] Permisos denegados manejados
- [ ] Permisos documentados

---

## 7. Seguridad de Red

### Comunicación

- [ ] Solo HTTPS
- [ ] Sin contenido mixto
- [ ] Validación de certificados
- [ ] Pinning (alta seguridad)
- [ ] Sin tráfico en texto plano

### Tránsito de Datos

- [ ] Datos sensibles encriptados
- [ ] Sin credenciales en URL
- [ ] POST para datos sensibles
- [ ] Uploads de archivos asegurados
- [ ] Validación de descargas

---

## 8. Seguridad Offline

### Datos Locales

- [ ] Datos sensibles encriptados
- [ ] Invalidación de cache
- [ ] Limpieza de datos antiguos
- [ ] Autenticación offline segura
- [ ] Conflictos de sincronización manejados

### Limpieza de Almacenamiento

- [ ] Logout limpia cache
- [ ] Archivos temporales eliminados
- [ ] Imágenes cacheadas de forma segura
- [ ] Base de datos encriptada
- [ ] Backup encriptado

---

## 9. Manejo de Errores

### Mensajes de Error

- [ ] Sin info sensible en errores
- [ ] Errores genéricos a usuarios
- [ ] Logs detallados solo del lado del servidor
- [ ] Stack traces ocultos (producción)
- [ ] Tracking de errores configurado

### Logging

- [ ] Sin credenciales registradas
- [ ] Sin PII registrado
- [ ] Logs sanitizados
- [ ] Rotación de logs configurada
- [ ] Reportes de crash asegurados

---

## 10. Seguridad de Terceros

### SDKs

- [ ] SDKs de fuentes confiables
- [ ] Políticas de privacidad revisadas
- [ ] Compartición de datos documentada
- [ ] Permisos mínimos
- [ ] Analytics anonimizados

### APIs

- [ ] APIs de terceros aseguradas
- [ ] API keys en secrets
- [ ] OAuth implementado correctamente
- [ ] Scope mínimo
- [ ] Tokens revocables

---

## 11. Seguridad de WebView (si se usa)

- [ ] Solo HTTPS
- [ ] Inyección de JavaScript prevenida
- [ ] Acceso a archivos restringido
- [ ] Política de seguridad de contenido
- [ ] Whitelist de dominios

---

## 12. Seguridad Biométrica

- [ ] Fallback a código de acceso
- [ ] Registro verificado
- [ ] Elemento seguro usado
- [ ] Datos biométricos nunca almacenados
- [ ] Privacidad respetada

---

## 13. Ofuscación de Código (Producción)

- [ ] Código ofuscado (Hermes)
- [ ] Source maps no incluidos
- [ ] Info de debug removida
- [ ] Logs de consola removidos
- [ ] Dead code eliminado

---

## 14. Cumplimiento

### GDPR (si UE)

- [ ] Política de privacidad
- [ ] Gestión de consentimiento
- [ ] Función de exportación de datos
- [ ] Función de eliminación de datos
- [ ] Consentimiento de cookies

### CCPA (si US/CA)

- [ ] Opción de no vender
- [ ] Divulgación de datos
- [ ] Derechos de eliminación
- [ ] Aviso de privacidad

### HIPAA (si datos de salud)

- [ ] Encriptación en reposo
- [ ] Encriptación en tránsito
- [ ] Controles de acceso
- [ ] Registro de auditoría
- [ ] BAA en su lugar

---

## 15. Monitoreo y Respuesta

### Monitoreo

- [ ] Incidentes de seguridad rastreados
- [ ] Detección de anomalías
- [ ] Monitoreo de autenticación fallida
- [ ] Detección de abuso de API
- [ ] Monitoreo de rendimiento

### Respuesta a Incidentes

- [ ] Plan de respuesta documentado
- [ ] Lista de contactos actualizada
- [ ] Procedimiento de rollback
- [ ] Plan de comunicación
- [ ] Proceso de post-mortem

---

## 16. Testing

### Tests de Seguridad

- [ ] Pruebas de penetración realizadas
- [ ] OWASP Mobile Top 10 verificado
- [ ] Man-in-the-middle probado
- [ ] Secuestro de sesión probado
- [ ] Inyección SQL probada (backend)

### Análisis de Código

- [ ] Análisis estático ejecutado
- [ ] Análisis dinámico ejecutado
- [ ] Escaneo de dependencias
- [ ] Escaneo de secrets
- [ ] Cumplimiento de licencias

---

## Verificación Final

- [ ] Todos los elementos críticos atendidos
- [ ] Severidad alta corregida
- [ ] Severidad media planificada
- [ ] Documentación actualizada
- [ ] Equipo capacitado

---

## Puntuación de Seguridad

- **Crítico**: ___ / ___ ✅
- **Alto**: ___ / ___ ✅
- **Medio**: ___ / ___ ⚠️
- **Bajo**: ___ / ___ ℹ️

---

**La seguridad no es una función, es un requisito.**

Reporte generado: {{DATE}}
Auditor: {{NAME}}
