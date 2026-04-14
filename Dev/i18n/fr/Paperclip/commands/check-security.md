---
description: Audit de sécurité Paperclip
argument-hint: [chemin-projet]
---

# Audit de sécurité Paperclip

## MISSION

Examiner l'isolation de tenancy, la gestion des secrets, les barrières d'approbation, l'application des budgets, le canal d'adaptateur, les en-têtes HTTP et la chaîne d'approvisionnement.

## Procédure

### 1. Isolation de tenant

- [ ] Aucun endpoint ne reçoit `companyId` depuis le corps / la chaîne de requête du client — il dérive toujours de la session authentifiée
- [ ] Chaque requête de repository filtre par `companyId`
- [ ] Un test d'intégration d'isolation inter-tenants existe par module
- [ ] Le journal d'audit capture les tentatives inter-tenants rejetées

Grep pour les patterns suspects : `req.body.companyId`, `req.query.companyId`, `WHERE company_id = $1` sans vérification de provenance.

### 2. Secrets

- [ ] La colonne de table `secrets` utilise le chiffrement authentifié (AES-256-GCM) avec clé maître issue de KMS ou d'env
- [ ] Les secrets sont livrés aux adaptateurs au moment de l'invocation, pas au démarrage
- [ ] Aucune valeur de secret n'apparaît dans aucun message de log (scan regex des échantillons de logs stockés)
- [ ] `.env` n'est pas dans git ; `.env.example` l'est
- [ ] La procédure de rotation de clé de chiffrement de secrets est documentée (spécifique à l'environnement, jamais réutilisée)

### 3. Barrières d'approbation

- [ ] Les décisions d'approbation vivent dans la table `approvals`, append-only (vérifier avec un trigger DB ou migration)
- [ ] Aucun chemin de code ne permet à un adaptateur d'exécuter une action avec `requires_approval` avant que le plan de contrôle ne retourne `approved`
- [ ] Pas d'auto-approbation (l'agent demandeur ne peut pas être l'approbateur)

### 4. Budgets (limites strictes)

- [ ] Un test existe qui vérifie que `BUDGET_EXCEEDED` est retourné quand un agent dépasse son budget
- [ ] Aucun chemin de code n'incrémente la consommation au-delà de `budgetTokens` silencieusement
- [ ] Les changements de budget émettent des événements d'activité

### 5. Sandbox de plugin & frontières d'adaptateur

- [ ] Chaque plugin installé ne déclare que les capacités dont il a réellement besoin (examiner le manifeste par rapport à son code)
- [ ] Les appels `ctx.http` passent par le client contrôlé par l'hôte (pas de `fetch` / `axios` brut introduit en contrebande)
- [ ] Les valeurs de config de plugin viennent de `ctx.config.get()` ; pas de lectures depuis `process.env` au runtime
- [ ] Les adaptateurs ne contiennent aucune logique de gouvernance — spawn + supervise uniquement
- [ ] Les endpoints publics s'exécutent derrière TLS 1.3 (terminer au niveau d'un proxy inverse si nécessaire)

### 6. En-têtes HTTP (réponses UI web)

Vérifier les en-têtes fournis :
- `Content-Security-Policy` (pas de `unsafe-inline` pour les scripts)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Permissions-Policy` présent

### 7. Authentification

- [ ] Mots de passe hachés avec Argon2id (128 MiB RAM, t=3, p=1)
- [ ] Cookies de session `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] JWT (si utilisé) — EdDSA / Ed25519, expiration 15 minutes, DPoP sur endpoints sensibles

### 8. Chaîne d'approvisionnement

- [ ] `pnpm audit --audit-level=high` propre
- [ ] `packageManager` épinglé dans `package.json`
- [ ] Allowlist `pnpm.onlyBuiltDependencies` présente
- [ ] Les releases d'Adapter SDK signées avec Sigstore (vérifier avec `cosign`)

### 9. Réponse aux incidents

- [ ] Kill switch à l'échelle de l'entreprise testé
- [ ] La révocation d'adaptateur invalide les signatures immédiatement
- [ ] Export d'audit par entreprise disponible (JSON + manifeste signé)

## Sortie

Rapport Markdown avec passe/échoue par section, sévérité (Bloquant / Majeur / Mineur), références CVE si pertinent, et un score /20 pour `/paperclip:check-compliance`.
