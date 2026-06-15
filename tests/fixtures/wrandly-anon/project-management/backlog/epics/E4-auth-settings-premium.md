# E4 — Auth, Paramètres & Premium

L'epic E4 couvre l'authentification via AuthProvider et email, la gestion du profil utilisateur, les paramètres de l'application et le système d'abonnement premium via PaymentProvider. Note : la story US-E4-07 (8 SP initiaux) a été splitée en US-E4-07a et US-E4-07b pour respecter la contrainte de 5 SP maximum par story.

---

### US-E4-01 — Inscription par email

**SP**: 3

En tant que nouvel utilisateur, je veux m'inscrire avec mon adresse email afin de créer un compte Atlas personnel.

- **Given** je remplis le formulaire d'inscription **When** je clique sur "Créer mon compte" **Then** un email de confirmation est envoyé dans les 30 secondes
- **Given** l'email de confirmation est reçu **When** je clique sur le lien **Then** mon compte est activé et je suis redirigé vers l'onboarding

---

### US-E4-02 — Connexion via AuthProvider

**SP**: 3

En tant qu'utilisateur, je veux me connecter via AuthProvider afin de ne pas gérer un mot de passe supplémentaire.

- **Given** je clique sur "Connexion avec AuthProvider" **When** l'authentification OAuth réussit **Then** je suis connecté et redirigé vers mon tableau de bord
- **Given** AuthProvider est indisponible **When** je tente de me connecter **Then** un message d'erreur clair est affiché avec l'option de connexion par email

---

### US-E4-03 — Gestion du profil utilisateur

**SP**: 3

En tant qu'utilisateur, je veux modifier mon profil (pseudo, avatar, préférences) afin de personnaliser mon expérience Atlas.

- **Given** je suis sur la page de profil **When** je modifie mon pseudo et sauvegarde **Then** le nouveau pseudo est visible sur mon profil dans les 2 secondes
- **Given** je télécharge un nouvel avatar **When** le fichier est accepté (≤ 2 Mo, PNG/JPG) **Then** il remplace l'avatar précédent sur tous les écrans

---

### US-E4-04 — Paramètres de notifications

**SP**: 2

En tant qu'utilisateur, je veux configurer mes préférences de notifications afin de ne recevoir que les alertes pertinentes pour moi.

- **Given** je suis dans les paramètres **When** je désactive les notifications de défis **Then** aucune notification de défi ne m'est plus envoyée
- **Given** je réactive une notification **When** je sauvegarde **Then** la préférence est prise en compte dès l'événement suivant

---

### US-E4-05 — Page d'abonnement premium

**SP**: 3

En tant qu'utilisateur, je veux consulter les offres premium afin de comprendre la valeur ajoutée avant de m'abonner.

- **Given** je clique sur "Passer Premium" **When** la page s'ouvre **Then** les avantages, le prix et les conditions sont clairement listés
- **Given** je compare les offres mensuelle et annuelle **When** je sélectionne annuelle **Then** l'économie en pourcentage est mise en évidence

---

### US-E4-06 — Souscription via PaymentProvider

**SP**: 5

En tant qu'utilisateur, je veux souscrire à l'abonnement premium via PaymentProvider afin d'accéder aux fonctionnalités avancées d'Atlas.

- **Given** j'ai choisi une offre **When** je clique sur "S'abonner" **Then** je suis redirigé vers la page de paiement sécurisée de PaymentProvider
- **Given** le paiement est accepté **When** PaymentProvider notifie Atlas **Then** mon statut premium est activé en moins de 5 secondes
- **Given** le paiement échoue **When** PaymentProvider renvoie une erreur **Then** un message explicatif et un lien de support sont affichés

---

### US-E4-07a — Gestion de l'abonnement premium (consultation et annulation)

**SP**: 4

En tant qu'abonné premium, je veux consulter et annuler mon abonnement afin de garder le contrôle de mes engagements financiers.

- **Given** je suis abonné **When** j'ouvre "Mon abonnement" **Then** la date de renouvellement, le montant et l'historique sont affichés
- **Given** je clique sur "Annuler l'abonnement" **When** je confirme **Then** l'accès premium reste actif jusqu'à la fin de la période en cours

---

### US-E4-07b — Gestion de l'abonnement premium (mise à jour du moyen de paiement)

**SP**: 4

En tant qu'abonné premium, je veux mettre à jour mon moyen de paiement afin de ne pas perdre l'accès suite à une carte expirée.

- **Given** ma carte arrive à expiration **When** j'ouvre les paramètres de paiement **Then** une alerte m'invite à mettre à jour mes informations
- **Given** je saisis une nouvelle carte via PaymentProvider **When** la mise à jour est confirmée **Then** le prochain prélèvement utilisera automatiquement la nouvelle carte

---

### US-E4-08 — Suppression de compte (RGPD)

**SP**: 3

En tant qu'utilisateur, je veux pouvoir supprimer définitivement mon compte afin d'exercer mon droit à l'oubli conformément au RGPD.

- **Given** je demande la suppression **When** je confirme avec mon mot de passe **Then** une demande de suppression est enregistrée et un email de confirmation est envoyé
- **Given** la suppression est planifiée **When** 30 jours s'écoulent sans annulation **Then** toutes mes données personnelles sont effacées de manière irréversible
