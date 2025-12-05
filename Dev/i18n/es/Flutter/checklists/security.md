# Checklist Auditoría de Seguridad

## Datos Sensibles

- [ ] Tokens en flutter_secure_storage
- [ ] Sin contraseñas en SharedPreferences
- [ ] Sin secretos hardcodeados
- [ ] .env en .gitignore
- [ ] Ofuscación habilitada en prod

## API y Red

- [ ] Solo HTTPS
- [ ] Certificate pinning implementado
- [ ] Timeouts configurados
- [ ] Estrategia de reintentos segura
- [ ] Manejo de errores de red

## Autenticación

- [ ] Tokens JWT seguros
- [ ] Refresh token implementado
- [ ] Logout limpio
- [ ] Timeout de sesión
- [ ] Biometría si está disponible

## Validación

- [ ] Validación del lado del cliente
- [ ] Validación del lado del servidor
- [ ] Sanitización de inputs
- [ ] Prevención de XSS
- [ ] Prevención de inyección SQL

## Permisos

- [ ] Permisos mínimos
- [ ] Solicitar en momento correcto
- [ ] Manejar denegación
- [ ] Documentación de permisos

## Producción

- [ ] ProGuard/R8 configurado
- [ ] Símbolos subidos
- [ ] Logs de producción deshabilitados
- [ ] Tracking de errores configurado
