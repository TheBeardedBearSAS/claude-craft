# Vérification Sécurité Flutter

## Argumente

$ARGUMENTS

## MISSION

Tu es un expert Flutter chargé d'auditer la sécurité du projet selon les meilleures pratiques.

### Étape 1 : Analyse des fichiers sensibles

- [ ] Examiner `pubspec.yaml` pour les dépendances de sécurité
- [ ] Rechercher les fichiers de configuration (`.env`, `config.dart`)
- [ ] Référencer les règles depuis `/rules/11-security.md`
- [ ] Vérifier `.gitignore` pour les secrets
- [ ] Scanner les fichiers Dart pour credentials hardcodés

### Étape 2 : Vérifications Sécurité (25 points)

#### 2.1 Gestion des secrets (8 points)
- [ ] **Pas de secrets hardcodés** dans le code (0-4 pts)
  - Rechercher : API keys, tokens, passwords, URLs sensibles
  - Commande : `grep -r -E "(api[_-]?key|token|password|secret)" lib/ --include="*.dart"`
  - Exemples à éviter :
    ```dart
    ❌ const apiKey = "sk_live_123abc";
    ❌ final password = "admin123";
    ```
- [ ] **Variables d'environnement** utilisées (0-2 pts)
  - Package `flutter_dotenv` ou `envied`
  - Fichier `.env` dans `.gitignore`
  - Fichier `.env.example` committé
- [ ] **Stockage sécurisé** avec flutter_secure_storage (0-2 pts)
  - Pour tokens, credentials utilisateur
  - Pas de SharedPreferences pour données sensibles

#### 2.2 Communication réseau (6 points)
- [ ] **HTTPS obligatoire** pour toutes les API (0-3 pts)
  - Pas de `http://` en production
  - Certificate pinning pour APIs critiques
  - Vérifier les appels Dio/http
- [ ] **Validation des certificats** SSL/TLS (0-2 pts)
  - Pas de `badCertificateCallback` qui accepte tout
  - Trust anchor correctement configuré
- [ ] **Timeout configurés** pour éviter DoS (0-1 pt)

#### 2.3 Données sensibles (5 points)
- [ ] **Chiffrement des données locales** (0-2 pts)
  - flutter_secure_storage pour credentials
  - Hive/SQLite avec encryption pour PII
- [ ] **Pas de logs sensibles** (0-2 pts)
  - Pas de `print()` avec tokens, emails, passwords
  - Logger configuré pour filtrer données sensibles
  - Exemples à éviter :
    ```dart
    ❌ print('User password: $password');
    ❌ debugPrint('API Response: $token');
    ```
- [ ] **Obfuscation du code** en release (0-1 pt)
  - `flutter build --obfuscate --split-debug-info`

#### 2.4 Permissions et accès (3 points)
- [ ] **Permissions minimales** Android/iOS (0-2 pts)
  - AndroidManifest.xml : seulement nécessaires
  - Info.plist : justifications NSUsage*Description
- [ ] **Validation des entrées utilisateur** (0-1 pt)
  - Pas d'injection dans queries
  - Sanitization des inputs

#### 2.5 Dépendances (3 points)
- [ ] **Packages à jour** sans vulnérabilités connues (0-2 pts)
  - Commande : `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub outdated`
  - Vérifier sur pub.dev les security advisories
- [ ] **Audit des dépendances** tierces (0-1 pt)
  - Pas de packages abandonnés
  - Sources fiables (pub.dev vérifié)

### Étape 3 : Scans automatisés

```bash
# Scanner les secrets hardcodés
docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "
  grep -r -n -E '(api[_-]?key|token|password|secret|credential).*[=:]\s*[\"'\''][^\"'\'']+[\"'\'']' lib/ || echo 'Aucun secret trouvé'
"

# Vérifier HTTPS
docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "
  grep -r -n 'http://' lib/ --include='*.dart' || echo 'Pas de HTTP trouvé'
"

# Lister les packages sensibles
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub deps --style=compact
```

### Étape 4 : Calcul du score

```
SCORE SÉCURITÉ = Total des points / 25

Interprétation :
✅ 20-25 pts : Sécurité excellente
⚠️ 15-19 pts : Sécurité correcte, vigilance requise
⚠️ 10-14 pts : Sécurité à renforcer
❌ 0-9 pts : Vulnérabilités critiques
```

### Étape 5 : Rapport détaillé

Génère un rapport avec :

#### 📊 SCORE SÉCURITÉ : XX/25

#### ✅ Points forts
- Bonnes pratiques de sécurité détectées
- flutter_secure_storage utilisé
- HTTPS configuré

#### ⚠️ Points d'attention
- Packages à mettre à jour
- Permissions trop larges
- Logs potentiellement sensibles

#### ❌ Vulnérabilités critiques

**SECRETS HARDCODÉS DÉTECTÉS :**
```
❌ lib/config/api_config.dart:5
  const apiKey = "sk_live_abc123xyz";

❌ lib/services/auth_service.dart:12
  final baseUrl = "http://api.example.com"; // HTTP au lieu de HTTPS
```

**STOCKAGE NON SÉCURISÉ :**
```
❌ lib/repositories/auth_repository.dart:23
  await prefs.setString('auth_token', token); // SharedPreferences pour token
```

#### 🔒 Recommandations de sécurité

1. **Migrer les secrets vers .env**
   ```dart
   // ✅ Bon
   final apiKey = dotenv.env['API_KEY'];
   ```

2. **Utiliser flutter_secure_storage**
   ```dart
   // ✅ Bon
   final storage = FlutterSecureStorage();
   await storage.write(key: 'token', value: token);
   ```

3. **Forcer HTTPS**
   ```dart
   // ✅ Bon
   final dio = Dio(BaseOptions(
     baseUrl: 'https://api.example.com',
     validateStatus: (status) => status! < 500,
   ));
   ```

#### 🎯 TOP 3 ACTIONS PRIORITAIRES

1. **[PRIORITÉ CRITIQUE]** Supprimer tous les secrets hardcodés et migrer vers .env (Impact : sécurité données)
2. **[PRIORITÉ HAUTE]** Remplacer SharedPreferences par flutter_secure_storage pour tokens (Impact : vol de credentials)
3. **[PRIORITÉ MOYENNE]** Activer certificate pinning pour APIs de production (Impact : MITM attacks)

---

**⚠️ ATTENTION** : Ne jamais commiter de secrets ! Vérifier `.gitignore` et utiliser `git-secrets` ou `truffleHog`.

**Note** : Ce rapport se concentre uniquement sur la sécurité. Pour un audit complet, utilisez `/check-compliance`.
