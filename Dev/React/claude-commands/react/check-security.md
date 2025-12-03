# Vérification de la Sécurité React

## Arguments

$ARGUMENTS

## MISSION

Tu es un expert en sécurité React chargé d'auditer la sécurité d'un projet React.

### Étape 1 : Analyse du contexte
- Identifier le répertoire du projet à auditer ($ARGUMENTS ou répertoire courant)
- Lire les règles de sécurité depuis :
  - `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/11-security.md`
  - `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/03-coding-standards.md` (section sécurité)

### Étape 2 : Vérification des vulnérabilités XSS

Examiner et vérifier :

**Protection XSS (8 points)**
- [ ] Pas d'usage de dangerouslySetInnerHTML sans sanitization
- [ ] Bibliothèque DOMPurify utilisée si HTML brut nécessaire
- [ ] Validation des inputs utilisateur
- [ ] Encodage des données avant affichage
- [ ] Pas d'exécution de eval() ou Function()
- [ ] Pas d'injection de scripts via innerHTML
- [ ] CSP (Content Security Policy) configuré
- [ ] Validation des URLs avant redirect

### Étape 3 : Vérification de la gestion des secrets

**Secrets et credentials (7 points)**
- [ ] Pas de clés API en dur dans le code
- [ ] Variables d'environnement utilisées (.env)
- [ ] .env ajouté au .gitignore
- [ ] Pas de tokens dans le localStorage (préférer httpOnly cookies)
- [ ] Pas de secrets dans les logs ou erreurs client
- [ ] Rotation des secrets documentée
- [ ] Pas de credentials dans le repository (git history)

### Étape 4 : Vérification de la sanitization des données

**Sanitization et validation (5 points)**
- [ ] Validation côté client ET serveur
- [ ] Bibliothèque de validation (Zod, Yup, Joi)
- [ ] Sanitization des inputs avant envoi API
- [ ] Validation des types de fichiers uploadés
- [ ] Taille maximale des uploads limitée
- [ ] Nettoyage des données avant affichage

### Étape 5 : Vérification des dépendances et vulnérabilités

**Dépendances sécurisées (5 points)**
- [ ] Pas de vulnérabilités critiques (npm audit / yarn audit)
- [ ] Dépendances à jour (derniers patches de sécurité)
- [ ] Lockfile présent (package-lock.json / yarn.lock)
- [ ] Renovate ou Dependabot configuré
- [ ] Vérification régulière des CVE

### Étape 6 : Analyse de sécurité approfondie

Scanner le code pour :
- Usage de dangerouslySetInnerHTML
- Patterns d'injection SQL potentiels
- Stockage non sécurisé (localStorage vs sessionStorage)
- CORS mal configuré
- Redirections non validées
- Upload de fichiers non sécurisé
- Exposition de données sensibles dans le code frontend
- Logs contenant des informations sensibles

### Étape 7 : Exécution des audits de sécurité

Exécuter les commandes :
```bash
# Audit des dépendances
npm audit --audit-level=moderate || yarn audit --level moderate

# Recherche de secrets (si outil installé)
git-secrets --scan || trufflehog --regex --entropy=False .

# ESLint security plugins
npx eslint . --ext .ts,.tsx --config .eslintrc-security.js
```

### Étape 8 : Calcul du score

**Score sur 25 points :**
- Protection XSS : 8 points
- Secrets et credentials : 7 points
- Sanitization et validation : 5 points
- Dépendances sécurisées : 5 points

### Étape 9 : Rapport de conformité

Générer un rapport structuré :

