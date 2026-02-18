---
description: Check Security React Native
argument-hint: [arguments]
---

# Check Security React Native

## Arguments

$ARGUMENTS

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Tu es un auditeur expert en sécurité React Native. Ta mission est d'analyser les pratiques de sécurité selon les standards définis dans `.claude/rules/11-security.md`.

### Étape 1 : Analyse des dépendances et configuration

1. Vérifie les dépendances de sécurité installées
2. Analyse les fichiers de configuration sensibles
3. Vérifie la présence de secrets dans le code
4. Analyse les permissions demandées

### Étape 2 : Stockage sécurisé (6 points)

#### 🔐 Expo SecureStore / Keychain

- [ ] **(2 pts)** Utilisation de `expo-secure-store` ou `react-native-keychain` pour les données sensibles
- [ ] **(1 pt)** Pas de stockage de tokens/secrets dans AsyncStorage
- [ ] **(1 pt)** Pas de stockage de mots de passe en clair
- [ ] **(1 pt)** Pas de données sensibles dans le state Redux/Zustand non persisté
- [ ] **(1 pt)** Configuration de biométrie pour accès aux données sensibles si applicable

**Fichiers à vérifier :**
```bash
src/services/storage.ts
src/utils/secureStorage.ts
src/hooks/useAuth.ts
```

Recherche les patterns dangereux :
```bash
# Chercher AsyncStorage pour données sensibles
grep -r "AsyncStorage.setItem.*token" src/
grep -r "AsyncStorage.setItem.*password" src/
grep -r "AsyncStorage.setItem.*secret" src/
```

### Étape 3 : Gestion des secrets et API keys (5 points)

#### 🔑 Pas de secrets dans le code

- [ ] **(2 pts)** Aucune API key hardcodée dans le code source
- [ ] **(1 pt)** Utilisation de variables d'environnement (`.env`, `app.config.js`)
- [ ] **(1 pt)** `.env` dans `.gitignore`
- [ ] **(1 pt)** Documentation des variables d'environnement requises (`.env.example`)

**Fichiers à vérifier :**
```bash
.env
.env.example
.gitignore
app.config.js
app.json
```

Recherche les secrets hardcodés :
```bash
# Patterns suspects
grep -rE "(api[_-]?key|secret|password|token|private[_-]?key).*=.*['\"][a-zA-Z0-9]{20,}" src/ --exclude-dir=node_modules
grep -rE "https?://[^/]*:([^@]+)@" src/ --exclude-dir=node_modules
```

**Vérifie spécifiquement :**
- Pas de clés AWS, Google, Firebase hardcodées
- Pas de tokens OAuth hardcodés
- Pas de certificats ou clés privées dans le repo

### Étape 4 : Communication réseau sécurisée (5 points)

#### 🌐 HTTPS et Certificate Pinning

- [ ] **(2 pts)** Toutes les communications en HTTPS uniquement
- [ ] **(1 pt)** Certificate pinning implémenté pour les API critiques
- [ ] **(1 pt)** Validation des certificats SSL activée
- [ ] **(1 pt)** Timeout et retry appropriés pour les requêtes

**Fichiers à vérifier :**
```bash
src/services/api.ts
src/config/network.ts
app.json (iOS NSAppTransportSecurity)
android/app/src/main/AndroidManifest.xml (android:usesCleartextTraffic)
```

Vérifie :
```typescript
// Bon : HTTPS uniquement
const API_URL = 'https://api.example.com';

// Mauvais : HTTP
const API_URL = 'http://api.example.com';
```

Pour iOS (app.json) :
```json
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": false
      }
    }
  }
}
```

Pour Android (AndroidManifest.xml) :
```xml
<!-- Doit être false ou absent -->
<application android:usesCleartextTraffic="false">
```

### Étape 5 : Authentification et autorisation (4 points)

#### 🔒 Gestion des tokens et sessions

- [ ] **(1 pt)** JWT stockés de manière sécurisée (SecureStore)
- [ ] **(1 pt)** Refresh token implémenté
- [ ] **(1 pt)** Expiration des tokens gérée
- [ ] **(1 pt)** Déconnexion automatique après inactivité (si applicable)

**Fichiers à vérifier :**
```bash
src/services/auth.ts
src/hooks/useAuth.ts
src/contexts/AuthContext.tsx
```

**Vérifie le flow :**
```typescript
// Bon pattern
const token = await SecureStore.getItemAsync('access_token');
const refreshToken = await SecureStore.getItemAsync('refresh_token');

// Mauvais pattern
const token = await AsyncStorage.getItem('access_token');
```

