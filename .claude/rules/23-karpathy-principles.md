# Principes Karpathy — AI-First Development

Principes inspirés des observations d'Andrej Karpathy sur le développement piloté par LLM. **Obligatoires** pour tout code généré ou assisté par IA.

> **Source :** [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) — observations "LLM coding pitfalls" de Karpathy (ex-OpenAI, Tesla AI).

## Les 3 principes fondamentaux

### 1. State assumptions explicitly

Rendre explicites **toutes** les hypothèses du code avant de l'écrire : inputs attendus, invariants, pré-conditions, contraintes de performance, environnement cible.

```
❌ MAUVAIS : "Fonction qui parse une date"
✅ BON : "Fonction qui parse une date ISO 8601 UTC, retourne null si invalide,
         O(1), pas de dépendance externe, appelée < 1000 fois/sec"
```

**Application :** documenter les hypothèses en entête de feature ou dans la description de tâche, **avant** de coder.

### 2. Minimal code — no speculation

Écrire le **minimum de code** qui résout exactement le problème posé. Zéro spéculation sur les besoins futurs. Zéro "au cas où".

| Anti-pattern | Solution |
|--------------|----------|
| 1000 lignes pour un CRUD | 100 lignes suffisent |
| Abstraction préventive (interface pour 1 impl) | Concret d'abord, abstrait après 3 occurrences |
| Config exhaustive "configurable" | Valeurs en dur, extraire quand besoin réel |
| Error handling exhaustif `try/catch` partout | Fail fast, traiter les erreurs aux frontières |
| Options/flags "pour plus tard" | Supprimer jusqu'à preuve du besoin |

**Règle :** si un test passe sans cette ligne, **supprime-la**.

### 3. Surface confusion

Quand le modèle (ou le développeur) ne comprend pas, **il doit le dire explicitement** plutôt que de deviner ou générer du code plausible mais faux.

```
❌ MAUVAIS : Claude génère du code qui "ressemble" à une solution
✅ BON : Claude dit "Je ne comprends pas X, peux-tu clarifier Y ?"
```

**Signaux de confusion à remonter :**
- Ambiguïté sur le périmètre
- Hypothèses métier non vérifiables dans le code
- Dépendances inconnues
- Contraintes contradictoires
- Edge cases non spécifiés

**Règle d'or :** une question coûte 10s, un mauvais code coûte 10h.

## Workflow Karpathy — 80% agent-driven coding

Karpathy rapporte être passé de 80% de code manuel à **80% de code généré par agent** avec supervision humaine.

### Répartition cible

| Tâche | Part humain | Part agent |
|-------|-------------|-----------|
| Décider QUOI coder | 100% | 0% |
| Clarifier hypothèses | 70% | 30% |
| Écrire le code | 20% | 80% |
| Review + validation | 100% | 0% |
| Debug initial | 30% | 70% |

### Pratiques clés

- **Petits diffs** : agent produit des diffs < 50 lignes, reviewés unitairement
- **Tests first** : spécifier le comportement par un test avant de laisser l'agent coder
- **Verification loops** : toujours fournir un moyen de vérifier (test, screenshot, commande)
- **Fresh context** : nouvelle session agent pour chaque feature indépendante
- **Human-in-the-loop** : jamais d'auto-merge sans review humaine sur code critique

## Anti-bloat checklist

Avant de commit, vérifier :

- [ ] Chaque ligne ajoutée est **nécessaire** au besoin actuel
- [ ] Pas de classe/interface créée "pour plus tard"
- [ ] Pas de paramètre optionnel sans caller qui l'utilise
- [ ] Pas de `TODO`/`FIXME` sans ticket associé
- [ ] Pas de commentaire qui redécrit ce que fait le code (expliquer le POURQUOI)
- [ ] Pas de fallback pour un cas qui ne peut pas arriver

## Relation avec les autres règles

- **Rule 05 (KISS/DRY/YAGNI)** : Karpathy = YAGNI appliqué à l'ère des LLM
- **Rule 01 (Workflow Analysis)** : le principe #1 (state assumptions) s'exprime dans la phase d'analyse
- **Rule 12 (Context Management)** : "minimal code" = contexte plus propre, fewer tokens

## Ressources

- Andrej Karpathy — [talks sur Software 2.0 et LLM-driven dev](https://karpathy.ai/)
- [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills)

---

**Date de dernière mise à jour :** 2026-04-15
**Version :** 1.0.0
**Auteur :** The Bearded CTO
