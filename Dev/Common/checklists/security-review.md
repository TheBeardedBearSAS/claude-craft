# Checklist Security Review

## OWASP Top 10 (2021)

### A01:2021 - Broken Access Control

- [ ] Vérification des autorisations sur chaque endpoint
- [ ] Pas d'accès direct aux objets par ID sans vérification
- [ ] CORS configuré correctement
- [ ] Tokens JWT validés côté serveur
- [ ] Principe du moindre privilège appliqué
- [ ] Pas d'élévation de privilèges possible

### A02:2021 - Cryptographic Failures

- [ ] Données sensibles chiffrées au repos
- [ ] Données sensibles chiffrées en transit (HTTPS)
- [ ] Algorithmes de chiffrement à jour (pas de MD5, SHA1)
- [ ] Clés de chiffrement stockées de manière sécurisée
- [ ] Mots de passe hashés avec bcrypt/argon2
- [ ] Pas de secrets dans le code source

### A03:2021 - Injection

- [ ] Requêtes SQL paramétrées (prepared statements)
- [ ] Validation et sanitisation des inputs
- [ ] Échappement des outputs (XSS)
- [ ] Pas d'évaluation de code dynamique
- [ ] LDAP/XML/OS injection vérifiées
- [ ] Headers HTTP sanitisés

### A04:2021 - Insecure Design

- [ ] Threat modeling effectué
- [ ] Rate limiting implémenté
- [ ] Limites de ressources définies
- [ ] Fail securely (pas de données exposées en cas d'erreur)
- [ ] Defense in depth appliquée

### A05:2021 - Security Misconfiguration

- [ ] Headers de sécurité configurés (CSP, HSTS, X-Frame-Options)
- [ ] Mode debug désactivé en production
- [ ] Erreurs génériques en production (pas de stack traces)
- [ ] Permissions fichiers restrictives
- [ ] Services inutiles désactivés
- [ ] Versions à jour des dépendances

### A06:2021 - Vulnerable Components

- [ ] Audit des dépendances effectué (npm audit, safety check)
- [ ] Pas de vulnérabilités critiques connues
- [ ] Dépendances à jour
- [ ] Sources des packages vérifiées
- [ ] Lockfile présent et à jour

### A07:2021 - Authentication Failures

- [ ] Politique de mot de passe robuste (12+ chars, complexité)
- [ ] Protection contre le brute force
- [ ] MFA disponible/obligatoire pour les admins
- [ ] Session invalidée après logout
- [ ] Tokens avec expiration raisonnable
- [ ] Pas de credentials par défaut

### A08:2021 - Software and Data Integrity Failures

- [ ] Intégrité des pipelines CI/CD vérifiée
- [ ] Signatures des packages vérifiées
- [ ] Pas de désérialisation non sécurisée
- [ ] SRI (Subresource Integrity) pour les CDN
- [ ] Updates automatiques sécurisées

### A09:2021 - Security Logging Failures

- [ ] Événements de sécurité loggés (login, échecs, accès)
- [ ] Logs protégés contre la modification
- [ ] Pas de données sensibles dans les logs
- [ ] Alertes sur événements suspects
- [ ] Rétention des logs conforme

### A10:2021 - Server-Side Request Forgery (SSRF)

- [ ] URLs validées côté serveur
- [ ] Whitelist des domaines autorisés
- [ ] Pas d'accès aux métadonnées cloud
- [ ] Résolution DNS contrôlée

---

## Checklist par Composant

### API / Backend

- [ ] Authentication sur tous les endpoints sensibles
- [ ] Authorization vérifiée (RBAC/ABAC)
- [ ] Input validation stricte
- [ ] Output encoding
- [ ] Rate limiting par IP/user
- [ ] Timeouts configurés
- [ ] CORS restrictif

### Base de Données

- [ ] Accès avec compte à privilèges limités
- [ ] Pas d'accès direct depuis internet
- [ ] Chiffrement des données sensibles
- [ ] Backups chiffrés
- [ ] Audit des accès activé

### Frontend

- [ ] Content Security Policy (CSP)
- [ ] Sanitisation des données affichées
- [ ] Pas de secrets dans le code JS
- [ ] HTTPS forcé
- [ ] Cookies sécurisés (HttpOnly, Secure, SameSite)

### Mobile

- [ ] Certificate pinning
- [ ] Stockage sécurisé (Keychain/Keystore)
- [ ] Pas de données sensibles en clair
- [ ] Anti-tampering
- [ ] Obfuscation du code

### Infrastructure

- [ ] Firewall configuré
- [ ] VPC/réseau isolé
- [ ] Secrets dans vault (pas en env vars)
- [ ] Logs centralisés
- [ ] Monitoring de sécurité

---

## Tests de Sécurité

### Tests Automatisés

- [ ] SAST (analyse statique) passé
- [ ] DAST (analyse dynamique) passé
- [ ] Dependency scanning passé
- [ ] Container scanning passé (si applicable)

### Tests Manuels

- [ ] Test de pénétration (si changement majeur)
- [ ] Revue de code sécurité
- [ ] Test des scénarios d'attaque courants

---

## Documentation Sécurité

- [ ] Politique de sécurité documentée
- [ ] Processus de réponse aux incidents
- [ ] Contact sécurité défini
- [ ] Responsible disclosure policy

---

## Décision

- [ ] ✅ **Approved** - Pas de problème de sécurité
- [ ] ⚠️ **Concerns** - Points à vérifier/améliorer
- [ ] ❌ **Blocked** - Vulnérabilités critiques à corriger
