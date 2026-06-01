# Architecture Claude Craft Enterprise

**Version :** 1.0.0  
**Date :** 15 avril 2026  
**Statut :** Spécification technique — implémentation Phase 4 P4-31

## 1. Vue d'Ensemble

Claude Craft adopte une architecture **open-core** avec deux dépôts distincts :

- **`claude-craft`** (public, MIT) : Framework complet avec BMAD, 11 stacks, skills, agents, CLI, QA Recette, plugin system.
- **`claude-craft-enterprise`** (privé, licence commerciale) : Extensions propriétaires (SSO, audit log, multi-tenant dashboard, SLA).

**Principe clé :** Le core MIT est **complet et autonome**. Enterprise apporte des fonctionnalités optionnelles pour les grandes organisations, mais n'est pas requis pour un usage en production.

## 2. Séparation des Dépôts

### 2.1 Option A : Monorepo Privé avec Sub-tree Public (Recommandé)

```
Monorepo privé (claude-craft-mono)
├── packages/
│   ├── core/                    → sub-tree sync vers claude-craft (public MIT)
│   ├── enterprise-sso/          → privé
│   ├── enterprise-audit/        → privé
│   ├── enterprise-dashboard/    → privé
│   └── enterprise-support/      → privé
├── tools/
│   └── license-validator/       → privé
└── .github/workflows/
    ├── sync-public.yml          → CI sub-tree push vers claude-craft
    └── release-enterprise.yml   → Build + publish enterprise NPM privé
```

**Avantages :**
- Un seul point de développement (DX optimale)
- Atomic commits cross-packages
- CI/CD unifié

**Inconvénients :**
- Complexité sub-tree (git subtree push --prefix=packages/core claude-craft main)
- Risque de leak accidentel de code privé

### 2.2 Option B : Dépôts Séparés avec CI Cross-Repo

```
claude-craft (public MIT)
└── .github/workflows/notify-enterprise.yml  → webhook vers claude-craft-enterprise

claude-craft-enterprise (privé)
├── packages/
│   ├── sso/
│   ├── audit/
│   ├── dashboard/
│   └── support/
├── tools/license-validator/
└── .github/workflows/
    ├── sync-core.yml            → git submodule update
    └── release.yml
```

**Avantages :**
- Séparation stricte (aucun risque de leak)
- Permissions GitHub granulaires

**Inconvénients :**
- Synchronisation manuelle core updates
- Deux CI/CD à maintenir

**Recommandation :** **Option A (monorepo)** pour Phase 4 (équipe petite, vélocité prioritaire). Migrer vers Option B si leak devient un risque majeur (> 10 FTE).

## 3. Mécanisme de Chargement des Modules Enterprise

### 3.1 Plugin Loader

Le CLI `claude-craft` détecte la présence d'une **Clé de Licence valide** et charge dynamiquement les modules Enterprise s'ils sont installés.

```javascript
// packages/core/src/plugin-loader.js
import { validateLicense } from '@claude-craft/license-validator';

async function loadEnterprisePlugins() {
  const licenseKey = process.env.CLAUDE_CRAFT_LICENSE_KEY 
                     || await readLicenseFile('~/.claude-craft/license.key');

  if (!licenseKey) {
    console.log('No enterprise license found. Running with MIT features only.');
    return;
  }

  const license = await validateLicense(licenseKey);
  if (!license.valid) {
    console.error('Invalid or expired license. Enterprise features disabled.');
    return;
  }

  // Charger les modules enterprise selon les features activées
  if (license.features.includes('sso')) {
    await import('@claude-craft-enterprise/sso');
  }
  if (license.features.includes('audit-log')) {
    await import('@claude-craft-enterprise/audit');
  }
  // etc.

  console.log(`Enterprise features activated: ${license.features.join(', ')}`);
}
```

### 3.2 Architecture License Validator

Le module `@claude-craft/license-validator` (open-source, dans le core) vérifie les clés sans communiquer avec un serveur (offline-first).

```
┌─────────────────────────────────────────────────────────────────┐
│                     License Key Flow                            │
└─────────────────────────────────────────────────────────────────┘

1. Customer souscrit via Stripe → event "checkout.session.completed"
       ↓
2. Webhook Stripe → /api/stripe/webhook
       ↓
3. Serveur génère JWT signé RS256 :
   {
     "sub": "customer_1234",
     "seats": 10,
     "tier": "Pro",
     "features": ["sso", "audit-log", "priority-support"],
     "exp": 1714521600,  // 1 an
     "iat": 1682985600
   }
   Signé avec clé privée RS256 (stockée dans vault)
       ↓
4. JWT envoyé par email au customer
       ↓
5. Customer exécute : claude-craft license activate <JWT>
       ↓
6. CLI stocke JWT dans ~/.claude-craft/license.key
       ↓
7. Au démarrage CLI : validateLicense() vérifie signature avec clé publique
   (embarquée dans @claude-craft/license-validator)
       ↓
8. Si signature valide + exp > now → load enterprise plugins
```

