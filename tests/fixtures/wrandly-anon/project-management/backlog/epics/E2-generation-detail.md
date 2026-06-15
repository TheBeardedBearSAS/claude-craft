# E2 — Génération & Détail

L'epic E2 couvre le cœur de valeur d'Atlas : la génération d'itinéraires par ProviderAI et la consultation du détail d'un itinéraire. C'est la fonctionnalité différenciante du produit et celle qui doit offrir la meilleure expérience utilisateur.

---

### US-E2-01 — Formulaire de génération d'itinéraire

**SP**: 5

En tant qu'utilisateur, je veux remplir un formulaire simple afin de paramétrer mon itinéraire selon mes préférences (durée, niveau, type d'activité).

- **Given** le formulaire est affiché **When** je sélectionne une durée et un type **Then** le bouton "Générer" devient actif
- **Given** un champ obligatoire est vide **When** je soumets le formulaire **Then** un message d'erreur contextuel est affiché sous le champ
- **Given** le formulaire est soumis **When** la génération démarre **Then** un indicateur de progression est affiché

---

### US-E2-02 — Génération IA via ProviderAI

**SP**: 8

En tant qu'utilisateur, je veux que l'itinéraire soit généré par ProviderAI en moins de 10 secondes afin d'obtenir une proposition personnalisée rapidement.

- **Given** les paramètres sont valides **When** j'appuie sur "Générer" **Then** l'itinéraire est renvoyé en moins de 10 secondes dans 95 % des cas
- **Given** ProviderAI ne répond pas **When** la génération échoue **Then** un message d'erreur convivial est affiché et une option de réessai est proposée
- **Given** la génération réussit **When** l'itinéraire est reçu **Then** il est sauvegardé automatiquement dans la bibliothèque

---

### US-E2-03 — Page de détail d'un itinéraire

**SP**: 5

En tant qu'utilisateur, je veux consulter le détail complet d'un itinéraire afin de planifier mon activité avec précision.

- **Given** je clique sur un itinéraire **When** la page de détail s'ouvre **Then** les étapes, la durée estimée et le niveau sont affichés
- **Given** je suis sur la page de détail **When** je clique sur une étape **Then** une vue agrandie de l'étape est affichée

---

### US-E2-04 — Modification manuelle d'un itinéraire généré

**SP**: 5

En tant qu'utilisateur, je veux modifier les étapes d'un itinéraire généré afin d'adapter le parcours à mes contraintes réelles.

- **Given** je suis sur la page de détail **When** je clique sur "Modifier" **Then** le mode édition s'active et les étapes deviennent réorganisables
- **Given** j'ai réorganisé les étapes **When** je clique sur "Sauvegarder" **Then** la nouvelle version est persistée et une confirmation est affichée

---

### US-E2-05a — Export PDF de l'itinéraire

**SP**: 3

En tant qu'utilisateur, je veux exporter mon itinéraire en PDF afin de l'emporter sans connexion internet.

- **Given** je suis sur la page de détail **When** je clique sur "Exporter en PDF" **Then** un fichier PDF est généré et téléchargé
- **Given** le PDF est généré **When** je l'ouvre **Then** toutes les étapes et les informations clés sont lisibles

---

### US-E2-05b — Partage d'itinéraire par lien

**SP**: 2

En tant qu'utilisateur, je veux partager mon itinéraire via un lien public afin de le transmettre à des proches.

- **Given** je clique sur "Partager" **When** le lien est généré **Then** il est copié dans le presse-papiers et un message de confirmation est affiché
- **Given** un visiteur ouvre le lien partagé **When** il n'est pas connecté **Then** l'itinéraire est visible en lecture seule sans nécessiter de compte
