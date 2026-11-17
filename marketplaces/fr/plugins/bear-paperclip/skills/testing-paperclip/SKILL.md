---
name: testing-paperclip
description: Stratégie de tests Paperclip — Vitest, harness plugin de @paperclipai/plugin-sdk/testing, tests d'intégration sur un vrai Postgres, isolation multi-tenant. À utiliser pour écrire ou revoir les tests Paperclip.
---

# Tests Paperclip

Vitest (unit + intégration + couverture) ; les tests de plugin utilisent `createTestHarness` de `@paperclipai/plugin-sdk/testing` ; les tests d'intégration ciblent un vrai Postgres (jamais mocké) ; un test d'isolation multi-tenant est obligatoire par module serveur ; couverture ≥ 80 % globalement et plus stricte sur les chemins critiques de gouvernance (agents, approbations, coûts).

Voir ../../rules/07-testing-paperclip.md pour la documentation détaillée.
