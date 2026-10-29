# Content Brief — CMO on demand (mise à jour 2026-09-06)

Ce document est la référence unique du CMO. Mis à jour à chaque run significatif.

---

## Statut produit actuel

**Version :** v8.22.0  
**Modèle recommandé :** Sonnet 5 (`claude-sonnet-5`) — board utilise Opus 5 (`claude-opus-4-8`) pour les features lourdes  
**Claude Code recommandé :** 2.1.227 (dérive détectée par `/common:audit-claude-alignment` — doc pas encore mise à jour)  
**Licence :** MIT pur, CHARTER perpétuelle  
**Contact public :** flavien@quality-code.fr | the-bearded-bear.com  
**Site web :** thebeardedbearsas.github.io/claude-craft/ (ou domaine custom si Cloudflare configuré)

**Nouveautés W30 (2026-07-22) :**  
- **Vite 8.1** ajouté comme stack Tier-3 community (framework-agnostic) : vanilla JS/TS, library authoring (`build.lib`), MPA, Workers/WASM. Agent `@vite-reviewer`, 6 commandes `/vite:*`. PR #144.  
- **Vercel** ajouté comme stack Tier-3 community (platform layer, framework-agnostic) : `vercel.json`, Functions Node.js/Fluid Compute, ISR, Cron Jobs, Storage. Agent `@vercel-reviewer`, 6 commandes `/vercel:*`. PR #147. **Positionnement explicite : pas de Next.js (hors-périmètre).** Edge Runtime documenté comme déprécié/legacy-only.  
- Stacks total : **15** (était 13 en W28)

---

## Contexte distribution — mise à jour majeure W29

**Le board a exécuté un audit SEO complet le 15 juillet (4 vagues, 9 agents spécialisés).**

Ce qui est maintenant en place sur le site :
- Sitemap.xml (129 URLs, postbuild automatique)
- Hreflang sur les 5 locales (en/fr/es/de/pt) + x-default
- llms.txt (format llmstxt.org — crawleurs IA)
- JSON-LD SoftwareApplication + WebSite + BreadcrumbList
- Canonical tags par page et par locale
- Page About/Contact avec entité de marque unifiée
- Meta descriptions par locale (non plus en anglais pour tout)
- OG/Twitter tags
- **Page de comparaison** (claude-craft vs alternatives) avec OG image dédiée
- Trust signals above-the-fold (badge stars GitHub, badge MIT, lien Changelog)
- H2 question-style pour extractibilité GEO (IA search)
- Score baseline : 55/100 → non re-mesuré post-corrections

