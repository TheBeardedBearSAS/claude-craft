# PRD — Atlas

## Vision

Atlas est une application web et mobile permettant à tout utilisateur de générer, personnaliser et suivre des itinéraires d'activités. Grâce à l'intelligence artificielle de ProviderAI, Atlas propose des parcours adaptés au profil, aux préférences et au niveau de l'utilisateur, tout en gamifiant la progression pour maintenir l'engagement sur le long terme.

---

## Personas

| Persona | Description | Besoins principaux |
|---------|-------------|-------------------|
| **Utilisateur curieux** | Découvre l'application, explore sans objectif précis | Onboarding simple, suggestions variées, pas de friction |
| **Explorateur régulier** | Utilise Atlas plusieurs fois par semaine | Bibliothèque personnelle, historique, recommandations affinées |
| **Sportif** | Objectifs de performance mesurables | Statistiques détaillées, segments chronométrés, badges d'effort |
| **Joueur** | Motivé par la compétition et les récompenses | Classements, défis, badges rares, progression visible |

---

## Objectifs

- Permettre la génération d'itinéraires en moins de 10 secondes via ProviderAI
- Atteindre un taux de rétention J7 ≥ 40 % à la fin du Sprint 6
- Proposer un abonnement premium (PaymentProvider) avec valeur perçue claire
- Couvrir les marchés FR, EN et ES dès le lancement (E7)

---

## Périmètre

**Inclus :** génération IA, bibliothèque personnelle, gamification (badges, classement), authentification (AuthProvider + email), abonnement premium, internationalisation FR/EN/ES, application mobile iOS et Android.

**Exclus :** intégration réseaux sociaux tiers, mode hors-ligne complet, marketplace de contenus tiers.

---

## Epics

| Epic | Titre | Priorité |
|------|-------|---------|
| E0 | Infrastructure & Tokens | Critique |
| E1 | Design System | Haute |
| E2 | Génération & Détail | Haute |
| E3 | Bibliothèque & Gamification | Haute |
| E4 | Auth, Paramètres & Premium | Haute |
| E5 | Découverte & Surprise | Moyenne |
| E6 | Polish Mobile | Moyenne |
| E7 | i18n, QA & Lancement | Critique |
