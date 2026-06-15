# E0 — Infrastructure & Tokens

L'epic E0 pose les fondations techniques d'Atlas : mise en place de l'environnement de développement, configuration des pipelines CI/CD, gestion des tokens d'accès à ProviderAI, et initialisation du schéma de base de données. Sans ces bases solides, aucune fonctionnalité métier ne peut être livrée de manière fiable.

---

### US-E0-01 — Initialisation du dépôt et CI/CD

**SP**: 3

En tant que développeur, je veux disposer d'un pipeline CI/CD fonctionnel afin de livrer les fonctionnalités en continu avec des garanties qualité automatisées.

- **Given** le dépôt est vide **When** je pousse un commit sur `main` **Then** la pipeline s'exécute et publie un rapport de build
- **Given** un test échoue **When** la CI tourne **Then** le merge est bloqué et une notification est envoyée
- **Given** le build est vert **When** la CI se termine **Then** l'image Docker est publiée dans le registre

---

### US-E0-02 — Configuration de l'environnement Docker

**SP**: 2

En tant que développeur, je veux un environnement Docker reproductible afin de garantir la parité entre les environnements de développement et de production.

- **Given** le fichier `docker-compose.yml` existe **When** je lance `docker compose up` **Then** l'application et la base de données démarrent sans erreur
- **Given** une variable d'environnement manque **When** le conteneur démarre **Then** une erreur explicite est levée

---

### US-E0-03a — Intégration API ProviderAI : authentification

**SP**: 2

En tant que service backend, je veux m'authentifier auprès de ProviderAI afin d'obtenir un token d'accès valide pour les appels de génération.

- **Given** les credentials sont présents en variable d'environnement **When** le service démarre **Then** un token est obtenu et mis en cache
- **Given** le token expire **When** une requête est effectuée **Then** le token est renouvelé automatiquement

---

### US-E0-03b — Intégration API ProviderAI : quota et rate-limiting

**SP**: 2

En tant que service backend, je veux respecter les quotas de ProviderAI afin d'éviter les erreurs 429 en production.

- **Given** le quota journalier est atteint **When** une requête est faite **Then** une erreur métier est renvoyée à l'appelant
- **Given** le taux de requêtes dépasse la limite **When** plusieurs appels simultanés arrivent **Then** un mécanisme de backoff exponentiel est appliqué

---

### US-E0-03c — Intégration API ProviderAI : logging des appels

**SP**: 1

En tant qu'administrateur, je veux que chaque appel à ProviderAI soit journalisé afin de suivre la consommation et diagnostiquer les anomalies.

- **Given** un appel est effectué **When** la réponse est reçue **Then** la durée, le modèle et le nombre de tokens sont enregistrés
- **Given** une erreur survient **When** l'appel échoue **Then** le code d'erreur et le message sont loggés sans exposer les credentials

---

### US-E0-03d — Intégration API ProviderAI : mock pour les tests

**SP**: 1

En tant que développeur, je veux un mock de ProviderAI dans les tests afin de ne pas consommer de quota lors des pipelines CI.

- **Given** l'environnement est `test` **When** une génération est demandée **Then** le mock retourne un itinéraire factice prédéfini
- **Given** le mock est actif **When** les tests s'exécutent **Then** aucun appel réseau réel n'est émis

---

### US-E0-04 — Schéma de base de données initial

**SP**: 3

En tant qu'architecte, je veux un schéma de base de données versionné afin de garantir la cohérence des migrations entre les environnements.

- **Given** le schéma initial est défini **When** les migrations sont appliquées **Then** toutes les tables sont créées sans erreur
- **Given** une migration est rejouée **When** elle a déjà été appliquée **Then** elle est ignorée sans erreur (idempotence)

---

### US-E0-05 — Monitoring et alertes de base

**SP**: 2

En tant qu'administrateur, je veux des alertes sur les métriques critiques afin d'être prévenu en cas d'incident avant les utilisateurs.

- **Given** le taux d'erreur HTTP dépasse 5 % **When** la fenêtre de 5 minutes s'écoule **Then** une alerte est déclenchée
- **Given** le temps de réponse médian dépasse 2 s **When** la charge augmente **Then** une notification est envoyée à l'équipe