**Ce qui reste à faire côté distribution :**
- Cloudflare en proxy (Cache-Control `/assets/*` immutable — doc dans CDN_CACHE_CONTROL_SETUP_20260715.md)
- Backlinks : zéro à ce jour. C'est le plafond SEO suivant.
- GitHub Sponsors : non activé (funnel donations fermé)
- awesome-claude-code : non soumis (backlink potentiel #1)

**Interprétation :** Le board a choisi l'organique sérieux. Le SEO technique est maintenant au niveau professionnel. La prochaine étape naturelle pour l'organique : **backlinks** (awesome-claude-code, npm, mentions tierces) et **contenu** (blog ou posts réguliers pour générer du trafic longue traîne).

**Cycle J90 clôturé (2026-09-07) :** Rétrospective complète dans `J90_RETROSPECTIVE_20260830.md`. Constat : targets de distribution non poursuivis, cohérent avec le mode opératoire du board (Option C). Produit prêt à être découvert, distribution = levier principal non encore activé. Le cycle de recherche est formellement fermé.

**Note technique :** `scripts/awesome-claude-code-submit.mjs` contient des counts corrects (140 cmds, 33 agents, 1139 tests) en état `M` non commité depuis W32. Le board peut commiter ou simplement utiliser le script tel quel pour la soumission.

---

## Draft à publier en priorité

> **W33 — 17 semaines, 0 publications.** 5 drafts prêts. Friction zéro sur les 4 premiers.

### 1. `exit 1` vs `exit 2` dans les hooks Claude Code ⭐ PRIORITÉ ABSOLUE

**Fichier :** `CONTENT_DRAFT_20260705.md`  
**Pourquoi :** Sécurité, snippet avant/après, intemporel  
**Friction :** Zéro — copier-coller, publier

### 2. `/common:audit-claude-alignment` — l'agent qui surveille Claude Code ⭐ ACTUALITÉ

**Fichier :** `CONTENT_DRAFT_20260816.md` (ce run)  
**Pourquoi :** Feature sortie cette semaine, angle fort (version drift détecté dès le 1er run), token economy story  
**Friction :** Zéro — copier-coller, publier

### 3. Vercel sans Next.js — "on couvre la plateforme, pas le framework"

**Fichier :** `CONTENT_DRAFT_20260726.md`  
**Pourquoi :** Vite + Vercel Tier-3, angle platform-agnostic différenciant — 3 semaines, encore publiable  
**Friction :** Zéro — copier-coller, publier

### 4. Audit SEO 4 vagues — "9 agents IA ont audité notre site"

**Fichier :** `CONTENT_DRAFT_20260719.md`  
**Pourquoi :** Dogfooding fort, post body evergreen, aucune date dans le texte  
**Friction :** Zéro — copier-coller, publier

### 5. `/workflow:auto-sprint` — un sprint en une commande

**Fichier :** `CONTENT_DRAFT_20260628.md`  
**Pourquoi :** Feature avancée, démonstration concrète  
**Friction :** Faible

---

## Actions de traction non faites (priorité révisée post-SEO)

| Action | Effort | Impact SEO | Bloquant |
|--------|--------|-----------|---------|
| **awesome-claude-code** | 3 min | ⭐ Backlink direct depuis liste curatée | **Guide complet : `AWESOME_SUBMISSION_GUIDE_20260809.md` — URL prête, champs vérifiés v8.22.0** |
| **Cloudflare proxy** (Cache-Control) | 30 min | Performance score | Doc dans CDN_CACHE_CONTROL_SETUP_20260715.md |
| **Re-mesurer score SEO** après les 4 vagues | 15 min | Valider les gains | Relancer `/seo audit` |
| **GitHub Sponsors** | 30 min | Conversion donations | Brief dans GITHUB_SPONSORS_BRIEF_20260621.md |
| **Publier post LinkedIn** | 2 min/post | Backlinks sociaux + trafic direct | Drafts prêts |

---

## Inventaire drafts — statut final

| Fichier | Angle | Verdict |
|---------|-------|---------|
| CONTENT_DRAFT_20260419.md | 4 agents (v8.2) | ❌ Archiver |
| CONTENT_DRAFT_20260503.md | BMAD solo→équipe | ✅ Publier en commentaire |
| CONTENT_DRAFT_20260517.md | v8.3 | ❌ Archiver |
| CONTENT_DRAFT_20260524.md | Dogfooding v8.7.1 | ❌ Archiver |
| CONTENT_DRAFT_20260531.md | 4 différenciateurs | ✅ Publier si angle comparatif |
| CONTENT_DRAFT_20260614.md | MIT-only pivot | ✅ Pertinent — fenêtre qui se ferme |
| CONTENT_DRAFT_20260621.md | Kanban + Claude Design | ✅ Publier si angle visuel |
| CONTENT_DRAFT_20260628.md | /workflow:auto-sprint | ✅ Priorité haute |
| CONTENT_DRAFT_20260705.md | exit 1 vs exit 2 | ⭐ Priorité absolue |
| CONTENT_DRAFT_20260719.md | Audit SEO 9 agents | ✅ Evergreen — publier |
| CONTENT_DRAFT_20260726.md | Vercel sans Next.js (v8.22.0) | ✅ Publier — encore frais |
| **CONTENT_DRAFT_20260816.md** | **audit-claude-alignment (drift CLI)** | **⭐ Actualité — publier maintenant** |

---

## Comment invoquer le CMO (Option C)

```
"Aide-moi à rédiger un post LinkedIn sur [sujet / feature / événement]"
```

Post écrit en 15 minutes, adapté au ton MIT-only (CTA : try/star/sponsor — pas de consulting).

---

*Dernière mise à jour : 2026-09-06 — CMO agent e8318117*
