# Template — Showcase client (P2-17)

## Contexte
Le COMMUNITY_SIGNALS_FRAMEWORK_20260510 identifie P2-17 (3 showcases clients) comme **bloquant critique** du funnel de conversion. Sans preuve de ROI réel, les prospects ne peuvent pas valider l'investissement en audit ou formation.

Ce template permet de collecter une showcase en 30 minutes d'entretien. Il produit un cas d'étude publiable (anonymisé ou non, selon accord client).

---

## Guide d'entretien (30 min)

### Contexte initial (5 min)
1. Quelle était la taille de l'équipe au moment de l'adoption claude-craft ? (nombre de devs)
2. Quel était le stack technique principal ?
3. Quelle était la maturité en tests au départ ? (couverture approximative, CI/CD en place ?)
4. Pourquoi avez-vous cherché un framework pour Claude Code ? Quel problème cherchiez-vous à résoudre ?

### Avant l'adoption (10 min)
5. À quoi ressemblait une PR review typique avant claude-craft ? Combien de temps ? Quels types de commentaires ?
6. Combien de fois un bug revenait en production après avoir été "corrigé" ?
7. Combien de temps un nouveau développeur mettait-il avant de shipper sa première feature en prod ?
8. Utilisiez-vous Claude Code en solo ou en équipe ? Si équipe : les conventions étaient-elles alignées ?

### Adoption claude-craft (5 min)
9. Comment avez-vous installé claude-craft ? (npx, clone, config YAML ?)
10. Quel track avez-vous utilisé en premier ? (Quick Flow, Standard, Enterprise)
11. Quelle a été la première commande à produire de la valeur visible ? (`/team:audit`, `/qa:recette`, autre ?)
12. Combien de temps entre l'installation et le premier résultat mesurable ?

### Après l'adoption (10 min)
13. Quel est le changement le plus concret que vous attribuez à claude-craft ?
14. Avez-vous des chiffres ? (couverture tests, temps de PR review, fréquence de bugs en prod, vitesse onboarding)
15. Qu'est-ce que vous faites maintenant que vous ne pouviez pas faire avant ?
16. Qu'est-ce qui ne fonctionne pas encore, ou pourrait être amélioré ?
17. Si un CTO vous demandait "est-ce que ça vaut le coup ?", que lui diriez-vous en une phrase ?

---

## Format de publication (cas d'étude)

```markdown
# [Nom ou secteur d'activité] — Adoption claude-craft

## En une phrase
[Réponse à la question 17 — citation directe ou paraphrase]

## Contexte
- **Équipe :** [taille] développeurs, stack [principale techno]
- **Problème initial :** [réponse condensée aux questions 4-8]

## Ce qui a changé
| Avant | Après |
|-------|-------|
| [métrique avant] | [métrique après] |
| [métrique avant] | [métrique après] |

## Première valeur obtenue
[Réponse à la question 11-12 : quelle commande, en combien de temps]

## Citation
> "[Citation directe du client, validée par lui]"
> — [Titre / rôle], [Entreprise ou secteur anonymisé]

## Prochaine étape
[Ce qu'ils prévoient d'explorer ensuite dans claude-craft]
```

---

## Critères de sélection des 3 showcases cibles (P2-17)

Pour maximiser l'impact conversion, choisir des cas qui couvrent 3 personas différents :

| Showcase | Persona cible | Signal de conversion |
|----------|--------------|---------------------|
| **#1 — Startup (5-10 devs)** | CTO technique, stack JS/TS | Montre que claude-craft fonctionne sans infrastructure lourde |
| **#2 — Scale-up (15-30 devs)** | Tech Lead, stack mixte | Montre la valeur sur la coordination d'équipe et les conventions |
| **#3 — Équipe enterprise ou regulated** | Engineering Manager, compliance | Montre la valeur sur la rigueur, SBOM, quality gates documentés |

---

## Processus de publication

1. **Entretien** (30 min, Calendly ou visio) — utiliser les questions ci-dessus
2. **Draft showcase** (15 min) — remplir le template avec les réponses
3. **Validation client** (email, 48h de délai) — accord sur le niveau d'anonymisation
4. **Publication** — GitHub `docs/showcases/`, README section "Teams using Claude Craft", blog

---

*Template produit par agent CMO (e8318117) — 2026-05-24*  
*À utiliser par le board pour collecter les 3 showcases P2-17*
