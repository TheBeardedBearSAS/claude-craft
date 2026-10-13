# Sécurité — Paperclip

> Paperclip orchestre des agents qui dépensent des tokens, appellent des API externes, et agissent au nom d'une entreprise. Les échecs de sécurité ici sont **des échecs de gouvernance** : drainages silencieux de budget, actions non autorisées, secrets divulgués. Traitez-les en conséquence.
>
> Stack observée : server + CLI + UI, **Better Auth** pour l'authentification, PostgreSQL pour la persistance.

## Vue d'ensemble du modèle de menace

| Actif | Menaces principales |
|---|---|
| Secrets d'entreprise (clés API, identifiants externes) | Exfiltration via logs, erreurs, ou fuites plugin |
| Budgets de tokens | Dépassement silencieux, contournement de l'application plateforme |
| Barrières d'approbation | Contournement (agent s'exécute avant résolution de l'approbation) |
| Journal d'activité | Altération, événements forgés |
| Multi-tenant (isolation par entreprise) | Lectures cross-company sur la même instance |
| Isolation runtime agent | Un processus agent malveillant s'échappant de son workspace |
| Plugins | Capacités sur-scopées, exfil via HTTP déclaré |

---

## OWASP Top 10 (2025) — Focus Paperclip

| # | Focus |
|---|---|
| 1 — Broken Access Control | Chaque endpoint scopé par `companyId` dérivé de la session. Capacités adaptateur / plugin appliquées côté hôte (`CapabilityDeniedError`). |
| 2 — Cryptographic Failures | Secrets chiffrés au repos avec chiffrement authentifié. TLS 1.3 pour tout endpoint public. Mots de passe — si utilisés — via la stratégie de hachage Better Auth (classe argon2id). |
| 3 — Injection | Requêtes paramétrées uniquement. Validation Zod aux frontières (config, RPC, HTTP). Pas de construction de chaînes SQL brutes. |
| 4 — Insecure Design | Budgets appliqués au dispatch, pas côté client. Approbations sont des barrières synchrones. |
| 5 — Security Misconfiguration | Pas de credentials admin par défaut. CSP + HSTS sur l'UI. |
| 6 — Software Supply Chain | Barrière `pnpm audit`, `packageManager` épinglé (`pnpm@9.15.x`), `pnpm-lock.yaml` committé, `pnpm.patchedDependencies` documenté. |
| 7 — Mishandling Exceptions | Erreurs domaine loggées comme activité. Stack traces ne traversent jamais la frontière API en prod. |

---

## Authentification — Better Auth

- L'auth utilisateur est gérée par [Better Auth](https://better-auth.com). Configurer un `BETTER_AUTH_SECRET` fort (au moins 32 octets d'entropie) par environnement. **Jamais** réutiliser les secrets entre environnements.
- Sessions : cookies HTTP-only, `Secure`, `SameSite=Strict` en production. Expiration idle + absolue selon défauts Better Auth — resserrer si nécessaire.
- Bootstrap CEO : `paperclipai auth-bootstrap-ceo` crée l'opérateur initial. Révoquer après onboarding.

---

## Secrets

- Les secrets vivent dans un store dédié et sont référencés par **référence de secret** (`secretRef`) dans les configs, pas par valeur.
- Les plugins / adaptateurs ne voient jamais les valeurs de secrets brutes — ils appellent `ctx.secrets.resolve(ref)` (plugins) ou s'appuient sur l'env injectée au runtime (adaptateurs pour processus agents).
- Rédaction de logs : tout champ dont la clé correspond à `/key|token|secret|password|authorization|cookie/i` est caviardé avant logging.
- Jamais committer de fichiers `.env`. `.env.example` uniquement.

---

## Barrières d'approbation

- Les enregistrements d'approbation sont des entités domaine de première classe (routes `/approvals`).
- Une action d'agent qui requiert approbation **doit** attendre une décision plateforme. Le serveur est l'arbitre.
- Les décisions d'approbation sont des événements en ajout seul ; pas de mise à jour en place sur une approbation décidée.
- Pas d'auto-approbation (l'agent demandeur n'est jamais l'approbateur).
- Les plugins peuvent réagir aux événements d'approbation via `ctx.events.on("approval.decided", ...)` mais ne peuvent pas décider les approbations eux-mêmes.

---

## Budgets

- Les budgets sont des **limites dures** appliquées par le serveur au dispatch.
- Quand un budget est atteint, le serveur rejette l'action suivante avec une erreur domaine. Les adaptateurs voient l'erreur ; ils ne calculent pas la vérification.
- Chaque événement de coût est persisté et visible dans le journal d'activité et tableau de bord.

---

## Multi-tenant

- Chaque ressource est scopée par `companyId`. Les endpoints dérivent `companyId` de la session ou du chemin URL (`/companies/:companyId/...`), **jamais** d'un corps client de confiance.
- Les lectures cross-company sont rejetées et loggées.
- Les plugins reçoivent des entités scopées à l'entreprise pour laquelle ils sont autorisés.

