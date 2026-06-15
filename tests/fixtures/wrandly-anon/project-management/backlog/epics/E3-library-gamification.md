# E3 — Bibliothèque & Gamification

L'epic E3 enrichit Atlas d'une bibliothèque personnelle d'itinéraires et d'un système de gamification (badges, points, classements) destiné à fidéliser les utilisateurs sur le long terme, en particulier le persona "Joueur".

---

### US-E3-01 — Bibliothèque personnelle d'itinéraires

**SP**: 5

En tant qu'utilisateur, je veux accéder à tous mes itinéraires sauvegardés afin de retrouver rapidement mes parcours favoris.

- **Given** j'ai généré au moins un itinéraire **When** j'ouvre la bibliothèque **Then** mes itinéraires sont listés par date de création
- **Given** j'ai plus de 20 itinéraires **When** je fais défiler la liste **Then** les itinéraires suivants se chargent par pagination (20 par page)

---

### US-E3-02 — Filtres et recherche dans la bibliothèque

**SP**: 3

En tant qu'utilisateur, je veux filtrer et rechercher dans ma bibliothèque afin de retrouver un itinéraire précis sans faire défiler toute la liste.

- **Given** je saisis un mot-clé dans la barre de recherche **When** j'appuie sur Entrée **Then** seuls les itinéraires correspondants sont affichés
- **Given** j'applique un filtre par type d'activité **When** la liste se rafraîchit **Then** seuls les itinéraires du type sélectionné apparaissent

---

### US-E3-03 — Favoris et collections

**SP**: 3

En tant qu'utilisateur, je veux organiser mes itinéraires en collections afin de les regrouper par thème ou occasion.

- **Given** je clique sur l'icône favori d'un itinéraire **When** l'action est confirmée **Then** l'itinéraire apparaît dans la collection "Favoris"
- **Given** je crée une nouvelle collection **When** je lui attribue un nom **Then** elle apparaît dans la barre latérale de la bibliothèque

---

### US-E3-04 — Système de points d'expérience

**SP**: 5

En tant qu'utilisateur, je veux gagner des points d'expérience à chaque activité complétée afin de progresser dans mon niveau Atlas.

- **Given** je marque un itinéraire comme "complété" **When** l'action est confirmée **Then** les points sont crédités sur mon profil et un retour visuel est affiché
- **Given** j'atteins le seuil du niveau suivant **When** les points sont calculés **Then** une animation de montée de niveau est jouée

---

### US-E3-05 — Badges de réussite

**SP**: 5

En tant qu'utilisateur, je veux débloquer des badges afin de matérialiser mes accomplissements et partager mes succès.

- **Given** je complète mon premier itinéraire **When** le badge "Premier Pas" est débloqué **Then** une notification in-app est affichée avec une animation
- **Given** je consulte mon profil **When** je clique sur un badge verrouillé **Then** les conditions de déblocage sont affichées

---

### US-E3-06 — Classement des utilisateurs

**SP**: 5

En tant qu'utilisateur, je veux voir mon rang dans un classement afin de me comparer à la communauté et rester motivé.

- **Given** je suis connecté **When** j'ouvre la page classement **Then** mon rang, mon score et les 10 premiers utilisateurs sont affichés
- **Given** mon score change **When** le classement est recalculé **Then** mon rang est mis à jour en temps réel

---

### US-E3-07 — Défis hebdomadaires

**SP**: 3

En tant qu'utilisateur, je veux participer à des défis hebdomadaires afin de diversifier mes activités et gagner des récompenses bonus.

- **Given** la semaine démarre **When** les défis sont générés **Then** trois défis différents sont proposés à chaque utilisateur
- **Given** je complète un défi **When** la validation est faite **Then** les points bonus sont crédités et le défi est marqué "Accompli"
