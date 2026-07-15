# Cache-Control sur assets hashés — recommandation CDN

**Date** : 2026-07-15
**Statut** : Décision proposée, non implémentée
**Origine** : audit SEO — `max-age=600` sur des assets avec hash de contenu dans le nom de fichier (immuables par nature)

## État actuel vérifié

- Aucune configuration CDN présente dans le dépôt : pas de fichier `_headers`, pas de config Cloudflare (Page Rules, Cache Rules, Workers), pas de `wrangler.toml`.
- Déploiement du site (`.github/workflows/docs.yml`) : build VitePress → `actions/upload-pages-artifact` → `actions/deploy-pages`. C'est le pipeline **GitHub Pages natif**.
- GitHub Pages sert tous les assets avec des headers `Cache-Control` fixes et non configurables (`max-age=600` pour le HTML comme pour les assets hashés dans `website/dist/assets/*`). Il n'existe **aucun mécanisme natif** (pas de `_headers`, pas de config Actions) pour override ces headers sur GitHub Pages — confirmé par la documentation GitHub et l'absence de tout point d'extension dans le pipeline actuel.

## Pourquoi c'est bloqué aujourd'hui

Les assets buildés par Vite/VitePress (`website/dist/assets/*.{js,css}`) portent un hash de contenu dans leur nom de fichier (ex. `app.a1b2c3d4.js`). Par construction, ces fichiers sont immuables : un changement de contenu produit un nouveau nom de fichier. Ils devraient donc être servis avec :

```
Cache-Control: public, max-age=31536000, immutable
```

Or GitHub Pages renvoie `max-age=600` sur tout, sans distinction entre le HTML (qui doit rester à faible TTL) et les assets hashés (qui peuvent être mis en cache un an). Sans CDN devant, il n'y a pas de point d'injection de headers HTTP custom sur GitHub Pages.

## Solution recommandée : Cloudflare devant GitHub Pages (plan gratuit)

Cloudflare en mode reverse-proxy (orange cloud) sur le domaine du site permet d'appliquer des **Cache Rules** (remplaçantes des Page Rules legacy) qui overrident le `Cache-Control` en fonction du path, indépendamment de ce que renvoie l'origine GitHub Pages.

### Étapes de mise en place

1. **Ajouter le domaine à Cloudflare** (plan Free suffit) et pointer le DNS du site vers GitHub Pages (`CNAME`/`A` records inchangés, mais proxy activé — icône orange).
2. **Créer une Cache Rule** ciblant les assets hashés :
   - Condition : `URI Path` matches `/assets/*` (adapter au chemin réel de build VitePress, vérifier `website/.vitepress/config.mts` pour le `base`/`assetsDir`)
   - Action : `Cache eligibility: Eligible for cache` + `Edge TTL: Override origin` → 1 an + `Browser TTL: Override origin` → 1 an
   - Note : Cloudflare ne peut pas réécrire l'en-tête `Cache-Control` renvoyé au navigateur sur le plan Free sans un Worker ou une Transform Rule (Response Header Transform, disponible sur plan Free depuis 2024). Utiliser une **Response Header Transform Rule** pour forcer `Cache-Control: public, max-age=31536000, immutable` sur `/assets/*`.
3. **Garder le HTML non caché ou à faible TTL** : ne pas appliquer la règle ci-dessus aux fichiers `.html` ni à `/` — laisser le comportement par défaut (`max-age=600` ou une règle dédiée courte) pour permettre la propagation rapide des déploiements.
4. **Activer Brotli** : Cloudflare Free compresse automatiquement en Brotli les réponses éligibles (texte, JS, CSS) dès que le proxy est actif — aucune config additionnelle requise, à vérifier via les headers de réponse (`content-encoding: br`) une fois le DNS proxied.
5. **Vérifier après mise en place** :
   ```bash
   curl -sI https://<domaine>/assets/<fichier-hashé>.js | grep -i "cache-control\|content-encoding"
   ```
   Attendu : `cache-control: public, max-age=31536000, immutable` et `content-encoding: br`.
