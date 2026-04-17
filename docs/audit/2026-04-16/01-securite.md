# Sécurité — Audit Claude Craft v8.1.0

**Date** : 2026-04-16
**Auditeur** : Security Auditor Agent (multi-pass)
**Score global** : 7.5/10

---

## Résumé exécutif

Claude Craft présente une posture sécurité globalement solide pour un framework de prompts/configuration. Le Kanban server implémente des protections CSRF, path traversal et readonly mode. La supply chain bénéficie de SBOM CycloneDX et SLSA L3 provenance. L'installation RTK vérifie les checksums SHA256. Cependant, des lacunes significatives existent : les hooks de sécurité sont contournables, les regex de filtrage sont incomplètes, les dépendances ne sont pas épinglées, et les permissions locales sont trop larges.

---

## Métriques clés

| Métrique | Valeur |
|----------|--------|
| Vulnérabilités critiques | 1 |
| Vulnérabilités majeures | 5 |
| Vulnérabilités mineures | 6 |
| Informatives | 4 |
| Score supply chain | 8/10 |
| Score Kanban server | 8.5/10 |
| Score hooks sécurité | 5/10 |
| Dépendances production | 11 |
| Secrets exposés dans le code | 0 |

---

## Constats détaillés

### Hooks de sécurité (.claude/settings.json)

#### Constat SEC-01 : Regex de blocage de commandes dangereuses incomplète
- **Sévérité** : Majeur
- **Localisation** : `.claude/settings.json` (PreToolUse Bash hook) ; `.claude/templates/hooks/block-dangerous-commands.json`
- **Description** : La regex `(rm\s+-rf\s+/|sudo\s|chmod\s+777|mkfs\.|dd\s+if=|:\(\)\{|fork\s+bomb)` ne bloque que `rm -rf /` (avec espace obligatoire après -rf). Les variantes `rm -rf ~/`, `rm -rf ./*`, `rm --recursive --force /`, `find / -delete`, `truncate -s 0`, `shred`, `wipefs` ne sont pas bloquées.
- **Preuve** : La regex exige `rm\s+-rf\s+/` — un espace après `-rf` suivi de `/`. `rm -rf ~/Documents` ou `rm -rf ./` passent le filtre.
- **Recommandation** : Élargir la regex pour couvrir toutes les variantes destructives. Ajouter `rm\s+-r[f]*\s`, `find.*-delete`, `truncate`, `shred`, `wipefs`, `git clean -fdx /`, `docker system prune -af`.
- **Effort** : S (2h)

#### Constat SEC-02 : Hooks de sécurité contournables via encodage
- **Sévérité** : Critique
- **Localisation** : `.claude/settings.json` (tous les PreToolUse hooks)
- **Description** : Les hooks utilisent `grep -qE` sur le texte brut de la commande. Un attaquant (ou un prompt injection) pourrait contourner les filtres via : base64 encoding (`echo "cm0gLXJmIC8=" | base64 -d | sh`), variables d'environnement (`X=rm; Y=-rf; $X $Y /`), backticks ou $() substitution, heredocs, ou alias. Les hooks Claude Code ne peuvent pas prévenir ces patterns sans un parser de commandes complet.
- **Preuve** : Le pattern `echo '$TOOL_INPUT' | jq -r '.command // empty'` ne fait qu'extraire le texte — aucune analyse sémantique.
- **Recommandation** : Documenter clairement que les hooks sont une couche de défense en profondeur, pas une barrière absolue. Ajouter une regex pour les patterns d'encodage courants (`base64.*-d.*\|.*sh`, `eval`, `\$\(.*\)`). Recommander le mode permission Claude Code comme défense primaire.
- **Effort** : M (4-8h pour la documentation + regex améliorées)

