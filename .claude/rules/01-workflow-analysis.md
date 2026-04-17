# Workflow d'Analyse — Quick Reference

AVANT toute modification de code (feature, bugfix, refactoring), une phase d'analyse approfondie est **OBLIGATOIRE**.

## Processus en 4 étapes

| Étape | Actions clés |
|-------|--------------|
| **1. Comprendre** | Objectif précis, critères d'acceptation, contraintes, impact utilisateur |
| **2. Analyser** | Lire fichiers concernés + dépendants + tests + migrations |
| **3. Documenter** | Fichiers impactés, breaking changes, migration DB, risques + mitigations, tests TDD |
| **4. Valider** | Impact faible (< 1h, 1 fichier) → procéder ; Impact moyen/fort → validation utilisateur |

**Pattern GSD :** Tâches atomiques (1-3 phrases, < 30 min, testable, committable seule). Si contexte > 50%, découper + `/clear` entre tâches.

**Checklist rapide :** Lire fichiers, identifier dépendances, documenter analyse, évaluer risques, définir tests TDD, valider approche, vérifier SOLID/sécurité.

> Détails complets, workflow visuel et templates : `@.claude/skills/workflow-analysis/REFERENCE.md`
