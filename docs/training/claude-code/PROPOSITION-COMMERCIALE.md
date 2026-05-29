# Proposition Commerciale : Formation Claude Code 2.1.154 — Maîtriser l'Agent de Développement

## Contexte Client

- **Équipe** : 8 développeurs (2 groupes de 5 max)
- **Objectif** : Maîtrise de Claude Code 2.1.154 comme agent de développement
- **Cas d'usage** : Projets existants ET nouveaux projets

## Version incluse

| Composant | Version | Points forts |
|-----------|---------|--------------|
| Claude Code | 2.1.154 | Adaptive Thinking, MCP, Hooks, Permissions 3-tier, Agent Teams, Fast Mode (Opus 4.6), Opus 4.8 flagship, Native CLI binary, Forked subagents, /ultrareview, /tui, /btw |
| Claude-Craft | 8.7.1 | Mentionné en bonus démo uniquement |

---

## Notre Offre

### Journée de cadrage (incluse)

**Durée :** 6h (distanciel)
**Format :** Visioconférence
**Quand :** 1 à 2 semaines avant la formation

| Activité | Durée | Contenu |
|----------|-------|---------|
| Interviews individuelles | 4h (8 x 30min) | Niveau actuel, attentes, stack utilisée, habitudes de travail |
| Analyse & adaptation | 2h | Personnalisation du programme selon les profils identifiés |

### Formation (4 jours — 2 x 14 heures)

**Participants :** 8 stagiaires répartis en **2 groupes de 4-5 max**

| Jour | Groupe | Contenu |
|------|--------|---------|
| Jour 1 | Groupe 1 | Fondamentaux Claude Code |
| Jour 2 | Groupe 2 | Fondamentaux Claude Code |
| Jour 3 | Groupe 1 | Pratiques Avancées |
| Jour 4 | Groupe 2 | Pratiques Avancées |

| Option | Format | Détail |
|--------|--------|--------|
| **Option A — Online** | Distanciel | Visioconférence, 4 jours |
| **Option B — Sur site** | Présentiel | Formation dans vos locaux, 4 jours (+500 EUR HT) |

---

## Programme Détaillé

*Chaque groupe suit ce programme sur 2 jours (7h/jour).*

### Jour 1 : Fondamentaux Claude Code (7h)

| Module | Durée | Contenu |
|--------|-------|---------|
| **1. Introduction Claude Code** | 1h30 | L'outil agentique : positionnement, cas d'usage, limites. Installation (CLI, Desktop, Web, IDE). Interface et navigation. Adaptive Thinking : quand et comment l'activer. Modèles disponibles (Opus 4.8, Sonnet 4.6, Haiku 4.5, Opus 4.6 pour Fast Mode). Gestion des coûts et optimisation des tokens. |
| **2. CLAUDE.md et Configuration** | 1h30 | Mémoire 3 niveaux (~/, projet, .claude/). CLAUDE.local.md pour les préférences individuelles. settings.json et configuration avancée. Permissions 3-tier (allow, deny, ask). .claudeignore : exclure fichiers et dossiers. Références @ : inclure des fichiers dans le contexte. |
| **3. Patterns de Travail** | 2h | Prompt engineering pour Claude Code : structurer ses demandes. Plan Mode : planifier avant d'agir. Gestion du contexte : /clear, fenêtre de contexte, bonnes pratiques. Sub-agents : déléguer les investigations. Headless mode : exécution sans interaction. Sessions et checkpointing : sauvegarder et reprendre. Images : utiliser des captures d'écran comme contexte. Sandboxing : exécution sécurisée. |
| **4. Pratique Guidée** | 2h | **Projet existant (1h)** : onboarding sur un codebase inconnu, refactoring guidé par Claude Code, debug et résolution de problèmes. **Projet vierge (1h)** : scaffolding d'un nouveau projet, génération de code et de tests, mise en place CI/CD avec Claude Code. |

### Jour 2 : Pratiques Avancées (7h)