### 3.3 Clé Publique Embarquée

La clé publique RS256 est embarquée dans le code (packages/core/keys/license-public.pem). Rotation annuelle avec backward compatibility (vérifier plusieurs clés publiques si nécessaire).

```javascript
// packages/core/src/license-validator.js
import jwt from 'jsonwebtoken';
import fs from 'fs';

const PUBLIC_KEY_V1 = fs.readFileSync('./keys/license-public-v1.pem', 'utf8');
const PUBLIC_KEY_V2 = fs.readFileSync('./keys/license-public-v2.pem', 'utf8'); // Rotation 2027

export async function validateLicense(token) {
  try {
    // Essayer clé v2 (actuelle)
    const decoded = jwt.verify(token, PUBLIC_KEY_V2, { algorithms: ['RS256'] });
    return { valid: true, ...decoded };
  } catch (err) {
    // Fallback clé v1 (compatibilité licenses anciennes)
    try {
      const decoded = jwt.verify(token, PUBLIC_KEY_V1, { algorithms: ['RS256'] });
      return { valid: true, ...decoded };
    } catch {
      return { valid: false, error: 'Invalid signature or expired license' };
    }
  }
}
```

## 4. Révocation de Licences

### 4.1 Certificate Revocation List (CRL)

Un fichier CRL est téléchargé **quotidiennement** par le CLI (cache local 24h) depuis https://license.claude-craft.dev/crl.json.

```json
{
  "version": 1,
  "updated_at": "2026-04-15T10:00:00Z",
  "revoked": [
    {
      "customer_id": "customer_1234",
      "revoked_at": "2026-04-10T08:00:00Z",
      "reason": "non-payment"
    }
  ]
}
```

Le CLI vérifie si le `sub` (customer_id) du JWT est dans la CRL. Si oui, désactiver les features enterprise.

```javascript
async function checkRevocation(license) {
  const crl = await fetchCRL(); // Cache 24h
  const revoked = crl.revoked.find(r => r.customer_id === license.sub);
  if (revoked) {
    return { valid: false, error: `License revoked: ${revoked.reason}` };
  }
  return { valid: true };
}
```

### 4.2 Offline-First vs Revocation Lag

**Trade-off :** Vérification offline permet de fonctionner sans internet, mais la révocation a un lag de max 24h (durée du cache CRL).

**Mitigation :** Pour les clients à risque (impayés récurrents), forcer la vérification online via flag `--require-online-license-check` dans le contrat Enterprise.

## 5. Diagrammes

### 5.1 Flux de Génération de Clé

```
┌──────────┐     1. Checkout         ┌──────────────┐
│ Customer ├─────────────────────────>│ Stripe       │
└──────────┘                          └──────┬───────┘
                                             │
                                             │ 2. Webhook
                                             ▼
                                      ┌──────────────┐
                                      │ License API  │
                                      │ /webhook     │
                                      └──────┬───────┘
                                             │
                                             │ 3. Generate JWT
                                             ▼
                                      ┌──────────────┐
                                      │ Vault        │
                                      │ (private key)│
                                      └──────┬───────┘
                                             │
                                             │ 4. Sign JWT RS256
                                             ▼
                                      ┌──────────────┐
                                      │ Email Service│
                                      └──────┬───────┘
                                             │
                                             │ 5. Send JWT to customer
                                             ▼
                                      ┌──────────────┐
                                      │ Customer     │
                                      │ (receives    │
                                      │  license key)│
                                      └──────────────┘
```

### 5.2 Flux de Vérification Runtime

```
┌──────────────┐
│ CLI Startup  │
└──────┬───────┘
       │
       │ 1. Read ~/.claude-craft/license.key
       ▼
┌────────────────────┐
│ License Validator  │
│ (offline)          │
└──────┬─────────────┘
       │
       │ 2. Verify JWT signature with embedded public key
       ▼
┌────────────────────┐     NO    ┌────────────────────┐
│ Signature valid?   ├───────────>│ Disable Enterprise │
└──────┬─────────────┘            └────────────────────┘
       │ YES
       │ 3. Check expiration (exp claim)
       ▼
┌────────────────────┐     NO    ┌────────────────────┐
│ Not expired?       ├───────────>│ Disable Enterprise │
└──────┬─────────────┘            └────────────────────┘
       │ YES
       │ 4. Fetch CRL (cache 24h)
       ▼
┌────────────────────┐
│ Download CRL       │
│ (daily cache)      │
└──────┬─────────────┘
       │
       │ 5. Check if customer_id in revoked list
       ▼
┌────────────────────┐     YES   ┌────────────────────┐
│ Revoked?           ├───────────>│ Disable Enterprise │
└──────┬─────────────┘            └────────────────────┘
       │ NO
       │ 6. Load Enterprise plugins
       ▼
┌────────────────────┐
│ Enterprise Active  │
└────────────────────┘
```