### Étape 6 : Permissions et données utilisateur (3 points)

#### 📱 Permissions Android/iOS

- [ ] **(1 pt)** Permissions demandées justifiées et minimales
- [ ] **(1 pt)** Demande de permissions au runtime (pas toutes au démarrage)
- [ ] **(1 pt)** Messages explicatifs pour les permissions sensibles

**Fichiers à vérifier :**
```bash
app.json (permissions iOS/Android)
android/app/src/main/AndroidManifest.xml
ios/[AppName]/Info.plist
```

**Permissions à auditer :**
- Caméra (NSCameraUsageDescription / CAMERA)
- Localisation (NSLocationWhenInUseUsageDescription / ACCESS_FINE_LOCATION)
- Contacts (NSContactsUsageDescription / READ_CONTACTS)
- Stockage (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)

### Étape 7 : Protection du code (2 points)

#### 🛡️ Obfuscation et protection

- [ ] **(1 pt)** Obfuscation activée pour les builds de production (ProGuard/R8)
- [ ] **(1 pt)** Logs sensibles désactivés en production (pas de console.log de tokens)

**Fichiers à vérifier :**
```bash
android/app/build.gradle (minifyEnabled, shrinkResources)
src/**/*.ts (console.log statements)
```

Pour Android (build.gradle) :
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

Recherche les logs sensibles :
```bash
grep -rE "console\.(log|debug|info).*token" src/
grep -rE "console\.(log|debug|info).*password" src/
grep -rE "console\.(log|debug|info).*secret" src/
```

### Étape 8 : Calcul du score

```
┌──────────────────────────────────┬─────────┬────────┐
│ Critère                          │ Score   │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Stockage sécurisé                │ XX/6    │ ✅/⚠️/❌│
│ Secrets et API keys              │ XX/5    │ ✅/⚠️/❌│
│ Communication réseau             │ XX/5    │ ✅/⚠️/❌│
│ Authentification                 │ XX/4    │ ✅/⚠️/❌│
│ Permissions                      │ XX/3    │ ✅/⚠️/❌│
│ Protection du code               │ XX/2    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL SÉCURITÉ                   │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Légende :**
- ✅ Excellent (≥ 20/25)
- ⚠️ Attention (15-19/25)
- ❌ Critique (< 15/25)

### Étape 9 : Scan de vulnérabilités

Exécute les commandes suivantes pour détecter les vulnérabilités :

#### 🔍 NPM Audit

```bash
npm audit
```

Analyse les résultats :
- **Vulnérabilités critiques :** XX (cible: 0)
- **Vulnérabilités élevées :** XX (cible: 0)
- **Vulnérabilités moyennes :** XX (cible: < 5)
- **Vulnérabilités faibles :** XX

#### 📦 Dépendances obsolètes

```bash
npm outdated
```

Liste les dépendances de sécurité obsolètes :
- `expo-secure-store`
- `react-native-keychain`
- `react-native-ssl-pinning`
- etc.

### Étape 10 : Rapport détaillé

## 📊 RÉSULTATS DE L'AUDIT SÉCURITÉ

### ✅ Points Forts

Liste les bonnes pratiques identifiées :
- [Pratique 1 avec localisation]
- [Pratique 2 avec localisation]

### 🚨 Vulnérabilités Critiques

Liste les problèmes de sécurité critiques (score immédiat ❌) :

1. **[CRITIQUE - Problème 1]**
   - **Sévérité :** CRITIQUE
   - **Localisation :** [Fichiers concernés]
   - **Risque :** [Description du risque]
   - **Exemple :**
   ```typescript
   // Code vulnérable
   const API_KEY = "sk_live_123456789abcdef"; // ❌ CRITIQUE
   ```
   - **Correction immédiate :**
   ```typescript
   // Code sécurisé
   const API_KEY = process.env.EXPO_PUBLIC_API_KEY; // ✅
   ```

### ⚠️ Points d'Amélioration

Liste les problèmes par ordre de priorité :

1. **[Problème 1]**
   - **Sévérité :** Élevé/Moyen
   - **Localisation :** [Fichiers concernés]
   - **Risque :** [Description]
   - **Recommandation :** [Action]

2. **[Problème 2]**
   - **Sévérité :** Élevé/Moyen
   - **Localisation :** [Fichiers concernés]
   - **Risque :** [Description]
   - **Recommandation :** [Action]

### 📈 Métriques de Sécurité

#### Vulnérabilités des dépendances

```
┌─────────────────────┬──────────┐
│ Sévérité            │ Nombre   │
├─────────────────────┼──────────┤
│ 🔴 Critiques        │ XX       │
│ 🟠 Élevées          │ XX       │
│ 🟡 Moyennes         │ XX       │
│ 🟢 Faibles          │ XX       │
└─────────────────────┴──────────┘
```

#### Secrets détectés

- **API keys hardcodées :** XX (cible: 0)
- **Tokens hardcodés :** XX (cible: 0)
- **Mots de passe hardcodés :** XX (cible: 0)
- **Clés privées dans le repo :** XX (cible: 0)

#### Permissions

- **Permissions totales demandées :** XX
- **Permissions sensibles :** XX
- **Permissions injustifiées :** XX (cible: 0)

#### Stockage

- **Usage de SecureStore/Keychain :** Oui/Non
- **Données sensibles dans AsyncStorage :** XX occurrences (cible: 0)
- **Biométrie configurée :** Oui/Non

#### Communication

- **Endpoints HTTP (non sécurisés) :** XX (cible: 0)
- **Endpoints HTTPS :** XX
- **Certificate pinning :** Oui/Non
- **Cleartext traffic autorisé :** Oui/Non (cible: Non)

### 🎯 TOP 3 ACTIONS PRIORITAIRES

#### 1. [ACTION SÉCURITÉ #1]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** CRITIQUE/Élevé/Moyen
- **Risque si non corrigé :** [Description du risque]
- **Description :** [Détail de la vulnérabilité]
- **Solution :** [Action concrète et code]
- **Fichiers concernés :**
  - `[fichier1]` - [problème]
  - `[fichier2]` - [problème]
- **Exemple de correction :**
```typescript
// AVANT (vulnérable)
[code vulnérable]