---

## Plugins — Capacités

- Les plugins déclarent les capacités requises dans le manifeste (`PaperclipPluginCapability`).
- L'hôte applique les capacités. Capacité manquante → `CapabilityDeniedError` au moment de l'appel.
- Demander uniquement les capacités dont vous avez besoin. Demander `network` ou `filesystem` largement est un drapeau rouge en revue.

---

## Headers de sécurité HTTP (UI)

Livrer sur les réponses UI :

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

Ajuster les sources script/style CSP si l'UI requiert des CDN spécifiques ; sinon garder `'self'` uniquement.

---

## Supply Chain

- `pnpm install --frozen-lockfile` en CI.
- `pnpm audit --audit-level=high` en CI ; faire échouer le build sur high / critical.
- `packageManager` épinglé dans `package.json`.
- `pnpm.patchedDependencies` gardé en sync avec `patches/` et revu quand le package de base change.
- Considérer la génération SBOM (CycloneDX) et la signature Sigstore des packages publiés (`@paperclipai/plugin-sdk`, packages adaptateurs).

---

## Logging & Audit

- **Logger** (comme événements d'activité structurés) : embauche d'agent, approbations, changements budget, événements coût, installations/upgrades plugin, écritures de secrets (métadonnées uniquement, jamais valeurs).
- **Jamais logger** : valeurs de secrets, corps de requête complets contenant des secrets, tokens de session complets.
- Le journal d'activité est en ajout seul. L'appliquer au niveau DB si possible (triggers, permissions).

---

## Réponse aux incidents

- **Kill switch par entreprise** — mettre en pause tous les agents pour cette entreprise (exposé dans CLI + UI).
- **Désactivation plugin** — `paperclipai plugin disable <id>` arrête un plugin défaillant sans le désinstaller.
- **Export audit** — export par entreprise de l'activité + approbations + coûts pour revue post-incident.

---

## Checklist

- [ ] Tous les endpoints scopés par `companyId` depuis session ou path — jamais depuis corps client
- [ ] `BETTER_AUTH_SECRET` unique par environnement, ≥ 32 octets entropie
- [ ] Secrets jamais loggés, accédés via `ctx.secrets.resolve(ref)` (plugins)
- [ ] Barrières d'approbation appliquées uniquement côté serveur
- [ ] Budgets sont limites dures (test CI applique le refus à la frontière)
- [ ] Manifeste plugin déclare uniquement les capacités réellement nécessaires
- [ ] Headers CSP + HSTS + COOP + CORP livrés sur UI
- [ ] `pnpm audit` `high` propre
- [ ] Journal d'activité en ajout seul, appliqué DB où possible
- [ ] Kill switch + désactivation plugin testés

## Notes de mise à jour : changements cassants (2026.916.0 à 2026.1012.0)

Vérifié sur les notes de version GitHub officielles (paperclipai/paperclip).

- **2026.916.0** : les API d'agent ne renvoient plus les identifiants en clair (les bindings `plain` sont masqués : utiliser `secretRef`, ne jamais relire un secret) ; les « cheap model profiles » sont supprimés (la migration `0236` retire les `modelProfiles` stockés) ; `X-Forwarded-Host` n'est pris en compte que si le pair direct passe `TRUST_PROXY` (à définir derrière un reverse proxy, sinon l'en-tête `Host` brut est utilisé) ; l'option de connexion REST legacy Anthropic est retirée (les connexions d'outils REST sont validées comme REST).
- **2026.1001.0** : le broker Composio legacy est retiré (pas de migration automatique ; remplacement : Composio Connect derrière le flag `enableMcpAggregators`). Les harnesses d'exécution passent **en full auto par défaut** : ACPX/Claude `approve-all`, OpenCode `allow`, Codex `never` (aucune pause d'approbation). Pour conserver les garde-fous d'approbation côté fournisseur, définir explicitement un mode restrictif par agent : `acpxPermissionMode` (`approve-paperclip`, `approve-reads` ou `deny-all`) ou `opencodePermissionMode` (`ask` ou `deny`). Les approbations gouvernées de Paperclip restent appliquées.
- **2026.1005.0** : `PAPERCLIP_CLOUD_UI_SNIPPET` / `PAPERCLIP_CLOUD_UI_SNIPPET_B64` n'injectent plus de HTML (migrer l'intégration vers une contribution UI de plugin) ; une @-mention dans un commentaire de tâche ne sert que de contexte et ne lance plus de run (seules l'assignation explicite ou les demandes de revue le font).
- **2026.1012.0** : les verrous de restauration de workspace sont désormais des verrous de fichier SQLite sous `<instance root>/locks/directory-merge/` : arrêter tous les anciens processus serveur et worker avant de mettre à jour ou de revenir en arrière ; les tool grants à sélecteurs inconnus ou à restrictions mal formées refusent désormais l'accès (revoir les grants personnalisés).

---

**Dernière mise à jour :** 2026-04 | **Version :** 2.0.0 | **Auteur :** The Bearded CTO