| Module | Durée | Contenu |
|--------|-------|---------|
| **5. Hooks et Automatisation** | 1h30 | Les 24 événements hooks disponibles (v2.1.154). Propriétés avancées : `if` conditionnel, `defer`, PreCompact bloquant. Création de slash commands personnalisées. Hook SessionStart avec matcher compact : réinjecter le contexte après compaction. PreToolUse et PostToolUse : contrôler les actions de Claude. Exemples concrets : linting automatique, validation de commits, blocage de patterns dangereux. |
| **6. MCP et Intégrations** | 1h15 | Model Context Protocol : architecture et fonctionnement. Serveurs MCP : installation et configuration. Plugins et extensions. Intégrations IDE (VS Code, JetBrains). CI/CD headless : intégration dans les pipelines. Flag --from-pr : revue de code automatisée. Sécurité MCP : risques et bonnes pratiques de vetting. |
| **7. Multi-Agent et Coordination** | 1h15 | Agent Teams : orchestrer plusieurs agents Claude. Git worktrees : sessions parallèles sur plusieurs branches. Fan-out patterns : distribuer le travail entre agents. Interview pattern : un agent questionne, l'autre répond. Writer/reviewer : rédaction et relecture par agents distincts. Bonnes pratiques : 3-5 worktrees max, nettoyage. |
| **8. Qualité et Sécurité** | 1h | TDD/BDD avec Claude Code : cycle Red-Green-Refactor assisté. Audit de code : détection de problèmes et suggestions. OWASP Top 10 : sensibilisation sécurité dans le workflow. Git workflow : Conventional Commits, feature branches, PR. Gestion des coûts : suivi de la consommation, optimisation des prompts. |
| **9. Bonus — Claude-Craft** | 30min | Démo du framework Claude-Craft 8.7.1. Agents spécialisés (70 agents, 125 commandes / 15 namespaces). Workflow BMAD v6 : de l'analyse au déploiement. Quand et pourquoi adopter un framework sur Claude Code. |
| **10. Atelier Final** | 1h30 | **Challenge mixte (45min)** : exercice combinant les compétences des 2 jours sur un scénario réaliste. **Restitution (30min)** : présentation des solutions, comparaison des approches. **Q&A et plan d'action (15min)** : questions libres, définition d'un plan d'action équipe pour l'adoption. |

---

## Tarification

### Grille Tarifaire

| Formule | Durée | Tarif HT (Online) | Tarif HT (Sur site) | Par participant* |
|---------|-------|--------------------|----------------------|------------------|
| **Formation Standard** | 1j cadrage + 4j (20h) | 4 000 EUR | 4 500 EUR | 500 EUR |
| **Formation + Suivi** | 1j cadrage + 4j + 3h (23h) | 5 000 EUR | 5 500 EUR | 625 EUR |
| **Formation Premium** | 1j cadrage + 4j + 1 mois | 7 250 EUR | 7 750 EUR | 906 EUR |

*Calculé pour 8 participants. Journée de cadrage incluse dans toutes les formules.

### Détail des Formules

#### Formation Standard (1j cadrage + 4 jours)

**Inclus :**
- Journée de cadrage (interviews individuelles)
- 14 heures de formation par groupe (2 x 7h)
- Supports de cours (PDF)
- Cheat sheet Claude Code
- Exercices pratiques avec solutions
- Certificat de participation

#### Formation + Suivi (1j cadrage + 4 jours + 3h)

**Inclus :**
- Tout le contenu Standard
- **+** Demi-journée de suivi à J+15 (3h, distanciel)
- **+** Retour d'expérience guidé
- **+** Résolution des blocages rencontrés

#### Formation Premium (1j cadrage + 4 jours + 1 mois coaching)

**Inclus :**
- Tout le contenu Formation + Suivi
- **+** 2h de support par semaine pendant 1 mois
- **+** Revue de code assistée
- **+** Accompagnement sur projets spécifiques
- **+** Accès prioritaire au formateur

---

## ROI Estimé

### Gains de Productivité

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| Temps par feature | 5 jours | 3 jours | **40%** |
| Bugs en production | 10/mois | 6/mois | **40%** |
| Temps de code review | 2h | 45min | **62%** |
| Onboarding nouveau dev | 2 semaines | 1 semaine | **50%** |

### Calcul ROI Simplifié

```
Gain mensuel estimé par développeur : 8h x 50EUR/h = 400EUR
Pour 8 développeurs : 3 200EUR/mois
Amortissement formation Standard : 1-2 mois
```

---

## Prérequis

### Pour l'équipe

- Connaissance du développement logiciel
- Familiarité avec Git
- Accès à un IDE (VS Code recommandé)

