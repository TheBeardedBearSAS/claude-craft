# KISS, DRY, YAGNI — Quick Reference

Ces principes sont **obligatoires** pour maintenir un code simple et maintenable.

## KISS — Keep It Simple

| Metrique | Cible | Limite |
|----------|-------|--------|
| **Cognitive Complexity** (metrique primaire) | < 7 | < 10 |
| Lignes par methode | < 10 | < 20 |
| Complexite cyclomatique | < 5 | < 10 |
| Profondeur d'indentation | 2 | 3 max |
| Parametres par methode | 3 | 4 max |

> **Seuils < 7 / < 10 = choix interne du projet**, volontairement plus strict que le défaut de la règle Sonar S3776 (15 par fonction) : à relâcher si le contexte de l'équipe l'exige.
>
> **Cognitive Complexity** (SonarQube) est la metrique primaire retenue ici : elle mesure la difficulte humaine de comprehension et prevaut sur la stricte limite de 20 lignes. Source : [Sonar, Cognitive Complexity (livre blanc)](https://www.sonarsource.com/docs/CognitiveComplexity.pdf).

**Regles :** Early returns (guard clauses), pas de else imbrique, nommage explicite, composition > heritage.

## DRY — Don't Repeat Yourself

- Chaque regle metier en **un seul endroit** (Value Objects pour validation)
- **Regle des 3 :** Ne pas abstraire avant 3 occurrences
- Duplication acceptable : tests (clarte), config par env, types differents

## YAGNI — You Aren't Gonna Need It

Avant d'ajouter : est-ce requis MAINTENANT ? Est-ce dans le ticket ? Le client l'a demande ?
Si NON → **ne pas implementer**.

**Anti-patterns :** Optimisation prematuree, Gold Plating, Speculative Generality, Lasagna Code.

## Extension AI-Era : Principes Karpathy

Pour le code généré/assisté par LLM, appliquer en plus les **3 principes Karpathy** (voir `@.claude/rules/23-karpathy-principles.md`) :
1. **State assumptions explicitly** — documenter toutes les hypothèses avant de coder
2. **Minimal code, no speculation** — 100 lignes au lieu de 1000, zéro "au cas où"
3. **Surface confusion** — poser la question plutôt que générer du code plausible mais faux

> Details complets et exemples : `@.claude/references/base/kiss-dry-yagni.md`
