# API Atlas — Référence REST

**Base URL :** `/api/v1`
**Authentification :** Bearer token JWT ES256

## Endpoints

| Méthode | Chemin | Description |
|---------|--------|-------------|
| `POST` | `/auth/register` | Inscription par email |
| `POST` | `/auth/login` | Connexion par email + mot de passe |
| `POST` | `/auth/oauth/callback` | Callback OAuth (AuthProvider) |
| `POST` | `/auth/refresh` | Renouvellement du token JWT |
| `DELETE` | `/auth/logout` | Révocation du token |
| `POST` | `/itineraries/generate` | Génération d'un itinéraire via ProviderAI |
| `GET` | `/itineraries` | Liste des itinéraires de l'utilisateur (paginée) |
| `GET` | `/itineraries/:id` | Détail d'un itinéraire |
| `PATCH` | `/itineraries/:id` | Modification d'un itinéraire |
| `DELETE` | `/itineraries/:id` | Suppression d'un itinéraire |
| `GET` | `/itineraries/:id/share` | Génération du lien de partage public |
| `GET` | `/profile` | Profil de l'utilisateur connecté |
| `PATCH` | `/profile` | Mise à jour du profil |
| `GET` | `/badges` | Badges de l'utilisateur |
| `GET` | `/leaderboard` | Classement global (top 100) |
| `GET` | `/subscriptions/plans` | Liste des offres premium |
| `POST` | `/subscriptions` | Souscription premium via PaymentProvider |
| `DELETE` | `/subscriptions/me` | Annulation de l'abonnement |

## Codes d'erreur

Erreurs au format RFC 9457 (`application/problem+json`).
