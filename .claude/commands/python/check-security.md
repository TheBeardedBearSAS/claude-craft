---
description: Vérification Sécurité Python
argument-hint: [arguments]
model: haiku

---

# Vérification Sécurité Python

## Arguments

$ARGUMENTS (optionnel : chemin vers le projet à analyser)

## MISSION

Réaliser un audit complet de la sécurité du projet Python en identifiant les vulnérabilités, les secrets exposés, et les mauvaises pratiques de sécurité définies dans les règles du projet.

### Étape 1 : Analyse de sécurité avec Bandit

Scanner le code avec Bandit pour détecter les vulnérabilités :
- [ ] Pas de hardcoded passwords/secrets
- [ ] Pas d'utilisation de `eval()` ou `exec()`
- [ ] Pas de désérialisation non sécurisée (pickle)
- [ ] Pas de SQL injection (utilisation d'ORM ou requêtes paramétrées)
- [ ] Pas d'injection de commandes shell
- [ ] Cryptographie sécurisée (pas de MD5/SHA1)

**Commande** : Exécuter `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install bandit && bandit -r /app -f json"`

**Référence** : `rules/06-tooling.md` section "Security Analysis"

### Étape 2 : Détection de secrets

Rechercher les secrets et credentials dans le code :
- [ ] Pas de clés API dans le code source
- [ ] Pas de tokens dans les fichiers
- [ ] Pas de mots de passe en clair
- [ ] Variables d'environnement pour configuration sensible
- [ ] .env dans .gitignore
- [ ] .env.example fourni (sans valeurs réelles)

**Commande** : Utiliser grep/recherche pour détecter les patterns de secrets

**Patterns à rechercher** :
- `password\s*=\s*["'][^"']+["']`
- `api_key\s*=\s*["'][^"']+["']`
- `secret\s*=\s*["'][^"']+["']`
- `token\s*=\s*["'][^"']+["']`

**Référence** : `rules/03-coding-standards.md` section "Security Best Practices"

### Étape 3 : Validation des entrées utilisateur

Vérifier la validation et sanitization des données :
- [ ] Validation de tous les inputs utilisateur
- [ ] Utilisation de Pydantic pour validation
- [ ] Sanitization des données avant traitement
- [ ] Pas de confiance aveugle aux données externes
- [ ] Validation des types et formats
- [ ] Limites sur la taille des inputs

**Référence** : `rules/03-coding-standards.md` section "Input Validation"

### Étape 4 : Dépendances et vulnérabilités

Analyser les dépendances pour vulnérabilités connues :
- [ ] Pas de dépendances avec CVE critiques
- [ ] Versions à jour des bibliothèques
- [ ] requirements.txt avec versions fixées
- [ ] Utilisation de `pip-audit` ou `safety`
- [ ] Pas de dépendances obsolètes

**Commande** : Exécuter `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pip-audit && pip-audit --requirement /app/requirements.txt"`

**Référence** : `rules/06-tooling.md` section "Dependency Management"

### Étape 5 : Gestion des erreurs et logs

Contrôler la gestion sécurisée des erreurs :
- [ ] Pas de stack traces exposées en production
- [ ] Messages d'erreur génériques pour l'utilisateur
- [ ] Logs sécurisés (pas de données sensibles)
- [ ] Pas de debug mode en production
- [ ] Gestion appropriée des exceptions
- [ ] Logging des événements de sécurité

**Référence** : `rules/03-coding-standards.md` section "Error Handling"

### Étape 6 : Authentification et Autorisation

Vérifier la sécurité de l'authentification :
- [ ] Pas de gestion manuelle des mots de passe (utiliser bcrypt/argon2)
- [ ] Tokens JWT avec expiration
- [ ] HTTPS obligatoire pour endpoints sensibles
- [ ] Protection CSRF si applicable
- [ ] Rate limiting sur les endpoints sensibles
- [ ] Validation des permissions (RBAC/ABAC)

**Référence** : `rules/02-architecture.md` section "Security Layer"

### Étape 7 : Configuration et environnement

Analyser la configuration de sécurité :
- [ ] Variables d'environnement pour secrets
- [ ] Configuration différente par environnement (dev/staging/prod)
- [ ] Pas de secrets dans docker-compose.yml
- [ ] Secrets dans variables d'environnement ou vault
- [ ] .env.example documenté
- [ ] DEBUG=False en production

**Référence** : `rules/06-tooling.md` section "Environment Configuration"

### Étape 8 : Injection et XSS

Vérifier la protection contre les injections :
- [ ] Pas d'injection SQL (ORM ou requêtes paramétrées)
- [ ] Échappement des données dans templates
- [ ] Pas d'injection de commandes (subprocess sécurisé)
- [ ] Validation des chemins de fichiers (path traversal)
- [ ] Content-Security-Policy si application web
- [ ] Sanitization des inputs HTML

**Référence** : `rules/03-coding-standards.md` section "Security Best Practices"

### Étape 9 : Calcul du score

Attribution des points (sur 25) :
- Bandit (vulnérabilités) : 6 points
- Secrets et credentials : 5 points
- Validation des entrées : 4 points
- Dépendances sécurisées : 4 points
- Gestion des erreurs : 3 points
- Auth/Authz : 2 points
- Injection/XSS : 1 point

## FORMAT DE SORTIE

```
🔒 AUDIT SÉCURITÉ PYTHON
================================

📊 SCORE GLOBAL : XX/25

✅ POINTS FORTS :
- [Liste des bonnes pratiques de sécurité observées]

⚠️ POINTS D'AMÉLIORATION :
- [Liste des améliorations de sécurité mineures]

❌ PROBLÈMES CRITIQUES :
- [Liste des vulnérabilités critiques à corriger IMMÉDIATEMENT]

📋 DÉTAILS PAR CATÉGORIE :

1. BANDIT SCAN (XX/6)
   ✅/⚠️/❌ [Analyse des vulnérabilités]
   Issues critiques : XX
   Issues moyennes : XX
   Issues faibles : XX

2. SECRETS EXPOSÉS (XX/5)
   ✅/⚠️/❌ [Détection de secrets]
   Secrets hardcodés : XX
   Fichiers .env sécurisés : ✅/❌

3. VALIDATION ENTRÉES (XX/4)
   ✅/⚠️/❌ [Validation et sanitization]
   Inputs non validés : XX
   Utilisation Pydantic : ✅/❌

4. DÉPENDANCES (XX/4)
   ✅/⚠️/❌ [Vulnérabilités des dépendances]
   CVE critiques : XX
   CVE moyennes : XX
   Dépendances obsolètes : XX

5. GESTION ERREURS (XX/3)
   ✅/⚠️/❌ [Sécurité des erreurs et logs]
   Stack traces exposées : XX
   Données sensibles dans logs : XX

6. AUTHENTIFICATION (XX/2)
   ✅/⚠️/❌ [Auth/Authz]
   Hashing sécurisé : ✅/❌
   JWT avec expiration : ✅/❌

7. INJECTIONS (XX/1)
   ✅/⚠️/❌ [Protection contre injections]
   Risques SQL injection : XX
   Risques command injection : XX

🚨 VULNÉRABILITÉS CRITIQUES :
[Liste détaillée des vulnérabilités à corriger immédiatement avec fichier:ligne]

🎯 TOP 3 ACTIONS PRIORITAIRES :
1. [Action la plus critique pour la sécurité - URGENT]
2. [Deuxième action prioritaire - IMPORTANT]
3. [Troisième action prioritaire - RECOMMANDÉ]
```

## NOTES

- Les problèmes de sécurité DOIVENT être traités en priorité absolue
- Utiliser Docker pour exécuter les outils de sécurité
- Fournir le fichier et la ligne exacte pour chaque vulnérabilité
- Proposer des corrections concrètes pour chaque problème
- Documenter les risques et l'impact potentiel
- Tester les correctifs suggérés
- Ne JAMAIS commiter de secrets dans le code
