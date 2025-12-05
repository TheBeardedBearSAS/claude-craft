# Checklist Audit Sécurité

## Données Sensibles

- [ ] Tokens dans flutter_secure_storage
- [ ] Pas de passwords en SharedPreferences
- [ ] Pas de secrets hardcodés
- [ ] .env dans .gitignore
- [ ] Obfuscation activée en prod

## API & Network

- [ ] HTTPS uniquement
- [ ] Certificate pinning implémenté
- [ ] Timeout configurés
- [ ] Retry strategy sécurisée
- [ ] Gestion des erreurs réseau

## Authentication

- [ ] JWT tokens sécurisés
- [ ] Refresh token implémenté
- [ ] Logout propre
- [ ] Session timeout
- [ ] Biométrie si disponible

## Validation

- [ ] Validation côté client
- [ ] Validation côté serveur
- [ ] Sanitization des entrées
- [ ] XSS prevention
- [ ] SQL injection prevention

## Permissions

- [ ] Permissions minimales
- [ ] Demande au bon moment
- [ ] Gestion du refus
- [ ] Documentation des permissions

## Production

- [ ] ProGuard/R8 configuré
- [ ] Symbols uploadés
- [ ] Logs production désactivés
- [ ] Error tracking configuré