6. Documenter la config Cloudflare elle-même en Infrastructure as Code si possible (Terraform provider Cloudflare) pour la reproductibilité — hors scope de cette note, à traiter en tâche séparée si retenu.

### Coût et impact

- Plan Cloudflare Free : gratuit, pas de limite de trafic pertinente pour ce volume.
- Impact SEO/perf attendu : réduction des requêtes réseau sur assets déjà en cache navigateur pour les visiteurs récurrents, activation Brotli (gain ~15-20% vs gzip sur JS/CSS).
- Aucun changement de code applicatif requis dans ce dépôt — la config vit entièrement côté Cloudflare (dashboard ou IaC externe).

## Alternative si CDN non souhaité

GitHub Pages via `actions/deploy-pages` ne propose **aucun mécanisme de headers custom**, ni via un fichier de config, ni via une option du workflow Actions. Les seules alternatives sans CDN sont :

- **Changer d'hébergeur statique** supportant les headers custom nativement (Cloudflare Pages, Netlify, Vercel — tous avec un fichier `_headers` ou équivalent). Impact : migration du pipeline de déploiement, hors scope d'un simple ajustement de cache.
- **Accepter le statu quo** (`max-age=600` sur tout) : impact limité en pratique car VitePress + hash de contenu garantissent déjà l'absence de contenu périmé servi (le navigateur re-fetch après 10 min mais ne sert jamais un asset obsolète sous un nom déjà en cache). Le gain de passer à `immutable` est un gain de performance réseau, pas un gain de correctness.

**Recommandation** : Cloudflare devant GitHub Pages est la voie la moins disruptive (aucun changement de pipeline CI/CD, DNS-only) et gratuite. Si le sujet devient prioritaire, ouvrir une tâche dédiée pour la mise en place + IaC Cloudflare, séparée du pipeline `docs.yml` actuel.

---

# Headers de sécurité (CSP, X-Frame-Options, HSTS, etc.) — même mécanisme CDN

**Date** : 2026-07-15
**Statut** : Décision proposée, non implémentée
**Origine** : audit SEO Vague 4 — *"Headers de sécurité (CSP, X-Frame-Options, Referrer-Policy, etc.) — nécessite CDN devant GitHub Pages, même prérequis que le cache-control (regrouper avec la tâche CDN de Vague 3)."*
**Référence interne** : `.claude/rules/11-security.md`, section "Headers obligatoires (2026)".

## Prérequis identique à la Vague 3

Même constat que le § Cache-Control ci-dessus : GitHub Pages ne propose **aucun mécanisme natif** pour poser des headers HTTP custom (pas de `_headers`, pas d'option Actions). La solution retenue est donc la **même zone Cloudflare** (plan Free, reverse-proxy) — pas de second CDN, pas de config DNS additionnelle. Chaque header de sécurité est ajouté via une ou plusieurs **Response Header Transform Rules** sur cette même zone, en plus de la Cache Rule déjà décrite.

## Périmètre réel du site (vérifié dans le code avant d'écrire la CSP)

Le site (`website/`, VitePress) est un site de documentation statique : aucune collecte de données utilisateur, aucun `<iframe>` embarqué, aucun compte/session, aucun fetch/XHR applicatif cross-origin. Vérifié directement dans le code à la date de rédaction :

- **Polices** : self-hébergées. `website/.vitepress/theme/style.css` contient les `@font-face` locaux, et `config.mts` documente explicitement : *"Fonts are self-hosted (Inter via VitePress theme, JetBrains Mono in public/fonts/). No external Google Fonts request."* Aucun appel `fonts.googleapis.com`/`fonts.gstatic.com`.
- **Images externes** : exactement 2 badges `img.shields.io` chargés en `<img>` dans `website/.vitepress/theme/LandingPage.vue` — stars GitHub (`img.shields.io/github/stars/TheBeardedBearSAS/claude-craft`) et licence MIT (`img.shields.io/badge/license-MIT-blue`). Aucune autre ressource cross-origin trouvée dans `LandingPage.vue`, `AgentShowcase.vue` ou `config.mts` (le reste des URLs `http(s)://` du code sont soit des liens `<a href>` vers github.com — navigation, pas chargement de ressource — soit des `xmlns` SVG inertes, soit `schema.org`/`opensource.org` en valeur de champ JSON-LD, pas des ressources chargées par le navigateur).
- **JSON-LD** : `config.mts` (`transformHead`) injecte des `<script type="application/ld+json">` (schémas `WebSite`, `SoftwareApplication`, `BreadcrumbList`). Ce sont des blocs de données statiques, pas du JavaScript exécutable.
- **Styles inline** : `LandingPage.vue` utilise massivement l'attribut `style="..."` directement dans le template (dizaines d'occurrences) plutôt que des classes CSS externalisées. Une CSP `style-src` sans `'unsafe-inline'` casserait visuellement cette page.
- **Analytics/scripts tiers** : aucun script GA/Plausible/autre trouvé dans `config.mts` à la date de rédaction — **hypothèse à revérifier** si un outil d'analytics est ajouté ultérieurement (il faudrait alors élargir `script-src`/`connect-src`).

