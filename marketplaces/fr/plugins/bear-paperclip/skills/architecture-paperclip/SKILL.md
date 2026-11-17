---
name: architecture-paperclip
description: Architecture bi-couche Paperclip (control plane + adapters). À utiliser pour concevoir ou revoir les limites modules/adapters d'un projet Paperclip.
---

# Architecture Paperclip

Système à deux niveaux : le plan de contrôle (server + ui + BDD) détient tout l'état de gouvernance ; les adaptateurs exécutent le travail et font remonter. Les adaptateurs ne décident jamais des budgets ni des approbations.

Voir ../../rules/02-architecture-paperclip.md pour la documentation détaillée.
