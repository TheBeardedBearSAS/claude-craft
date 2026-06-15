# Architecture C4 — Atlas

## Niveau 1 : Contexte

```
[Utilisateur] --> [Atlas Web / Mobile]
[Atlas] --> [ProviderAI] : génération d'itinéraires
[Atlas] --> [AuthProvider] : authentification OAuth
[Atlas] --> [PaymentProvider] : gestion des abonnements
```

## Niveau 2 : Conteneurs

| Conteneur | Technologie | Rôle |
|-----------|------------|------|
| **Application Web** | React 19 + TypeScript | SPA — interface utilisateur web |
| **Application Mobile** | React Native 0.86 | App iOS et Android |
| **API Gateway** | Node.js / Express | Point d'entrée unique, authentification JWT |
| **Service Génération** | Python 3.14 + FastAPI | Appels ProviderAI, mise en file d'attente |
| **Base de données** | PostgreSQL 17 | Données persistantes (accounts, items, badges) |
| **Cache** | Redis 8 | Sessions, rate-limiting, tokens temporaires |
| **File de messages** | RabbitMQ | Découplage génération asynchrone |

## Niveau 3 : Composants (API Gateway)

- **AuthController** — inscription, connexion, OAuth callback, refresh
- **ItineraryController** — CRUD itinéraires, génération, partage
- **ProfileController** — profil, badges, classement
- **SubscriptionController** — offres, souscription, webhook PaymentProvider

## Décisions architecturales clés

- Séparation stateless entre API Gateway et Service Génération pour scalabilité indépendante
- Tout secret stocké dans le vault — aucune variable sensible en clair dans les images Docker
