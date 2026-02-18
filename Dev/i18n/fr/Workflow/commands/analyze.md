---
name: workflow-analyze
description: "Exécuter la phase d'Analyse - recherche, exploration et identification des contraintes"
arguments:
  - name: focus
    description: Domaine spécifique à analyser (marché, technique, concurrents)
    required: false
---

# /workflow:analyze

## Mission

Exécuter la phase d'Analyse du workflow Enterprise. Cette phase se concentre sur la recherche, l'exploration et l'identification des contraintes avant que la planification détaillée ne commence.

## Quand utiliser

- Projets sur le track **Enterprise**
- Nouvelles plateformes ou initiatives majeures
- Quand la connaissance du domaine est limitée
- Avant de s'engager sur une approche technique

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## Workflow

### Étape 1 : Mise en place de l'analyse

```
╔══════════════════════════════════════════════════════════╗
║            PHASE D'ANALYSE - DÉMARRAGE                     ║
╠══════════════════════════════════════════════════════════╣
║ Track: Enterprise                                         ║
║ Phase: 1 sur 4 - Analyse                                  ║
║                                                           ║
║ Objectifs :                                               ║
║ • Comprendre le domaine du problème                       ║
║ • Rechercher les solutions existantes                     ║
║ • Identifier les contraintes techniques                   ║
║ • Documenter les risques et opportunités                  ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 2 : Domaines de recherche

**Questions de recherche guidées :**

```
┌─────────────────────────────────────────────────────────┐
│ RECHERCHE DOMAINE                                        │
├─────────────────────────────────────────────────────────┤
│ 1. Quel problème résolvons-nous ?                        │
│ 2. Qui sont les parties prenantes clés ?                 │
│ 3. Quels sont les moteurs business ?                     │
│ 4. À quoi ressemble le succès ?                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RECHERCHE MARCHÉ                                         │
├─────────────────────────────────────────────────────────┤
│ 1. Quelles solutions existantes existent ?               │
│ 2. Que font les concurrents ?                            │
│ 3. Quelles sont les bonnes pratiques du secteur ?        │
│ 4. Quelles sont les tendances émergentes ?               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ RECHERCHE TECHNIQUE                                      │
├─────────────────────────────────────────────────────────┤
│ 1. Quelles technologies pourrions-nous utiliser ?        │
│ 2. Quels sont les besoins d'intégration ?                │
│ 3. Quels sont les besoins de scalabilité ?               │
│ 4. Quelles exigences sécurité/conformité existent ?      │
└─────────────────────────────────────────────────────────┘
```

### Étape 3 : Recherche Context7 (Optionnel)

Si le MCP Context7 est configuré, l'utiliser pour la recherche technique :

```
Utilisation du MCP Context7 pour une documentation à jour...

Recherche en cours :
• Dernières bonnes pratiques de l'API Stripe
• Standards de sécurité actuels pour le traitement des paiements
• Exigences de conformité PCI DSS
```

### Étape 4 : Identification des contraintes

Documenter les contraintes découvertes :

```
╔══════════════════════════════════════════════════════════╗
║               CONTRAINTES IDENTIFIÉES                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ CONTRAINTES TECHNIQUES :                                  ║
║ • Doit s'intégrer avec le backend Symfony 7.x existant    ║
║ • Base de données : PostgreSQL (existante, non modifiable)║
║ • Doit supporter les apps mobiles via l'API existante     ║
║                                                           ║
║ CONTRAINTES BUSINESS :                                    ║
║ • Budget : Limité à l'équipe existante                    ║
║ • Délai : MVP nécessaire au T2 2026                       ║
║ • Doit maintenir la rétrocompatibilité                    ║
║                                                           ║
║ CONTRAINTES RÉGLEMENTAIRES :                              ║
║ • Conformité RGPD requise (utilisateurs EU)               ║
║ • PCI DSS pour le traitement des paiements                ║
║                                                           ║
║ CONTRAINTES DE RESSOURCES :                               ║
║ • Équipe : 2 backend, 1 développeur frontend              ║
║ • Pas de ressource DevOps dédiée                          ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 5 : Analyse des risques et opportunités

```
╔══════════════════════════════════════════════════════════╗
║            RISQUES ET OPPORTUNITÉS                        ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ RISQUES :                                                 ║
║ ┌─────────┬──────────┬────────────┬───────────────────┐  ║
║ │ Risque  │ Impact   │ Probabilité│ Atténuation       │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Stripe  │ Élevé    │ Faible     │ Fournisseur       │  ║
║ │ indispo.│          │            │ de secours        │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Retard  │ Moyen    │ Moyen      │ Réduction du      │  ║
║ │ délai   │          │            │ périmètre MVP     │  ║
║ └─────────┴──────────┴────────────┴───────────────────┘  ║
║                                                           ║
║ OPPORTUNITÉS :                                            ║
║ • Peut tirer parti des nouveaux Payment Elements Stripe   ║
║ • Potentiel d'expansion du modèle d'abonnement           ║
║ • Paiement mobile (Apple Pay, Google Pay) prêt            ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Étape 6 : Générer les artefacts d'analyse

Créer les documents d'analyse :

```
project-management/
└── analysis/
    ├── research-summary.md      # Résultats clés
    ├── constraints.md           # Toutes les contraintes identifiées
    ├── risks-opportunities.md   # Registre des risques et opportunités
    └── technical-options.md     # Évaluation des technologies
```

### Étape 7 : Fin de phase

```
╔══════════════════════════════════════════════════════════╗
║            PHASE D'ANALYSE TERMINÉE                      ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artefacts créés :                                        ║
║ ✅ research-summary.md                                    ║
║ ✅ constraints.md                                         ║
║ ✅ risks-opportunities.md                                 ║
║ ✅ technical-options.md                                   ║
║                                                           ║
║ Résultats clés :                                         ║
║ • 4 contraintes techniques identifiées                    ║
║ • 3 contraintes business identifiées                      ║
║ • 5 risques documentés avec atténuations                  ║
║ • 3 opportunités à considérer                             ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ PHASE SUIVANTE : Planification                           ║
║ Commande : /workflow:plan                                ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ L'analyse alimentera la création du PRD et l'architecture.║
╚══════════════════════════════════════════════════════════╝
```

## Agents impliqués

- **research-assistant** : Recherche technique et consultation de documentation
- **product-owner** : Contexte business et analyse des parties prenantes

## Fichiers de sortie

| Fichier | Objectif |
|---------|----------|
| `analysis/research-summary.md` | Résultats de recherche consolidés |
| `analysis/constraints.md` | Contraintes techniques, business, réglementaires |
| `analysis/risks-opportunities.md` | Registre des risques avec atténuations |
| `analysis/technical-options.md` | Évaluation et recommandations technologiques |

## Commandes associées

- `/workflow:init` - Initialiser le workflow (doit être exécuté en premier)
- `/workflow:plan` - Phase suivante : Planification
- `/workflow:status` - Vérifier la progression
- `/common:research-context7` - Recherche approfondie avec le MCP Context7