```
═══════════════════════════════════════════════════
🔒 AUDIT SÉCURITÉ REACT
═══════════════════════════════════════════════════

📊 SCORE GLOBAL : XX/25

⚠️  Vulnérabilités critiques détectées : XX
🔴 Vulnérabilités hautes : XX
🟡 Vulnérabilités moyennes : XX

🛡️  PROTECTION XSS : XX/8
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Vulnérabilités XSS détectées :
• Fichier : src/components/RichTextDisplay.tsx:23
  Problème : dangerouslySetInnerHTML sans sanitization
  Risque : CRITIQUE
  Solution : Utiliser DOMPurify.sanitize() avant affichage

• Fichier : src/utils/redirect.ts:15
  Problème : window.location.href non validé
  Risque : MOYEN
  Solution : Whitelist des URLs autorisées

🔑 SECRETS & CREDENTIALS : XX/7
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Secrets exposés détectés :
• Fichier : src/config/api.ts:5
  Problème : Clé API en dur "sk_live_xxxx"
  Risque : CRITIQUE
  Solution : Déplacer vers VITE_API_KEY dans .env

• Fichier : src/services/auth.ts:42
  Problème : Token JWT dans localStorage
  Risque : MOYEN
  Solution : Utiliser httpOnly cookies

🧹 SANITIZATION & VALIDATION : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Problèmes détectés :
• XX inputs sans validation
• XX formulaires sans sanitization
• XX uploads de fichiers non sécurisés

📦 DÉPENDANCES SÉCURISÉES : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Audit npm/yarn :
┌──────────────────────────────────────────────────┐
│                                                  │
│  Vulnérabilités détectées : XX                   │
│                                                  │
│  Critiques  : XX                                 │
│  Hautes     : XX                                 │
│  Moyennes   : XX                                 │
│  Basses     : XX                                 │
│                                                  │
└──────────────────────────────────────────────────┘

Packages vulnérables à corriger :
• package-name@1.2.3 → 1.2.4 (CVE-2024-XXXX)
• other-package@2.0.0 → 3.0.0 (CVE-2024-YYYY)

🔍 ANALYSE COMPLÉMENTAIRE

Configuration HTTPS :
• [✅/❌] Force HTTPS activé
• [✅/❌] HSTS headers configurés
• [✅/❌] Cookies avec Secure flag

Configuration CORS :
• [✅/❌] Origins whitelistés
• [✅/❌] Credentials correctement gérés
• [✅/❌] Headers restrictifs

Exposition de données :
• [✅/❌] Pas de PII dans les logs frontend
• [✅/❌] Error messages sans stack traces en prod
• [✅/❌] Source maps désactivées en production

═══════════════════════════════════════════════════
🎯 TOP 3 ACTIONS PRIORITAIRES
═══════════════════════════════════════════════════

1. [Priorité CRITIQUE] Corriger les XX vulnérabilités XSS
   → Fichiers concernés : RichTextDisplay.tsx, UserProfile.tsx
   → Action : Ajouter DOMPurify.sanitize()
   → Effort estimé : 2 heures
   → Impact sécurité : CRITIQUE

2. [Priorité CRITIQUE] Supprimer les secrets du code source
   → XX clés API exposées
   → Action : Migrer vers variables d'environnement
   → Vérifier git history et faire rotation des secrets
   → Effort estimé : 4 heures
   → Impact sécurité : CRITIQUE

3. [Priorité HAUTE] Corriger les vulnérabilités npm
   → XX packages à mettre à jour
   → Action : npm audit fix ou mise à jour manuelle
   → Effort estimé : 1 heure
   → Impact sécurité : HAUT

═══════════════════════════════════════════════════
🚨 ACTIONS IMMÉDIATES REQUISES
═══════════════════════════════════════════════════

Si des vulnérabilités CRITIQUES sont détectées :

1. ARRÊTER tout déploiement en production
2. Isoler les zones à risque
3. Appliquer les correctifs d'urgence
4. Effectuer un audit complet de sécurité
5. Notifier l'équipe de sécurité

═══════════════════════════════════════════════════
📚 RÉFÉRENCES
═══════════════════════════════════════════════════

• rules/11-security.md - Standards de sécurité
• https://owasp.org/www-project-top-ten/
• https://cheatsheetseries.owasp.org/cheatsheets/React_Security_Cheat_Sheet.html
• https://www.npmjs.com/package/dompurify
```

### Étape 10 : Checklist de sécurité détaillée

Fournir une checklist actionable :

**XSS Prevention Checklist**
- [ ] Remplacer dangerouslySetInnerHTML par composants safe
- [ ] Implémenter DOMPurify pour HTML user-generated
- [ ] Configurer CSP headers
- [ ] Valider toutes les redirections

**Secrets Management Checklist**
- [ ] Audit du code pour secrets hardcodés
- [ ] Configuration .env pour tous les environnements
- [ ] Rotation de tous les secrets exposés
- [ ] Nettoyage git history si nécessaire
- [ ] Documentation processus de gestion des secrets

**Input Validation Checklist**
- [ ] Validation schema avec Zod/Yup sur tous les formulaires
- [ ] Sanitization avant envoi API
- [ ] Validation des uploads (type, taille, contenu)
- [ ] Rate limiting sur les endpoints sensibles

**Dependencies Checklist**
- [ ] Mise à jour des packages vulnérables
- [ ] Configuration Dependabot/Renovate
- [ ] Process de revue des dépendances
- [ ] Documentation des versions approuvées
