---
name: debug-methodical
description: Debugging méthodique en 4 phases (reproduce → isolate → fix → verify). Use when investigating a bug, regression, flaky test, or unexpected behavior.
context: fork
disable-model-invocation: true
triggers:
  keywords: ["bug", "debug", "crash", "error", "regression", "flaky", "broken", "failing test", "not working"]
auto_suggest: true
---

# Debug-Methodical — Debugging en 4 phases

Skill inspiré de [obra/superpowers](https://github.com/obra/superpowers). **Objectif :** forcer une méthode rigoureuse au lieu de "try random fixes until it works".

**Règle d'or :** un bug sans reproduction stable est un bug mal compris. Ne JAMAIS fixer avant de reproduire.

## Les 4 phases (strictes, dans l'ordre)

### Phase 1 : REPRODUCE

**Objectif :** exécuter le bug à volonté, dans un environnement contrôlé.

**Checklist :**
- [ ] Étapes de reproduction documentées (Given/When/Then)
- [ ] Reproduction déterministe (>= 3 runs consécutifs identiques)
- [ ] Environnement isolé (local, container, test env)
- [ ] Inputs minimaux (le moins de données/steps possible)
- [ ] Version/commit exacts identifiés

**Sortie :** test automatisé qui **échoue** en exposant le bug (test de régression).

**Signal rouge :** "ça marche sur ma machine" / "parfois ça fail" → reproduction insuffisante, retour Phase 1.

### Phase 2 : ISOLATE

**Objectif :** identifier la **cause racine**, pas juste un symptôme.

**Techniques :**
- **Bisect** : `git bisect` pour trouver le commit fautif
- **Binary search** dans le code : commenter la moitié, puis itérer
- **Print-driven debugging** : logs aux frontières (entrée/sortie fonctions)
- **Debugger** : breakpoints, step-through, variable watch
- **Diff environnements** : que diffère-t-il entre "qui marche" et "qui casse" ?
- **Question the premise** : l'hypothèse initiale est-elle correcte ?

**Checklist :**
- [ ] Cause identifiée (ligne / condition / input exact)
- [ ] Explication du **pourquoi** (pas juste le **quoi**)
- [ ] Chaîne de causalité documentée (A cause B cause C)
- [ ] Autres manifestations potentielles du même bug identifiées

**Signal rouge :** "je pense que c'est X" sans preuve → retour isolate avec instrumentation.

### Phase 3 : FIX

**Objectif :** corriger la cause racine avec le minimum de changement.

**Checklist :**
- [ ] Fix au bon niveau (cause racine, pas symptôme)
- [ ] Changement minimal (KISS, voir rule 05)
- [ ] Pas d'effet de bord sur autres features
- [ ] Pas de fix "au cas où" / spéculatif (voir rule 23 Karpathy)
- [ ] Fix dans le bon layer (domain / infra / UI)

**Signaux rouges :**
- Fix qui ajoute un `try/catch` pour masquer l'erreur → traite le symptôme, pas la cause
- Fix qui nécessite de modifier les tests existants de façon suspecte
- Fix qui "marche" sans que tu saches pourquoi

### Phase 4 : VERIFY

**Objectif :** prouver que le fix marche ET n'a rien cassé d'autre.

**Checklist :**
- [ ] Test de régression (Phase 1) passe maintenant
- [ ] Suite de tests complète passe
- [ ] Reproduction manuelle ne montre plus le bug
- [ ] Scénarios adjacents testés (edge cases proches)
- [ ] Performance non dégradée
- [ ] Logs / monitoring vérifiés en staging si critique

**Règle de régression :** le test écrit en Phase 1 reste dans la codebase **pour toujours**. Un bug fixé ne doit JAMAIS réapparaître (voir `/qa:regression`).

## Anti-patterns critiques

| Anti-pattern | Pourquoi c'est mal |
|--------------|---------------------|
| **Shotgun debugging** | Changer 10 trucs au hasard, aucun apprentissage |
| **Fix du symptôme** | Bug revient sous une autre forme |
| **Skip reproduction** | Fix impossible à valider |
| **Skip verification** | "ça devrait marcher" — preuve ou pas fini |
| **Pas de test de régression** | Bug réapparaît dans 3 mois |
| **Fix avec `catch (Exception)` générique** | Masque d'autres bugs |
| **Commit mélangé fix + refactor** | `git bisect` impossible |

## Techniques avancées

### Pour bugs de concurrence
- Forcer les interleavings (sleep stratégique, stress test)
- Thread dumps / profiler
- Vérifier les invariants atomiquement

### Pour bugs d'intégration
- Snapshot du payload exact (HAR, logs)
- Reproduire avec `curl` ou client minimal
- Vérifier versions exactes des dépendances

### Pour flaky tests
- Run 100x pour mesurer le taux de flakiness
- Identifier la dépendance (temps, ordre, ressource partagée)
- Ne JAMAIS marquer un test `@Flaky` sans ticket de correction

## Intégration Claude Craft

- **`/qa:tdd`** — bug fix en mode TDD (test qui échoue d'abord)
- **`/qa:fix`** — correction automatisée des bugs QA
- **`/qa:regression`** — registre des tests de régression
- **Skill `atomic-tasks`** — découper le debug en phases atomiques
- **Rule 07 (testing)** — bug fix = test de régression obligatoire

## Ressources

- [obra/superpowers](https://github.com/obra/superpowers)
- Rule `.claude/rules/07-testing.md`
- Command `/qa:tdd`, `/qa:regression`

---

**Date de dernière mise à jour :** 2026-04-15
**Version :** 1.0.0