#### Constat SEC-03 : Protection des fichiers sensibles trop restrictive ET incomplète
- **Sévérité** : Mineur
- **Localisation** : `.claude/settings.json` (PreToolUse Edit/Write hooks)
- **Description** : La regex `(\\.env|\\.env\\.|credentials|secrets|private.*key|id_rsa)` bloque trop large (`credentials` matche n'importe quel fichier contenant ce mot) et pas assez large (ne bloque pas `.npmrc`, `docker-compose.override.yml` avec secrets, `*.pem`, `*.p12`, `known_hosts`).
- **Recommandation** : Affiner la regex : bloquer `.env*`, `*.key`, `*.pem`, `*.p12`, `id_*sa`, `.npmrc`, `.pypirc`. Utiliser des patterns plus spécifiques pour éviter les faux positifs.
- **Effort** : S (1-2h)

#### Constat SEC-04 : Permissions locales trop larges
- **Sévérité** : Majeur
- **Localisation** : `.claude/settings.local.json`
- **Description** : Le fichier accorde `Bash(curl:*)`, `Bash(rm:*)`, `Bash(docker:*)` sans restriction. Cela signifie que Claude Code peut exécuter `curl` vers n'importe quelle URL, supprimer n'importe quel fichier, et lancer n'importe quelle commande Docker — même si les hooks PreToolUse tentent de filtrer, le permission model de Claude Code autorise en amont.
- **Preuve** : `"Bash(rm:*)"` dans la section `permissions.allow` autorise toute commande commençant par `rm`.
- **Recommandation** : C'est un fichier `.local` (personnel, non distribué). Ajouter une note dans la documentation expliquant que les utilisateurs ne devraient PAS copier ce fichier tel quel. Proposer un `settings.local.json.example` avec des permissions minimales.
- **Effort** : S (1h)

### Kanban Server (Hono)

#### Constat SEC-05 : Protection CSRF solide
- **Sévérité** : Info (positif)
- **Localisation** : `cli/kanban/server/middleware/security.js:7-20`
- **Description** : Le middleware `csrfGuard` vérifie l'header `Origin` ou `Referer` contre une whitelist stricte (`127.0.0.1:<port>` et `localhost:<port>`). Seules les requêtes POST/PATCH/PUT/DELETE sont vérifiées. Les requêtes sans Origin/Referer sont rejetées.
- **Évaluation** : Implémentation correcte et suffisante pour un serveur local.

#### Constat SEC-06 : Protection path traversal robuste
- **Sévérité** : Info (positif)
- **Localisation** : `cli/kanban/server/middleware/security.js:28-39`
- **Description** : La fonction `resolveSafe()` utilise `path.resolve()` + `path.relative()` pour vérifier que le chemin résolu reste sous le répertoire de base. Les chemins commençant par `..` ou absolus sont rejetés.
- **Évaluation** : Pattern standard et correct. Utilisé dans l'endpoint `/api/docs/:rel`.

#### Constat SEC-07 : Absence d'authentification sur le Kanban server
- **Sévérité** : Mineur
- **Localisation** : `cli/kanban/server/app.js`
- **Description** : Le serveur Kanban n'a aucune authentification. Toute application locale peut envoyer des requêtes à `127.0.0.1:3737`. Bien que le binding localhost limite l'accès au réseau, une autre application malveillante locale pourrait modifier les statuts des stories.
- **Recommandation** : Ajouter un token CSRF aléatoire généré au démarrage, transmis au client via le HTML initial, et requis dans un header custom pour les requêtes mutantes. Alternative : bearer token affiché dans le terminal.
- **Effort** : M (4h)

#### Constat SEC-08 : Pas de rate limiting sur le Kanban server
- **Sévérité** : Mineur
- **Localisation** : `cli/kanban/server/app.js`
- **Description** : Aucun rate limiting n'est implémenté. Un script malveillant local pourrait flooder le serveur de requêtes PATCH pour modifier massivement les statuts.
- **Recommandation** : Ajouter un rate limiter basique (hono middleware) : 60 req/min pour les endpoints mutants.
- **Effort** : S (1h)

### Scripts d'installation

#### Constat SEC-09 : RTK utilise curl-to-file avec vérification checksum (positif)
- **Sévérité** : Info (positif)
- **Localisation** : `Tools/RTK/install-rtk.sh:140-203`
- **Description** : L'installation RTK télécharge le script dans un fichier temporaire (pas de pipe direct), vérifie le checksum SHA256 contre un hash hardcodé, affiche des warnings détaillés en cas de mismatch, et offre un bypass explicite (`RTK_SKIP_CHECKSUM=1`). Le fichier temporaire est créé dans `$HOME` (pas `/tmp` conformément aux règles).
- **Évaluation** : Excellente pratique de sécurité. Meilleur que 95% des installateurs similaires.

#### Constat SEC-10 : check-prerequisites.sh suggère pipe curl to bash
- **Sévérité** : Majeur
- **Localisation** : `Dev/scripts/check-prerequisites.sh:141,172`
- **Description** : Le script suggère `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -` et `curl -fsSL https://get.docker.com | sudo sh` pour installer les prérequis. Ce sont des patterns dangereux (exécution de code distant avec sudo).
- **Recommandation** : Remplacer par des instructions utilisant les package managers système (`apt install nodejs`, `snap install docker`). Si curl|sh est nécessaire, ajouter une étape de vérification de checksum comme pour RTK.
- **Effort** : S (2h)

#### Constat SEC-11 : Scripts shell sans protection contre les espaces dans les chemins
- **Sévérité** : Mineur
- **Localisation** : `Dev/scripts/install-common-rules.sh` et scripts similaires
- **Description** : Bien que `set -euo pipefail` soit utilisé, certaines variables ne sont pas systématiquement quotées, ce qui peut poser problème avec des chemins contenant des espaces.
- **Recommandation** : Audit systématique avec shellcheck level=warning. Quoter toutes les variables de chemin.
- **Effort** : S (2h)

### Supply Chain

#### Constat SEC-12 : SBOM CycloneDX et SLSA L3 provenance (positif)
- **Sévérité** : Info (positif)
- **Localisation** : `.github/workflows/sbom.yml`, `.github/workflows/slsa-provenance.yml`
- **Description** : Le projet génère un SBOM CycloneDX à chaque release (attaché aux GitHub Releases) et utilise `slsa-github-generator` pour la provenance L3. C'est conforme aux recommandations OWASP 2025 (Software Supply Chain Failures).
- **Évaluation** : Exemplaire. Rares sont les projets open-source de cette taille à implémenter SLSA L3.

#### Constat SEC-13 : Dépendances non épinglées (caret ranges)
- **Sévérité** : Majeur
- **Localisation** : `package.json` (dependencies)
- **Description** : Toutes les 11 dépendances utilisent des caret ranges (`^`). Bien que `package-lock.json` verrouille les versions exactes, une attaque de supply chain sur une dépendance mineure serait propagée lors du prochain `npm install` sans lock.
- **Preuve** : `"hono": "^4.12.14"`, `"zod": "^3.25.76"`, etc.
- **Recommandation** : Épingler les versions exactes dans `package.json` pour les dépendances critiques (hono, zod). Ou utiliser `npm audit signatures` dans le CI. Configurer Renovate/Dependabot avec auto-merge limité aux patches.
- **Effort** : S (1h)

#### Constat SEC-14 : Actions GitHub non épinglées par hash
- **Sévérité** : Majeur
- **Localisation** : `.github/workflows/*.yml`
- **Description** : Les actions GitHub utilisent des tags (`@v6`, `@v4`, `@v2`) au lieu de hashes SHA. Un tag peut être déplacé par le maintainer de l'action.
- **Preuve** : `uses: actions/checkout@v6` au lieu de `uses: actions/checkout@<sha256>`.
- **Recommandation** : Épingler les actions par hash avec commentaire de version. Utiliser `pin-github-action` ou Renovate pour automatiser.
- **Effort** : S (2h)

### Secrets et données sensibles

#### Constat SEC-15 : Aucun secret exposé dans le code
- **Sévérité** : Info (positif)
- **Localisation** : Tout le projet
- **Description** : Le grep exhaustif n'a trouvé aucune clé API, token, mot de passe ou credential dans le code. Les occurrences de "password", "secret", "token" sont toutes dans des templates de sécurité (hooks qui BLOQUENT l'accès) ou de la documentation.
- **Évaluation** : Excellent hygiène de secrets.

