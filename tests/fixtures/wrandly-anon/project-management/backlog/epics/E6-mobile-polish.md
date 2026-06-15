# E6 — Polish Mobile

L'epic E6 améliore l'expérience sur les applications mobiles iOS et Android : performances d'animation, interactions tactiles, mode hors-ligne partiel et adaptation aux différentes tailles d'écran.

---

### US-E6-01 — Animations fluides et transitions

**SP**: 3

En tant qu'utilisateur mobile, je veux des animations fluides entre les écrans afin de bénéficier d'une expérience visuelle premium.

- **Given** je navigue entre deux écrans **When** la transition s'effectue **Then** elle se joue à 60 fps minimum sans saccade visible
- **Given** une liste d'itinéraires se charge **When** les éléments apparaissent **Then** une animation de décalage progressif (stagger) est jouée

---

### US-E6-02 — Gestes tactiles avancés

**SP**: 3

En tant qu'utilisateur mobile, je veux utiliser des gestes tactiles intuitifs afin de naviguer plus rapidement dans l'application.

- **Given** je suis sur la page de détail **When** je glisse vers la gauche **Then** je reviens à la liste précédente
- **Given** je maintiens un appui long sur un itinéraire dans la bibliothèque **When** le menu contextuel s'ouvre **Then** les actions rapides (Partager, Supprimer, Renommer) sont disponibles

---

### US-E6-03 — Mode hors-ligne partiel (consultation bibliothèque)

**SP**: 5

En tant qu'utilisateur mobile, je veux consulter ma bibliothèque sans connexion afin de retrouver mes itinéraires même en zone blanche.

- **Given** j'ai consulté un itinéraire en ligne **When** je perds la connexion **Then** l'itinéraire reste accessible en cache local
- **Given** je suis hors-ligne **When** j'essaie de générer un nouvel itinéraire **Then** un message clair m'indique que cette fonctionnalité nécessite une connexion

---

### US-E6-04 — Adaptation aux tablettes et grands écrans

**SP**: 3

En tant qu'utilisateur sur tablette, je veux une mise en page adaptée afin de profiter de l'espace disponible sur mon appareil.

- **Given** l'application s'ouvre sur une tablette (≥ 768 px) **When** la bibliothèque est affichée **Then** une mise en page en deux colonnes est utilisée
- **Given** je pivote la tablette **When** l'orientation change **Then** la mise en page s'adapte sans rechargement complet

---

### US-E6-05 — Optimisation des performances de démarrage

**SP**: 3

En tant qu'utilisateur mobile, je veux que l'application démarre rapidement afin de ne pas attendre plus de 2 secondes avant de voir le contenu.

- **Given** l'application est lancée à froid **When** le splash screen disparaît **Then** l'écran principal est interactif en moins de 2 secondes sur un appareil milieu de gamme
- **Given** l'application est lancée depuis le fond **When** elle reprend l'avant-plan **Then** elle est prête en moins de 500 ms