## CSP proposée

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://img.shields.io;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
```

Justifications, directive par directive :

- **`script-src 'self'`** (sans `'unsafe-inline'`) : aucun script inline exécutable identifié dans le code. Les blocs `<script type="application/ld+json">` ne sont pas du JavaScript exécutable — dans la pratique, les moteurs de rendu n'appliquent pas le filtrage `script-src` aux blocs de données non exécutables de ce type, mais **ce comportement n'est pas garanti de façon identique par tous les moteurs/versions** → à valider en mode `Content-Security-Policy-Report-Only` (voir étapes ci-dessous) en confirmant que le JSON-LD reste bien lu par les outils de test (Google Rich Results Test) avant de passer en enforcing.
- **`style-src 'self' 'unsafe-inline'`** : `'unsafe-inline'` est **obligatoire ici**, contraint par les styles inline de `LandingPage.vue`. Pas d'alternative réaliste (nonce/hash) avec la config actuelle : un nonce doit être généré et injecté par requête côté origine, ce qu'un site 100% statique servi via un Transform Rule Cloudflare (qui pose la même valeur de header sur toutes les réponses) ne permet pas.
- **`img-src 'self' https://img.shields.io`** : allowlist explicite pour les 2 badges identifiés. Sans cette entrée, les badges stars/licence de la page d'accueil casseraient silencieusement (image bloquée, pas d'erreur visible pour l'utilisateur).
- **`connect-src 'self'`** : aucun fetch/XHR cross-origin identifié dans le code actuel. Si un futur besoin apparaît (recherche full-text distante, analytics), cette directive devra être élargie explicitement — ne pas la laisser trop permissive par anticipation (YAGNI).
- **`frame-ancestors 'none'`** : équivalent CSP Level 3 de `X-Frame-Options: DENY`, protection contre le clickjacking. Les deux headers sont posés en parallèle (voir tableau ci-dessous) pour compatibilité avec les agents qui ne supportent que l'un ou l'autre.

## Autres headers