### Références sécurité

#### Constat SEC-16 : Règle sécurité à jour OWASP 2025
- **Sévérité** : Info (positif)
- **Localisation** : `.claude/rules/11-security.md`
- **Description** : La règle référence explicitement OWASP Top 10:2025 avec les nouvelles entrées (Software Supply Chain Failures, Mishandling of Exceptional Conditions). Recommande Argon2id (pas bcrypt), EdDSA (Ed25519) pour JWT, DPoP (RFC 9449), COOP/COEP/CORP headers.
- **Évaluation** : À la pointe des recommandations 2026.

---

## Devil's Advocate

1. **SEC-02 (contournement hooks) est-il vraiment critique ?** Les hooks Claude Code ne sont jamais conçus comme une barrière de sécurité absolue — ils sont une couche de défense en profondeur. Le vrai mécanisme de sécurité est le permission model de Claude Code lui-même. Cependant, si le framework promeut ces hooks comme "sécurité", les utilisateurs pourraient avoir un faux sentiment de sécurité.

2. **SEC-13 (caret ranges) est-il exagéré ?** Le `package-lock.json` verrouille les versions en pratique. Le risque n'existe que si un développeur supprime le lock et fait `npm install`. C'est un risque théorique pour un projet avec 11 dépendances bien maintenues.

