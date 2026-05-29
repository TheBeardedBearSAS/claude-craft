# Formation Claude Code 2.1.154 + Claude-Craft 8.7.1

## Vue d'ensemble

Package de formation pour accompagner des equipes de developpement dans l'adoption de Claude Code 2.1.154 avec le framework Claude-Craft 8.7.1.

**Versions couvertes :**
- Claude Code : 2.1.154 (Extended Thinking, MCP, sub-agents, permissions, Opus 4.6, Agent Teams, Fast Mode, Auto Mode, Tool Search, 24 hooks)
- Claude-Craft : 8.7.1 (BMAD v6, Ralph, QA Recette, 70 agents (31 spécialisés + 39 infra), 125 commandes / 15 namespaces, RTK, 5 languages)

## Contenu du Package

```
claude-craft/
├── README.md                    # Ce fichier
├── PLAN-FORMATION.md            # Plan de formation complet
├── PROPOSITION-COMMERCIALE.md   # Proposition pour les clients
├── GUIDE-FORMATEUR.md           # Instructions pour le formateur
├── CAHIER-PARTICIPANT.md        # Workbook participant
├── REVIEW-REPORT.md             # Rapport de review
├── modules/
│   ├── jour1/
│   │   ├── 01-introduction-claude-code.md
│   │   ├── 02-framework-claude-craft.md
│   │   ├── 03-workflow-developpement.md
│   │   └── 04-nouveau-projet-symfony.md
│   └── jour2/
│       ├── 05-projet-existant.md
│       ├── 06-qualite-securite.md
│       ├── 07-agents-specialises.md
│       ├── 08-outils-avances.md
│       └── 09-atelier-pratique.md
├── exercices/
├── supports/
├── metadata/
├── ressources/
└── pdf/
```

## Public Cible

- **Equipes de developpement** (4-12 personnes)
- **Stacks supportees** : 11 technologies (Symfony, React, Flutter, etc.)
- **Niveau requis** : Familiarite avec le developpement logiciel et Git

## Duree

| Format | Duree | Recommande pour |
|--------|-------|-----------------|
| Standard | 2 jours (14h) | Equipes debutantes avec l'IA |
| Intensif | 1,5 jour (10h) | Equipes familiarisees avec Claude |
| Premium | 2 jours + suivi | Adoption a long terme |

## Comment Utiliser ce Package

1. **Lisez le plan de formation** (`PLAN-FORMATION.md`)
2. **Consultez le guide formateur** (`GUIDE-FORMATEUR.md`)
3. **Personnalisez selon le client** : stack, niveau, duree
4. **Preparez les supports** : slides, exercices, projet demo
5. **Adaptez les exercices** au contexte du client

## Generation des PDFs

```bash
# Depuis la racine training/
../generate-pdf.sh claude-craft
```

---

**Version** : 4.0.0
**Date** : Avril 2026
**Claude Code** : 2.1.154
**Claude-Craft** : 8.7.1
