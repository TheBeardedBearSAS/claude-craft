# Formations The Bearded Bear

## Catalogue de formations

Ce repertoire contient les packages de formation pour 2 offres distinctes :

| Formation | Cible | Duree | Contenu |
|-----------|-------|-------|---------|
| **[Claude Code](./claude-code/)** | Developpeurs decouvrant Claude Code | 2 jours (14h/groupe) | Claude Code pur, du guide vers l'autonome |
| **[Claude Code + Claude-Craft](./claude-craft/)** | Equipes adoptant Claude-Craft | 2 jours (14h/groupe) | Claude Code + framework Claude-Craft 7.26.0 |

---

## Formation Claude Code

> **Maitriser l'Agent de Developpement**

Formation progressive centree sur Claude Code 2.1.105 : fondamentaux, configuration, patterns de travail, hooks, MCP, multi-agent, qualite. Claude Craft presente en bonus (30 min).

- **Max 5 stagiaires/groupe** (accompagnement individuel)
- **10 modules** couvrant 100% des fonctionnalites Claude Code
- **Programme** : [PLAN-FORMATION.md](./claude-code/PLAN-FORMATION.md)
- **Proposition** : [PROPOSITION-COMMERCIALE.md](./claude-code/PROPOSITION-COMMERCIALE.md)

## Formation Claude Code + Claude-Craft

> **Accelerer le developpement avec le framework Claude-Craft**

Formation complete couvrant Claude Code et le framework Claude-Craft : BMAD v6, 63 agents, 204 commandes, Ralph Wiggum, QA Recette.

- **Max 4 stagiaires/groupe**
- **9 modules** avec focus Symfony/Clean Architecture
- **Programme** : [PLAN-FORMATION.md](./claude-craft/PLAN-FORMATION.md)
- **Proposition** : [PROPOSITION-COMMERCIALE.md](./claude-craft/PROPOSITION-COMMERCIALE.md)

---

## Structure

```
training/
├── README.md                  # Ce fichier (index)
├── generate-pdf.sh            # Generateur PDF (supporte les 2 formations)
├── .gitignore                 # Patterns pour les 2 sous-repertoires
├── assets/                    # Assets partages (logo, backgrounds)
├── .pandoc/                   # Template pandoc partage
│
├── claude-code/               # Formation Claude Code pure
│   ├── README.md
│   ├── PLAN-FORMATION.md
│   ├── PROPOSITION-COMMERCIALE.md
│   ├── email-reponse-emagma.md
│   ├── modules/jour1/         # 4 modules
│   ├── modules/jour2/         # 6 modules
│   ├── exercices/
│   ├── supports/
│   └── metadata/
│
└── claude-craft/              # Formation Claude Code + Claude-Craft
    ├── README.md
    ├── PLAN-FORMATION.md
    ├── PROPOSITION-COMMERCIALE.md
    ├── GUIDE-FORMATEUR.md
    ├── CAHIER-PARTICIPANT.md
    ├── modules/jour1/         # 4 modules
    ├── modules/jour2/         # 5 modules
    ├── exercices/
    ├── supports/
    ├── metadata/
    ├── ressources/
    └── pdf/
```

## Generation des PDFs

```bash
# Generer les PDFs des 2 formations
./generate-pdf.sh

# Generer uniquement une formation
./generate-pdf.sh claude-craft
./generate-pdf.sh claude-code
```

---

**Version** : 5.0.0
**Date** : Avril 2026
**Auteur** : The Bearded CTO
