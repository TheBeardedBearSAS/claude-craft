# Workflow d'Analyse Obligatoire

## Principe Fondamental

**AVANT toute modification de code (feature, bugfix, refactoring), une phase d'analyse approfondie est OBLIGATOIRE.**

Cette règle est CRITIQUE et NON NÉGOCIABLE. Elle évite :
- Les régressions
- Les effets de bord inattendus
- La dette technique
- Les bugs en production

---

## Processus en 4 Étapes

### Étape 1 : Comprendre la Demande

**Questions à se poser :**
1. Quel est l'objectif précis ?
2. Quels sont les critères d'acceptation ?
3. Y a-t-il des contraintes (performance, sécurité, conformité) ?
4. Quel est l'impact utilisateur ?

**Actions :**
- Reformuler la demande pour validation
- Identifier les use cases concernés
- Vérifier l'alignement avec les objectifs business

### Étape 2 : Analyser le Code Existant

**Fichiers à lire OBLIGATOIREMENT :**
1. Les fichiers directement concernés par la modification
2. Les fichiers dépendants (qui utilisent le code modifié)
3. Les tests existants (pour comprendre le comportement attendu)
4. Les migrations de schéma (si impact sur la base de données)

**Points de vigilance :**
- Y a-t-il des tests qui vont casser ?
- Y a-t-il d'autres modules qui dépendent de ce code ?
- Le code respecte-t-il l'architecture du projet ?
- Y a-t-il des données sensibles ?

### Étape 3 : Documenter l'Analyse

**Contenu obligatoire :**

1. **Objectif** : Description claire de la modification
2. **Fichiers impactés** : Liste exhaustive avec justification
3. **Impacts** :
   - Breaking changes : oui/non
   - Migration DB nécessaire : oui/non
   - Impact performance : oui/non
   - Données sensibles : oui/non
4. **Risques** : Liste + mitigations
5. **Approche** : Stratégie d'implémentation (TDD, refactoring progressif, etc.)
6. **Tests TDD** : Liste des tests à écrire AVANT implémentation

**Exemple :**

```markdown
## Analyse : Ajout d'une fonctionnalité de notification

### Objectif
Envoyer une notification email lors de la création d'une commande.

### Fichiers impactés
- OrderService (ajout dispatch event)
- NotificationListener (nouveau)
- EmailService (utilisation existante)
- Tests unitaires pour le listener

### Impacts
- Breaking change : NON
- Migration DB : NON
- Performance : Faible (async recommandé)
- Données sensibles : Email utilisateur (déjà géré)

### Risques
1. Surcharge email → Mitigation : queue async
2. Email en spam → Mitigation : configuration DKIM/SPF

### Approche
1. TDD : écrire tests du listener
2. Implémenter le listener
3. Dispatcher l'event depuis OrderService
4. Tester intégration

### Tests TDD
1. test_should_send_email_on_order_created()
2. test_should_not_send_if_user_opted_out()
3. test_should_handle_email_failure_gracefully()
```

### Étape 4 : Validation

**Critères de décision :**

| Impact | Action |
|--------|--------|
| **Faible** (1 fichier, pas de breaking change, < 1h) | Procéder directement |
| **Moyen** (2-5 fichiers, migration DB, < 4h) | Valider avec l'utilisateur |
| **Fort** (> 5 fichiers, breaking changes, refactoring archi) | Planification détaillée + validation obligatoire |

**Questions de validation :**
- L'approche respecte-t-elle l'architecture du projet ?
- Les tests TDD sont-ils suffisants ?
- Y a-t-il une alternative plus simple (KISS) ?
- Les risques sont-ils acceptables ?

---

## Anti-Patterns à Éviter

### ❌ Coder sans lire le code existant

```
// MAUVAIS : modification sans comprendre l'impact
function updateOrder(order) {
  order.status = "confirmed"  // ⚠️ Impact sur d'autres modules ?
}
```

### ❌ Ignorer les dépendances

```
// MAUVAIS : modification sans vérifier qui utilise cette méthode
function getPrice() {
  return this.price * 0.8  // ⚠️ Qui appelle getPrice() ?
}
```

### ❌ Oublier les tests

```
// MAUVAIS : pas de vérification des tests existants
// Si je modifie User, quels tests vont casser ?
```

### ❌ Ignorer la sécurité

```
// MAUVAIS : ajouter un champ sensible sans protection
class User {
  socialSecurityNumber: string  // ⚠️ Données sensibles !
}
```

---

## Checklist Rapide

Avant toute modification :

- [ ] J'ai lu et compris la demande
- [ ] J'ai lu les fichiers concernés
- [ ] J'ai identifié les dépendances
- [ ] J'ai documenté l'analyse
- [ ] J'ai évalué les risques
- [ ] J'ai défini les tests TDD
- [ ] J'ai validé l'approche (si impact moyen/fort)
- [ ] J'ai vérifié la conformité architecture + SOLID
- [ ] J'ai vérifié sécurité si données sensibles

---

## Workflow Visuel

```
┌─────────────────────────────────────────────────────────────┐
│                    DEMANDE REÇUE                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             ÉTAPE 1 : COMPRENDRE                            │
│  - Objectif précis ?                                        │
│  - Critères d'acceptation ?                                 │
│  - Contraintes ?                                            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             ÉTAPE 2 : ANALYSER                              │
│  - Lire les fichiers concernés                              │
│  - Identifier les dépendances                               │
│  - Vérifier les tests existants                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             ÉTAPE 3 : DOCUMENTER                            │
│  - Fichiers impactés                                        │
│  - Risques + mitigations                                    │
│  - Tests TDD à écrire                                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│             ÉTAPE 4 : VALIDER                               │
│  - Impact faible → Procéder                                 │
│  - Impact moyen/fort → Demander validation                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    IMPLÉMENTER                              │
│  1. Écrire les tests (RED)                                  │
│  2. Implémenter le code (GREEN)                             │
│  3. Refactorer (REFACTOR)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Templates Associés

- `templates/analysis.md` - Template analyse détaillée
- `checklists/new-feature.md` - Checklist nouvelle feature
- `checklists/refactoring.md` - Checklist refactoring

---

**Date de dernière mise à jour:** 2025-01
**Version:** 1.0.0
**Auteur:** The Bearded CTO