### Pour le jour J (sur site)

- Salle avec vidéoprojecteur et WiFi
- PC portables participants avec droits admin
- Comptes Anthropic avec crédits (fournis ou à prévoir)

### Pour le jour J (online)

- PC avec droits admin, micro/caméra et connexion stable
- Comptes Anthropic avec crédits (fournis ou à prévoir)

### Optionnel (préparé par nos soins si souhaité)

- Projet de démo adapté à votre stack
- Environnement de travail préconfiguré

---

## Calendrier Type

### 2 semaines avant

- Kickoff téléphonique (30min)
- Envoi des prérequis techniques
- Préparation des accès

### 1 semaine avant

- **Journée de cadrage** (distanciel) : interviews individuelles des 8 stagiaires
- Adaptation du programme selon les profils identifiés

### Semaine formation (4 jours)

- **J-1** : Vérification environnements
- **Jour 1** : Groupe 1 — Fondamentaux Claude Code
- **Jour 2** : Groupe 2 — Fondamentaux Claude Code
- **Jour 3** : Groupe 1 — Pratiques Avancées
- **Jour 4** : Groupe 2 — Pratiques Avancées

### Après formation

- **J+1** : Envoi des supports finaux
- **J+15** : Session de suivi (si option)
- **J+30** : Bilan satisfaction

---

## Livrables

| Livrable | Format | Quand |
|----------|--------|-------|
| Supports de formation | PDF | J+1 |
| Cheat sheet Claude Code | PDF imprimable | Jour 1 |
| Exercices + solutions | Markdown + code | J+1 |
| Certificats | PDF nominatifs | J+7 |
| Compte-rendu | PDF | J+7 |

---

## Garanties

- **Satisfaction** : Si les objectifs ne sont pas atteints, session de rattrapage gratuite
- **Support** : 2 semaines de support email post-formation incluses
- **Mise à jour** : Accès aux mises à jour des supports pendant 6 mois

---

## Questions Fréquentes

### La formation est-elle certifiante ?

Une attestation de formation est délivrée. La certification officielle Claude n'existe pas à ce jour.

### Peut-on adapter le programme à notre stack ?

Oui, le programme est agnostique en termes de technologie. Les exercices et exemples sont adaptés à votre stack lors de la journée de cadrage.

### Combien de participants maximum ?

5 participants par groupe, soit 10 maximum pour 2 groupes. Cette limite est essentielle car chaque participant travaille sur sa propre instance Claude Code : un accompagnement individuel est indispensable pour valider les prompts, corriger les approches et s'assurer que chaque stagiaire progresse à son rythme. Au-delà de 5, la qualité de l'encadrement personnalisé diminue significativement.

### Faut-il des comptes Anthropic individuels ?

Oui, chaque participant doit avoir un compte avec des crédits. Nous pouvons vous aider à estimer le budget crédits.

### Quelle est la différence avec une formation Claude-Craft ?

Cette formation se concentre exclusivement sur Claude Code natif. Claude-Craft est présenté en démo bonus (30min) mais n'est pas un prérequis ni un objectif de la formation. L'objectif est de rendre chaque développeur autonome avec Claude Code, quel que soit le framework ou l'outillage utilisé ensuite.

### Faut-il Docker ?

Non, Docker n'est pas requis pour cette formation. Les exercices sont réalisés directement avec Claude Code sur le poste de chaque participant.

---

## Informations Légales

**Raison sociale :** THE BEAR AND THE SHRIMP SAS
**SIRET :** 900 562 604 00018
**Adresse :** 8 rue Conchette, 63300 Thiers
**Téléphone :** +33.6.10.07.76.94

---

## Prochaines Étapes

1. **Validation du programme** - Ajustements selon vos besoins
2. **Choix de la formule** - Standard, Suivi ou Premium
3. **Planification des dates** - Disponibilités à convenir
4. **Confirmation** - Devis définitif et bon de commande

---

## Contact

**The Bearded Bear**

Pour toute question ou personnalisation :
- Précisez votre localisation
- Niveau de l'équipe (junior/confirmé/senior)
- Stack technique utilisée
- Budget indicatif
- Dates souhaitées
- Intérêt pour le suivi post-formation

---

**Validité de cette proposition :** 30 jours
**Version :** 1.0.0
**Date :** Février 2026
**Claude Code** : 2.1.154
