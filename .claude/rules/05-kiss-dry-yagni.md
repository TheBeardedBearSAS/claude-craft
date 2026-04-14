# KISS, DRY, YAGNI — Quick Reference

Ces principes sont **obligatoires** pour maintenir un code simple et maintenable.

## KISS — Keep It Simple

| Metrique | Cible | Limite |
|----------|-------|--------|
| **Cognitive Complexity** (primaire 2026) | < 7 | < 10 |
| Lignes par methode | < 10 | < 20 |
| Complexite cyclomatique | < 5 | < 10 |
| Profondeur d'indentation | 2 | 3 max |
| Parametres par methode | 3 | 4 max |

> **Cognitive Complexity** (SonarQube, ReSharper) est la metrique dominante 2026 : elle mesure la difficulte humaine de comprehension. Elle prevaut sur la stricte limite de 20 lignes. Source : [Cognitive vs Cyclomatic](https://gilles-fabre.medium.com/what-is-the-difference-between-cyclomatic-complexity-and-cognitive-complexity-a87cef0e2851).

**Regles :** Early returns (guard clauses), pas de else imbrique, nommage explicite, composition > heritage.

## DRY — Don't Repeat Yourself

- Chaque regle metier en **un seul endroit** (Value Objects pour validation)
- **Regle des 3 :** Ne pas abstraire avant 3 occurrences
- Duplication acceptable : tests (clarte), config par env, types differents

## YAGNI — You Aren't Gonna Need It

Avant d'ajouter : est-ce requis MAINTENANT ? Est-ce dans le ticket ? Le client l'a demande ?
Si NON → **ne pas implementer**.

**Anti-patterns :** Optimisation prematuree, Gold Plating, Speculative Generality, Lasagna Code.

> Details complets et exemples : `@.claude/references/base/kiss-dry-yagni.md`
