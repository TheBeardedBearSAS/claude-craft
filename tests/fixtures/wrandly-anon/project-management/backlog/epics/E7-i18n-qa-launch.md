# E7 — i18n, QA & Lancement

L'epic E7 finalise Atlas avant le lancement public : internationalisation en trois langues (FR, EN, ES), campagne de QA complète, corrections des régressions identifiées et déploiement en production. C'est l'epic qui conditionne la date de lancement.

---

### US-E7-01 — Internationalisation FR/EN/ES

**SP**: 5

En tant qu'utilisateur, je veux utiliser Atlas dans ma langue afin de bénéficier d'une expérience entièrement localisée.

- **Given** mon appareil est configuré en anglais **When** j'ouvre l'application pour la première fois **Then** l'interface s'affiche en anglais
- **Given** je change la langue dans les paramètres **When** je sélectionne l'espagnol **Then** toute l'interface bascule en espagnol sans rechargement complet

---

### US-E7-02 — Campagne de tests de régression

**SP**: 5

En tant que QA, je veux exécuter une campagne de régression complète afin de valider que toutes les fonctionnalités des epics E0 à E6 fonctionnent correctement ensemble.

- **Given** la suite de tests E2E est configurée **When** la campagne est lancée **Then** les 150 scénarios critiques s'exécutent sans erreur bloquante
- **Given** une régression est détectée **When** le rapport est généré **Then** elle est classée par sévérité (bloquant, majeur, mineur) et assignée à l'équipe

---

### US-E7-03 — Audit de sécurité et conformité RGPD

**SP**: 3

En tant que responsable produit, je veux un audit de sécurité et de conformité RGPD afin de garantir la conformité légale avant le lancement.

- **Given** l'audit est commandé **When** le rapport est reçu **Then** aucune vulnérabilité critique (CVSS ≥ 9) ne subsiste
- **Given** la conformité RGPD est vérifiée **When** le DPO valide **Then** la politique de confidentialité et le mécanisme de consentement sont approuvés

---

### US-E7-04 — Déploiement en environnement de staging

**SP**: 3

En tant que DevOps, je veux déployer Atlas sur un environnement de staging identique à la production afin de valider le déploiement avant la mise en ligne.

- **Given** le build est validé **When** le déploiement staging est déclenché **Then** l'application est disponible sur l'URL de staging en moins de 10 minutes
- **Given** le smoke test staging passe **When** l'équipe valide **Then** le déploiement production peut être déclenché

---

### US-E7-05 — Mise en ligne et monitoring du lancement

**SP**: 3

En tant qu'équipe produit, je veux un lancement progressif avec monitoring renforcé afin de détecter et corriger rapidement les problèmes post-lancement.

- **Given** le déploiement production est déclenché **When** le rollout atteint 100 % **Then** les métriques clés (erreurs, latence, inscriptions) sont surveillées en temps réel
- **Given** le taux d'erreur dépasse 2 % **When** l'alerte se déclenche **Then** un rollback automatique est initié en moins de 5 minutes
