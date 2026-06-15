# E1 — Design System

L'epic E1 établit le design system d'Atlas : tokens visuels, composants de base, documentation Storybook et règles d'accessibilité. Un design system cohérent réduit le temps de développement des epics suivants et garantit une expérience utilisateur homogène sur web et mobile.

---

### US-E1-01 — Tokens de design (couleurs, typographie, espacements)

**SP**: 3

En tant que designer/développeur, je veux un ensemble de tokens de design centralisés afin que toutes les interfaces partagent une identité visuelle cohérente.

- **Given** les tokens sont définis dans un fichier source unique **When** ils sont compilés **Then** ils sont disponibles en CSS variables, JSON et constantes TypeScript
- **Given** un token est modifié **When** le build est relancé **Then** tous les composants qui l'utilisent reflètent le changement automatiquement

---

### US-E1-02 — Composants atomiques (boutons, champs, badges)

**SP**: 5

En tant que développeur, je veux des composants atomiques accessibles et testés afin de construire les écrans plus rapidement sans réinventer les bases.

- **Given** un composant bouton est rendu **When** il reçoit le focus clavier **Then** un indicateur de focus visible est affiché (WCAG 2.2 AA)
- **Given** un champ de saisie est invalide **When** l'utilisateur soumet le formulaire **Then** un message d'erreur associé au champ est annoncé par les lecteurs d'écran
- **Given** le composant est documenté dans Storybook **When** je navigue dans le catalogue **Then** tous les états (default, hover, disabled, error) sont visibles

---

### US-E1-03 — Composants moléculaires (cartes, listes, modales)

**SP**: 5

En tant que développeur, je veux des composants moléculaires réutilisables afin de construire les vues complexes par composition.

- **Given** une carte itinéraire est rendue **When** je la survole **Then** une animation de survol fluide est jouée (60 fps)
- **Given** une modale est ouverte **When** j'appuie sur Échap **Then** la modale se ferme et le focus retourne à l'élément déclencheur

---

### US-E1-04 — Thème sombre et thème clair

**SP**: 3

En tant qu'utilisateur, je veux pouvoir choisir entre le thème clair et le thème sombre afin de conserver le confort visuel selon mon contexte.

- **Given** le thème système est sombre **When** l'application démarre pour la première fois **Then** le thème sombre est appliqué automatiquement
- **Given** l'utilisateur change de thème **When** il recharge la page **Then** le thème choisi est conservé

---

### US-E1-05 — Documentation Storybook et guide de contribution

**SP**: 2

En tant que contributeur, je veux une documentation Storybook à jour afin de trouver rapidement le bon composant et comprendre comment l'utiliser.

- **Given** un nouveau composant est créé **When** la PR est fusionnée **Then** une story Storybook est requise comme critère de merge
- **Given** je consulte Storybook **When** je cherche un composant par nom **Then** je le trouve en moins de 3 clics
