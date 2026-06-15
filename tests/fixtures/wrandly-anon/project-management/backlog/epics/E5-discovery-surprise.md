# E5 — Découverte & Surprise

L'epic E5 ajoute une dimension de découverte spontanée à Atlas : fonctionnalité "Surprise-moi", recommandations contextuelles et exploration thématique. Ces fonctionnalités ciblent principalement l'"Utilisateur curieux" et l'"Explorateur régulier".

---

### US-E5-01 — Fonctionnalité "Surprise-moi"

**SP**: 5

En tant qu'utilisateur, je veux que l'application me génère un itinéraire surprise afin de découvrir des activités auxquelles je n'aurais pas pensé.

- **Given** je clique sur "Surprise-moi" **When** la génération est lancée **Then** un itinéraire aléatoire adapté à mon profil est proposé en moins de 8 secondes
- **Given** l'itinéraire surprise ne me convient pas **When** je clique sur "Autre surprise" **Then** un nouvel itinéraire différent est généré

---

### US-E5-02 — Recommandations contextuelles

**SP**: 5

En tant qu'utilisateur, je veux recevoir des recommandations basées sur mes activités passées afin de découvrir des itinéraires qui correspondent à mes goûts.

- **Given** j'ai complété au moins 3 itinéraires **When** j'ouvre la page d'accueil **Then** une section "Pour vous" affiche 3 recommandations personnalisées
- **Given** je rejette une recommandation **When** je clique sur "Pas intéressé" **Then** ce type de contenu est moins fréquent dans mes futures recommandations

---

### US-E5-03 — Exploration thématique

**SP**: 3

En tant qu'utilisateur, je veux parcourir des catégories thématiques afin de trouver l'inspiration selon mon envie du moment.

- **Given** j'ouvre la page "Explorer" **When** les thèmes sont chargés **Then** au moins 6 catégories thématiques sont affichées avec une image représentative
- **Given** je sélectionne un thème **When** la liste se charge **Then** les itinéraires correspondants sont affichés par popularité

---

### US-E5-04 — Itinéraire du jour

**SP**: 2

En tant qu'utilisateur, je veux voir un itinéraire mis en avant chaque jour afin d'avoir une raison de revenir sur l'application quotidiennement.

- **Given** je me connecte à l'application **When** c'est un nouveau jour **Then** un itinéraire "À la une" différent du jour précédent est affiché en haut de l'écran
- **Given** je clique sur l'itinéraire du jour **When** la page détail s'ouvre **Then** un bandeau "Sélection du jour" est visible

---

### US-E5-05 — Partage de découverte entre utilisateurs

**SP**: 3

En tant qu'utilisateur, je veux partager mes découvertes avec la communauté Atlas afin d'inspirer d'autres utilisateurs.

- **Given** je consulte un itinéraire **When** je clique sur "Partager à la communauté" **Then** l'itinéraire est soumis pour modération
- **Given** ma soumission est approuvée **When** elle est publiée **Then** je reçois un badge "Contributeur" et des points bonus