## 6. Stratégie de Build et Publication

### 6.1 CI/CD Public (claude-craft)

```yaml
# .github/workflows/release.yml (claude-craft public)
name: Release MIT Core
on:
  push:
    tags:
      - 'v*'

jobs:
  publish-npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 6.2 CI/CD Privé (claude-craft-enterprise)

```yaml
# .github/workflows/release-enterprise.yml (privé)
name: Release Enterprise
on:
  push:
    tags:
      - 'enterprise-v*'

jobs:
  publish-private-npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npm publish --registry https://npm.pkg.github.com/
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Publication :** Enterprise packages publiés sur GitHub Packages (privé, auth requise). Customers reçoivent un `.npmrc` avec token d'accès.

```
# .npmrc (fourni au customer)
@claude-craft-enterprise:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_ENTERPRISE_TOKEN}
```

## 7. Risques et Mitigations

### 7.1 Risque : Jailbreak de License

**Menace :** Un attaquant pourrait bypasser la vérification de licence en modifiant le code du CLI.

**Mitigations :**

1. **Code obfuscation** pour le license-validator (Webpack + Terser aggressive).
2. **Integrity checks** : le CLI vérifie son propre hash au démarrage (détecte modifications).
3. **Telemetry** (opt-in) : détecter les licenses frauduleuses (même customer_id utilisé sur > seats autorisés).
4. **Legal recourse** : clause anti-circumvention dans LICENSE-ENTERPRISE.md.

**Réalité :** Open-source = impossible de bloquer techniquement. Focus sur la **valeur perçue** (support, mises à jour, compliance) plutôt que DRM.

### 7.2 Risque : Offline-First vs Revocation Lag

**Menace :** Un client peut continuer à utiliser Enterprise pendant 24h après révocation (cache CRL).

**Mitigations :**

1. **Grace period explicite** dans le contrat (72h après non-paiement avant révocation).
2. **Clients à risque** : flag `--require-online-check` dans le contrat.
3. **Monitoring** : alerter si un customer_id révoqué est détecté dans telemetry.

### 7.3 Risque : Clé Privée Compromise

**Menace :** Si la clé privée RS256 est volée, un attaquant peut générer des licenses frauduleuses.

**Mitigations :**

1. **Vault** : clé privée stockée dans HashiCorp Vault ou AWS Secrets Manager, jamais en clair.
2. **Rotation annuelle** : générer une nouvelle paire de clés chaque année, backward compatibility pendant 12 mois.
3. **Monitoring** : détecter pics anormaux de nouvelles licenses activées.
4. **Révocation d'urgence** : publier une CRL complète si compromise détectée.

## 8. Alternatives Considérées

### 8.1 License Server Online Toujours Requis

**Rejeté :** Incompatible avec le workflow dev offline (avions, trains, zones blanches). Expérience utilisateur dégradée.

### 8.2 Hardware Dongles (USB)

**Rejeté :** Coût prohibitif (€50-100/dongle), logistique complexe (shipping international), incompatible remote work.

### 8.3 Node-Locked Licenses (MAC address)

**Rejeté :** Problématique pour CI/CD (agents éphémères), Docker (MAC change), cloud VMs.

### 8.4 Blockchain-Based Licensing (NFTs)

**Rejeté :** Overkill, coûts de gas, volatilité crypto, complexité UX.

## 9. Roadmap Technique

| Milestone | Deadline | DoD |
|-----------|----------|-----|
| **M1 : License Validator** | Semaine 1 | JWT RS256 + CRL fetch + tests unitaires |
| **M2 : Plugin Loader** | Semaine 2 | Dynamic import enterprise modules + fallback MIT |
| **M3 : Stripe Integration** | Semaine 3 | Webhook → generate JWT → email customer |
| **M4 : CLI License Commands** | Semaine 4 | `license activate`, `license info`, `license renew` |
| **M5 : CRL Infra** | Semaine 5 | API `/crl.json`, admin dashboard révocation |
| **M6 : CI/CD Privé** | Semaine 6 | Build + publish enterprise packages GitHub Packages |
| **M7 : Security Audit** | Semaine 7-8 | Pentest license mechanism, code review |

**Phase 4 Total :** 80h (P4-31), inclut tests, docs, review sécurité.

## 10. Références

- **GitLab Open-Core :** https://about.gitlab.com/solutions/open-source/
- **Sentry Licensing :** https://github.com/getsentry/sentry/blob/master/LICENSE
- **JWT Best Practices :** https://datatracker.ietf.org/doc/html/rfc8725
- **SLSA Provenance :** https://slsa.dev/spec/v1.0/provenance

---

**Auteur :** The Bearded Bear SAS — Architecture Team  
**Reviewers :** `@security-auditor`, `@tech-lead`, Legal counsel  
**Dernière mise à jour :** 15 avril 2026