// APRÈS (sécurisé)
[code sécurisé]
```

#### 2. [ACTION SÉCURITÉ #2]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** CRITIQUE/Élevé/Moyen
- **Risque si non corrigé :** [Description]
- **Description :** [Détail]
- **Solution :** [Action]
- **Fichiers concernés :** [Liste]

#### 3. [ACTION SÉCURITÉ #3]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** CRITIQUE/Élevé/Moyen
- **Risque si non corrigé :** [Description]
- **Description :** [Détail]
- **Solution :** [Action]
- **Fichiers concernés :** [Liste]

---

## 🛡️ Checklist de sécurité OWASP Mobile

Référence : [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)

- [ ] **M1: Improper Platform Usage** - Utilisation correcte des APIs platform
- [ ] **M2: Insecure Data Storage** - Stockage sécurisé (SecureStore/Keychain)
- [ ] **M3: Insecure Communication** - HTTPS + Certificate Pinning
- [ ] **M4: Insecure Authentication** - Authentification robuste avec JWT
- [ ] **M5: Insufficient Cryptography** - Pas de crypto custom, utiliser les APIs platform
- [ ] **M6: Insecure Authorization** - Autorisation côté serveur validée
- [ ] **M7: Client Code Quality** - Code de qualité, obfusqué en production
- [ ] **M8: Code Tampering** - Protection contre la modification (jailbreak detection)
- [ ] **M9: Reverse Engineering** - Obfuscation et protection du code
- [ ] **M10: Extraneous Functionality** - Pas de backdoors ou logs debug en prod

---

## 🚀 Recommandations

### Actions immédiates (à faire aujourd'hui)
1. Corriger toutes les vulnérabilités CRITIQUES
2. Supprimer tous les secrets hardcodés
3. Exécuter `npm audit fix` pour les vulnérabilités auto-corrigeables

### Actions court terme (cette semaine)
1. Implémenter SecureStore pour tous les tokens
2. Activer HTTPS uniquement (bloquer HTTP)
3. Ajouter .env dans .gitignore si absent
4. Mettre à jour les dépendances vulnérables

### Actions moyen terme (ce mois)
1. Implémenter certificate pinning
2. Activer l'obfuscation en production
3. Audit complet des permissions
4. Formation de l'équipe sur les bonnes pratiques

### Outils recommandés

```bash
# Installer des outils de sécurité
npm install --save-dev @react-native-community/cli-doctor
npm audit

# Pour iOS
gem install fastlane

# Pour Android
# Utiliser ProGuard/R8 (déjà inclus)
```

---

## 📚 Références

- `.claude/rules/11-security.md` - Standards de sécurité
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)

---

**Score final : XX/25**

**⚠️ ATTENTION : Un score < 15/25 en sécurité nécessite une action immédiate avant toute mise en production.**