3. **SEC-07 (pas d'auth Kanban) est-il pertinent ?** Le serveur écoute sur 127.0.0.1 uniquement et a une protection CSRF. Le risque d'accès par une application malveillante locale est faible dans un contexte de développement.

4. **Le scope de sécurité est-il proportionné ?** Claude Craft est un framework de configuration (93% markdown). Les risques réels sont limités au CLI, au Kanban server, et aux scripts d'installation. La surface d'attaque est modeste comparée à une application web traditionnelle.

---

## Recommandations priorisées

| # | Recommandation | Sévérité | Effort | Impact |
|---|---------------|----------|--------|--------|
| 1 | Élargir regex hooks de blocage (SEC-01) | Majeur | S | Haut |
| 2 | Documenter limites des hooks + ajouter regex anti-encodage (SEC-02) | Critique | M | Haut |
| 3 | Remplacer curl\|sh par apt/snap dans check-prerequisites (SEC-10) | Majeur | S | Moyen |
| 4 | Épingler actions GitHub par hash (SEC-14) | Majeur | S | Moyen |
| 5 | Épingler dépendances critiques (SEC-13) | Majeur | S | Moyen |
| 6 | Ajouter settings.local.json.example minimal (SEC-04) | Majeur | S | Moyen |
| 7 | Ajouter token auth au Kanban server (SEC-07) | Mineur | M | Faible |
| 8 | Affiner regex protection fichiers sensibles (SEC-03) | Mineur | S | Faible |
| 9 | Rate limiter Kanban server (SEC-08) | Mineur | S | Faible |
| 10 | Quoter variables shell systématiquement (SEC-11) | Mineur | S | Faible |

---

## Plan d'action

### Court terme (< 1 semaine)
- [ ] SEC-01 : Élargir regex de blocage de commandes dangereuses
- [ ] SEC-14 : Épingler actions GitHub par hash SHA
- [ ] SEC-13 : Épingler dépendances critiques dans package.json
- [ ] SEC-04 : Créer `settings.local.json.example` avec permissions minimales

### Moyen terme (1-4 semaines)
- [ ] SEC-02 : Documenter les limites des hooks + regex anti-encodage
- [ ] SEC-10 : Réécrire check-prerequisites.sh sans curl|sh
- [ ] SEC-07 : Ajouter token auth au Kanban server
- [ ] SEC-11 : Audit shellcheck complet de tous les scripts

### Long terme (> 1 mois)
- [ ] SEC-08 : Rate limiting Kanban server
- [ ] Audit sécurité tiers (pentest) avant passage en production enterprise
- [ ] Intégrer `npm audit signatures` dans le CI
- [ ] Considérer cosign/sigstore pour la signature des releases NPM

---

**Score projeté après corrections court terme** : 8.5/10
**Score projeté après corrections moyen terme** : 9.0/10