| Header | Valeur proposée | Justification / risque |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Aucun risque identifié pour un site statique — à activer sans réserve. |
| `X-Frame-Options` | `DENY` | Le site n'est embarqué dans aucun iframe légitime connu ; conservé en complément de `frame-ancestors 'none'` pour les agents pré-CSP3. |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | GitHub Pages + Cloudflare servent déjà exclusivement en HTTPS. `preload` nécessite une soumission séparée à hstspreload.org — à faire seulement une fois le header stable en production depuis plusieurs semaines (la préinscription HSTS preload est difficile à annuler rapidement). |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Valeur par défaut moderne recommandée par la règle 11 ; aucun besoin de referrer complet cross-origin sur un site de documentation. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Aucun `window.open`/flux OAuth popup identifié sur le site ; aucun risque de rupture connu. |
| `Cross-Origin-Resource-Policy` | `same-origin` | À poser uniquement sur les réponses **du site lui-même** (le header ne s'applique pas aux réponses d'`img.shields.io`, hors de notre contrôle) — empêche d'autres origines d'embarquer directement nos propres assets. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()` | Site de documentation statique : aucune de ces API n'est utilisée par le code actuel → tout désactiver par défaut. Liste non exhaustive ; étendre à d'autres features sensibles ([liste W3C](https://github.com/w3c/webappsec-permissions-policy/blob/main/features.md)) si un besoin apparaît. |

## Risque explicite à ne pas ignorer : Cross-Origin-Embedder-Policy (COEP)

**Ne pas activer `Cross-Origin-Embedder-Policy: require-corp` sans vérification préalable.** `require-corp` bloque le chargement de toute ressource cross-origin qui ne renvoie pas elle-même un header CORP (`Cross-Origin-Resource-Policy`) ou CORS compatible — y compris de simples `<img>` sans attribut `crossorigin`, comme le sont actuellement les 2 badges shields.io de `LandingPage.vue`.

Vérification effectuée le 2026-07-15 (`curl` sur `https://img.shields.io/badge/...`) : shields.io renvoie déjà
```
Access-Control-Allow-Origin: *
Cross-Origin-Resource-Policy: cross-origin
```
Les 2 badges utilisés par le site sont donc *aujourd'hui* compatibles avec `require-corp`. **Cette compatibilité n'est pas contractuelle** — c'est un comportement observé côté shields.io, pas une garantie documentée, et il peut changer sans préavis. Une bascule sur `require-corp` sans revérifier à l'implémentation romprait silencieusement l'affichage des badges.

**Recommandation** : ne **pas** poser de COEP dans un premier temps (ni `require-corp`, ni `credentialless`). Le site n'a aucun besoin fonctionnel (`SharedArrayBuffer`, threads partagés, WASM multi-thread) qui justifierait l'isolation cross-origin apportée par COEP. Si un besoin applicatif futur l'exige, repartir de `Cross-Origin-Embedder-Policy: credentialless` (n'exige pas que chaque ressource tierce expose un header CORP, contrairement à `require-corp`) plutôt que d'activer `require-corp` par défaut.

## Étapes de mise en place

1. Sur la même zone Cloudflare que la Cache Rule du § Cache-Control ci-dessus, créer une ou plusieurs **Response Header Transform Rules** (Rules → Transform Rules → Modify Response Header), condition `Hostname equals <domaine>` (toutes les routes du site, contrairement à la Cache Rule qui ne cible que `/assets/*`).
2. Ajouter une action "Set static" par header (nom + valeur, voir tableaux ci-dessus). Le plan Free autorise plusieurs actions "Set static" dans une même règle.
3. **Déployer d'abord en mode `Content-Security-Policy-Report-Only`** (même valeur de directive, nom de header différent) pendant une phase d'observation, avec un endpoint `report-to`/`report-uri` de collecte (Cloudflare Logpush, ou un service gratuit type report-uri.com) — le temps de confirmer qu'aucune ressource légitime (badges, styles inline, JSON-LD) n'est bloquée.
4. Une fois le `Report-Only` propre pendant plusieurs jours sans violation inattendue, remplacer par le header `Content-Security-Policy` en enforcing sur la même règle.
5. Vérifier après mise en place :
   ```bash
   curl -sI https://<domaine>/ | grep -iE "content-security-policy|x-frame-options|x-content-type-options|strict-transport-security|referrer-policy|cross-origin|permissions-policy"
   ```
6. Retester visuellement les 2 badges shields.io et le rendu JSON-LD (Google Rich Results Test) après le passage en enforcing — pas seulement en Report-Only.

### Coût et impact

- Gratuit : même zone Cloudflare Free que la Vague 3, pas de règle additionnelle payante requise (Cloudflare Free permet plusieurs Transform Rules par zone).
- Aucun changement de code applicatif dans ce dépôt — comme pour le Cache-Control, la config vit entièrement côté Cloudflare (dashboard ou IaC externe).
- Risque principal : une CSP mal calibrée casse silencieusement l'affichage (styles inline, badges) plutôt que de lever une erreur visible côté utilisateur final — d'où l'étape Report-Only non négociable avant enforcing.
